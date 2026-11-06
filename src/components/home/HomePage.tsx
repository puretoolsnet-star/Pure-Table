"use client";

import { Calculator, Coins, FileSpreadsheet, GitMerge, Receipt, ScanText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { HomeToolCard } from "@/components/home/HomeToolCard";
import { PrivacyBanner } from "@/components/layout/PrivacyBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useI18n } from "@/i18n/context";
import type { ToolId } from "@/i18n/types";
import { toolRoute } from "@/lib/i18n/routing";

const TOOL_META = [
  { id: "image-to-table" as const, icon: ScanText, accent: "from-sky-500/25 to-sky-500/5" },
  { id: "invoice-parser" as const, icon: Receipt, accent: "from-primary/25 to-primary/5" },
  { id: "text-to-excel" as const, icon: FileSpreadsheet, accent: "from-accent/25 to-accent/5" },
  { id: "merge-tables" as const, icon: GitMerge, accent: "from-violet-500/25 to-violet-500/5" },
  { id: "margin-calculator" as const, icon: Calculator, accent: "from-emerald-500/25 to-emerald-500/5" },
  { id: "currency-converter" as const, icon: Coins, accent: "from-amber-500/25 to-amber-500/5" },
];

export function HomePage() {
  const router = useRouter();
  const { t, locale } = useI18n();

  const openTool = useCallback(
    (toolId: ToolId) => {
      router.push(toolRoute(locale, toolId));
    },
    [locale, router],
  );

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
        <section
          aria-labelledby="puretable-tools-heading"
          className="grid w-full min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <h2
            id="puretable-tools-heading"
            className="col-span-full text-lg font-semibold tracking-tight text-white sm:text-xl"
          >
            {t.home.toolsHeading}
          </h2>
          {TOOL_META.map((tool) => (
            <HomeToolCard
              key={tool.id}
              toolId={tool.id}
              icon={tool.icon}
              accent={tool.accent}
              onActivate={openTool}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
