"use client";

import { BehaviorFinding } from "@/lib/api";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { useLanguage } from "@/components/LanguageProvider";

interface BehaviorListProps {
  behaviors: BehaviorFinding[];
}

const severityClasses: Record<string, string> = {
  LOW: "border-low/40 bg-low/10 text-low",
  MEDIUM: "border-medium/40 bg-medium/10 text-medium",
  HIGH: "border-high/40 bg-high/10 text-high",
  CRITICAL: "border-critical/40 bg-critical/10 text-critical"
};

export function BehaviorList({ behaviors }: BehaviorListProps) {
  const { copy } = useLanguage();

  if (!behaviors.length) {
    return null;
  }

  return (
    <CollapsiblePanel
      accentClassName="text-amber-300/70"
      badge={
        <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
          {behaviors.length} {copy.behaviors.findings}
        </div>
      }
      eyebrow={copy.behaviors.eyebrow}
      title={copy.behaviors.title}
    >
      <div className="space-y-4">
        {behaviors.map((behavior, behaviorIndex) => {
          const evidence = Array.from(new Set(behavior.evidence));
          const mitre = Array.from(
            new Map(behavior.mitre.map((technique) => [`${technique.id}-${technique.name}`, technique])).values()
          );

          return (
            <article key={`${behavior.name}-${behaviorIndex}`} className="panel-alt rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{behavior.name}</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300">{behavior.description}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 font-mono text-xs ${severityClasses[behavior.severity]}`}>
                  {copy.common.severity[behavior.severity]}
                </span>
              </div>

              {evidence.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {evidence.map((item, evidenceIndex) => (
                    <span key={`${behavior.name}-${evidenceIndex}-${item}`} className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/70">
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}

              {mitre.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {mitre.map((technique, techniqueIndex) => (
                    <span key={`${technique.id}-${technique.name}-${techniqueIndex}`} className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 font-mono text-xs text-sky-200">
                      {technique.id} - {technique.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </CollapsiblePanel>
  );
}
