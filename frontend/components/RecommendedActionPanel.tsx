"use client";

import Link from "next/link";

import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { useLanguage } from "@/components/LanguageProvider";
import type { AnalysisResult } from "@/lib/api";

function includesDotNet(fileType?: string | null): boolean {
  const normalized = (fileType ?? "").toLowerCase();
  return normalized.includes(".net") || normalized.includes("cil") || normalized.includes("cli");
}

type ActionItem = {
  title: string;
  description: string;
  href?: string;
  hrefLabel?: string;
  tone: string;
};

export function RecommendedActionPanel({ result }: { result: AnalysisResult }) {
  const { language } = useLanguage();

  const score = result.score?.value ?? 0;
  const destinations = (result.iocs.webhooks?.length ?? 0) + (result.iocs.telegram?.length ?? 0);
  const hasCritical = (result.behaviors ?? []).some((item) => item.severity === "CRITICAL");
  const hasPacker = Boolean(result.pe?.packers?.length || result.pe?.sections.some((section) => section.packed_suspect));
  const isDotNet = includesDotNet(result.file?.type);

  const actions: ActionItem[] = [];

  if (score >= 70 || hasCritical || destinations > 0) {
    actions.push({
      title: language === "pt-BR" ? "Nao abra no computador principal" : "Do not open it on your main computer",
      description:
        language === "pt-BR"
          ? "O relatorio ja mostra sinais suficientes para tratar a amostra como perigosa. Se precisar aprofundar, use VM isolada."
          : "The report already shows enough signs to treat the sample as dangerous. If you need to go deeper, use an isolated VM.",
      href: "/learn/environment",
      hrefLabel: language === "pt-BR" ? "ver ambiente seguro" : "open safe environment guide",
      tone: "border-red-400/18 bg-red-400/[0.06]",
    });
  } else {
    actions.push({
      title: language === "pt-BR" ? "Revise antes de concluir" : "Review before concluding",
      description:
        language === "pt-BR"
          ? "A triagem nao apontou sinais fortes o suficiente para cravar malware. Vale revisar IOC, score e tipo de arquivo."
          : "Triage did not show strong enough signals for a hard malware verdict. Review IOC, score, and file type first.",
      href: "/learn/basics",
      hrefLabel: language === "pt-BR" ? "como ler o resultado" : "how to read the result",
      tone: "border-white/10 bg-white/[0.03]",
    });
  }

  if (destinations > 0) {
    actions.push({
      title: language === "pt-BR" ? "Priorize os destinos de exfiltracao" : "Prioritize the exfiltration targets",
      description:
        language === "pt-BR"
          ? "Veja primeiro webhooks, bots, tokens e endpoints. Eles mostram para onde os dados podem estar indo."
          : "Inspect webhooks, bots, tokens, and endpoints first. They show where data may be going.",
      tone: "border-emerald-400/18 bg-emerald-400/[0.06]",
    });
  }

  if (hasPacker) {
    actions.push({
      title: language === "pt-BR" ? "Desempacote antes de insistir" : "Unpack before going deeper",
      description:
        language === "pt-BR"
          ? "Alta entropia ou packer reduzem visibilidade. Faz sentido limpar o binario antes de confiar nos detalhes."
          : "High entropy or packers reduce visibility. It makes sense to clean up the binary before trusting the details.",
      href: "/learn/labs/lab-02",
      hrefLabel: language === "pt-BR" ? "ver fluxo de unpack" : "open unpack workflow",
      tone: "border-amber-300/18 bg-amber-300/[0.06]",
    });
  }

  actions.push(
    isDotNet
      ? {
          title: language === "pt-BR" ? "Abra no dnSpy se for aprofundar" : "Open it in dnSpy if you go deeper",
          description:
            language === "pt-BR"
              ? "Esse tipo de amostra costuma ficar muito mais legivel no dnSpy, especialmente para configuracoes e envio de dados."
              : "This kind of sample is usually much clearer in dnSpy, especially for configuration and data sending logic.",
          href: "/learn/dnspy",
          hrefLabel: language === "pt-BR" ? "abrir guia dnSpy" : "open dnSpy guide",
          tone: "border-sky-300/18 bg-sky-300/[0.06]",
        }
      : {
          title: language === "pt-BR" ? "Siga o fluxo de engenharia reversa estatica" : "Follow the static reverse-engineering path",
          description:
            language === "pt-BR"
              ? "Para binarios nativos, strings, imports, XRefs e decompiler costumam revelar bem o comportamento."
              : "For native binaries, strings, imports, XRefs, and the decompiler usually expose behavior well.",
          href: "/learn/ghidra",
          hrefLabel: language === "pt-BR" ? "abrir guia Ghidra" : "open Ghidra guide",
          tone: "border-sky-300/18 bg-sky-300/[0.06]",
        }
  );

  return (
    <CollapsiblePanel
      accentClassName="text-emerald-300/70"
      eyebrow={language === "pt-BR" ? "Proximo passo" : "Next step"}
      title={language === "pt-BR" ? "O que fazer agora" : "What to do now"}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {actions.map((action, index) => (
          <div key={`${action.title}-${index}`} className={`rounded-[20px] border p-5 ${action.tone}`}>
            <div className="text-lg font-semibold text-white">{action.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/68">{action.description}</p>
            {action.href ? (
              <Link
                className="mt-5 inline-flex rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/68 transition hover:border-white/20 hover:text-white"
                href={action.href}
              >
                {action.hrefLabel}
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </CollapsiblePanel>
  );
}
