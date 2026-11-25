"use client";

import { ClipboardPaste, FileSpreadsheet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EditableOcrTable } from "@/components/tools/EditableOcrTable";
import { ExportBar } from "@/components/tools/ExportBar";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";
import { TEXT_SAMPLE_BY_LOCALE } from "@/lib/table/samples";
import { detectDelimiter, textToTable } from "@/lib/table/split-text";
import type { DelimiterId, ParsedTable } from "@/lib/table/types";

const fieldClass =
  "glass-card min-h-[min(16rem,40dvh)] w-full max-w-full resize-y rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-primary/50 sm:text-sm";

const emptyTable: ParsedTable = { headers: [], rows: [] };

export function TextToExcelTool() {
  const { t, locale } = useI18n();
  const [text, setText] = useState("");
  const [delimiter, setDelimiter] = useState<DelimiterId>("auto");
  const [header, setHeader] = useState(true);
  const [pasteError, setPasteError] = useState("");
  const [table, setTable] = useState<ParsedTable>(emptyTable);

  const delimiterOptions: Array<{ id: DelimiterId; label: string }> = [
    { id: "auto", label: t.workspace.delimiterAuto },
    { id: "tab", label: t.workspace.delimiterTab },
    { id: "comma", label: t.workspace.delimiterComma },
    { id: "semicolon", label: t.workspace.delimiterSemicolon },
    { id: "pipe", label: t.workspace.delimiterPipe },
    { id: "space", label: t.workspace.delimiterSpace },
  ];

  const parsed = useMemo(
    () =>
      textToTable(text, {
        delimiter,
        header,
        columnLabel: t.workspace.columnLabel,
      }),
    [text, delimiter, header, t],
  );

  const effectiveDelimiter = useMemo(() => {
    if (delimiter !== "auto") return delimiter;
    if (!text.trim()) return null;
    return detectDelimiter(text);
  }, [text, delimiter]);

  const effectiveLabel =
    effectiveDelimiter &&
    delimiterOptions.find((option) => option.id === effectiveDelimiter)?.label;

  useEffect(() => {
    setTable({ headers: parsed.headers, rows: parsed.rows });
  }, [parsed]);

  async function pasteFromClipboard() {
    setPasteError("");
    try {
      const clip = await navigator.clipboard.readText();
      setText(clip);
    } catch {
      setPasteError(t.workspace.invoicePasteFailed);
    }
  }

  function loadSample() {
    setPasteError("");
    setText(TEXT_SAMPLE_BY_LOCALE[locale]);
    setDelimiter("semicolon");
    setHeader(true);
  }

  return (
    <ToolShell toolId="text-to-excel" icon={FileSpreadsheet}>
      <div className="min-w-0 space-y-5">
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-200">{t.workspace.pasteLabel}</span>
          <textarea
            value={text}
            onChange={(event) => {
              setPasteError("");
              setText(event.target.value);
            }}
            placeholder={t.workspace.pastePlaceholder}
            className={fieldClass}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </label>

        <section className="min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            {t.workspace.delimiterLabel}
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.workspace.delimiterLabel}>
            {delimiterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setDelimiter(option.id)}
                className={cn(
                  "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  delimiter === option.id
                    ? "border-primary/60 bg-primary/15 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-500",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {delimiter === "auto" && effectiveLabel && (
            <p className="mt-2 text-xs text-slate-500">
              {t.workspace.textToExcelDetectedDelimiter(effectiveLabel)}
            </p>
          )}
        </section>

        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={header}
            onChange={(event) => setHeader(event.target.checked)}
            className="h-5 w-5 shrink-0 accent-primary"
          />
          {t.workspace.firstRowHeader}
        </label>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => void pasteFromClipboard()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            <ClipboardPaste className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {t.workspace.invoicePasteClipboard}
          </button>
          <button
            type="button"
            onClick={loadSample}
            className="min-h-11 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            {t.workspace.loadSample}
          </button>
          <button
            type="button"
            onClick={() => {
              setPasteError("");
              setText("");
            }}
            className="min-h-11 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            {t.workspace.clear}
          </button>
        </div>

        {pasteError && <p className="text-sm text-amber-200/90">{pasteError}</p>}

        <EditableOcrTable
          title={`${t.workspace.previewTitle} · ${t.workspace.rowCount(table.rows.length)}`}
          hint={t.workspace.textToExcelEditHint}
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
          filename="puretable-text"
          sheets={[{ name: t.workspace.sheetItems, headers: table.headers, rows: table.rows }]}
          ready={table.rows.length > 0}
          xlsxLabel={t.workspace.textToExcelDownloadXlsx}
          csvLabel={t.workspace.textToExcelDownloadCsv}
        />
      </div>
    </ToolShell>
  );
}