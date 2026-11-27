import type { Locale } from "@/i18n/locales";

/** Sets document lang before hydration so crawlers that run JS see the correct locale. */
export function HtmlLangBootstrap({ locale }: { locale: Locale }) {
  const lang = locale === "uk" ? "uk" : locale;
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang=${JSON.stringify(lang)};`,
      }}
    />
  );
}