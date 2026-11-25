import type { ParsedTable } from "@/lib/table/types";

export type MergeInput = {
  name: string;
  table: ParsedTable;
};

export type MergeMode = "align-union" | "align-intersection" | "stack";

export type MergeOptions = {
  mode: MergeMode;
  includeSource: boolean;
  sourceHeader: string;
  /** Keys: normalized header (`normalizeHeader`). Values: unified display name. */
  headerOverrides?: Record<string, string>;
};

export function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

function unifiedName(header: string, overrides: Record<string, string>): string {
  const key = normalizeHeader(header);
  const override = overrides[key]?.trim();
  return override || header.trim();
}

function unifiedKey(header: string, overrides: Record<string, string>): string {
  return normalizeHeader(unifiedName(header, overrides));
}

export function mergeTables(inputs: MergeInput[], options: MergeOptions): ParsedTable {
  const tables = inputs.filter(
    (input) => input.table.headers.length > 0 || input.table.rows.length > 0,
  );
  if (tables.length === 0) return { headers: [], rows: [] };

  const overrides = options.headerOverrides ?? {};

  if (options.mode === "stack") {
    const width = tables.reduce(
      (max, input) =>
        Math.max(max, input.table.headers.length, ...input.table.rows.map((row) => row.length)),
      0,
    );
    const headers = Array.from({ length: width }, (_, index) => {
      const named = tables.find((input) => input.table.headers[index]?.trim());
      return named?.table.headers[index]?.trim() ?? "";
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

  const headerOrder: string[] = [];
  const headerSeen = new Set<string>();

  for (const input of tables) {
    for (const header of input.table.headers) {
      const display = unifiedName(header, overrides);
      const key = normalizeHeader(display);
      if (!key || headerSeen.has(key)) continue;
      headerSeen.add(key);
      headerOrder.push(display);
    }
  }

  let headers = headerOrder;

  if (options.mode === "align-intersection" && tables.length > 0) {
    const sets = tables.map(
      (input) =>
        new Set(
          input.table.headers
            .map((header) => unifiedKey(header, overrides))
            .filter((key) => key.length > 0),
        ),
    );
    const common = headerOrder.filter((header) => {
      const key = normalizeHeader(header);
      return sets.every((set) => set.has(key));
    });
    headers = common;
  }

  const headerKeys = headers.map((header) => normalizeHeader(header));

  const rows = tables.flatMap((input) =>
    input.table.rows.map((row) => {
      const byKey = new Map<string, string>();
      input.table.headers.forEach((header, index) => {
        const key = unifiedKey(header, overrides);
        if (!key) return;
        byKey.set(key, row[index] ?? "");
      });
      const aligned = headerKeys.map((key) => byKey.get(key) ?? "");
      return options.includeSource ? [input.name, ...aligned] : aligned;
    }),
  );

  return {
    headers: options.includeSource ? [options.sourceHeader, ...headers] : headers,
    rows,
  };
}

export function collectHeaderGroups(
  inputs: MergeInput[],
  overrides: Record<string, string>,
): Array<{ key: string; variants: string[]; canonical: string }> {
  const map = new Map<string, Set<string>>();
  for (const input of inputs) {
    for (const header of input.table.headers) {
      const key = normalizeHeader(header);
      if (!key) continue;
      const bucket = map.get(key) ?? new Set<string>();
      bucket.add(header.trim());
      map.set(key, bucket);
    }
  }
  return [...map.entries()]
    .map(([key, variants]) => ({
      key,
      variants: [...variants],
      canonical: overrides[key]?.trim() || [...variants][0] || key,
    }))
    .sort((a, b) => a.canonical.localeCompare(b.canonical));
}