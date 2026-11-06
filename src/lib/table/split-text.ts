import type { DelimiterId, ParsedTable } from "@/lib/table/types";

const DELIMITERS: Array<{ id: Exclude<DelimiterId, "auto">; char: string }> = [
  { id: "tab", char: "\t" },
  { id: "pipe", char: "|" },
  { id: "semicolon", char: ";" },
  { id: "comma", char: "," },
];

export function splitDelimitedLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (!quoted && char === delimiter) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function splitSpaceColumns(line: string): string[] {
  return line
    .trim()
    .split(/\s{2,}/)
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0);
}

function nonEmptyLines(text: string): string[] {
  return text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function columnScore(lines: string[], split: (line: string) => string[]): number {
  const widths = lines
    .map((line) => split(line).length)
    .filter((width) => width >= 2);
  if (widths.length < Math.max(1, Math.ceil(lines.length * 0.5))) return 0;

  const counts = new Map<number, number>();
  for (const width of widths) {
    counts.set(width, (counts.get(width) ?? 0) + 1);
  }

  let mode = 0;
  let modeCount = 0;
  for (const [width, count] of counts) {
    if (count > modeCount || (count === modeCount && width > mode)) {
      mode = width;
      modeCount = count;
    }
  }

  return modeCount * 10 + mode;
}

export function detectDelimiter(text: string): Exclude<DelimiterId, "auto"> {
  const lines = nonEmptyLines(text);
  if (lines.length === 0) return "comma";

  let best: Exclude<DelimiterId, "auto"> = "comma";
  let bestScore = 0;

  for (const candidate of DELIMITERS) {
    if (!lines.some((line) => line.includes(candidate.char))) continue;
    const score = columnScore(lines, (line) =>
      splitDelimitedLine(line, candidate.char),
    );
    if (score > bestScore) {
      best = candidate.id;
      bestScore = score;
    }
  }

  const spaceScore = columnScore(lines, splitSpaceColumns);
  if (spaceScore > bestScore) return "space";
  if (bestScore === 0) return "space";
  return best;
}

function splitterFor(id: Exclude<DelimiterId, "auto">) {
  if (id === "space") return splitSpaceColumns;
  const char = DELIMITERS.find((item) => item.id === id)?.char ?? ",";
  return (line: string) => splitDelimitedLine(line, char);
}

function looksLikeHeader(cells: string[]): boolean {
  if (cells.length < 2) return false;
  const numeric = cells.filter((cell) =>
    /^-?\d+(?:[.,]\d+)?$/.test(cell.replace(/\s/g, "")),
  ).length;
  return numeric < cells.length / 2;
}

export function textToTable(
  text: string,
  options: {
    delimiter?: DelimiterId;
    header?: boolean;
    columnLabel?: (index: number) => string;
  } = {},
): ParsedTable {
  const lines = nonEmptyLines(text);
  const delimiter =
    !options.delimiter || options.delimiter === "auto"
      ? detectDelimiter(text)
      : options.delimiter;
  const split = splitterFor(delimiter);
  const matrix = lines
    .map(split)
    .filter((row) => row.some((cell) => cell.length > 0));

  if (matrix.length === 0) {
    return { headers: [], rows: [] };
  }

  const width = matrix.reduce((max, row) => Math.max(max, row.length), 0);
  const padded = matrix.map((row) =>
    Array.from({ length: width }, (_, index) => row[index] ?? ""),
  );

  const useHeader = options.header !== false && looksLikeHeader(padded[0]);
  const label = options.columnLabel ?? ((index: number) => `Column ${index}`);

  if (useHeader) {
    const headers = padded[0].map((cell, index) => cell || label(index + 1));
    return { headers, rows: padded.slice(1) };
  }

  return {
    headers: Array.from({ length: width }, (_, index) => label(index + 1)),
    rows: padded,
  };
}
