import { DEFAULT_LOCALE, type Locale } from "@/i18n/locales";

export { DEFAULT_LOCALE };

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;

  return "https://puretable.app";
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

export const HREFLANG_MAP: Record<Locale, string> = {
  uk: "uk-UA",
  en: "en",
  de: "de",
  fr: "fr",
  es: "es",
  pl: "pl",
};

export const OPEN_GRAPH_LOCALE: Record<Locale, string> = {
  uk: "uk_UA",
  en: "en_GB",
  de: "de_DE",
  fr: "fr_FR",
  es: "es_ES",
  pl: "pl_PL",
};
