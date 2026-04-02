from __future__ import annotations

from backend.models.schemas import BehaviorFinding, FamilyMatch, Indicator, PEAnalysis, YaraSummary


def infer_family(
    text: str,
    iocs: dict[str, list[Indicator]],
    behaviors: list[BehaviorFinding],
    pe_analysis: PEAnalysis | None,
    yara_summary: YaraSummary | None = None,
) -> FamilyMatch | None:
    lowered = text.lower()

    if yara_summary and yara_summary.matches:
        strongest = yara_summary.matches[0]
        family_name = str(strongest.meta.get("family") or strongest.rule.replace("_", " "))
        support_level = "full" if strongest.meta.get("support") == "full" else "detection_only"
        severity = str(strongest.meta.get("severity") or "").upper()
        confidence = 0.97 if severity in {"HIGH", "CRITICAL"} else 0.9
        return FamilyMatch(
            name=family_name,
            confidence=confidence,
            support_level=support_level,
            detection_method="signature",
            yara_rules=[match.rule for match in yara_summary.matches],
            summary=f"Detectado por meio da regra YARA {strongest.rule}.",
        )

    if "asyncrat" in lowered and all(marker in lowered for marker in ("hosts", "ports", "install")):
        return FamilyMatch(
            name="AsyncRAT",
            confidence=0.96,
            support_level="full",
            detection_method="signature",
            yara_rules=["AsyncRAT_Config"],
            summary="Strings de configuracao combinam fortemente com convencoes de AsyncRAT.",
        )

    if "xmrig" in lowered or "stratum+tcp://" in lowered or "stratum+ssl://" in lowered:
        return FamilyMatch(
            name="XMRig",
            confidence=0.95,
            support_level="full",
            detection_method="signature",
            yara_rules=["XMRig_Miner"],
            summary="Indicadores de pool e carteira combinam com comportamento de minerador no estilo XMRig.",
        )

    if "lockbit" in lowered or ("restore-my-files" in lowered and "vssadmin delete shadows" in lowered):
        return FamilyMatch(
            name="LockBit",
            confidence=0.93,
            support_level="full",
            detection_method="signature",
            yara_rules=["LockBit_Ransomware"],
            summary="Nota de resgate e delecao de shadow copies combinam com comportamento no estilo LockBit.",
        )

    if iocs.get("webhooks") and iocs.get("tokens"):
        return FamilyMatch(
            name="Generic Token Stealer",
            confidence=0.9,
            support_level="full",
            detection_method="signature",
            yara_rules=["Generic_Discord_Stealer"],
            summary="Endpoints de webhook e artefatos de token indicam exfiltracao baseada em webhook.",
        )

    behavior_names = {behavior.name for behavior in behaviors}
    if {"Roubo de credenciais de navegador", "Exfiltracao por servico web"} <= behavior_names:
        return FamilyMatch(
            name="Generic Infostealer",
            confidence=0.79,
            support_level="heuristic",
            detection_method="heuristic",
            yara_rules=[],
            summary="A amostra combina acesso a credenciais de navegador com indicadores de exfiltracao externa.",
        )

    if pe_analysis and pe_analysis.packers:
        return FamilyMatch(
            name=f"{pe_analysis.packers[0]} packed payload",
            confidence=0.68,
            support_level="detection_only",
            detection_method="heuristic",
            yara_rules=[],
            summary="O arquivo aparenta estar protegido por um packer conhecido ou por um stub de loader.",
        )

    return None
