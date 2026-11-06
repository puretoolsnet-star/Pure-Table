import type { ParsedTable } from "@/lib/table/types";

export type MergeInput = {
  name: string;
  table: ParsedTable;
};

export function mergeTables(
  inputs: MergeInput[],
  options: { alignHeaders: boolean; includeSource: boolean; sourceHeader: string },
): ParsedTable {
  const tables = inputs.filter((input) => input.table.headers.length > 0 || input.table.rows.length > 0);
  if (tables.length === 0) return { headers: [], rows: [] };

  if (!options.alignHeaders) {
    const width = tables.reduce(
      (max, input) =>
        Math.max(
          max,
          input.table.headers.length,
          ...input.table.rows.map((row) => row.length),
        ),
      0,
    );
    const headers = Array.from({ length: width }, (_, index) => {
      const named = tables.find((input) => input.table.headers[index]);
      return named?.table.headers[index] ?? "";
    });
    const rows = tables.flatMap((input) =>
      input.table.rows.map((row) => {
        const padded = Array.from({ length: width }, (_, index) => row[index] ?? "");
        return options.includeSource ? [input.name, ...padded] : padded;
      }),
    );
    return {
      headers: options.includeSource ? [options.sourceHeader, ...headers] : headers,
      rows,
    };
  }

  const headers: string[] = [];
  const seen = new Set<string>();
  for (const input of tables) {
    for (const header of input.table.headers) {
      const key = header.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      headers.push(header.trim());
    }
  }

  const rows = tables.flatMap((input) =>
    input.table.rows.map((row) => {
      const byHeader = new Map<string, string>();
      input.table.headers.forEach((header, index) => {
        byHeader.set(header.trim().toLowerCase(), row[index] ?? "");
      });
      const aligned = headers.map((header) => byHeader.get(header.toLowerCase()) ?? "");
      return options.includeSource ? [input.name, ...aligned] : aligned;
    }),
  );

  return {
    headers: options.includeSource ? [options.sourceHeader, ...headers] : headers,
    rows,
  };
}
