"use client";

import { Calculator } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EditableOcrTable } from "@/components/tools/EditableOcrTable";
import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/cn";
import {
  applyPercentToSellColumn,
  buildMarginExportTable,
  computeMarginPreview,
  ensureColumnAt,
  type MarginMode,
} from "@/lib/table/margin-calculator";
import { MARGIN_SAMPLE } from "@/lib/table/samples";
import { readSpreadsheet } from "@/lib/table/read-file";
import { textToTable } from "@/lib/table/split-text";
import type { ParsedTable } from "@/lib/table/types";

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type PriceMode = "markup" | "margin" | "column";
const ITEM_NONE = -1;

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

export function MarginCalculatorTool() {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<"paste" | "file">("paste");
  const [text, setText] = useState("");
  const [fileTable, setFileTable] = useState<ParsedTable | null>(null);
  const [fileName, setFileName] = useState("");
  const [sourceTable, setSourceTable] = useState<ParsedTable>({ headers: [], rows: [] });
  const [error, setError] = useState("");

  const [buyIdx, setBuyIdx] = useState(1);
  const [sellIdx, setSellIdx] = useState(2);
  const [itemIdx, setItemIdx] = useState(0);
  const [qtyNone, setQtyNone] = useState(false);
  const [qtyIdx, setQtyIdx] = useState(3);
  const [priceMode, setPriceMode] = useState<PriceMode>("markup");
  const [percentStr, setPercentStr] = useState("30");

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
  const effectiveBuy = clampIndex(buyIdx, width);
  const effectiveSell = clampIndex(sellIdx, width);
  const effectiveQty = clampIndex(qtyIdx, width);
  const useSellColumn = priceMode === "column";
  const calcMode: MarginMode = priceMode === "margin" ? "margin" : "markup";

  const percent = useMemo(() => {
    const n = Number(percentStr.replace(",", "."));
    return Number.isFinite(n) ? n : Number.NaN;
  }, [percentStr]);

  const invalidPercent =
    !useSellColumn &&
    (!Number.isFinite(percent) || percent < 0 || percent > 999 || (calcMode === "margin" && percent >= 100));

  const preview = useMemo(() => {
    if (width === 0) return null;
    const qty = qtyNone ? undefined : effectiveQty;
    return computeMarginPreview(
      source,
      {
        buy: effectiveBuy,
        useSellColumn,
        sell: useSellColumn ? effectiveSell : undefined,
        qty,
      },
      calcMode,
      percent,
    );
  }, [
    source,
    width,
    effectiveBuy,
    useSellColumn,
    effectiveSell,
    qtyNone,
    effectiveQty,
    calcMode,
    percent,
  ]);

  const itemNames = useMemo(() => {
    if (itemIdx === ITEM_NONE || itemIdx < 0 || itemIdx >= width) return undefined;
    return source.rows.map((row) => row[itemIdx] ?? "");
  }, [source.rows, itemIdx, width]);

  const exportTable = useMemo(() => {
    if (!preview || preview.rows.length === 0) return { headers: [] as string[], rows: [] as string[][] };
    return buildMarginExportTable(
      preview,
      {
        item: itemIdx !== ITEM_NONE ? t.workspace.colItem : undefined,
        buy: t.workspace.colBuy,
        sell: t.workspace.colSell,
        qty: t.workspace.colQty,
        costTotal: t.workspace.colCostTotal,
        revenue: t.workspace.colRevenue,
        profit: t.workspace.colProfit,
        marginPct: t.workspace.colMarginPct,
        markupPct: t.workspace.colMarkupPct,
        totals: t.workspace.marginTotalsRow,
      },
      { items: itemNames },
    );
  }, [preview, t, itemNames, itemIdx]);

  const resultPreviewHeaders = useMemo(() => exportTable.headers, [exportTable.headers]);
  const resultPreviewRows = useMemo(() => {
    if (!preview || preview.rows.length === 0) return [] as string[][];
    const fmt = (n: number, frac = 2) => (Number.isFinite(n) ? n.toFixed(frac) : "");
    const rows = preview.rows.map((r, index) => {
      const base = [
        fmt(r.buy),
        fmt(r.sell),
        fmt(r.qty, r.qty % 1 === 0 ? 0 : 2),
        fmt(r.costTotal),
        fmt(r.revenue),
        fmt(r.profit),
        fmt(r.marginPct),
        fmt(r.markupPct),
      ];
      const item = itemNames?.[index]?.trim() ?? "";
      return itemIdx !== ITEM_NONE ? [item, ...base] : base;
    });
    const tot = preview.totals;
    const totalCore = [
      "",
      "",
      "",
      fmt(tot.costTotal),
      fmt(tot.revenue),
      fmt(tot.profit),
      fmt(tot.marginPct),
      fmt(tot.markupPct),
    ];
    rows.push(
      itemIdx !== ITEM_NONE
        ? [t.workspace.marginTotalsRow, "", ...totalCore]
        : [t.workspace.marginTotalsRow, ...totalCore],
    );
    return rows;
  }, [preview, t, itemNames, itemIdx]);

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

  function applyPercentToAll() {
    if (invalidPercent) return;
    let table = source;
    let sellColumn = effectiveSell;
    if (sellColumn === effectiveBuy) {
      const ensured = ensureColumnAt(table, width, t.workspace.colSell);
      table = ensured.table;
      sellColumn = width;
      setSellIdx(sellColumn);
    }
    setSourceTable(applyPercentToSellColumn(table, effectiveBuy, sellColumn, calcMode, percent));
    setPriceMode("column");
  }

  const columnOptions = Array.from({ length: width }, (_, i) => {
    const label = source.headers[i]?.trim() || t.workspace.columnLabel(i + 1);
    return { value: i, label: `${i + 1}. ${label}` };
  });

  const sellSelectOptions = columnOptions.filter((o) => o.value !== effectiveBuy);
  const priceModes: Array<{ id: PriceMode; label: string }> = [
    { id: "markup", label: t.workspace.marginModeMarkup },
    { id: "margin", label: t.workspace.marginModeMargin },
    { id: "column", label: t.workspace.marginModeSellFromColumn },
  ];

  const totals = preview?.totals;

  return (
    <ToolShell toolId="margin-calculator" icon={Calculator}>
      <div className="min-w-0 space-y-5">
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

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h2 className="text-sm font-semibold text-white">{t.workspace.marginHelpTitle}</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">{t.workspace.marginHelpMarkup}</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">{t.workspace.marginHelpMargin}</p>
        </section>

        <section className="min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            {t.workspace.marginPriceModeLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {priceModes.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setPriceMode(option.id)}
                className={cn(
                  "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium",
                  priceMode === option.id
                    ? "border-primary/60 bg-primary/15 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-500",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {!useSellColumn && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                inputMode="decimal"
                value={percentStr}
                onChange={(e) => setPercentStr(e.target.value)}
                className="glass-card w-full max-w-[8rem] rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white"
                aria-label={t.workspace.marginPercentLabel}
              />
              <button
                type="button"
                disabled={invalidPercent || width === 0}
                onClick={applyPercentToAll}
                className="min-h-10 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 disabled:opacity-40"
              >
                {t.workspace.marginApplyPercent}
              </button>
            </div>
          )}
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-1 block text-xs font-medium text-slate-400">{t.workspace.marginBuyColumn}</span>
            <select
              value={effectiveBuy}
              disabled={width === 0}
              onChange={(e) => setBuyIdx(Number(e.target.value))}
              className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white"
            >
              {columnOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          {useSellColumn && (
            <label className="block min-w-0">
              <span className="mb-1 block text-xs font-medium text-slate-400">{t.workspace.marginSellColumn}</span>
              <select
                value={effectiveSell}
                disabled={width === 0}
                onChange={(e) => setSellIdx(Number(e.target.value))}
                className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white"
              >
                {sellSelectOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block min-w-0">
            <span className="mb-1 block text-xs font-medium text-slate-400">{t.workspace.marginItemColumn}</span>
            <select
              value={itemIdx}
              disabled={width === 0}
              onChange={(e) => setItemIdx(Number(e.target.value))}
              className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white"
            >
              <option value={ITEM_NONE}>{t.workspace.marginItemNone}</option>
              {columnOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0 sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-400">{t.workspace.marginQtyColumn}</span>
            <label className="mb-2 inline-flex min-h-10 items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={qtyNone}
                onChange={(e) => setQtyNone(e.target.checked)}
                className="h-5 w-5 accent-primary"
              />
              {t.workspace.marginQtyOptional}
            </label>
            {!qtyNone && (
              <select
                value={effectiveQty}
                disabled={width === 0}
                onChange={(e) => setQtyIdx(Number(e.target.value))}
                className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white"
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
              setSellIdx(2);
              setQtyNone(false);
              setQtyIdx(3);
              setItemIdx(0);
              setPriceMode("column");
            }}
            className="min-h-11 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            {t.workspace.marginSample}
          </button>
          <button
            type="button"
            onClick={() => {
              setText("");
              setFileTable(null);
              setFileName("");
              setSourceTable({ headers: [], rows: [] });
              setError("");
            }}
            className="min-h-11 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            {t.workspace.clear}
          </button>
        </div>

        <EditableOcrTable
          title={`${t.workspace.marginInputPreview} · ${t.workspace.rowCount(source.rows.length)}`}
          hint={t.workspace.marginEditSourceHint}
          mobileScrollHint={t.tableStudio.mobileScrollHint}
          headers={source.headers}
          rows={source.rows}
          emptyLabel={width === 0 ? t.workspace.marginEmpty : t.workspace.emptyPreview}
          addRowLabel={t.workspace.ocrAddRow}
          addColumnLabel={t.workspace.ocrAddColumn}
          removeRowLabel={t.workspace.ocrRemoveRow}
          removeColumnLabel={t.workspace.ocrRemoveColumn}
          columnLabel={t.workspace.columnLabel}
          onChange={setSourceTable}
        />

        {totals && preview && preview.rows.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Stat label={t.workspace.colCostTotal} value={fmtMoney(totals.costTotal)} />
            <Stat label={t.workspace.colRevenue} value={fmtMoney(totals.revenue)} />
            <Stat label={t.workspace.colProfit} value={fmtMoney(totals.profit)} />
            <Stat label={t.workspace.colMarginPct} value={`${fmtMoney(totals.marginPct)}%`} />
            <Stat label={t.workspace.colMarkupPct} value={`${fmtMoney(totals.markupPct)}%`} />
          </div>
        )}

        <TablePreview
          title={`${t.workspace.marginResultPreview} · ${t.workspace.rowCount(preview?.rows.length ?? 0)}`}
          headers={resultPreviewHeaders}
          rows={resultPreviewRows}
          emptyLabel={
            invalidPercent || width === 0
              ? width === 0
                ? t.workspace.marginEmpty
                : t.workspace.marginInvalidPercent
              : t.workspace.emptyPreview
          }
          mobileScrollHint={t.tableStudio.mobileScrollHint}
        />

        <ExportBar
          filename="puretable-margin"
          sheets={[{ name: t.workspace.sheetItems, headers: exportTable.headers, rows: exportTable.rows }]}
          ready={exportTable.rows.length > 0 && !invalidPercent}
          xlsxLabel={t.workspace.marginDownloadXlsx}
          csvLabel={t.workspace.marginDownloadCsv}
        />
      </div>
    </ToolShell>
  );
}

function fmtMoney(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : "—";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
