"use client";

import { Coins } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/locales";
import { buildCurrencyExportTable, convertTablePrices } from "@/lib/table/currency-convert";
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

export function CurrencyConverterTool() {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<"paste" | "file">("paste");
  const [text, setText] = useState("");
  const [fileTable, setFileTable] = useState<ParsedTable | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [priceIdx, setPriceIdx] = useState(1);
  const [rateStr, setRateStr] = useState("41.2");

  const source = useMemo(() => {
    if (mode === "file" && fileTable) return fileTable;
    return textToTable(text, {
      delimiter: "auto",
      header: true,
      columnLabel: t.workspace.columnLabel,
    });
  }, [mode, fileTable, text, t]);

  const width = useMemo(() => tableWidth(source), [source]);

  const rate = useMemo(() => {
    const n = Number(rateStr.replace(",", "."));
    return Number.isFinite(n) ? n : Number.NaN;
  }, [rateStr]);

  const preview = useMemo(() => {
    if (width === 0 || priceIdx < 0 || priceIdx >= width) return null;
    return convertTablePrices(source, priceIdx, rate);
  }, [source, width, priceIdx, rate]);

  useEffect(() => {
    if (width === 0) return;
    if (priceIdx >= width) setPriceIdx(width - 1);
  }, [width, priceIdx]);

  const exportTable = useMemo(() => {
    if (!preview || preview.rows.length === 0) return { headers: [] as string[], rows: [] as string[][] };
    return buildCurrencyExportTable(source, priceIdx, preview, t.workspace.currencyConvertedHeader);
  }, [source, priceIdx, preview, t]);

  const invalidRate = !Number.isFinite(rate) || rate <= 0;

  async function onFile(file: File) {
    setError("");
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
      setError(t.workspace.unsupportedFile);
      return;
    }
    try {
      const table = await readSpreadsheet(file, t.workspace.columnLabel);
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

  return (
    <ToolShell toolId="currency-converter" icon={Coins}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`rounded-xl border px-4 py-2 text-sm font-medium ${
              mode === "paste"
                ? "border-primary/50 bg-primary/15 text-white"
                : "border-slate-800 text-slate-300"
            }`}
          >
            {t.workspace.pasteMode}
          </button>
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`rounded-xl border px-4 py-2 text-sm font-medium ${
              mode === "file"
                ? "border-primary/50 bg-primary/15 text-white"
                : "border-slate-800 text-slate-300"
            }`}
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
              className="glass-card min-h-48 w-full resize-y rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/50"
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
            <span className="mb-1 block text-xs font-medium text-slate-400">{t.workspace.currencyColumnLabel}</span>
            <select
              value={priceIdx}
              disabled={width === 0}
              onChange={(e) => setPriceIdx(Number(e.target.value))}
              className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              {columnOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-1 block text-xs font-medium text-slate-400">{t.workspace.currencyRateLabel}</span>
            <input
              type="text"
              inputMode="decimal"
              value={rateStr}
              onChange={(e) => setRateStr(e.target.value)}
              className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white"
            />
            {invalidRate && <p className="mt-1 text-xs text-amber-200/90">{t.workspace.currencyInvalidRate}</p>}
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setText(CURRENCY_SAMPLE[locale as Locale]);
              setMode("paste");
              setPriceIdx(1);
              setRateStr("41.2");
            }}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            {t.workspace.currencySample}
          </button>
          <button
            type="button"
            onClick={() => {
              setText("");
              setFileTable(null);
              setFileName("");
              setError("");
            }}
            className="rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            {t.workspace.clear}
          </button>
        </div>

        <TablePreview
          title={`${t.workspace.currencyInputPreview} · ${t.workspace.rowCount(source.rows.length)}`}
          headers={source.headers.length ? source.headers : []}
          rows={source.rows}
          emptyLabel={width === 0 ? t.workspace.currencyEmpty : t.workspace.emptyPreview}
        />

        <TablePreview
          title={`${t.workspace.currencyResultPreview} · ${t.workspace.rowCount(exportTable.rows.length)}`}
          headers={exportTable.headers}
          rows={exportTable.rows}
          emptyLabel={
            invalidRate
              ? t.workspace.currencyInvalidRate
              : width === 0
                ? t.workspace.currencyEmpty
                : t.workspace.emptyPreview
          }
        />

        <ExportBar
          filename="puretable-currency"
          sheets={[{ name: t.workspace.sheetItems, headers: exportTable.headers, rows: exportTable.rows }]}
          ready={exportTable.rows.length > 0 && !invalidRate}
        />
      </div>
    </ToolShell>
  );
}
