import { AnalysisStep } from "@/lib/api";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { useLanguage } from "@/components/LanguageProvider";

interface ProgressStreamProps {
  steps: AnalysisStep[];
}

export function ProgressStream({ steps }: ProgressStreamProps) {
  const { copy } = useLanguage();
  const latestProgress = steps.length ? steps[steps.length - 1].progress : 0;
  const latestStep = steps.length ? steps[steps.length - 1] : null;
  const recentSteps = steps.slice(-6);

  function formatStepLabel(value: string) {
    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  return (
    <CollapsiblePanel
      accentClassName="text-sky-300/70"
      defaultCollapsed={latestProgress >= 100 && steps.length > 0}
      badge={
        <div className="rounded-full border border-sky-400/30 px-3 py-1 font-mono text-xs text-sky-200">
          {latestProgress}%
        </div>
      }
      eyebrow={copy.progress.eyebrow}
      title={copy.progress.title}
      bodyClassName="space-y-5"
    >
      <div className="panel-alt rounded-[24px] p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">{copy.progress.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-semibold text-white">
                {latestStep ? formatStepLabel(latestStep.step) : copy.progress.queued}
              </h3>
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
                {latestProgress}%
              </span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              {latestStep?.message ?? copy.progress.noSteps}
            </p>
          </div>

          <div className="grid min-w-[240px] gap-3 sm:grid-cols-2 lg:w-[280px] lg:grid-cols-1">
            <div className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">{copy.progress.currentStage}</div>
              <div className="mt-2 font-mono text-sm text-white/80">
                {latestStep ? formatStepLabel(latestStep.step) : copy.progress.queued}
              </div>
            </div>
            <div className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3">
              <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">{copy.progress.stepsTracked}</div>
              <div className="mt-2 font-mono text-sm text-white/80">{steps.length}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-400 transition-[width] duration-500"
            style={{ width: `${latestProgress}%` }}
          />
        </div>
      </div>

      <div className="panel-alt rounded-[24px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">{copy.progress.recentActivity}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{copy.progress.latestEntry}</h3>
          </div>
          <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
            {recentSteps.length}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {recentSteps.map((step, index) => {
            const isCurrent = index === recentSteps.length - 1;

            return (
              <div key={`${step.step}-${step.updated_at}-${index}`} className="flex gap-3 rounded-[18px] border border-white/6 bg-black/20 px-4 py-3">
                <div
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    isCurrent ? "bg-emerald-300 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" : "bg-white/20"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
                      {formatStepLabel(step.step)}
                    </div>
                    <div className="font-mono text-[11px] text-emerald-300">{step.progress}%</div>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{step.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CollapsiblePanel>
  );
}
