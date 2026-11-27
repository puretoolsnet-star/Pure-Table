import { notFound } from "next/navigation";

import { HtmlLangBootstrap } from "@/components/i18n/HtmlLangBootstrap";
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
  const locale = raw as Locale;
  return (
    <>
      <HtmlLangBootstrap locale={locale} />
      <LocaleShell locale={locale}>{children}</LocaleShell>
    </>
  );
}
