"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOCALE,
  dictionaries,
  STORAGE_KEY,
  type Dictionary,
  type Locale,
} from "@/i18n/locales";
import {
  localeFromPathname,
  localizedPath,
  stripLocalePrefix,
} from "@/lib/i18n/routing";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: ReactNode;
  initialLocale?: Locale;
};

export function I18nProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: I18nProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const fromPath = localeFromPathname(pathname);
    if (fromPath && fromPath !== locale) {
      setLocaleState(fromPath);
    }
  }, [pathname, locale]);

  useEffect(() => {
    document.documentElement.lang = locale === "uk" ? "uk" : locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode */
      }
      document.documentElement.lang = next === "uk" ? "uk" : next;
      const rest = stripLocalePrefix(pathname);
      router.push(localizedPath(next, rest));
    },
    [pathname, router],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: dictionaries[locale],
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
