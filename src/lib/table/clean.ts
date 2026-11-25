import { parseCellNumber } from "@/lib/table/numeric-parse";
import type { CleanColumnScope, CleanOptions, CleanStats, ParsedTable } from "@/lib/table/types";

const CURRENCY_RE = /(?:€|\$|£|₴|zł|PLN|EUR|USD|UAH|GBP)/i;
const LETTER_RE = /[A-Za-zА-Яа-яІіЇїЄєҐґÀ-ÿ]/;

export function looksLikePhone(value: string): boolean {
  const compact = value.trim();
  if (!compact || LETTER_RE.test(compact)) return false;
  const digits = compact.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return false;
  return /[+\s().-]/.test(compact) || digits.length >= 10;
}

function isFormattedPhone(value: string): boolean {
  const compact = value.trim();
  if (!compact.startsWith("+")) return false;
  const digits = compact.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

export function formatPhone(value: string): string | null {
  if (!looksLikePhone(value)) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) {
    digits = `380${digits.slice(1)}`;
  }
  if (digits.length < 9 || digits.length > 15) return null;

  if (digits.startsWith("380") && digits.length === 12) {
    return `+380 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }

  const groups: string[] = [];
  let rest = digits;
  while (rest.length > 3) {
    groups.unshift(rest.slice(-3));
    rest = rest.slice(0, -3);
  }
  if (rest) groups.unshift(rest);
  return `+${groups.join(" ")}`;
}

export function formatAmount(value: string): string | null {
  const raw = value.trim().replace(/\u00A0/g, " ");
  if (!raw) return null;

  const currency = raw.match(CURRENCY_RE)?.[0] ?? "";
  const withoutCurrency = raw.replace(CURRENCY_RE, "").trim();
  if (!withoutCurrency || LETTER_RE.test(withoutCurrency)) return null;

  const compact = withoutCurrency.replace(/\s/g, "");
  if (!/^[-+]?\d[\d.,]*$/.test(compact)) return null;

  const hasComma = compact.includes(",");
  const hasDot = compact.includes(".");
  let normalized = compact;
  let forceDecimals = false;

  if (hasComma && hasDot) {
    if (compact.lastIndexOf(",") > compact.lastIndexOf(".")) {
      normalized = compact.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = compact.replace(/,/g, "");
    }
    forceDecimals = true;
  } else if (hasComma || hasDot) {
    const separator = hasComma ? "," : ".";
    const parts = compact.split(separator);
    if (parts.length === 2 && parts[1].length === 2) {
      normalized = `${parts[0]}.${parts[1]}`;
      forceDecimals = true;
    } else if (parts.slice(1).every((part) => part.length === 3)) {
      if (!currency) return null;
      normalized = parts.join("");
    } else {
      return null;
    }
  } else if (!currency) {
    return null;
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;

  const formatted = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: forceDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace(/,/g, " ");

  if (!currency) return formatted;
  const suffix =
    currency.length > 1 && /[A-Za-z]/.test(currency) ? currency.toUpperCase() : currency;
  return `${formatted} ${suffix}`;
}

export function normalizeNumericCell(value: string): string | null {
  const withCurrency = formatAmount(value);
  if (withCurrency) return withCurrency;

  const raw = value.trim().replace(/\u00A0/g, " ");
  if (!raw) return null;
  const noise = raw.replace(CURRENCY_RE, "").replace(/[\d\s.,+\-]/g, "");
  if (LETTER_RE.test(noise)) return null;

  const n = parseCellNumber(raw);
  if (!Number.isFinite(n)) return null;

  const compact = raw.replace(CURRENCY_RE, "").replace(/\s/g, "");
  const hasFrac = /[,.]\d{1,2}$/.test(compact);
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: hasFrac ? 2 : 0,
    maximumFractionDigits: 2,
  })
    .format(n)
    .replace(/,/g, " ");
}

function looksLikeAmount(value: string): boolean {
  return normalizeNumericCell(value) !== null;
}

function tableWidth(table: ParsedTable): number {
  const fromRows = table.rows.reduce((max, row) => Math.max(max, row.length), 0);
  return Math.max(table.headers.length, fromRows, 0);
}

function normalizeDedupeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function rowKey(row: string[]): string {
  return row.map((cell) => cell.trim().toLowerCase()).join("\u0001");
}

const AUTO_SAMPLE_ROWS = 40;
const AUTO_THRESHOLD = 0.45;

export function detectPhoneColumns(table: ParsedTable): Set<number> {
  const width = tableWidth(table);
  const hits = new Array(width).fill(0);
  const totals = new Array(width).fill(0);
  const sample = table.rows.slice(0, AUTO_SAMPLE_ROWS);
  for (const row of sample) {
    for (let col = 0; col < width; col += 1) {
      const cell = (row[col] ?? "").trim();
      if (!cell) continue;
      totals[col] += 1;
      if (looksLikePhone(cell)) hits[col] += 1;
    }
  }
  const set = new Set<number>();
  for (let col = 0; col < width; col += 1) {
    if (totals[col] > 0 && hits[col] / totals[col] >= AUTO_THRESHOLD) set.add(col);
  }
  return set;
}

export function detectAmountColumns(table: ParsedTable): Set<number> {
  const width = tableWidth(table);
  const hits = new Array(width).fill(0);
  const totals = new Array(width).fill(0);
  const sample = table.rows.slice(0, AUTO_SAMPLE_ROWS);
  for (const row of sample) {
    for (let col = 0; col < width; col += 1) {
      const cell = (row[col] ?? "").trim();
      if (!cell) continue;
      totals[col] += 1;
      if (looksLikeAmount(cell)) hits[col] += 1;
    }
  }
  const set = new Set<number>();
  for (let col = 0; col < width; col += 1) {
    if (totals[col] > 0 && hits[col] / totals[col] >= AUTO_THRESHOLD) set.add(col);
  }
  return set;
}

function resolveScopeColumns(
  table: ParsedTable,
  scope: CleanColumnScope,
  column: number,
  detect: (table: ParsedTable) => Set<number>,
): Set<number> | "all" {
  if (scope === "all") return "all";
  const width = tableWidth(table);
  const clamped = Math.max(0, Math.min(column, Math.max(width - 1, 0)));
  if (scope === "column") return new Set([clamped]);
  const detected = detect(table);
  return detected.size > 0 ? detected : new Set([clamped]);
}

function columnActive(cols: Set<number> | "all", index: number): boolean {
  return cols === "all" || cols.has(index);
}

function dedupeByColumnRows(
  rows: string[][],
  column: number,
): { rows: string[][]; removed: number } {
  const seen = new Set<string>();
  const unique: string[][] = [];
  let removed = 0;
  for (const row of rows) {
    const key = normalizeDedupeKey(row[column] ?? "");
    if (!key) {
      unique.push(row);
      continue;
    }
    if (seen.has(key)) {
      removed += 1;
      continue;
    }
    seen.add(key);
    unique.push(row);
  }
  return { rows: unique, removed };
}

function dedupeFullRows(rows: string[][]): { rows: string[][]; removed: number } {
  const seen = new Set<string>();
  const unique: string[][] = [];
  let removed = 0;
  for (const row of rows) {
    const key = rowKey(row);
    if (seen.has(key)) {
      removed += 1;
      continue;
    }
    seen.add(key);
    unique.push(row);
  }
  return { rows: unique, removed };
}

export function cleanTable(
  table: ParsedTable,
  options: CleanOptions,
): { table: ParsedTable; stats: CleanStats } {
  const stats: CleanStats = {
    trimmed: 0,
    emptyRows: 0,
    duplicates: 0,
    duplicatesFull: 0,
    duplicatesByColumn: 0,
    phones: 0,
    amounts: 0,
  };

  const width = tableWidth(table);
  const phoneCols = options.phones
    ? resolveScopeColumns(table, options.phoneScope, options.phoneColumn, detectPhoneColumns)
    : new Set<number>();
  const amountCols = options.amounts
    ? resolveScopeColumns(table, options.amountScope, options.amountColumn, detectAmountColumns)
    : new Set<number>();

  const cleanedRows = table.rows.map((row) =>
    Array.from({ length: width }, (_, colIndex) => {
      let next = row[colIndex] ?? "";
      if (options.trim) {
        const trimmed = next.trim();
        if (trimmed !== next) stats.trimmed += 1;
        next = trimmed;
      }
      if (options.collapseSpaces) {
        const collapsed = next.replace(/[ \t\u00A0]+/g, " ").trim();
        if (collapsed !== next) stats.trimmed += 1;
        next = collapsed;
      }
      if (options.phones && columnActive(phoneCols, colIndex)) {
        const phone = formatPhone(next);
        if (phone && phone !== next) {
          stats.phones += 1;
          next = phone;
        }
      }
      if (options.amounts && columnActive(amountCols, colIndex)) {
        const skipAmount =
          isFormattedPhone(next) ||
          (options.phones && columnActive(phoneCols, colIndex) && looksLikePhone(next));
        if (!skipAmount) {
          const amount = normalizeNumericCell(next);
          if (amount && amount !== next) {
            stats.amounts += 1;
            next = amount;
          }
        }
      }
      return next;
    }),
  );

  let rows = cleanedRows;
  if (options.dropEmpty) {
    const kept = rows.filter((row) => row.some((cell) => cell.trim().length > 0));
    stats.emptyRows = rows.length - kept.length;
    rows = kept;
  }

  if (options.dedupeByColumn) {
    const col = Math.max(0, Math.min(options.dedupeColumn, Math.max(width - 1, 0)));
    const result = dedupeByColumnRows(rows, col);
    stats.duplicatesByColumn = result.removed;
    rows = result.rows;
  }

  if (options.dedupe) {
    const result = dedupeFullRows(rows);
    stats.duplicatesFull = result.removed;
    rows = result.rows;
  }

  stats.duplicates = stats.duplicatesFull + stats.duplicatesByColumn;

  return {
    table: { headers: table.headers, rows },
    stats,
  };
}