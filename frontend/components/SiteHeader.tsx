"use client";

import Link from "next/link";

import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
import { site } from "@/lib/site";


export function SiteHeader() {
  const { copy } = useLanguage();

  return (
    <header className="border-b border-white/8 bg-black/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-5 md:px-8">
        <Link className="group flex items-center gap-3" href="/">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-[14px] border border-red-500/15 bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_24px_rgba(0,0,0,0.24)] transition group-hover:border-red-400/25">
            <span className="absolute inset-[5px] rounded-full border border-white/6" />
            <img alt={site.name} className="relative h-7 w-7 rounded-full object-cover" height={28} src={`/icon.jpg?v=${site.assetVersion}`} width={28} />
          </span>
          <span className="text-base font-semibold tracking-tight text-white transition group-hover:text-white/90">{site.brand}</span>
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          <nav className="hidden items-center gap-6 font-mono text-[12px] uppercase tracking-[0.16em] text-white/45 md:flex">
            <Link className="transition hover:text-white" href="/">
              {copy.header.dashboard}
            </Link>
            <Link className="transition hover:text-white" href="/#pesquisa">
              {copy.header.search}
            </Link>
            <Link className="transition hover:text-white" href="/learn">
              {copy.header.learn}
            </Link>
            <Link className="transition hover:text-white" href="/reports">
              {copy.header.reports}
            </Link>
          </nav>

          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
