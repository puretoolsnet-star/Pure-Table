"use client";

import { FileSpreadsheet, PenLine, QrCode, Sparkles } from "lucide-react";
import Link from "next/link";

import { useI18n } from "@/i18n/context";
import { useLocalizedPath } from "@/lib/i18n/use-localized-path";
import { ECOSYSTEM_PROJECTS, type EcosystemProjectId } from "@/lib/ecosystem";
import { ecosystemExternalUrl } from "@/lib/ecosystem-urls";
import { cn } from "@/lib/cn";

const PROJECT_ICONS: Record<EcosystemProjectId, typeof Sparkles> = {
  purepdf: Sparkles,
  pureQr: QrCode,
  pureSign: PenLine,
  pureTable: FileSpreadsheet,
};

type EcosystemProjectListProps = {
  onNavigate?: () => void;
  className?: string;
  cardsGrid?: "responsive" | "two-columns";
};

export function EcosystemProjectList({
  onNavigate,
  className,
  cardsGrid = "responsive",
}: EcosystemProjectListProps) {
  const { t, locale } = useI18n();
  const toHref = useLocalizedPath();

  return (
    <ul
      className={cn(
        "grid gap-2 sm:gap-3",
        cardsGrid === "two-columns" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
        className,
      )}
    >
      {ECOSYSTEM_PROJECTS.map((project) => {
        const copy = t.ecosystem.items[project.id];
        const Icon = PROJECT_ICONS[project.id];
        const isActive = project.status === "active";
        const isCurrent = Boolean(project.current);
        const badgeLabel = isCurrent
          ? t.ecosystem.current
          : isActive
            ? t.ecosystem.activeHere
            : t.ecosystem.comingSoon;

        const cardClass = cn(
          "project-card glass-card flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden rounded-xl border border-slate-800 p-3 transition-colors hover:border-slate-700 sm:gap-3 sm:p-4",
          isCurrent
            ? "bg-primary/15 ring-1 ring-primary/40"
            : isActive
              ? "bg-primary/10 ring-1 ring-primary/25"
              : "bg-slate-900/40",
        );

        const inner = (
          <>
            <div className="flex min-w-0 items-start justify-between gap-2 overflow-hidden">
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/10 sm:h-10 sm:w-10",
                  isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-slate-300",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </div>
              <span
                className={cn(
                  "w-fit max-w-[9.5rem] shrink rounded-full px-2 py-0.5 text-right text-[10px] font-semibold uppercase leading-tight tracking-wide",
                  isCurrent
                    ? "border border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
                    : isActive
                      ? "border border-primary/40 bg-primary/15 text-primary"
                      : "border border-amber-500/30 bg-amber-500/10 text-amber-200/90",
                )}
              >
                {badgeLabel}
              </span>
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <h3 className="whitespace-normal break-words text-sm font-semibold leading-snug text-white">
                {copy.name}
              </h3>
              <p className="mt-2 whitespace-normal break-words text-xs leading-relaxed text-slate-400">
                {copy.tagline}
              </p>
            </div>
          </>
        );

        const externalHref = project.external
          ? ecosystemExternalUrl(project.external, locale)
          : null;
        const internalHref = project.href ? toHref(project.href) : null;

        return (
          <li key={project.id} role="none" className="min-w-0 max-w-full">
            {externalHref ? (
              <a
                role="menuitem"
                href={externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
                onClick={onNavigate}
              >
                {inner}
              </a>
            ) : internalHref ? (
              <Link
                role="menuitem"
                href={internalHref}
                aria-current={isCurrent ? "page" : undefined}
                className={cardClass}
                onClick={onNavigate}
              >
                {inner}
              </Link>
            ) : (
              <div role="menuitem" aria-disabled="true" className={cn(cardClass, "cursor-default")}>
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
