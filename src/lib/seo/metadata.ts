import type { Metadata } from "next";

import type { Locale } from "@/i18n/locales";
import { LOCALES } from "@/i18n/locales";
import type { ToolId } from "@/i18n/types";
import { getSeoCopy, type SeoPageId } from "@/i18n/seo/copy";
import { localizedPath } from "@/lib/i18n/routing";
import { buildOgImageUrl } from "@/lib/seo/og";
import {
  absoluteUrl,
  DEFAULT_LOCALE,
  getSiteUrl,
  HREFLANG_MAP,
  OPEN_GRAPH_LOCALE,
} from "@/lib/seo/site";

function pathForPage(page: SeoPageId): string {
  if (page === "home") return "/";
  return `/tools/${page}`;
}

function languageAlternates(page: SeoPageId): Record<string, string> {
  const path = pathForPage(page);
  const languages: Record<string, string> = {};

  for (const locale of LOCALES) {
    languages[HREFLANG_MAP[locale]] = absoluteUrl(localizedPath(locale, path));
  }

  languages["x-default"] = absoluteUrl(localizedPath(DEFAULT_LOCALE, path));
  return languages;
}

export function buildPageMetadata(page: SeoPageId, locale: Locale): Metadata {
  const copy = getSeoCopy(page, locale);
  const path = pathForPage(page);
  const canonical = absoluteUrl(localizedPath(locale, path));
  const ogImage = absoluteUrl(buildOgImageUrl(locale, page));

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical,
      languages: languageAlternates(page),
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: copy.title,
      description: copy.description,
      siteName: "PureTable",
      locale: OPEN_GRAPH_LOCALE[locale],
      alternateLocale: LOCALES.filter((item) => item !== locale).map(
        (item) => OPEN_GRAPH_LOCALE[item],
      ),
      images: [{ url: ogImage, width: 1200, height: 630, alt: copy.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

export function buildToolMetadata(toolId: ToolId, locale: Locale): Metadata {
  return buildPageMetadata(toolId, locale);
}

export function buildHomeMetadata(locale: Locale): Metadata {
  return buildPageMetadata("home", locale);
}

export function siteMetadataBase(): Metadata {
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

  return {
    metadataBase: new URL(getSiteUrl()),
    applicationName: "PureTable",
    creator: "PureTable",
    title: {
      default: "PureTable",
      template: "%s | PureTable",
    },
    icons: { icon: "/icon" },
    formatDetection: { email: false, address: false, telephone: false },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  };
}
