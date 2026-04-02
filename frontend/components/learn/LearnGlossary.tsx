"use client";

import { useMemo, useState } from "react";

import { useLanguage } from "@/components/LanguageProvider";
import { glossaryPreviewSlugs, learnGlossaryTerms } from "@/lib/learn-glossary";
import { localizeText } from "@/lib/learn";

export function LearnGlossary({ compact = false }: { compact?: boolean }) {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const baseItems = compact
      ? learnGlossaryTerms.filter((item) => glossaryPreviewSlugs.includes(item.slug))
      : learnGlossaryTerms;

    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return baseItems;
    }

    return baseItems.filter((item) => {
      const haystack = [
        localizeText(item.term, language),
        localizeText(item.category, language),
        localizeText(item.summary, language),
        localizeText(item.details, language),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [compact, language, query]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/38">
            {language === "pt-BR" ? "glossario" : "glossary"}
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            {language === "pt-BR" ? "Termos comuns em malware e triagem" : "Common malware and triage terms"}
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">
            {language === "pt-BR"
              ? "Use essa referencia para entender palavras comuns em relatorios, tutoriais e discussao tecnica sobre virus, trojans, keyloggers, stealers e outras ameacas."
              : "Use this reference to understand terms commonly seen in reports, tutorials, and technical discussions about viruses, trojans, keyloggers, stealers, and other threats."}
          </p>
        </div>
        <div className="w-full md:max-w-[340px]">
          <input
            className="w-full rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-white/18"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={language === "pt-BR" ? "Buscar termo, categoria ou explicacao" : "Search by term, category, or explanation"}
            value={query}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.slug} className="panel-alt rounded-[18px] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-lg font-semibold text-white">{localizeText(item.term, language)}</h4>
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/55">
                {localizeText(item.category, language)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/72">{localizeText(item.summary, language)}</p>
            <p className="mt-3 text-sm leading-7 text-white/55">{localizeText(item.details, language)}</p>
          </article>
        ))}
      </div>

      {!items.length ? (
        <div className="rounded-[18px] border border-white/10 bg-white/[0.02] px-5 py-4 text-sm text-white/58">
          {language === "pt-BR" ? "Nenhum termo encontrado para essa busca." : "No term matched this search."}
        </div>
      ) : null}
    </section>
  );
}
