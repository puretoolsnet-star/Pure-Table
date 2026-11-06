"use client";

import { Download, Play, X } from "lucide-react";
import { useEffect, useState } from "react";

import { BodyPortal } from "@/components/layout/BodyPortal";
import { useI18n } from "@/i18n/context";
import {
  ADSTERRA_WATCH_MS,
  adsterraNative,
  loadAdsterraNative,
  triggerAdsterraReward,
} from "@/lib/ads/adsterra";
import { cn } from "@/lib/cn";
import { Z } from "@/lib/layer-stack";

type Phase = "idle" | "watching" | "ready";

type MandatoryAdModalProps = {
  open: boolean;
  sessionKey: number;
  downloadLabel: string;
  onClose: () => void;
  onUnlocked: () => void | Promise<void>;
};

function MandatoryAdPanel({
  sessionKey,
  downloadLabel,
  onClose,
  onUnlocked,
}: Omit<MandatoryAdModalProps, "open">) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setPhase("idle");
    setProgress(0);
    loadAdsterraNative();
  }, [sessionKey]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (phase !== "watching") return;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(1, (now - started) / ADSTERRA_WATCH_MS);
      setProgress(next);
      if (next >= 1) {
        setPhase("ready");
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [phase, sessionKey]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && phase !== "watching") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, onClose]);

  const secondsLeft = Math.max(
    0,
    Math.ceil((1 - progress) * (ADSTERRA_WATCH_MS / 1000)),
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="mandatory-ad-title"
      data-puretable-overlay="mandatory-ad"
      data-open="true"
      className="pointer-events-auto fixed inset-0 flex items-end justify-center bg-black/70 p-3 backdrop-blur-md sm:items-center sm:p-4"
      style={{ zIndex: Z.modalPanel }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/85 shadow-2xl shadow-black/50 backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-300/80">
              {t.rewardedAd.sponsored}
            </p>
            <h2 id="mandatory-ad-title" className="mt-1 text-lg font-semibold text-white">
              {t.rewardedAd.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {t.rewardedAd.message}
            </p>
          </div>
          {phase !== "watching" && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t.rewardedAd.close}
              className="touch-manipulation shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          )}
        </div>

        <div className="space-y-4 px-5 py-4">
          <div
            id={adsterraNative.containerId || undefined}
            className="flex min-h-[7.5rem] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-black/30 px-4 py-5 text-center backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t.rewardedAd.slotLabel}
            </p>
            <p className="mt-2 text-xs text-slate-400">Adsterra</p>
          </div>

          {phase === "watching" && (
            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="text-sm text-slate-400">
                {t.rewardedAd.watching} {t.rewardedAd.progress(secondsLeft)}
              </p>
            </div>
          )}
          {phase === "idle" && (
            <p className="text-sm text-slate-400">{t.rewardedAd.waitHint}</p>
          )}
          {phase === "ready" && (
            <p className="text-sm text-emerald-200/90">{t.rewardedAd.thanks}</p>
          )}
        </div>

        <div className="border-t border-slate-800 bg-black/25 px-5 py-4 backdrop-blur-sm">
          {phase === "ready" ? (
            <button
              type="button"
              onClick={() => void onUnlocked()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              <Download className="h-4 w-4" aria-hidden />
              {downloadLabel || t.rewardedAd.download}
            </button>
          ) : (
            <button
              type="button"
              disabled={phase === "watching"}
              onClick={() => {
                triggerAdsterraReward();
                setPhase("watching");
              }}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500",
                phase === "watching" && "cursor-not-allowed opacity-60",
              )}
            >
              <Play className="h-4 w-4 fill-current" aria-hidden />
              {t.rewardedAd.watch}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MandatoryAdModal({
  open,
  sessionKey,
  downloadLabel,
  onClose,
  onUnlocked,
}: MandatoryAdModalProps) {
  if (!open) return null;

  return (
    <BodyPortal open={open}>
      <MandatoryAdPanel
        key={sessionKey}
        sessionKey={sessionKey}
        downloadLabel={downloadLabel}
        onClose={onClose}
        onUnlocked={onUnlocked}
      />
    </BodyPortal>
  );
}
