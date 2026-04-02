from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import threading
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from backend.models.schemas import ApiKeySummary, UserSummary
from backend.services.auth import AuthContext

try:
    import psycopg
    from psycopg.rows import dict_row
except Exception:
    psycopg = None
    dict_row = None


def _utc_now() -> str:
    return datetime.now(UTC).isoformat()


def _b64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _b64url_decode(value: str) -> bytes:
    padding = "=" * ((4 - len(value) % 4) % 4)
    return base64.urlsafe_b64decode(value + padding)


class PostgresAuthService:
    def __init__(self, database_url: str):
        if psycopg is None or dict_row is None:
            raise RuntimeError("psycopg is not installed")
        self.database_url = database_url
        self._lock = threading.Lock()
        self._initialize()

    def _connect(self):
        return psycopg.connect(self.database_url, row_factory=dict_row)

    def _initialize(self) -> None:
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        email TEXT NOT NULL UNIQUE,
                        display_name TEXT NOT NULL,
                        password_hash TEXT NOT NULL,
                        password_salt TEXT NOT NULL,
                        role TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL,
                        disabled_at TEXT
                    )
                    """
                )
                cursor.execute(
                    """
                    CREATE TABLE IF NOT EXISTS api_keys (
                        id TEXT PRIMARY KEY,
                        user_id TEXT NOT NULL REFERENCES users(id),
                        name TEXT NOT NULL,
                        prefix TEXT NOT NULL,
                        key_hash TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        last_used_at TEXT,
                        revoked_at TEXT
                    )
                    """
                )
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys (user_id)")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys (key_hash)")
            connection.commit()

    def has_users(self) -> bool:
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(1) AS count FROM users")
                row = cursor.fetchone()
        return bool(row["count"])

    def create_user(self, email: str, password: str, display_name: str, role: str = "analyst") -> UserSummary:
        normalized_email = email.strip().lower()
        salt = secrets.token_bytes(16)
        password_hash = self._hash_password(password, salt)
        user_id = str(uuid.uuid4())
        now = _utc_now()

        with self._lock, self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO users (id, email, display_name, password_hash, password_salt, role, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        user_id,
                        normalized_email,
                        display_name.strip(),
                        password_hash,
                        salt.hex(),
                        role,
                        now,
                        now,
                    ),
                )
            connection.commit()

        return UserSummary(
            id=user_id,
            email=normalized_email,
            display_name=display_name.strip(),
            role=role,
            created_at=now,
        )

    def authenticate(self, email: str, password: str) -> UserSummary | None:
        normalized_email = email.strip().lower()
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, email, display_name, password_hash, password_salt, role, created_at, disabled_at
                    FROM users
                    WHERE email = %s
                    """,
                    (normalized_email,),
                )
                row = cursor.fetchone()

        if not row or row["disabled_at"]:
            return None

        expected_hash = row["password_hash"]
        provided_hash = self._hash_password(password, bytes.fromhex(row["password_salt"]))
        if not hmac.compare_digest(expected_hash, provided_hash):
            return None

        return UserSummary(
            id=row["id"],
            email=row["email"],
            display_name=row["display_name"],
            role=row["role"],
            created_at=row["created_at"],
        )

    def get_user(self, user_id: str) -> UserSummary | None:
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, email, display_name, role, created_at, disabled_at
                    FROM users
                    WHERE id = %s
                    """,
                    (user_id,),
                )
                row = cursor.fetchone()

        if not row or row["disabled_at"]:
            return None

        return UserSummary(
            id=row["id"],
            email=row["email"],
            display_name=row["display_name"],
            role=row["role"],
            created_at=row["created_at"],
        )

    def issue_access_token(self, user: UserSummary) -> tuple[str, str]:
        ttl_minutes = int(os.getenv("JWT_EXPIRES_MINUTES", "480"))
        expires_at = datetime.now(UTC) + timedelta(minutes=ttl_minutes)
        payload = {
            "sub": user.id,
            "email": user.email,
            "display_name": user.display_name,
            "role": user.role,
            "iat": int(datetime.now(UTC).timestamp()),
            "exp": int(expires_at.timestamp()),
        }
        token = self._encode_jwt(payload)
        return token, expires_at.isoformat()

    def authenticate_bearer_token(self, token: str) -> AuthContext | None:
        payload = self._decode_jwt(token)
        if not payload:
            return None

        user = self.get_user(str(payload["sub"]))
        if not user:
            return None

        return AuthContext(
            user_id=user.id,
            email=user.email,
            display_name=user.display_name,
            role=user.role,
            auth_method="jwt",
        )

    def create_api_key(self, user_id: str, name: str) -> tuple[str, ApiKeySummary]:
        raw_key = f"gon_{secrets.token_urlsafe(32)}"
        key_id = str(uuid.uuid4())
        now = _utc_now()
        prefix = raw_key[:14]
        key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

        with self._lock, self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO api_keys (id, user_id, name, prefix, key_hash, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (key_id, user_id, name.strip(), prefix, key_hash, now),
                )
            connection.commit()

        return raw_key, ApiKeySummary(id=key_id, name=name.strip(), prefix=prefix, created_at=now)

    def list_api_keys(self, user_id: str) -> list[ApiKeySummary]:
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, name, prefix, created_at, last_used_at, revoked_at
                    FROM api_keys
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                    """,
                    (user_id,),
                )
                rows = cursor.fetchall()

        return [
            ApiKeySummary(
                id=row["id"],
                name=row["name"],
                prefix=row["prefix"],
                created_at=row["created_at"],
                last_used_at=row["last_used_at"],
                revoked_at=row["revoked_at"],
            )
            for row in rows
        ]

    def revoke_api_key(self, user_id: str, key_id: str) -> bool:
        with self._lock, self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE api_keys
                    SET revoked_at = %s
                    WHERE id = %s AND user_id = %s AND revoked_at IS NULL
                    """,
                    (_utc_now(), key_id, user_id),
                )
                updated = cursor.rowcount > 0
            connection.commit()
        return updated

    def authenticate_api_key(self, raw_key: str) -> AuthContext | None:
        key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
        with self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT
                        api_keys.id AS api_key_id,
                        api_keys.user_id AS user_id,
                        users.email AS email,
                        users.display_name AS display_name,
                        users.role AS role,
                        users.disabled_at AS disabled_at,
                        api_keys.revoked_at AS revoked_at
                    FROM api_keys
                    JOIN users ON users.id = api_keys.user_id
                    WHERE api_keys.key_hash = %s
                    """,
                    (key_hash,),
                )
                row = cursor.fetchone()

        if not row or row["revoked_at"] or row["disabled_at"]:
            return None

        self._touch_api_key(row["api_key_id"])
        return AuthContext(
            user_id=row["user_id"],
            email=row["email"],
            display_name=row["display_name"],
            role=row["role"],
            auth_method="api_key",
            api_key_id=row["api_key_id"],
        )

    def _touch_api_key(self, key_id: str) -> None:
        with self._lock, self._connect() as connection:
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE api_keys SET last_used_at = %s WHERE id = %s",
                    (_utc_now(), key_id),
                )
            connection.commit()

    def resolve_auth_context(self, authorization_header: str | None, api_key_header: str | None) -> tuple[AuthContext | None, str | None]:
        if authorization_header:
            scheme, _, token = authorization_header.partition(" ")
            if scheme.lower() != "bearer" or not token:
                return None, "auth_header_invalid"
            context = self.authenticate_bearer_token(token)
            if not context:
                return None, "bearer_invalid"
            return context, None

        if api_key_header:
            context = self.authenticate_api_key(api_key_header)
            if not context:
                return None, "api_key_invalid"
            return context, None

        return None, None

    def _hash_password(self, password: str, salt: bytes) -> str:
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 240_000)
        return digest.hex()

    def _encode_jwt(self, payload: dict[str, Any]) -> str:
        header = {"alg": "HS256", "typ": "JWT"}
        encoded_header = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
        encoded_payload = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
        signature = self._sign(f"{encoded_header}.{encoded_payload}".encode("ascii"))
        return f"{encoded_header}.{encoded_payload}.{signature}"

    def _decode_jwt(self, token: str) -> dict[str, Any] | None:
        try:
            encoded_header, encoded_payload, encoded_signature = token.split(".")
        except ValueError:
            return None

        signed_data = f"{encoded_header}.{encoded_payload}".encode("ascii")
        expected_signature = self._sign(signed_data)
        if not hmac.compare_digest(expected_signature, encoded_signature):
            return None

        payload = json.loads(_b64url_decode(encoded_payload).decode("utf-8"))
        expiration = int(payload.get("exp", 0))
        if expiration < int(datetime.now(UTC).timestamp()):
            return None
        return payload

    def _sign(self, value: bytes) -> str:
        secret = os.getenv("JWT_SECRET", "gon-exposing-dev-secret-change-me").encode("utf-8")
        digest = hmac.new(secret, value, hashlib.sha256).digest()
        return _b64url_encode(digest)
