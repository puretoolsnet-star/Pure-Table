"use client";

import { SprayCan } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import { cleanTable } from "@/lib/table/clean";
import { readSpreadsheet } from "@/lib/table/read-file";
import { TEXT_SAMPLE } from "@/lib/table/samples";
import { textToTable } from "@/lib/table/split-text";
import type { CleanOptions, ParsedTable } from "@/lib/table/types";
import { cn } from "@/lib/cn";

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const fieldClass =
  "w-full rounded-xl border border-gray-800 bg-gray-900/90 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-500/50";

export function DataCleanerTool() {
  const { t } = useI18n();
  const [table, setTable] = useState<ParsedTable>({ headers: [], rows: [] });
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");
  const [statsLine, setStatsLine] = useState("");
  const [options, setOptions] = useState<CleanOptions>({
    trim: true,
    collapseSpaces: true,
    dropEmpty: true,
    dedupe: true,
    phones: true,
    amounts: true,
  });

  const applySource = useCallback(
    async (files: File[]) => {
      setError("");
      const file = files[0];
      if (!file) return;
      if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
        setError(t.workspace.unsupportedFile);
        return;
      }
      try {
        const parsed = await readSpreadsheet(file, t.workspace.columnLabel);
        setTable(parsed);
        setPaste("");
        setStatsLine("");
      } catch {
        setError(t.workspace.parseFailed);
      }
    },
    [t],
  );

  const parsePaste = useCallback(() => {
    const parsed = textToTable(paste, {
      delimiter: "auto",
      header: true,
      columnLabel: t.workspace.columnLabel,
    });
    setTable(parsed);
    setStatsLine("");
    setError(parsed.rows.length === 0 ? t.workspace.emptyPreview : "");
  }, [paste, t]);

  const runClean = useCallback(() => {
    const { table: cleaned, stats } = cleanTable(table, options);
    setTable(cleaned);
    setStatsLine(t.workspace.statsLine(stats));
  }, [table, options, t]);

  const ready = table.rows.length > 0;
  const sheets = useMemo(
    () => [{ name: t.workspace.cleanedTitle, headers: table.headers, rows: table.rows }],
    [table, t],
  );

  return (
    <ToolShell toolId="data-cleaner" icon={SprayCan}>
      <div className="space-y-5">
        <FileDropzone
          accept={SPREADSHEET}
          title={t.workspace.dropTitle}
          hint={t.workspace.dropHint}
          onFiles={(files) => void applySource(files)}
        />
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-medium text-gray-200">{t.workspace.pasteLabel}</span>
          <textarea
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
            placeholder={t.workspace.pastePlaceholder}
            className={cn(fieldClass, "min-h-32 resize-y")}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={parsePaste}
            className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-cyan-400"
          >
            {t.tableStudio.parsePasted}
          </button>
          <button
            type="button"
            onClick={() => {
              const sample = textToTable(TEXT_SAMPLE, {
                delimiter: "semicolon",
                header: true,
                columnLabel: t.workspace.columnLabel,
              });
              setTable(sample);
              setStatsLine("");
            }}
            className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-200"
          >
            {t.workspace.loadSample}
          </button>
        </div>
        {error && <p className="text-sm text-amber-200/90">{error}</p>}

        <div className="grid gap-2 text-sm text-gray-200 sm:grid-cols-2">
          {(
            [
              ["trim", t.workspace.trimSpaces],
              ["collapseSpaces", t.workspace.collapseSpaces],
              ["dropEmpty", t.workspace.dropEmpty],
              ["dedupe", t.workspace.removeDuplicates],
              ["phones", t.workspace.formatPhones],
              ["amounts", t.workspace.formatAmounts],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={options[key]}
                onChange={(event) =>
                  setOptions((current) => ({ ...current, [key]: event.target.checked }))
                }
                className="h-4 w-4 accent-cyan-500"
              />
              {label}
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={!ready}
          onClick={runClean}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white ring-1 ring-gray-700 hover:ring-cyan-500/50 disabled:opacity-50"
        >
          {t.workspace.dataCleanerApply}
        </button>
        {statsLine && <p className="text-sm text-cyan-200/80">{statsLine}</p>}

        <TablePreview
          title={`${t.workspace.cleanedTitle} · ${t.workspace.rowCount(table.rows.length)}`}
          headers={table.headers}
          rows={table.rows}
          emptyLabel={t.workspace.emptyPreview}
          mobileScrollHint={t.tableStudio.mobileScrollHint}
          variant="studio"
        />
        <ExportBar filename="puretable-cleaned" sheets={sheets} ready={ready} />
      </div>
    </ToolShell>
  );
}
