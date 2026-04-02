from __future__ import annotations

import hashlib
import math
import struct
from dataclasses import dataclass

from backend.models.schemas import ImportFunction, PEAnalysis, PESection, PESignature


SUSPICIOUS_IMPORTS = {
    "VirtualAllocEx": "Memory allocation in a remote process.",
    "WriteProcessMemory": "Writes bytes into another process address space.",
    "CreateRemoteThread": "Starts a thread inside another process.",
    "NtCreateThreadEx": "Native API often used for stealthier thread injection.",
    "QueueUserAPC": "Queues APCs in a foreign process thread.",
    "SetWindowsHookExA": "Can install global hooks for keylogging or injection.",
    "SetWindowsHookExW": "Can install global hooks for keylogging or injection.",
    "GetAsyncKeyState": "Reads keyboard state and is commonly used by keyloggers.",
    "OpenClipboard": "Access to clipboard contents.",
    "GetClipboardData": "Reads clipboard data.",
    "CryptUnprotectData": "Decrypts Windows-protected browser secrets.",
    "URLDownloadToFileA": "Downloads a file from a URL.",
    "URLDownloadToFileW": "Downloads a file from a URL.",
    "WinExec": "Legacy process launch function often abused by malware.",
    "ShellExecuteA": "Launches commands or payloads.",
    "ShellExecuteW": "Launches commands or payloads.",
    "CreateServiceA": "Creates a Windows service for persistence.",
    "CreateServiceW": "Creates a Windows service for persistence.",
}


PACKER_MARKERS = {
    "UPX": [b"UPX0", b"UPX1", b"UPX!"],
    "VMProtect": [b".vmp0", b".vmp1", b"VMProtect"],
    "Themida": [b".winlice", b"Themida", b"WinLicense"],
    "PyInstaller": [b"_MEIPASS", b"PyInstaller", b"pyi_rth_"],
    "Nuitka": [b"Nuitka"],
    "PyArmor": [b"pyarmor_runtime", b"PyArmor"],
    "MPRESS": [b".MPRESS1", b".MPRESS2"],
}


@dataclass(slots=True)
class ParsedSection:
    name: str
    virtual_size: int
    virtual_address: int
    raw_size: int
    raw_address: int
    characteristics: int


def analyze_pe(content: bytes) -> tuple[PEAnalysis | None, str | None]:
    if not content.startswith(b"MZ"):
        return None, None

    try:
        pe_offset = struct.unpack_from("<I", content, 0x3C)[0]
        if content[pe_offset : pe_offset + 4] != b"PE\x00\x00":
            return None, None

        coff_offset = pe_offset + 4
        machine, number_of_sections, _, _, _, size_of_optional_header, _ = struct.unpack_from(
            "<HHIIIHH", content, coff_offset
        )
        optional_header_offset = coff_offset + 20
        magic = struct.unpack_from("<H", content, optional_header_offset)[0]
        is_64 = magic == 0x20B
        entry_point = struct.unpack_from("<I", content, optional_header_offset + 16)[0]

        sections = _parse_sections(content, optional_header_offset + size_of_optional_header, number_of_sections)
        import_rva, _ = _read_import_directory(content, optional_header_offset, is_64)
        imports = _parse_imports(content, sections, import_rva, is_64)
        suspicious_imports = [item for item in imports if item.suspicious]
        packers = _detect_packers(content, sections)
        imphash = _build_imphash(imports)

        pe_sections = [
            PESection(
                name=section.name,
                virtual_size=section.virtual_size,
                raw_size=section.raw_size,
                raw_address=section.raw_address,
                entropy=_entropy(content[section.raw_address : section.raw_address + section.raw_size]),
                flags=_decode_characteristics(section.characteristics),
                packed_suspect=_is_packed_candidate(section, content),
            )
            for section in sections
        ]

        analysis = PEAnalysis(
            arch=_machine_to_arch(machine, is_64),
            entry_point=hex(entry_point),
            sections=pe_sections,
            imports=imports,
            exports=[],
            signature=PESignature(present=False, valid=None, subject=None, issuer=None),
            suspicious_imports=suspicious_imports,
            packers=packers,
        )
        return analysis, imphash
    except (IndexError, struct.error, ValueError):
        return None, None


def _parse_sections(content: bytes, section_table_offset: int, count: int) -> list[ParsedSection]:
    sections: list[ParsedSection] = []
    for index in range(count):
        base = section_table_offset + index * 40
        raw_name = content[base : base + 8]
        name = raw_name.split(b"\x00", 1)[0].decode("ascii", errors="ignore") or f"section_{index}"
        virtual_size, virtual_address, raw_size, raw_address = struct.unpack_from("<IIII", content, base + 8)
        characteristics = struct.unpack_from("<I", content, base + 36)[0]
        sections.append(
            ParsedSection(
                name=name,
                virtual_size=virtual_size,
                virtual_address=virtual_address,
                raw_size=raw_size,
                raw_address=raw_address,
                characteristics=characteristics,
            )
        )
    return sections


def _read_import_directory(content: bytes, optional_header_offset: int, is_64: bool) -> tuple[int, int]:
    data_directory_offset = optional_header_offset + (112 if is_64 else 96)
    return struct.unpack_from("<II", content, data_directory_offset + 8)


def _parse_imports(content: bytes, sections: list[ParsedSection], import_rva: int, is_64: bool) -> list[ImportFunction]:
    if not import_rva:
        return []

    import_offset = _rva_to_offset(import_rva, sections)
    if import_offset is None:
        return []

    functions: list[ImportFunction] = []
    thunk_size = 8 if is_64 else 4
    ordinal_mask = 0x8000000000000000 if is_64 else 0x80000000
    cursor = import_offset

    while True:
        original_first_thunk, _, _, name_rva, first_thunk = struct.unpack_from("<IIIII", content, cursor)
        if not any((original_first_thunk, name_rva, first_thunk)):
            break

        name_offset = _rva_to_offset(name_rva, sections)
        dll_name = _read_c_string(content, name_offset) if name_offset is not None else "unknown"

        thunk_rva = original_first_thunk or first_thunk
        thunk_offset = _rva_to_offset(thunk_rva, sections)
        if thunk_offset is None:
            cursor += 20
            continue

        while True:
            thunk_value = int.from_bytes(content[thunk_offset : thunk_offset + thunk_size], "little")
            if thunk_value == 0:
                break
            if thunk_value & ordinal_mask:
                thunk_offset += thunk_size
                continue

            import_name_offset = _rva_to_offset(thunk_value, sections)
            if import_name_offset is None:
                thunk_offset += thunk_size
                continue
            function_name = _read_c_string(content, import_name_offset + 2)
            suspicious = function_name in SUSPICIOUS_IMPORTS
            functions.append(
                ImportFunction(
                    dll=dll_name,
                    name=function_name,
                    suspicious=suspicious,
                    description=SUSPICIOUS_IMPORTS.get(function_name),
                )
            )
            thunk_offset += thunk_size

        cursor += 20

    unique: list[ImportFunction] = []
    seen: set[tuple[str, str]] = set()
    for item in functions:
        key = (item.dll.lower(), item.name.lower())
        if key in seen:
            continue
        seen.add(key)
        unique.append(item)
    return unique


def _rva_to_offset(rva: int, sections: list[ParsedSection]) -> int | None:
    for section in sections:
        start = section.virtual_address
        end = start + max(section.virtual_size, section.raw_size)
        if start <= rva < end:
            return section.raw_address + (rva - section.virtual_address)
    return None


def _read_c_string(content: bytes, offset: int | None) -> str:
    if offset is None or offset >= len(content):
        return ""
    end = offset
    while end < len(content) and content[end] != 0:
        end += 1
    return content[offset:end].decode("ascii", errors="ignore")


def _build_imphash(imports: list[ImportFunction]) -> str | None:
    if not imports:
        return None
    normalized = ",".join(f"{item.dll.lower()}.{item.name.lower()}" for item in imports)
    return hashlib.md5(normalized.encode("utf-8")).hexdigest()


def _detect_packers(content: bytes, sections: list[ParsedSection]) -> list[str]:
    detected: list[str] = []
    section_names = {section.name.encode("ascii", errors="ignore") for section in sections}

    for packer, markers in PACKER_MARKERS.items():
        if any(marker in content for marker in markers) or any(marker in section_names for marker in markers):
            detected.append(packer)

    return detected


def _decode_characteristics(characteristics: int) -> list[str]:
    flags: list[str] = []
    if characteristics & 0x20000000:
        flags.append("EXECUTE")
    if characteristics & 0x40000000:
        flags.append("READ")
    if characteristics & 0x80000000:
        flags.append("WRITE")
    if characteristics & 0x00000020:
        flags.append("CODE")
    if characteristics & 0x00000040:
        flags.append("INITIALIZED_DATA")
    return flags


def _is_packed_candidate(section: ParsedSection, content: bytes) -> bool:
    entropy = _entropy(content[section.raw_address : section.raw_address + section.raw_size])
    is_executable = bool(section.characteristics & 0x20000000 or section.characteristics & 0x00000020)
    return is_executable and entropy >= 7.0


def _machine_to_arch(machine: int, is_64: bool) -> str:
    if machine == 0x14C:
        return "x86"
    if machine == 0x8664:
        return "x64"
    return "x64" if is_64 else "unknown"


def _entropy(chunk: bytes) -> float:
    if not chunk:
        return 0.0
    frequencies = [0] * 256
    for byte in chunk:
        frequencies[byte] += 1
    entropy = 0.0
    length = len(chunk)
    for count in frequencies:
        if count == 0:
            continue
        probability = count / length
        entropy -= probability * math.log2(probability)
    return round(entropy, 3)

