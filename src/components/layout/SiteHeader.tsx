"use client";

import { FileSpreadsheet } from "lucide-react";
import Link from "next/link";

import { EcosystemMenu } from "@/components/layout/EcosystemMenu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileHeaderMenu } from "@/components/layout/MobileHeaderMenu";
import { useI18n } from "@/i18n/context";
import { useLocalizedPath } from "@/lib/i18n/use-localized-path";
import { cn } from "@/lib/cn";

type SiteHeaderProps = {
  className?: string;
  maxWidth?: "6xl" | "4xl";
};

export function SiteHeader({ className, maxWidth = "6xl" }: SiteHeaderProps) {
  const { t } = useI18n();
  const href = useLocalizedPath();

  return (
    <header
      className={cn(
        "relative z-20 mx-auto w-full min-w-0 shrink-0 px-4 py-3 sm:px-6 sm:py-5 md:px-8 md:py-6",
        maxWidth === "6xl" ? "max-w-6xl" : "max-w-4xl",
        className,
      )}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
        <Link
          href={href("/")}
          className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5 md:gap-3"
          aria-label={`${t.brand.name} — ${t.brand.tagline}`}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30 sm:h-9 sm:w-9 sm:rounded-xl md:h-10 md:w-10"
            aria-hidden
          >
            <FileSpreadsheet className="h-[18px] w-[18px] text-primary sm:h-5 sm:w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold tracking-tight text-white sm:text-base md:text-lg">
              {t.brand.name}
            </p>
            <p className="hidden truncate text-xs text-slate-400 md:block">{t.brand.tagline}</p>
          </div>
        </Link>

        <div className="relative z-30 flex min-w-0 shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <span className="glass-card inline-flex max-w-[min(100%,11rem)] items-center gap-1 truncate rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-medium leading-tight text-accent sm:max-w-[13rem] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs lg:hidden">
            <span className="h-1 w-1 shrink-0 rounded-full bg-accent sm:h-1.5 sm:w-1.5" aria-hidden />
            <span className="min-w-0 truncate">{t.security.badgeShort}</span>
          </span>
          <span className="glass-card hidden max-w-[min(100%,22rem)] items-center gap-1.5 truncate rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent lg:inline-flex">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            <span className="min-w-0 truncate">{t.security.badge}</span>
          </span>
          <div className="hidden items-center gap-1.5 md:flex md:gap-2">
            <EcosystemMenu />
            <LanguageSwitcher />
          </div>
          <MobileHeaderMenu />
        </div>
      </div>
    </header>
  );
}
