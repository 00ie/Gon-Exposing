import { childLearnArticles } from "@/lib/learn-children";
import { learnHub, topLearnArticles } from "@/lib/learn-core";
import type { LearnArticle, LearnEntry, Localized } from "@/lib/learn-types";


export const learnArticles: LearnArticle[] = [...topLearnArticles, ...childLearnArticles];

export function localizeText(value: Localized, language: "pt-BR" | "en"): string {
  return language === "en" ? value.en : value.pt;
}

export function getLearnEntry(slugParts?: string[]): LearnEntry | null {
  if (!slugParts?.length) {
    return learnHub;
  }

  const slug = slugParts.join("/");
  return learnArticles.find((article) => article.slug === slug) ?? null;
}

export function getArticleNeighbors(article: LearnArticle): {
  previous: LearnArticle | null;
  next: LearnArticle | null;
} {
  const groupArticles = getGroupedArticles(article);
  const index = groupArticles.findIndex((item) => item.slug === article.slug);
  return {
    previous: index > 0 ? groupArticles[index - 1] : null,
    next: index >= 0 && index < groupArticles.length - 1 ? groupArticles[index + 1] : null
  };
}

export function getGroupedArticles(article: LearnArticle): LearnArticle[] {
  if (!article.group) {
    return [article];
  }

  return learnArticles.filter((item) => item.group === article.group || item.slug === article.group);
}

export function getRelatedArticles(article: LearnArticle): LearnArticle[] {
  const related = new Set(article.related ?? []);
  return learnArticles.filter((item) => related.has(`/learn/${item.slug}`));
}
