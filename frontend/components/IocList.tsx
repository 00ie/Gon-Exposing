"use client";

import { useMemo, useState } from "react";

import { Indicator } from "@/lib/api";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { CopyValueButton } from "@/components/CopyValueButton";
import { useLanguage } from "@/components/LanguageProvider";

interface IocListProps {
  title: string;
  indicators: Indicator[];
  priority?: boolean;
}

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

export function IocList({ title, indicators, priority = false }: IocListProps) {
  const { copy, language } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const sortedIndicators = useMemo(
    () =>
      [...indicators].sort((left, right) => {
        const riskDelta = riskRank(right.risk) - riskRank(left.risk);
        if (riskDelta !== 0) {
          return riskDelta;
        }
        const confidenceDelta = (right.confidence ?? 0) - (left.confidence ?? 0);
        if (confidenceDelta !== 0) {
          return confidenceDelta;
        }
        return left.value.localeCompare(right.value);
      }),
    [indicators]
  );
  const visibleLimit = priority ? 6 : 12;
  const visibleIndicators = showAll ? sortedIndicators : sortedIndicators.slice(0, visibleLimit);

  if (!indicators.length) {
    return null;
  }

  return (
    <CollapsiblePanel
      accentClassName="text-red-300/70"
      badge={
        <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
          {indicators.length} {copy.iocs.items}
        </div>
      }
      defaultCollapsed={indicators.length > visibleLimit}
      eyebrow={copy.iocs.eyebrow}
      title={title}
    >
      <div className="space-y-3">
        {visibleIndicators.map((indicator, index) => (
          <div key={`${indicator.type}-${indicator.value}-${index}`} className="panel-alt rounded-2xl p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 font-mono text-[11px] uppercase text-red-200">
                  {indicator.platform ?? indicator.type}
                </span>
                {indicator.details?.kind ? (
                  <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase text-white/60">
                    {String(indicator.details.kind)}
                  </span>
                ) : null}
                <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase text-white/60">
                  {Math.round((indicator.confidence ?? 0) * 100)}% {copy.iocs.confidence}
                </span>
                {indicator.risk ? (
                  <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase text-white/60">
                    {copy.common.risk[indicator.risk as keyof typeof copy.common.risk] ?? indicator.risk}
                  </span>
                ) : null}
              </div>
              <CopyValueButton value={indicator.value} />
            </div>
            <code className="mt-4 block rounded-2xl bg-black/30 p-3 text-xs text-slate-200 break-all whitespace-pre-wrap">
              {indicator.value}
            </code>
          </div>
        ))}
      </div>
      {sortedIndicators.length > visibleLimit ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/38">
            {showAll
              ? `${sortedIndicators.length} ${copy.iocs.items}`
              : language === "pt-BR"
                ? `Mostrando ${visibleIndicators.length} de ${sortedIndicators.length}`
                : `Showing ${visibleIndicators.length} of ${sortedIndicators.length}`}
          </div>
          <button
            className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60 transition hover:border-white/20 hover:text-white"
            onClick={() => setShowAll((current) => !current)}
            type="button"
          >
            {showAll ? copy.common.collapse : copy.common.expand}
          </button>
        </div>
      ) : null}
    </CollapsiblePanel>
  );
}
