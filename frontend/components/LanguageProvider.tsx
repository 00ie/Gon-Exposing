"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { translations, type AppLanguage, type TranslationDictionary } from "@/lib/translations";

const STORAGE_KEY = "gon-language";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  copy: TranslationDictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function normalizeLanguage(value: string | null | undefined): AppLanguage | null {
  if (value === "pt-BR" || value === "en") {
    return value;
  }
  return null;
}

function readCookieLanguage(): AppLanguage | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${STORAGE_KEY}=`));

  if (!match) {
    return null;
  }

  const value = decodeURIComponent(match.split("=").slice(1).join("="));
  return normalizeLanguage(value);
}

function persistLanguage(language: AppLanguage) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, language);
  }

  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
    document.cookie = `${STORAGE_KEY}=${encodeURIComponent(language)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setReady(true);
      return;
    }

    const saved = normalizeLanguage(window.localStorage.getItem(STORAGE_KEY)) ?? readCookieLanguage();
    if (saved) {
      setLanguage(saved);
      if (typeof document !== "undefined") {
        document.documentElement.lang = saved;
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    persistLanguage(language);
  }, [language, ready]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      const nextLanguage = normalizeLanguage(event.newValue) ?? readCookieLanguage();
      if (nextLanguage) {
        setLanguage(nextLanguage);
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorage);
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: AppLanguage) => {
        setLanguage(nextLanguage);
        persistLanguage(nextLanguage);
      },
      copy: translations[language],
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
