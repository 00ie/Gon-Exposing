import type { DifficultyLevel, SafetyType, CalloutType } from "@/components/learn/LearnBlocks";


export type Localized = {
  pt: string;
  en: string;
};

export type LearnTool = {
  name: string;
  version: string;
  description: Localized;
  downloadUrl: string;
  os: string[];
  price: string;
};

export type LearnStep = {
  id: string;
  title: Localized;
  paragraphs: Localized[];
  bullets?: Localized[];
  callout?: {
    type: CalloutType;
    text: Localized;
  };
  code?: {
    language: "python" | "bash" | "powershell" | "text" | "yara" | "csharp";
    value: string;
  };
  comparison?: {
    before: { label: Localized; code: string };
    after: { label: Localized; code: string };
  };
};

export type LearnArticle = {
  kind: "article";
  slug: string;
  title: Localized;
  description: Localized;
  difficulty: DifficultyLevel;
  minutes: number;
  safety: SafetyType;
  group?: string;
  steps: LearnStep[];
  tools?: LearnTool[];
  related?: string[];
};

export type LearnHub = {
  kind: "hub";
  slug: "";
  title: Localized;
  description: Localized;
  disclaimer: Localized;
  paths: {
    title: Localized;
    items: { href: string; label: Localized }[];
  }[];
  tools: LearnTool[];
  tips: Localized[];
};

export type LearnEntry = LearnHub | LearnArticle;

export function text(pt: string, en: string): Localized {
  return { pt, en };
}
