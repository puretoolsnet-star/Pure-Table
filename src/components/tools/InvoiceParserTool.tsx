"use client";

import { Receipt } from "lucide-react";
import { useMemo, useState } from "react";

import { ExportBar } from "@/components/tools/ExportBar";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import { parseInvoice } from "@/lib/table/parse-invoice";
import { INVOICE_SAMPLE_EN, INVOICE_SAMPLE_UK } from "@/lib/table/samples";

const fieldClass =
  "glass-card min-h-56 w-full resize-y rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/50";

export function InvoiceParserTool() {
  const { t, locale } = useI18n();
  const [text, setText] = useState("");

  const parsed = useMemo(
    () =>
      parseInvoice(text, {
        item: t.workspace.colItem,
        qty: t.workspace.colQty,
        price: t.workspace.colPrice,
        amount: t.workspace.colAmount,
        field: t.workspace.colField,
        value: t.workspace.colValue,
      }),
    [text, t],
  );

  const ready = parsed.rows.length > 0 || parsed.meta.length > 0;
  const sheets = [
    ...(parsed.meta.length
      ? [
          {
            name: t.workspace.sheetDetails,
            headers: [t.workspace.colField, t.workspace.colValue],
            rows: parsed.meta.map((field) => [field.label, field.value]),
          },
        ]
      : []),
    {
      name: t.workspace.sheetItems,
      headers: parsed.headers,
      rows: parsed.rows,
    },
  ];

  return (
    <ToolShell toolId="invoice-parser" icon={Receipt}>
      <div className="space-y-5">
        <label className="block min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-200">{t.workspace.pasteLabel}</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t.workspace.pastePlaceholder}
            className={fieldClass}
          />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setText(locale === "uk" ? INVOICE_SAMPLE_UK : INVOICE_SAMPLE_EN)}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            {t.workspace.loadSample}
          </button>
          <button
            type="button"
            onClick={() => setText("")}
            className="rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            {t.workspace.clear}
          </button>
        </div>
        {parsed.meta.length > 0 && (
          <TablePreview
            title={t.workspace.metaTitle}
            headers={[t.workspace.colField, t.workspace.colValue]}
            rows={parsed.meta.map((field) => [field.label, field.value])}
            emptyLabel={t.workspace.emptyPreview}
          />
        )}
        <TablePreview
          title={`${t.workspace.itemsTitle} · ${t.workspace.rowCount(parsed.rows.length)}`}
          headers={parsed.headers}
          rows={parsed.rows}
          emptyLabel={t.workspace.emptyPreview}
        />
        <ExportBar filename="puretable-invoice" sheets={sheets} ready={ready} />
      </div>
    </ToolShell>
  );
}
