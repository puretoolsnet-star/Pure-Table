"use client";

import { Download, Eraser, FileInput, Pencil, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export type StudioCategory = "import" | "clean" | "search" | "bulk" | "export";

const CATEGORY_ICONS: Record<StudioCategory, LucideIcon> = {
  import: FileInput,
  clean: Eraser,
  search: Search,
  bulk: Pencil,
  export: Download,
};

export function TableStudioCategoryNav({
  active,
  onChange,
  labels,
  ariaLabel,
}: {
  active: StudioCategory;
  onChange: (id: StudioCategory) => void;
  labels: Record<StudioCategory, string>;
  ariaLabel: string;
}) {
  const items: StudioCategory[] = ["import", "clean", "search", "bulk", "export"];

  return (
    <nav
      className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]"
      aria-label={ariaLabel}
    >
      {items.map((id) => {
        const Icon = CATEGORY_ICONS[id];
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
              isActive
                ? "border-primary/60 bg-primary/15 text-white"
                : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-600",
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
            <span className="whitespace-nowrap">{labels[id]}</span>
          </button>
        );
      })}
    </nav>
  );
}