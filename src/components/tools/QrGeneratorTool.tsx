"use client";

import { Barcode } from "lucide-react";
import { useCallback, useMemo, useState, type ReactNode } from "react";

import { FileDropzone } from "@/components/tools/FileDropzone";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import { readSpreadsheet } from "@/lib/table/read-file";
import { TEXT_SAMPLE } from "@/lib/table/samples";
import { textToTable } from "@/lib/table/split-text";
import {
  buildCodeGalleryHtml,
  buildCodeItems,
  downloadCodeGallery,
  type CodeItem,
  type QrCodeMode,
} from "@/lib/table/qr-gallery";
import type { ParsedTable } from "@/lib/table/types";
import { useMandatoryAd } from "@/lib/use-mandatory-ad";
import { cn } from "@/lib/cn";

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function QrGeneratorTool() {
  const { t } = useI18n();
  const [table, setTable] = useState<ParsedTable>({ headers: [], rows: [] });
  const [nameColumn, setNameColumn] = useState(0);
  const [codeColumn, setCodeColumn] = useState(1);
  const [mode, setMode] = useState<QrCodeMode>("qr");
  const [items, setItems] = useState<CodeItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { requestDownload, modal } = useMandatoryAd();

  const width = useMemo(
    () =>
      Math.max(
        table.headers.length,
        table.rows.reduce((max, row) => Math.max(max, row.length), 0),
      ),
    [table],
  );

  const columnOptions = useMemo(
    () =>
      Array.from({ length: Math.max(width, 1) }, (_, index) => ({
        index,
        label: table.headers[index]?.trim() || t.workspace.columnLabel(index + 1),
      })),
    [width, table.headers, t],
  );

  const loadFile = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setError("");
      try {
        const parsed = await readSpreadsheet(file, t.workspace.columnLabel);
        setTable(parsed);
        setItems([]);
      } catch {
        setError(t.workspace.parseFailed);
      }
    },
    [t],
  );

  const loadSample = useCallback(() => {
    const parsed = textToTable(TEXT_SAMPLE, {
      delimiter: "semicolon",
      header: true,
      columnLabel: t.workspace.columnLabel,
    });
    setTable(parsed);
    setItems([]);
    setError("");
  }, [t]);

  const generate = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const next = await buildCodeItems(table, nameColumn, codeColumn, mode);
      setItems(next);
      if (next.length === 0) setError(t.workspace.qrEmpty);
    } catch {
      setError(t.workspace.qrFailed);
    } finally {
      setBusy(false);
    }
  }, [table, nameColumn, codeColumn, mode, t]);

  const selectClass =
    "w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50";

  return (
    <ToolShell toolId="qr-generator" icon={Barcode}>
      <div className="space-y-5">
        <FileDropzone
          accept={SPREADSHEET}
          title={t.workspace.dropTitle}
          hint={t.workspace.dropHint}
          onFiles={(files) => void loadFile(files)}
        />
        <button
          type="button"
          onClick={loadSample}
          className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:border-cyan-500/40"
        >
          {t.workspace.loadSample}
        </button>
        {error && <p className="text-sm text-amber-200/90">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 block text-sm text-gray-300">{t.workspace.qrNameColumn}</span>
            <select
              value={nameColumn}
              onChange={(event) => setNameColumn(Number(event.target.value))}
              className={selectClass}
              disabled={width === 0}
            >
              {columnOptions.map((option) => (
                <option key={option.index} value={option.index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-sm text-gray-300">{t.workspace.qrCodeColumn}</span>
            <select
              value={codeColumn}
              onChange={(event) => setCodeColumn(Number(event.target.value))}
              className={selectClass}
              disabled={width === 0}
            >
              {columnOptions.map((option) => (
                <option key={option.index} value={option.index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-200">{t.workspace.qrFormatLabel}</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("qr")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium",
                mode === "qr"
                  ? "bg-cyan-500 text-gray-950"
                  : "border border-gray-700 text-gray-200",
              )}
            >
              {t.workspace.qrFormatQr}
            </button>
            <button
              type="button"
              onClick={() => setMode("barcode")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium",
                mode === "barcode"
                  ? "bg-cyan-500 text-gray-950"
                  : "border border-gray-700 text-gray-200",
              )}
            >
              {t.workspace.qrFormatBarcode}
            </button>
          </div>
        </fieldset>

        <button
          type="button"
          disabled={table.rows.length === 0 || busy}
          onClick={() => void generate()}
          className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-cyan-400 disabled:opacity-50"
        >
          {busy ? t.workspace.qrGenerating : t.workspace.qrGenerate}
        </button>

        {items.length > 0 && (
          <section className="min-w-0">
            <h2 className="mb-3 text-sm font-semibold text-white">{t.workspace.qrPreviewTitle}</h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.slice(0, 24).map((item) => (
                <li
                  key={`${item.code}-${item.label}`}
                  className="rounded-2xl border border-gray-800 bg-gray-900/70 p-3"
                >
                  <img
                    src={item.dataUrl}
                    alt={item.code}
                    className="mx-auto max-h-40 w-full object-contain rounded-lg bg-white p-2"
                  />
                  <p className="mt-2 truncate text-xs font-medium text-white">{item.label}</p>
                  <p className="truncate text-xs text-gray-500">{item.code}</p>
                </li>
              ))}
            </ul>
            {items.length > 24 && (
              <p className="mt-2 text-xs text-gray-500">
                +{items.length - 24} …
              </p>
            )}
          </section>
        )}

        <button
          type="button"
          disabled={items.length === 0}
          onClick={() =>
            requestDownload(
              () => {
                const html = buildCodeGalleryHtml(items, t.workspace.qrPreviewTitle);
                downloadCodeGallery("puretable-codes", html);
              },
              t.workspace.qrDownloadGallery,
            )
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:border-cyan-500/40 disabled:opacity-50 sm:w-auto"
        >
          {t.workspace.qrDownloadGallery}
        </button>
        {modal as ReactNode}
      </div>
    </ToolShell>
  );
}
