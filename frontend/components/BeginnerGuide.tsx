"use client";

import { useLanguage } from "@/components/LanguageProvider";


export function BeginnerGuide() {
  const { copy } = useLanguage();
  const items = [
    copy.home.beginnerSteps.send,
    copy.home.beginnerSteps.review,
    copy.home.beginnerSteps.decide,
  ];

  return (
    <section className="panel rounded-[20px] p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-white/45">{copy.home.beginnerTitle}</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{copy.home.beginnerTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{copy.home.beginnerDescription}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <div key={item.title} className="panel-alt rounded-[16px] p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/35">0{index + 1}</div>
            <div className="mt-4 text-lg font-semibold text-white">{item.title}</div>
            <p className="mt-3 text-sm leading-7 text-white/58">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
