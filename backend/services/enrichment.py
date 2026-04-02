from __future__ import annotations

import os
from datetime import UTC, datetime

import httpx

from backend.models.schemas import MalwareBazaarSummary, ThreatEnrichment, UrlhausHit, VirusTotalSummary
from backend.services.i18n import t


class ThreatIntelService:
    def __init__(self) -> None:
        self.enabled = os.getenv("ENABLE_THREAT_INTEL", "false").lower() == "true"
        self.vt_api_key = os.getenv("VT_API_KEY", "").strip()

    async def enrich(self, sha256_hash: str, urls: list[str], language: str = "en") -> ThreatEnrichment:
        if not self.enabled:
            return ThreatEnrichment(
                enabled=False,
                notes=[t(language, "Consultas de threat intel estao desabilitadas.", "Threat-intel lookups are disabled.")],
            )

        notes: list[str] = []
        sources: list[str] = []

        async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": "gon-exposing/0.2"}) as client:
            vt_summary = await self._lookup_virustotal(client, sha256_hash, language)
            if vt_summary:
                sources.append("virustotal")

            mb_summary = await self._lookup_malwarebazaar(client, sha256_hash, language)
            if mb_summary:
                sources.append("malwarebazaar")

            urlhaus_hits = await self._lookup_urlhaus(client, urls[:5], language)
            if urlhaus_hits:
                sources.append("urlhaus")

        if not self.vt_api_key:
            notes.append(
                t(
                    language,
                    "Consulta ao VirusTotal ignorada porque VT_API_KEY nao esta configurada.",
                    "VirusTotal lookup skipped because VT_API_KEY is not configured.",
                )
            )

        if not sources:
            notes.append(
                t(
                    language,
                    "Nenhum dado externo de threat intel foi retornado para esta amostra.",
                    "No external threat-intel data was returned for this artifact.",
                )
            )

        return ThreatEnrichment(
            enabled=True,
            sources=sources,
            virustotal=vt_summary,
            malwarebazaar=mb_summary,
            urlhaus=urlhaus_hits,
            notes=notes,
        )

    async def _lookup_virustotal(self, client: httpx.AsyncClient, sha256_hash: str, language: str) -> VirusTotalSummary | None:
        if not self.vt_api_key:
            return None

        try:
            response = await client.get(
                f"https://www.virustotal.com/api/v3/files/{sha256_hash}",
                headers={"x-apikey": self.vt_api_key},
            )
            if response.status_code == 404:
                return VirusTotalSummary(
                    available=False,
                    note=t(language, "Hash nao encontrado no VirusTotal.", "Hash not found on VirusTotal."),
                )
            response.raise_for_status()
            payload = response.json().get("data", {}).get("attributes", {})
            stats = payload.get("last_analysis_stats", {})
            last_analysis = payload.get("last_analysis_date")
            last_analysis_iso = None
            if isinstance(last_analysis, (int, float)):
                last_analysis_iso = datetime.fromtimestamp(last_analysis, UTC).isoformat()
            return VirusTotalSummary(
                available=True,
                malicious=int(stats.get("malicious", 0)),
                suspicious=int(stats.get("suspicious", 0)),
                harmless=int(stats.get("harmless", 0)),
                undetected=int(stats.get("undetected", 0)),
                last_analysis_date=last_analysis_iso,
                permalink=f"https://www.virustotal.com/gui/file/{sha256_hash}",
            )
        except Exception as exc:
            return VirusTotalSummary(
                available=False,
                note=t(
                    language,
                    f"Falha na consulta ao VirusTotal: {exc}",
                    f"VirusTotal lookup failed: {exc}",
                ),
            )

    async def _lookup_malwarebazaar(self, client: httpx.AsyncClient, sha256_hash: str, language: str) -> MalwareBazaarSummary | None:
        try:
            response = await client.post(
                "https://mb-api.abuse.ch/api/v1/",
                data={"query": "get_info", "hash": sha256_hash},
            )
            response.raise_for_status()
            payload = response.json()
            if payload.get("query_status") != "ok" or not payload.get("data"):
                return MalwareBazaarSummary(
                    available=False,
                    note=t(language, "Hash nao encontrado no MalwareBazaar.", "Hash not found on MalwareBazaar."),
                )

            entry = payload["data"][0]
            return MalwareBazaarSummary(
                available=True,
                sha256_hash=entry.get("sha256_hash"),
                signature=entry.get("signature"),
                file_type=entry.get("file_type"),
                first_seen=entry.get("first_seen"),
                tags=list(entry.get("tags", []) or []),
            )
        except Exception as exc:
            return MalwareBazaarSummary(
                available=False,
                note=t(
                    language,
                    f"Falha na consulta ao MalwareBazaar: {exc}",
                    f"MalwareBazaar lookup failed: {exc}",
                ),
            )

    async def _lookup_urlhaus(self, client: httpx.AsyncClient, urls: list[str], language: str) -> list[UrlhausHit]:
        hits: list[UrlhausHit] = []
        for url in urls:
            try:
                response = await client.post(
                    "https://urlhaus-api.abuse.ch/v1/url/",
                    data={"url": url},
                )
                response.raise_for_status()
                payload = response.json()
                status = payload.get("query_status", "unknown")
                if status not in {"ok", "no_results"}:
                    hits.append(
                        UrlhausHit(
                            indicator=url,
                            status=status,
                            note=t(
                                language,
                                "Status inesperado retornado pelo URLhaus.",
                                "Unexpected status returned by URLhaus.",
                            ),
                        )
                    )
                    continue
                if status == "no_results":
                    continue
                hits.append(
                    UrlhausHit(
                        indicator=url,
                        status="listed",
                        threat=payload.get("threat"),
                        reference=payload.get("urlhaus_reference"),
                    )
                )
            except Exception as exc:
                hits.append(
                    UrlhausHit(
                        indicator=url,
                        status="lookup_failed",
                        note=t(language, str(exc), f"Lookup failed: {exc}"),
                    )
                )
        return hits
