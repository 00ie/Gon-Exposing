"use client";

import { ReactNode, useState } from "react";

import { useLanguage } from "@/components/LanguageProvider";


interface CollapsiblePanelProps {
  title: string;
  eyebrow?: string;
  badge?: ReactNode;
  children: ReactNode;
  defaultCollapsed?: boolean;
  accentClassName?: string;
  className?: string;
  bodyClassName?: string;
}

export function CollapsiblePanel({
  title,
  eyebrow,
  badge,
  children,
  defaultCollapsed = false,
  accentClassName = "text-white/55",
  className = "",
  bodyClassName = ""
}: CollapsiblePanelProps) {
  const { copy } = useLanguage();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section className={`panel overflow-hidden rounded-[22px] p-6 ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className={`font-mono text-[12px] uppercase tracking-[0.16em] ${accentClassName}`}>{eyebrow}</p>
          ) : null}
          <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {badge ? badge : null}
          <button
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/55 transition hover:border-white/20 hover:text-white"
            onClick={() => setCollapsed((current) => !current)}
            type="button"
          >
            <span>{collapsed ? copy.common.expand : copy.common.collapse}</span>
            <span className="text-white/40">{collapsed ? "+" : "-"}</span>
          </button>
        </div>
      </div>

      {!collapsed ? <div className={`mt-6 min-w-0 ${bodyClassName}`.trim()}>{children}</div> : null}
    </section>
  );
}
