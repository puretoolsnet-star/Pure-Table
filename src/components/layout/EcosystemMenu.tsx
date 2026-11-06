"use client";

import { ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { EcosystemDialog } from "@/components/layout/EcosystemDialog";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function EcosystemMenu() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative hidden shrink-0 md:block">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t.ecosystem.menuAria}
        onClick={() => setOpen((value) => !value)}
        className="glass-card touch-manipulation relative z-10 inline-flex max-w-[min(100%,14rem)] items-center gap-1.5 rounded-lg border-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-800/60 lg:max-w-none lg:gap-2 lg:rounded-xl lg:px-3 lg:py-2 lg:text-sm"
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary lg:h-4 lg:w-4" aria-hidden />
        <span className="min-w-0 truncate font-medium">{t.ecosystem.menuLabel}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open && (
        <EcosystemDialog open={open} onClose={() => setOpen(false)} layout="dropdown" />
      )}
    </div>
  );
}
