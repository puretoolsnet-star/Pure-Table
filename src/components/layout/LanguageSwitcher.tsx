"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/i18n/context";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/locales";
import { cn } from "@/lib/cn";
import { useTapHandler } from "@/lib/use-tap-handler";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LOCALE_LABELS[locale];
  const toggleOpen = useTapHandler(() => setOpen((value) => !value));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className="relative z-30">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.nav.selectLanguage}
        onClick={toggleOpen.onClick}
        className="glass-card touch-manipulation relative z-10 inline-flex max-w-[min(100%,9.5rem)] items-center gap-1.5 rounded-lg border-slate-800 px-2 py-1.5 text-xs text-slate-200 transition-colors hover:border-slate-700 hover:bg-slate-800/60 sm:max-w-[11rem] sm:gap-2 sm:rounded-xl sm:px-2.5 sm:py-2 sm:text-sm lg:max-w-none"
      >
        <span aria-hidden>{current.flag}</span>
        <span className="hidden font-medium sm:inline">{current.native}</span>
        <span className="font-medium sm:hidden">{current.code}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t.nav.selectLanguage}
          className="glass-card absolute right-0 z-[100] mt-2 min-w-[11rem] overflow-hidden rounded-xl border border-slate-800 py-1 shadow-xl shadow-black/40"
        >
          {LOCALES.map((item) => {
            const meta = LOCALE_LABELS[item];
            const selected = item === locale;
            return (
              <li key={item} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    setLocale(item as Locale);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                    selected
                      ? "bg-primary/15 text-white"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <span aria-hidden>{meta.flag}</span>
                  <span>{meta.native}</span>
                  <span className="ml-auto text-xs text-slate-500">{meta.code}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
