from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ExtractedStrings:
    ascii_strings: list[str]
    utf16_strings: list[str]

    @property
    def all_strings(self) -> list[str]:
        return self.ascii_strings + self.utf16_strings


def extract_strings(content: bytes, min_length: int = 6) -> ExtractedStrings:
    return ExtractedStrings(
        ascii_strings=_extract_ascii(content, min_length=min_length),
        utf16_strings=_extract_utf16le(content, min_length=min_length),
    )


def _extract_ascii(content: bytes, min_length: int) -> list[str]:
    strings: list[str] = []
    current: list[str] = []

    for byte in content:
        if 32 <= byte <= 126:
            current.append(chr(byte))
            continue

        if len(current) >= min_length:
            strings.append("".join(current))
        current = []

    if len(current) >= min_length:
        strings.append("".join(current))

    return strings


def _extract_utf16le(content: bytes, min_length: int) -> list[str]:
    strings: list[str] = []
    current: list[str] = []
    index = 0

    while index < len(content) - 1:
        low = content[index]
        high = content[index + 1]

        if high == 0 and 32 <= low <= 126:
            current.append(chr(low))
            index += 2
            continue

        if len(current) >= min_length:
            strings.append("".join(current))
        current = []
        index += 1

    if len(current) >= min_length:
        strings.append("".join(current))

    return strings

