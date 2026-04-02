"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { useLanguage } from "@/components/LanguageProvider";
import { ScanSummary, getRecentScans } from "@/lib/api";


function formatRelativeTime(createdAt: string, language: string) {
  const timestamp = Date.parse(createdAt);
  if (Number.isNaN(timestamp)) {
    return "--";
  }

  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(language === "pt-BR" ? "pt-BR" : "en", { numeric: "auto" });
  const absSeconds = Math.abs(seconds);

  if (absSeconds < 3600) {
    return rtf.format(Math.round(seconds / 60), "minute");
  }

  if (absSeconds < 86400) {
    return rtf.format(Math.round(seconds / 3600), "hour");
  }

  return rtf.format(Math.round(seconds / 86400), "day");
}

function formatHash(value?: string | null, taskId?: string) {
  const source = value ?? taskId ?? "";
  if (!source) {
    return "--";
  }

  return source.length > 16 ? `${source.slice(0, 16)}...` : source;
}

function getStatusTone(classification?: string | null) {
  if (classification === "CLEAN") {
    return {
      dot: "bg-[#3dd68c]",
      text: "CLEAN"
    };
  }

  if (classification === "HIGH" || classification === "CRITICAL") {
    return {
      dot: "bg-[#ef4444]",
      text: "MALICIOUS"
    };
  }

  return {
    dot: "bg-[#eab308]",
    text: "UNSURE"
  };
}

export function RecentScans() {
  const { language, copy } = useLanguage();
  const [rows, setRows] = useState<ScanSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const scans = await getRecentScans(12);
        if (active) {
          setRows(scans);
          setError(null);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : language === "pt-BR" ? "Falha ao carregar as analises." : "Failed to load analyses.");
        }
      }
    }

    void load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [language]);

  return (
    <CollapsiblePanel
      badge={
        <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
          {rows.length} {copy.recentScans.rows}
        </div>
      }
      eyebrow={copy.recentScans.eyebrow}
      title={copy.recentScans.title}
    >
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="panel mt-6 overflow-hidden rounded-[16px]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-white/[0.018] text-left font-mono text-[12px] uppercase tracking-[0.14em] text-white/40">
                <th className="border-b border-white/8 px-5 py-4 font-normal">{copy.recentScans.columns.file}</th>
                <th className="border-b border-white/8 px-5 py-4 font-normal">{copy.recentScans.columns.hash}</th>
                <th className="border-b border-white/8 px-5 py-4 font-normal">{copy.recentScans.columns.family}</th>
                <th className="border-b border-white/8 px-5 py-4 font-normal">{copy.recentScans.columns.status}</th>
                <th className="border-b border-white/8 px-5 py-4 font-normal text-right">{copy.recentScans.columns.time}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => {
                  const status = getStatusTone(row.classification);
                  const statusLabel =
                    status.text === "CLEAN"
                      ? copy.recentScans.statusText.clean
                      : status.text === "MALICIOUS"
                        ? copy.recentScans.statusText.malicious
                        : copy.recentScans.statusText.unsure;

                  return (
                    <tr key={row.task_id} className="text-sm text-white/85 transition hover:bg-white/[0.018]">
                      <td className="border-b border-white/6 px-5 py-5">
                        <Link className="font-mono text-lg text-white transition hover:text-white/80" href={`/analyze/${row.task_id}`}>
                          {row.file_name}
                        </Link>
                      </td>
                      <td className="border-b border-white/6 px-5 py-5 font-mono text-sm text-white/45">
                        {formatHash(row.file_hash, row.task_id)}
                      </td>
                      <td className="border-b border-white/6 px-5 py-5 font-mono text-sm uppercase text-white/45">
                        {row.family ?? copy.recentScans.unknown}
                      </td>
                      <td className="border-b border-white/6 px-5 py-5">
                        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-white/58">
                          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                          {statusLabel}
                        </span>
                      </td>
                      <td className="border-b border-white/6 px-5 py-5 text-right font-mono text-sm text-white/45">
                        {formatRelativeTime(row.created_at, language)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-5 py-8 font-mono text-sm text-white/45" colSpan={5}>
                    {copy.recentScans.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
