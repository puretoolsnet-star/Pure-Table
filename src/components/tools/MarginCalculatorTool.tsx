"use client";

import { Calculator } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/locales";
import {
  buildMarginExportTable,
  computeMarginPreview,
  type MarginMode,
} from "@/lib/table/margin-calculator";
import { MARGIN_SAMPLE } from "@/lib/table/samples";
import { readSpreadsheet } from "@/lib/table/read-file";
import { textToTable } from "@/lib/table/split-text";
import type { ParsedTable } from "@/lib/table/types";

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const CALC_SELL = -1;

function tableWidth(table: ParsedTable): number {
  return Math.max(
    table.headers.length,
    table.rows.reduce((m, row) => Math.max(m, row.length), 0),
  );
}

export function MarginCalculatorTool() {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<"paste" | "file">("paste");
  const [text, setText] = useState("");
  const [fileTable, setFileTable] = useState<ParsedTable | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const [buyIdx, setBuyIdx] = useState(1);
  const [sellChoice, setSellChoice] = useState<number | typeof CALC_SELL>(2);
  const [qtyNone, setQtyNone] = useState(false);
  const [qtyIdx, setQtyIdx] = useState(3);
  const [calcMode, setCalcMode] = useState<MarginMode>("markup");
  const [percentStr, setPercentStr] = useState("30");

  const source = useMemo(() => {
    if (mode === "file" && fileTable) return fileTable;
    return textToTable(text, {
      delimiter: "auto",
      header: true,
      columnLabel: t.workspace.columnLabel,
    });
  }, [mode, fileTable, text, t]);

  const width = useMemo(() => tableWidth(source), [source]);

  const percent = useMemo(() => {
    const n = Number(percentStr.replace(",", "."));
    return Number.isFinite(n) ? n : Number.NaN;
  }, [percentStr]);

  const sellFromColumn = sellChoice !== CALC_SELL;
  const sellColumnIndex = sellFromColumn ? sellChoice : 0;

  const preview = useMemo(() => {
    if (width === 0) return null;
    if (buyIdx < 0 || buyIdx >= width) return null;
    const qty = qtyNone ? undefined : qtyIdx;
    if (!qtyNone && (qty === undefined || qty < 0 || qty >= width)) return null;

    if (sellFromColumn) {
      if (sellColumnIndex < 0 || sellColumnIndex >= width || sellColumnIndex === buyIdx) return null;
      return computeMarginPreview(
        source,
        { buy: buyIdx, useSellColumn: true, sell: sellColumnIndex, qty },
        "markup",
        0,
      );
    }

    if (!Number.isFinite(percent) || percent < 0 || percent > 999) return null;
    if (calcMode === "margin" && percent >= 100) return null;
    return computeMarginPreview(
      source,
      { buy: buyIdx, useSellColumn: false, qty },
      calcMode,
      percent,
    );
  }, [source, width, buyIdx, sellFromColumn, sellColumnIndex, qtyNone, qtyIdx, calcMode, percent]);

  useEffect(() => {
    if (width === 0) return;
    if (buyIdx >= width) setBuyIdx(0);
    if (sellFromColumn && sellColumnIndex >= width) setSellChoice(Math.min(1, width - 1));
    if (!qtyNone && qtyIdx >= width) setQtyIdx(width - 1);
  }, [width, buyIdx, sellFromColumn, sellColumnIndex, qtyNone, qtyIdx]);

  const exportTable = useMemo(() => {
    if (!preview || preview.rows.length === 0) return { headers: [] as string[], rows: [] as string[][] };
    return buildMarginExportTable(preview, {
      buy: t.workspace.colBuy,
      sell: t.workspace.colSell,
      qty: t.workspace.colQty,
      costTotal: t.workspace.colCostTotal,
      revenue: t.workspace.colRevenue,
      profit: t.workspace.colProfit,
      marginPct: t.workspace.colMarginPct,
      markupPct: t.workspace.colMarkupPct,
      totals: t.workspace.marginTotalsRow,
    });
  }, [preview, t]);

  const resultPreviewHeaders = useMemo(() => {
    if (!preview || preview.rows.length === 0) return [] as string[];
    return [
      t.workspace.colBuy,
      t.workspace.colSell,
      t.workspace.colQty,
      t.workspace.colCostTotal,
      t.workspace.colRevenue,
      t.workspace.colProfit,
      t.workspace.colMarginPct,
      t.workspace.colMarkupPct,
    ];
  }, [preview, t]);

  const resultPreviewRows = useMemo(() => {
    if (!preview || preview.rows.length === 0) return [] as string[][];
    const fmt = (n: number, frac = 2) => (Number.isFinite(n) ? n.toFixed(frac) : "");
    const rows = preview.rows.map((r) => [
      fmt(r.buy),
      fmt(r.sell),
      fmt(r.qty, r.qty % 1 === 0 ? 0 : 2),
      fmt(r.costTotal),
      fmt(r.revenue),
      fmt(r.profit),
      fmt(r.marginPct),
      fmt(r.markupPct),
    ]);
    const tot = preview.totals;
    rows.push([
      t.workspace.marginTotalsRow,
      "",
      "",
      fmt(tot.costTotal),
      fmt(tot.revenue),
      fmt(tot.profit),
      fmt(tot.marginPct),
      fmt(tot.markupPct),
    ]);
    return rows;
  }, [preview, t]);

  const invalidPercent =
    !sellFromColumn &&
    (!Number.isFinite(percent) || percent < 0 || percent > 999 || (calcMode === "margin" && percent >= 100));

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

  const sellSelectOptions = columnOptions.filter((o) => o.value !== buyIdx);

  return (
    <ToolShell toolId="margin-calculator" icon={Calculator}>
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
            <span className="mb-1 block text-xs font-medium text-slate-400">{t.workspace.marginBuyColumn}</span>
            <select
              value={buyIdx}
              disabled={width === 0}
              onChange={(e) => {
                const next = Number(e.target.value);
                setBuyIdx(next);
                if (sellChoice !== CALC_SELL && sellChoice === next) setSellChoice(CALC_SELL);
              }}
              className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              {columnOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <div className="block min-w-0">
            <span className="mb-1 block text-xs font-medium text-slate-400">{t.workspace.marginSellColumn}</span>
            <select
              value={sellFromColumn ? sellChoice : CALC_SELL}
              disabled={width === 0}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v === CALC_SELL) setSellChoice(CALC_SELL);
                else setSellChoice(v);
              }}
              className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              <option value={CALC_SELL}>{t.workspace.marginPercentLabel}</option>
              {sellSelectOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {!sellFromColumn && (
              <div className="mt-3 space-y-2 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                    <input
                      type="radio"
                      name="mcalc"
                      checked={calcMode === "markup"}
                      onChange={() => setCalcMode("markup")}
                      className="h-4 w-4 accent-blue-500"
                    />
                    {t.workspace.marginModeMarkup}
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-300">
                    <input
                      type="radio"
                      name="mcalc"
                      checked={calcMode === "margin"}
                      onChange={() => setCalcMode("margin")}
                      className="h-4 w-4 accent-blue-500"
                    />
                    {t.workspace.marginModeMargin}
                  </label>
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={percentStr}
                  onChange={(e) => setPercentStr(e.target.value)}
                  className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white"
                  aria-label={t.workspace.marginPercentLabel}
                />
              </div>
            )}
          </div>

          <label className="block min-w-0 sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-400">{t.workspace.marginQtyColumn}</span>
            <label className="mb-2 inline-flex items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={qtyNone}
                onChange={(e) => setQtyNone(e.target.checked)}
                className="h-4 w-4 accent-blue-500"
              />
              {t.workspace.marginQtyOptional}
            </label>
            {!qtyNone && (
              <select
                value={qtyIdx}
                disabled={width === 0}
                onChange={(e) => setQtyIdx(Number(e.target.value))}
                className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                {columnOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            )}
          </label>
        </div>

        {invalidPercent && <p className="text-sm text-amber-200/90">{t.workspace.marginInvalidPercent}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setText(MARGIN_SAMPLE[locale as Locale]);
              setMode("paste");
              setBuyIdx(1);
              setSellChoice(2);
              setQtyNone(false);
              setQtyIdx(3);
            }}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            {t.workspace.marginSample}
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
          title={`${t.workspace.marginInputPreview} · ${t.workspace.rowCount(source.rows.length)}`}
          headers={source.headers.length ? source.headers : []}
          rows={source.rows}
          emptyLabel={width === 0 ? t.workspace.marginEmpty : t.workspace.emptyPreview}
        />

        <TablePreview
          title={`${t.workspace.marginResultPreview} · ${t.workspace.rowCount(preview?.rows.length ?? 0)}`}
          headers={resultPreviewHeaders}
          rows={resultPreviewRows}
          emptyLabel={
            invalidPercent || width === 0 ? (width === 0 ? t.workspace.marginEmpty : t.workspace.marginInvalidPercent) : t.workspace.emptyPreview
          }
        />

        <ExportBar
          filename="puretable-margin"
          sheets={[{ name: t.workspace.sheetItems, headers: exportTable.headers, rows: exportTable.rows }]}
          ready={exportTable.rows.length > 0 && !invalidPercent}
        />
      </div>
    </ToolShell>
  );
}
