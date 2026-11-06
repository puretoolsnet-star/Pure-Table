/**
 * Parse a spreadsheet-like cell into a finite number, or NaN.
 * Supports comma decimals and spaces as thousand separators.
 */
export function parseCellNumber(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return Number.NaN;
  const normalized = trimmed
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, "")
    .replace(/[$€£₴₽¥]/g, "")
    .replace(/%/g, "");
  const withDot = normalized.includes(",") && !normalized.includes(".")
    ? normalized.replace(",", ".")
    : normalized.replace(/,/g, "");
  const n = Number(withDot);
  return Number.isFinite(n) ? n : Number.NaN;
}
