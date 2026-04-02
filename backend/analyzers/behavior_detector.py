from __future__ import annotations

import re

from backend.models.schemas import BehaviorFinding, Indicator, MitreTechnique


def analyze_behaviors(text: str, iocs: dict[str, list[Indicator]]) -> list[BehaviorFinding]:
    findings: list[BehaviorFinding] = []
    lowered = text.lower()

    def add(
        *,
        name: str,
        description: str,
        severity: str,
        category: str,
        evidence: list[str],
        mitre: list[tuple[str, str, str]],
    ) -> None:
        if any(existing.name == name for existing in findings):
            return
        findings.append(
            BehaviorFinding(
                name=name,
                description=description,
                severity=severity,
                category=category,
                evidence=evidence,
                mitre=[MitreTechnique(id=item[0], name=item[1], tactic=item[2]) for item in mitre],
            )
        )

    if _contains_any(lowered, ["invoke-webrequest", "downloadstring", "downloadfile", "urlmon.dll", "urldownloadtofile", "bitsadmin", "certutil -urlcache"]):
        evidence = _collect(text, [r"Invoke-WebRequest", r"DownloadString", r"DownloadFile", r"URLDownloadToFile", r"bitsadmin", r"certutil"])
        add(
            name="Transferencia de ferramenta de entrada",
            description="A amostra referencia comandos de download usados para buscar cargas adicionais.",
            severity="HIGH",
            category="download",
            evidence=evidence,
            mitre=[("T1105", "Ingress Tool Transfer", "Command and Control")],
        )

    if _contains_any(lowered, ["currentversion\\run", "schtasks /create", "register-scheduledtask", "createservice", "__eventfilter", "startup"]):
        evidence = _collect(
            text,
            [
                r"CurrentVersion\\Run",
                r"SCHTASKS\s+/Create",
                r"Register-ScheduledTask",
                r"CreateService",
                r"__EventFilter",
                r"Start Menu\\Programs\\Startup",
            ],
        )
        add(
            name="Mecanismo de persistencia",
            description="A amostra expoe strings associadas a persistencia por registro, tarefas, servicos ou inicializacao.",
            severity="HIGH",
            category="persistence",
            evidence=evidence,
            mitre=[
                ("T1547.001", "Boot or Logon Autostart Execution: Registry Run Keys", "Persistence"),
                ("T1053.005", "Scheduled Task/Job: Scheduled Task", "Persistence"),
            ],
        )

    if _contains_any(lowered, ["isdebuggerpresent", "checkremotedebuggerpresent", "sandboxie", "vmware", "virtualbox", "qemu", "wireshark", "ollydbg", "x64dbg"]):
        evidence = _collect(
            text,
            [
                r"IsDebuggerPresent",
                r"CheckRemoteDebuggerPresent",
                r"Sandboxie",
                r"VMware",
                r"VirtualBox",
                r"QEMU",
                r"Wireshark",
                r"x64dbg",
            ],
        )
        add(
            name="Verificacoes anti-analise",
            description="A amostra referencia artefatos ligados a debugger, VM ou ambiente de analise.",
            severity="MEDIUM",
            category="evasion",
            evidence=evidence,
            mitre=[
                ("T1622", "Debugger Evasion", "Defense Evasion"),
                ("T1497", "Virtualization/Sandbox Evasion", "Defense Evasion"),
            ],
        )

    if _contains_any(lowered, ["virtualallocex", "writeprocessmemory", "createremotethread", "ntcreatethreadex", "queueuserapc"]):
        evidence = _collect(
            text,
            [
                r"VirtualAllocEx",
                r"WriteProcessMemory",
                r"CreateRemoteThread",
                r"NtCreateThreadEx",
                r"QueueUserAPC",
            ],
        )
        add(
            name="Injecao de processo",
            description="A amostra referencia APIs de memoria remota e criacao de threads usadas em injecao de processo.",
            severity="CRITICAL",
            category="injection",
            evidence=evidence,
            mitre=[("T1055", "Process Injection", "Defense Evasion")],
        )

    if _contains_any(lowered, ["cryptunprotectdata", "login data", "web data", "cookies", "local state"]):
        evidence = _collect(text, [r"CryptUnprotectData", r"Login Data", r"Web Data", r"Cookies", r"Local State"])
        add(
            name="Roubo de credenciais de navegador",
            description="A amostra referencia cofres de credenciais de navegador e rotinas de descriptografia DPAPI.",
            severity="CRITICAL",
            category="credential_access",
            evidence=evidence,
            mitre=[("T1555.003", "Credentials from Web Browsers", "Credential Access")],
        )

    if iocs.get("tokens") and _contains_any(lowered, ["local storage", "leveldb", "discord", "token"]):
        evidence = [token.value for token in iocs["tokens"][:2]]
        evidence.extend(_collect(text, [r"Local Storage", r"leveldb", r"discord"]))
        add(
            name="Coleta de token do Discord",
            description="A amostra aparenta mirar armazenamentos de token do Discord e material de exfiltracao.",
            severity="CRITICAL",
            category="credential_access",
            evidence=evidence,
            mitre=[("T1528", "Steal Application Access Token", "Credential Access")],
        )

    if _contains_any(lowered, ["setwindowshookex", "wh_keyboard_ll", "getasynckeystate"]):
        evidence = _collect(text, [r"SetWindowsHookEx", r"WH_KEYBOARD_LL", r"GetAsyncKeyState"])
        add(
            name="Hooks de keylogger",
            description="A amostra referencia APIs de captura de teclado associadas a keylogging.",
            severity="HIGH",
            category="collection",
            evidence=evidence,
            mitre=[("T1056.001", "Input Capture: Keylogging", "Collection")],
        )

    if _contains_any(lowered, ["openclipboard", "getclipboarddata"]):
        evidence = _collect(text, [r"OpenClipboard", r"GetClipboardData"])
        add(
            name="Monitoramento de area de transferencia",
            description="A amostra referencia APIs de clipboard normalmente usadas para monitorar ou substituir dados copiados.",
            severity="HIGH",
            category="collection",
            evidence=evidence,
            mitre=[("T1115", "Clipboard Data", "Collection")],
        )

    if _contains_any(lowered, ["bitblt", "getdc", "createcompatiblebitmap", "copyfromscreen"]):
        evidence = _collect(text, [r"BitBlt", r"GetDC", r"CreateCompatibleBitmap", r"CopyFromScreen"])
        add(
            name="Captura de tela",
            description="A amostra referencia APIs graficas comumente usadas para capturar a tela do usuario.",
            severity="HIGH",
            category="collection",
            evidence=evidence,
            mitre=[("T1113", "Screen Capture", "Collection")],
        )

    if _contains_any(lowered, ["-enc", "frombase64string", "iex(", "invoke-expression", "base64"]):
        evidence = _collect(text, [r"-enc", r"FromBase64String", r"IEX", r"Invoke-Expression", r"base64"])
        add(
            name="Script ofuscado",
            description="A amostra contem padroes de codificacao e ofuscacao de comandos comuns em scripts maliciosos em estagios.",
            severity="MEDIUM",
            category="obfuscation",
            evidence=evidence,
            mitre=[("T1027", "Obfuscated Files or Information", "Defense Evasion")],
        )

    if iocs.get("webhooks"):
        evidence = [webhook.value for webhook in iocs["webhooks"][:2]]
        add(
            name="Exfiltracao por servico web",
            description="Um webhook ou endpoint semelhante esta embutido na amostra, sugerindo exfiltracao para fora do ambiente.",
            severity="HIGH",
            category="exfiltration",
            evidence=evidence,
            mitre=[("T1567", "Exfiltration Over Web Service", "Exfiltration")],
        )

    telegram_iocs = [indicator.value for indicator in iocs.get("telegram", [])]
    telegram_iocs.extend(
        indicator.value
        for indicator in iocs.get("webhooks", [])
        if (indicator.platform or "").lower() == "telegram"
    )
    telegram_iocs.extend(
        indicator.value
        for indicator in iocs.get("tokens", [])
        if (indicator.platform or "").lower() == "telegram"
    )
    if telegram_iocs or _contains_any(lowered, ["api.telegram.org/bot", "sendmessage", "senddocument", "sendphoto", "sendmediagroup", "sendvideo", "sendvoice", "setwebhook", "chat_id=", "t.me/", "telegram.me/"]):
        evidence = telegram_iocs[:3]
        evidence.extend(_collect(text, [r"api\.telegram\.org/bot", r"sendMessage", r"sendDocument", r"sendPhoto", r"sendMediaGroup", r"sendVideo", r"sendVoice", r"setWebhook", r"chat_id\s*[:=]\s*[\"']?-?\d+", r"https://t\.me/[^\s\"']+", r"https://telegram\.me/[^\s\"']+"]))
        add(
            name="Exfiltracao via Telegram",
            description="O artefato referencia a API de bot do Telegram, tokens ou identificadores de chat associados a exfiltracao.",
            severity="HIGH",
            category="exfiltration",
            evidence=evidence,
            mitre=[("T1567", "Exfiltration Over Web Service", "Exfiltration")],
        )

    return findings


def _contains_any(text: str, items: list[str]) -> bool:
    return any(item in text for item in items)


def _collect(text: str, patterns: list[str]) -> list[str]:
    evidence: list[str] = []
    for pattern in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            candidate = match.group(0)
            if candidate not in evidence:
                evidence.append(candidate)
            if len(evidence) >= 6:
                return evidence
    return evidence
