import type { Locale } from "@/i18n/locales";

export const OCR_LANG_BY_LOCALE: Record<Locale, string> = {
  uk: "ukr+eng",
  en: "eng",
  de: "deu+eng",
  fr: "fra+eng",
  es: "spa+eng",
  pl: "pol+eng",
};

export const OCR_LANG_SELECT_VALUES = [
  "auto",
  "ukr+eng",
  "eng",
  "deu+eng",
  "fra+eng",
  "spa+eng",
  "pol+eng",
] as const;

export type OcrLangSelect = (typeof OCR_LANG_SELECT_VALUES)[number];

export function resolveOcrLang(choice: OcrLangSelect, locale: Locale): string {
  if (choice === "auto") return OCR_LANG_BY_LOCALE[locale];
  return choice;
}