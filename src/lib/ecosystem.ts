import type { Locale } from "@/i18n/locales";
import { LOCALES } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18n/routing";

export type EcosystemProjectId =
  | "purepdf"
  | "pureQr"
  | "pureSign"
  | "pureImage"
  | "pureTable";

export type EcosystemProjectStatus = "active" | "comingSoon";

export type EcosystemProjectMeta = {
  id: EcosystemProjectId;
  status: EcosystemProjectStatus;
  /** In-app path (locale added by caller) or site origin without a locale segment. */
  href?: string;
  external?: boolean;
};

function origin(value: string | undefined, fallback: string) {
  return (value?.trim() || fallback).replace(/\/$/, "");
}

const purepdfOrigin = origin(
  process.env.NEXT_PUBLIC_ECOSYSTEM_PUREPDF_URL,
  "https://pdf.kixt.net",
);

const pureQrOrigin = origin(
  process.env.NEXT_PUBLIC_ECOSYSTEM_PUREQR_URL,
  "https://qr.kixt.net",
);

const pureSignOrigin = origin(
  process.env.NEXT_PUBLIC_ECOSYSTEM_PURESIGN_URL,
  "https://sign.kixt.net",
);

const pureImageOrigin = origin(
  process.env.NEXT_PUBLIC_ECOSYSTEM_PUREIMAGE_URL,
  "https://img.kixt.net",
);

/**
 * Order: PurePDF → PureQR → PureSign → PureImage → PureTable.
 * PureTable is the current app.
 */
export const ECOSYSTEM_PROJECTS: EcosystemProjectMeta[] = [
  {
    id: "purepdf",
    status: "active",
    href: purepdfOrigin,
    external: true,
  },
  {
    id: "pureQr",
    status: "active",
    href: pureQrOrigin,
    external: true,
  },
  {
    id: "pureSign",
    status: "active",
    href: pureSignOrigin,
    external: true,
  },
  {
    id: "pureImage",
    status: "active",
    href: pureImageOrigin,
    external: true,
  },
  { id: "pureTable", status: "active", href: "/" },
];

const localeSuffix = new RegExp(`/(${LOCALES.join("|")})$`);

/** Keep the selected locale when opening another ecosystem site. */
export function ecosystemHref(
  project: EcosystemProjectMeta,
  locale: Locale,
): string | undefined {
  if (!project.href) return undefined;
  if (!project.external) return localizedPath(locale, project.href);
  const base = project.href.replace(/\/$/, "").replace(localeSuffix, "");
  return `${base}/${locale}`;
}