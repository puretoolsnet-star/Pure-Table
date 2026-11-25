"use client";

import { ClipboardPaste, Receipt } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EditableOcrTable } from "@/components/tools/EditableOcrTable";
import { ExportBar } from "@/components/tools/ExportBar";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import { parseInvoice } from "@/lib/table/parse-invoice";
import { INVOICE_SAMPLE } from "@/lib/table/samples";
import type { ParsedTable } from "@/lib/table/types";

const fieldClass =
  "glass-card min-h-[min(16rem,40dvh)] w-full max-w-full resize-y rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-primary/50 sm:text-sm";

const emptyTable: ParsedTable = { headers: [], rows: [] };

export function InvoiceParserTool() {
  const { t, locale } = useI18n();
  const [text, setText] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [items, setItems] = useState<ParsedTable>(emptyTable);
  const [metaTable, setMetaTable] = useState<ParsedTable>(emptyTable);

  const labels = useMemo(
    () => ({
      item: t.workspace.colItem,
      qty: t.workspace.colQty,
      price: t.workspace.colPrice,
      amount: t.workspace.colAmount,
      field: t.workspace.colField,
      value: t.workspace.colValue,
      columnLabel: t.workspace.columnLabel,
    }),
    [t],
  );

  const parsed = useMemo(() => parseInvoice(text, labels), [text, labels]);

  useEffect(() => {
    setItems({ headers: parsed.headers, rows: parsed.rows });
    setMetaTable({
      headers: [t.workspace.colField, t.workspace.colValue],
      rows: parsed.meta.map((field) => [field.label, field.value]),
    });
  }, [parsed, t.workspace.colField, t.workspace.colValue]);

  async function pasteFromClipboard() {
    setPasteError("");
    try {
      const clip = await navigator.clipboard.readText();
      setText(clip);
    } catch {
      setPasteError(t.workspace.invoicePasteFailed);
    }
  }

  const ready = items.rows.length > 0 || metaTable.rows.length > 0;
  const sheets = [
    ...(metaTable.rows.length > 0
      ? [
          {
            name: t.workspace.sheetDetails,
            headers: metaTable.headers,
            rows: metaTable.rows,
          },
        ]
      : []),
    {
      name: t.workspace.sheetItems,
      headers: items.headers,
      rows: items.rows,
    },
  ];

  return (
    <ToolShell toolId="invoice-parser" icon={Receipt}>
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
            onClick={() => {
              setPasteError("");
              setText(INVOICE_SAMPLE[locale]);
            }}
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

        {metaTable.rows.length > 0 && (
          <EditableOcrTable
            title={t.workspace.metaTitle}
            hint={t.workspace.invoiceEditMetaHint}
            mobileScrollHint={t.tableStudio.mobileScrollHint}
            headers={metaTable.headers}
            rows={metaTable.rows}
            emptyLabel={t.workspace.emptyPreview}
            addRowLabel={t.workspace.ocrAddRow}
            addColumnLabel={t.workspace.ocrAddColumn}
            removeRowLabel={t.workspace.ocrRemoveRow}
            removeColumnLabel={t.workspace.ocrRemoveColumn}
            columnLabel={t.workspace.columnLabel}
            onChange={setMetaTable}
          />
        )}

        <EditableOcrTable
          title={`${t.workspace.itemsTitle} · ${t.workspace.rowCount(items.rows.length)}`}
          hint={t.workspace.invoiceEditItemsHint}
          mobileScrollHint={t.tableStudio.mobileScrollHint}
          headers={items.headers}
          rows={items.rows}
          emptyLabel={t.workspace.emptyPreview}
          addRowLabel={t.workspace.ocrAddRow}
          addColumnLabel={t.workspace.ocrAddColumn}
          removeRowLabel={t.workspace.ocrRemoveRow}
          removeColumnLabel={t.workspace.ocrRemoveColumn}
          columnLabel={t.workspace.columnLabel}
          onChange={setItems}
        />

        <ExportBar
          filename="puretable-invoice"
          sheets={sheets}
          ready={ready}
          xlsxLabel={t.workspace.invoiceDownloadXlsx}
          csvLabel={t.workspace.invoiceDownloadCsv}
        />
      </div>
    </ToolShell>
  );
}