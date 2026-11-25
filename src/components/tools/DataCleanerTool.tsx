"use client";

import { SprayCan } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { EditableOcrTable } from "@/components/tools/EditableOcrTable";
import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/cn";
import { cleanTable, detectAmountColumns, detectPhoneColumns } from "@/lib/table/clean";
import { readSpreadsheet } from "@/lib/table/read-file";
import { DATA_CLEANER_SAMPLE } from "@/lib/table/samples";
import { textToTable } from "@/lib/table/split-text";
import { DEFAULT_CLEAN_OPTIONS, type CleanColumnScope, type CleanOptions, type ParsedTable } from "@/lib/table/types";

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function tableWidth(table: ParsedTable): number {
  return Math.max(
    table.headers.length,
    table.rows.reduce((max, row) => Math.max(max, row.length), 0),
  );
}

function clampIndex(index: number, width: number): number {
  if (width <= 0) return 0;
  return Math.max(0, Math.min(index, width - 1));
}

const pasteClass =
  "glass-card min-h-[min(12rem,32dvh)] w-full max-w-full resize-y rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-primary/50 sm:text-sm";

const selectClass =
  "w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50 disabled:opacity-50";

function columnOptions(headers: string[], columnLabel: (index: number) => string, width: number) {
  return Array.from({ length: Math.max(width, 1) }, (_, index) => ({
    index,
    label: headers[index]?.trim() || columnLabel(index + 1),
  }));
}

function scopeOptions(t: ReturnType<typeof useI18n>["t"]): Array<{ id: CleanColumnScope; label: string }> {
  return [
    { id: "auto", label: t.workspace.dataCleanerScopeAuto },
    { id: "column", label: t.workspace.dataCleanerScopeColumn },
    { id: "all", label: t.workspace.dataCleanerScopeAll },
  ];
}

function ToggleRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm text-slate-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-primary"
      />
      {label}
    </label>
  );
}

export function DataCleanerTool() {
  const { t, locale } = useI18n();
  const [table, setTable] = useState<ParsedTable>({ headers: [], rows: [] });
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");
  const [statsLine, setStatsLine] = useState("");
  const [options, setOptions] = useState<CleanOptions>({
    ...DEFAULT_CLEAN_OPTIONS,
    trim: true,
    collapseSpaces: true,
    dropEmpty: true,
    dedupe: true,
    dedupeByColumn: false,
    phones: true,
    phoneScope: "auto",
    amounts: true,
    amountScope: "auto",
  });

  const width = useMemo(() => tableWidth(table), [table]);
  const cols = useMemo(
    () => columnOptions(table.headers, t.workspace.columnLabel, width),
    [table.headers, width, t],
  );

  const autoPhones = useMemo(() => detectPhoneColumns(table), [table]);
  const autoAmounts = useMemo(() => detectAmountColumns(table), [table]);

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
        const { table: parsed } = await readSpreadsheet(file, t.workspace.columnLabel);
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
    const { table: cleaned, stats } = cleanTable(table, {
      ...options,
      dedupeColumn: clampIndex(options.dedupeColumn, width),
      phoneColumn: clampIndex(options.phoneColumn, width),
      amountColumn: clampIndex(options.amountColumn, width),
    });
    setTable(cleaned);
    const hasChanges =
      stats.trimmed > 0 ||
      stats.emptyRows > 0 ||
      stats.duplicatesFull > 0 ||
      stats.duplicatesByColumn > 0 ||
      stats.phones > 0 ||
      stats.amounts > 0;
    setStatsLine(hasChanges ? t.workspace.dataCleanerStats(stats) : t.workspace.dataCleanerStatsNone);
  }, [table, options, width, t]);

  const loadSample = useCallback(() => {
    const raw = DATA_CLEANER_SAMPLE[locale as Locale];
    const parsed = textToTable(raw, {
      delimiter: "semicolon",
      header: true,
      columnLabel: t.workspace.columnLabel,
    });
    setTable(parsed);
    setPaste(raw);
    setStatsLine("");
    setError("");
    setOptions((current) => ({
      ...current,
      dedupeColumn: 0,
      phoneColumn: 1,
      amountColumn: 2,
    }));
  }, [locale, t]);

  const ready = table.rows.length > 0;
  const sheets = useMemo(
    () => [{ name: t.workspace.cleanedTitle, headers: table.headers, rows: table.rows }],
    [table, t],
  );

  const scopeChips = scopeOptions(t);

  return (
    <ToolShell toolId="data-cleaner" icon={SprayCan}>
      <div className="min-w-0 space-y-5">
        <p className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm leading-relaxed text-slate-400">
          {t.workspace.dataCleanerLocalHint}
        </p>

        <FileDropzone
          accept={SPREADSHEET}
          multiple={false}
          title={t.workspace.dropTitle}
          hint={t.workspace.dropHint}
          onFiles={(files) => void applySource(files)}
        />

        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-200">{t.workspace.pasteLabel}</span>
          <textarea
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
            placeholder={t.workspace.pastePlaceholder}
            className={pasteClass}
            spellCheck={false}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={parsePaste}
            className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {t.tableStudio.parsePasted}
          </button>
          <button
            type="button"
            onClick={loadSample}
            className="min-h-11 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            {t.workspace.dataCleanerSample}
          </button>
          <button
            type="button"
            onClick={() => {
              setTable({ headers: [], rows: [] });
              setPaste("");
              setStatsLine("");
              setError("");
            }}
            className="min-h-11 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            {t.workspace.clear}
          </button>
        </div>

        {error && <p className="text-sm text-amber-200/90">{error}</p>}

        <section className="min-w-0 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <h3 className="text-sm font-semibold text-white">{t.workspace.dataCleanerGroupSpaces}</h3>
          <div className="flex flex-wrap gap-2">
            <ToggleRow
              checked={options.trim}
              onChange={(trim) => setOptions((c) => ({ ...c, trim }))}
              label={t.workspace.trimSpaces}
            />
            <ToggleRow
              checked={options.collapseSpaces}
              onChange={(collapseSpaces) => setOptions((c) => ({ ...c, collapseSpaces }))}
              label={t.workspace.collapseSpaces}
            />
            <ToggleRow
              checked={options.dropEmpty}
              onChange={(dropEmpty) => setOptions((c) => ({ ...c, dropEmpty }))}
              label={t.workspace.dropEmpty}
            />
          </div>
        </section>

        <section className="min-w-0 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <h3 className="text-sm font-semibold text-white">{t.workspace.dataCleanerGroupDuplicates}</h3>
          <div className="flex flex-wrap gap-2">
            <ToggleRow
              checked={options.dedupe}
              onChange={(dedupe) => setOptions((c) => ({ ...c, dedupe }))}
              label={t.workspace.removeDuplicates}
            />
            <ToggleRow
              checked={options.dedupeByColumn}
              onChange={(dedupeByColumn) => setOptions((c) => ({ ...c, dedupeByColumn }))}
              label={t.workspace.dataCleanerDedupeByColumn}
            />
          </div>
          {options.dedupeByColumn && (
            <label className="block min-w-0 max-w-md">
              <span className="mb-2 block text-xs font-medium text-slate-400">
                {t.workspace.dataCleanerDedupeColumn}
              </span>
              <select
                value={clampIndex(options.dedupeColumn, cols.length)}
                onChange={(e) => setOptions((c) => ({ ...c, dedupeColumn: Number(e.target.value) }))}
                className={selectClass}
                disabled={!ready}
              >
                {cols.map((option) => (
                  <option key={option.index} value={option.index}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </section>

        <section className="min-w-0 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <h3 className="text-sm font-semibold text-white">{t.workspace.dataCleanerGroupPhones}</h3>
          <ToggleRow
            checked={options.phones}
            onChange={(phones) => setOptions((c) => ({ ...c, phones }))}
            label={t.workspace.formatPhones}
          />
          {options.phones && (
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-2 block text-xs font-medium text-slate-400">
                  {t.workspace.dataCleanerScopeLabel}
                </span>
                <div className="flex flex-wrap gap-2">
                  {scopeChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => setOptions((c) => ({ ...c, phoneScope: chip.id }))}
                      className={cn(
                        "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium",
                        options.phoneScope === chip.id
                          ? "border-primary/60 bg-primary/15 text-white"
                          : "border-slate-700 text-slate-300 hover:border-slate-500",
                      )}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                {options.phoneScope === "auto" && ready && autoPhones.size > 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    {Array.from(autoPhones)
                      .map((i) => cols[i]?.label ?? String(i + 1))
                      .join(", ")}
                  </p>
                )}
              </div>
              {options.phoneScope === "column" && (
                <label className="block min-w-0">
                  <span className="mb-2 block text-xs font-medium text-slate-400">
                    {t.workspace.dataCleanerPhoneColumn}
                  </span>
                  <select
                    value={clampIndex(options.phoneColumn, cols.length)}
                    onChange={(e) => setOptions((c) => ({ ...c, phoneColumn: Number(e.target.value) }))}
                    className={selectClass}
                  >
                    {cols.map((option) => (
                      <option key={option.index} value={option.index}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}
        </section>

        <section className="min-w-0 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
          <h3 className="text-sm font-semibold text-white">{t.workspace.dataCleanerGroupAmounts}</h3>
          <ToggleRow
            checked={options.amounts}
            onChange={(amounts) => setOptions((c) => ({ ...c, amounts }))}
            label={t.workspace.formatAmounts}
          />
          {options.amounts && (
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <div>
                <span className="mb-2 block text-xs font-medium text-slate-400">
                  {t.workspace.dataCleanerScopeLabel}
                </span>
                <div className="flex flex-wrap gap-2">
                  {scopeChips.map((chip) => (
                    <button
                      key={`amt-${chip.id}`}
                      type="button"
                      onClick={() => setOptions((c) => ({ ...c, amountScope: chip.id }))}
                      className={cn(
                        "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium",
                        options.amountScope === chip.id
                          ? "border-primary/60 bg-primary/15 text-white"
                          : "border-slate-700 text-slate-300 hover:border-slate-500",
                      )}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
                {options.amountScope === "auto" && ready && autoAmounts.size > 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    {Array.from(autoAmounts)
                      .map((i) => cols[i]?.label ?? String(i + 1))
                      .join(", ")}
                  </p>
                )}
              </div>
              {options.amountScope === "column" && (
                <label className="block min-w-0">
                  <span className="mb-2 block text-xs font-medium text-slate-400">
                    {t.workspace.dataCleanerAmountColumn}
                  </span>
                  <select
                    value={clampIndex(options.amountColumn, cols.length)}
                    onChange={(e) => setOptions((c) => ({ ...c, amountColumn: Number(e.target.value) }))}
                    className={selectClass}
                  >
                    {cols.map((option) => (
                      <option key={option.index} value={option.index}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}
        </section>

        <button
          type="button"
          disabled={!ready}
          onClick={runClean}
          className="min-h-11 w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-50 sm:w-auto"
        >
          {t.workspace.dataCleanerApply}
        </button>

        {statsLine && (
          <p className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-primary/90">
            {statsLine}
          </p>
        )}

        <EditableOcrTable
          title={`${t.workspace.cleanedTitle} · ${t.workspace.rowCount(table.rows.length)}`}
          hint={t.workspace.dataCleanerEditHint}
          mobileScrollHint={t.tableStudio.mobileScrollHint}
          headers={table.headers}
          rows={table.rows}
          emptyLabel={t.workspace.emptyPreview}
          addRowLabel={t.workspace.ocrAddRow}
          addColumnLabel={t.workspace.ocrAddColumn}
          removeRowLabel={t.workspace.ocrRemoveRow}
          removeColumnLabel={t.workspace.ocrRemoveColumn}
          columnLabel={t.workspace.columnLabel}
          onChange={(next) => {
            setTable(next);
            setStatsLine("");
          }}
        />

        <ExportBar
          filename="puretable-cleaned"
          sheets={sheets}
          ready={ready}
          xlsxLabel={t.workspace.dataCleanerDownloadXlsx}
          csvLabel={t.workspace.dataCleanerDownloadCsv}
        />
      </div>
    </ToolShell>
  );
}