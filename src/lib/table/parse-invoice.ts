import type { InvoiceParse } from "@/lib/table/types";
import { splitDelimitedLine } from "@/lib/table/split-text";

export type InvoiceLabels = {
  item: string;
  qty: string;
  price: string;
  amount: string;
  field: string;
  value: string;
  columnLabel?: (index: number) => string;
};

const ITEM_RE =
  /(item|description|product|name|товар|наймен|назва|опис|позиц|artikel|bezeichnung|leistung|descripci|concepto|d[eé]signation|libell|nazwa|towar)/i;
const QTY_RE =
  /(qty|quantity|q-?ty|кіл|к-сть|к-ть|кільк|шт\.?|menge|anzahl|cantidad|quantit|qt[eé]|ilo[sś][cć])/i;
const PRICE_RE = /(price|unit|ціна|preis|einzel|precio|prix|cena|\bpu\b)/i;
const AMOUNT_RE =
  /(amount|sum|сума|варт|betrag|importe|montant|warto|kwota)/i;
const DOC_RE =
  /(накладна|рахунок|invoice|rechnung|facture|factura|faktura|bill|receipt)/i;
const SUMMARY_LABEL_RE =
  /^(разом|всього|до сплати|пдв|підсумок|разом з пдв|total|subtotal|sub-total|vat|tax|mwst|iva|tva|suma|gesamt|netto|brutto|importe total|montant|razem|do zap[lł]aty|gesamtbetrag|zwischensumme|grand total)\b/i;

const NUMBER_TAIL =
  /(?:\d{1,3}(?:[ \u00A0]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*$/;

function linesOf(text: string): string[] {
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function isSummaryLine(line: string): boolean {
  const stripped = line.trim();
  if (SUMMARY_LABEL_RE.test(stripped)) return true;
  const colon = stripped.match(/^([^:]+):\s*/);
  if (colon && SUMMARY_LABEL_RE.test(colon[1].trim())) return true;
  if (/^[\d\s.,\u00A0]+$/.test(stripped)) return false;
  const peeled = peelNumbers(stripped, 1);
  if (peeled.numbers.length === 1 && peeled.name.length > 0 && SUMMARY_LABEL_RE.test(peeled.name)) {
    return true;
  }
  return false;
}

function peelNumbers(line: string, max = 4): { name: string; numbers: string[] } {
  let rest = line.trim();
  const numbers: string[] = [];

  while (numbers.length < max) {
    const match = rest.match(NUMBER_TAIL);
    if (!match || match.index === undefined) break;
    const before = rest.slice(0, match.index).trimEnd();
    if (before.length > 0 && match.index > 0 && !/\s/.test(rest[match.index - 1] ?? "")) break;
    numbers.unshift(match[0].trim());
    rest = before;
    if (rest.length === 0) break;
  }

  return { name: rest, numbers };
}

function isHeaderLine(line: string): boolean {
  return ITEM_RE.test(line) && (QTY_RE.test(line) || PRICE_RE.test(line) || AMOUNT_RE.test(line));
}

function detectRowDelimiter(line: string): "\t" | "|" | ";" | "," | "space" {
  if (line.includes("\t")) return "\t";
  if ((line.match(/\|/g) ?? []).length >= 2) return "|";
  if ((line.match(/;/g) ?? []).length >= 2) return ";";
  if (/\s{2,}/.test(line)) return "space";
  if ((line.match(/,/g) ?? []).length >= 2) return ",";
  return "space";
}

function splitAligned(line: string): string[] {
  if (line.includes("\t")) {
    return line.split("\t").map((cell) => cell.trim()).filter(Boolean);
  }
  if (/\s{2,}/.test(line)) {
    return line
      .trim()
      .split(/\s{2,}/)
      .map((cell) => cell.trim())
      .filter(Boolean);
  }
  return [];
}

function splitRow(line: string, delimiter: "\t" | "|" | ";" | "," | "space"): string[] {
  if (delimiter === "space") {
    return line
      .trim()
      .split(/\s{2,}/)
      .map((cell) => cell.trim())
      .filter(Boolean);
  }
  return splitDelimitedLine(line, delimiter).filter((cell) => cell.length > 0);
}

function metaFromLine(line: string): { label: string; value: string } | null {
  const colon = line.match(/^([^:]{2,60}):\s*(.+)$/);
  if (colon) return { label: colon[1].trim(), value: colon[2].trim() };

  if (DOC_RE.test(line) || isSummaryLine(line)) {
    const peeled = peelNumbers(line, 2);
    if (peeled.numbers.length > 0 && peeled.name) {
      return { label: peeled.name, value: peeled.numbers.join(" ") };
    }
    return { label: line, value: "" };
  }

  return null;
}

function rowFromNumbers(name: string, numbers: string[]): string[] | null {
  if (!/[A-Za-zА-Яа-яІіЇїЄєҐґÀ-ÿ]/.test(name) || numbers.length < 2) return null;
  if (numbers.length === 2) return [name, numbers[0], "", numbers[1]];
  if (numbers.length === 3) return [name, numbers[0], numbers[1], numbers[2]];
  return [name, ...numbers.slice(0, 4)];
}

function padRow(row: string[], width: number): string[] {
  const next = row.slice(0, width);
  while (next.length < width) next.push("");
  return next;
}

function parseItemLine(line: string, delimiter: "\t" | "|" | ";" | "," | "space"): string[] | null {
  if (isSummaryLine(line)) return null;

  let cells = splitRow(line, delimiter);
  if (cells.length < 2) {
    const aligned = splitAligned(line);
    if (aligned.length >= 2) cells = aligned;
  }
  if (cells.length >= 2) {
    const first = cells[0] ?? "";
    if (isSummaryLine(first) || SUMMARY_LABEL_RE.test(first.trim())) return null;
    return cells;
  }

  const peeled = peelNumbers(line);
  return rowFromNumbers(peeled.name, peeled.numbers);
}

export function parseInvoice(text: string, labels: InvoiceLabels): InvoiceParse {
  const source = linesOf(text);
  if (source.length === 0) {
    return { meta: [], headers: [], rows: [] };
  }
  const headerIndex = source.findIndex(isHeaderLine);
  const meta: Array<{ label: string; value: string }> = [];
  const rows: string[][] = [];

  if (headerIndex >= 0) {
    const delimiter = detectRowDelimiter(source[headerIndex]);
    const headerCells = splitRow(source[headerIndex], delimiter);
    const headers =
      headerCells.length > 0
        ? headerCells
        : [labels.item, labels.qty, labels.price, labels.amount];
    const width = headers.length;

    for (let index = 0; index < headerIndex; index += 1) {
      const field = metaFromLine(source[index]);
      if (field) meta.push(field);
    }

    for (let index = headerIndex + 1; index < source.length; index += 1) {
      const line = source[index];
      if (isSummaryLine(line)) {
        const field = metaFromLine(line);
        if (field) meta.push(field);
        continue;
      }
      if (/^[^:]{2,50}:/.test(line) && !isHeaderLine(line)) {
        const field = metaFromLine(line);
        if (field) meta.push(field);
        continue;
      }
      const row = parseItemLine(line, delimiter);
      if (row) rows.push(padRow(row, width));
    }

    return { meta, headers, rows };
  }

  for (const line of source) {
    if (isSummaryLine(line)) {
      const field = metaFromLine(line);
      if (field) meta.push(field);
      continue;
    }
    const delimiter = detectRowDelimiter(line);
    const row = parseItemLine(line, delimiter);
    if (row) {
      rows.push(row);
      continue;
    }
    const field = metaFromLine(line);
    if (field) meta.push(field);
  }

  const defaults = [labels.item, labels.qty, labels.price, labels.amount];
  const width = Math.max(defaults.length, ...rows.map((row) => row.length), 0);
  const headers = Array.from({ length: width || defaults.length }, (_, index) => {
    if (defaults[index]) return defaults[index];
    return labels.columnLabel?.(index + 1) ?? `Column ${index + 1}`;
  });

  return {
    meta,
    headers,
    rows: rows.map((row) => padRow(row, headers.length)),
  };
}