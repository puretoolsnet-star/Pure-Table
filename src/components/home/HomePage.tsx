"use client";

import { LayoutGrid, Sparkles } from "lucide-react";
import Link from "next/link";

import { PrivacyBanner } from "@/components/layout/PrivacyBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useI18n } from "@/i18n/context";

export function HomePage() {
  const { t, locale } = useI18n();

  return (
    <div className="puretable-page-shell relative flex min-h-dvh w-full min-w-0 flex-1 flex-col overflow-x-hidden bg-slate-950 font-sans text-slate-100">
      <SiteHeader />
      <main className="relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 md:px-8 md:pb-16">
        <PrivacyBanner className="mb-8" />
        <section className="mb-10 max-w-2xl min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-white [overflow-wrap:anywhere] sm:text-4xl lg:text-5xl">
            {t.home.heroTitle}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 [overflow-wrap:anywhere] sm:text-base md:text-lg">
            {t.home.heroSubtitle}
          </p>
        </section>
        <section className="mb-10 w-full min-w-0">
          <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/90 p-5 shadow-lg shadow-cyan-500/5 sm:p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-500/35">
                  <LayoutGrid className="h-6 w-6 text-cyan-400" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white sm:text-xl">{t.home.tableStudioTitle}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400 [overflow-wrap:anywhere]">
                    {t.home.tableStudioHint}
                  </p>
                </div>
              </div>
              <Link
                href={`/${locale}/table`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-gray-950 hover:bg-cyan-400"
              >
                {t.home.tableStudioCta}
              </Link>
            </div>
          </div>
        </section>
        <section className="mb-6 w-full min-w-0">
          <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/90 p-5 shadow-lg shadow-cyan-500/5 sm:p-6">
            <div className="pointer-events-none absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-500/35">
                  <Sparkles className="h-6 w-6 text-cyan-400" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white sm:text-xl">{t.home.proToolsTitle}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400 [overflow-wrap:anywhere]">
                    {t.home.proToolsHint}
                  </p>
                </div>
              </div>
              <Link
                href={`/${locale}/pro`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-gray-900 px-5 py-2.5 text-sm font-semibold text-cyan-100 hover:bg-gray-800"
              >
                {t.home.proToolsCta}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
