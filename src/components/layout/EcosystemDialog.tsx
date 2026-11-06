"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

import { BodyPortal } from "@/components/layout/BodyPortal";
import { EcosystemProjectList } from "@/components/layout/EcosystemProjectList";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/layer-stack";

type EcosystemDialogProps = {
  open: boolean;
  onClose: () => void;
  layout: "dropdown" | "centered";
  className?: string;
};

export function EcosystemDialog({ open, onClose, layout, className }: EcosystemDialogProps) {
  const { t } = useI18n();
  const isCentered = layout === "centered";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !isCentered) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, isCentered]);

  if (!open) return null;

  const panel = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.ecosystem.menuAria}
      className={cn(
        "glass-card pointer-events-auto flex max-h-[min(85dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] w-full min-w-0 flex-col overflow-hidden border border-slate-800 shadow-2xl shadow-black/50",
        isCentered &&
          "fixed left-1/2 w-[92vw] max-w-md -translate-x-1/2 rounded-t-2xl pb-[max(0.25rem,env(safe-area-inset-bottom))] max-sm:bottom-0 sm:bottom-auto sm:top-1/2 sm:max-h-[min(calc(100dvh-2rem),40rem)] sm:w-full sm:max-w-[min(92vw,520px)] sm:-translate-y-1/2 sm:rounded-2xl md:max-w-[640px]",
        layout === "dropdown" &&
          "absolute right-0 top-full z-40 mt-2 w-[min(44rem,calc(100vw-2rem))] overflow-hidden rounded-xl shadow-xl shadow-black/40",
        className,
      )}
      style={isCentered ? { zIndex: Z.modalPanel } : undefined}
    >
      <div className="shrink-0 border-b border-slate-800 bg-slate-900/40 px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="whitespace-normal break-words text-xs font-medium uppercase tracking-wider text-slate-500">
              {t.ecosystem.menuLabel}
            </p>
            <p className="mt-1 whitespace-normal break-words text-xs leading-relaxed text-slate-400">
              {t.ecosystem.menuHint}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.ecosystem.close}
            className="touch-manipulation shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
      <EcosystemProjectList
        cardsGrid={layout === "dropdown" ? "two-columns" : "responsive"}
        onNavigate={onClose}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4"
      />
    </div>
  );

  if (isCentered) {
    return (
      <BodyPortal open={open}>
        <button
          type="button"
          aria-label={t.ecosystem.close}
          data-puretable-overlay="ecosystem-backdrop"
          data-open="true"
          className="pointer-events-auto fixed inset-0 touch-manipulation bg-black/75 backdrop-blur-sm"
          style={{ zIndex: Z.modalBackdrop }}
          onClick={onClose}
        />
        {panel}
      </BodyPortal>
    );
  }

  return panel;
}
