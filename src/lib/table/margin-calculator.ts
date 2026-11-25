import type { ParsedTable } from "@/lib/table/types";

import { parseCellNumber } from "@/lib/table/numeric-parse";

export type MarginMode = "markup" | "margin";

export type MarginColumnIndices = {
  buy: number;
  /** When false, `sell` column is ignored and price comes from markup/margin % */
  useSellColumn: boolean;
  sell?: number;
  qty?: number;
};

export type MarginRowResult = {
  buy: number;
  sell: number;
  qty: number;
  costTotal: number;
  revenue: number;
  profit: number;
  marginPct: number;
  markupPct: number;
};

export type MarginPreview = {
  rows: MarginRowResult[];
  totals: {
    costTotal: number;
    revenue: number;
    profit: number;
    marginPct: number;
    markupPct: number;
  };
};

function pct(part: number, whole: number): number {
  if (!Number.isFinite(whole) || whole === 0) return 0;
  return (part / whole) * 100;
}

export function computeMarginPreview(
  table: ParsedTable,
  columns: MarginColumnIndices,
  mode: MarginMode,
  modeValue: number,
): MarginPreview | null {
  const width = Math.max(
    table.headers.length,
    table.rows.reduce((max, row) => Math.max(max, row.length), 0),
  );
  if (width === 0) return null;

  const buyIdx = columns.buy;
  const sellIdx = columns.sell;
  const useSell = columns.useSellColumn;
  const qtyIdx = columns.qty;
  if (buyIdx < 0 || buyIdx >= width) return null;
  if (useSell) {
    if (sellIdx === undefined || sellIdx < 0 || sellIdx >= width || sellIdx === buyIdx) return null;
  }

  const rows: MarginRowResult[] = [];
  for (const row of table.rows) {
    const buy = parseCellNumber(row[buyIdx] ?? "");
    if (!Number.isFinite(buy) || buy < 0) continue;

    const sellRaw = useSell ? parseCellNumber(row[sellIdx!] ?? "") : Number.NaN;

    let sell = sellRaw;
    if (!useSell || !Number.isFinite(sell) || sell <= 0) {
      if (!useSell) {
        if (mode === "markup" && Number.isFinite(modeValue)) {
          sell = buy * (1 + modeValue / 100);
        } else if (mode === "margin" && Number.isFinite(modeValue) && modeValue < 100) {
          sell = buy / (1 - modeValue / 100);
        } else {
          continue;
        }
      } else if (!Number.isFinite(sell) || sell <= 0) {
        continue;
      }
    }

    let qty = 1;
    if (qtyIdx !== undefined && qtyIdx >= 0 && qtyIdx < width) {
      const q = parseCellNumber(row[qtyIdx] ?? "");
      if (Number.isFinite(q) && q > 0) qty = q;
    }

    const costTotal = buy * qty;
    const revenue = sell * qty;
    const profit = revenue - costTotal;
    const marginPct = pct(profit, revenue);
    const markupPct = pct(profit, costTotal);

    rows.push({
      buy,
      sell,
      qty,
      costTotal,
      revenue,
      profit,
      marginPct,
      markupPct,
    });
  }

  if (rows.length === 0) return { rows: [], totals: { costTotal: 0, revenue: 0, profit: 0, marginPct: 0, markupPct: 0 } };

  const costTotal = rows.reduce((sum, r) => sum + r.costTotal, 0);
  const revenue = rows.reduce((sum, r) => sum + r.revenue, 0);
  const profit = revenue - costTotal;

  return {
    rows,
    totals: {
      costTotal,
      revenue,
      profit,
      marginPct: pct(profit, revenue),
      markupPct: pct(profit, costTotal),
    },
  };
}

function formatNumber(n: number, fraction = 2): string | number {
  if (!Number.isFinite(n)) return "";
  return fraction === 0 && n % 1 === 0 ? n : Number(n.toFixed(fraction));
}

export function applyPercentToSellColumn(
  table: ParsedTable,
  buyIdx: number,
  sellIdx: number,
  mode: MarginMode,
  percent: number,
): ParsedTable {
  if (!Number.isFinite(percent) || percent < 0) return table;
  if (mode === "margin" && percent >= 100) return table;

  const width = Math.max(
    table.headers.length,
    table.rows.reduce((max, row) => Math.max(max, row.length), 0),
    sellIdx + 1,
  );
  const headers = Array.from({ length: width }, (_, index) => table.headers[index]?.trim() ?? "");

  const rows = table.rows.map((row) => {
    const buy = parseCellNumber(row[buyIdx] ?? "");
    if (!Number.isFinite(buy) || buy < 0) {
      return Array.from({ length: width }, (_, index) => row[index] ?? "");
    }
    let sell = Number.NaN;
    if (mode === "markup") sell = buy * (1 + percent / 100);
    else if (mode === "margin") sell = buy / (1 - percent / 100);
    const next = Array.from({ length: width }, (_, index) => row[index] ?? "");
    if (Number.isFinite(sell)) {
      next[sellIdx] = sell % 1 === 0 ? String(sell) : sell.toFixed(2);
    }
    return next;
  });

  return { headers, rows };
}

export function ensureColumnAt(
  table: ParsedTable,
  index: number,
  header: string,
): { table: ParsedTable; index: number } {
  const width = Math.max(table.headers.length, index + 1);
  const headers = Array.from({ length: width }, (_, i) =>
    i === index ? header : table.headers[i]?.trim() ?? "",
  );
  const rows = table.rows.map((row) =>
    Array.from({ length: width }, (_, i) => (i === index ? row[i] ?? "" : row[i] ?? "")),
  );
  return { table: { headers, rows }, index };
}

export function buildMarginExportTable(
  preview: MarginPreview,
  labels: {
    item?: string;
    buy: string;
    sell: string;
    qty: string;
    costTotal: string;
    revenue: string;
    profit: string;
    marginPct: string;
    markupPct: string;
    totals: string;
  },
  options?: { items?: string[] },
): ParsedTable {
  if (preview.rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = [
    ...(labels.item ? [labels.item] : []),
    labels.buy,
    labels.sell,
    labels.qty,
    labels.costTotal,
    labels.revenue,
    labels.profit,
    labels.marginPct,
    labels.markupPct,
  ];

  const fmt = (n: number, fraction = 2): string => {
    const value = formatNumber(n, fraction);
    return typeof value === "number" ? String(value) : value;
  };

  const rows = preview.rows.map((r, rowIndex) => {
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
  const itemCell = options?.items?.[rowIndex]?.trim() ?? "";
  return labels.item ? [itemCell, ...base] : base;
  });

  const t = preview.totals;
  const totalCore = [
    "",
    "",
    "",
    fmt(t.costTotal),
    fmt(t.revenue),
    fmt(t.profit),
    fmt(t.marginPct),
    fmt(t.markupPct),
  ];
  const totalRow = labels.item ? [labels.totals, "", ...totalCore] : [labels.totals, ...totalCore];
  rows.push(totalRow);

  return { headers, rows };
}
