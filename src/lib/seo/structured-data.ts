import { DEFAULT_LOCALE, LOCALES, dictionaries, type Locale } from "@/i18n/locales";
import type { ToolId } from "@/i18n/types";
import { getSeoCopy } from "@/i18n/seo/copy";
import { homeRoute, localizedPath, toolRoute } from "@/lib/i18n/routing";
import { absoluteUrl, HREFLANG_MAP } from "@/lib/seo/site";

function siblingOrigin(name: string, fallback: string): string | null {
  const value = process.env[name]?.trim().replace(/\/$/, "");
  return value || fallback;
}

function ecosystemRelatedUrls(): string[] {
  return [
    siblingOrigin("NEXT_PUBLIC_PUREPDF_URL", "https://purepdf.app"),
    siblingOrigin("NEXT_PUBLIC_PUREQR_URL", "https://pureqr.app"),
    siblingOrigin("NEXT_PUBLIC_PURESIGN_URL", "https://puresign.app"),
  ]
    .filter((origin): origin is string => Boolean(origin))
    .map((origin) => `${origin}${localizedPath(DEFAULT_LOCALE, "/")}`);
}

export function buildHomeStructuredData(locale: Locale) {
  const copy = getSeoCopy("home", locale);
  const url = absoluteUrl(homeRoute(locale));

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PureTable",
      url,
      description: copy.description,
      inLanguage: HREFLANG_MAP[locale],
      sameAs: ecosystemRelatedUrls(),
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "PureTable",
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url,
      description: copy.description,
      isAccessibleForFree: true,
    },
  ];
}

export function buildToolStructuredData(toolId: ToolId, locale: Locale) {
  const tool = dictionaries[locale].tools[toolId];
  const seo = getSeoCopy(toolId, locale);
  const url = absoluteUrl(toolRoute(locale, toolId));

  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: tool.title,
      applicationCategory: "BusinessApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url,
      description: seo.description,
      isAccessibleForFree: true,
      provider: {
        "@type": "Organization",
        name: "PureTable",
        url: absoluteUrl(homeRoute(locale)),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "PureTable",
          item: absoluteUrl(homeRoute(locale)),
        },
        { "@type": "ListItem", position: 2, name: tool.title, item: url },
      ],
    },
  ];
}

export function buildSitemapLanguageAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[HREFLANG_MAP[locale]] = absoluteUrl(localizedPath(locale, path));
  }
  languages["x-default"] = absoluteUrl(localizedPath(DEFAULT_LOCALE, path));
  return languages;
}
