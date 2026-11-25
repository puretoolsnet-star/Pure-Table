"use client";

import { Coins } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EditableOcrTable } from "@/components/tools/EditableOcrTable";
import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/cn";
import {
  buildCurrencyResultTable,
  summarizeConversion,
  type CurrencyOutputMode,
  type CurrencyRounding,
} from "@/lib/table/currency-convert";
import { parseCellNumber } from "@/lib/table/numeric-parse";
import { CURRENCY_SAMPLE } from "@/lib/table/samples";
import { readSpreadsheet } from "@/lib/table/read-file";
import { textToTable } from "@/lib/table/split-text";
import type { ParsedTable } from "@/lib/table/types";

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function tableWidth(table: ParsedTable): number {
  return Math.max(
    table.headers.length,
    table.rows.reduce((m, row) => Math.max(m, row.length), 0),
  );
}

function clampIndex(index: number, width: number): number {
  if (width <= 0) return 0;
  return Math.max(0, Math.min(index, width - 1));
}

const fieldClass =
  "glass-card min-h-[min(14rem,36dvh)] w-full max-w-full resize-y rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-primary/50 sm:text-sm";

export function CurrencyConverterTool() {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<"paste" | "file">("paste");
  const [text, setText] = useState("");
  const [fileTable, setFileTable] = useState<ParsedTable | null>(null);
  const [fileName, setFileName] = useState("");
  const [sourceTable, setSourceTable] = useState<ParsedTable>({ headers: [], rows: [] });
  const [resultTable, setResultTable] = useState<ParsedTable>({ headers: [], rows: [] });
  const [error, setError] = useState("");
  const [priceIdx, setPriceIdx] = useState(1);
  const [rateStr, setRateStr] = useState("41.2");
  const [outputMode, setOutputMode] = useState<CurrencyOutputMode>("add-column");
  const [rounding, setRounding] = useState<CurrencyRounding>("2dp");
  const [newHeader, setNewHeader] = useState("");
  const [resultTouched, setResultTouched] = useState(false);

  const parsedFromInput = useMemo(() => {
    if (mode === "file" && fileTable) return fileTable;
    return textToTable(text, {
      delimiter: "auto",
      header: true,
      columnLabel: t.workspace.columnLabel,
    });
  }, [mode, fileTable, text, t]);

  useEffect(() => {
    setSourceTable(parsedFromInput);
  }, [parsedFromInput]);

  const source = sourceTable;
  const width = useMemo(() => tableWidth(source), [source]);
  const effectivePriceIdx = clampIndex(priceIdx, width);

  const rate = useMemo(() => parseCellNumber(rateStr), [rateStr]);
  const invalidRate = !Number.isFinite(rate) || rate <= 0;

  const convertedHeader = (newHeader.trim() || t.workspace.currencyConvertedHeader).trim();

  const computedResult = useMemo(() => {
    if (invalidRate || width === 0) return { headers: [] as string[], rows: [] as string[][] };
    return buildCurrencyResultTable(source, effectivePriceIdx, rate, {
      outputMode,
      rounding,
      newHeader: convertedHeader,
    });
  }, [source, effectivePriceIdx, rate, outputMode, rounding, convertedHeader, invalidRate, width]);

  useEffect(() => {
    setResultTouched(false);
  }, [rateStr, outputMode, rounding, priceIdx, newHeader, mode, text, fileTable]);

  useEffect(() => {
    if (resultTouched) return;
    setResultTable(computedResult);
  }, [computedResult, resultTouched]);

  const stats = useMemo(() => {
    if (invalidRate || width === 0) return null;
    return summarizeConversion(source, effectivePriceIdx, rate, rounding);
  }, [source, effectivePriceIdx, rate, rounding, invalidRate, width]);

  async function onFile(file: File) {
    setError("");
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
      setError(t.workspace.unsupportedFile);
      return;
    }
    try {
      const { table } = await readSpreadsheet(file, t.workspace.columnLabel);
      setFileTable(table);
      setFileName(file.name);
      setMode("file");
    } catch {
      setError(t.workspace.parseFailed);
    }
  }

  const columnOptions = Array.from({ length: width }, (_, i) => {
    const label = source.headers[i]?.trim() || t.workspace.columnLabel(i + 1);
    return { value: i, label: `${i + 1}. ${label}` };
  });

  const outputModes: Array<{ id: CurrencyOutputMode; label: string }> = [
    { id: "add-column", label: t.workspace.currencyModeAddColumn },
    { id: "replace", label: t.workspace.currencyModeReplace },
  ];

  const roundingModes: Array<{ id: CurrencyRounding; label: string }> = [
    { id: "2dp", label: t.workspace.currencyRound2 },
    { id: "integer", label: t.workspace.currencyRoundInt },
    { id: "none", label: t.workspace.currencyRoundNone },
  ];

  return (
    <ToolShell toolId="currency-converter" icon={Coins}>
      <div className="min-w-0 space-y-5">
        <p className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm leading-relaxed text-slate-400">
          {t.workspace.currencyLocalHint}
        </p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={cn(
              "min-h-11 rounded-xl border px-4 py-2 text-sm font-medium",
              mode === "paste"
                ? "border-primary/50 bg-primary/15 text-white"
                : "border-slate-800 text-slate-300",
            )}
          >
            {t.workspace.pasteMode}
          </button>
          <button
            type="button"
            onClick={() => setMode("file")}
            className={cn(
              "min-h-11 rounded-xl border px-4 py-2 text-sm font-medium",
              mode === "file"
                ? "border-primary/50 bg-primary/15 text-white"
                : "border-slate-800 text-slate-300",
            )}
          >
            {t.workspace.fileMode}
          </button>
        </div>

        {mode === "paste" ? (
          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-medium text-slate-200">{t.workspace.pasteLabel}</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.workspace.pastePlaceholder}
              className={fieldClass}
            />
          </label>
        ) : (
          <div className="space-y-3">
            <FileDropzone
              accept={SPREADSHEET}
              multiple={false}
              title={t.workspace.dropTitle}
              hint={t.workspace.dropHint}
              onFiles={(files) => void onFile(files[0]!)}
            />
            {fileName && <p className="text-sm text-slate-400">{fileName}</p>}
          </div>
        )}

        {error && <p className="text-sm text-amber-200/90">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-1 block text-xs font-medium text-slate-400">
              {t.workspace.currencyColumnLabel}
            </span>
            <select
              value={effectivePriceIdx}
              disabled={width === 0}
              onChange={(e) => setPriceIdx(Number(e.target.value))}
              className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white"
            >
              {columnOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-1 block text-xs font-medium text-slate-400">
              {t.workspace.currencyRateLabel}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={rateStr}
              onChange={(e) => setRateStr(e.target.value)}
              className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white"
              placeholder="1.0"
            />
            {!invalidRate && (
              <p className="mt-1 text-xs text-slate-500">{t.workspace.currencyRateHint}</p>
            )}
            {invalidRate && (
              <p className="mt-1 text-xs text-amber-200/90">{t.workspace.currencyInvalidRate}</p>
            )}
          </label>
        </div>

        <section className="min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            {t.workspace.currencyOutputModeLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {outputModes.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setOutputMode(option.id)}
                className={cn(
                  "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium",
                  outputMode === option.id
                    ? "border-primary/60 bg-primary/15 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-500",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {outputMode === "add-column" && (
            <label className="mt-3 block min-w-0">
              <span className="mb-1 block text-xs text-slate-500">{t.workspace.currencyConvertedHeader}</span>
              <input
                type="text"
                value={newHeader}
                onChange={(e) => setNewHeader(e.target.value)}
                placeholder={t.workspace.currencyConvertedHeader}
                className="glass-card w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white"
              />
            </label>
          )}
        </section>

        <section className="min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            {t.workspace.currencyRoundingLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {roundingModes.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setRounding(option.id)}
                className={cn(
                  "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium",
                  rounding === option.id
                    ? "border-primary/60 bg-primary/15 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-500",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setText(CURRENCY_SAMPLE[locale as Locale]);
              setMode("paste");
              setPriceIdx(1);
              setRateStr("41.2");
              setOutputMode("add-column");
              setRounding("2dp");
              setNewHeader("");
              setResultTouched(false);
            }}
            className="min-h-11 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            {t.workspace.currencySample}
          </button>
          <button
            type="button"
            onClick={() => {
              setText("");
              setFileTable(null);
              setFileName("");
              setSourceTable({ headers: [], rows: [] });
              setResultTable({ headers: [], rows: [] });
              setError("");
              setResultTouched(false);
            }}
            className="min-h-11 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            {t.workspace.clear}
          </button>
        </div>

        {stats && (
          <p className="text-xs text-slate-500" aria-live="polite">
            {stats.convertedCount > 0
              ? t.workspace.currencyStatsConverted(stats.convertedCount, stats.skippedCount)
              : source.rows.length > 0 && !invalidRate
                ? t.workspace.currencyNoPricesConverted
                : ""}
          </p>
        )}

        <EditableOcrTable
          title={`${t.workspace.currencyInputPreview} · ${t.workspace.rowCount(source.rows.length)}`}
          hint={t.workspace.currencyEditSourceHint}
          mobileScrollHint={t.tableStudio.mobileScrollHint}
          headers={source.headers}
          rows={source.rows}
          emptyLabel={width === 0 ? t.workspace.currencyEmpty : t.workspace.emptyPreview}
          addRowLabel={t.workspace.ocrAddRow}
          addColumnLabel={t.workspace.ocrAddColumn}
          removeRowLabel={t.workspace.ocrRemoveRow}
          removeColumnLabel={t.workspace.ocrRemoveColumn}
          columnLabel={t.workspace.columnLabel}
          onChange={(next) => {
            setResultTouched(false);
            setSourceTable(next);
          }}
        />

        <EditableOcrTable
          title={`${t.workspace.currencyResultPreview} · ${t.workspace.rowCount(resultTable.rows.length)}`}
          hint={t.workspace.currencyEditResultHint}
          mobileScrollHint={t.tableStudio.mobileScrollHint}
          headers={resultTable.headers}
          rows={resultTable.rows}
          emptyLabel={
            invalidRate
              ? t.workspace.currencyInvalidRate
              : width === 0
                ? t.workspace.currencyEmpty
                : t.workspace.emptyPreview
          }
          addRowLabel={t.workspace.ocrAddRow}
          addColumnLabel={t.workspace.ocrAddColumn}
          removeRowLabel={t.workspace.ocrRemoveRow}
          removeColumnLabel={t.workspace.ocrRemoveColumn}
          columnLabel={t.workspace.columnLabel}
          onChange={(next) => {
            setResultTouched(true);
            setResultTable(next);
          }}
        />

        <ExportBar
          filename="puretable-currency"
          sheets={[{ name: t.workspace.sheetItems, headers: resultTable.headers, rows: resultTable.rows }]}
          ready={resultTable.rows.length > 0 && !invalidRate}
          xlsxLabel={t.workspace.currencyDownloadXlsx}
          csvLabel={t.workspace.currencyDownloadCsv}
        />
      </div>
    </ToolShell>
  );
}