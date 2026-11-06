import type { Locale } from "@/i18n/locales";
import { isLocale, TOOL_IDS } from "@/i18n/locales";
import type { SeoPageId } from "@/i18n/seo/copy";

const OG_IMAGE_PATH = "/og";

export function isSeoPageId(value: string): value is SeoPageId {
  if (value === "home") return true;
  return (TOOL_IDS as readonly string[]).includes(value);
}

export function buildOgImageUrl(locale: Locale, page: SeoPageId): string {
  const params = new URLSearchParams({ locale, page });
  return `${OG_IMAGE_PATH}?${params.toString()}`;
}

export function parseOgImageQuery(searchParams: URLSearchParams): {
  locale: Locale;
  page: SeoPageId;
} | null {
  const localeRaw = searchParams.get("locale") ?? "";
  const pageRaw = searchParams.get("page") ?? "home";
  if (!isLocale(localeRaw) || !isSeoPageId(pageRaw)) return null;
  return { locale: localeRaw, page: pageRaw };
}
