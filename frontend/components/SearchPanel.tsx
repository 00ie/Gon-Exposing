"use client";

import Link from "next/link";
import { useState } from "react";

import { useLanguage } from "@/components/LanguageProvider";
import { searchScans, type ScanSummary } from "@/lib/api";


function SearchGlyph() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function formatHash(value?: string | null, taskId?: string) {
  const source = value ?? taskId ?? "";
  if (!source) {
    return "--";
  }

  return source.length > 18 ? `${source.slice(0, 18)}...` : source;
}

export function SearchPanel() {
  const { copy } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await searchScans(trimmed, 12);
      setResults(response);
    } catch (requestError) {
      setResults([]);
      setError(requestError instanceof Error ? requestError.message : copy.searchPanel.empty);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel rounded-[20px] p-6 md:p-8" id="pesquisa">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/45">{copy.searchPanel.eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{copy.searchPanel.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{copy.searchPanel.description}</p>
        </div>
        {searched ? (
          <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/55">
            {results.length} {copy.searchPanel.results}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <input
            className="w-full rounded-[10px] border border-white/10 bg-white/[0.03] px-5 py-4 pr-14 font-mono text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/20"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleSearch();
              }
            }}
            placeholder={copy.searchPanel.placeholder}
            type="text"
            value={query}
          />
          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-white/30">
            <SearchGlyph />
          </span>
        </div>

        <button
          className="rounded-[10px] bg-white px-6 py-4 font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90"
          onClick={() => void handleSearch()}
          type="button"
        >
          {loading ? copy.searchPanel.searching : copy.searchPanel.button}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

      <div className="mt-6 panel-alt overflow-hidden rounded-[16px]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-white/[0.018] text-left font-mono text-[12px] uppercase tracking-[0.14em] text-white/40">
                <th className="border-b border-white/8 px-5 py-4 font-normal">{copy.recentScans.columns.file}</th>
                <th className="border-b border-white/8 px-5 py-4 font-normal">{copy.recentScans.columns.hash}</th>
                <th className="border-b border-white/8 px-5 py-4 font-normal">{copy.recentScans.columns.family}</th>
                <th className="border-b border-white/8 px-5 py-4 font-normal">{copy.recentScans.columns.status}</th>
              </tr>
            </thead>
            <tbody>
              {!searched ? (
                <tr>
                  <td className="px-5 py-8 font-mono text-sm text-white/45" colSpan={4}>
                    {copy.searchPanel.idle}
                  </td>
                </tr>
              ) : results.length ? (
                results.map((row) => {
                  const statusLabel = row.classification
                    ? copy.common.risk[row.classification as keyof typeof copy.common.risk]
                    : copy.common.taskStatus[row.status as keyof typeof copy.common.taskStatus] ?? row.status;

                  return (
                    <tr key={row.task_id} className="text-sm text-white/85 transition hover:bg-white/[0.018]">
                      <td className="border-b border-white/6 px-5 py-5">
                        <Link className="font-mono text-base text-white transition hover:text-white/80" href={`/analyze/${row.task_id}`}>
                          {row.file_name}
                        </Link>
                      </td>
                      <td className="border-b border-white/6 px-5 py-5 font-mono text-sm text-white/45">
                        {formatHash(row.file_hash, row.task_id)}
                      </td>
                      <td className="border-b border-white/6 px-5 py-5 font-mono text-sm uppercase text-white/45">
                        {row.family ?? copy.recentScans.unknown}
                      </td>
                      <td className="border-b border-white/6 px-5 py-5 font-mono text-xs uppercase tracking-[0.12em] text-white/60">
                        {statusLabel}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-5 py-8 font-mono text-sm text-white/45" colSpan={4}>
                    {copy.searchPanel.empty}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
