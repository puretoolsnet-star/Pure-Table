"use client";

import { GitMerge, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ExportBar } from "@/components/tools/ExportBar";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { ToolShell } from "@/components/tools/ToolShell";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/cn";
import { collectHeaderGroups, mergeTables, normalizeHeader, type MergeMode } from "@/lib/table/merge";
import { readSpreadsheet } from "@/lib/table/read-file";
import type { ParsedTable } from "@/lib/table/types";

type LoadedFile = {
  id: string;
  name: string;
  file: File;
  sheetName: string;
  sheetNames: string[];
  table: ParsedTable;
};

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function MergeTablesTool() {
  const { t } = useI18n();
  const [files, setFiles] = useState<LoadedFile[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<MergeMode>("align-union");
  const [includeSource, setIncludeSource] = useState(true);
  const [headerOverrides, setHeaderOverrides] = useState<Record<string, string>>({});

  const modeOptions: Array<{ id: MergeMode; label: string }> = [
    { id: "align-union", label: t.workspace.mergeModeUnion },
    { id: "align-intersection", label: t.workspace.mergeModeIntersection },
    { id: "stack", label: t.workspace.mergeModeStack },
  ];

  useEffect(() => {
    setHeaderOverrides((current) => {
      const next = { ...current };
      for (const file of files) {
        for (const header of file.table.headers) {
          const key = normalizeHeader(header);
          if (!(key in next)) next[key] = header.trim();
        }
      }
      return next;
    });
  }, [files]);

  const merged = useMemo(
    () =>
      mergeTables(
        files.map((file) => ({ name: file.name, table: file.table })),
        {
          mode,
          includeSource,
          sourceHeader: t.workspace.sourceColumn,
          headerOverrides,
        },
      ),
    [files, mode, includeSource, headerOverrides, t.workspace.sourceColumn],
  );

  const headerGroups = useMemo(
    () => collectHeaderGroups(files.map((f) => ({ name: f.name, table: f.table })), headerOverrides),
    [files, headerOverrides],
  );

  async function loadFile(file: File, sheetName?: string): Promise<LoadedFile | null> {
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
      setError(t.workspace.unsupportedFile);
      return null;
    }
    try {
      const result = await readSpreadsheet(file, t.workspace.columnLabel, sheetName);
      if (result.table.headers.length === 0 && result.table.rows.length === 0) {
        setError(t.workspace.parseFailed);
        return null;
      }
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        file,
        sheetName: result.activeSheet,
        sheetNames: result.sheetNames,
        table: result.table,
      };
    } catch {
      setError(t.workspace.parseFailed);
      return null;
    }
  }

  async function addFiles(list: File[]) {
    setError("");
    setBusy(true);
    const next: LoadedFile[] = [];
    for (const file of list) {
      const loaded = await loadFile(file);
      if (loaded) next.push(loaded);
    }
    if (next.length) setFiles((current) => [...current, ...next]);
    setBusy(false);
  }

  async function changeSheet(id: string, sheetName: string) {
    const item = files.find((file) => file.id === id);
    if (!item) return;
    setBusy(true);
    setError("");
    const loaded = await loadFile(item.file, sheetName);
    setBusy(false);
    if (!loaded) return;
    setFiles((current) =>
      current.map((file) =>
        file.id === id
          ? { ...file, sheetName: loaded.sheetName, sheetNames: loaded.sheetNames, table: loaded.table }
          : file,
      ),
    );
  }

  const previewTitle = `${t.workspace.previewTitle} · ${t.workspace.mergeFileDimensions(
    merged.rows.length,
    merged.headers.length,
  )}`;

  const showMapping = files.length >= 2 && mode !== "stack";

  return (
    <ToolShell toolId="merge-tables" icon={GitMerge}>
      <div className="min-w-0 space-y-5">
        <FileDropzone
          accept={SPREADSHEET}
          title={t.workspace.dropTitle}
          hint={t.workspace.dropHint}
          onFiles={(list) => void addFiles(list)}
        />

        {error && <p className="text-sm text-amber-200/90">{error}</p>}
        {busy && <p className="text-sm text-slate-400">{t.workspace.mergeReading}</p>}

        {files.length > 0 && (
          <section className="min-w-0">
            <ul className="min-w-0 space-y-2">
              {files.map((file, index) => (
                <li
                  key={file.id}
                  className="glass-card flex min-w-0 flex-col gap-2 rounded-xl border-slate-800 px-3 py-3 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-6 shrink-0 text-xs text-slate-500">{index + 1}</span>
                    <span className="min-w-0 flex-1 break-all text-sm text-white sm:truncate">
                      {file.name}
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">
                      {t.workspace.mergeFileDimensions(
                        file.table.rows.length,
                        file.table.headers.length,
                      )}
                    </span>
                    <button
                      type="button"
                      aria-label={t.workspace.remove}
                      onClick={() => setFiles((current) => current.filter((item) => item.id !== file.id))}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  {file.sheetNames.length > 1 && (
                    <label className="flex min-w-0 flex-col gap-1 sm:ml-8 sm:max-w-xs sm:flex-1">
                      <span className="text-xs text-slate-500">{t.workspace.mergeSheetLabel}</span>
                      <select
                        value={file.sheetName}
                        disabled={busy}
                        onChange={(event) => void changeSheet(file.id, event.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-2 text-sm text-white outline-none focus:border-primary/50"
                      >
                        {file.sheetNames.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setFiles([]);
                setError("");
              }}
              className="mt-3 min-h-10 rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-400 hover:text-white"
            >
              {t.workspace.mergeClearAll}
            </button>
          </section>
        )}

        <section className="min-w-0">
          <span className="mb-2 block text-sm font-medium text-slate-200">{t.workspace.mergeModeLabel}</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t.workspace.mergeModeLabel}>
            {modeOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                className={cn(
                  "min-h-10 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                  mode === option.id
                    ? "border-primary/60 bg-primary/15 text-white"
                    : "border-slate-700 text-slate-300 hover:border-slate-500",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={includeSource}
            onChange={(event) => setIncludeSource(event.target.checked)}
            className="h-5 w-5 shrink-0 accent-primary"
          />
          {t.workspace.includeSource}
        </label>

        {showMapping && headerGroups.length > 0 && (
          <section className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-white">{t.workspace.mergeMapTitle}</h2>
            <p className="mt-1 text-xs text-slate-500">{t.workspace.mergeMapHint}</p>
            <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto overscroll-contain">
              {headerGroups.map((group) => (
                <li
                  key={group.key}
                  className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2 sm:flex-row sm:items-center"
                >
                  <span className="min-w-0 flex-1 text-xs text-slate-500" title={group.variants.join(", ")}>
                    {group.variants.join(" · ")}
                  </span>
                  <label className="flex min-w-0 shrink-0 flex-col gap-0.5 sm:w-40">
                    <span className="text-[10px] uppercase tracking-wide text-slate-600">
                      {t.workspace.mergeUnifiedColumn}
                    </span>
                    <input
                      type="text"
                      value={headerOverrides[group.key] ?? group.canonical}
                      onChange={(event) =>
                        setHeaderOverrides((current) => ({
                          ...current,
                          [group.key]: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-white outline-none focus:border-primary/50"
                    />
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        <TablePreview
          title={previewTitle}
          headers={merged.headers}
          rows={merged.rows}
          emptyLabel={files.length < 2 ? t.workspace.needTwoFiles : t.workspace.emptyPreview}
          mobileScrollHint={t.tableStudio.mobileScrollHint}
        />

        <ExportBar
          filename="puretable-merged"
          sheets={[{ name: t.workspace.sheetItems, headers: merged.headers, rows: merged.rows }]}
          ready={files.length >= 2 && merged.rows.length > 0}
          note={files.length > 0 && files.length < 2 ? t.workspace.needTwoFiles : undefined}
          xlsxLabel={t.workspace.mergeDownloadXlsx}
          csvLabel={t.workspace.mergeDownloadCsv}
        />
      </div>
    </ToolShell>
  );
}