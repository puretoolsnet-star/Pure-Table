import { de } from "@/i18n/dictionaries/de";
import { en } from "@/i18n/dictionaries/en";
import { es } from "@/i18n/dictionaries/es";
import { fr } from "@/i18n/dictionaries/fr";
import { pl } from "@/i18n/dictionaries/pl";
import { uk } from "@/i18n/dictionaries/uk";
import type { Dictionary } from "@/i18n/types";

export const LOCALES = ["uk", "en", "de", "fr", "es", "pl"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE = "uk" satisfies Locale;

export const dictionaries: Record<Locale, Dictionary> = {
  uk,
  en,
  de,
  fr,
  es,
  pl,
};

export const LOCALE_LABELS: Record<
  Locale,
  { code: string; native: string; flag: string }
> = {
  uk: { code: "UA", native: "Українська", flag: "🇺🇦" },
  en: { code: "EN", native: "English", flag: "🇬🇧" },
  de: { code: "DE", native: "Deutsch", flag: "🇩🇪" },
  fr: { code: "FR", native: "Français", flag: "🇫🇷" },
  es: { code: "ES", native: "Español", flag: "🇪🇸" },
  pl: { code: "PL", native: "Polski", flag: "🇵🇱" },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export const STORAGE_KEY = "puretable-locale";

export type { Dictionary, ToolId } from "@/i18n/types";
export { TOOL_IDS } from "@/i18n/types";
