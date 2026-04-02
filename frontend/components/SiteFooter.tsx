"use client";

import Link from "next/link";

import { DiscordIcon, FileIcon, GithubIcon, HomeIcon, LearnIcon, LockIcon, ReportIcon, SearchIcon, ShieldIcon, TelegramIcon } from "@/components/UiIcons";
import { useLanguage } from "@/components/LanguageProvider";
import { site } from "@/lib/site";


function IconLink({
  href,
  label,
  children,
  external = false
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/42 transition hover:border-white/18 hover:text-white";

  if (external) {
    return (
      <a aria-label={label} className={className} href={href} rel="noreferrer" target="_blank" title={label}>
        {children}
        <span className="sr-only">{label}</span>
      </a>
    );
  }

  return (
    <Link aria-label={label} className={className} href={href} title={label}>
      {children}
      <span className="sr-only">{label}</span>
    </Link>
  );
}

export function SiteFooter() {
  const { copy } = useLanguage();

  return (
    <footer className="border-t border-white/8 bg-black/70">
      <div className="mx-auto max-w-[1180px] px-5 py-8 md:px-8">
        <div className="grid gap-8 border-b border-white/8 pb-8 md:grid-cols-[1.1fr_0.9fr_1fr]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/30">{copy.footer.navigation}</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <IconLink href="/" label={copy.header.dashboard}>
                <HomeIcon />
              </IconLink>
              <IconLink href="/#pesquisa" label={copy.header.search}>
                <SearchIcon />
              </IconLink>
              <IconLink href="/learn" label={copy.header.learn}>
                <LearnIcon />
              </IconLink>
              <IconLink href="/reports" label={copy.header.reports}>
                <ReportIcon />
              </IconLink>
              <IconLink href="/privacy" label={copy.footer.privacy}>
                <LockIcon />
              </IconLink>
              <IconLink href="/terms" label={copy.footer.terms}>
                <FileIcon />
              </IconLink>
            </div>
          </div>

          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/30">{copy.footer.contact}</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <IconLink external href={site.server} label="Discord">
                <DiscordIcon />
              </IconLink>
              <IconLink external href={site.github} label="GitHub">
                <GithubIcon />
              </IconLink>
              <IconLink external href={site.telegram} label="Telegram">
                <TelegramIcon />
              </IconLink>
            </div>
          </div>

          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/30">{copy.footer.system}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/55">
                <ShieldIcon className="h-3.5 w-3.5" />
                {copy.footer.staticOnly}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/55">
                <SearchIcon className="h-3.5 w-3.5" />
                {copy.footer.searchIndex}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-white/55">
                <FileIcon className="h-3.5 w-3.5" />
                {copy.footer.responsibleReporting}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="font-mono text-[12px] text-white/34">{site.name}</div>
          <div className="font-mono text-[12px] text-white/34">
            2026 {site.brand}. {copy.footer.rights}
          </div>
        </div>
      </div>
    </footer>
  );
}
