"use client";

import { Barcode } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import type { Locale } from "@/i18n/locales";
import { cn } from "@/lib/cn";
import { readSpreadsheet } from "@/lib/table/read-file";
import { QR_SAMPLE_BY_LOCALE } from "@/lib/table/samples";
import { textToTable } from "@/lib/table/split-text";
import {
  buildCodeGalleryHtml,
  buildCodeItems,
  downloadCodeGallery,
  downloadCodeZip,
  type CodeBuildResult,
  type CodeItem,
  type CodeSkipReason,
  type QrCodeMode,
} from "@/lib/table/qr-gallery";
import type { ParsedTable } from "@/lib/table/types";

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const PREVIEW_LIMIT = 36;

function clampIndex(index: number, width: number): number {
  if (width <= 0) return 0;
  return Math.max(0, Math.min(index, width - 1));
}

const pasteClass =
  "glass-card min-h-[min(10rem,28dvh)] w-full max-w-full resize-y rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-primary/50 sm:text-sm";

const selectClass =
  "w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50 disabled:opacity-50";

export function QrGeneratorTool() {
  const { t, locale } = useI18n();
  const [table, setTable] = useState<ParsedTable>({ headers: [], rows: [] });
  const [paste, setPaste] = useState("");
  const [useNameColumn, setUseNameColumn] = useState(true);
  const [nameColumn, setNameColumn] = useState(0);
  const [codeColumn, setCodeColumn] = useState(1);
  const [mode, setMode] = useState<QrCodeMode>("qr");
  const [result, setResult] = useState<CodeBuildResult | null>(null);
  const [showAllPreview, setShowAllPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
        setError(t.workspace.unsupportedFile);
        return;
      }
      try {
        const { table: parsed } = await readSpreadsheet(file, t.workspace.columnLabel);
        if (parsed.headers.length === 0 && parsed.rows.length === 0) {
          setError(t.workspace.parseFailed);
          return;
        }
        setTable(parsed);
        setPaste("");
        setResult(null);
      } catch {
        setError(t.workspace.parseFailed);
      }
    },
    [t],
  );

  const parsePaste = useCallback(() => {
    const parsed = textToTable(paste, {
      delimiter: "auto",
      header: true,
      columnLabel: t.workspace.columnLabel,
    });
    setTable(parsed);
    setResult(null);
    setError(parsed.rows.length === 0 ? t.workspace.emptyPreview : "");
  }, [paste, t]);

  const loadSample = useCallback(() => {
    const raw = QR_SAMPLE_BY_LOCALE[locale as Locale];
    setPaste(raw);
    const parsed = textToTable(raw, {
      delimiter: "semicolon",
      header: true,
      columnLabel: t.workspace.columnLabel,
    });
    setTable(parsed);
    setResult(null);
    setNameColumn(0);
    setCodeColumn(1);
    setUseNameColumn(true);
    setError("");
  }, [locale, t]);

  const skipLabel = useCallback(
    (reason: CodeSkipReason): string => {
      switch (reason) {
        case "empty":
          return t.workspace.qrSkipEmpty;
        case "invalid-barcode":
          return t.workspace.qrSkipInvalidBarcode;
        case "render-failed":
          return t.workspace.qrSkipFailed;
      }
    },
    [t],
  );

  const generate = useCallback(async () => {
    setBusy(true);
    setError("");
    setShowAllPreview(false);
    try {
      const next = await buildCodeItems(table, {
        nameColumn: useNameColumn ? clampIndex(nameColumn, width) : null,
        codeColumn: clampIndex(codeColumn, width),
        mode,
      });
      setResult(next);
      if (next.items.length === 0) {
        setError(
          next.skipped.length > 0 && mode === "barcode"
            ? t.workspace.qrEmptyBarcode
            : t.workspace.qrEmpty,
        );
      }
    } catch {
      setError(t.workspace.qrFailed);
      setResult(null);
    } finally {
      setBusy(false);
    }
  }, [table, useNameColumn, nameColumn, codeColumn, mode, width, t]);

  const items: CodeItem[] = result?.items ?? [];
  const previewItems = showAllPreview ? items : items.slice(0, PREVIEW_LIMIT);

  return (
    <ToolShell toolId="qr-generator" icon={Barcode}>
      <div className="min-w-0 space-y-5">
        <p className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm leading-relaxed text-slate-400">
          {t.workspace.qrLocalHint}
        </p>

        <FileDropzone
          accept={SPREADSHEET}
          multiple={false}
          title={t.workspace.dropTitle}
          hint={t.workspace.dropHint}
          onFiles={(files) => void loadFile(files)}
        />

        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-200">{t.workspace.pasteLabel}</span>
          <textarea
            value={paste}
            onChange={(event) => setPaste(event.target.value)}
            placeholder={t.workspace.pastePlaceholder}
            className={pasteClass}
            spellCheck={false}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={parsePaste}
            className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {t.tableStudio.parsePasted}
          </button>
          <button
            type="button"
            onClick={loadSample}
            className="min-h-11 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            {t.workspace.qrSample}
          </button>
          <button
            type="button"
            onClick={() => {
              setTable({ headers: [], rows: [] });
              setPaste("");
              setResult(null);
              setError("");
            }}
            className="min-h-11 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            {t.workspace.clear}
          </button>
        </div>

        {error && <p className="text-sm text-amber-200/90">{error}</p>}

        <TablePreview
          title={`${t.workspace.sheetItems} · ${t.workspace.rowCount(table.rows.length)}`}
          headers={table.headers}
          rows={table.rows.slice(0, 12)}
          emptyLabel={t.workspace.emptyPreview}
          mobileScrollHint={t.tableStudio.mobileScrollHint}
        />

        <fieldset className="min-w-0 space-y-3">
          <legend className="text-sm font-semibold text-white">{t.workspace.qrFormatLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["qr", t.workspace.qrFormatQr],
                ["barcode", t.workspace.qrFormatBarcode],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMode(id);
                  setResult(null);
                }}
                className={cn(
                  "min-h-11 rounded-xl border px-4 py-2 text-sm font-medium",
                  mode === id
                    ? "border-primary/60 bg-primary/15 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-500",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === "barcode" && (
            <p className="text-xs leading-relaxed text-slate-500">{t.workspace.qrCode128Hint}</p>
          )}
        </fieldset>

        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm text-slate-200 sm:col-span-2">
            <input
              type="checkbox"
              checked={useNameColumn}
              onChange={(e) => setUseNameColumn(e.target.checked)}
              className="h-5 w-5 accent-primary"
            />
            {t.workspace.qrUseNameColumn}
          </label>
          {useNameColumn && (
            <label className="block min-w-0">
              <span className="mb-2 block text-xs font-medium text-slate-400">{t.workspace.qrNameColumn}</span>
              <select
                value={clampIndex(nameColumn, columnOptions.length)}
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
          )}
          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-medium text-slate-400">{t.workspace.qrCodeColumn}</span>
            <select
              value={clampIndex(codeColumn, columnOptions.length)}
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

        <button
          type="button"
          disabled={table.rows.length === 0 || busy}
          onClick={() => void generate()}
          className="min-h-11 w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-50 sm:w-auto"
        >
          {busy ? t.workspace.qrGenerating : t.workspace.qrGenerate}
        </button>

        {result && (
          <p className="text-sm text-slate-300">
            {t.workspace.qrStats(result.stats.generated, result.stats.skipped)}
          </p>
        )}

        {items.length > 0 && (
          <section className="min-w-0">
            <h2 className="mb-3 text-sm font-semibold text-white">{t.workspace.qrPreviewTitle}</h2>
            <ul className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previewItems.map((item) => (
                <li
                  key={`${item.rowIndex}-${item.code}`}
                  className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/70 p-3"
                >
                  <div className="overflow-hidden rounded-xl bg-white p-2">
                    <img
                      src={item.dataUrl}
                      alt={item.code}
                      className="mx-auto max-h-40 w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2 truncate text-sm font-medium text-white" title={item.label}>
                    {item.label}
                  </p>
                  <p className="truncate text-xs text-slate-500" title={item.code}>
                    {item.code}
                  </p>
                </li>
              ))}
            </ul>
            {items.length > PREVIEW_LIMIT && !showAllPreview && (
              <button
                type="button"
                onClick={() => setShowAllPreview(true)}
                className="mt-3 min-h-10 text-sm font-medium text-primary hover:underline"
              >
                {t.workspace.qrShowAll(items.length)}
              </button>
            )}
          </section>
        )}

        {result && result.skipped.length > 0 && (
          <section className="min-w-0 rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4">
            <h3 className="mb-2 text-sm font-semibold text-amber-100/90">{t.workspace.qrSkippedTitle}</h3>
            <ul className="max-h-48 space-y-1 overflow-y-auto text-xs text-amber-100/80">
              {result.skipped.slice(0, 40).map((row) => (
                <li key={`skip-${row.rowIndex}`} className="min-w-0 truncate">
                  <span className="text-amber-200/60">{skipLabel(row.reason)} — </span>
                  {row.label || row.code || `#${row.rowIndex + 1}`}
                  {row.code ? ` (${row.code})` : ""}
                </li>
              ))}
            </ul>
            {result.skipped.length > 40 && (
              <p className="mt-2 text-xs text-amber-200/50">+{result.skipped.length - 40}</p>
            )}
          </section>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => {
              const html = buildCodeGalleryHtml(items, t.workspace.qrPreviewTitle);
              downloadCodeGallery("puretable-codes", html);
            }}
            className="min-h-11 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:border-primary/40 disabled:opacity-50"
          >
            {t.workspace.qrDownloadGallery}
          </button>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={() => downloadCodeZip("puretable-codes", items)}
            className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {t.workspace.qrDownloadZip}
          </button>
        </div>
      </div>
    </ToolShell>
  );
}