"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import {
  Callout,
  CodeBlock,
  CodeComparison,
  DifficultyBadge,
  SafetyWarning,
  Step,
  TimeBadge,
  ToolCard,
  TutorialProgress
} from "@/components/learn/LearnBlocks";
import { LearnGlossary } from "@/components/learn/LearnGlossary";
import { useLanguage } from "@/components/LanguageProvider";
import { essentialTools, topLearnArticles } from "@/lib/learn-core";
import { getArticleNeighbors, getGroupedArticles, getLearnEntry, getRelatedArticles, localizeText } from "@/lib/learn";


function LearnNotFound() {
  const { language } = useLanguage();

  return (
    <main className="min-h-screen bg-ink text-white">
      <SiteHeader />
      <section className="mx-auto max-w-[980px] px-5 py-14 md:px-8">
        <div className="panel rounded-[22px] p-8 text-center">
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">
            {language === "pt-BR" ? "Aprender" : "Learn"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-white">
            {language === "pt-BR" ? "Conteudo nao encontrado" : "Content not found"}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/60">
            {language === "pt-BR"
              ? "Esse modulo ainda nao foi publicado ou o caminho informado nao existe."
              : "This module has not been published yet or the provided path does not exist."}
          </p>
          <Link className="mt-6 inline-flex rounded-[10px] bg-white px-5 py-3 font-mono text-[12px] uppercase tracking-[0.16em] text-black" href="/learn">
            {language === "pt-BR" ? "Voltar ao hub" : "Back to hub"}
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

export default function LearnPage() {
  const { language } = useLanguage();
  const params = useParams<{ slug?: string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug : params.slug ? [params.slug] : undefined;
  const entry = getLearnEntry(slug);

  if (!entry) {
    return <LearnNotFound />;
  }

  const ui = {
    learn: language === "pt-BR" ? "Aprender" : "Learn",
    hubEyebrow: language === "pt-BR" ? "Hub de aprendizado" : "Learning hub",
    featured: language === "pt-BR" ? "Modulos em destaque" : "Featured modules",
    paths: language === "pt-BR" ? "Trilhas" : "Paths",
    tools: language === "pt-BR" ? "Ferramentas essenciais" : "Essential tools",
    tips: language === "pt-BR" ? "Dicas rapidas" : "Quick tips",
    modules: language === "pt-BR" ? "Abrir modulo" : "Open module",
    outline: language === "pt-BR" ? "Etapas desta pagina" : "Page outline",
    group: language === "pt-BR" ? "Modulos relacionados" : "Related modules",
    related: language === "pt-BR" ? "Continuar estudando" : "Keep learning",
    previous: language === "pt-BR" ? "Anterior" : "Previous",
    next: language === "pt-BR" ? "Proximo" : "Next",
    toolsUsed: language === "pt-BR" ? "Ferramentas sugeridas" : "Suggested tools",
    startHere: language === "pt-BR" ? "Comece por aqui" : "Start here",
    startCards: {
      safe: {
        title: language === "pt-BR" ? "Monte um ambiente seguro" : "Build a safe environment",
        description: language === "pt-BR" ? "Primeiro passo para qualquer pessoa que vai tocar em amostras suspeitas." : "First step for anyone touching suspicious samples."
      },
      read: {
        title: language === "pt-BR" ? "Aprenda a ler o relatorio" : "Learn to read the report",
        description: language === "pt-BR" ? "Entenda score, IOC, strings e quando parar antes de arriscar." : "Understand score, IOC, strings, and when to stop before taking risks."
      },
      research: {
        title: language === "pt-BR" ? "Pesquise ameacas publicas" : "Research public threats",
        description: language === "pt-BR" ? "Veja relatorios indexados de alto risco sem depender do executavel." : "Browse indexed high-risk reports without depending on the executable."
      }
    },
    outcomes: language === "pt-BR" ? "O que voce consegue fazer aqui" : "What you can do here"
  };

  if (entry.kind === "hub") {
    return (
      <main className="min-h-screen bg-ink text-white">
        <SiteHeader />
        <section className="mx-auto max-w-[1180px] px-5 py-10 md:px-8 md:py-12">
          <div className="mx-auto max-w-[1080px]">
            <div className="panel rounded-[24px] p-8 md:p-10">
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-white/38">{ui.hubEyebrow}</p>
              <h1 className="mt-4 text-3xl font-semibold text-white md:text-5xl">{localizeText(entry.title, language)}</h1>
              <p className="mt-5 max-w-4xl text-sm leading-8 text-white/62">{localizeText(entry.description, language)}</p>
              <div className="mt-6">
                <Callout type="info">{localizeText(entry.disclaimer, language)}</Callout>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <Link className="rounded-[18px] border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/18" href="/learn/environment">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/38">{ui.startHere}</div>
                  <div className="mt-3 text-lg font-semibold text-white">{ui.startCards.safe.title}</div>
                  <p className="mt-3 text-sm leading-7 text-white/60">{ui.startCards.safe.description}</p>
                </Link>
                <Link className="rounded-[18px] border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/18" href="/learn/basics">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/38">{ui.startHere}</div>
                  <div className="mt-3 text-lg font-semibold text-white">{ui.startCards.read.title}</div>
                  <p className="mt-3 text-sm leading-7 text-white/60">{ui.startCards.read.description}</p>
                </Link>
                <Link className="rounded-[18px] border border-white/10 bg-white/[0.02] p-5 transition hover:border-white/18" href="/reports">
                  <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/38">{ui.startHere}</div>
                  <div className="mt-3 text-lg font-semibold text-white">{ui.startCards.research.title}</div>
                  <p className="mt-3 text-sm leading-7 text-white/60">{ui.startCards.research.description}</p>
                </Link>
              </div>
            </div>

            <section className="mt-12">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">{ui.outcomes}</p>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="panel rounded-[18px] p-5">
                  <div className="text-lg font-semibold text-white">{language === "pt-BR" ? "Interpretar resultados" : "Interpret results"}</div>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    {language === "pt-BR"
                      ? "Entender score, family, IOC, imports, strings e proximos passos sem depender de tentativa e erro."
                      : "Understand score, family, IOC, imports, strings, and next steps without relying on guesswork."}
                  </p>
                </div>
                <div className="panel rounded-[18px] p-5">
                  <div className="text-lg font-semibold text-white">{language === "pt-BR" ? "Escolher a ferramenta certa" : "Choose the right tool"}</div>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    {language === "pt-BR"
                      ? "Saber quando usar Ghidra, dnSpy, PEStudio, FLOSS, YARA e sandbox."
                      : "Know when to use Ghidra, dnSpy, PEStudio, FLOSS, YARA, and a sandbox."}
                  </p>
                </div>
                <div className="panel rounded-[18px] p-5">
                  <div className="text-lg font-semibold text-white">{language === "pt-BR" ? "Seguir um fluxo seguro" : "Follow a safe workflow"}</div>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    {language === "pt-BR"
                      ? "Aprender a pesquisar ameacas e aprofundar a analise sem colocar a maquina principal em risco."
                      : "Learn how to research threats and go deeper without putting your main machine at risk."}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-12">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">{ui.paths}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{ui.paths}</h2>
                </div>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {entry.paths.map((pathGroup) => (
                  <div key={localizeText(pathGroup.title, language)} className="panel rounded-[18px] p-5">
                    <div className="text-lg font-semibold text-white">{localizeText(pathGroup.title, language)}</div>
                    <div className="mt-4 space-y-2">
                      {pathGroup.items.map((item) => (
                        <Link key={item.href} className="block rounded-[12px] border border-white/8 bg-white/[0.015] px-4 py-3 text-sm text-white/70 transition hover:border-white/16 hover:text-white" href={item.href}>
                          {localizeText(item.label, language)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">{ui.featured}</p>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {topLearnArticles.map((article) => (
                  <Link key={article.slug} className="panel rounded-[18px] p-5 transition hover:border-white/16" href={`/learn/${article.slug}`}>
                    <div className="flex items-center gap-3">
                      <DifficultyBadge level={article.difficulty} />
                      <TimeBadge minutes={article.minutes} />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">{localizeText(article.title, language)}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/60">{localizeText(article.description, language)}</p>
                    <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">{ui.modules}</div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">{ui.tools}</p>
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {essentialTools.map((tool) => (
                  <ToolCard
                    key={tool.name}
                    description={localizeText(tool.description, language)}
                    downloadUrl={tool.downloadUrl}
                    name={tool.name}
                    os={tool.os}
                    price={tool.price}
                    version={tool.version}
                  />
                ))}
              </div>
            </section>

            <section className="mt-12">
              <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">{ui.tips}</p>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {entry.tips.map((tip) => (
                  <div key={tip.pt} className="panel-alt rounded-[16px] p-5 text-sm leading-7 text-white/68">
                    {localizeText(tip, language)}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <LearnGlossary compact />
              <div className="mt-5">
                <Link
                  className="inline-flex rounded-full border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-white/62 transition hover:border-white/18 hover:text-white"
                  href="/learn/glossary"
                >
                  {language === "pt-BR" ? "abrir glossario completo" : "open full glossary"}
                </Link>
              </div>
            </section>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const siblings = getGroupedArticles(entry);
  const related = getRelatedArticles(entry);
  const neighbors = getArticleNeighbors(entry);
  const siblingLinks = siblings.map((item) => ({
    href: `/learn/${item.slug}`,
    label: localizeText(item.title, language)
  }));

  return (
    <main className="min-h-screen bg-ink text-white">
      <SiteHeader />
      <section className="mx-auto max-w-[1180px] px-5 py-10 md:px-8">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-8 flex flex-wrap items-center gap-2 font-mono text-[12px] uppercase tracking-[0.14em] text-white/38">
            <Link className="transition hover:text-white/70" href="/">{language === "pt-BR" ? "Painel" : "Dashboard"}</Link>
            <span>/</span>
            <Link className="transition hover:text-white/70" href="/learn">{ui.learn}</Link>
            <span>/</span>
            <span className="text-white/58">{localizeText(entry.title, language)}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.7fr_0.8fr]">
            <div className="space-y-8">
              <div className="panel rounded-[22px] p-7 md:p-8">
                <div className="flex flex-wrap items-center gap-3">
                  <DifficultyBadge level={entry.difficulty} />
                  <TimeBadge minutes={entry.minutes} />
                </div>
                <h1 className="mt-5 text-3xl font-semibold text-white md:text-4xl">{localizeText(entry.title, language)}</h1>
                <p className="mt-4 text-sm leading-8 text-white/62">{localizeText(entry.description, language)}</p>
                <div className="mt-6">
                  <SafetyWarning type={entry.safety} />
                </div>
              </div>

              {entry.tools?.length ? (
                <section>
                  <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">{ui.toolsUsed}</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {entry.tools.map((tool) => (
                      <ToolCard
                        key={tool.name}
                        description={localizeText(tool.description, language)}
                        downloadUrl={tool.downloadUrl}
                        name={tool.name}
                        os={tool.os}
                        price={tool.price}
                        version={tool.version}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {entry.steps.map((item, index) => (
                <div id={item.id} key={item.id}>
                  <Step number={index + 1} title={localizeText(item.title, language)}>
                    {item.paragraphs.map((paragraph) => (
                      <p key={paragraph.pt}>{localizeText(paragraph, language)}</p>
                    ))}
                    {item.bullets?.length ? (
                      <ul className="space-y-2">
                        {item.bullets.map((bullet) => (
                          <li key={bullet.pt}>{localizeText(bullet, language)}</li>
                        ))}
                      </ul>
                    ) : null}
                    {item.callout ? <Callout type={item.callout.type}>{localizeText(item.callout.text, language)}</Callout> : null}
                    {item.code ? <CodeBlock codeLanguage={item.code.language}>{item.code.value}</CodeBlock> : null}
                    {item.comparison ? (
                      <CodeComparison
                        after={{ code: item.comparison.after.code, label: localizeText(item.comparison.after.label, language) }}
                        before={{ code: item.comparison.before.code, label: localizeText(item.comparison.before.label, language) }}
                      />
                    ) : null}
                  </Step>
                </div>
              ))}

              {entry.slug === "glossary" ? <LearnGlossary /> : null}

              {(neighbors.previous || neighbors.next) ? (
                <section className="grid gap-4 md:grid-cols-2">
                  <div className="panel-alt rounded-[18px] p-5">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/38">{ui.previous}</div>
                    {neighbors.previous ? (
                      <Link className="mt-3 block text-lg font-semibold text-white transition hover:text-white/80" href={`/learn/${neighbors.previous.slug}`}>
                        {localizeText(neighbors.previous.title, language)}
                      </Link>
                    ) : (
                      <div className="mt-3 text-sm text-white/38">-</div>
                    )}
                  </div>
                  <div className="panel-alt rounded-[18px] p-5">
                    <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/38">{ui.next}</div>
                    {neighbors.next ? (
                      <Link className="mt-3 block text-lg font-semibold text-white transition hover:text-white/80" href={`/learn/${neighbors.next.slug}`}>
                        {localizeText(neighbors.next.title, language)}
                      </Link>
                    ) : (
                      <div className="mt-3 text-sm text-white/38">-</div>
                    )}
                  </div>
                </section>
              ) : null}

              {related.length ? (
                <section>
                  <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/40">{ui.related}</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {related.map((article) => (
                      <Link key={article.slug} className="panel-alt rounded-[18px] p-5 transition hover:border-white/16" href={`/learn/${article.slug}`}>
                        <div className="text-lg font-semibold text-white">{localizeText(article.title, language)}</div>
                        <p className="mt-3 text-sm leading-7 text-white/60">{localizeText(article.description, language)}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              {siblingLinks.length > 1 ? (
                <TutorialProgress activePath={`/learn/${entry.slug}`} steps={siblingLinks} />
              ) : null}

              <div className="panel rounded-[18px] p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">{ui.outline}</div>
                <div className="mt-4 space-y-2">
                  {entry.steps.map((item, index) => (
                    <a
                      className="block rounded-[12px] px-3 py-2 text-sm text-white/58 transition hover:bg-white/[0.03] hover:text-white/82"
                      href={`#${item.id}`}
                      key={item.id}
                    >
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/35">0{index + 1}</span>
                      <span className="ml-3">{localizeText(item.title, language)}</span>
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
