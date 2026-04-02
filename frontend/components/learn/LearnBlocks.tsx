"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

import { useLanguage } from "@/components/LanguageProvider";


export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type SafetyType = "static-only" | "vm-required" | "sandbox-required";
export type CalloutType = "tip" | "warning" | "danger" | "info";

export function DifficultyBadge({ level }: { level: DifficultyLevel }) {
  const label =
    level === "beginner" ? "Beginner" : level === "intermediate" ? "Intermediate" : "Advanced";
  const pt =
    level === "beginner" ? "Iniciante" : level === "intermediate" ? "Intermediario" : "Avancado";
  const tone =
    level === "beginner"
      ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
      : level === "intermediate"
        ? "border-amber-400/25 bg-amber-400/10 text-amber-200"
        : "border-red-400/25 bg-red-400/10 text-red-200";
  const { language } = useLanguage();

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] ${tone}`}>
      {language === "pt-BR" ? pt : label}
    </span>
  );
}

export function TimeBadge({ minutes }: { minutes: number }) {
  const { language } = useLanguage();

  return (
    <span className="inline-flex rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/65">
      {language === "pt-BR" ? `${minutes} min` : `${minutes} min`}
    </span>
  );
}

export function SafetyWarning({ type }: { type: SafetyType }) {
  const { language } = useLanguage();
  const copy = {
    "static-only": {
      pt: "Analise estatica apenas. Nenhuma etapa exige executar a amostra.",
      en: "Static analysis only. No step requires running the sample.",
    },
    "vm-required": {
      pt: "Use VM dedicada. Nao abra a amostra no seu sistema principal.",
      en: "Use a dedicated VM. Do not open the sample on your main system.",
    },
    "sandbox-required": {
      pt: "Use sandbox ou VM isolada. Este fluxo nao deve ser feito no host.",
      en: "Use a sandbox or isolated VM. Do not do this on the host.",
    },
  }[type];

  return (
    <div className="rounded-[16px] border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm leading-7 text-amber-100/80">
      {language === "pt-BR" ? copy.pt : copy.en}
    </div>
  );
}

export function CodeBlock({
  codeLanguage,
  copyable = true,
  children,
}: {
  codeLanguage: "python" | "bash" | "powershell" | "text" | "yara" | "csharp";
  copyable?: boolean;
  children: string;
}) {
  const [copied, setCopied] = useState(false);
  const { language } = useLanguage();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-white/10 bg-black/40">
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">{codeLanguage}</span>
        {copyable ? (
          <button
            className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/55 transition hover:text-white"
            onClick={() => void handleCopy()}
            type="button"
          >
            {language === "pt-BR" ? (copied ? "copiado" : "copiar") : copied ? "copied" : "copy"}
          </button>
        ) : null}
      </div>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-xs leading-6 text-white/80">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function Callout({ type, children }: { type: CalloutType; children: ReactNode }) {
  const tone =
    type === "tip"
      ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-100/80"
      : type === "warning"
        ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-100/80"
        : type === "danger"
          ? "border-red-300/20 bg-red-300/[0.06] text-red-100/80"
          : "border-sky-300/20 bg-sky-300/[0.06] text-sky-100/80";

  return <div className={`rounded-[16px] border px-4 py-3 text-sm leading-7 ${tone}`}>{children}</div>;
}

export function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-white/8 bg-white/[0.015] p-5">
      <div className="flex items-start gap-4">
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 font-mono text-xs text-white/65">
          {number}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <div className="mt-3 space-y-4 text-sm leading-7 text-white/68">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function ToolCard({
  name,
  version,
  description,
  downloadUrl,
  os,
  price,
}: {
  name: string;
  version: string;
  description: string;
  downloadUrl: string;
  os: string[];
  price: string;
}) {
  const { language } = useLanguage();

  return (
    <a className="panel-alt rounded-[16px] p-5 transition hover:border-white/18" href={downloadUrl} rel="noreferrer" target="_blank">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-white">{name}</div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/35">{version}</div>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/55">
          {price}
        </span>
      </div>
      <p className="mt-4 text-sm leading-7 text-white/62">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {os.map((item, index) => (
          <span key={`${item}-${index}`} className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/55">
            {item}
          </span>
        ))}
      </div>
      <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
        {language === "pt-BR" ? "Abrir pagina oficial" : "Open official page"}
      </div>
    </a>
  );
}

export function TutorialProgress({
  steps,
  activePath,
}: {
  steps: { href: string; label: string }[];
  activePath: string;
}) {
  const { language } = useLanguage();
  return (
    <aside className="panel rounded-[18px] p-5">
      <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">{language === "pt-BR" ? "progresso" : "progress"}</div>
      <div className="mt-4 space-y-2">
        {steps.map((step, index) => {
          const active = activePath === step.href;

          return (
            <Link
              key={step.href}
              className={`flex items-center gap-3 rounded-[12px] px-3 py-2 text-sm transition ${
                active ? "bg-white/[0.06] text-white" : "text-white/55 hover:bg-white/[0.03] hover:text-white/80"
              }`}
              href={step.href}
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/35">{index + 1}</span>
              <span>{step.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export function CodeComparison({
  before,
  after,
}: {
  before: { label: string; code: string };
  after: { label: string; code: string };
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="panel-alt overflow-hidden rounded-[16px]">
        <div className="border-b border-white/8 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
          {before.label}
        </div>
        <pre className="overflow-x-auto px-4 py-4 font-mono text-xs leading-6 text-white/78">
          <code>{before.code}</code>
        </pre>
      </div>
      <div className="panel-alt overflow-hidden rounded-[16px]">
        <div className="border-b border-white/8 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
          {after.label}
        </div>
        <pre className="overflow-x-auto px-4 py-4 font-mono text-xs leading-6 text-white/78">
          <code>{after.code}</code>
        </pre>
      </div>
    </div>
  );
}
