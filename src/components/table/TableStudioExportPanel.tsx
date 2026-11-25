"use client";

import { Copy, Download, FileCode, Table2 } from "lucide-react";
import { useMemo, useState } from "react";

import { useI18n } from "@/i18n/context";
import {
  buildHtmlTable,
  buildMarkdownTable,
  buildSqlInserts,
  downloadHtml,
  downloadMarkdown,
  downloadSql,
} from "@/lib/table/export-formats";
import { LARGE_TABLE_ROW_THRESHOLD, buildCsvFromSheet, downloadSheets } from "@/lib/table/export-table";
import type { TableSheet } from "@/lib/table/types";
import { cn } from "@/lib/cn";

type PreviewFormat = "csv" | "md" | "sql" | "html";

const secondaryBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50";

export function TableStudioExportPanel({
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
  const [previewFormat, setPreviewFormat] = useState<PreviewFormat>("csv");
  const [copyNote, setCopyNote] = useState("");

  const sheet = sheets[0];
  const isLarge = rowCount >= LARGE_TABLE_ROW_THRESHOLD;

  const previewText = useMemo(() => {
    if (!sheet || !ready) return "";
    switch (previewFormat) {
      case "csv":
        return buildCsvFromSheet(sheet);
      case "md":
        return buildMarkdownTable(sheet);
      case "sql":
        return buildSqlInserts(sheet, sqlTableName);
      case "html":
        return buildHtmlTable(sheet);
    }
  }, [sheet, ready, previewFormat, sqlTableName]);

  const previewTabs: Array<{ id: PreviewFormat; label: string }> = [
    { id: "csv", label: "CSV" },
    { id: "md", label: "MD" },
    { id: "sql", label: "SQL" },
    { id: "html", label: "HTML" },
  ];

  async function copyPreview() {
    if (!previewText) return;
    try {
      await navigator.clipboard.writeText(previewText);
      setCopyNote(t.tableStudio.exportCopied);
      setTimeout(() => setCopyNote(""), 2000);
    } catch {
      setCopyNote(t.tableStudio.exportCopyFailed);
    }
  }

  return (
    <div className="min-w-0 space-y-4">
      {isLarge && ready && (
        <p className="text-sm leading-relaxed text-primary/80">{t.tableStudio.largeExportHint}</p>
      )}

      <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
        <button
          type="button"
          disabled={!ready}
          onClick={() => void downloadSheets("xlsx", filename, sheets)}
          className={cn(
            "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
            ready ? "bg-primary text-primary-foreground hover:opacity-90" : "cursor-not-allowed opacity-50",
          )}
        >
          <Download className="h-4 w-4" aria-hidden />
          {t.workspace.downloadXlsx}
        </button>
        <button type="button" disabled={!ready} onClick={() => void downloadSheets("csv", filename, sheets)} className={secondaryBtn}>
          <Download className="h-4 w-4" aria-hidden />
          {t.workspace.downloadCsv}
        </button>
        <button type="button" disabled={!ready} onClick={() => downloadMarkdown(filename, sheets)} className={secondaryBtn}>
          <Table2 className="h-4 w-4" aria-hidden />
          {t.tableStudio.downloadMd}
        </button>
        <button type="button" disabled={!ready} onClick={() => downloadSql(filename, sheets, sqlTableName)} className={secondaryBtn}>
          <FileCode className="h-4 w-4" aria-hidden />
          {t.tableStudio.downloadSql}
        </button>
        <button type="button" disabled={!ready} onClick={() => downloadHtml(filename, sheets)} className={cn(secondaryBtn, "min-[480px]:col-span-2")}>
          <Download className="h-4 w-4" aria-hidden />
          {t.tableStudio.downloadHtml}
        </button>
      </div>

      <div className="min-w-0 space-y-2">
        <span className="block text-sm font-medium text-slate-200">{t.tableStudio.exportPreviewLabel}</span>
        <div className="flex flex-wrap gap-2">
          {previewTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPreviewFormat(tab.id)}
              className={cn(
                "min-h-9 rounded-lg border px-3 py-1.5 text-xs font-semibold",
                previewFormat === tab.id
                  ? "border-primary/50 bg-primary/10 text-white"
                  : "border-slate-800 text-slate-400",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <textarea
          readOnly
          value={previewText}
          className="glass-card min-h-32 w-full max-w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 font-mono text-xs text-slate-300"
          spellCheck={false}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!previewText}
            onClick={() => void copyPreview()}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-primary/40 disabled:opacity-50"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {t.tableStudio.exportCopy}
          </button>
          {copyNote && <span className="text-xs text-primary/90">{copyNote}</span>}
        </div>
        {previewFormat === "sql" && (
          <p className="text-xs text-slate-500">{t.tableStudio.exportSqlPreviewHint}</p>
        )}
      </div>
    </div>
  );
}