export type QueueResponse = {
  task_id: string;
  status: string;
  estimated_time_seconds: number;
  websocket_url: string;
};

export type AnalysisStep = {
  step: string;
  progress: number;
  message: string;
  updated_at: string;
};

export type Indicator = {
  value: string;
  type: string;
  confidence: number;
  platform?: string | null;
  status?: string | null;
  risk?: string | null;
  details?: Record<string, unknown>;
};

export type MitreTechnique = {
  id: string;
  name: string;
  tactic: string;
};

export type BehaviorFinding = {
  name: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  evidence: string[];
  category: string;
  mitre: MitreTechnique[];
};

export type ScoreFactor = {
  name: string;
  weight: number;
  evidence: string[];
};

export type ScanSummary = {
  task_id: string;
  status: string;
  file_name: string;
  file_type?: string | null;
  file_hash?: string | null;
  score?: number | null;
  classification?: string | null;
  family?: string | null;
  created_at: string;
  owner_email?: string | null;
};

export type LanguageCode = "pt-BR" | "en";

export type AnalysisResult = {
  task_id: string;
  status: string;
  file?: {
    name: string;
    size: number;
    type: string;
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
    imphash?: string | null;
  };
  score?: {
    value: number;
    classification: string;
    factors: ScoreFactor[];
  };
  family?: {
    name: string;
    confidence: number;
    support_level: string;
    detection_method: string;
    yara_rules: string[];
    summary?: string | null;
  } | null;
  iocs: Record<string, Indicator[]>;
  behaviors: BehaviorFinding[];
  pe?: {
    arch?: string | null;
    entry_point?: string | null;
    sections: {
      name: string;
      virtual_size: number;
      raw_size: number;
      raw_address: number;
      entropy: number;
      flags: string[];
      packed_suspect: boolean;
    }[];
    suspicious_imports: {
      dll: string;
      name: string;
      suspicious: boolean;
      description?: string | null;
    }[];
    packers: string[];
  } | null;
  strings?: {
    total: number;
    ascii_count: number;
    utf16_count: number;
    preview: string[];
    classified: Indicator[];
    classified_counts: Record<string, number>;
  };
  yara?: {
    enabled: boolean;
    engine: string;
    loaded_rules: number;
    note?: string | null;
    matches: {
      rule: string;
      namespace: string;
      tags: string[];
      meta: Record<string, unknown>;
      strings: string[];
      severity?: string | null;
    }[];
  } | null;
  enrichment?: {
    enabled: boolean;
    sources: string[];
    notes: string[];
    virustotal?: {
      available: boolean;
      malicious: number;
      suspicious: number;
      harmless: number;
      undetected: number;
      last_analysis_date?: string | null;
      permalink?: string | null;
      note?: string | null;
    } | null;
    malwarebazaar?: {
      available: boolean;
      sha256_hash?: string | null;
      signature?: string | null;
      file_type?: string | null;
      first_seen?: string | null;
      tags: string[];
      note?: string | null;
    } | null;
    urlhaus: {
      indicator: string;
      status: string;
      threat?: string | null;
      reference?: string | null;
      note?: string | null;
    }[];
  } | null;
  reports_submitted: {
    platform: string;
    target: string;
    channel: string;
    status: string;
    guidance: string;
    official_url?: string | null;
  }[];
  steps: AnalysisStep[];
  links: {
    virustotal?: string | null;
    malwarebazaar?: string | null;
    share_path?: string | null;
  };
  community: {
    discord_server: string;
    discord_handle: string;
    github: string;
    telegram: string;
  };
  notes: string[];
  analyzed_at?: string | null;
  analysis_time_ms?: number | null;
  error?: string | null;
};

export const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function normalizeLanguage(value: string | null | undefined): LanguageCode | null {
  if (value === "en" || value === "pt-BR") {
    return value;
  }
  return null;
}

function readLanguageCookie(): LanguageCode | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("gon-language="));

  if (!match) {
    return null;
  }

  return normalizeLanguage(decodeURIComponent(match.split("=").slice(1).join("=")));
}

function getPreferredLanguage(): LanguageCode {
  if (typeof window !== "undefined") {
    const saved = normalizeLanguage(window.localStorage.getItem("gon-language"));
    if (saved) {
      return saved;
    }
  }

  const cookieLanguage = readLanguageCookie();
  if (cookieLanguage) {
    return cookieLanguage;
  }

  return normalizeLanguage(typeof document !== "undefined" ? document.documentElement.lang : null) ?? "en";
}

function localize(pt: string, en: string): string {
  return getPreferredLanguage() === "en" ? en : pt;
}

function buildLanguageHeaders(): HeadersInit {
  return {
    "Accept-Language": getPreferredLanguage()
  };
}

export async function queueAnalysis(file: File): Promise<QueueResponse> {
  const payload = new FormData();
  payload.append("file", file);

  try {
    const response = await fetch(`${apiBase}/api/v1/analyze/file`, {
      method: "POST",
      body: payload,
      headers: buildLanguageHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: localize("Falha no envio do arquivo.", "File upload failed.") }));
      throw new Error(error.detail ?? localize("Falha no envio do arquivo.", "File upload failed."));
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        error.message === "Failed to fetch"
          ? localize(
              `Nao consegui conectar ao backend em ${apiBase}. Inicie a API e reinicie o frontend se mudou NEXT_PUBLIC_API_URL.`,
              `I could not connect to the backend at ${apiBase}. Start the API and restart the frontend if NEXT_PUBLIC_API_URL changed.`
            )
          : error.message
      );
    }

    throw new Error(localize(`Nao consegui conectar ao backend em ${apiBase}.`, `I could not connect to the backend at ${apiBase}.`));
  }
}

export async function queueUrlAnalysis(url: string): Promise<QueueResponse> {
  try {
    const response = await fetch(`${apiBase}/api/v1/analyze/url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildLanguageHeaders()
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: localize("Falha ao analisar a URL.", "Failed to analyze the URL.") }));
      throw new Error(error.detail ?? localize("Falha ao analisar a URL.", "Failed to analyze the URL."));
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        error.message === "Failed to fetch"
          ? localize(
              `Nao consegui conectar ao backend em ${apiBase}. Inicie a API e reinicie o frontend se mudou NEXT_PUBLIC_API_URL.`,
              `I could not connect to the backend at ${apiBase}. Start the API and restart the frontend if NEXT_PUBLIC_API_URL changed.`
            )
          : error.message
      );
    }

    throw new Error(localize(`Nao consegui conectar ao backend em ${apiBase}.`, `I could not connect to the backend at ${apiBase}.`));
  }
}

export async function queueHashAnalysis(hash: string): Promise<QueueResponse> {
  try {
    const response = await fetch(`${apiBase}/api/v1/analyze/hash`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildLanguageHeaders()
      },
      body: JSON.stringify({ hash })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: localize("Falha ao consultar o hash.", "Failed to look up the hash.") }));
      throw new Error(error.detail ?? localize("Falha ao consultar o hash.", "Failed to look up the hash."));
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        error.message === "Failed to fetch"
          ? localize(
              `Nao consegui conectar ao backend em ${apiBase}. Inicie a API e reinicie o frontend se mudou NEXT_PUBLIC_API_URL.`,
              `I could not connect to the backend at ${apiBase}. Start the API and restart the frontend if NEXT_PUBLIC_API_URL changed.`
            )
          : error.message
      );
    }

    throw new Error(localize(`Nao consegui conectar ao backend em ${apiBase}.`, `I could not connect to the backend at ${apiBase}.`));
  }
}

export async function getAnalysis(taskId: string): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${apiBase}/api/v1/results/${taskId}`, {
      cache: "no-store",
      headers: buildLanguageHeaders()
    });

    if (!response.ok) {
      throw new Error(localize("Nao foi possivel carregar o resultado da analise.", "Could not load the analysis result."));
    }

    return response.json();
  } catch {
    throw new Error(localize(`Nao foi possivel carregar o resultado da analise em ${apiBase}.`, `Could not load the analysis result from ${apiBase}.`));
  }
}

export async function getRecentScans(limit = 10): Promise<ScanSummary[]> {
  try {
    const response = await fetch(`${apiBase}/api/v1/scans/recent?limit=${limit}`, {
      cache: "no-store",
      headers: buildLanguageHeaders()
    });

    if (!response.ok) {
      throw new Error(localize("Nao foi possivel carregar as analises recentes.", "Could not load recent analyses."));
    }

    return response.json();
  } catch {
    throw new Error(localize(`Nao foi possivel carregar as analises recentes em ${apiBase}.`, `Could not load recent analyses from ${apiBase}.`));
  }
}

export async function searchScans(query: string, limit = 20): Promise<ScanSummary[]> {
  try {
    const response = await fetch(`${apiBase}/api/v1/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
      cache: "no-store",
      headers: buildLanguageHeaders()
    });

    if (!response.ok) {
      throw new Error(localize("Nao foi possivel pesquisar no indice.", "Could not search the index."));
    }

    return response.json();
  } catch {
    throw new Error(localize(`Nao foi possivel pesquisar no indice em ${apiBase}.`, `Could not search the index at ${apiBase}.`));
  }
}

export async function getPublicFeed(query = "", limit = 24): Promise<ScanSummary[]> {
  const search = query.trim();
  const suffix = search ? `?q=${encodeURIComponent(search)}&limit=${limit}` : `?limit=${limit}`;

  try {
    const response = await fetch(`${apiBase}/api/v1/feed${suffix}`, {
      cache: "no-store",
      headers: buildLanguageHeaders()
    });

    if (!response.ok) {
      throw new Error(localize("Nao foi possivel carregar o feed publico.", "Could not load the public feed."));
    }

    return response.json();
  } catch {
    throw new Error(localize(`Nao foi possivel carregar o feed publico em ${apiBase}.`, `Could not load the public feed from ${apiBase}.`));
  }
}

export function getWebSocketUrl(path: string): string {
  const base = apiBase.replace(/^http/, "ws");
  return `${base}${path}`;
}
