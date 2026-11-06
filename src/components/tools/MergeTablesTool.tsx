"use client";

import { GitMerge, X } from "lucide-react";
import { useMemo, useState } from "react";

import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import { mergeTables } from "@/lib/table/merge";
import { readSpreadsheet } from "@/lib/table/read-file";
import type { ParsedTable } from "@/lib/table/types";

type LoadedFile = {
  id: string;
  name: string;
  table: ParsedTable;
};

const SPREADSHEET = ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function MergeTablesTool() {
  const { t } = useI18n();
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [error, setError] = useState("");
  const [alignHeaders, setAlignHeaders] = useState(true);
  const [includeSource, setIncludeSource] = useState(true);

  const merged = useMemo(
    () =>
      mergeTables(
        files.map((file) => ({ name: file.name, table: file.table })),
        {
          alignHeaders,
          includeSource,
          sourceHeader: t.workspace.sourceColumn,
        },
      ),
    [files, alignHeaders, includeSource, t],
  );

  async function addFiles(list: File[]) {
    setError("");
    const next: LoadedFile[] = [];
    for (const file of list) {
      if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
        setError(t.workspace.unsupportedFile);
        continue;
      }
      try {
        const table = await readSpreadsheet(file, t.workspace.columnLabel);
        if (table.headers.length === 0 && table.rows.length === 0) {
          setError(t.workspace.parseFailed);
          continue;
        }
        next.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          table,
        });
      } catch {
        setError(t.workspace.parseFailed);
      }
    }
    if (next.length) setFiles((current) => [...current, ...next]);
  }

  return (
    <ToolShell toolId="merge-tables" icon={GitMerge}>
      <div className="space-y-5">
        <FileDropzone
          accept={SPREADSHEET}
          title={t.workspace.dropTitle}
          hint={t.workspace.dropHint}
          onFiles={(list) => void addFiles(list)}
        />
        {error && <p className="text-sm text-amber-200/90">{error}</p>}
        {files.length > 0 && (
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={file.id}
                className="glass-card flex min-w-0 items-center gap-3 rounded-xl border-slate-800 px-3 py-2"
              >
                <span className="w-6 shrink-0 text-xs text-slate-500">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-white">{file.name}</span>
                <span className="shrink-0 text-xs text-slate-500">
                  {t.workspace.rowCount(file.table.rows.length)}
                </span>
                <button
                  type="button"
                  aria-label={t.workspace.remove}
                  onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-col gap-2 text-sm text-slate-200">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={alignHeaders}
              onChange={(event) => setAlignHeaders(event.target.checked)}
              className="h-4 w-4 accent-blue-500"
            />
            {t.workspace.alignHeaders}
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeSource}
              onChange={(event) => setIncludeSource(event.target.checked)}
              className="h-4 w-4 accent-blue-500"
            />
            {t.workspace.includeSource}
          </label>
        </div>
        <TablePreview
          title={`${t.workspace.previewTitle} · ${t.workspace.rowCount(merged.rows.length)}`}
          headers={merged.headers}
          rows={merged.rows}
          emptyLabel={files.length < 2 ? t.workspace.needTwoFiles : t.workspace.emptyPreview}
        />
        <ExportBar
          filename="puretable-merged"
          sheets={[{ name: t.workspace.sheetItems, headers: merged.headers, rows: merged.rows }]}
          ready={files.length >= 2 && merged.rows.length > 0}
          note={files.length > 0 && files.length < 2 ? t.workspace.needTwoFiles : undefined}
        />
      </div>
    </ToolShell>
  );
}
