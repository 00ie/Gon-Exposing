"use client";

import { useMemo } from "react";

import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { CopyValueButton } from "@/components/CopyValueButton";
import { useLanguage } from "@/components/LanguageProvider";
import type { AnalysisResult, Indicator } from "@/lib/api";

function riskRank(value?: string | null) {
  const order: Record<string, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
    INFO: 0,
  };
  return order[(value ?? "").toUpperCase()] ?? 0;
}

function dedupeIndicators(items: Indicator[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.type}:${item.value}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function getTargetLabel(value: string) {
  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      return new URL(value).host;
    }
  } catch {}
  return value.length > 32 ? `${value.slice(0, 32)}...` : value;
}

export function ThreatOverview({ result }: { result: AnalysisResult }) {
  const { language } = useLanguage();

  const destinations = useMemo(() => {
    const telegram = (result.iocs.telegram ?? []).map((item) => ({ ...item, type: "telegram" }));
    const webhooks = result.iocs.webhooks ?? [];
    const tokens = (result.iocs.tokens ?? []).filter((item) => (item.platform ?? "").toLowerCase() === "telegram");
    const urls = (result.iocs.urls ?? []).filter((item) =>
      /(api\.telegram\.org|discord(?:app)?\.com\/api\/webhooks|hooks\.slack\.com)/i.test(item.value)
    );

    return dedupeIndicators([...telegram, ...webhooks, ...tokens, ...urls])
      .sort((left, right) => {
        const riskDelta = riskRank(right.risk) - riskRank(left.risk);
        if (riskDelta !== 0) {
          return riskDelta;
        }
        return (right.confidence ?? 0) - (left.confidence ?? 0);
      })
      .slice(0, 8);
  }, [result.iocs.telegram, result.iocs.tokens, result.iocs.urls, result.iocs.webhooks]);

  const keySignals = useMemo(() => {
    const factors = (result.score?.factors ?? []).map((factor) => factor.name);
    const behaviors = (result.behaviors ?? []).slice(0, 3).map((behavior) => behavior.name);
    return Array.from(new Set([...factors, ...behaviors])).slice(0, 6);
  }, [result.behaviors, result.score?.factors]);
  const counts = useMemo(
    () => ({
      destinations: destinations.length,
      criticalBehaviors: (result.behaviors ?? []).filter((item) => item.severity === "CRITICAL").length,
      tokens: (result.iocs.tokens ?? []).length,
    }),
    [destinations.length, result.behaviors, result.iocs.tokens]
  );

  const verdict = (() => {
    const score = result.score?.value ?? 0;
    const criticalBehaviors = (result.behaviors ?? []).filter((item) => item.severity === "CRITICAL").length;
    if (score >= 75 || criticalBehaviors > 0 || destinations.length > 0) {
      return {
        label: language === "pt-BR" ? "Provavel malware" : "Likely malware",
        description:
          language === "pt-BR"
            ? "A amostra mostra sinais fortes de comportamento malicioso, exfiltracao ou roubo de dados."
            : "The sample shows strong signs of malicious behavior, exfiltration, or data theft.",
        tone: "border-red-400/20 bg-red-400/8 text-red-100",
      };
    }
    if (score >= 45) {
      return {
        label: language === "pt-BR" ? "Suspeito" : "Suspicious",
        description:
          language === "pt-BR"
            ? "Ha evidencias relevantes de risco, mas ainda vale revisar os detalhes tecnicos."
            : "There is relevant evidence of risk, but the technical details still deserve review.",
        tone: "border-amber-300/20 bg-amber-300/8 text-amber-100",
      };
    }
    return {
      label: language === "pt-BR" ? "Baixa confianca de malware" : "Low malware confidence",
      description:
        language === "pt-BR"
          ? "A amostra nao mostrou sinais fortes o suficiente para um veredito agressivo."
          : "The sample did not expose strong enough signs for an aggressive verdict.",
      tone: "border-white/10 bg-white/[0.03] text-white/75",
    };
  })();

  return (
    <CollapsiblePanel
      accentClassName="text-emerald-300/70"
      eyebrow={language === "pt-BR" ? "Resumo rapido" : "Quick summary"}
      title={language === "pt-BR" ? "O mais importante primeiro" : "What matters first"}
    >
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
        <div className={`rounded-[22px] border p-5 ${verdict.tone}`}>
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
            {language === "pt-BR" ? "Veredito" : "Verdict"}
          </div>
          <div className="mt-3 text-2xl font-semibold text-white">{verdict.label}</div>
          <p className="mt-3 text-sm leading-7 text-white/70">{verdict.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.score ? (
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">
                {result.score.value}/100
              </span>
            ) : null}
            {result.score?.classification ? (
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">
                {result.score.classification}
              </span>
            ) : null}
            {result.family?.name ? (
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/70">
                {result.family.name}
              </span>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-white/10 bg-white/[0.02] p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
                {language === "pt-BR" ? "Destinos" : "Destinations"}
              </div>
              <div className="mt-3 font-mono text-3xl text-white">{counts.destinations}</div>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.02] p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
                {language === "pt-BR" ? "Comportamentos criticos" : "Critical behaviors"}
              </div>
              <div className="mt-3 font-mono text-3xl text-white">{counts.criticalBehaviors}</div>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/[0.02] p-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">
                {language === "pt-BR" ? "Tokens detectados" : "Detected tokens"}
              </div>
              <div className="mt-3 font-mono text-3xl text-white">{counts.tokens}</div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.02] p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
                {language === "pt-BR" ? "Para onde os dados podem ir" : "Where the data may go"}
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-white/60">
                {destinations.length}
              </div>
            </div>
            {destinations.length ? (
              <div className="mt-4 grid gap-3">
                {destinations.map((item, index) => (
                  <div key={`${item.type}-${item.value}-${index}`} className="rounded-[18px] border border-white/8 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-mono text-sm uppercase tracking-[0.12em] text-white/70">
                          {getTargetLabel(item.value)}
                        </div>
                        <div className="mt-1 text-xs text-white/42">
                          {language === "pt-BR" ? "Destino ou credencial de exfiltracao" : "Exfiltration destination or credential"}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 font-mono text-[11px] uppercase text-emerald-200">
                          {item.platform ?? item.type}
                        </span>
                        {item.details?.kind ? (
                          <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase text-white/60">
                            {String(item.details.kind)}
                          </span>
                        ) : null}
                        <CopyValueButton value={item.value} />
                      </div>
                    </div>
                    <code className="mt-3 block rounded-2xl bg-black/30 p-3 text-xs leading-6 text-slate-200 break-all whitespace-pre-wrap">
                      {item.value}
                    </code>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-white/60">
                {language === "pt-BR"
                  ? "Nenhum destino de exfiltracao ficou claro o suficiente na triagem automatica."
                  : "No exfiltration destination was clear enough in automated triage."}
              </p>
            )}
          </div>
        </div>
      </div>

      {keySignals.length ? (
        <div className="mt-5 rounded-[22px] border border-white/10 bg-white/[0.02] p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
            {language === "pt-BR" ? "Principais sinais" : "Main signals"}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {keySignals.map((signal, index) => (
              <span key={`${signal}-${index}`} className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-white/70">
                {signal}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </CollapsiblePanel>
  );
}
