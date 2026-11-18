import { DEFAULT_LOCALE, LOCALES, dictionaries, type Locale } from "@/i18n/locales";
import type { ToolId } from "@/i18n/types";
import type { SeoPageId } from "@/i18n/seo/copy";
import { getSeoCopy } from "@/i18n/seo/copy";
import { getPageSeoContent } from "@/i18n/seo/page-content";
import { homeRoute, localizedPath, toolRoute } from "@/lib/i18n/routing";
import { seoPathForPage } from "@/lib/seo/paths";
import { absoluteCanonicalUrl, HREFLANG_MAP } from "@/lib/seo/site";

function siblingOrigin(name: string, fallback: string): string | null {
  const value = process.env[name]?.trim().replace(/\/$/, "");
  return value || fallback;
}

function ecosystemRelatedUrls(): string[] {
  return [
    siblingOrigin("NEXT_PUBLIC_ECOSYSTEM_PUREPDF_URL", "https://pdf.kixt.net"),
    siblingOrigin("NEXT_PUBLIC_ECOSYSTEM_PUREQR_URL", "https://qr.kixt.net"),
    siblingOrigin("NEXT_PUBLIC_ECOSYSTEM_PURESIGN_URL", "https://sign.kixt.net"),
  ]
    .filter((origin): origin is string => Boolean(origin))
    .map((origin) => `${origin}${localizedPath(DEFAULT_LOCALE, "/")}`);
}

export function buildHomeStructuredData(locale: Locale) {
  const copy = getSeoCopy("home", locale);
  const url = absoluteCanonicalUrl(homeRoute(locale));

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
  const url = absoluteCanonicalUrl(toolRoute(locale, toolId));

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
        url: absoluteCanonicalUrl(homeRoute(locale)),
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
          item: absoluteCanonicalUrl(homeRoute(locale)),
        },
        { "@type": "ListItem", position: 2, name: tool.title, item: url },
      ],
    },
  ];
}

export function buildSitemapLanguageAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[HREFLANG_MAP[locale]] = absoluteCanonicalUrl(localizedPath(locale, path));
  }
  languages["x-default"] = absoluteCanonicalUrl(localizedPath(DEFAULT_LOCALE, path));
  return languages;
}

export function buildFaqPageStructuredData(pageId: SeoPageId, locale: Locale) {
  const content = getPageSeoContent(pageId, locale);
  const path = seoPathForPage(pageId);
  const url = absoluteCanonicalUrl(localizedPath(locale, path));

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    url,
    inLanguage: HREFLANG_MAP[locale],
  };
}

export function buildHubStructuredData(
  pageId: Extract<SeoPageId, "pro" | "table">,
  locale: Locale,
) {
  const seo = getSeoCopy(pageId, locale);
  const path = seoPathForPage(pageId);
  const url = absoluteCanonicalUrl(localizedPath(locale, path));

  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: seo.title,
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
        url: absoluteCanonicalUrl(homeRoute(locale)),
      },
    },
    buildFaqPageStructuredData(pageId, locale),
  ];
}

export function buildPageStructuredData(pageId: SeoPageId, locale: Locale) {
  if (pageId === "home") {
    return [...buildHomeStructuredData(locale), buildFaqPageStructuredData("home", locale)];
  }
  if (pageId === "pro" || pageId === "table") {
    return buildHubStructuredData(pageId, locale);
  }
  return [...buildToolStructuredData(pageId, locale), buildFaqPageStructuredData(pageId, locale)];
}
