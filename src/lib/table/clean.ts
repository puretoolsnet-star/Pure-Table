import type { CleanOptions, CleanStats, ParsedTable } from "@/lib/table/types";

const CURRENCY_RE = /(?:€|\$|£|₴|zł|PLN|EUR|USD|UAH|GBP)/i;
const LETTER_RE = /[A-Za-zА-Яа-яІіЇїЄєҐґÀ-ÿ]/;

function looksLikePhone(value: string): boolean {
  const compact = value.trim();
  if (!compact || LETTER_RE.test(compact)) return false;
  const digits = compact.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return false;
  return /[+\s().-]/.test(compact) || digits.length >= 10;
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
    currency.length > 1 && /[A-Za-z]/.test(currency)
      ? currency.toUpperCase()
      : currency;
  return `${formatted} ${suffix}`;
}

function rowKey(row: string[]): string {
  return row.map((cell) => cell.trim().toLowerCase()).join("\u0001");
}

export function cleanTable(
  table: ParsedTable,
  options: CleanOptions,
): { table: ParsedTable; stats: CleanStats } {
  const stats: CleanStats = {
    trimmed: 0,
    emptyRows: 0,
    duplicates: 0,
    phones: 0,
    amounts: 0,
  };

  const cleanedRows = table.rows.map((row) =>
    row.map((cell) => {
      let next = cell;
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
      if (options.phones) {
        const phone = formatPhone(next);
        if (phone && phone !== next) {
          stats.phones += 1;
          next = phone;
        }
      }
      if (options.amounts) {
        const amount = formatAmount(next);
        if (amount && amount !== next) {
          stats.amounts += 1;
          next = amount;
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

  if (options.dedupe) {
    const seen = new Set<string>();
    const unique: string[][] = [];
    for (const row of rows) {
      const key = rowKey(row);
      if (seen.has(key)) {
        stats.duplicates += 1;
        continue;
      }
      seen.add(key);
      unique.push(row);
    }
    rows = unique;
  }

  return {
    table: { headers: table.headers, rows },
    stats,
  };
}
