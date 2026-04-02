"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { BehaviorList } from "@/components/BehaviorList";
import { AnalysisLearnPanel } from "@/components/AnalysisLearnPanel";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { CopyValueButton } from "@/components/CopyValueButton";
import { IntelPanel } from "@/components/IntelPanel";
import { IocList } from "@/components/IocList";
import { ProgressStream } from "@/components/ProgressStream";
import { RecommendedActionPanel } from "@/components/RecommendedActionPanel";
import { ScoreCard } from "@/components/ScoreCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThreatOverview } from "@/components/ThreatOverview";
import { YaraPanel } from "@/components/YaraPanel";
import { useLanguage } from "@/components/LanguageProvider";
import { AnalysisResult, getAnalysis, getWebSocketUrl } from "@/lib/api";
import { site } from "@/lib/site";


const fallbackCommunity = {
  discord_server: "https://discord.gg/2asv4rEhGh",
  discord_handle: "tlwm",
  github: "https://github.com/00ie",
  telegram: "https://t.me/feicoes"
};

export default function AnalysisPage() {
  const { copy, language } = useLanguage();
  const params = useParams<{ id: string }>();
  const taskId = params.id;
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamNotice, setStreamNotice] = useState<string | null>(null);
  const isFinished = result?.status === "complete" || result?.status === "failed";

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await getAnalysis(taskId);
        if (active) {
          setResult(response);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : copy.analysis.loadError);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [copy.analysis.loadError, taskId]);

  useEffect(() => {
    if (!streamNotice || isFinished) {
      return;
    }

    let active = true;

    async function load() {
      try {
        const response = await getAnalysis(taskId);
        if (active) {
          setResult(response);
          setError(null);
          if (response.status === "complete" || response.status === "failed") {
            setStreamNotice(null);
          }
        }
      } catch (requestError) {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : copy.analysis.loadError);
        }
      }
    }

    void load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, 8000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [copy.analysis.loadError, isFinished, streamNotice, taskId]);

  useEffect(() => {
    if (isFinished) {
      return;
    }

    let active = true;
    const socket = new WebSocket(getWebSocketUrl(`/ws/analysis/${taskId}`));

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { result?: AnalysisResult; status?: string; steps?: AnalysisResult["steps"] };
      if (!active) {
        return;
      }

      setStreamNotice(null);
      setResult((current) => ({
        ...(current ?? {
          task_id: taskId,
          status: payload.status ?? "running",
          iocs: {},
          behaviors: [],
          reports_submitted: [],
          steps: [],
          links: {},
          community: fallbackCommunity,
          notes: []
        }),
        ...(payload.result ?? {}),
        status: payload.status ?? current?.status ?? "running",
        steps: payload.steps ?? current?.steps ?? []
      }));
    };

    socket.onerror = () => {
      if (active) {
        setStreamNotice(copy.analysis.streamUnavailable);
      }
    };

    socket.onclose = (event) => {
      if (!active) {
        return;
      }

      if (!event.wasClean && event.code !== 1000) {
        setStreamNotice(copy.analysis.streamUnavailable);
      }
    };

    return () => {
      active = false;
      socket.close();
    };
  }, [copy.analysis.streamUnavailable, isFinished, taskId]);

  const groupedIocs = useMemo(
    () => ({
      webhooks: result?.iocs.webhooks ?? [],
      telegram: result?.iocs.telegram ?? [],
      urls: result?.iocs.urls ?? [],
      ips: result?.iocs.ips ?? [],
      domains: result?.iocs.domains ?? [],
      tokens: result?.iocs.tokens ?? [],
      paths: result?.iocs.paths ?? []
    }),
    [result]
  );
  const statusLabel = result?.status
    ? copy.common.taskStatus[result.status as keyof typeof copy.common.taskStatus] ?? result.status
    : copy.analysis.loading;
  const actionStatusLabel = (value: string) => {
    if (value === "manual_review") {
      return language === "pt-BR" ? "revisao manual" : "manual review";
    }
    if (value === "queued") {
      return copy.common.taskStatus.queued;
    }
    if (value === "skipped") {
      return language === "pt-BR" ? "ignorado" : "skipped";
    }
    if (value === "not_configured") {
      return language === "pt-BR" ? "nao configurado" : "not configured";
    }
    return value;
  };
  const stringCategoryLabel = (value: string) => {
    const ptMap: Record<string, string> = {
      webhooks: "Webhooks",
      telegram: "Telegram",
      telegram_tokens: "Tokens Telegram",
      telegram_chat_ids: "Chat IDs Telegram",
      urls: "URLs",
      ips: "IPs",
      tokens: "Tokens",
      registry: "Registro",
      paths: "Caminhos",
      powershell: "PowerShell",
      emails: "Emails",
      encoded: "Codificado",
    };
    const enMap: Record<string, string> = {
      webhooks: "Webhooks",
      telegram: "Telegram",
      telegram_tokens: "Telegram tokens",
      telegram_chat_ids: "Telegram chat IDs",
      urls: "URLs",
      ips: "IPs",
      tokens: "Tokens",
      registry: "Registry",
      paths: "Paths",
      powershell: "PowerShell",
      emails: "Emails",
      encoded: "Encoded",
    };
    return (language === "pt-BR" ? ptMap : enMap)[value] ?? value;
  };
  const groupedClassifiedStrings = useMemo(() => {
    const buckets = new Map<string, { label: string; values: string[] }>();
    for (const item of result?.strings?.classified ?? []) {
      const key = item.type;
      const current = buckets.get(key) ?? { label: stringCategoryLabel(key), values: [] };
      if (!current.values.includes(item.value)) {
        current.values.push(item.value);
      }
      buckets.set(key, current);
    }
    return Array.from(buckets.entries()).map(([key, value]) => ({
      key,
      label: value.label,
      values: value.values.slice(0, 12),
      count: result?.strings?.classified_counts?.[key] ?? value.values.length,
    }));
  }, [language, result?.strings?.classified, result?.strings?.classified_counts]);

  if (error && !result) {
    return (
      <main className="min-h-screen bg-ink text-white">
        <SiteHeader />
        <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-3xl items-center px-6">
          <div className="panel w-full rounded-3xl p-8">
            <p className="font-mono text-sm text-red-300">{error}</p>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="grid-background min-h-screen">
      <SiteHeader />

      <div className="mx-auto max-w-[1320px] px-6 py-8 md:px-8 lg:px-10">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link className="font-mono text-xs uppercase tracking-[0.3em] text-emerald-300/70" href="/">
              {copy.analysis.back}
            </Link>
            <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">
              {result?.file?.name ?? copy.analysis.queued}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              {copy.analysis.taskId}: <span className="font-mono text-white">{taskId}</span>
            </p>
          </div>
          <div className="panel-alt rounded-3xl px-5 py-4">
            <div className="text-xs uppercase tracking-[0.2em] text-white/50">{copy.analysis.status}</div>
            <div className="mt-2 font-mono text-lg text-white">{statusLabel}</div>
          </div>
        </header>

        <section className="mt-8">
          <ProgressStream steps={result?.steps ?? []} />
        </section>

        {streamNotice ? (
          <section className="mt-4">
            <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] text-amber-100/70">
              {streamNotice}
            </div>
          </section>
        ) : null}

        {result?.score ? (
          <section className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_0.75fr]">
            <ScoreCard result={result} />

            <section className="panel rounded-[22px] p-6">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/45">{copy.analysis.quickAccess}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{copy.analysis.quickAccess}</h2>

              <div className="mt-6 grid gap-3">
                {result.links.virustotal ? (
                  <a className="panel-alt rounded-[16px] px-4 py-3 transition hover:border-white/20" href={result.links.virustotal} target="_blank" rel="noreferrer">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">VirusTotal</div>
                    <div className="mt-2 font-mono text-sm text-white">{copy.analysis.openExternalReport}</div>
                  </a>
                ) : null}
                {result.links.malwarebazaar ? (
                  <a className="panel-alt rounded-[16px] px-4 py-3 transition hover:border-white/20" href={result.links.malwarebazaar} target="_blank" rel="noreferrer">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">MalwareBazaar</div>
                    <div className="mt-2 font-mono text-sm text-white">{copy.analysis.openSampleContext}</div>
                  </a>
                ) : null}
                <a className="panel-alt rounded-[16px] px-4 py-3 transition hover:border-white/20" href={site.server} target="_blank" rel="noreferrer">
                  <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">Discord</div>
                  <div className="mt-2 font-mono text-sm text-white">{site.discord}</div>
                </a>
                <div className="grid gap-3 sm:grid-cols-2">
                  <a className="panel-alt rounded-[16px] px-4 py-3 transition hover:border-white/20" href={site.github} target="_blank" rel="noreferrer">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">GitHub</div>
                    <div className="mt-2 font-mono text-sm text-white">{site.githubHandle}</div>
                  </a>
                  <a className="panel-alt rounded-[16px] px-4 py-3 transition hover:border-white/20" href={site.telegram} target="_blank" rel="noreferrer">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">Telegram</div>
                    <div className="mt-2 font-mono text-sm text-white">{site.telegramHandle}</div>
                  </a>
                </div>
              </div>
            </section>
          </section>
        ) : null}

        {result ? (
          <section className="mt-8">
            <ThreatOverview result={result} />
          </section>
        ) : null}

        {result ? (
          <section className="mt-8">
            <RecommendedActionPanel result={result} />
          </section>
        ) : null}

        {result?.file ? (
          <section className="mt-8">
            <CollapsiblePanel eyebrow={copy.analysis.overviewEyebrow} title={copy.analysis.overviewTitle}>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">{copy.analysis.type}</div>
                  <div className="mt-2 font-mono text-sm text-white">{result.file.type}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">SHA256</div>
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0 break-all font-mono text-sm text-white">{result.file.sha256}</div>
                    <CopyValueButton className="shrink-0" value={result.file.sha256} />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">MD5</div>
                  <div className="mt-2 flex items-start justify-between gap-3">
                    <div className="min-w-0 break-all font-mono text-sm text-white">{result.file.md5}</div>
                    <CopyValueButton className="shrink-0" value={result.file.md5} />
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">{copy.analysis.analysisTime}</div>
                  <div className="mt-2 font-mono text-sm text-white">{result.analysis_time_ms ?? 0} ms</div>
                </div>
              </div>
            </CollapsiblePanel>
          </section>
        ) : null}

        <section className="mt-8">
          <CollapsiblePanel
            defaultCollapsed={false}
            eyebrow={language === "pt-BR" ? "Detalhes tecnicos" : "Technical details"}
            title={language === "pt-BR" ? "IOC, destinos, strings e sinais tecnicos" : "IOC, destinations, strings, and technical signals"}
          >
            <div className="grid gap-8 lg:grid-cols-2">
              <IocList priority title={copy.analysis.iocTitles.webhooks} indicators={groupedIocs.webhooks} />
              <IocList priority title={copy.analysis.iocTitles.telegram} indicators={groupedIocs.telegram} />
              <IocList title={copy.analysis.iocTitles.tokens} indicators={groupedIocs.tokens} />
              <IocList title={copy.analysis.iocTitles.urls} indicators={groupedIocs.urls} />
              <IocList title={copy.analysis.iocTitles.domains} indicators={groupedIocs.domains} />
              <IocList title={copy.analysis.iocTitles.ips} indicators={groupedIocs.ips} />
              <IocList title={copy.analysis.iocTitles.paths} indicators={groupedIocs.paths} />
            </div>
          </CollapsiblePanel>
        </section>

        {result?.behaviors?.length ? (
          <section className="mt-8">
            <BehaviorList behaviors={result.behaviors} />
          </section>
        ) : null}

        {result?.yara ? (
          <section className="mt-8">
            <YaraPanel result={result} />
          </section>
        ) : null}

        {result?.enrichment ? (
          <section className="mt-8">
            <IntelPanel result={result} />
          </section>
        ) : null}

        {result ? (
          <section className="mt-8">
            <AnalysisLearnPanel result={result} />
          </section>
        ) : null}

        {result?.pe ? (
          <section className="mt-8">
            <CollapsiblePanel defaultCollapsed eyebrow={copy.analysis.pe.eyebrow} title={copy.analysis.pe.title}>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="panel-alt rounded-3xl p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">{copy.analysis.pe.packers}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(result.pe.packers.length ? result.pe.packers : [copy.analysis.pe.none]).map((packer, packerIndex) => (
                      <span key={`${packer}-${packerIndex}`} className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/70">
                        {packer}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="panel-alt rounded-3xl p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">{copy.analysis.pe.suspiciousImports}</div>
                  <div className="mt-3 space-y-2">
                    {result.pe.suspicious_imports.length ? result.pe.suspicious_imports.map((entry, entryIndex) => (
                      <div key={`${entry.dll}-${entry.name}-${entryIndex}`} className="rounded-2xl bg-black/20 p-3">
                        <div className="font-mono text-sm text-white">{entry.dll}!{entry.name}</div>
                        <div className="mt-1 text-sm text-slate-300">{entry.description}</div>
                      </div>
                    )) : <div className="text-sm text-slate-300">{copy.analysis.pe.noSuspiciousImports}</div>}
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-white/50">
                      <th className="border-b border-white/10 pb-3 pr-4">{copy.analysis.pe.section}</th>
                      <th className="border-b border-white/10 pb-3 pr-4">{copy.analysis.pe.virtual}</th>
                      <th className="border-b border-white/10 pb-3 pr-4">{copy.analysis.pe.raw}</th>
                      <th className="border-b border-white/10 pb-3 pr-4">{copy.analysis.pe.entropy}</th>
                      <th className="border-b border-white/10 pb-3">{copy.analysis.pe.flags}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.pe.sections.map((section, sectionIndex) => (
                      <tr key={`${section.name}-${sectionIndex}`} className="text-sm text-slate-200">
                        <td className="border-b border-white/5 py-3 pr-4 font-mono">{section.name}</td>
                        <td className="border-b border-white/5 py-3 pr-4 font-mono">{section.virtual_size}</td>
                        <td className="border-b border-white/5 py-3 pr-4 font-mono">{section.raw_size}</td>
                        <td className={`border-b border-white/5 py-3 pr-4 font-mono ${section.packed_suspect ? "text-red-300" : "text-slate-200"}`}>
                          {section.entropy}
                        </td>
                        <td className="border-b border-white/5 py-3 font-mono">{section.flags.join(", ") || copy.analysis.pe.na}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsiblePanel>
          </section>
        ) : null}

        {result?.reports_submitted?.length ? (
          <section className="mt-8">
            <CollapsiblePanel
              badge={
                <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
                  {result.reports_submitted.length} {copy.analysis.actions.count}
                </div>
              }
              defaultCollapsed
              eyebrow={copy.analysis.actions.eyebrow}
              title={copy.analysis.actions.title}
            >
              <div className="space-y-3">
                {result.reports_submitted.map((action, actionIndex) => (
                  <div key={`${action.platform}-${action.target}-${actionIndex}`} className="panel-alt rounded-3xl p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
                        {action.platform}
                      </span>
                      <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-mono text-xs text-amber-200">
                        {actionStatusLabel(action.status)}
                      </span>
                    </div>
                    <code className="mt-4 block overflow-x-auto rounded-2xl bg-black/30 p-3 text-xs text-slate-200">
                      {action.target}
                    </code>
                    <p className="mt-3 text-sm text-slate-300">{action.guidance}</p>
                    {action.official_url ? (
                      <a className="mt-3 inline-flex font-mono text-xs text-sky-300 hover:text-sky-200" href={action.official_url} target="_blank" rel="noreferrer">
                        {copy.analysis.actions.officialGuidance}
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </CollapsiblePanel>
          </section>
        ) : null}

        {result?.strings ? (
          <section className="mt-8">
            <CollapsiblePanel defaultCollapsed eyebrow={copy.analysis.strings.eyebrow} title={copy.analysis.strings.title}>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="panel-alt rounded-2xl p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">{copy.analysis.strings.total}</div>
                  <div className="mt-2 font-mono text-2xl text-white">{result.strings.total}</div>
                </div>
                <div className="panel-alt rounded-2xl p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">{copy.analysis.strings.ascii}</div>
                  <div className="mt-2 font-mono text-2xl text-white">{result.strings.ascii_count}</div>
                </div>
                <div className="panel-alt rounded-2xl p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/50">{copy.analysis.strings.utf16}</div>
                  <div className="mt-2 font-mono text-2xl text-white">{result.strings.utf16_count}</div>
                </div>
              </div>
              <div className="mt-6 max-h-96 overflow-auto rounded-3xl bg-black/30 p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-slate-300">
                  {result.strings.preview.join("\n")}
                </pre>
              </div>
              {groupedClassifiedStrings.length ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {groupedClassifiedStrings.map((group) => (
                    <div key={group.key} className="panel-alt rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs uppercase tracking-[0.2em] text-white/50">{group.label}</div>
                        <div className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] text-white/60">
                          {group.count}
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {group.values.map((value, valueIndex) => (
                          <code key={`${group.key}-${valueIndex}-${value}`} className="block rounded-2xl bg-black/30 p-3 text-xs text-slate-200">
                            {value}
                          </code>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CollapsiblePanel>
          </section>
        ) : null}
      </div>

      <SiteFooter />
    </main>
  );
}
