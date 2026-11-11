import { parseCellNumber } from "@/lib/table/numeric-parse";
import type { ParsedTable } from "@/lib/table/types";

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
};

function normKey(value: string): string {
  return value.trim().toLowerCase();
}

export function comparePriceTables(
  left: ParsedTable,
  right: ParsedTable,
  options: PriceDiffOptions,
): ParsedTable {
  const rightMap = new Map<string, string>();
  for (const row of right.rows) {
    const key = normKey(row[options.rightKeyColumn] ?? "");
    if (!key) continue;
    const price = row[options.rightPriceColumn] ?? "";
    rightMap.set(key, price);
  }

  const headers = [
    options.productHeader,
    options.priceLeftHeader,
    options.priceRightHeader,
    options.diffHeader,
    options.pctHeader,
  ];

  const rows: string[][] = [];

  for (const row of left.rows) {
    const key = normKey(row[options.keyColumn] ?? "");
    if (!key) continue;
    const leftPriceRaw = row[options.leftPriceColumn] ?? "";
    const rightPriceRaw = rightMap.get(key) ?? "";
    const leftNum = parseCellNumber(leftPriceRaw);
    const rightNum = parseCellNumber(rightPriceRaw);

    let diff = "";
    let pct = "";
    if (leftNum != null && rightNum != null) {
      const delta = rightNum - leftNum;
      diff = delta.toFixed(2);
      pct = leftNum === 0 ? "—" : `${((delta / leftNum) * 100).toFixed(1)}%`;
    }

    rows.push([row[options.keyColumn] ?? key, leftPriceRaw, rightPriceRaw, diff, pct]);
    rightMap.delete(key);
  }

  for (const [key, rightPriceRaw] of rightMap) {
    const displayKey =
      right.rows.find((row) => normKey(row[options.rightKeyColumn] ?? "") === key)?.[
        options.rightKeyColumn
      ] ?? key;
    rows.push([displayKey, "", rightPriceRaw, "", ""]);
  }

  return { headers, rows };
}
