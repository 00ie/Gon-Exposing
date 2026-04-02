from __future__ import annotations

import asyncio
import os
import re
import uuid
from pathlib import Path
from urllib.parse import urlparse

from backend.services.env_loader import load_project_env

load_project_env()

from fastapi import BackgroundTasks, Depends, FastAPI, File, HTTPException, Query, Request, Response, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.models.schemas import (
    AnalysisResult,
    ApiKeyCreateRequest,
    ApiKeyCreateResponse,
    ApiKeySummary,
    AuthBootstrapRequest,
    AuthLoginRequest,
    AuthRegisterRequest,
    AuthTokenResponse,
    HashAnalysisRequest,
    QueueResponse,
    ScanSummary,
    StoredTask,
    UrlAnalysisRequest,
    UserSummary,
)
from backend.services.analysis_pipeline import COMMUNITY, analyze_hash_target, analyze_url_target
from backend.services.auth import AuthContext
from backend.services.auth_factory import build_auth_service
from backend.services.i18n import auth_error_detail, localize_validation_errors, resolve_language, t
from backend.services.queue import enqueue_analysis, is_celery_enabled
from backend.services.rate_limit import SlidingWindowRateLimiter
from backend.services.safety import sanitize_filename, static_analysis_policy
from backend.services.scan_index_factory import build_scan_index
from backend.services.store import AnalysisStore, utc_now


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
RESULTS_DIR = DATA_DIR / "results"
UPLOAD_DIR = DATA_DIR / "uploads"
AUTH_DB_PATH = Path(os.getenv("AUTH_DB_PATH", str(DATA_DIR / "auth.db")))
SCAN_INDEX_DB_PATH = Path(os.getenv("SCAN_INDEX_DB_PATH", str(DATA_DIR / "scans.db")))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

scan_index = build_scan_index(SCAN_INDEX_DB_PATH)
store = AnalysisStore(RESULTS_DIR, scan_index=scan_index)
rate_limiter = SlidingWindowRateLimiter()
auth_service = build_auth_service(AUTH_DB_PATH)

app = FastAPI(title="Gon Exposing API", version="0.1.0")

HASH_PATTERN = re.compile(r"^[A-Fa-f0-9]{16,128}$")

allowed_origins = [origin.strip() for origin in os.getenv("BACKEND_CORS_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def handle_request_validation_error(request: Request, exc: RequestValidationError):
    language = resolve_language(request.headers.get("accept-language"))
    return JSONResponse(
        status_code=422,
        content={"detail": localize_validation_errors(exc.errors(), language)},
    )


@app.middleware("http")
async def enforce_rate_limit(request: Request, call_next):
    request.state.language = resolve_language(request.headers.get("accept-language"))
    context, auth_error = auth_service.resolve_auth_context(
        request.headers.get("authorization"),
        request.headers.get("x-api-key"),
    )
    request.state.auth = context

    if auth_error and request.url.path != "/api/v1/auth/login":
        return JSONResponse({"detail": auth_error_detail(auth_error, request.state.language)}, status_code=401)

    if request.url.path not in {"/api/v1/analyze/file", "/api/v1/analyze/url", "/api/v1/analyze/hash"}:
        return await call_next(request)

    is_authenticated = bool(context)
    rate_key = context.user_id if context else (request.client.host if request.client else "anonymous")
    key = f"{rate_key}:{'auth' if is_authenticated else 'anon'}"
    limit = int(os.getenv("AUTHENTICATED_RATE_LIMIT_PER_HOUR", "50")) if is_authenticated else int(os.getenv("ANONYMOUS_RATE_LIMIT_PER_HOUR", "10"))
    allowed = rate_limiter.allow(key, limit=limit, window_seconds=3600)
    if not allowed:
        return JSONResponse(
            {"detail": t(request.state.language, "Limite de requisicoes excedido.", "Rate limit exceeded.")},
            status_code=429,
        )

    return await call_next(request)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


@app.get("/health")
async def healthcheck():
    return {
        "status": "ok",
        "community": COMMUNITY.model_dump(),
        "analysis_policy": static_analysis_policy(),
        "auth": {
            "public_registration": os.getenv("ALLOW_PUBLIC_REGISTRATION", "false").lower() == "true",
            "has_users": auth_service.has_users(),
        },
    }


def get_optional_auth_context(request: Request) -> AuthContext | None:
    return getattr(request.state, "auth", None)


def require_auth_context(request: Request, context: AuthContext | None = Depends(get_optional_auth_context)) -> AuthContext:
    if not context:
        raise HTTPException(status_code=401, detail=t(getattr(request.state, "language", "en"), "Autenticacao necessaria.", "Authentication required."))
    return context


@app.post("/api/v1/auth/bootstrap", response_model=AuthTokenResponse)
async def bootstrap_admin(payload: AuthBootstrapRequest, request: Request):
    language = getattr(request.state, "language", "en")
    expected_token = os.getenv("BOOTSTRAP_TOKEN")
    if not expected_token:
        raise HTTPException(status_code=503, detail=t(language, "O token de bootstrap nao esta configurado.", "Bootstrap token is not configured."))
    if payload.bootstrap_token != expected_token:
        raise HTTPException(status_code=403, detail=t(language, "Token de bootstrap invalido.", "Invalid bootstrap token."))
    if auth_service.has_users():
        raise HTTPException(status_code=409, detail=t(language, "O bootstrap ja foi concluido.", "Bootstrap already completed."))

    try:
        user = auth_service.create_user(payload.email, payload.password, payload.display_name, role="admin")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=t(language, f"Nao foi possivel criar o usuario inicial: {exc}", f"Unable to create bootstrap user: {exc}")) from exc

    access_token, expires_at = auth_service.issue_access_token(user)
    return AuthTokenResponse(access_token=access_token, expires_at=expires_at, user=user)


@app.post("/api/v1/auth/register", response_model=AuthTokenResponse)
async def register_user(payload: AuthRegisterRequest, request: Request):
    language = getattr(request.state, "language", "en")
    allow_public_registration = os.getenv("ALLOW_PUBLIC_REGISTRATION", "false").lower() == "true"
    if not allow_public_registration:
        raise HTTPException(status_code=403, detail=t(language, "O registro publico esta desabilitado.", "Public registration is disabled."))

    try:
        user = auth_service.create_user(payload.email, payload.password, payload.display_name, role="analyst")
    except Exception as exc:
        raise HTTPException(status_code=400, detail=t(language, f"Nao foi possivel criar o usuario: {exc}", f"Unable to create user: {exc}")) from exc

    access_token, expires_at = auth_service.issue_access_token(user)
    return AuthTokenResponse(access_token=access_token, expires_at=expires_at, user=user)


@app.post("/api/v1/auth/login", response_model=AuthTokenResponse)
async def login_user(payload: AuthLoginRequest, request: Request):
    language = getattr(request.state, "language", "en")
    user = auth_service.authenticate(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail=t(language, "Credenciais invalidas.", "Invalid credentials."))

    access_token, expires_at = auth_service.issue_access_token(user)
    return AuthTokenResponse(access_token=access_token, expires_at=expires_at, user=user)


@app.get("/api/v1/auth/me", response_model=UserSummary)
async def get_current_user(request: Request, context: AuthContext = Depends(require_auth_context)):
    user = auth_service.get_user(context.user_id)
    if not user:
        raise HTTPException(status_code=404, detail=t(getattr(request.state, "language", "en"), "Usuario nao encontrado.", "User not found."))
    return user


@app.get("/api/v1/auth/api-keys", response_model=list[ApiKeySummary])
async def list_api_keys(context: AuthContext = Depends(require_auth_context)):
    return auth_service.list_api_keys(context.user_id)


@app.post("/api/v1/auth/api-keys", response_model=ApiKeyCreateResponse)
async def create_api_key(payload: ApiKeyCreateRequest, context: AuthContext = Depends(require_auth_context)):
    raw_key, key = auth_service.create_api_key(context.user_id, payload.name)
    return ApiKeyCreateResponse(api_key=raw_key, key=key)


@app.delete("/api/v1/auth/api-keys/{key_id}", status_code=204)
async def revoke_api_key(key_id: str, request: Request, context: AuthContext = Depends(require_auth_context)):
    revoked = auth_service.revoke_api_key(context.user_id, key_id)
    if not revoked:
        raise HTTPException(status_code=404, detail=t(getattr(request.state, "language", "en"), "API key nao encontrada.", "API key not found."))
    return Response(status_code=204)


@app.post("/api/v1/analyze/file", response_model=QueueResponse)
async def queue_file_analysis(
    request: Request,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    language = getattr(request.state, "language", "en")
    content = await file.read()
    max_upload_mb = int(os.getenv("MAX_UPLOAD_SIZE_MB", "25"))
    if len(content) > max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=t(language, f"O arquivo excede o limite de {max_upload_mb} MB.", f"File exceeds the {max_upload_mb} MB limit."))

    original_name = Path(file.filename or "sample.bin").name
    safe_filename = sanitize_filename(original_name)
    task_id = str(uuid.uuid4())
    store_source_path = ""
    if is_celery_enabled():
        task_file = UPLOAD_DIR / f"{task_id}_{safe_filename}"
        task_file.write_bytes(content)
        store_source_path = str(task_file)

    task = StoredTask(
        task_id=task_id,
        status="queued",
        created_at=utc_now(),
        updated_at=utc_now(),
        source_name=original_name,
        source_path=store_source_path,
        client_ip=request.client.host if request.client else None,
        owner_user_id=request.state.auth.user_id if getattr(request.state, "auth", None) else None,
        owner_email=request.state.auth.email if getattr(request.state, "auth", None) else None,
        auth_method=request.state.auth.auth_method if getattr(request.state, "auth", None) else "anonymous",
        language=language,
    )
    await store.create(task)
    enqueue_analysis(
        background_tasks,
        task_id=task_id,
        filename=original_name,
        content=content,
        source_path=store_source_path,
        store=store,
    )

    websocket_url = f"/ws/analysis/{task_id}"
    return QueueResponse(
        task_id=task_id,
        status="queued",
        estimated_time_seconds=25,
        websocket_url=websocket_url,
    )


@app.post("/api/v1/analyze/url", response_model=QueueResponse)
async def queue_url_analysis(
    payload: UrlAnalysisRequest,
    request: Request,
    background_tasks: BackgroundTasks,
):
    language = getattr(request.state, "language", "en")
    url = payload.url.strip()
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(status_code=400, detail=t(language, "URL invalida. Use um endereco http ou https valido.", "Invalid URL. Use a valid http or https address."))

    task_id = str(uuid.uuid4())
    task = StoredTask(
        task_id=task_id,
        status="queued",
        created_at=utc_now(),
        updated_at=utc_now(),
        source_name=url,
        source_path="",
        client_ip=request.client.host if request.client else None,
        owner_user_id=request.state.auth.user_id if getattr(request.state, "auth", None) else None,
        owner_email=request.state.auth.email if getattr(request.state, "auth", None) else None,
        auth_method=request.state.auth.auth_method if getattr(request.state, "auth", None) else "anonymous",
        language=language,
    )
    await store.create(task)
    background_tasks.add_task(analyze_url_target, task_id, url, store)

    return QueueResponse(
        task_id=task_id,
        status="queued",
        estimated_time_seconds=8,
        websocket_url=f"/ws/analysis/{task_id}",
    )


@app.post("/api/v1/analyze/hash", response_model=QueueResponse)
async def queue_hash_analysis(
    payload: HashAnalysisRequest,
    request: Request,
    background_tasks: BackgroundTasks,
):
    language = getattr(request.state, "language", "en")
    hash_value = payload.hash.strip().lower()
    if not HASH_PATTERN.fullmatch(hash_value):
        raise HTTPException(status_code=400, detail=t(language, "Hash invalido. Informe um MD5, SHA1, SHA256 ou SHA512 em hexadecimal.", "Invalid hash. Provide an MD5, SHA1, SHA256, or SHA512 in hexadecimal."))

    owner_user_id = request.state.auth.user_id if getattr(request.state, "auth", None) else None
    existing_task_id = await store.find_task_id_by_hash(hash_value, owner_user_id=owner_user_id)
    if existing_task_id:
        existing_task = await store.get(existing_task_id)
        return QueueResponse(
            task_id=existing_task_id,
            status=existing_task.status if existing_task else "complete",
            estimated_time_seconds=0,
            websocket_url=f"/ws/analysis/{existing_task_id}",
        )

    task_id = str(uuid.uuid4())
    task = StoredTask(
        task_id=task_id,
        status="queued",
        created_at=utc_now(),
        updated_at=utc_now(),
        source_name=t(language, f"Consulta por hash {hash_value}", f"Hash lookup {hash_value}"),
        source_path="",
        client_ip=request.client.host if request.client else None,
        owner_user_id=owner_user_id,
        owner_email=request.state.auth.email if getattr(request.state, "auth", None) else None,
        auth_method=request.state.auth.auth_method if getattr(request.state, "auth", None) else "anonymous",
        language=language,
    )
    await store.create(task)
    background_tasks.add_task(analyze_hash_target, task_id, hash_value, store)

    return QueueResponse(
        task_id=task_id,
        status="queued",
        estimated_time_seconds=6,
        websocket_url=f"/ws/analysis/{task_id}",
    )


@app.get("/api/v1/results/{task_id}", response_model=AnalysisResult)
async def get_result(task_id: str, request: Request):
    task = await store.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail=t(getattr(request.state, "language", "en"), "Tarefa nao encontrada.", "Task not found."))

    if task.result:
        return task.result

    return AnalysisResult(
        task_id=task_id,
        status=task.status,
        community=COMMUNITY,
        steps=task.steps,
        error=task.error,
    )


@app.get("/api/v1/scans/recent", response_model=list[ScanSummary])
async def list_recent_scans(
    request: Request,
    limit: int = Query(default=10, ge=1, le=50),
    own_only: bool = Query(default=False),
    context: AuthContext | None = Depends(get_optional_auth_context),
):
    owner_user_id = context.user_id if own_only and context else None
    if own_only and not context:
        raise HTTPException(status_code=401, detail=t(getattr(request.state, "language", "en"), "Autenticacao necessaria para own_only=true.", "Authentication required for own_only=true."))
    return await store.list_recent(limit=limit, owner_user_id=owner_user_id)


@app.get("/api/v1/search", response_model=list[ScanSummary])
async def search_scans(
    request: Request,
    q: str = Query(min_length=1),
    limit: int = Query(default=20, ge=1, le=50),
    own_only: bool = Query(default=False),
    context: AuthContext | None = Depends(get_optional_auth_context),
):
    owner_user_id = context.user_id if own_only and context else None
    if own_only and not context:
        raise HTTPException(status_code=401, detail=t(getattr(request.state, "language", "en"), "Autenticacao necessaria para own_only=true.", "Authentication required for own_only=true."))
    return await store.search(q, limit=limit, owner_user_id=owner_user_id)


@app.get("/api/v1/feed", response_model=list[ScanSummary])
async def list_public_feed(
    q: str | None = Query(default=None),
    limit: int = Query(default=24, ge=1, le=100),
):
    return await store.list_public(limit=limit, query=q)


@app.websocket("/ws/analysis/{task_id}")
async def analysis_progress_stream(websocket: WebSocket, task_id: str):
    await websocket.accept()
    last_snapshot = None
    language = resolve_language(websocket.headers.get("accept-language"))

    try:
        while True:
            task = await store.get(task_id)
            if not task:
                await websocket.send_json({"status": "failed", "message": t(language, "Tarefa nao encontrada.", "Task not found.")})
                await websocket.close()
                return

            payload = {
                "task_id": task.task_id,
                "status": task.status,
                "steps": [step.model_dump(mode="json") for step in task.steps],
            }
            if task.result:
                payload["result"] = task.result.model_dump(mode="json")
            if payload != last_snapshot:
                await websocket.send_json(payload)
                last_snapshot = payload

            if task.status in {"complete", "failed"}:
                await websocket.close()
                return

            await asyncio.sleep(1)
    except WebSocketDisconnect:
        return
