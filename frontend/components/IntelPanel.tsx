"use client";

import { AnalysisResult } from "@/lib/api";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { useLanguage } from "@/components/LanguageProvider";

interface IntelPanelProps {
  result: AnalysisResult;
}

export function IntelPanel({ result }: IntelPanelProps) {
  const { copy } = useLanguage();

  if (!result.enrichment) {
    return null;
  }

  const vt = result.enrichment.virustotal;
  const mb = result.enrichment.malwarebazaar;

  return (
    <CollapsiblePanel
      accentClassName="text-sky-300/70"
      badge={
        <div className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/60">
          {result.enrichment.sources.length ? result.enrichment.sources.join(", ") : copy.intel.noSources}
        </div>
      }
      defaultCollapsed={!result.enrichment.sources.length}
      eyebrow={copy.intel.eyebrow}
      title={copy.intel.title}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel-alt rounded-3xl p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">VirusTotal</div>
          {vt?.available ? (
            <>
              <div className="mt-3 font-mono text-3xl text-white">{vt.malicious + vt.suspicious}</div>
              <div className="mt-1 text-sm text-slate-300">{copy.intel.enginesFlagged}</div>
              {vt.permalink ? (
                <a className="mt-4 inline-flex font-mono text-xs text-sky-300 hover:text-sky-200" href={vt.permalink} target="_blank" rel="noreferrer">
                  {copy.intel.openVirusTotal}
                </a>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-300">{vt?.note ?? copy.intel.notAvailable}</p>
          )}
        </div>

        <div className="panel-alt rounded-3xl p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">MalwareBazaar</div>
          {mb?.available ? (
            <>
              <div className="mt-3 text-lg font-semibold text-white">{mb.signature ?? copy.intel.knownSample}</div>
              <div className="mt-2 text-sm text-slate-300">{mb.file_type ?? copy.intel.unknownType}</div>
              {mb.tags.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {mb.tags.map((tag, tagIndex) => (
                    <span key={`${tag}-${tagIndex}`} className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/70">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-300">{mb?.note ?? copy.intel.notAvailable}</p>
          )}
        </div>

        <div className="panel-alt rounded-3xl p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">URLhaus</div>
          {result.enrichment.urlhaus.length ? (
            <div className="mt-3 space-y-3">
              {result.enrichment.urlhaus.map((hit, hitIndex) => (
                <div key={`${hit.indicator}-${hitIndex}`} className="rounded-2xl bg-black/20 p-3">
                  <div className="font-mono text-xs text-white">{hit.indicator}</div>
                  <div className="mt-1 text-sm text-slate-300">{hit.status}{hit.threat ? ` - ${hit.threat}` : ""}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-300">{copy.intel.noUrlhaus}</p>
          )}
        </div>
      </div>

      {result.enrichment.notes.length ? (
        <div className="mt-6 space-y-2">
          {result.enrichment.notes.map((note, noteIndex) => (
            <p key={`${noteIndex}-${note}`} className="text-sm text-slate-300">{note}</p>
          ))}
        </div>
      ) : null}
    </CollapsiblePanel>
  );
}
