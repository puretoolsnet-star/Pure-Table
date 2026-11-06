"use client";

import { ScanText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/locales";
import { recognizeTable, releaseOcrWorker } from "@/lib/ocr/recognize";
import { prepareOcrImage } from "@/lib/table/prepare-ocr-image";
import type { ParsedTable } from "@/lib/table/types";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

const SAMPLE_ROWS: Record<Locale, string[][]> = {
  uk: [
    ["Товар", "К-сть", "Сума"],
    ["Папір А4", "10", "120.00"],
    ["Ручки", "24", "372.00"],
    ["Разом", "", "492.00"],
  ],
  en: [
    ["Item", "Qty", "Amount"],
    ["A4 paper", "10", "48.00"],
    ["Blue pens", "24", "27.60"],
    ["Total", "", "75.60"],
  ],
  de: [
    ["Artikel", "Menge", "Betrag"],
    ["Papier A4", "10", "48.00"],
    ["Kugelschreiber", "24", "27.60"],
    ["Summe", "", "75.60"],
  ],
  fr: [
    ["Article", "Qté", "Montant"],
    ["Papier A4", "10", "48.00"],
    ["Stylos", "24", "27.60"],
    ["Total", "", "75.60"],
  ],
  es: [
    ["Concepto", "Cant.", "Importe"],
    ["Papel A4", "10", "48.00"],
    ["Bolígrafos", "24", "27.60"],
    ["Total", "", "75.60"],
  ],
  pl: [
    ["Towar", "Ilość", "Kwota"],
    ["Papier A4", "10", "48.00"],
    ["Długopisy", "24", "27.60"],
    ["Razem", "", "75.60"],
  ],
};

function drawSample(rows: string[][]): string {
  const canvas = document.createElement("canvas");
  const rowHeight = 54;
  canvas.width = 980;
  canvas.height = 70 + rows.length * rowHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#111111";
  context.font = "32px Arial, sans-serif";
  const columns = [48, 460, 720];
  rows.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      context.fillText(cell, columns[cellIndex] ?? 48, 64 + rowIndex * rowHeight);
    });
  });
  return canvas.toDataURL("image/png");
}

function isImage(file: File): boolean {
  return /^image\/(jpeg|png|webp)$/.test(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
}

export function ImageToTableTool() {
  const { t, locale } = useI18n();
  const runId = useRef(0);
  const [preview, setPreview] = useState("");
  const [table, setTable] = useState<ParsedTable>({ headers: [], rows: [] });
  const [phase, setPhase] = useState<"idle" | "preparing" | "reading">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      void releaseOcrWorker();
    };
  }, []);

  async function recognize(source: Blob | string) {
    const id = runId.current + 1;
    runId.current = id;
    setError("");
    setPhase("preparing");
    setProgress(0);
    try {
      const image = typeof source === "string" ? source : await prepareOcrImage(source);
      if (runId.current !== id) return;
      setPreview(image);
      setPhase("reading");
      const next = await recognizeTable(image, locale, t.workspace.columnLabel, (ratio) => {
        if (runId.current === id) setProgress(Math.round(ratio * 100));
      });
      if (runId.current !== id) return;
      setTable(next);
      if (next.rows.length === 0) setError(t.workspace.ocrEmpty);
    } catch {
      if (runId.current === id) {
        setTable({ headers: [], rows: [] });
        setError(t.workspace.ocrFailed);
      }
    } finally {
      if (runId.current === id) setPhase("idle");
    }
  }

  const busy = phase !== "idle";

  return (
    <ToolShell toolId="image-to-table" icon={ScanText}>
      <div className="space-y-5">
        <FileDropzone
          accept={IMAGE_ACCEPT}
          multiple={false}
          title={t.workspace.ocrDropTitle}
          hint={t.workspace.ocrDropHint}
          onFiles={(files) => {
            const file = files[0];
            if (!file) return;
            if (!isImage(file)) {
              setError(t.workspace.ocrUnsupported);
              return;
            }
            void recognize(file);
          }}
        />

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            disabled={busy}
            onClick={() => void recognize(drawSample(SAMPLE_ROWS[locale]))}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.workspace.ocrSample}
          </button>
          <button
            type="button"
            disabled={busy || (!preview && table.rows.length === 0)}
            onClick={() => {
              runId.current += 1;
              setPreview("");
              setTable({ headers: [], rows: [] });
              setError("");
              setProgress(0);
            }}
            className="rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.workspace.clear}
          </button>
        </div>

        {preview && (
          <img
            src={preview}
            alt=""
            className="max-h-64 w-full rounded-2xl border border-slate-800 bg-slate-900 object-contain"
          />
        )}

        {busy && (
          <div className="space-y-2">
            <p className="text-sm text-slate-300">
              {phase === "preparing" ? t.workspace.ocrPreparing : t.workspace.ocrRecognizing}{" "}
              {phase === "reading" ? t.workspace.ocrProgress(progress) : ""}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${phase === "preparing" ? 8 : Math.max(progress, 4)}%` }}
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-amber-200/90">{error}</p>}

        <TablePreview
          title={`${t.workspace.previewTitle} · ${t.workspace.rowCount(table.rows.length)}`}
          headers={table.headers}
          rows={table.rows}
          emptyLabel={t.workspace.emptyPreview}
        />

        <ExportBar
          filename="puretable-ocr"
          sheets={[{ name: t.workspace.sheetItems, headers: table.headers, rows: table.rows }]}
          ready={!busy && table.rows.length > 0}
          xlsxLabel={t.workspace.ocrDownloadXlsx}
          csvLabel={t.workspace.ocrDownloadCsv}
        />
      </div>
    </ToolShell>
  );
}
