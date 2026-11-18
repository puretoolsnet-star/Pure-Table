import type { MetadataRoute } from "next";

import { LOCALES, TOOL_IDS } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18n/routing";
import { buildSitemapLanguageAlternates } from "@/lib/seo/structured-data";
import { absoluteCanonicalUrl } from "@/lib/seo/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: absoluteCanonicalUrl(localizedPath(locale, "/")),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: buildSitemapLanguageAlternates("/") },
    });
  }

  for (const hubPath of ["/table", "/pro"]) {
    for (const locale of LOCALES) {
      entries.push({
        url: absoluteCanonicalUrl(localizedPath(locale, hubPath)),
        lastModified,
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
        url: absoluteCanonicalUrl(localizedPath(locale, path)),
        lastModified,
        changeFrequency: "monthly",
        priority: 0.9,
        alternates: { languages: buildSitemapLanguageAlternates(path) },
      });
    }
  }

  return entries;
}
