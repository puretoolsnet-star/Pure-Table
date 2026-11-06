"use client";

import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function AdBanner({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <aside
      aria-label={t.toolAd.sponsored}
      data-ad-slot="tool-sidebar"
      className={cn(
        "relative z-0 w-full min-w-0 max-w-full shrink-0 border-t border-slate-800 pt-6 lg:border-t-0 lg:pt-0",
        className,
      )}
    >
      <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 lg:text-left">
        {t.toolAd.sponsored}
      </p>
      <div className="glass-card flex min-h-[6.5rem] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-5 text-center">
        <p className="text-sm font-medium text-slate-300">{t.toolAd.slotTitle}</p>
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500">{t.toolAd.slotHint}</p>
      </div>
    </aside>
  );
}
