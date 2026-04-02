from __future__ import annotations

import os
import re
from pathlib import Path

from backend.models.schemas import YaraMatch, YaraSummary
from backend.services.i18n import t

try:
    import yara  # type: ignore
except Exception:
    yara = None


RULE_DECLARATION = re.compile(r"^\s*rule\s+([A-Za-z0-9_]+)", re.MULTILINE)


class YaraService:
    def __init__(self, rules_root: Path):
        self.rules_root = rules_root
        self.rules_root.mkdir(parents=True, exist_ok=True)

    def scan(self, file_path: Path, language: str = "en") -> YaraSummary:
        enabled = os.getenv("ENABLE_YARA", "false").lower() == "true"
        rule_files = sorted(list(self.rules_root.rglob("*.yar")) + list(self.rules_root.rglob("*.yara")))
        declared_rules = self._count_declared_rules(rule_files)

        if not enabled:
            return YaraSummary(
                enabled=False,
                engine="disabled",
                loaded_rules=declared_rules,
                note=t(
                    language,
                    "O scan YARA esta desabilitado. Defina ENABLE_YARA=true e instale yara-python para habilitar.",
                    "YARA scanning is disabled. Set ENABLE_YARA=true and install yara-python to enable it.",
                ),
            )

        if yara is None:
            return YaraSummary(
                enabled=False,
                engine="missing_dependency",
                loaded_rules=declared_rules,
                note=t(
                    language,
                    "yara-python nao esta instalado neste ambiente.",
                    "yara-python is not installed in this environment.",
                ),
            )

        if not rule_files:
            return YaraSummary(
                enabled=True,
                engine="yara-python",
                loaded_rules=0,
                note=t(language, "Nenhum arquivo de regra YARA foi encontrado.", "No YARA rule files were found."),
            )

        try:
            filepaths = {rule_file.stem: str(rule_file) for rule_file in rule_files}
            compiled_rules = yara.compile(filepaths=filepaths)
            matches = compiled_rules.match(str(file_path), timeout=15)
        except Exception as exc:
            return YaraSummary(
                enabled=True,
                engine="yara-python",
                loaded_rules=declared_rules,
                note=t(language, f"Falha no scan YARA: {exc}", f"YARA scan failed: {exc}"),
            )

        normalized_matches: list[YaraMatch] = []
        for match in matches:
            matched_strings: list[str] = []
            try:
                for string_match in match.strings:
                    identifier = getattr(string_match, "identifier", None)
                    if identifier and identifier not in matched_strings:
                        matched_strings.append(identifier)
            except Exception:
                matched_strings = []

            meta = dict(getattr(match, "meta", {}) or {})
            normalized_matches.append(
                YaraMatch(
                    rule=match.rule,
                    namespace=getattr(match, "namespace", "default"),
                    tags=list(getattr(match, "tags", []) or []),
                    meta=meta,
                    strings=matched_strings,
                    severity=str(meta.get("severity")) if meta.get("severity") else None,
                )
            )

        return YaraSummary(
            enabled=True,
            engine="yara-python",
            loaded_rules=declared_rules,
            matches=normalized_matches,
        )

    def _count_declared_rules(self, rule_files: list[Path]) -> int:
        count = 0
        for rule_file in rule_files:
            try:
                content = rule_file.read_text(encoding="utf-8")
            except OSError:
                continue
            count += len(RULE_DECLARATION.findall(content))
        return count
