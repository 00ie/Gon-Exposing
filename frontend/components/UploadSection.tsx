"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/components/LanguageProvider";
import { checkApiHealth, queueAnalysis, queueHashAnalysis, queueUrlAnalysis } from "@/lib/api";


type UploadMode = "file" | "url" | "hash";

type TabConfig = {
  id: UploadMode;
  icon: ReactNode;
};

function FileGlyph() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M8 3.75h5.5L19 9.25V20H8V3.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M13 3.75v5.5h6" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function LinkGlyph() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M10.5 13.5 13.5 10.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M8.25 15.75H7a4 4 0 1 1 0-8h1.25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M15.75 8.25H17a4 4 0 1 1 0 8h-1.25" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function HashGlyph() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M9 4 7 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M17 4 15 20" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M4 9h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M3 15h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function UploadGlyph() {
  return (
    <svg aria-hidden="true" className="h-10 w-10" fill="none" viewBox="0 0 24 24">
      <path d="M12 15V5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="m8 9 4-4 4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M5 15.75V19h14v-3.25" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function SearchGlyph() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const tabs: TabConfig[] = [
  { id: "file", icon: <FileGlyph /> },
  { id: "url", icon: <LinkGlyph /> },
  { id: "hash", icon: <HashGlyph /> }
];

function looksLikeHash(value: string) {
  return /^[A-Fa-f0-9]{16,128}$/.test(value);
}

export function UploadSection() {
  const { copy } = useLanguage();
  const router = useRouter();
  const lastSubmitRef = useRef(0);
  const [mode, setMode] = useState<UploadMode>("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");
  const submitCooldownMs = 2000;

  const actionLabel = useMemo(() => {
    if (mode === "url") {
      return copy.upload.actions.url;
    }

    if (mode === "hash") {
      return copy.upload.actions.hash;
    }

    return copy.upload.actions.file;
  }, [copy.upload.actions.file, copy.upload.actions.hash, copy.upload.actions.url, mode]);

  useEffect(() => {
    let active = true;

    async function checkApi() {
      const isOnline = await checkApiHealth();
      if (active) {
        setApiStatus(isOnline ? "online" : "offline");
      }
    }

    void checkApi();
    const intervalId = window.setInterval(() => {
      void checkApi();
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  function markSubmitAttempt() {
    const now = Date.now();
    if (now - lastSubmitRef.current < submitCooldownMs) {
      setError(copy.upload.errors.submissionFailed);
      return false;
    }
    lastSubmitRef.current = now;
    return true;
  }

  async function handleFileSubmit() {
    if (!selectedFile) {
      setError(copy.upload.errors.fileRequired);
      return;
    }

    if (!markSubmitAttempt()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queued = await queueAnalysis(selectedFile);
      router.push(`/analyze/${queued.task_id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : copy.upload.errors.submissionFailed);
    } finally {
      setLoading(false);
    }
  }

  async function handleTextSubmit() {
    const trimmed = query.trim();

    if (!trimmed) {
      setError(mode === "url" ? copy.upload.errors.urlRequired : copy.upload.errors.hashRequired);
      return;
    }

    if (!markSubmitAttempt()) {
      return;
    }

    if (mode === "url") {
      try {
        const parsed = new URL(trimmed);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          setError(copy.upload.errors.urlInvalid);
          return;
        }
      } catch {
        setError(copy.upload.errors.urlInvalid);
        return;
      }
    }

    if (mode === "hash" && !looksLikeHash(trimmed)) {
      setError(copy.upload.errors.hashInvalid);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const queued = mode === "url" ? await queueUrlAnalysis(trimmed) : await queueHashAnalysis(trimmed);
      router.push(`/analyze/${queued.task_id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : copy.upload.errors.submissionFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel overflow-hidden rounded-[20px]">
      <div className="grid grid-cols-3 border-b border-white/8 bg-white/[0.015]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center justify-center gap-2 border-r border-white/8 px-4 py-4 font-mono text-[12px] uppercase tracking-[0.18em] transition last:border-r-0 ${
              mode === tab.id ? "bg-white/[0.045] text-white" : "text-white/45 hover:bg-white/[0.02] hover:text-white/80"
            }`}
            onClick={() => {
              setMode(tab.id);
              setError(null);
              setQuery("");
            }}
            type="button"
          >
            <span className="text-white/60">{tab.icon}</span>
            <span>
              {tab.id === "file" ? copy.upload.tabs.file : tab.id === "url" ? copy.upload.tabs.url : copy.upload.tabs.hash}
            </span>
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {mode === "file" ? (
          <div className="space-y-6">
            <label className="flex min-h-[290px] cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed border-white/10 bg-black/30 px-6 py-10 text-center transition hover:border-white/20">
              <span className="text-white/40">
                <UploadGlyph />
              </span>
              <span className="mt-8 font-mono text-xl text-white">
                {selectedFile ? selectedFile.name : copy.upload.fileDrop}
              </span>
              <span className="mt-3 font-mono text-[12px] uppercase tracking-[0.16em] text-white/35">
                {selectedFile ? `${formatBytes(selectedFile.size)} ${copy.upload.selected}` : copy.upload.maxSize}
              </span>
              <input
                className="hidden"
                type="file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </label>

            {selectedFile ? (
              <button
                className="w-full rounded-[10px] bg-white px-5 py-4 font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
                onClick={() => void handleFileSubmit()}
                type="button"
              >
                {loading ? copy.upload.actions.loading : actionLabel}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                className="w-full rounded-[10px] border border-white/10 bg-white/[0.03] px-5 py-4 pr-14 font-mono text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/20"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                maxLength={mode === "url" ? 4096 : 128}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleTextSubmit();
                  }
                }}
                placeholder={mode === "url" ? copy.upload.placeholders.url : copy.upload.placeholders.hash}
                spellCheck={false}
                type="text"
                value={query}
              />
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-white/30">
                <SearchGlyph />
              </span>
            </div>

            <button
              className="w-full rounded-[10px] bg-white px-5 py-4 font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              onClick={() => void handleTextSubmit()}
              type="button"
            >
              {loading ? copy.upload.actions.loading : actionLabel}
            </button>
          </div>
        )}

        <p className="mt-8 text-center font-mono text-[12px] text-white/42">
          {copy.upload.tos}
        </p>

        <p
          className={`mt-4 text-center font-mono text-[11px] uppercase tracking-[0.12em] ${
            apiStatus === "online"
              ? "text-emerald-300/70"
              : apiStatus === "offline"
                ? "text-red-300/80"
                : "text-white/35"
          }`}
        >
          {apiStatus === "online"
            ? copy.upload.apiOnline
            : apiStatus === "offline"
              ? copy.upload.apiOffline
              : copy.upload.apiChecking}
        </p>

        {error ? <p className="mt-4 text-center text-sm text-red-300">{error}</p> : null}
      </div>
    </section>
  );
}
