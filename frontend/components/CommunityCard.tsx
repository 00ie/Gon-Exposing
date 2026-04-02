"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { site } from "@/lib/site";

export function CommunityCard() {
  const { copy } = useLanguage();

  return (
    <section className="panel rounded-[20px] p-6">
      <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/45">{copy.community.eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{copy.community.title}</h2>
      <p className="mt-3 text-sm leading-7 text-white/58">
        {copy.community.description}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a className="panel-alt rounded-[16px] p-4 transition hover:border-white/20" href={site.server} target="_blank" rel="noreferrer">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">{copy.community.labels.server}</div>
          <div className="mt-3 font-mono text-sm text-white">{site.discord}</div>
        </a>
        <a className="panel-alt rounded-[16px] p-4 transition hover:border-white/20" href={site.github} target="_blank" rel="noreferrer">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">{copy.community.labels.github}</div>
          <div className="mt-3 font-mono text-sm text-white">{site.githubHandle}</div>
        </a>
        <a className="panel-alt rounded-[16px] p-4 transition hover:border-white/20" href={site.telegram} target="_blank" rel="noreferrer">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">{copy.community.labels.telegram}</div>
          <div className="mt-3 font-mono text-sm text-white">{site.telegramHandle}</div>
        </a>
        <div className="panel-alt rounded-[16px] p-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">{copy.community.labels.mode}</div>
          <div className="mt-3 font-mono text-sm text-white">{copy.community.modeValue}</div>
        </div>
      </div>
    </section>
  );
}
