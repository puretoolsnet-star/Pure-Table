import type QRCodeType from "qrcode";

import { triggerTextDownload } from "@/lib/table/export-table";
import type { ParsedTable } from "@/lib/table/types";

export type QrCodeMode = "qr" | "barcode";

export type CodeItem = {
  label: string;
  code: string;
  dataUrl: string;
};

async function renderCode(code: string, mode: QrCodeMode): Promise<string> {
  if (!code.trim()) return "";
  if (mode === "qr") {
    const QRCode = (await import("qrcode")).default as typeof QRCodeType;
    return QRCode.toDataURL(code, { margin: 1, width: 256 });
  }
  const JsBarcode = (await import("jsbarcode")).default;
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, code, {
    format: "CODE128",
    displayValue: true,
    fontSize: 14,
    margin: 8,
    background: "#ffffff",
    lineColor: "#020617",
  });
  return canvas.toDataURL("image/png");
}

export async function buildCodeItems(
  table: ParsedTable,
  nameColumn: number,
  codeColumn: number,
  mode: QrCodeMode,
): Promise<CodeItem[]> {
  const items: CodeItem[] = [];
  for (const row of table.rows) {
    const code = (row[codeColumn] ?? "").trim();
    if (!code) continue;
    const label = (row[nameColumn] ?? code).trim();
    const dataUrl = await renderCode(code, mode);
    if (!dataUrl) continue;
    items.push({ label, code, dataUrl });
  }
  return items;
}

export function buildCodeGalleryHtml(items: CodeItem[], title: string): string {
  const cards = items
    .map(
      (item) => `<figure style="break-inside:avoid;margin:0 0 1.25rem;">
<img src="${item.dataUrl}" alt="${escapeHtml(item.code)}" style="max-width:100%;height:auto;border:1px solid #334155;border-radius:12px;background:#fff"/>
<figcaption style="margin-top:.5rem;font-size:14px;color:#e2e8f0">${escapeHtml(item.label)} — ${escapeHtml(item.code)}</figcaption>
</figure>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, sans-serif; background: #020617; color: #e2e8f0; margin: 0; padding: 1.5rem; }
  h1 { font-size: 1.25rem; margin: 0 0 1rem; }
  .grid { column-count: 1; column-gap: 1.25rem; }
  @media (min-width: 640px) { .grid { column-count: 2; } }
  @media (min-width: 1024px) { .grid { column-count: 3; } }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
<div class="grid">${cards}</div>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function downloadCodeGallery(filenameBase: string, html: string) {
  triggerTextDownload(html, `${filenameBase}.html`, "text/html;charset=utf-8");
}
