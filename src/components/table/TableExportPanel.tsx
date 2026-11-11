"use client";

import { Download, FileCode, FileJson, Table2 } from "lucide-react";
import type { ReactNode } from "react";

import { useI18n } from "@/i18n/context";
import { downloadHtml, downloadMarkdown, downloadSql } from "@/lib/table/export-formats";
import { LARGE_TABLE_ROW_THRESHOLD, downloadSheets } from "@/lib/table/export-table";
import type { TableSheet } from "@/lib/table/types";
import { useMandatoryAd } from "@/lib/use-mandatory-ad";
import { cn } from "@/lib/cn";

type ExportFormat = "xlsx" | "csv" | "md" | "sql" | "html";

export function TableExportPanel({
  filename,
  sheets,
  ready,
  rowCount,
  sqlTableName,
}: {
  filename: string;
  sheets: TableSheet[];
  ready: boolean;
  rowCount: number;
  sqlTableName: string;
}) {
  const { t } = useI18n();
  const { requestDownload, modal } = useMandatoryAd();
  const needsAd = rowCount >= LARGE_TABLE_ROW_THRESHOLD;

  const trigger = (format: ExportFormat, label: string, action: () => void | Promise<void>) => {
    if (!ready) return;
    requestDownload(action, label, { requiresAd: needsAd });
  };

  const buttons: Array<{
    format: ExportFormat;
    label: string;
    icon: typeof Download;
    action: () => void | Promise<void>;
    primary?: boolean;
  }> = [
    {
      format: "xlsx",
      label: t.workspace.downloadXlsx,
      icon: Download,
      primary: true,
      action: () => downloadSheets("xlsx", filename, sheets),
    },
    {
      format: "csv",
      label: t.workspace.downloadCsv,
      icon: Download,
      action: () => downloadSheets("csv", filename, sheets),
    },
    {
      format: "md",
      label: t.tableStudio.downloadMd,
      icon: Table2,
      action: () => downloadMarkdown(filename, sheets),
    },
    {
      format: "sql",
      label: t.tableStudio.downloadSql,
      icon: FileCode,
      action: () => downloadSql(filename, sheets, sqlTableName),
    },
    {
      format: "html",
      label: t.tableStudio.downloadHtml,
      icon: FileJson,
      action: () => downloadHtml(filename, sheets),
    },
  ];

  return (
    <div className="space-y-3">
      {needsAd && ready && (
        <p className="text-sm leading-relaxed text-cyan-200/80">{t.tableStudio.largeExportHint}</p>
      )}
      <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
        {buttons.map(({ format, label, icon: Icon, action, primary }) => (
          <button
            key={format}
            type="button"
            disabled={!ready}
            onClick={() => trigger(format, label, action)}
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
              primary
                ? "bg-cyan-500 text-gray-950 hover:bg-cyan-400"
                : "border border-gray-700 bg-gray-900 text-white hover:border-cyan-500/40 hover:text-cyan-50",
              !ready && "cursor-not-allowed opacity-50",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="text-left [overflow-wrap:anywhere]">{label}</span>
          </button>
        ))}
      </div>
      {modal as ReactNode}
    </div>
  );
}
