"use client";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useLanguage } from "@/components/LanguageProvider";


export default function TermsPage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen bg-ink text-white">
      <SiteHeader />
      <section className="mx-auto max-w-[980px] px-5 py-12 md:px-8">
        <div className="panel rounded-[22px] p-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/38">
            {language === "pt-BR" ? "Termos" : "Terms"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            {language === "pt-BR" ? "Termos de uso" : "Terms of use"}
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-8 text-white/65">
            <p>
              {language === "pt-BR"
                ? "Envie apenas arquivos, URLs e hashes que voce tenha direito de analisar."
                : "Submit only files, URLs, and hashes that you have the right to analyze."}
            </p>
            <p>
              {language === "pt-BR"
                ? "A plataforma existe para triagem e aprendizado responsavel, nao para ataque, retaliacao ou acesso nao autorizado."
                : "The platform exists for responsible triage and learning, not for attack, retaliation, or unauthorized access."}
            </p>
            <p>
              {language === "pt-BR"
                ? "O uso de integracoes externas e opcional e depende da configuracao do ambiente."
                : "Use of external integrations is optional and depends on environment configuration."}
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
