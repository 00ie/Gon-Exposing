"use client";

import { AnalysisResult } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";

interface ScoreCardProps {
  result: AnalysisResult;
}

const badgeClasses: Record<string, string> = {
  CLEAN: "border-clean/40 bg-clean/10 text-clean",
  LOW: "border-low/40 bg-low/10 text-low",
  MEDIUM: "border-medium/40 bg-medium/10 text-medium",
  HIGH: "border-high/40 bg-high/10 text-high",
  CRITICAL: "border-critical/40 bg-critical/10 text-critical"
};

export function ScoreCard({ result }: ScoreCardProps) {
  const { copy, language } = useLanguage();

  if (!result.score) {
    return null;
  }

  const score = result.score.value;
  const classification = result.score.classification;
  const topFactors = result.score.factors.slice(0, 3);
  const classificationLabel = copy.common.risk[classification as keyof typeof copy.common.risk] ?? classification;
  const supportLevelLabel =
    result.family?.support_level === "full"
      ? language === "pt-BR"
        ? "suporte completo"
        : "full support"
      : result.family?.support_level === "detection_only"
        ? language === "pt-BR"
          ? "deteccao apenas"
          : "detection only"
        : result.family?.support_level === "heuristic"
          ? language === "pt-BR"
            ? "heuristico"
            : "heuristic"
          : result.family?.support_level;
  const detectionMethodLabel =
    result.family?.detection_method === "signature"
      ? language === "pt-BR"
        ? "assinatura"
        : "signature"
      : result.family?.detection_method === "heuristic"
        ? language === "pt-BR"
          ? "heuristica"
          : "heuristic"
        : result.family?.detection_method === "manual"
          ? "manual"
          : result.family?.detection_method;

  return (
    <section className="panel rounded-[22px] p-6">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">{copy.score.title}</p>
          <div className="mt-6 flex items-end gap-4">
            <span className="font-mono text-6xl font-semibold text-white">{score}</span>
            <span className="mb-2 text-lg text-slate-300">/100</span>
          </div>
          <div className={`mt-4 inline-flex rounded-full border px-4 py-2 font-mono text-sm ${badgeClasses[classification]}`}>
            {classificationLabel}
          </div>

          <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500"
              style={{ width: `${score}%` }}
            />
          </div>

          {topFactors.length ? (
            <div className="mt-6 grid gap-3">
              {topFactors.map((factor) => (
                <div key={`${factor.name}-${factor.weight}`} className="panel-alt rounded-[16px] px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-white/80">{factor.name}</div>
                    <div className="font-mono text-xs text-white/45">+{factor.weight}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="panel-alt rounded-[18px] p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">{copy.score.family}</div>
          <div className="mt-3 text-2xl font-semibold text-white">{result.family?.name ?? copy.score.noFamily}</div>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {result.family?.summary ?? copy.score.defaultSummary}
          </p>
          {result.family ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/70">
                {Math.round(result.family.confidence * 100)}% {copy.score.confidence}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/70">
                {supportLevelLabel}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/70">
                {detectionMethodLabel}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
