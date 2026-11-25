import { buildCurrencyResultTable, summarizeConversion } from "../src/lib/table/currency-convert";
import { parseCellNumber } from "../src/lib/table/numeric-parse";

const table = {
  headers: ["Item", "Price USD"],
  rows: [
    ["Laptop", "1 200,50"],
    ["Monitor", "not a price"],
    ["Cable", "19.99"],
  ],
};

const rate = parseCellNumber("41,2");
if (rate !== 41.2) throw new Error(`Bad rate parse: ${rate}`);

const stats = summarizeConversion(table, 1, rate, "2dp");
if (!stats || stats.convertedCount !== 2 || stats.skippedCount !== 1) {
  throw new Error(`Bad stats: ${JSON.stringify(stats)}`);
}

const out = buildCurrencyResultTable(table, 1, rate, {
  outputMode: "add-column",
  rounding: "2dp",
  newHeader: "UAH",
});

if (out.rows[0][2] !== "49460.60" && out.rows[0][2] !== "49460.6") {
  const cell = out.rows[0][2];
  if (!cell?.startsWith("49460.6")) throw new Error(`Bad convert row 0: ${cell}`);
}

const replaced = buildCurrencyResultTable(table, 1, rate, {
  outputMode: "replace",
  rounding: "integer",
  newHeader: "X",
});
if (!replaced.rows[2][1].match(/^\d+$/)) throw new Error(`Bad integer round: ${replaced.rows[2][1]}`);

console.log("currency ok", { converted: stats.convertedCount, skipped: stats.skippedCount });