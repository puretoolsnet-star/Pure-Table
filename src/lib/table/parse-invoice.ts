import type { InvoiceParse } from "@/lib/table/types";
import { splitDelimitedLine } from "@/lib/table/split-text";

export type InvoiceLabels = {
  item: string;
  qty: string;
  price: string;
  amount: string;
  field: string;
  value: string;
};

const ITEM_RE =
  /(item|description|product|name|товар|наймен|назва|опис|позиц|artikel|bezeichnung|leistung|descripci|concepto|d[eé]signation|libell|nazwa|towar)/i;
const QTY_RE =
  /(qty|quantity|q-?ty|кіл|к-сть|к-ть|кільк|шт\.?|menge|anzahl|cantidad|quantit|qt[eé]|ilo[sś][cć])/i;
const PRICE_RE = /(price|unit|ціна|preis|einzel|precio|prix|cena|\bpu\b)/i;
const AMOUNT_RE =
  /(amount|sum|total|сума|варт|betrag|importe|montant|warto|kwota)/i;
const DOC_RE =
  /(накладна|рахунок|invoice|rechnung|facture|factura|faktura|bill|receipt)/i;
const TOTAL_RE =
  /^(разом|всього|до сплати|пдв|total|subtotal|vat|mwst|iva|tva|suma|gesamt|netto|brutto|importe total|montant|razem|do zap[lł]aty|gesamtbetrag)\b/i;

const NUMBER_TAIL =
  /(?:\d{1,3}(?:[ \u00A0]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)$/;

function linesOf(text: string): string[] {
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function peelNumbers(line: string, max = 4): { name: string; numbers: string[] } {
  let rest = line.trim();
  const numbers: string[] = [];

  while (numbers.length < max) {
    const match = rest.match(NUMBER_TAIL);
    if (!match || match.index === undefined || match.index <= 0) break;
    if (!/\s/.test(rest[match.index - 1] ?? "")) break;
    numbers.unshift(match[0].trim());
    rest = rest.slice(0, match.index).trim();
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

  if (DOC_RE.test(line) || TOTAL_RE.test(line)) {
    const peeled = peelNumbers(line, 2);
    if (peeled.numbers.length > 0 && peeled.name) {
      return { label: peeled.name, value: peeled.numbers.join(" ") };
    }
    return { label: line, value: "" };
  }

  return null;
}

function rowFromNumbers(
  name: string,
  numbers: string[],
): string[] | null {
  if (!/[A-Za-zА-Яа-яІіЇїЄєҐґÀ-ÿ]/.test(name) || numbers.length < 2) return null;
  if (numbers.length === 2) return [name, numbers[0], "", numbers[1]];
  if (numbers.length === 3) return [name, numbers[0], numbers[1], numbers[2]];
  return [`${name} ${numbers[0]}`.trim(), numbers[1], numbers[2], numbers[3]];
}

export function parseInvoice(text: string, labels: InvoiceLabels): InvoiceParse {
  const source = linesOf(text);
  const headerIndex = source.findIndex(isHeaderLine);
  const meta: Array<{ label: string; value: string }> = [];
  const rows: string[][] = [];

  if (headerIndex >= 0) {
    const delimiter = detectRowDelimiter(source[headerIndex]);
    const headerCells = splitRow(source[headerIndex], delimiter);

    for (let index = 0; index < headerIndex; index += 1) {
      const field = metaFromLine(source[index]);
      if (field) meta.push(field);
    }

    for (let index = headerIndex + 1; index < source.length; index += 1) {
      const line = source[index];
      if (TOTAL_RE.test(line) || /^[^:]{2,40}:/.test(line)) {
        const field = metaFromLine(line);
        if (field) meta.push(field);
        continue;
      }
      const cells = splitRow(line, delimiter);
      if (cells.length < 2) {
        const peeled = peelNumbers(line);
        const row = rowFromNumbers(peeled.name, peeled.numbers);
        if (row) rows.push(row);
        continue;
      }
      rows.push(cells);
    }

    const headers =
      headerCells.length > 0
        ? headerCells
        : [labels.item, labels.qty, labels.price, labels.amount];

    return { meta, headers, rows };
  }

  for (const line of source) {
    const field = metaFromLine(line);
    const peeled = peelNumbers(line);
    const row = rowFromNumbers(peeled.name, peeled.numbers);
    if (row && !TOTAL_RE.test(line) && !DOC_RE.test(line)) {
      rows.push(row);
      continue;
    }
    if (field) meta.push(field);
  }

  return {
    meta,
    headers: [labels.item, labels.qty, labels.price, labels.amount],
    rows,
  };
}
