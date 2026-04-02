from __future__ import annotations

import re
from collections import defaultdict
from urllib.parse import urlparse

from backend.models.schemas import Indicator


WEBHOOK_PATTERNS: dict[str, list[str]] = {
    "discord": [
        r"https://(?:canary\.)?discord(?:app)?\.com/api/(?:v\d+/)?webhooks/\d+/[\w-]+",
        r"https://webhooks\.discord\.com/api/webhooks/\d+/[\w-]+",
    ],
    "slack": [
        r"https://hooks\.slack\.com/(?:services|triggers)/[\w/]+",
    ],
    "telegram": [
        r"https://api\.telegram\.org/bot\d+:[\w-]+/(?:send\w+|getUpdates|getFile|setWebhook|forwardMessage|editMessageText|answerCallbackQuery)",
        r"https://api\.telegram\.org/file/bot\d+:[\w-]+/[^\s\"'<>]+",
        r"https://t\.me/[\w_]+",
        r"https://telegram\.me/[\w_]+",
        r"tg://(?:resolve|join)\?[^\s\"'<>]+",
    ],
    "teams": [
        r"https://[a-z0-9]+\.webhook\.office\.com/webhookb2/[\w@/-]+",
        r"https://outlook\.office\.com/webhook/[\w@/-]+",
    ],
    "github": [
        r"https://api\.github\.com/repos/[\w.-]+/[\w.-]+/hooks/\d+",
    ],
    "gitlab": [
        r"https://(?:[\w-]+\.)?gitlab\.com/api/v4/projects/\d+/hooks(?:/\d+)?",
    ],
    "generic": [
        r"https?://[\w.-]+/(?:webhook|hook|notify|alert)/[\w./?=&-]+",
    ],
}

URL_PATTERN = re.compile(r"https?://[^\s\"'<>]+", re.IGNORECASE)
IP_PATTERN = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
DOMAIN_PATTERN = re.compile(r"\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b", re.IGNORECASE)
DISCORD_TOKEN_PATTERNS = [
    re.compile(r"\b[\w-]{24}\.[\w-]{6}\.[\w-]{27}\b"),
    re.compile(r"\bmfa\.[\w-]{84}\b"),
]
TELEGRAM_BOT_TOKEN_PATTERN = re.compile(r"\b\d{7,12}:[A-Za-z0-9_-]{30,}\b")
TELEGRAM_CHAT_ID_PATTERN = re.compile(r"\b(?:chat_id|channel_id|user_id)\s*[:=]\s*[\"']?-?\d{5,}\b", re.IGNORECASE)
TELEGRAM_USERNAME_PATTERN = re.compile(r"\B@[A-Za-z][A-Za-z0-9_]{4,}\b")
PATH_PATTERN = re.compile(
    r"(?:AppData\\(?:Local|Roaming)\\[^\s]+|HKEY_[A-Z_\\]+|HK(?:LM|CU)\\[^\s]+|%APPDATA%\\[^\s]+)",
    re.IGNORECASE,
)
SUSPICIOUS_DOMAIN_CONTEXT = (
    "http",
    "https",
    "host",
    "domain",
    "dns",
    "connect",
    "server",
    "socket",
    "upload",
    "post",
    "webhook",
    "telegram",
    "discord",
    "slack",
    "api",
    "panel",
    "gate",
    "c2",
    "bot",
)
COMMON_TLDS = {
    "com",
    "net",
    "org",
    "io",
    "gg",
    "me",
    "app",
    "ru",
    "xyz",
    "top",
    "site",
    "online",
    "store",
    "cloud",
    "cc",
    "co",
    "sh",
    "in",
    "uk",
    "de",
    "fr",
    "cn",
    "info",
}


def detect_iocs(text: str) -> dict[str, list[Indicator]]:
    grouped: dict[str, list[Indicator]] = defaultdict(list)
    seen: set[tuple[str, str]] = set()
    domain_candidates: dict[str, tuple[float, str, int]] = {}

    def add(indicator_type: str, value: str, **kwargs):
        normalized = (indicator_type, value)
        if normalized in seen:
            return
        seen.add(normalized)
        grouped[indicator_type].append(Indicator(type=indicator_type, value=value, **kwargs))

    def remember_domain(value: str, confidence: float, risk: str, position: int) -> None:
        current = domain_candidates.get(value)
        if current and current[0] >= confidence:
            return
        domain_candidates[value] = (confidence, risk, position)

    for platform, patterns in WEBHOOK_PATTERNS.items():
        for pattern in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                value = match.group(0)
                add(
                    "webhooks",
                    value,
                    confidence=0.95 if platform != "generic" else 0.7,
                    platform=platform,
                    position=match.start(),
                    risk="HIGH",
                )
                if platform == "telegram":
                    add(
                        "telegram",
                        value,
                        confidence=0.96,
                        platform="telegram",
                        position=match.start(),
                        risk="HIGH",
                        details={"kind": "endpoint"},
                    )
                host = _extract_host(value)
                if host:
                    remember_domain(host, 0.82 if platform != "telegram" else 0.9, "HIGH", match.start())

    for match in URL_PATTERN.finditer(text):
        value = match.group(0).rstrip(").,;")
        if any(value == webhook.value for webhook in grouped["webhooks"]):
            continue
        host = _extract_host(value)
        if host and not _looks_plausible_domain(host):
            continue
        add("urls", value, confidence=0.65, position=match.start(), risk="MEDIUM")
        if host:
            remember_domain(host, 0.76, "MEDIUM", match.start())

    for match in IP_PATTERN.finditer(text):
        value = match.group(0)
        octets = value.split(".")
        if any(int(octet) > 255 for octet in octets):
            continue
        add("ips", value, confidence=0.6, position=match.start(), risk="MEDIUM")

    for match in DOMAIN_PATTERN.finditer(text):
        value = match.group(0).lower()
        if value in domain_candidates:
            continue
        if not _looks_plausible_domain(value):
            continue
        if not _has_suspicious_context(text, match.start(), match.end()):
            continue
        if value.startswith("discord.gg"):
            remember_domain(value, 0.3, "INFO", match.start())
            continue
        remember_domain(value, 0.55, "LOW", match.start())

    for pattern in DISCORD_TOKEN_PATTERNS:
        for match in pattern.finditer(text):
            add("tokens", match.group(0), confidence=0.98, position=match.start(), risk="HIGH")

    for match in TELEGRAM_BOT_TOKEN_PATTERN.finditer(text):
        add(
            "tokens",
            match.group(0),
            confidence=0.92,
            platform="telegram",
            position=match.start(),
            risk="HIGH",
            details={"kind": "bot_token"},
        )
        add(
            "telegram",
            match.group(0),
            confidence=0.92,
            platform="telegram",
            position=match.start(),
            risk="HIGH",
            details={"kind": "bot_token"},
        )

    for match in TELEGRAM_CHAT_ID_PATTERN.finditer(text):
        value = match.group(0)
        add(
            "paths",
            value,
            confidence=0.72,
            platform="telegram",
            position=match.start(),
            risk="MEDIUM",
        )
        add(
            "telegram",
            value,
            confidence=0.84,
            platform="telegram",
            position=match.start(),
            risk="MEDIUM",
            details={"kind": "chat_id"},
        )

    for match in TELEGRAM_USERNAME_PATTERN.finditer(text):
        candidate = match.group(0)
        window_start = max(match.start() - 48, 0)
        window_end = min(match.end() + 48, len(text))
        nearby = text[window_start:window_end].lower()
        if "telegram" not in nearby and "t.me" not in nearby and "api.telegram.org" not in nearby:
            continue
        add(
            "paths",
            candidate,
            confidence=0.62,
            platform="telegram",
            position=match.start(),
            risk="LOW",
        )
        add(
            "telegram",
            candidate,
            confidence=0.7,
            platform="telegram",
            position=match.start(),
            risk="LOW",
            details={"kind": "username"},
        )

    for match in PATH_PATTERN.finditer(text):
        add("paths", match.group(0), confidence=0.7, position=match.start(), risk="MEDIUM")

    for value, (confidence, risk, position) in domain_candidates.items():
        add("domains", value, confidence=confidence, position=position, risk=risk)

    grouped["domains"].sort(key=lambda item: (-_risk_rank(item.risk), -(item.confidence or 0), item.value))
    grouped["urls"].sort(key=lambda item: (-_risk_rank(item.risk), -(item.confidence or 0), item.value))
    grouped["telegram"].sort(key=lambda item: (-_risk_rank(item.risk), -(item.confidence or 0), item.value))

    return dict(grouped)


def _extract_host(value: str) -> str | None:
    try:
        parsed = urlparse(value)
    except ValueError:
        return None
    host = (parsed.netloc or "").split("@")[-1].split(":")[0].strip().lower()
    return host or None


def _looks_plausible_domain(value: str) -> bool:
    labels = value.split(".")
    if len(labels) < 2 or len(labels) > 5:
        return False
    if len(value) > 80:
        return False

    tld = labels[-1]
    if len(tld) < 2 or len(tld) > 15:
        return False
    if tld not in COMMON_TLDS and len(tld) > 6:
        return False

    if any(len(label) > 32 for label in labels[:-1]):
        return False

    if any(label.isdigit() for label in labels[:-1]):
        return False

    core = labels[-2]
    alpha_count = sum(character.isalpha() for character in core)
    digit_count = sum(character.isdigit() for character in core)
    if alpha_count == 0:
        return False
    if digit_count > alpha_count * 2:
        return False

    return True


def _has_suspicious_context(text: str, start: int, end: int) -> bool:
    window_start = max(0, start - 32)
    window_end = min(len(text), end + 32)
    nearby = text[window_start:window_end].lower()
    return any(token in nearby for token in SUSPICIOUS_DOMAIN_CONTEXT)


def _risk_rank(value: str | None) -> int:
    order = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1, "INFO": 0}
    return order.get((value or "").upper(), 0)
