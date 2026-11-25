import { comparePriceTables, filterPriceDiffRows, normalizeProductKey } from "../src/lib/table/price-diff";

const left = {
  headers: ["Product", "Price"],
  rows: [
    ["Widget A", "10,50"],
    ["Widget B", "20"],
    ["Only Left", "5"],
  ],
};

const right = {
  headers: ["Name", "Cost"],
  rows: [
    ["widget a", "12,00"],
    ["Widget B", "20,00"],
    ["Only Right", "7,5"],
  ],
};

if (normalizeProductKey("  Widget  A.  ") !== "widget a") {
  throw new Error("normalizeProductKey failed");
}

const full = comparePriceTables(left, right, {
  keyColumn: 0,
  leftPriceColumn: 1,
  rightKeyColumn: 0,
  rightPriceColumn: 1,
  productHeader: "Product",
  priceLeftHeader: "A",
  priceRightHeader: "B",
  diffHeader: "Delta",
  pctHeader: "%",
  statusHeader: "Status",
  statusLabel: (status) => status,
});

if (full.rows.length !== 4) throw new Error(`Expected 4 rows, got ${full.rows.length}`);
if (full.statusByRow[0] !== "up") throw new Error(`Row 0 status ${full.statusByRow[0]}`);
if (full.statusByRow[1] !== "same") throw new Error(`Row 1 status ${full.statusByRow[1]}`);
if (full.statusByRow[2] !== "only-a") throw new Error(`Row 2 status ${full.statusByRow[2]}`);
if (full.statusByRow[3] !== "only-b") throw new Error(`Row 3 status ${full.statusByRow[3]}`);

if (full.rows[0][3] !== "1.50") throw new Error(`Bad delta: ${full.rows[0][3]}`);
if (full.rows[0][4].includes("NaN") || full.rows[0][4].includes("Infinity")) {
  throw new Error(`Bad pct: ${full.rows[0][4]}`);
}

const filtered = filterPriceDiffRows(full, new Set(["up"]));
if (filtered.rows.length !== 1) throw new Error(`Filter up: ${filtered.rows.length}`);

console.log("price-diff ok", { rows: full.rows.length, up: filtered.rows.length });