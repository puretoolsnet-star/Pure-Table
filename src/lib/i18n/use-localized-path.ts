"use client";

import { useCallback } from "react";

import { useI18n } from "@/i18n/context";
import { localizedPath } from "@/lib/i18n/routing";

export function useLocalizedPath() {
  const { locale } = useI18n();
  return useCallback((path: string) => localizedPath(locale, path), [locale]);
}
