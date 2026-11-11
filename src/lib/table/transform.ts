import type { ParsedTable } from "@/lib/table/types";

export type TextCaseMode = "upper" | "lower" | "title";

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function filterTableRows(table: ParsedTable, query: string): ParsedTable {
  const needle = normalize(query);
  if (!needle) return table;
  const rows = table.rows.filter((row) =>
    row.some((cell) => normalize(cell).includes(needle)),
  );
  return { headers: table.headers, rows };
}

export function findReplaceInTable(
  table: ParsedTable,
  find: string,
  replace: string,
): ParsedTable {
  if (!find) return table;
  const rows = table.rows.map((row) =>
    row.map((cell) => cell.split(find).join(replace)),
  );
  const headers = table.headers.map((cell) => cell.split(find).join(replace));
  return { headers, rows };
}

function titleCaseWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function applyCaseToCell(value: string, mode: TextCaseMode): string {
  if (mode === "upper") return value.toUpperCase();
  if (mode === "lower") return value.toLowerCase();
  return value
    .split(/(\s+)/)
    .map((part) => (/^\s+$/.test(part) ? part : titleCaseWord(part)))
    .join("");
}

export function applyTextCaseToTable(table: ParsedTable, mode: TextCaseMode): ParsedTable {
  const mapRow = (row: string[]) => row.map((cell) => applyCaseToCell(cell, mode));
  return {
    headers: mapRow(table.headers),
    rows: table.rows.map(mapRow),
  };
}
