"use client";

import { GitCompare } from "lucide-react";
import { useMemo, useState } from "react";

import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import { comparePriceTables } from "@/lib/table/price-diff";
import { readSpreadsheet } from "@/lib/table/read-file";
import type { ParsedTable } from "@/lib/table/types";

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function columnOptions(headers: string[], columnLabel: (index: number) => string) {
  const width = Math.max(headers.length, 1);
  return Array.from({ length: width }, (_, index) => ({
    index,
    label: headers[index]?.trim() || columnLabel(index + 1),
  }));
}

export function PriceDiffTool() {
  const { t } = useI18n();
  const [left, setLeft] = useState<ParsedTable>({ headers: [], rows: [] });
  const [right, setRight] = useState<ParsedTable>({ headers: [], rows: [] });
  const [error, setError] = useState("");
  const [keyColumn, setKeyColumn] = useState(0);
  const [leftPriceColumn, setLeftPriceColumn] = useState(1);
  const [rightKeyColumn, setRightKeyColumn] = useState(0);
  const [rightPriceColumn, setRightPriceColumn] = useState(1);

  async function loadSide(side: "left" | "right", file: File) {
    setError("");
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
      setError(t.workspace.unsupportedFile);
      return;
    }
    try {
      const table = await readSpreadsheet(file, t.workspace.columnLabel);
      if (table.headers.length === 0 && table.rows.length === 0) {
        setError(t.workspace.parseFailed);
        return;
      }
      if (side === "left") setLeft(table);
      else setRight(table);
    } catch {
      setError(t.workspace.parseFailed);
    }
  }

  const diff = useMemo(
    () =>
      comparePriceTables(left, right, {
        keyColumn,
        leftPriceColumn,
        rightKeyColumn,
        rightPriceColumn,
        productHeader: t.workspace.colItem,
        priceLeftHeader: t.workspace.colPriceOld,
        priceRightHeader: t.workspace.colPriceNew,
        diffHeader: t.workspace.colPriceDelta,
        pctHeader: t.workspace.colPriceDeltaPct,
      }),
    [left, right, keyColumn, leftPriceColumn, rightKeyColumn, rightPriceColumn, t],
  );

  const leftCols = columnOptions(left.headers, t.workspace.columnLabel);
  const rightCols = columnOptions(right.headers, t.workspace.columnLabel);
  const ready = left.rows.length > 0 && right.rows.length > 0 && diff.rows.length > 0;

  const selectClass =
    "w-full rounded-xl border border-gray-800 bg-gray-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500/50";

  return (
    <ToolShell toolId="price-diff" icon={GitCompare}>
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <fieldset className="space-y-3">
            <p className="text-sm font-semibold text-white">{t.workspace.priceDiffSourceA}</p>
            <FileDropzone
              accept={SPREADSHEET}
              title={t.workspace.dropTitle}
              hint={t.workspace.dropHint}
              onFiles={(files) => {
                const file = files[0];
                if (file) void loadSide("left", file);
              }}
            />
          </fieldset>
          <fieldset className="space-y-3">
            <p className="text-sm font-semibold text-white">{t.workspace.priceDiffSourceB}</p>
            <FileDropzone
              accept={SPREADSHEET}
              title={t.workspace.dropTitle}
              hint={t.workspace.dropHint}
              onFiles={(files) => {
                const file = files[0];
                if (file) void loadSide("right", file);
              }}
            />
          </fieldset>
        </div>
        {error && <p className="text-sm text-amber-200/90">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-2 block text-sm text-gray-300">{t.workspace.priceDiffKeyColumn}</span>
            <select
              value={keyColumn}
              onChange={(event) => setKeyColumn(Number(event.target.value))}
              className={selectClass}
              disabled={left.headers.length === 0}
            >
              {leftCols.map((option) => (
                <option key={option.index} value={option.index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-sm text-gray-300">{t.workspace.priceDiffLeftPriceColumn}</span>
            <select
              value={leftPriceColumn}
              onChange={(event) => setLeftPriceColumn(Number(event.target.value))}
              className={selectClass}
              disabled={left.headers.length === 0}
            >
              {leftCols.map((option) => (
                <option key={option.index} value={option.index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-sm text-gray-300">{t.workspace.priceDiffRightKeyColumn}</span>
            <select
              value={rightKeyColumn}
              onChange={(event) => setRightKeyColumn(Number(event.target.value))}
              className={selectClass}
              disabled={right.headers.length === 0}
            >
              {rightCols.map((option) => (
                <option key={option.index} value={option.index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-2 block text-sm text-gray-300">{t.workspace.priceDiffRightPriceColumn}</span>
            <select
              value={rightPriceColumn}
              onChange={(event) => setRightPriceColumn(Number(event.target.value))}
              className={selectClass}
              disabled={right.headers.length === 0}
            >
              {rightCols.map((option) => (
                <option key={option.index} value={option.index}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TablePreview
          title={`${t.workspace.previewTitle} · ${t.workspace.rowCount(diff.rows.length)}`}
          headers={diff.headers}
          rows={diff.rows}
          emptyLabel={t.workspace.priceDiffEmpty}
          mobileScrollHint={t.tableStudio.mobileScrollHint}
          variant="studio"
        />
        <ExportBar
          filename="puretable-price-diff"
          sheets={[{ name: t.workspace.sheetItems, headers: diff.headers, rows: diff.rows }]}
          ready={ready}
          note={!ready && left.rows.length && right.rows.length ? t.workspace.priceDiffEmpty : undefined}
        />
      </div>
    </ToolShell>
  );
}
