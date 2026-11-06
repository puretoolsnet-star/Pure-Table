import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePage } from "@/components/home/HomePage";
import { JsonLd } from "@/components/seo/JsonLd";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";
import { buildHomeMetadata } from "@/lib/seo/metadata";
import { buildHomeStructuredData } from "@/lib/seo/structured-data";

type HomePageProps = PageProps<"/[locale]">;

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return buildHomeMetadata(raw);
}

export default async function LocalizedHomePage({ params }: HomePageProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <>
      <JsonLd data={buildHomeStructuredData(locale)} />
      <HomePage />
    </>
  );
}
