import { buildCsvFromSheet } from "../src/lib/table/export-table";
import {
  applyPrefixSuffix,
  fillEmptyCells,
  findReplaceInTable,
  findSearchMatches,
  removeRowsMatching,
} from "../src/lib/table/transform";

const table = {
  headers: ["Name", "Code"],
  rows: [
    ["  Alice  ", "A1"],
    ["Bob", ""],
    ["Alice", "A1"],
  ],
};

const replaced = findReplaceInTable(table, "Alice", "Ann", 0);
if (replaced.rows[0][0] !== "  Ann  ") throw new Error("scoped replace failed");

const prefixed = applyPrefixSuffix(table, "ID-", "", 1);
if (!prefixed.rows[0][1].startsWith("ID-")) throw new Error("prefix failed");

const filled = fillEmptyCells(table, "—", 1);
if (filled.rows[1][1] !== "—") throw new Error("fill failed");

const removed = removeRowsMatching(table, "alice", "all");
if (removed.rows.length !== 1) throw new Error(`remove ${removed.rows.length}`);

const matches = findSearchMatches(table, "ali", "all");
if (matches.length < 2) throw new Error(`matches ${matches.length}`);

const csv = buildCsvFromSheet({ name: "t", headers: ["Ім'я"], rows: [['Тест "1"']] });
if (!csv.includes("\uFEFF") && !csv.includes('"')) {
  if (!csv.includes('""')) throw new Error(`csv escape: ${csv}`);
}

console.log("transform ok", { matches: matches.length, removed: removed.rows.length });