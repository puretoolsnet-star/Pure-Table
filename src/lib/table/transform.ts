import type { ParsedTable } from "@/lib/table/types";

export type TextCaseMode = "upper" | "lower" | "title";
export type ColumnScope = number | "all";

export type SearchMatch = {
  rowIndex: number;
  colIndex: number;
  matchIndex: number;
};

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function tableWidth(table: ParsedTable): number {
  return Math.max(table.headers.length, table.rows.reduce((m, r) => Math.max(m, r.length), 0));
}

function mapScoped(
  table: ParsedTable,
  scope: ColumnScope,
  mapCell: (value: string, rowIndex: number, colIndex: number) => string,
  includeHeaders = true,
): ParsedTable {
  const width = tableWidth(table);
  const colIndexes =
    scope === "all"
      ? Array.from({ length: width }, (_, index) => index)
      : [Math.max(0, Math.min(scope, width - 1))];

  const headers = includeHeaders
    ? table.headers.map((cell, colIndex) =>
        colIndexes.includes(colIndex) ? mapCell(cell, -1, colIndex) : cell,
      )
    : [...table.headers];

  const rows = table.rows.map((row, rowIndex) =>
    Array.from({ length: width }, (_, colIndex) => {
      const value = row[colIndex] ?? "";
      return colIndexes.includes(colIndex) ? mapCell(value, rowIndex, colIndex) : value;
    }),
  );

  return { headers, rows };
}

export function filterTableRows(table: ParsedTable, query: string): ParsedTable {
  const needle = normalize(query);
  if (!needle) return table;
  const rows = table.rows.filter((row) => row.some((cell) => normalize(cell).includes(needle)));
  return { headers: table.headers, rows };
}

export function filterTableRowsByColumn(
  table: ParsedTable,
  query: string,
  column: ColumnScope,
): ParsedTable {
  const needle = normalize(query);
  if (!needle) return table;
  if (column === "all") return filterTableRows(table, query);
  const col = Math.max(0, Math.min(column, tableWidth(table) - 1));
  const rows = table.rows.filter((row) => normalize(row[col] ?? "").includes(needle));
  return { headers: table.headers, rows };
}

export function findSearchMatches(
  table: ParsedTable,
  query: string,
  column: ColumnScope,
): SearchMatch[] {
  const needle = normalize(query);
  if (!needle) return [];
  const width = tableWidth(table);
  const cols =
    column === "all"
      ? Array.from({ length: width }, (_, index) => index)
      : [Math.max(0, Math.min(column, width - 1))];

  const matches: SearchMatch[] = [];
  let matchIndex = 0;
  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex += 1) {
    const row = table.rows[rowIndex];
    for (const colIndex of cols) {
      const cell = row[colIndex] ?? "";
      if (normalize(cell).includes(needle)) {
        matches.push({ rowIndex, colIndex, matchIndex });
        matchIndex += 1;
      }
    }
  }
  return matches;
}

export function findReplaceInTable(
  table: ParsedTable,
  find: string,
  replace: string,
  scope: ColumnScope = "all",
): ParsedTable {
  if (!find) return table;
  return mapScoped(
    table,
    scope,
    (cell) => cell.split(find).join(replace),
    scope === "all",
  );
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

export function applyTextCaseToTable(
  table: ParsedTable,
  mode: TextCaseMode,
  scope: ColumnScope = "all",
): ParsedTable {
  return mapScoped(table, scope, (cell) => applyCaseToCell(cell, mode), scope === "all");
}

export function applyPrefixSuffix(
  table: ParsedTable,
  prefix: string,
  suffix: string,
  scope: ColumnScope,
  skipEmpty = true,
): ParsedTable {
  return mapScoped(
    table,
    scope,
    (cell) => {
      if (skipEmpty && !cell.trim()) return cell;
      return `${prefix}${cell}${suffix}`;
    },
    false,
  );
}

export function fillEmptyCells(table: ParsedTable, fillValue: string, scope: ColumnScope): ParsedTable {
  return mapScoped(
    table,
    scope,
    (cell) => (cell.trim() ? cell : fillValue),
    false,
  );
}

export function removeRowsMatching(
  table: ParsedTable,
  query: string,
  column: ColumnScope,
): ParsedTable {
  const needle = normalize(query);
  if (!needle) return table;
  const width = tableWidth(table);
  const col = column === "all" ? null : Math.max(0, Math.min(column, width - 1));
  const rows = table.rows.filter((row) => {
    if (col === null) {
      return !row.some((cell) => normalize(cell).includes(needle));
    }
    return !normalize(row[col] ?? "").includes(needle);
  });
  return { headers: table.headers, rows };
}