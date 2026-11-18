import type { SeoPageId } from "@/i18n/seo/copy";

export function seoPathForPage(page: SeoPageId): string {
  if (page === "home") return "/";
  if (page === "pro") return "/pro";
  if (page === "table") return "/table";
  return `/tools/${page}`;
}