import { parseCellNumber } from "@/lib/table/numeric-parse";
import type { ParsedTable } from "@/lib/table/types";

export type PriceDiffStatus =
  | "up"
  | "down"
  | "same"
  | "only-a"
  | "only-b"
  | "no-price";

export type PriceDiffOptions = {
  keyColumn: number;
  leftPriceColumn: number;
  rightKeyColumn: number;
  rightPriceColumn: number;
  productHeader: string;
  priceLeftHeader: string;
  priceRightHeader: string;
  diffHeader: string;
  pctHeader: string;
  statusHeader: string;
  statusLabel: (status: PriceDiffStatus) => string;
};

export function normalizeProductKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[«»"'`´]/g, "")
    .replace(/[.,;:]+$/g, "");
}

function classifyPrices(leftNum: number, rightNum: number): PriceDiffStatus {
  const leftOk = Number.isFinite(leftNum);
  const rightOk = Number.isFinite(rightNum);
  if (!leftOk && !rightOk) return "no-price";
  if (!leftOk) return "only-b";
  if (!rightOk) return "only-a";
  const delta = rightNum - leftNum;
  if (Math.abs(delta) < 0.005) return "same";
  return delta > 0 ? "up" : "down";
}

function formatDelta(leftNum: number, rightNum: number): { diff: string; pct: string } {
  if (!Number.isFinite(leftNum) || !Number.isFinite(rightNum)) {
    return { diff: "", pct: "" };
  }
  const delta = rightNum - leftNum;
  const diff = (Math.round(delta * 100) / 100).toFixed(2);
  const pct =
    Math.abs(leftNum) < 1e-12
      ? "—"
      : `${((delta / leftNum) * 100).toFixed(1)}%`;
  return { diff, pct };
}

export type PriceDiffRow = {
  cells: string[];
  status: PriceDiffStatus;
};

export function comparePriceTables(
  left: ParsedTable,
  right: ParsedTable,
  options: PriceDiffOptions,
): ParsedTable & { statusByRow: PriceDiffStatus[] } {
  const rightMap = new Map<string, { display: string; price: string }>();
  for (const row of right.rows) {
    const display = (row[options.rightKeyColumn] ?? "").trim();
    const key = normalizeProductKey(display);
    if (!key) continue;
    rightMap.set(key, {
      display,
      price: row[options.rightPriceColumn] ?? "",
    });
  }

  const headers = [
    options.productHeader,
    options.priceLeftHeader,
    options.priceRightHeader,
    options.diffHeader,
    options.pctHeader,
    options.statusHeader,
  ];

  const rows: string[][] = [];
  const statusByRow: PriceDiffStatus[] = [];

  for (const row of left.rows) {
    const display = (row[options.keyColumn] ?? "").trim();
    const key = normalizeProductKey(display);
    if (!key) continue;

    const leftPriceRaw = row[options.leftPriceColumn] ?? "";
    const rightEntry = rightMap.get(key);
    const rightPriceRaw = rightEntry?.price ?? "";
    const leftNum = parseCellNumber(leftPriceRaw);
    const rightNum = parseCellNumber(rightPriceRaw);

    let status: PriceDiffStatus;
    if (!rightEntry) {
      status = Number.isFinite(leftNum) ? "only-a" : "only-a";
    } else {
      status = classifyPrices(leftNum, rightNum);
    }

    const { diff, pct } = formatDelta(leftNum, rightNum);
    rows.push([
      display || key,
      leftPriceRaw,
      rightPriceRaw,
      diff,
      pct,
      options.statusLabel(status),
    ]);
    statusByRow.push(status);
    rightMap.delete(key);
  }

  for (const [key, entry] of rightMap) {
    const rightNum = parseCellNumber(entry.price);
    const status: PriceDiffStatus = Number.isFinite(rightNum) ? "only-b" : "only-b";
    rows.push([entry.display || key, "", entry.price, "", "", options.statusLabel(status)]);
    statusByRow.push(status);
  }

  return { headers, rows, statusByRow };
}

export function filterPriceDiffRows(
  table: ParsedTable & { statusByRow: PriceDiffStatus[] },
  active: Set<PriceDiffStatus> | "all",
): ParsedTable {
  if (active === "all") return { headers: table.headers, rows: table.rows };
  const rows = table.rows.filter((_, index) => active.has(table.statusByRow[index]));
  return { headers: table.headers, rows };
}