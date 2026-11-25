"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/cn";
import type { ParsedTable } from "@/lib/table/types";

const inputClass =
  "w-full min-w-[4.5rem] rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-slate-100 outline-none transition-colors hover:border-slate-700 focus:border-primary/50 focus:bg-slate-900/80";

const iconButtonClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition-colors hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40";

export function EditableOcrTable({
  title,
  hint,
  mobileScrollHint,
  headers,
  rows,
  emptyLabel,
  addRowLabel,
  addColumnLabel,
  removeRowLabel,
  removeColumnLabel,
  columnLabel,
  onChange,
}: {
  title: string;
  hint: string;
  mobileScrollHint: string;
  headers: string[];
  rows: string[][];
  emptyLabel: string;
  addRowLabel: string;
  addColumnLabel: string;
  removeRowLabel: string;
  removeColumnLabel: string;
  columnLabel: (index: number) => string;
  onChange: (next: ParsedTable) => void;
}) {
  const hasData = headers.length > 0 || rows.length > 0;

  function patchHeaders(nextHeaders: string[]) {
    const width = nextHeaders.length;
    const nextRows = rows.map((row) =>
      Array.from({ length: width }, (_, index) => row[index] ?? ""),
    );
    onChange({ headers: nextHeaders, rows: nextRows });
  }

  function patchRows(nextRows: string[][]) {
    onChange({ headers, rows: nextRows });
  }

  function updateHeader(index: number, value: string) {
    const next = [...headers];
    next[index] = value;
    patchHeaders(next);
  }

  function updateCell(rowIndex: number, colIndex: number, value: string) {
    const next = rows.map((row) => [...row]);
    const row = next[rowIndex] ?? [];
    while (row.length < headers.length) row.push("");
    row[colIndex] = value;
    next[rowIndex] = row;
    patchRows(next);
  }

  function addRow() {
    const width = Math.max(headers.length, 1);
    const nextHeaders =
      headers.length === 0
        ? Array.from({ length: width }, (_, index) => columnLabel(index + 1))
        : headers;
    if (headers.length === 0) {
      onChange({
        headers: nextHeaders,
        rows: [...rows, Array.from({ length: nextHeaders.length }, () => "")],
      });
      return;
    }
    patchRows([...rows, Array.from({ length: nextHeaders.length }, () => "")]);
  }

  function removeRow(rowIndex: number) {
    patchRows(rows.filter((_, index) => index !== rowIndex));
  }

  function addColumn() {
    const nextHeaders = [...headers, columnLabel(headers.length + 1)];
    patchHeaders(nextHeaders);
  }

  function removeColumn(colIndex: number) {
    if (headers.length <= 1) {
      onChange({ headers: [], rows: [] });
      return;
    }
    onChange({
      headers: headers.filter((_, index) => index !== colIndex),
      rows: rows.map((row) => row.filter((_, index) => index !== colIndex)),
    });
  }

  if (!hasData) {
    return (
      <div className="glass-card rounded-2xl border-dashed border-slate-800 px-4 py-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  const colCount = Math.max(headers.length, 1);

  return (
    <section className="min-w-0">
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="text-xs text-slate-500">{hint}</p>
      </div>
      <p className="mb-2 text-xs text-slate-500 sm:hidden">{mobileScrollHint}</p>
      <div className="max-w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
        <div
          className="max-h-[min(32rem,72dvh)] overflow-auto overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]"
          tabIndex={0}
          role="region"
          aria-label={title}
        >
          <table className="w-max min-w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-[1] bg-slate-900/95 backdrop-blur">
              <tr>
                <th
                  className="w-10 border-b border-slate-800 px-1 py-2 sm:w-12"
                  aria-hidden
                />
                {headers.map((header, index) => (
                  <th
                    key={`h-${index}`}
                    className="min-w-[5.5rem] border-b border-slate-800 px-1 py-2 align-bottom"
                  >
                    <div className="flex items-start gap-1">
                      <input
                        type="text"
                        value={header}
                        onChange={(event) => updateHeader(index, event.target.value)}
                        className={cn(inputClass, "font-semibold uppercase tracking-wide text-slate-300")}
                        aria-label={`${header || "header"} ${index + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeColumn(index)}
                        className={iconButtonClass}
                        aria-label={removeColumnLabel}
                        title={removeColumnLabel}
                      >
                        <Minus className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="odd:bg-white/[0.02]">
                  <td className="border-b border-slate-800/80 px-1 py-1 align-middle">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      className={iconButtonClass}
                      aria-label={removeRowLabel}
                      title={removeRowLabel}
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                  </td>
                  {Array.from({ length: colCount }, (_, colIndex) => (
                    <td
                      key={colIndex}
                      className="border-b border-slate-800/80 px-1 py-1 align-top"
                    >
                      <input
                        type="text"
                        value={row[colIndex] ?? ""}
                        onChange={(event) => updateCell(rowIndex, colIndex, event.target.value)}
                        className={inputClass}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {addRowLabel}
        </button>
        <button
          type="button"
          onClick={addColumn}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {addColumnLabel}
        </button>
      </div>
    </section>
  );
}