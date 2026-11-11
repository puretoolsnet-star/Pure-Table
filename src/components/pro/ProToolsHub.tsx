"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { AdBanner } from "@/components/ads/AdBanner";
import { ProToolCard } from "@/components/pro/ProToolCard";
import { PrivacyBanner } from "@/components/layout/PrivacyBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useI18n } from "@/i18n/context";
import type { ToolId } from "@/i18n/types";
import { PRO_HUB_ICON, PRO_TOOL_CARDS } from "@/lib/pro-tools-meta";
import { toolRoute } from "@/lib/i18n/routing";
import { useLocalizedPath } from "@/lib/i18n/use-localized-path";

export function ProToolsHub() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const href = useLocalizedPath();
  const HubIcon = PRO_HUB_ICON;

  const openTool = useCallback(
    (toolId: ToolId) => {
      router.push(toolRoute(locale, toolId));
    },
    [locale, router],
  );

  return (
    <div className="puretable-page-shell puretable-cyan-shell relative flex min-h-dvh w-full min-w-0 flex-1 flex-col overflow-x-hidden bg-gray-950 font-sans text-gray-100">
      <SiteHeader maxWidth="6xl" />
      <main className="relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-2 sm:px-6 md:px-8 md:pb-16">
        <Link
          href={href("/")}
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.common.backToTools}
        </Link>
        <PrivacyBanner className="mt-4" />
        <header className="mt-6 flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 ring-1 ring-cyan-500/35">
            <HubIcon className="h-7 w-7 text-cyan-400" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400/90">{t.proHub.badge}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
              {t.proHub.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-400 sm:text-base">
              {t.proHub.description}
            </p>
          </div>
        </header>

        <div className="mt-10 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,17.5rem)] lg:items-start">
          <section
            aria-labelledby="pro-tools-grid-heading"
            className="min-w-0 space-y-4"
          >
            <h2 id="pro-tools-grid-heading" className="text-lg font-semibold text-white sm:text-xl">
              {t.proHub.toolsHeading}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {PRO_TOOL_CARDS.map((tool) => (
                <ProToolCard
                  key={tool.id}
                  toolId={tool.id}
                  icon={tool.icon}
                  accent={tool.accent}
                  onActivate={openTool}
                />
              ))}
            </div>
          </section>
          <AdBanner className="lg:sticky lg:top-6 lg:self-start" />
        </div>
      </main>
    </div>
  );
}
