import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TableWorkspace } from "@/components/table/TableWorkspace";
import { dictionaries, isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18n/routing";
import { absoluteUrl, HREFLANG_MAP } from "@/lib/seo/site";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/table">): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const copy = dictionaries[locale].tableStudio;
  const canonical = absoluteUrl(localizedPath(locale, "/table"));
  const languages: Record<string, string> = {};
  for (const code of LOCALES) {
    languages[HREFLANG_MAP[code]] = absoluteUrl(localizedPath(code, "/table"));
  }

  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical, languages },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonical,
      siteName: "PureTable",
    },
  };
}

export default async function TableStudioPage({ params }: PageProps<"/[locale]/table">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <TableWorkspace />;
}
