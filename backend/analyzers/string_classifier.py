from __future__ import annotations

import re

from backend.models.schemas import Indicator


WEBHOOK_PATTERNS: list[tuple[str, str, str, float]] = [
    ("discord", r"https://(?:canary\.)?discord(?:app)?\.com/api/(?:v\d+/)?webhooks/\d+/[\w-]+", "HIGH", 0.98),
    ("discord", r"https://webhooks\.discord\.com/api/webhooks/\d+/[\w-]+", "HIGH", 0.98),
    ("slack", r"https://hooks\.slack\.com/(?:services|triggers)/[\w/]+", "HIGH", 0.95),
    ("telegram", r"https://api\.telegram\.org/bot\d+:[A-Za-z0-9_-]{30,}/(?:send\w+|getUpdates|getFile|setWebhook|forwardMessage|editMessageText|answerCallbackQuery)", "HIGH", 0.96),
    ("teams", r"https://[a-z0-9]+\.webhook\.office\.com/webhookb2/[\w@/-]+", "HIGH", 0.92),
]

GENERIC_URL_PATTERN = re.compile(r"https?://[^\s\"'<>]+", re.IGNORECASE)
TELEGRAM_URL_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"https://(?:t|telegram)\.me/[\w/+%-]+", re.IGNORECASE),
    re.compile(r"https://api\.telegram\.org/file/bot\d+:[A-Za-z0-9_-]{30,}/[^\s\"'<>]+", re.IGNORECASE),
    re.compile(r"tg://(?:resolve|join)\?[^\s\"'<>]+", re.IGNORECASE),
]
IP_PATTERN = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")
EMAIL_PATTERN = re.compile(r"\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b", re.IGNORECASE)
DISCORD_TOKEN_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"\b[\w-]{24}\.[\w-]{6}\.[\w-]{27}\b"),
    re.compile(r"\bmfa\.[\w-]{84}\b"),
]
TELEGRAM_BOT_TOKEN_PATTERN = re.compile(r"\b\d{7,12}:[A-Za-z0-9_-]{30,}\b")
TELEGRAM_CHAT_ID_PATTERN = re.compile(r"(?:chat_id|channel_id|user_id)\s*[:=]\s*[\"']?-?\d{5,}", re.IGNORECASE)
REGISTRY_PATTERN = re.compile(r"(?:HKEY_[A-Z_\\]+|HK(?:LM|CU|CR|U|CC)\\[^\s]+)", re.IGNORECASE)
PATH_PATTERN = re.compile(
    r"(?:[A-Za-z]:\\[^\r\n\t]+|%APPDATA%\\[^\s]+|%TEMP%\\[^\s]+|%LOCALAPPDATA%\\[^\s]+|AppData\\(?:Local|Roaming)\\[^\s]+)",
    re.IGNORECASE,
)
POWERSHELL_PATTERN = re.compile(
    r"(?:powershell(?:\.exe)?|Invoke-Expression|IEX\b|FromBase64String|DownloadString|DownloadFile|-ExecutionPolicy\s+Bypass|-enc\b)",
    re.IGNORECASE,
)
BASE64_PATTERN = re.compile(r"\b(?:[A-Za-z0-9+/]{20,}={0,2})\b")


def classify_strings(strings: list[str], limit: int = 120) -> tuple[list[Indicator], dict[str, int]]:
    classified: list[Indicator] = []
    counts: dict[str, int] = {}
    seen: set[tuple[str, str]] = set()

    def add(category: str, value: str, *, risk: str, confidence: float, platform: str | None = None) -> None:
        normalized = (category, value)
        if normalized in seen or len(classified) >= limit:
            return
        seen.add(normalized)
        counts[category] = counts.get(category, 0) + 1
        classified.append(
            Indicator(
                type=category,
                value=value,
                risk=risk,
                confidence=confidence,
                platform=platform,
            )
        )

    for value in strings:
        cleaned = value.strip()
        if not cleaned or len(cleaned) < 4:
            continue

        matched = False

        for platform, pattern, risk, confidence in WEBHOOK_PATTERNS:
            if re.search(pattern, cleaned, re.IGNORECASE):
                add("webhooks", cleaned, risk=risk, confidence=confidence, platform=platform)
                matched = True
                break
        if matched:
            continue

        if any(pattern.search(cleaned) for pattern in TELEGRAM_URL_PATTERNS):
            add("telegram", cleaned, risk="HIGH", confidence=0.94, platform="telegram")
            continue

        if GENERIC_URL_PATTERN.search(cleaned):
            add("urls", cleaned, risk="MEDIUM", confidence=0.7)
            continue

        if TELEGRAM_BOT_TOKEN_PATTERN.search(cleaned):
            add("telegram_tokens", cleaned, risk="HIGH", confidence=0.96, platform="telegram")
            continue

        if TELEGRAM_CHAT_ID_PATTERN.search(cleaned):
            add("telegram_chat_ids", cleaned, risk="MEDIUM", confidence=0.84, platform="telegram")
            continue

        if any(pattern.search(cleaned) for pattern in DISCORD_TOKEN_PATTERNS):
            add("tokens", cleaned, risk="HIGH", confidence=0.98, platform="discord")
            continue

        if REGISTRY_PATTERN.search(cleaned):
            add("registry", cleaned, risk="MEDIUM", confidence=0.76)
            continue

        if PATH_PATTERN.search(cleaned):
            add("paths", cleaned, risk="MEDIUM", confidence=0.72)
            continue

        if POWERSHELL_PATTERN.search(cleaned):
            add("powershell", cleaned, risk="HIGH", confidence=0.86)
            continue

        if EMAIL_PATTERN.search(cleaned):
            add("emails", cleaned, risk="LOW", confidence=0.6)
            continue

        if IP_PATTERN.search(cleaned):
            add("ips", cleaned, risk="MEDIUM", confidence=0.64)
            continue

        if len(cleaned) >= 24 and BASE64_PATTERN.fullmatch(cleaned):
            add("encoded", cleaned, risk="LOW", confidence=0.45)

    return classified, counts
