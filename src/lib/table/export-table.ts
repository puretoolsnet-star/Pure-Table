import type { TableSheet } from "@/lib/table/types";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function toMatrix(sheet: TableSheet): string[][] {
  return [sheet.headers, ...sheet.rows];
}

export async function downloadSheets(
  format: "csv" | "xlsx",
  filenameBase: string,
  sheets: TableSheet[],
) {
  const usable = sheets.filter((sheet) => sheet.headers.length > 0 || sheet.rows.length > 0);
  if (usable.length === 0) return;

  const XLSX = await import("xlsx");

  if (format === "csv") {
    const matrix = usable.flatMap((sheet, index) => {
      const block = toMatrix(sheet);
      return index === 0 ? block : [[], ...block];
    });
    const csv = XLSX.utils.sheet_to_csv(XLSX.utils.aoa_to_sheet(matrix));
    triggerDownload(
      new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
      `${filenameBase}.csv`,
    );
    return;
  }

  const workbook = XLSX.utils.book_new();
  usable.forEach((sheet, index) => {
    const name = (sheet.name || `Sheet${index + 1}`).slice(0, 31);
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(toMatrix(sheet)),
      name,
    );
  });
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  triggerDownload(
    new Blob([output], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filenameBase}.xlsx`,
  );
}
