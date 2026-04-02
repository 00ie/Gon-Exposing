"use client";

import { AnalysisResult } from "@/lib/api";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { useLanguage } from "@/components/LanguageProvider";

interface YaraPanelProps {
  result: AnalysisResult;
}

export function YaraPanel({ result }: YaraPanelProps) {
  const { copy } = useLanguage();

  if (!result.yara) {
    return null;
  }

  return (
    <CollapsiblePanel
      accentClassName="text-fuchsia-300/70"
      badge={
        <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
          {result.yara.loaded_rules} {copy.yara.loaded}
        </div>
      }
      defaultCollapsed={!result.yara.matches.length}
      eyebrow={copy.yara.eyebrow}
      title={copy.yara.title}
    >
      {result.yara.note ? <p className="mt-4 text-sm text-slate-300">{result.yara.note}</p> : null}

      {result.yara.matches.length ? (
        <div className="mt-6 space-y-3">
          {result.yara.matches.map((match, matchIndex) => (
            <div key={`${match.namespace}-${match.rule}-${matchIndex}`} className="panel-alt rounded-3xl p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-1 font-mono text-xs text-fuchsia-200">
                  {match.rule}
                </span>
                {match.severity ? (
                  <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
                    {match.severity}
                  </span>
                ) : null}
              </div>
              {match.strings.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {match.strings.map((item, itemIndex) => (
                    <span key={`${match.rule}-${itemIndex}-${item}`} className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/70">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 text-sm text-slate-300">{copy.yara.noMatches}</div>
      )}
    </CollapsiblePanel>
  );
}
