"use client";

import { Lock, ServerOff, ShieldCheck } from "lucide-react";

import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";

export function PrivacyBanner({
  variant = "hero",
  className,
}: {
  variant?: "hero" | "compact";
  className?: string;
}) {
  const { t } = useI18n();

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "glass-card flex flex-wrap items-center gap-2 rounded-xl border border-accent/25 bg-accent/5 px-3 py-2 text-xs text-accent",
          className,
        )}
      >
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
        <span className="font-semibold">{t.security.badge}</span>
        <span className="text-accent/80">· {t.security.toolNote}</span>
      </div>
    );
  }

  return (
    <section
      className={cn(
        "glass-card overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/15 ring-1 ring-accent/30">
          <ShieldCheck className="h-5 w-5 text-accent" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-accent">
              Client-Side
            </span>
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary">
              {t.security.badgeShort}
            </span>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-white">{t.security.bannerTitle}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{t.security.bannerBody}</p>
        </div>
      </div>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Lock, text: t.security.pointLocal },
          { icon: ServerOff, text: t.security.pointNoUpload },
          { icon: ShieldCheck, text: t.security.pointPrivate },
        ].map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-200"
          >
            <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}
