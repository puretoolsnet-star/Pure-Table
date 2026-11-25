import type { ParsedTable } from "@/lib/table/types";

export function cloneTable(table: ParsedTable): ParsedTable {
  return {
    headers: [...table.headers],
    rows: table.rows.map((row) => [...row]),
  };
}