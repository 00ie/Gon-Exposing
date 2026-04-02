from __future__ import annotations

import asyncio
import hashlib
import os
import tempfile
from pathlib import Path
from time import perf_counter

from backend.analyzers.behavior_detector import analyze_behaviors
from backend.analyzers.file_type import detect_file_type
from backend.analyzers.ioc_detector import detect_iocs
from backend.analyzers.pe_analyzer import analyze_pe
from backend.analyzers.string_classifier import classify_strings
from backend.analyzers.string_extractor import extract_strings
from backend.models.schemas import AnalysisResult, AnalysisStep, CommunityContact, FileMetadata, Indicator
from backend.services.enrichment import ThreatIntelService
from backend.services.family_detector import infer_family
from backend.services.i18n import t
from backend.services.reporting import prepare_report_actions
from backend.services.scoring import compute_score
from backend.services.store import AnalysisStore, utc_now
from backend.services.yara_engine import YaraService


COMMUNITY = CommunityContact(
    discord_server="https://discord.gg/2asv4rEhGh",
    discord_handle="tlwm",
    github="https://github.com/00ie",
    telegram="https://t.me/feicoes",
)

YARA_RULES_ROOT = os.getenv("YARA_RULES_PATH")
yara_service = YaraService(Path(YARA_RULES_ROOT) if YARA_RULES_ROOT else Path(__file__).resolve().parent.parent / "rules")
threat_intel_service = ThreatIntelService()


async def analyze_sample(task_id: str, filename: str, content: bytes, store: AnalysisStore) -> None:
    started = perf_counter()
    task = await store.get(task_id)
    if not task:
        return

    temporary_path: Path | None = None
    try:
        language = getattr(task, "language", "en")
        task.status = "running"
        await _push_step(task, store, "hashing", 5, t(language, "Calculando hashes do arquivo e identificando o tipo da amostra...", "Computing file hashes and identifying the sample type..."))
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(filename).suffix or ".bin") as temporary_file:
            temporary_file.write(content)
            temporary_path = Path(temporary_file.name)

        file_type = detect_file_type(content, filename)
        md5_hash = hashlib.md5(content).hexdigest()
        sha1_hash = hashlib.sha1(content).hexdigest()
        sha256_hash = hashlib.sha256(content).hexdigest()
        sha512_hash = hashlib.sha512(content).hexdigest()

        await _push_step(task, store, "string_extract", 25, t(language, "Extraindo strings ASCII e UTF-16 sem executar a amostra...", "Extracting ASCII and UTF-16 strings without executing the sample..."))
        extracted = extract_strings(content)
        classified_strings, classified_counts = classify_strings(extracted.all_strings)
        string_preview = _build_string_preview(extracted.all_strings, classified_strings)
        text_blob = "\n".join(extracted.all_strings)

        await _push_step(task, store, "ioc_detection", 45, t(language, "Varrendo o conteudo extraido em busca de webhooks, URLs, IPs, dominios, tokens e caminhos...", "Scanning extracted content for webhooks, URLs, IPs, domains, tokens, and paths..."))
        iocs = detect_iocs(text_blob)

        await _push_step(task, store, "behavior_analysis", 62, t(language, "Correlacionando comportamentos suspeitos e tecnicas MITRE ATT&CK...", "Correlating suspicious behaviors and MITRE ATT&CK techniques..."))
        behaviors = analyze_behaviors(text_blob, iocs)

        pe_analysis = None
        imphash = None
        if file_type.kind.startswith("PE"):
            await _push_step(task, store, "pe_analysis", 76, t(language, "Analisando headers PE, secoes, imports, entropia e indicios de packer...", "Analyzing PE headers, sections, imports, entropy, and packer indicators..."))
            pe_analysis, imphash = analyze_pe(content)

        await _push_step(task, store, "yara_scan", 82, t(language, "Executando correlacao opcional com regras YARA...", "Running optional correlation with YARA rules..."))
        yara_summary = await _run_yara_scan(temporary_path, language)

        await _push_step(task, store, "enrichment", 88, t(language, "Consultando fontes externas de threat intel quando habilitadas...", "Querying external threat-intel sources when enabled..."))
        enrichment = await threat_intel_service.enrich(
            sha256_hash,
            [indicator.value for indicator in iocs.get("urls", [])],
            language=language,
        )

        await _push_step(task, store, "scoring", 92, t(language, "Calculando score de risco unificado e inferencia de familia...", "Computing unified risk score and family inference..."))
        family = infer_family(text_blob, iocs, behaviors, pe_analysis, yara_summary)
        score = compute_score(iocs, behaviors, pe_analysis, yara_summary, enrichment)
        reports = prepare_report_actions(iocs, language=language)

        await _push_step(task, store, "finalizing", 96, t(language, "Finalizando o relatorio, preservando evidencias e preparando acoes responsaveis...", "Finalizing the report, preserving evidence, and preparing responsible actions..."))
        analysis_time_ms = int((perf_counter() - started) * 1000)
        result = AnalysisResult(
            task_id=task_id,
            status="complete",
            file=FileMetadata(
                name=filename,
                size=len(content),
                type=file_type.kind,
                md5=md5_hash,
                sha1=sha1_hash,
                sha256=sha256_hash,
                sha512=sha512_hash,
                imphash=imphash,
                tlsh=None,
            ),
            score=score,
            family=family,
            iocs=iocs,
            behaviors=behaviors,
            pe=pe_analysis,
            yara=yara_summary,
            enrichment=enrichment,
            strings={
                "total": len(extracted.all_strings),
                "ascii_count": len(extracted.ascii_strings),
                "utf16_count": len(extracted.utf16_strings),
                "preview": string_preview,
                "classified": classified_strings,
                "classified_counts": classified_counts,
            },
            reports_submitted=reports,
            steps=task.steps,
            links={
                "virustotal": f"https://www.virustotal.com/gui/file/{sha256_hash}",
                "malwarebazaar": f"https://bazaar.abuse.ch/sample/{sha256_hash}/",
                "share_path": f"/analyze/{task_id}",
            },
            community=COMMUNITY,
            notes=[
                t(language, "Analise somente estatica: a amostra nao foi executada.", "Static-only analysis: the sample was not executed."),
                t(language, "Envio de mensagens para webhooks detectados permanece desabilitado por seguranca e autorizacao.", "Sending messages to detected webhooks remains disabled for safety and authorization reasons."),
                t(language, "As acoes de reporte sao preparadas para submissao manual ou por canais oficiais de abuso.", "Report actions are prepared for manual submission or official abuse channels."),
                t(language, "O enrichment externo de threat intel so roda quando esta habilitado na configuracao.", "External threat-intel enrichment only runs when enabled in configuration."),
            ],
            analyzed_at=utc_now(),
            analysis_time_ms=analysis_time_ms,
        )
        task.status = "complete"
        task.result = result
        await _push_step(task, store, "complete", 100, t(language, "Analise concluida.", "Analysis complete."))
        task.result.steps = task.steps
        await store.save(task)
    except Exception as exc:
        task.status = "failed"
        task.error = str(exc)
        task.result = AnalysisResult(
            task_id=task_id,
            status="failed",
            community=COMMUNITY,
            steps=task.steps,
            error=str(exc),
        )
        await store.save(task)
    finally:
        try:
            if temporary_path:
                temporary_path.unlink(missing_ok=True)
        except Exception:
            pass


async def analyze_url_target(task_id: str, url: str, store: AnalysisStore) -> None:
    task = await store.get(task_id)
    if not task:
        return

    started = perf_counter()

    try:
        language = getattr(task, "language", "en")
        task.status = "running"
        await _push_step(task, store, "preparando", 8, t(language, "Validando a URL e preparando a analise estatica...", "Validating the URL and preparing static analysis..."))

        text_blob = url.strip()

        await _push_step(task, store, "ioc_detection", 30, t(language, "Verificando IOC, webhooks, dominios e endpoints de mensageria...", "Checking IOC, webhooks, domains, and messaging endpoints..."))
        iocs = detect_iocs(text_blob)
        if "urls" not in iocs:
            iocs["urls"] = []
        if not any(indicator.value == text_blob for indicator in iocs["urls"]):
            iocs["urls"].append(
                Indicator(
                    type="urls",
                    value=text_blob,
                    confidence=0.88,
                    risk="MEDIUM",
                )
            )

        await _push_step(task, store, "behavior_analysis", 52, t(language, "Correlacionando a URL com padroes suspeitos e canais de exfiltracao...", "Correlating the URL with suspicious patterns and exfiltration channels..."))
        behaviors = analyze_behaviors(text_blob, iocs)

        await _push_step(task, store, "enrichment", 74, t(language, "Consultando contexto externo da URL quando habilitado...", "Querying external URL context when enabled..."))
        enrichment = await threat_intel_service.enrich("", [text_blob], language=language)

        await _push_step(task, store, "scoring", 88, t(language, "Calculando score de risco para o alvo informado...", "Computing the risk score for the provided target..."))
        family = infer_family(text_blob, iocs, behaviors, None, None)
        score = compute_score(iocs, behaviors, None, None, enrichment)
        reports = prepare_report_actions(iocs, language=language)
        file_metadata = _build_virtual_file_metadata(
            name=url,
            artifact_type="URL",
            content=url.encode("utf-8"),
        )

        result = AnalysisResult(
            task_id=task_id,
            status="complete",
            file=file_metadata,
            score=score,
            family=family,
            iocs=iocs,
            behaviors=behaviors,
            pe=None,
            yara=None,
            enrichment=enrichment,
            strings={
                "total": 1,
                "ascii_count": 1,
                "utf16_count": 0,
                "preview": [url],
                "classified": iocs.get("webhooks", [])[:8] + iocs.get("urls", [])[:8] + iocs.get("tokens", [])[:8] + iocs.get("paths", [])[:8],
                "classified_counts": {
                    "webhooks": len(iocs.get("webhooks", [])),
                    "urls": len(iocs.get("urls", [])),
                    "tokens": len(iocs.get("tokens", [])),
                    "paths": len(iocs.get("paths", [])),
                },
            },
            reports_submitted=reports,
            steps=task.steps,
            links={
                "virustotal": f"https://www.virustotal.com/gui/search/{url}",
                "malwarebazaar": None,
                "share_path": f"/analyze/{task_id}",
            },
            community=COMMUNITY,
            notes=[
                t(language, "Analise estatica de URL: nenhum conteudo remoto foi executado.", "Static URL analysis: no remote content was executed."),
                t(language, "A URL foi tratada como artefato textual e correlacionada com IOC, score e enrichment configurado.", "The URL was treated as a text artifact and correlated with IOC, score, and configured enrichment."),
            ],
            analyzed_at=utc_now(),
            analysis_time_ms=int((perf_counter() - started) * 1000),
        )
        task.status = "complete"
        task.result = result
        await _push_step(task, store, "complete", 100, t(language, "Analise de URL concluida.", "URL analysis complete."))
        task.result.steps = task.steps
        await store.save(task)
    except Exception as exc:
        task.status = "failed"
        task.error = str(exc)
        task.result = AnalysisResult(
            task_id=task_id,
            status="failed",
            community=COMMUNITY,
            steps=task.steps,
            error=str(exc),
        )
        await store.save(task)


async def analyze_hash_target(task_id: str, hash_value: str, store: AnalysisStore) -> None:
    task = await store.get(task_id)
    if not task:
        return

    started = perf_counter()

    try:
        language = getattr(task, "language", "en")
        task.status = "running"
        await _push_step(task, store, "hash_lookup", 12, t(language, "Preparando consulta local e externa para o hash informado...", "Preparing local and external lookup for the provided hash..."))
        normalized = hash_value.strip().lower()

        await _push_step(task, store, "enrichment", 58, t(language, "Consultando VirusTotal, MalwareBazaar e correlacoes externas quando habilitado...", "Querying VirusTotal, MalwareBazaar, and external correlations when enabled..."))
        enrichment = await threat_intel_service.enrich(normalized, [], language=language)

        await _push_step(task, store, "scoring", 84, t(language, "Calculando score a partir do contexto retornado para o hash...", "Computing the score from the context returned for the hash..."))
        score = compute_score({}, [], None, None, enrichment)
        notes = [
            t(language, "Consulta por hash: nenhum arquivo foi baixado ou executado.", "Hash lookup: no file was downloaded or executed."),
            t(language, "Se o hash existir localmente, use a pesquisa para abrir o relatorio completo.", "If the hash exists locally, use search to open the full report."),
        ]
        if not _looks_like_sha256(normalized):
            notes.append(t(language, "A maioria das fontes externas usa SHA256; para MD5 e SHA1 a cobertura pode ser menor.", "Most external sources use SHA256; coverage may be lower for MD5 and SHA1."))

        result = AnalysisResult(
            task_id=task_id,
            status="complete",
            file=_build_hash_lookup_file_metadata(normalized, language),
            score=score if score.factors else None,
            family=None,
            iocs={},
            behaviors=[],
            pe=None,
            yara=None,
            enrichment=enrichment,
            strings={
                "total": 1,
                "ascii_count": 1,
                "utf16_count": 0,
                "preview": [normalized],
                "classified": [],
                "classified_counts": {},
            },
            reports_submitted=[],
            steps=task.steps,
            links={
                "virustotal": f"https://www.virustotal.com/gui/search/{normalized}",
                "malwarebazaar": f"https://bazaar.abuse.ch/browse.php?search={normalized}",
                "share_path": f"/analyze/{task_id}",
            },
            community=COMMUNITY,
            notes=notes,
            analyzed_at=utc_now(),
            analysis_time_ms=int((perf_counter() - started) * 1000),
        )
        task.status = "complete"
        task.result = result
        await _push_step(task, store, "complete", 100, t(language, "Consulta por hash concluida.", "Hash lookup complete."))
        task.result.steps = task.steps
        await store.save(task)
    except Exception as exc:
        task.status = "failed"
        task.error = str(exc)
        task.result = AnalysisResult(
            task_id=task_id,
            status="failed",
            community=COMMUNITY,
            steps=task.steps,
            error=str(exc),
        )
        await store.save(task)


async def _push_step(task, store: AnalysisStore, step: str, progress: int, message: str) -> None:
    task.steps.append(AnalysisStep(step=step, progress=progress, message=message, updated_at=utc_now()))
    await store.save(task)


async def _run_yara_scan(file_path: Path, language: str):
    return await asyncio.to_thread(yara_service.scan, file_path, language)


async def analyze_sample_from_disk(task_id: str, filename: str, source_path: str, store: AnalysisStore) -> None:
    file_path = Path(source_path)
    if not source_path or not file_path.exists():
        task = await store.get(task_id)
        if task:
            language = getattr(task, "language", "en")
            task.status = "failed"
            task.error = t(language, "Arquivo temporario indisponivel para analise estatica.", "Temporary file unavailable for static analysis.")
            task.result = AnalysisResult(
                task_id=task_id,
                status="failed",
                community=COMMUNITY,
                steps=task.steps,
                error=task.error,
            )
            await store.save(task)
        return
    content = file_path.read_bytes()
    await analyze_sample(task_id, filename, content, store)


def _build_virtual_file_metadata(*, name: str, artifact_type: str, content: bytes) -> FileMetadata:
    return FileMetadata(
        name=name,
        size=len(content),
        type=artifact_type,
        md5=hashlib.md5(content).hexdigest(),
        sha1=hashlib.sha1(content).hexdigest(),
        sha256=hashlib.sha256(content).hexdigest(),
        sha512=hashlib.sha512(content).hexdigest(),
        imphash=None,
        tlsh=None,
    )


def _build_hash_lookup_file_metadata(hash_value: str, language: str) -> FileMetadata:
    lower = hash_value.lower()
    md5 = lower if len(lower) == 32 else ""
    sha1 = lower if len(lower) == 40 else ""
    sha256 = lower if len(lower) == 64 else ""
    sha512 = lower if len(lower) == 128 else ""

    return FileMetadata(
        name=hash_value,
        size=0,
        type=t(language, "Consulta por hash", "Hash lookup"),
        md5=md5,
        sha1=sha1,
        sha256=sha256,
        sha512=sha512,
        imphash=None,
        tlsh=None,
    )


def _looks_like_sha256(hash_value: str) -> bool:
    return len(hash_value) == 64 and all(char in "0123456789abcdef" for char in hash_value.lower())


def _build_string_preview(all_strings: list[str], classified_strings: list[Indicator], limit: int = 80) -> list[str]:
    preview: list[str] = []
    seen: set[str] = set()

    for indicator in classified_strings:
        if indicator.value not in seen:
            seen.add(indicator.value)
            preview.append(indicator.value)
        if len(preview) >= limit:
            return preview

    for value in all_strings:
        if value not in seen:
            seen.add(value)
            preview.append(value)
        if len(preview) >= limit:
            break

    return preview
