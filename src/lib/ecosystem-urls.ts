import type { Locale } from "@/i18n/locales";

const PUREPDF_BASE =
  process.env.NEXT_PUBLIC_PUREPDF_URL?.replace(/\/$/, "") ?? "https://purepdf.app";
const PUREQR_BASE =
  process.env.NEXT_PUBLIC_PUREQR_URL?.replace(/\/$/, "") ?? "https://pureqr.app";
const PURESIGN_BASE =
  process.env.NEXT_PUBLIC_PURESIGN_URL?.replace(/\/$/, "") ?? "https://puresign.app";

const BASES = {
  purepdf: PUREPDF_BASE,
  pureQr: PUREQR_BASE,
  pureSign: PURESIGN_BASE,
} as const;

/** Keeps the selected locale (`uk`, `en`, `de`, `fr`, `es`, `pl`) on sibling sites. */
export function ecosystemExternalUrl(
  projectId: keyof typeof BASES,
  locale: Locale,
): string {
  return `${BASES[projectId]}/${locale}`;
}
