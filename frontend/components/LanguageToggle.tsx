"use client";

import { useLanguage } from "@/components/LanguageProvider";


export function LanguageToggle() {
  const { language, setLanguage, copy } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <span className="hidden font-mono text-[11px] uppercase tracking-[0.14em] text-white/38 md:inline">
        {copy.languageLabel}
      </span>
      <div className="inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1">
        <button
          className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
            language === "en" ? "bg-white text-black" : "text-white/50 hover:text-white"
          }`}
          onClick={() => setLanguage("en")}
          type="button"
        >
          {copy.languages.en}
        </button>
        <button
          className={`rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition ${
            language === "pt-BR" ? "bg-white text-black" : "text-white/50 hover:text-white"
          }`}
          onClick={() => setLanguage("pt-BR")}
          type="button"
        >
          {copy.languages.pt}
        </button>
      </div>
    </div>
  );
}
