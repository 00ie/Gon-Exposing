from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


RiskLevel = Literal["CLEAN", "LOW", "MEDIUM", "HIGH", "CRITICAL"]
TaskStatus = Literal["queued", "running", "complete", "failed"]
DetectionMethod = Literal["signature", "heuristic", "manual", "unknown"]
SupportLevel = Literal["full", "detection_only", "heuristic", "unknown"]
Role = Literal["admin", "analyst"]
AuthMethod = Literal["jwt", "api_key", "anonymous"]
LanguageCode = Literal["pt-BR", "en"]


class AnalysisStep(BaseModel):
    step: str
    progress: int
    message: str
    updated_at: str


class FileMetadata(BaseModel):
    name: str
    size: int
    type: str
    md5: str
    sha1: str
    sha256: str
    sha512: str
    imphash: str | None = None
    tlsh: str | None = None


class ScoreFactor(BaseModel):
    name: str
    weight: int
    evidence: list[str] = Field(default_factory=list)


class ScoreSummary(BaseModel):
    value: int
    classification: RiskLevel
    factors: list[ScoreFactor] = Field(default_factory=list)


class MitreTechnique(BaseModel):
    id: str
    name: str
    tactic: str


class Indicator(BaseModel):
    value: str
    type: str
    confidence: float = 0.0
    platform: str | None = None
    status: str | None = None
    position: int | None = None
    risk: str | None = None
    details: dict[str, Any] = Field(default_factory=dict)


class BehaviorFinding(BaseModel):
    name: str
    description: str
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    evidence: list[str] = Field(default_factory=list)
    category: str
    mitre: list[MitreTechnique] = Field(default_factory=list)


class PESection(BaseModel):
    name: str
    virtual_size: int
    raw_size: int
    raw_address: int
    entropy: float
    flags: list[str] = Field(default_factory=list)
    packed_suspect: bool = False


class ImportFunction(BaseModel):
    dll: str
    name: str
    suspicious: bool = False
    description: str | None = None


class PESignature(BaseModel):
    present: bool = False
    valid: bool | None = None
    subject: str | None = None
    issuer: str | None = None


class PEAnalysis(BaseModel):
    arch: str | None = None
    entry_point: str | None = None
    sections: list[PESection] = Field(default_factory=list)
    imports: list[ImportFunction] = Field(default_factory=list)
    exports: list[str] = Field(default_factory=list)
    signature: PESignature = Field(default_factory=PESignature)
    suspicious_imports: list[ImportFunction] = Field(default_factory=list)
    packers: list[str] = Field(default_factory=list)


class FamilyMatch(BaseModel):
    name: str
    confidence: float
    support_level: SupportLevel
    detection_method: DetectionMethod
    yara_rules: list[str] = Field(default_factory=list)
    summary: str | None = None


class ReportAction(BaseModel):
    platform: str
    target: str
    channel: str
    status: Literal["queued", "manual_review", "not_configured", "skipped"]
    guidance: str
    official_url: str | None = None


class StringSummary(BaseModel):
    total: int
    ascii_count: int
    utf16_count: int
    preview: list[str] = Field(default_factory=list)
    classified: list[Indicator] = Field(default_factory=list)
    classified_counts: dict[str, int] = Field(default_factory=dict)


class YaraMatch(BaseModel):
    rule: str
    namespace: str = "default"
    tags: list[str] = Field(default_factory=list)
    meta: dict[str, Any] = Field(default_factory=dict)
    strings: list[str] = Field(default_factory=list)
    severity: str | None = None


class YaraSummary(BaseModel):
    enabled: bool
    engine: str
    loaded_rules: int = 0
    matches: list[YaraMatch] = Field(default_factory=list)
    note: str | None = None


class VirusTotalSummary(BaseModel):
    available: bool = False
    malicious: int = 0
    suspicious: int = 0
    harmless: int = 0
    undetected: int = 0
    last_analysis_date: str | None = None
    permalink: str | None = None
    note: str | None = None


class MalwareBazaarSummary(BaseModel):
    available: bool = False
    sha256_hash: str | None = None
    signature: str | None = None
    file_type: str | None = None
    first_seen: str | None = None
    tags: list[str] = Field(default_factory=list)
    note: str | None = None


class UrlhausHit(BaseModel):
    indicator: str
    status: str
    threat: str | None = None
    reference: str | None = None
    note: str | None = None


class ThreatEnrichment(BaseModel):
    enabled: bool = False
    sources: list[str] = Field(default_factory=list)
    virustotal: VirusTotalSummary | None = None
    malwarebazaar: MalwareBazaarSummary | None = None
    urlhaus: list[UrlhausHit] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)


class ResultLinks(BaseModel):
    virustotal: str | None = None
    malwarebazaar: str | None = None
    share_path: str | None = None


class CommunityContact(BaseModel):
    discord_server: str
    discord_handle: str
    github: str
    telegram: str


class AnalysisResult(BaseModel):
    task_id: str
    status: TaskStatus
    file: FileMetadata | None = None
    score: ScoreSummary | None = None
    family: FamilyMatch | None = None
    iocs: dict[str, list[Indicator]] = Field(default_factory=dict)
    behaviors: list[BehaviorFinding] = Field(default_factory=list)
    pe: PEAnalysis | None = None
    strings: StringSummary | None = None
    yara: YaraSummary | None = None
    enrichment: ThreatEnrichment | None = None
    reports_submitted: list[ReportAction] = Field(default_factory=list)
    steps: list[AnalysisStep] = Field(default_factory=list)
    links: ResultLinks = Field(default_factory=ResultLinks)
    community: CommunityContact
    notes: list[str] = Field(default_factory=list)
    analyzed_at: str | None = None
    analysis_time_ms: int | None = None
    error: str | None = None


class QueueResponse(BaseModel):
    task_id: str
    status: TaskStatus
    estimated_time_seconds: int
    websocket_url: str


class UserSummary(BaseModel):
    id: str
    email: str
    display_name: str
    role: Role
    created_at: str


class AuthBootstrapRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=2, max_length=80)
    bootstrap_token: str


class AuthRegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    display_name: str = Field(min_length=2, max_length=80)


class AuthLoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)


class UrlAnalysisRequest(BaseModel):
    url: str = Field(min_length=8, max_length=4096)


class HashAnalysisRequest(BaseModel):
    hash: str = Field(min_length=16, max_length=128)


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_at: str
    user: UserSummary


class ApiKeyCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)


class ApiKeySummary(BaseModel):
    id: str
    name: str
    prefix: str
    created_at: str
    last_used_at: str | None = None
    revoked_at: str | None = None


class ApiKeyCreateResponse(BaseModel):
    api_key: str
    key: ApiKeySummary


class ScanSummary(BaseModel):
    task_id: str
    status: TaskStatus
    file_name: str
    file_type: str | None = None
    file_hash: str | None = None
    score: int | None = None
    classification: RiskLevel | None = None
    family: str | None = None
    created_at: str
    owner_email: str | None = None


class StoredTask(BaseModel):
    task_id: str
    status: TaskStatus
    created_at: str
    updated_at: str
    source_name: str
    source_path: str
    client_ip: str | None = None
    owner_user_id: str | None = None
    owner_email: str | None = None
    auth_method: AuthMethod = "anonymous"
    language: LanguageCode = "en"
    steps: list[AnalysisStep] = Field(default_factory=list)
    result: AnalysisResult | None = None
    error: str | None = None
