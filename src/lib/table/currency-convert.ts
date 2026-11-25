import type { ParsedTable } from "@/lib/table/types";

import { parseCellNumber } from "@/lib/table/numeric-parse";

export type CurrencyOutputMode = "replace" | "add-column";
export type CurrencyRounding = "2dp" | "integer" | "none";

export type CurrencyConvertPreview = {
  convertedCount: number;
  skippedCount: number;
  totals: { original: number; converted: number };
};

export function formatConverted(value: number, rounding: CurrencyRounding): string {
  if (!Number.isFinite(value)) return "";
  switch (rounding) {
    case "integer":
      return String(Math.round(value));
    case "2dp":
      return (Math.round(value * 100) / 100).toFixed(2);
    case "none":
      if (value % 1 === 0) return String(value);
      return String(Number(value.toFixed(8)));
    default:
      return String(value);
  }
}

function tableWidth(table: ParsedTable): number {
  return Math.max(
    table.headers.length,
    table.rows.reduce((max, row) => Math.max(max, row.length), 0),
  );
}

function padRow(row: string[], width: number): string[] {
  return Array.from({ length: width }, (_, index) => row[index] ?? "");
}

export function summarizeConversion(
  table: ParsedTable,
  columnIndex: number,
  rate: number,
  rounding: CurrencyRounding,
): CurrencyConvertPreview | null {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const width = tableWidth(table);
  if (columnIndex < 0 || columnIndex >= width) return null;

  let convertedCount = 0;
  let skippedCount = 0;
  let sumOrig = 0;
  let sumConv = 0;

  for (const row of table.rows) {
    const original = parseCellNumber(row[columnIndex] ?? "");
    if (!Number.isFinite(original) || original < 0) {
      skippedCount += 1;
      continue;
    }
    const converted = original * rate;
    convertedCount += 1;
    sumOrig += original;
    sumConv += converted;
  }

  return {
    convertedCount,
    skippedCount,
    totals: { original: sumOrig, converted: sumConv },
  };
}

export function buildCurrencyResultTable(
  table: ParsedTable,
  columnIndex: number,
  rate: number,
  options: {
    outputMode: CurrencyOutputMode;
    rounding: CurrencyRounding;
    newHeader: string;
  },
): ParsedTable {
  if (!Number.isFinite(rate) || rate <= 0) return { headers: [], rows: [] };

  const width = tableWidth(table);
  if (width === 0 || columnIndex < 0 || columnIndex >= width) return { headers: [], rows: [] };

  const headers =
    options.outputMode === "replace"
      ? padRow(table.headers, width)
      : [...padRow(table.headers, width), options.newHeader.trim() || options.newHeader];

  const rows = table.rows.map((row) => {
    const padded = padRow(row, width);
    const original = parseCellNumber(padded[columnIndex] ?? "");
    const convertedText =
      Number.isFinite(original) && original >= 0
        ? formatConverted(original * rate, options.rounding)
        : "";

    if (options.outputMode === "replace") {
      const next = [...padded];
      if (convertedText) next[columnIndex] = convertedText;
      return next;
    }
    return [...padded, convertedText];
  });

  return { headers, rows };
}

/** @deprecated Use buildCurrencyResultTable — kept for any external refs */
export function convertTablePrices(
  table: ParsedTable,
  columnIndex: number,
  rate: number,
): CurrencyConvertPreview | null {
  return summarizeConversion(table, columnIndex, rate, "2dp");
}

export function buildCurrencyExportTable(
  table: ParsedTable,
  columnIndex: number,
  _preview: CurrencyConvertPreview,
  headerLabel: string,
): ParsedTable {
  return buildCurrencyResultTable(table, columnIndex, 1, {
    outputMode: "add-column",
    rounding: "2dp",
    newHeader: headerLabel,
  });
}