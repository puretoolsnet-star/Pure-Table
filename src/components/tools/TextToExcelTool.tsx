"use client";

import { FileSpreadsheet } from "lucide-react";
import { useMemo, useState } from "react";

import { ExportBar } from "@/components/tools/ExportBar";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import { TEXT_SAMPLE } from "@/lib/table/samples";
import { textToTable } from "@/lib/table/split-text";
import type { DelimiterId } from "@/lib/table/types";

const fieldClass =
  "glass-card min-h-56 w-full resize-y rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/50";

export function TextToExcelTool() {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [delimiter, setDelimiter] = useState<DelimiterId>("auto");
  const [header, setHeader] = useState(true);

  const table = useMemo(
    () =>
      textToTable(text, {
        delimiter,
        header,
        columnLabel: t.workspace.columnLabel,
      }),
    [text, delimiter, header, t],
  );

  const options: Array<{ id: DelimiterId; label: string }> = [
    { id: "auto", label: t.workspace.delimiterAuto },
    { id: "tab", label: t.workspace.delimiterTab },
    { id: "comma", label: t.workspace.delimiterComma },
    { id: "semicolon", label: t.workspace.delimiterSemicolon },
    { id: "pipe", label: t.workspace.delimiterPipe },
    { id: "space", label: t.workspace.delimiterSpace },
  ];

  return (
    <ToolShell toolId="text-to-excel" icon={FileSpreadsheet}>
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="mb-2 block text-sm text-slate-300">{t.workspace.delimiterLabel}</span>
            <select
              value={delimiter}
              onChange={(event) => setDelimiter(event.target.value as DelimiterId)}
              className="glass-card w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none"
            >
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-flex items-center gap-2 pb-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={header}
              onChange={(event) => setHeader(event.target.checked)}
              className="h-4 w-4 accent-blue-500"
            />
            {t.workspace.firstRowHeader}
          </label>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setText(TEXT_SAMPLE);
              setDelimiter("semicolon");
              setHeader(true);
            }}
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
        <TablePreview
          title={`${t.workspace.previewTitle} · ${t.workspace.rowCount(table.rows.length)}`}
          headers={table.headers}
          rows={table.rows}
          emptyLabel={t.workspace.emptyPreview}
        />
        <ExportBar
          filename="puretable-text"
          sheets={[{ name: t.workspace.sheetItems, headers: table.headers, rows: table.rows }]}
          ready={table.rows.length > 0}
        />
      </div>
    </ToolShell>
  );
}
