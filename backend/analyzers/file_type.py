from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class FileTypeResult:
    kind: str
    mime: str
    executable: bool
    text_like: bool


SCRIPT_EXTENSIONS = {
    ".ps1": "PowerShell Script",
    ".js": "JavaScript",
    ".vbs": "VBScript",
    ".bat": "Batch Script",
    ".cmd": "Command Script",
    ".hta": "HTML Application",
    ".py": "Python Script",
}


def detect_file_type(content: bytes, filename: str) -> FileTypeResult:
    lower_name = filename.lower()

    if content.startswith(b"MZ"):
        return FileTypeResult("PE32/PE64 executable", "application/vnd.microsoft.portable-executable", True, False)
    if content.startswith(b"\x7fELF"):
        return FileTypeResult("ELF binary", "application/x-elf", True, False)
    if content.startswith(b"\xcf\xfa\xed\xfe") or content.startswith(b"\xfe\xed\xfa\xcf"):
        return FileTypeResult("Mach-O binary", "application/x-mach-binary", True, False)
    if content.startswith(b"%PDF"):
        return FileTypeResult("PDF document", "application/pdf", False, False)
    if content.startswith(b"PK\x03\x04"):
        if any(lower_name.endswith(ext) for ext in (".docx", ".xlsx", ".pptx")):
            return FileTypeResult("OOXML document", "application/vnd.openxmlformats-officedocument", False, False)
        if any(lower_name.endswith(ext) for ext in (".jar", ".war")):
            return FileTypeResult("Java archive", "application/java-archive", False, False)
        return FileTypeResult("ZIP archive", "application/zip", False, False)
    for extension, label in SCRIPT_EXTENSIONS.items():
        if lower_name.endswith(extension):
            return FileTypeResult(label, "text/plain", False, True)

    if _looks_like_text(content):
        return FileTypeResult("Text file", "text/plain", False, True)

    return FileTypeResult("Unknown binary", "application/octet-stream", False, False)


def _looks_like_text(content: bytes) -> bool:
    if not content:
        return False
    sample = content[:2048]
    printable = sum(1 for byte in sample if byte in b"\t\n\r" or 32 <= byte <= 126)
    return printable / max(len(sample), 1) > 0.85

