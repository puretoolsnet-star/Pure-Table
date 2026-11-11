import type { TableSheet } from "@/lib/table/types";

import { triggerTextDownload } from "@/lib/table/export-table";

function escapeMarkdownCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function escapeSqlValue(value: string): string {
  return value.replace(/'/g, "''");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sheetMatrix(sheet: TableSheet): string[][] {
  return [sheet.headers, ...sheet.rows];
}

export function buildMarkdownTable(sheet: TableSheet): string {
  const matrix = sheetMatrix(sheet);
  if (matrix.length === 0 || matrix[0].length === 0) return "";

  const header = matrix[0].map(escapeMarkdownCell).join(" | ");
  const divider = matrix[0].map(() => "---").join(" | ");
  const body = matrix
    .slice(1)
    .map((row) => row.map(escapeMarkdownCell).join(" | "))
  return [header, divider, ...body].join("\n");
}

export function buildSqlInserts(sheet: TableSheet, tableName: string): string {
  const safeName = tableName.replace(/[^\w]/g, "_") || "puretable_export";
  const columns = sheet.headers.map((header, index) =>
    header.trim() ? header.replace(/[^\w]/g, "_") : `col_${index + 1}`,
  );

  if (columns.length === 0) return "";

  return sheet.rows
    .map((row) => {
      const values = columns.map((_, index) => {
        const raw = row[index] ?? "";
        return raw === "" ? "NULL" : `'${escapeSqlValue(raw)}'`;
      });
      return `INSERT INTO ${safeName} (${columns.join(", ")}) VALUES (${values.join(", ")});`;
    })
    .join("\n");
}

export function buildHtmlTable(sheet: TableSheet): string {
  const matrix = sheetMatrix(sheet);
  if (matrix.length === 0) return "";

  const [headers, ...rows] = matrix;
  const thead = `<tr>${headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr>`;
  const tbody = rows
    .map(
      (row) =>
        `<tr>${headers.map((_, index) => `<td>${escapeHtml(row[index] ?? "")}</td>`).join("")}</tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>PureTable export</title>
<style>
  table { border-collapse: collapse; font-family: system-ui, sans-serif; font-size: 14px; }
  th, td { border: 1px solid #334155; padding: 6px 10px; text-align: left; }
  th { background: #0f172a; color: #e2e8f0; }
  tr:nth-child(even) td { background: #0b1220; color: #e2e8f0; }
  tr:nth-child(odd) td { background: #020617; color: #e2e8f0; }
</style>
</head>
<body>
<table>
<thead>${thead}</thead>
<tbody>${tbody}</tbody>
</table>
</body>
</html>`;
}

export function downloadMarkdown(filenameBase: string, sheets: TableSheet[]) {
  const sheet = sheets.find((item) => item.headers.length > 0 || item.rows.length > 0);
  if (!sheet) return;
  const body = buildMarkdownTable(sheet);
  if (!body) return;
  triggerTextDownload(body, `${filenameBase}.md`, "text/markdown;charset=utf-8");
}

export function downloadSql(filenameBase: string, sheets: TableSheet[], tableName: string) {
  const sheet = sheets.find((item) => item.headers.length > 0 || item.rows.length > 0);
  if (!sheet) return;
  const body = buildSqlInserts(sheet, tableName);
  if (!body) return;
  triggerTextDownload(body, `${filenameBase}.sql`, "text/sql;charset=utf-8");
}

export function downloadHtml(filenameBase: string, sheets: TableSheet[]) {
  const sheet = sheets.find((item) => item.headers.length > 0 || item.rows.length > 0);
  if (!sheet) return;
  const body = buildHtmlTable(sheet);
  if (!body) return;
  triggerTextDownload(body, `${filenameBase}.html`, "text/html;charset=utf-8");
}
