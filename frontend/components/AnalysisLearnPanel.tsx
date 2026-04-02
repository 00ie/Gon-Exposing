"use client";

import Link from "next/link";

import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { useLanguage } from "@/components/LanguageProvider";
import type { AnalysisResult } from "@/lib/api";


type Suggestion = {
  href: string;
  title: string;
  description: string;
};

function includesDotNet(fileType?: string | null): boolean {
  const normalized = (fileType ?? "").toLowerCase();
  return normalized.includes(".net") || normalized.includes("cil") || normalized.includes("cli");
}

export function AnalysisLearnPanel({ result }: { result: AnalysisResult }) {
  const { copy, language } = useLanguage();
  const suggestions: Suggestion[] = [
    {
      href: "/learn/basics",
      title: copy.analysis.learn.items.basics.title,
      description: copy.analysis.learn.items.basics.description
    },
    {
      href: "/learn/environment",
      title: copy.analysis.learn.items.environment.title,
      description: copy.analysis.learn.items.environment.description
    },
    {
      href: "/learn/glossary",
      title: language === "pt-BR" ? "Glossario de malware" : "Malware glossary",
      description:
        language === "pt-BR"
          ? "Entenda termos como trojan, keylogger, stealer, exfiltracao, webhook e C2 antes de aprofundar."
          : "Understand terms like trojan, keylogger, stealer, exfiltration, webhook, and C2 before going deeper."
    }
  ];

  if (includesDotNet(result.file?.type)) {
    suggestions.push({
      href: "/learn/dnspy",
      title: copy.analysis.learn.items.dotnet.title,
      description: copy.analysis.learn.items.dotnet.description
    });
  } else {
    suggestions.push({
      href: "/learn/ghidra",
      title: copy.analysis.learn.items.ghidra.title,
      description: copy.analysis.learn.items.ghidra.description
    });
  }

  if (result.pe?.packers?.length || result.pe?.sections.some((section) => section.packed_suspect)) {
    suggestions.push({
      href: "/learn/labs/lab-02",
      title: copy.analysis.learn.items.unpacking.title,
      description: copy.analysis.learn.items.unpacking.description
    });
  }

  if ((result.iocs.webhooks?.length ?? 0) > 0 || (result.iocs.urls?.length ?? 0) > 0) {
    suggestions.push({
      href: "/learn/ghidra/webhooks",
      title: copy.analysis.learn.items.ghidra.title,
      description: copy.analysis.learn.items.ghidra.description
    });
  }

  if ((result.score?.value ?? 0) >= 70) {
    suggestions.push({
      href: "/learn/dynamic",
      title: copy.analysis.learn.items.dynamic.title,
      description: copy.analysis.learn.items.dynamic.description
    });
  }

  if (result.family?.name) {
    suggestions.push({
      href: "/learn/yara",
      title: copy.analysis.learn.items.yara.title,
      description: copy.analysis.learn.items.yara.description
    });
  }

  const uniqueSuggestions = suggestions.filter(
    (item, index, array) => array.findIndex((candidate) => candidate.href === item.href) === index
  );

  return (
    <CollapsiblePanel defaultCollapsed eyebrow={copy.analysis.learn.eyebrow} title={copy.analysis.learn.title}>
      <p className="text-sm leading-7 text-slate-300">{copy.analysis.learn.description}</p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {uniqueSuggestions.map((item) => (
          <Link key={item.href} className="panel-alt rounded-[18px] p-5 transition hover:border-white/18" href={item.href}>
            <div className="text-lg font-semibold text-white">{item.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/60">{item.description}</p>
            <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">{copy.analysis.learn.open}</div>
          </Link>
        ))}
      </div>
    </CollapsiblePanel>
  );
}
