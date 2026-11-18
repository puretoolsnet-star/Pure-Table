import { notFound } from "next/navigation";

import { ProToolsHub } from "@/components/pro/ProToolsHub";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { buildProMetadata } from "@/lib/seo/metadata";
import { buildPageStructuredData } from "@/lib/seo/structured-data";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/pro">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return buildProMetadata(raw);
}

export default async function ProToolsPage({ params }: PageProps<"/[locale]/pro">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <>
      <JsonLd data={buildPageStructuredData("pro", locale)} />
      <ProToolsHub />
    </>
  );
}