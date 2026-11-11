"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function TableToolbarSection({
  icon: Icon,
  title,
  children,
  className,
  defaultOpen = true,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className={cn(
        "group rounded-2xl border border-gray-800/90 bg-gray-950/80 shadow-inner shadow-black/20",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 ring-1 ring-cyan-500/35">
          <Icon className="h-4 w-4 text-cyan-400" aria-hidden />
        </span>
        <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{title}</span>
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500 group-open:hidden">
          +
        </span>
        <span className="hidden text-xs font-medium uppercase tracking-wider text-gray-500 group-open:inline">
          −
        </span>
      </summary>
      <div className="space-y-3 border-t border-gray-800/80 px-4 py-4">{children}</div>
    </details>
  );
}
