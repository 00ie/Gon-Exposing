"use client";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useLanguage } from "@/components/LanguageProvider";


export default function PrivacyPage() {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen bg-ink text-white">
      <SiteHeader />
      <section className="mx-auto max-w-[980px] px-5 py-12 md:px-8">
        <div className="panel rounded-[22px] p-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/38">
            {language === "pt-BR" ? "Privacidade" : "Privacy"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            {language === "pt-BR" ? "Politica de privacidade" : "Privacy policy"}
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-8 text-white/65">
            <p>
              {language === "pt-BR"
                ? "O Gon Exposing foi desenhado para operar com o minimo necessario de dados para triagem, autenticacao e historico local."
                : "Gon Exposing is designed to operate with the minimum necessary data for triage, authentication, and local history."}
            </p>
            <p>
              {language === "pt-BR"
                ? "Amostras nao sao executadas no servidor. Quando o modo de worker e usado, arquivos temporarios podem ser gravados apenas para analise estatica e sao removidos conforme a configuracao."
                : "Samples are not executed on the server. When worker mode is used, temporary files may be written only for static analysis and are removed according to configuration."}
            </p>
            <p>
              {language === "pt-BR"
                ? "Consultas externas de threat intel so acontecem quando essa funcao esta habilitada."
                : "External threat-intel lookups only happen when that feature is enabled."}
            </p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
