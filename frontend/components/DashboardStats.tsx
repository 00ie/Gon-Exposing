"use client";

import { ReactNode, useEffect, useState } from "react";

import { useLanguage } from "@/components/LanguageProvider";
import { ScanSummary, getRecentScans } from "@/lib/api";


const SUPPORTED_FAMILIES = 77;

type StatCard = {
  label: string;
  value: number;
  icon: ReactNode;
};

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="m12 4 8 15H4l8-15Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M12 9v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="m12 5 8 4.5-8 4.5L4 9.5 12 5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="m4 13.5 8 4.5 8-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="m4 17.5 8 4.5 8-4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M8 3.75h5.5L19 9.25V20H8V3.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M13 3.75v5.5h6" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
    </svg>
  );
}

function isRecent(createdAt: string, now: number) {
  const timestamp = Date.parse(createdAt);
  if (Number.isNaN(timestamp)) {
    return false;
  }

  return now - timestamp <= 24 * 60 * 60 * 1000;
}

function isThreat(row: ScanSummary) {
  return row.classification === "MEDIUM" || row.classification === "HIGH" || row.classification === "CRITICAL";
}

export function DashboardStats() {
  const { copy } = useLanguage();
  const [rows, setRows] = useState<ScanSummary[]>([]);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const recent = await getRecentScans(50);
        if (active) {
          setRows(recent);
        }
      } catch {
        if (active) {
          setRows([]);
        }
      }
    }

    load();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, 45000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const now = Date.now();
  const scans24h = rows.filter((row) => isRecent(row.created_at, now)).length;
  const threatsRecent = rows.filter(isThreat).length;
  const totalSamples = rows.length;

  const cards: StatCard[] = [
    { label: copy.stats.scans24h, value: scans24h, icon: <SearchIcon /> },
    { label: copy.stats.threatsRecent, value: threatsRecent, icon: <WarningIcon /> },
    { label: copy.stats.supportedFamilies, value: SUPPORTED_FAMILIES, icon: <LayersIcon /> },
    { label: copy.stats.totalSamples, value: totalSamples, icon: <FileIcon /> }
  ];

  return (
    <section className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="panel-alt rounded-[18px] px-6 py-7 md:px-7 md:py-8">
          <div className="text-white/45">{card.icon}</div>
          <div className="mt-8 font-mono text-4xl leading-none text-white">{card.value}</div>
          <div className="mt-4 font-mono text-[12px] uppercase tracking-[0.16em] text-white/55">{card.label}</div>
        </div>
      ))}
    </section>
  );
}
