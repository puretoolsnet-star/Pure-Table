import {
  cleanTable,
  detectAmountColumns,
  detectPhoneColumns,
  formatPhone,
  normalizeNumericCell,
} from "../src/lib/table/clean";
import { DEFAULT_CLEAN_OPTIONS } from "../src/lib/table/types";

const table = {
  headers: ["Item", "Phone", "Price"],
  rows: [
    ["  Paper  ", "0501234567", "1 200,50 ₴"],
    ["Paper", "(050) 123-45-67", "1200,50"],
    ["", "", ""],
    ["Glue", "+380501112233", "€12,99"],
  ],
};

if (formatPhone("0501234567") !== "+380 50 123 45 67") {
  throw new Error(`UA phone: ${formatPhone("0501234567")}`);
}

const amount = normalizeNumericCell("1 200,50");
if (!amount || !/1\s?200/.test(amount)) throw new Error(`Amount: ${amount}`);

const phones = detectPhoneColumns(table);
if (!phones.has(1)) throw new Error(`Phone col not detected: ${[...phones]}`);

const amounts = detectAmountColumns(table);
if (!amounts.has(2)) throw new Error(`Amount col not detected: ${[...amounts]}`);

const { table: out, stats } = cleanTable(table, {
  ...DEFAULT_CLEAN_OPTIONS,
  trim: true,
  collapseSpaces: true,
  dropEmpty: true,
  dedupe: true,
  dedupeByColumn: true,
  dedupeColumn: 0,
  phones: true,
  phoneScope: "auto",
  amounts: true,
  amountScope: "auto",
});

if (out.rows.length !== 2) throw new Error(`Expected 2 rows, got ${out.rows.length}`);
if (stats.emptyRows !== 1) throw new Error(`empty: ${stats.emptyRows}`);
if (stats.duplicatesByColumn < 1) throw new Error(`col dup: ${stats.duplicatesByColumn}`);
if (stats.phones < 1) throw new Error(`phones: ${stats.phones}`);

console.log("data-clean ok", stats);