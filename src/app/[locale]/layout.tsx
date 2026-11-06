import { notFound } from "next/navigation";

import { LocaleShell } from "@/components/i18n/LocaleShell";
import { isLocale, LOCALES, type Locale } from "@/i18n/locales";

type LocaleLayoutProps = LayoutProps<"/[locale]">;

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <LocaleShell locale={raw as Locale}>{children}</LocaleShell>;
}
