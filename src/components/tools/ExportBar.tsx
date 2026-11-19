"use client";

import { Download } from "lucide-react";

import { useI18n } from "@/i18n/context";
import { downloadSheets } from "@/lib/table/export-table";
import type { TableSheet } from "@/lib/table/types";
import { cn } from "@/lib/cn";

export function ExportBar({
  filename,
  sheets,
  ready,
  note,
  xlsxLabel,
  csvLabel,
}: {
  filename: string;
  sheets: TableSheet[];
  ready: boolean;
  note?: string;
  xlsxLabel?: string;
  csvLabel?: string;
}) {
  const { t } = useI18n();
  const excelLabel = xlsxLabel ?? t.workspace.downloadXlsx;
  const tableLabel = csvLabel ?? t.workspace.downloadCsv;

  const start = (format: "csv" | "xlsx") => {
    if (!ready) return;
    void downloadSheets(format, filename, sheets);
  };

  return (
    <div className="space-y-3">
      {note && <p className="text-sm text-amber-200/90">{note}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={!ready}
          onClick={() => start("xlsx")}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500",
            !ready && "cursor-not-allowed opacity-50",
          )}
        >
          <Download className="h-4 w-4" aria-hidden />
          {excelLabel}
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={() => start("csv")}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:border-slate-500",
            !ready && "cursor-not-allowed opacity-50",
          )}
        >
          <Download className="h-4 w-4" aria-hidden />
          {tableLabel}
        </button>
      </div>
    </div>
  );
}