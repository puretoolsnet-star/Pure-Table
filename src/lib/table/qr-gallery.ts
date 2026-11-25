import { strToU8, zipSync } from "fflate";
import type QRCodeType from "qrcode";

import { triggerTextDownload } from "@/lib/table/export-table";
import type { ParsedTable } from "@/lib/table/types";

export type QrCodeMode = "qr" | "barcode";

export type CodeItem = {
  label: string;
  code: string;
  dataUrl: string;
  rowIndex: number;
};

export type CodeSkipReason = "empty" | "invalid-barcode" | "render-failed";

export type SkippedCodeRow = {
  rowIndex: number;
  label: string;
  code: string;
  reason: CodeSkipReason;
};

export type CodeBuildResult = {
  items: CodeItem[];
  skipped: SkippedCodeRow[];
  stats: { generated: number; skipped: number };
};

/** CODE128 via JsBarcode: printable ASCII only (space through tilde). */
export function isValidCode128(value: string): boolean {
  const text = value.trim();
  if (!text || text.length > 80) return false;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    if (code < 32 || code > 126) return false;
  }
  return true;
}

async function renderCode(code: string, mode: QrCodeMode): Promise<string> {
  const payload = code.trim();
  if (!payload) return "";
  if (mode === "barcode" && !isValidCode128(payload)) return "";

  try {
    if (mode === "qr") {
      const QRCode = (await import("qrcode")).default as typeof QRCodeType;
      return QRCode.toDataURL(payload, { margin: 1, width: 256, errorCorrectionLevel: "M" });
    }
    const JsBarcode = (await import("jsbarcode")).default;
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, payload, {
      format: "CODE128",
      displayValue: true,
      fontSize: 14,
      margin: 8,
      background: "#ffffff",
      lineColor: "#020617",
    });
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

export type BuildCodeItemsOptions = {
  nameColumn: number | null;
  codeColumn: number;
  mode: QrCodeMode;
};

export async function buildCodeItems(
  table: ParsedTable,
  options: BuildCodeItemsOptions,
): Promise<CodeBuildResult> {
  const { nameColumn, codeColumn, mode } = options;
  const items: CodeItem[] = [];
  const skipped: SkippedCodeRow[] = [];

  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex += 1) {
    const row = table.rows[rowIndex];
    const code = (row[codeColumn] ?? "").trim();
    const label =
      nameColumn === null
        ? code
        : (row[nameColumn] ?? code).trim() || code;

    if (!code) {
      skipped.push({ rowIndex, label, code, reason: "empty" });
      continue;
    }

    if (mode === "barcode" && !isValidCode128(code)) {
      skipped.push({ rowIndex, label, code, reason: "invalid-barcode" });
      continue;
    }

    const dataUrl = await renderCode(code, mode);
    if (!dataUrl) {
      skipped.push({ rowIndex, label, code, reason: "render-failed" });
      continue;
    }

    items.push({ label, code, dataUrl, rowIndex });
  }

  return {
    items,
    skipped,
    stats: { generated: items.length, skipped: skipped.length },
  };
}

/** Back-compat wrapper for older call sites. */
export async function buildCodeItemsLegacy(
  table: ParsedTable,
  nameColumn: number,
  codeColumn: number,
  mode: QrCodeMode,
): Promise<CodeItem[]> {
  const result = await buildCodeItems(table, { nameColumn, codeColumn, mode });
  return result.items;
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

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const binary = atob(base64 ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function safeCodeFilename(
  label: string,
  code: string,
  index: number,
  ext: string,
): string {
  const sanitize = (part: string) =>
    part
      .replace(/[\\/:*?"<>|]/g, "_")
      .replace(/\s+/g, " ")
      .trim();
  const namePart = sanitize(label || code || `item-${index + 1}`).slice(0, 72);
  const codePart = sanitize(code).slice(0, 32);
  const ordinal = String(index + 1).padStart(3, "0");
  const base = codePart ? `${ordinal}-${namePart}__${codePart}` : `${ordinal}-${namePart}`;
  return `${base}.${ext}`;
}

export function downloadCodeZip(filenameBase: string, items: CodeItem[]) {
  if (items.length === 0) return;

  const used = new Set<string>();
  const files: Record<string, Uint8Array> = {};

  items.forEach((item, index) => {
    let name = safeCodeFilename(item.label, item.code, index, "png");
    if (used.has(name)) {
      name = safeCodeFilename(item.label, `${item.code}-${index}`, index, "png");
    }
    used.add(name);
    files[name] = dataUrlToBytes(item.dataUrl);
  });

  const indexLines = items.map(
    (item, index) => `${index + 1}\t${item.label}\t${item.code}\t${safeCodeFilename(item.label, item.code, index, "png")}`,
  );
  files["index.txt"] = strToU8(`\uFEFF${indexLines.join("\n")}\n`);

  const zipped = zipSync(files, { level: 6 });
  triggerBlobDownload(new Blob([zipped], { type: "application/zip" }), `${filenameBase}.zip`);
}