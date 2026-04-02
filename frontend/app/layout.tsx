import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import { LanguageProvider } from "@/components/LanguageProvider";
import { site } from "@/lib/site";

import "./globals.css";


const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans"
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "Gon Exposing",
  description: "Static analysis, IOC triage, and responsible reporting for suspicious files, URLs, and hashes.",
  icons: {
    icon: `/icon.jpg?v=${site.assetVersion}`,
    shortcut: `/icon.jpg?v=${site.assetVersion}`,
    apple: `/icon.jpg?v=${site.assetVersion}`,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning className={`${sans.variable} ${mono.variable} bg-ink font-sans text-white`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
