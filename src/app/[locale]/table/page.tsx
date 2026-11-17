import { notFound } from "next/navigation";

import { TableWorkspace } from "@/components/table/TableWorkspace";
import { isLocale, LOCALES } from "@/i18n/locales";
import { buildTableMetadata } from "@/lib/seo/metadata";

export const instant = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/table">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return buildTableMetadata(raw);
}

export default async function TableStudioPage({ params }: PageProps<"/[locale]/table">) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  return <TableWorkspace />;
}