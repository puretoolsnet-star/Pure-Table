"use client";

import type { LucideIcon } from "lucide-react";

import { useI18n } from "@/i18n/context";
import type { ToolId } from "@/i18n/types";
import { useTapHandler } from "@/lib/use-tap-handler";

export function ProToolCard({
  toolId,
  icon: Icon,
  accent,
  onActivate,
}: {
  toolId: ToolId;
  icon: LucideIcon;
  accent: string;
  onActivate: (toolId: ToolId) => void;
}) {
  const { t } = useI18n();
  const copy = t.tools[toolId];
  const handleActivate = useTapHandler(() => onActivate(toolId));

  return (
    <button
      type="button"
      aria-label={`${copy.title}. ${copy.hint}`}
      onClick={handleActivate.onClick}
      className="group relative z-10 flex h-full min-w-0 cursor-pointer flex-col rounded-2xl border border-gray-800 bg-gray-950/85 p-5 text-left shadow-sm shadow-cyan-500/5 transition hover:border-cyan-500/30 hover:bg-gray-900/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 active:scale-[0.98]"
    >
      <div
        className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${accent} ring-1 ring-cyan-500/20`}
      >
        <Icon className="h-5 w-5 text-white" strokeWidth={1.75} aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-white [overflow-wrap:anywhere]">{copy.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-400 [overflow-wrap:anywhere]">
        {copy.description}
      </p>
      <span className="mt-4 text-sm font-medium text-cyan-400 transition-colors group-hover:text-cyan-300">
        {t.proHub.openTool}
      </span>
    </button>
  );
}
