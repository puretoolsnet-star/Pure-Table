import type { MetadataRoute } from "next";

import { LOCALES, TOOL_IDS } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18n/routing";
import { buildSitemapLanguageAlternates } from "@/lib/seo/structured-data";
import { absoluteUrl } from "@/lib/seo/site";

const LAST_MODIFIED = new Date("2026-11-06");

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: absoluteUrl(localizedPath(locale, "/")),
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: buildSitemapLanguageAlternates("/") },
    });
  }

  for (const hubPath of ["/table", "/pro"]) {
    for (const locale of LOCALES) {
      entries.push({
        url: absoluteUrl(localizedPath(locale, hubPath)),
        lastModified: LAST_MODIFIED,
        changeFrequency: "weekly",
        priority: 0.95,
        alternates: { languages: buildSitemapLanguageAlternates(hubPath) },
      });
    }
  }

  for (const toolId of TOOL_IDS) {
    const path = `/tools/${toolId}`;
    for (const locale of LOCALES) {
      entries.push({
        url: absoluteUrl(localizedPath(locale, path)),
        lastModified: LAST_MODIFIED,
        changeFrequency: "monthly",
        priority: 0.9,
        alternates: { languages: buildSitemapLanguageAlternates(path) },
      });
    }
  }

  return entries;
}
