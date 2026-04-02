"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useLanguage } from "@/components/LanguageProvider";
import { ScanSummary, getPublicFeed } from "@/lib/api";

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

  return source.length > 18 ? `${source.slice(0, 18)}...` : source;
}

function getStatusTone(classification?: string | null) {
  if (classification === "CRITICAL") {
    return "text-red-300 border-red-400/20 bg-red-400/10";
  }

  if (classification === "HIGH") {
    return "text-amber-200 border-amber-300/20 bg-amber-300/10";
  }

  return "text-white/65 border-white/10 bg-white/[0.03]";
}

export default function ReportsPage() {
  const { language, copy } = useLanguage();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<ScanSummary[]>([]);
  const [classification, setClassification] = useState<"ALL" | "HIGH" | "CRITICAL">("ALL");
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadFeed(search = "") {
    setLoading(true);
    try {
      const response = await getPublicFeed(search, 60);
      setRows(response);
      setError(null);
      setVisibleCount(12);
    } catch (requestError) {
      setRows([]);
      setError(requestError instanceof Error ? requestError.message : language === "pt-BR" ? "Falha ao carregar o feed." : "Failed to load the feed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadFeed();
  }, []);

  const filteredRows = rows.filter((row) => classification === "ALL" || row.classification === classification);
  const visibleRows = filteredRows.slice(0, visibleCount);
  const criticalCount = rows.filter((row) => row.classification === "CRITICAL").length;
  const highCount = rows.filter((row) => row.classification === "HIGH").length;
  const familyCount = new Set(rows.map((row) => row.family).filter(Boolean)).size;

  return (
    <main className="min-h-screen bg-ink text-white">
      <SiteHeader />

      <section className="mx-auto max-w-[1180px] px-5 py-10 md:px-8">
        <div className="mx-auto max-w-[1080px]">
          <div className="panel rounded-[24px] p-8 md:p-10">
            <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">
              {language === "pt-BR" ? "Feed publico" : "Public feed"}
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-white md:text-5xl">
              {language === "pt-BR" ? "Relatorios pesquisaveis de ameacas detectadas" : "Searchable reports for detected threats"}
            </h1>
            <p className="mt-5 max-w-4xl text-sm leading-8 text-white/62">
              {language === "pt-BR"
                ? "Esta area publica expoe apenas os relatorios indexados com risco alto, sem armazenar ou redistribuir o executavel enviado. O objetivo e facilitar pesquisa, compartilhamento e triagem comunitaria."
                : "This public area exposes only indexed high-risk reports without storing or redistributing the uploaded executable. The goal is to make research, sharing, and community triage easier."}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[18px] border border-white/10 bg-white/[0.02] p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/38">
                  {language === "pt-BR" ? "Criticos" : "Critical"}
                </div>
                <div className="mt-4 font-mono text-3xl text-white">{criticalCount}</div>
                <p className="mt-3 text-sm leading-7 text-white/62">{language === "pt-BR" ? "Relatorios com classificacao CRITICAL expostos no feed publico." : "Reports classified as CRITICAL exposed in the public feed."}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/[0.02] p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/38">
                  {language === "pt-BR" ? "Altos" : "High"}
                </div>
                <div className="mt-4 font-mono text-3xl text-white">{highCount}</div>
                <p className="mt-3 text-sm leading-7 text-white/62">{language === "pt-BR" ? "Relatorios com classificacao HIGH, uteis para pesquisa e contexto." : "Reports classified as HIGH, useful for research and context."}</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/[0.02] p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/38">
                  {language === "pt-BR" ? "Familias" : "Families"}
                </div>
                <div className="mt-4 font-mono text-3xl text-white">{familyCount}</div>
                <p className="mt-3 text-sm leading-7 text-white/62">{language === "pt-BR" ? "Familias distintas visiveis no feed atual, sem depender do binario original." : "Distinct families visible in the current feed without depending on the original binary."}</p>
              </div>
            </div>
          </div>

          <section className="mt-8 panel rounded-[22px] p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">
                  {copy.header.search}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {language === "pt-BR" ? "Pesquisar no feed publico" : "Search the public feed"}
                </h2>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/55">
                {filteredRows.length} {language === "pt-BR" ? "visiveis" : "visible"}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 xl:flex-row">
              <input
                className="w-full flex-1 rounded-[10px] border border-white/10 bg-white/[0.03] px-5 py-4 font-mono text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/20"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void loadFeed(query);
                  }
                }}
                placeholder={language === "pt-BR" ? "Nome, hash, familia, dominio ou IOC" : "Name, hash, family, domain, or IOC"}
                type="text"
                value={query}
              />
              <div className="grid grid-cols-3 gap-2 xl:w-[340px]">
                <button
                  className={`rounded-[10px] border px-4 py-4 font-mono text-[12px] uppercase tracking-[0.16em] transition ${
                    classification === "ALL" ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                  }`}
                  onClick={() => {
                    setClassification("ALL");
                    setVisibleCount(12);
                  }}
                  type="button"
                >
                  {language === "pt-BR" ? "TODOS" : "ALL"}
                </button>
                <button
                  className={`rounded-[10px] border px-4 py-4 font-mono text-[12px] uppercase tracking-[0.16em] transition ${
                    classification === "HIGH" ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                  }`}
                  onClick={() => {
                    setClassification("HIGH");
                    setVisibleCount(12);
                  }}
                  type="button"
                >
                  HIGH
                </button>
                <button
                  className={`rounded-[10px] border px-4 py-4 font-mono text-[12px] uppercase tracking-[0.16em] transition ${
                    classification === "CRITICAL" ? "border-white bg-white text-black" : "border-white/10 bg-white/[0.03] text-white/60 hover:text-white"
                  }`}
                  onClick={() => {
                    setClassification("CRITICAL");
                    setVisibleCount(12);
                  }}
                  type="button"
                >
                  CRITICAL
                </button>
              </div>
              <button
                className="rounded-[10px] bg-white px-6 py-4 font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90"
                onClick={() => void loadFeed(query)}
                type="button"
              >
                {loading ? (language === "pt-BR" ? "CARREGANDO..." : "LOADING...") : copy.searchPanel.button}
              </button>
            </div>

            {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

            <div className="mt-6 overflow-hidden rounded-[16px] border border-white/8">
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
                    {visibleRows.length ? (
                      visibleRows.map((row) => (
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
                          <td className="border-b border-white/6 px-5 py-5">
                            <span className={`inline-flex rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] ${getStatusTone(row.classification)}`}>
                              {row.classification ?? row.status}
                            </span>
                          </td>
                          <td className="border-b border-white/6 px-5 py-5 text-right font-mono text-sm text-white/45">
                            {formatRelativeTime(row.created_at, language)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-5 py-8 font-mono text-sm text-white/45" colSpan={5}>
                          {loading
                            ? (language === "pt-BR" ? "Carregando relatorios publicos..." : "Loading public reports...")
                            : (language === "pt-BR" ? "Nenhum relatorio publico encontrado." : "No public reports found.")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredRows.length > visibleRows.length ? (
              <div className="mt-5 flex justify-center">
                <button
                  className="rounded-[10px] border border-white/10 px-5 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-white/70 transition hover:border-white/20 hover:text-white"
                  onClick={() => setVisibleCount((current) => current + 12)}
                  type="button"
                >
                  {language === "pt-BR" ? "CARREGAR MAIS" : "LOAD MORE"}
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
