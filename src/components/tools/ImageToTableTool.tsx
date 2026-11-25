"use client";

import { Camera, ScanText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { EditableOcrTable } from "@/components/tools/EditableOcrTable";
import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/locales";
import type { Dictionary } from "@/i18n/types";
import {
  OCR_LANG_SELECT_VALUES,
  resolveOcrLang,
  type OcrLangSelect,
} from "@/lib/ocr/lang";
import { recognizeTable, releaseOcrWorker } from "@/lib/ocr/recognize";
import { prepareOcrImage } from "@/lib/table/prepare-ocr-image";
import type { ParsedTable } from "@/lib/table/types";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

type WorkPhase = "idle" | "preparing" | "loading" | "reading" | "building";

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

function ocrLangOptionLabel(t: Dictionary, value: OcrLangSelect): string {
  switch (value) {
    case "auto":
      return t.workspace.ocrLangAuto;
    case "ukr+eng":
      return t.workspace.ocrLangUk;
    case "eng":
      return t.workspace.ocrLangEn;
    case "deu+eng":
      return t.workspace.ocrLangDe;
    case "fra+eng":
      return t.workspace.ocrLangFr;
    case "spa+eng":
      return t.workspace.ocrLangEs;
    case "pol+eng":
      return t.workspace.ocrLangPl;
  }
}

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

function phasePercent(phase: WorkPhase, progress: number): number {
  switch (phase) {
    case "preparing":
      return 8;
    case "loading":
      return 10 + Math.round(progress * 35);
    case "reading":
      return 48 + Math.round(progress * 48);
    case "building":
      return 98;
    default:
      return 0;
  }
}

function phaseLabel(phase: WorkPhase, t: Dictionary): string {
  switch (phase) {
    case "preparing":
      return t.workspace.ocrPreparing;
    case "loading":
      return t.workspace.ocrLoadingEngine;
    case "reading":
      return t.workspace.ocrRecognizing;
    case "building":
      return t.workspace.ocrBuildingTable;
    default:
      return "";
  }
}

export function ImageToTableTool() {
  const { t, locale } = useI18n();
  const runId = useRef(0);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [table, setTable] = useState<ParsedTable>({ headers: [], rows: [] });
  const [rawText, setRawText] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [langChoice, setLangChoice] = useState<OcrLangSelect>("auto");
  const [phase, setPhase] = useState<WorkPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      void releaseOcrWorker();
    };
  }, []);

  function ingestFile(file: File) {
    if (!isImage(file)) {
      setError(t.workspace.ocrUnsupported);
      return;
    }
    void recognize(file);
  }

  async function recognize(source: Blob | string) {
    const id = runId.current + 1;
    runId.current = id;
    setError("");
    setShowRaw(false);
    setPhase("preparing");
    setProgress(0);
    try {
      const image = typeof source === "string" ? source : await prepareOcrImage(source);
      if (runId.current !== id) return;
      setPreview(image);
      const ocrLang = resolveOcrLang(langChoice, locale);
      setPhase("loading");
      const result = await recognizeTable(
        image,
        ocrLang,
        t.workspace.columnLabel,
        (ocrPhase, ratio) => {
          if (runId.current !== id) return;
          setPhase(ocrPhase === "loading" ? "loading" : "reading");
          setProgress(ratio);
        },
      );
      if (runId.current !== id) return;
      setPhase("building");
      setRawText(result.rawText);
      setTable(result.table);
      if (result.table.rows.length === 0) setError(t.workspace.ocrEmpty);
    } catch {
      if (runId.current === id) {
        setTable({ headers: [], rows: [] });
        setRawText("");
        setError(t.workspace.ocrFailed);
      }
    } finally {
      if (runId.current === id) setPhase("idle");
    }
  }

  const busy = phase !== "idle";
  const barWidth = phasePercent(phase, progress);

  return (
    <ToolShell toolId="image-to-table" icon={ScanText}>
      <div className="min-w-0 space-y-5">
        <div className="min-w-0">
          <label className="block text-sm font-medium text-slate-200" htmlFor="ocr-lang">
            {t.workspace.ocrLangLabel}
          </label>
          <select
            id="ocr-lang"
            value={langChoice}
            disabled={busy}
            onChange={(event) => setLangChoice(event.target.value as OcrLangSelect)}
            className="mt-2 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50 disabled:opacity-50"
          >
            {OCR_LANG_SELECT_VALUES.map((value) => (
              <option key={value} value={value}>
                {ocrLangOptionLabel(t, value)}
              </option>
            ))}
          </select>
        </div>

        <FileDropzone
          accept={IMAGE_ACCEPT}
          multiple={false}
          title={t.workspace.ocrDropTitle}
          hint={t.workspace.ocrDropHint}
          onFiles={(files) => {
            const file = files[0];
            if (file) ingestFile(file);
          }}
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50 sm:hidden"
          >
            <Camera className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {t.workspace.ocrTakePhoto}
          </button>
          <input
            ref={cameraRef}
            type="file"
            accept={IMAGE_ACCEPT}
            capture="environment"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) ingestFile(file);
              if (cameraRef.current) cameraRef.current.value = "";
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void recognize(drawSample(SAMPLE_ROWS[locale]))}
            className="min-h-11 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
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
              setRawText("");
              setShowRaw(false);
              setError("");
              setProgress(0);
            }}
            className="min-h-11 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.workspace.clear}
          </button>
        </div>

        {preview && (
          <img
            src={preview}
            alt=""
            className="max-h-64 w-full max-w-full rounded-2xl border border-slate-800 bg-slate-900 object-contain"
          />
        )}

        {busy && (
          <div className="space-y-2" aria-live="polite">
            <p className="text-sm text-slate-300">
              {phaseLabel(phase, t)}{" "}
              {phase === "reading" || phase === "loading"
                ? t.workspace.ocrProgress(Math.round(progress * 100))
                : ""}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${Math.max(barWidth, 4)}%` }}
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-amber-200/90">{error}</p>}

        {(rawText.length > 0 || table.rows.length > 0) && (
          <button
            type="button"
            onClick={() => setShowRaw((value) => !value)}
            className="min-h-10 rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-400 hover:text-white"
          >
            {showRaw ? t.workspace.ocrHideRaw : t.workspace.ocrShowRaw}
          </button>
        )}

        {showRaw && rawText.length > 0 && (
          <label className="block min-w-0">
            <span className="mb-2 block text-sm font-semibold text-white">{t.workspace.ocrRawTitle}</span>
            <textarea
              readOnly
              value={rawText}
              className="glass-card min-h-40 w-full max-w-full resize-y rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 outline-none"
            />
          </label>
        )}

        <EditableOcrTable
          title={`${t.workspace.ocrEditTitle} · ${t.workspace.rowCount(table.rows.length)}`}
          hint={t.workspace.ocrEditHint}
          mobileScrollHint={t.tableStudio.mobileScrollHint}
          headers={table.headers}
          rows={table.rows}
          emptyLabel={t.workspace.emptyPreview}
          addRowLabel={t.workspace.ocrAddRow}
          addColumnLabel={t.workspace.ocrAddColumn}
          removeRowLabel={t.workspace.ocrRemoveRow}
          removeColumnLabel={t.workspace.ocrRemoveColumn}
          columnLabel={t.workspace.columnLabel}
          onChange={setTable}
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