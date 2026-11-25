"use client";

import { GitCompare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/cn";
import {
  comparePriceTables,
  filterPriceDiffRows,
  type PriceDiffStatus,
} from "@/lib/table/price-diff";
import { PRICE_DIFF_SAMPLE_A, PRICE_DIFF_SAMPLE_B } from "@/lib/table/samples";
import { readSpreadsheet } from "@/lib/table/read-file";
import { textToTable } from "@/lib/table/split-text";
import type { ParsedTable } from "@/lib/table/types";

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const ALL_FILTERS: Array<PriceDiffStatus | "all"> = [
  "all",
  "up",
  "down",
  "same",
  "only-a",
  "only-b",
  "no-price",
];

function columnOptions(headers: string[], columnLabel: (index: number) => string) {
  const width = Math.max(headers.length, 1);
  return Array.from({ length: width }, (_, index) => ({
    index,
    label: headers[index]?.trim() || columnLabel(index + 1),
  }));
}

function clampIndex(index: number, width: number): number {
  if (width <= 0) return 0;
  return Math.max(0, Math.min(index, width - 1));
}

const pasteClass =
  "glass-card min-h-28 w-full max-w-full resize-y rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/50";

export function PriceDiffTool() {
  const { t, locale } = useI18n();
  const [leftFile, setLeftFile] = useState<ParsedTable | null>(null);
  const [rightFile, setRightFile] = useState<ParsedTable | null>(null);
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [error, setError] = useState("");
  const [keyColumn, setKeyColumn] = useState(0);
  const [leftPriceColumn, setLeftPriceColumn] = useState(1);
  const [rightKeyColumn, setRightKeyColumn] = useState(0);
  const [rightPriceColumn, setRightPriceColumn] = useState(1);
  const [syncKeys, setSyncKeys] = useState(true);
  const [filter, setFilter] = useState<PriceDiffStatus | "all">("all");

  const left = useMemo(
    () =>
      leftFile ??
      textToTable(leftText, {
        delimiter: "auto",
        header: true,
        columnLabel: t.workspace.columnLabel,
      }),
    [leftFile, leftText, t],
  );

  const right = useMemo(
    () =>
      rightFile ??
      textToTable(rightText, {
        delimiter: "auto",
        header: true,
        columnLabel: t.workspace.columnLabel,
      }),
    [rightFile, rightText, t],
  );

  useEffect(() => {
    if (syncKeys) setRightKeyColumn(keyColumn);
  }, [keyColumn, syncKeys]);

  const statusLabel = (status: PriceDiffStatus): string => {
    switch (status) {
      case "up":
        return t.workspace.priceDiffStatusUp;
      case "down":
        return t.workspace.priceDiffStatusDown;
      case "same":
        return t.workspace.priceDiffStatusSame;
      case "only-a":
        return t.workspace.priceDiffStatusOnlyA;
      case "only-b":
        return t.workspace.priceDiffStatusOnlyB;
      case "no-price":
        return t.workspace.priceDiffStatusNoPrice;
    }
  };

  const filterLabel = (id: PriceDiffStatus | "all"): string => {
    if (id === "all") return t.workspace.priceDiffFilterAll;
    return statusLabel(id);
  };

  const diffFull = useMemo(
    () =>
      comparePriceTables(left, right, {
        keyColumn: clampIndex(keyColumn, left.headers.length || left.rows[0]?.length || 1),
        leftPriceColumn: clampIndex(leftPriceColumn, left.headers.length || left.rows[0]?.length || 1),
        rightKeyColumn: clampIndex(rightKeyColumn, right.headers.length || right.rows[0]?.length || 1),
        rightPriceColumn: clampIndex(
          rightPriceColumn,
          right.headers.length || right.rows[0]?.length || 1,
        ),
        productHeader: t.workspace.colItem,
        priceLeftHeader: t.workspace.colPriceOld,
        priceRightHeader: t.workspace.colPriceNew,
        diffHeader: t.workspace.colPriceDelta,
        pctHeader: t.workspace.colPriceDeltaPct,
        statusHeader: t.workspace.priceDiffStatusColumn,
        statusLabel,
      }),
    [left, right, keyColumn, leftPriceColumn, rightKeyColumn, rightPriceColumn, t],
  );

  const diff = useMemo(() => {
    const active = filter === "all" ? "all" : new Set<PriceDiffStatus>([filter]);
    return filterPriceDiffRows(diffFull, active);
  }, [diffFull, filter]);

  const leftCols = columnOptions(left.headers, t.workspace.columnLabel);
  const rightCols = columnOptions(right.headers, t.workspace.columnLabel);
  const hasBoth = left.rows.length > 0 && right.rows.length > 0;
  const ready = hasBoth && diff.rows.length > 0;

  async function loadSide(side: "left" | "right", file: File) {
    setError("");
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
      setError(t.workspace.unsupportedFile);
      return;
    }
    try {
      const { table } = await readSpreadsheet(file, t.workspace.columnLabel);
      if (table.headers.length === 0 && table.rows.length === 0) {
        setError(t.workspace.parseFailed);
        return;
      }
      if (side === "left") {
        setLeftFile(table);
        setLeftText("");
      } else {
        setRightFile(table);
        setRightText("");
      }
    } catch {
      setError(t.workspace.parseFailed);
    }
  }

  function loadSample() {
    setLeftFile(null);
    setRightFile(null);
    setLeftText(PRICE_DIFF_SAMPLE_A[locale as Locale]);
    setRightText(PRICE_DIFF_SAMPLE_B[locale as Locale]);
    setKeyColumn(0);
    setLeftPriceColumn(1);
    setRightPriceColumn(1);
    setRightKeyColumn(0);
    setSyncKeys(true);
    setFilter("all");
    setError("");
  }

  const selectClass =
    "w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50 disabled:opacity-50";

  return (
    <ToolShell toolId="price-diff" icon={GitCompare}>
      <div className="min-w-0 space-y-5">
        <p className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm leading-relaxed text-slate-400">
          {t.workspace.priceDiffLocalHint}
        </p>

        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <fieldset className="min-w-0 space-y-3">
            <p className="text-sm font-semibold text-white">{t.workspace.priceDiffSourceA}</p>
            <FileDropzone
              accept={SPREADSHEET}
              multiple={false}
              title={t.workspace.dropTitle}
              hint={t.workspace.dropHint}
              onFiles={(files) => {
                const file = files[0];
                if (file) void loadSide("left", file);
              }}
            />
            <label className="block min-w-0">
              <span className="mb-1 block text-xs text-slate-500">{t.workspace.priceDiffPasteSideA}</span>
              <textarea
                value={leftText}
                onChange={(e) => {
                  setLeftFile(null);
                  setLeftText(e.target.value);
                }}
                className={pasteClass}
                placeholder={t.workspace.pastePlaceholder}
              />
            </label>
          </fieldset>
          <fieldset className="min-w-0 space-y-3">
            <p className="text-sm font-semibold text-white">{t.workspace.priceDiffSourceB}</p>
            <FileDropzone
              accept={SPREADSHEET}
              multiple={false}
              title={t.workspace.dropTitle}
              hint={t.workspace.dropHint}
              onFiles={(files) => {
                const file = files[0];
                if (file) void loadSide("right", file);
              }}
            />
            <label className="block min-w-0">
              <span className="mb-1 block text-xs text-slate-500">{t.workspace.priceDiffPasteSideB}</span>
              <textarea
                value={rightText}
                onChange={(e) => {
                  setRightFile(null);
                  setRightText(e.target.value);
                }}
                className={pasteClass}
                placeholder={t.workspace.pastePlaceholder}
              />
            </label>
          </fieldset>
        </div>

        {error && <p className="text-sm text-amber-200/90">{error}</p>}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadSample}
            className="min-h-11 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            {t.workspace.priceDiffLoadSample}
          </button>
          <button
            type="button"
            onClick={() => {
              setLeftFile(null);
              setRightFile(null);
              setLeftText("");
              setRightText("");
              setError("");
            }}
            className="min-h-11 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            {t.workspace.clear}
          </button>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-medium text-slate-400">
              {t.workspace.priceDiffKeyColumn}
            </span>
            <select
              value={clampIndex(keyColumn, leftCols.length)}
              onChange={(event) => setKeyColumn(Number(event.target.value))}
              className={selectClass}
              disabled={left.headers.length === 0 && left.rows.length === 0}
            >
              {leftCols.map((option) => (
                <option key={option.index} value={option.index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-medium text-slate-400">
              {t.workspace.priceDiffLeftPriceColumn}
            </span>
            <select
              value={clampIndex(leftPriceColumn, leftCols.length)}
              onChange={(event) => setLeftPriceColumn(Number(event.target.value))}
              className={selectClass}
              disabled={left.headers.length === 0 && left.rows.length === 0}
            >
              {leftCols.map((option) => (
                <option key={option.index} value={option.index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-medium text-slate-400">
              {t.workspace.priceDiffRightKeyColumn}
            </span>
            <select
              value={clampIndex(rightKeyColumn, rightCols.length)}
              onChange={(event) => {
                setSyncKeys(false);
                setRightKeyColumn(Number(event.target.value));
              }}
              className={selectClass}
              disabled={syncKeys || (right.headers.length === 0 && right.rows.length === 0)}
            >
              {rightCols.map((option) => (
                <option key={option.index} value={option.index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-medium text-slate-400">
              {t.workspace.priceDiffRightPriceColumn}
            </span>
            <select
              value={clampIndex(rightPriceColumn, rightCols.length)}
              onChange={(event) => setRightPriceColumn(Number(event.target.value))}
              className={selectClass}
              disabled={right.headers.length === 0 && right.rows.length === 0}
            >
              {rightCols.map((option) => (
                <option key={option.index} value={option.index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={syncKeys}
            onChange={(e) => setSyncKeys(e.target.checked)}
            className="h-5 w-5 accent-primary"
          />
          {t.workspace.priceDiffSyncKeys}
        </label>

        <section className="min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            {t.workspace.priceDiffFilterLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {ALL_FILTERS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium",
                  filter === id
                    ? "border-primary/60 bg-primary/15 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-500",
                )}
              >
                {filterLabel(id)}
              </button>
            ))}
          </div>
        </section>

        {hasBoth && diffFull.rows.length > 0 && (
          <p className="text-xs text-slate-500">
            {t.workspace.priceDiffStats(diffFull.rows.length, diff.rows.length)}
          </p>
        )}

        <TablePreview
          title={`${t.workspace.previewTitle} · ${t.workspace.rowCount(diff.rows.length)}`}
          headers={diff.headers}
          rows={diff.rows}
          emptyLabel={!hasBoth ? t.workspace.priceDiffEmpty : t.workspace.emptyPreview}
          mobileScrollHint={t.tableStudio.mobileScrollHint}
        />

        <ExportBar
          filename="puretable-price-diff"
          sheets={[{ name: t.workspace.sheetItems, headers: diff.headers, rows: diff.rows }]}
          ready={ready}
          note={!ready && hasBoth ? t.workspace.priceDiffEmpty : undefined}
          xlsxLabel={t.workspace.priceDiffDownloadXlsx}
          csvLabel={t.workspace.priceDiffDownloadCsv}
        />
      </div>
    </ToolShell>
  );
}