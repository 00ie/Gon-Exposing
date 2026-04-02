"use client";

import { CommunityCard } from "@/components/CommunityCard";
import { BeginnerGuide } from "@/components/BeginnerGuide";
import { DashboardStats } from "@/components/DashboardStats";
import { SearchPanel } from "@/components/SearchPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { UploadSection } from "@/components/UploadSection";
import { RecentScans } from "@/components/RecentScans";
import { useLanguage } from "@/components/LanguageProvider";


export default function HomePage() {
  const { copy } = useLanguage();

  return (
    <main className="min-h-screen bg-ink text-white">
      <SiteHeader />

      <section className="mx-auto max-w-[1180px] px-5 pb-20 pt-8 md:px-8 md:pb-24 md:pt-10">
        <div className="mx-auto max-w-[1080px]">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
            <div>
              <div className="mb-8">
                <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/45">{copy.home.eyebrow}</p>
                <h1 className="mt-3 max-w-3xl text-3xl font-semibold text-white md:text-4xl">
                  {copy.home.title}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58">
                  {copy.home.subtitle}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/50">
                    {copy.home.tags.staticOnly}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/50">
                    {copy.home.tags.noExecution}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-white/50">
                    {copy.home.tags.responsibleReporting}
                  </span>
                </div>
              </div>

              <UploadSection />
            </div>

            <CommunityCard />
          </div>
        </div>

        <div className="mx-auto max-w-[1080px]">
          <DashboardStats />
        </div>

        <div className="mx-auto mt-14 max-w-[1080px]">
          <BeginnerGuide />
        </div>

        <div className="mx-auto mt-14 max-w-[1080px]">
          <SearchPanel />
        </div>

        <div className="mx-auto mt-20 max-w-[1080px] border-t border-white/6 pt-10" id="relatorios">
          <RecentScans />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
