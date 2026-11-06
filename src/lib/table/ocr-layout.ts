import type { ParsedTable } from "@/lib/table/types";

export type OcrWord = {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  confidence?: number;
};

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

export function wordsToTable(
  words: OcrWord[],
  columnLabel: (index: number) => string,
): ParsedTable {
  const items = words
    .map((word) => ({ ...word, text: word.text.replace(/\s+/g, " ").trim() }))
    .filter(
      (word) =>
        word.text.length > 0 &&
        word.x1 > word.x0 &&
        word.y1 > word.y0 &&
        (word.confidence === undefined || word.confidence >= 35),
    );

  if (items.length === 0) return { headers: [], rows: [] };

  const heights = items.map((word) => word.y1 - word.y0);
  const height = Math.max(8, median(heights));
  const rowSlack = Math.max(6, height * 0.55);

  const sorted = [...items].sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
  const lines: OcrWord[][] = [];

  for (const word of sorted) {
    const center = (word.y0 + word.y1) / 2;
    const line = lines.find((group) => {
      const mid =
        group.reduce((sum, item) => sum + (item.y0 + item.y1) / 2, 0) / group.length;
      return Math.abs(center - mid) <= rowSlack;
    });
    if (line) line.push(word);
    else lines.push([word]);
  }

  for (const line of lines) line.sort((a, b) => a.x0 - b.x0);

  const gaps: number[] = [];
  for (const line of lines) {
    for (let index = 1; index < line.length; index += 1) {
      gaps.push(line[index].x0 - line[index - 1].x1);
    }
  }
  const tightGaps = gaps.filter((gap) => gap >= 0 && gap <= height * 1.8);
  const spaceWidth = tightGaps.length > 0 ? median(tightGaps) : height * 0.45;
  const columnGap = Math.max(spaceWidth * 2.8, height * 1.15);

  const anchors: number[] = [];
  for (const line of lines) {
    if (!line[0]) continue;
    anchors.push(line[0].x0);
    for (let index = 1; index < line.length; index += 1) {
      if (line[index].x0 - line[index - 1].x1 >= columnGap) anchors.push(line[index].x0);
    }
  }
  anchors.sort((a, b) => a - b);

  const columnStarts: number[] = [];
  const clusterSlack = Math.max(height * 0.8, columnGap * 0.35);
  for (const anchor of anchors) {
    const last = columnStarts[columnStarts.length - 1];
    if (last === undefined || anchor - last > clusterSlack) columnStarts.push(anchor);
  }

  if (columnStarts.length === 0) return { headers: [], rows: [] };

  const rows = lines
    .map((line) => {
      const cells = columnStarts.map(() => [] as string[]);
      for (const word of line) {
        let column = 0;
        let best = Number.POSITIVE_INFINITY;
        columnStarts.forEach((start, index) => {
          const distance = Math.abs(word.x0 - start);
          if (distance < best) {
            best = distance;
            column = index;
          }
        });
        cells[column].push(word.text);
      }
      return cells.map((parts) => parts.join(" ").trim());
    })
    .filter((row) => row.some((cell) => cell.length > 0));

  if (rows.length === 0) return { headers: [], rows: [] };

  let width = columnStarts.length;
  while (width > 1 && rows.every((row) => !row[width - 1])) width -= 1;
  const trimmed = rows.map((row) => row.slice(0, width));

  return {
    headers: Array.from({ length: width }, (_, index) => columnLabel(index + 1)),
    rows: trimmed,
  };
}
