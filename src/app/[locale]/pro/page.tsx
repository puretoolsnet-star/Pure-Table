import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProToolsHub } from "@/components/pro/ProToolsHub";
import { dictionaries, isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18n/routing";
import { absoluteUrl, HREFLANG_MAP } from "@/lib/seo/site";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/pro">): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const copy = dictionaries[locale].proHub;
  const canonical = absoluteUrl(localizedPath(locale, "/pro"));
  const languages: Record<string, string> = {};
  for (const code of LOCALES) {
    languages[HREFLANG_MAP[code]] = absoluteUrl(localizedPath(code, "/pro"));
  }
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical, languages },
    openGraph: { title: copy.title, description: copy.description, url: canonical, siteName: "PureTable" },
  };
}

export default async function ProToolsPage({ params }: PageProps<"/[locale]/pro">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <ProToolsHub />;
}
