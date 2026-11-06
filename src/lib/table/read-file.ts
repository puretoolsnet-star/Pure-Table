import { textToTable } from "@/lib/table/split-text";
import type { ParsedTable } from "@/lib/table/types";

function isCsv(file: File): boolean {
  return /\.csv$/i.test(file.name) || file.type.includes("csv") || file.type.startsWith("text/");
}

export async function readSpreadsheet(
  file: File,
  columnLabel: (index: number) => string,
): Promise<ParsedTable> {
  if (isCsv(file) && !/\.xls/i.test(file.name)) {
    const text = (await file.text()).replace(/^\uFEFF/, "");
    return textToTable(text, { delimiter: "auto", header: true, columnLabel });
  }

  const XLSX = await import("xlsx");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { headers: [], rows: [] };

  const matrix = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
    workbook.Sheets[sheetName],
    { header: 1, raw: false, defval: "" },
  );

  const rows = matrix
    .map((row) => row.map((cell) => (cell == null ? "" : String(cell).trim())))
    .filter((row) => row.some((cell) => cell.length > 0));

  if (rows.length === 0) return { headers: [], rows: [] };

  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const padded = rows.map((row) =>
    Array.from({ length: width }, (_, index) => row[index] ?? ""),
  );
  const headers = padded[0].map((cell, index) => cell || columnLabel(index + 1));
  return { headers, rows: padded.slice(1) };
}
