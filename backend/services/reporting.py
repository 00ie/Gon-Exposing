from __future__ import annotations

from backend.models.schemas import Indicator, ReportAction
from backend.services.i18n import t


DISCORD_REPORT_URL = "https://discord.com/safety/360044157931-How-to-report-a-server"
URLHAUS_REPORT_URL = "https://urlhaus.abuse.ch/browse/"
ABUSEIPDB_REPORT_URL = "https://www.abuseipdb.com/report"


def prepare_report_actions(iocs: dict[str, list[Indicator]], language: str = "en") -> list[ReportAction]:
    actions: list[ReportAction] = []

    for webhook in iocs.get("webhooks", []):
        official_url = DISCORD_REPORT_URL if webhook.platform == "discord" else None
        guidance = t(
            language,
            "Preparado para reporte responsavel. A plataforma nunca envia mensagens nem altera webhooks de terceiros.",
            "Prepared for responsible reporting. The platform never sends messages to or modifies third-party webhooks.",
        )
        actions.append(
            ReportAction(
                platform=webhook.platform or "webhook",
                target=webhook.value,
                channel="official_abuse_flow",
                status="manual_review",
                guidance=guidance,
                official_url=official_url,
            )
        )

    for url in iocs.get("urls", []):
        actions.append(
            ReportAction(
                platform="urlhaus",
                target=url.value,
                channel="url_submission",
                status="manual_review",
                guidance=t(
                    language,
                    "Revise o contexto antes de submeter ao URLhaus ou a outro canal de threat intel.",
                    "Review the context before submitting to URLhaus or another threat-intel channel.",
                ),
                official_url=URLHAUS_REPORT_URL,
            )
        )

    for ip_addr in iocs.get("ips", []):
        actions.append(
            ReportAction(
                platform="abuseipdb",
                target=ip_addr.value,
                channel="ip_report",
                status="manual_review",
                guidance=t(
                    language,
                    "Valide o contexto antes de reportar um IP ao AbuseIPDB.",
                    "Validate the context before reporting an IP to AbuseIPDB.",
                ),
                official_url=ABUSEIPDB_REPORT_URL,
            )
        )

    return actions
