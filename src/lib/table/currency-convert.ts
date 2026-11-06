import type { ParsedTable } from "@/lib/table/types";

import { parseCellNumber } from "@/lib/table/numeric-parse";

export type CurrencyConvertPreview = {
  rows: Array<{ original: number; converted: number }>;
  totals: { original: number; converted: number };
};

export function convertTablePrices(
  table: ParsedTable,
  columnIndex: number,
  rate: number,
): CurrencyConvertPreview | null {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const width = Math.max(
    table.headers.length,
    table.rows.reduce((max, row) => Math.max(max, row.length), 0),
  );
  if (columnIndex < 0 || columnIndex >= width) return null;

  const rows: Array<{ original: number; converted: number }> = [];
  let sumOrig = 0;
  let sumConv = 0;

  for (const row of table.rows) {
    const raw = row[columnIndex] ?? "";
    const original = parseCellNumber(raw);
    if (!Number.isFinite(original)) continue;
    const converted = original * rate;
    rows.push({ original, converted });
    sumOrig += original;
    sumConv += converted;
  }

  return {
    rows,
    totals: { original: sumOrig, converted: sumConv },
  };
}

function padRow(row: string[], width: number): string[] {
  return Array.from({ length: width }, (_, index) => row[index] ?? "");
}

export function buildCurrencyExportTable(
  table: ParsedTable,
  columnIndex: number,
  preview: CurrencyConvertPreview,
  headerLabel: string,
): ParsedTable {
  const width = Math.max(
    table.headers.length,
    table.rows.reduce((max, row) => Math.max(max, row.length), 0),
  );
  if (width === 0) return { headers: [], rows: [] };

  const headers = [...padRow(table.headers, width), headerLabel];

  let pi = 0;
  const rows = table.rows.map((row) => {
    const padded = padRow(row, width);
    const original = parseCellNumber(padded[columnIndex] ?? "");
    if (!Number.isFinite(original)) {
      return [...padded, ""];
    }
    const conv = preview.rows[pi]?.converted;
    pi += 1;
    return [...padded, conv !== undefined ? String(conv) : ""];
  });

  return { headers, rows };
}
