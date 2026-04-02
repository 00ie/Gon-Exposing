from __future__ import annotations

from backend.models.schemas import BehaviorFinding, Indicator, PEAnalysis, ScoreFactor, ScoreSummary, ThreatEnrichment, YaraSummary


def compute_score(
    iocs: dict[str, list[Indicator]],
    behaviors: list[BehaviorFinding],
    pe_analysis: PEAnalysis | None,
    yara_summary: YaraSummary | None = None,
    enrichment: ThreatEnrichment | None = None,
) -> ScoreSummary:
    factors: list[ScoreFactor] = []

    webhook_count = len(iocs.get("webhooks", []))
    if webhook_count:
        factors.append(
            ScoreFactor(
                name="Webhook detectado como IOC",
                weight=min(35, 20 + webhook_count * 5),
                evidence=[ioc.value for ioc in iocs["webhooks"][:3]],
            )
        )

    token_count = len(iocs.get("tokens", []))
    if token_count:
        factors.append(
            ScoreFactor(
                name="Padrao de token de credencial detectado",
                weight=min(30, 12 + token_count * 6),
                evidence=[ioc.value for ioc in iocs["tokens"][:2]],
            )
        )

    url_count = len(iocs.get("urls", []))
    if url_count >= 2:
        factors.append(
            ScoreFactor(
                name="Multiplas URLs externas extraidas",
                weight=10,
                evidence=[ioc.value for ioc in iocs["urls"][:3]],
            )
        )

    for finding in behaviors:
        weight = {
            "LOW": 5,
            "MEDIUM": 12,
            "HIGH": 20,
            "CRITICAL": 30,
        }[finding.severity]
        factors.append(ScoreFactor(name=finding.name, weight=weight, evidence=finding.evidence[:3]))

    if pe_analysis:
        suspicious_imports = len(pe_analysis.suspicious_imports)
        if suspicious_imports:
            factors.append(
                ScoreFactor(
                    name="Imports PE suspeitos",
                    weight=min(30, suspicious_imports * 5),
                    evidence=[item.name for item in pe_analysis.suspicious_imports[:6]],
                )
            )

        packed_sections = [section.name for section in pe_analysis.sections if section.packed_suspect]
        if packed_sections:
            factors.append(
                ScoreFactor(
                    name="Secoes executaveis com alta entropia",
                    weight=20,
                    evidence=packed_sections,
                )
            )

        if pe_analysis.packers:
            factors.append(
                ScoreFactor(
                    name="Indicadores de packer conhecido",
                    weight=15,
                    evidence=pe_analysis.packers,
                )
            )

    if yara_summary and yara_summary.matches:
        factors.append(
            ScoreFactor(
                name="Assinatura YARA acionada",
                weight=40,
                evidence=[match.rule for match in yara_summary.matches[:4]],
            )
        )

    if enrichment and enrichment.virustotal and enrichment.virustotal.available:
        vt_hits = enrichment.virustotal.malicious + enrichment.virustotal.suspicious
        if vt_hits >= 5:
            factors.append(
                ScoreFactor(
                    name="Deteccoes no VirusTotal",
                    weight=min(30, vt_hits),
                    evidence=[f"{vt_hits} motores marcaram a amostra"],
                )
            )

    if enrichment and enrichment.urlhaus:
        listed = [hit.indicator for hit in enrichment.urlhaus if hit.status == "listed"]
        if listed:
            factors.append(
                ScoreFactor(
                    name="Infraestrutura listada no URLhaus",
                    weight=25,
                    evidence=listed[:3],
                )
            )

    score_value = max(0, min(100, sum(factor.weight for factor in factors)))
    classification = _classify(score_value)
    return ScoreSummary(value=score_value, classification=classification, factors=factors)


def _classify(score: int) -> str:
    if score <= 15:
        return "CLEAN"
    if score <= 40:
        return "LOW"
    if score <= 65:
        return "MEDIUM"
    if score <= 85:
        return "HIGH"
    return "CRITICAL"
