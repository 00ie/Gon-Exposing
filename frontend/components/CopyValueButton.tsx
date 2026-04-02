"use client";

import { useState } from "react";

import { useLanguage } from "@/components/LanguageProvider";
import { CopyIcon } from "@/components/UiIcons";

export function CopyValueButton({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/60 transition hover:border-white/20 hover:text-white ${className}`}
      onClick={() => void handleCopy()}
      type="button"
    >
      <CopyIcon className="h-3.5 w-3.5" />
      <span>{language === "pt-BR" ? (copied ? "copiado" : "copiar") : copied ? "copied" : "copy"}</span>
    </button>
  );
}
