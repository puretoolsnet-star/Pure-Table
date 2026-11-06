"use client";

import { useEffect } from "react";

import type { Locale } from "@/i18n/locales";

export function HtmlLangSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale === "uk" ? "uk" : locale;
  }, [locale]);
  return null;
}
