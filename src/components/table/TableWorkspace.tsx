"use client";

import { ArrowLeft, PenLine, Search, Sheet, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { AdBanner } from "@/components/ads/AdBanner";
import { TableExportPanel } from "@/components/table/TableExportPanel";
import { TableToolbarSection } from "@/components/table/TableToolbarSection";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { PrivacyBanner } from "@/components/layout/PrivacyBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useI18n } from "@/i18n/context";
import { cleanTable } from "@/lib/table/clean";
import { readSpreadsheet } from "@/lib/table/read-file";
import { TEXT_SAMPLE } from "@/lib/table/samples";
import { textToTable } from "@/lib/table/split-text";
import {
  applyTextCaseToTable,
  filterTableRows,
  findReplaceInTable,
} from "@/lib/table/transform";
import type { CleanOptions, DelimiterId, ParsedTable } from "@/lib/table/types";
import { useLocalizedPath } from "@/lib/i18n/use-localized-path";
import { cn } from "@/lib/cn";

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const fieldClass =
  "w-full rounded-xl border border-gray-800 bg-gray-900/90 px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-500/50";

const EMPTY: ParsedTable = { headers: [], rows: [] };

export function TableWorkspace() {
  const { t } = useI18n();
  const href = useLocalizedPath();

  const [table, setTable] = useState<ParsedTable>(EMPTY);
  const [paste, setPaste] = useState("");
  const [delimiter, setDelimiter] = useState<DelimiterId>("auto");
  const [header, setHeader] = useState(true);
  const [importError, setImportError] = useState("");
  const [search, setSearch] = useState("");
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [sqlTableName, setSqlTableName] = useState("puretable_data");
  const [cleanStats, setCleanStats] = useState<string>("");

  const [cleanOptions, setCleanOptions] = useState<CleanOptions>({
    trim: true,
    collapseSpaces: true,
    dropEmpty: true,
    dedupe: false,
    phones: false,
    amounts: false,
  });

  const delimiterOptions: Array<{ id: DelimiterId; label: string }> = [
    { id: "auto", label: t.workspace.delimiterAuto },
    { id: "tab", label: t.workspace.delimiterTab },
    { id: "comma", label: t.workspace.delimiterComma },
    { id: "semicolon", label: t.workspace.delimiterSemicolon },
    { id: "pipe", label: t.workspace.delimiterPipe },
    { id: "space", label: t.workspace.delimiterSpace },
  ];

  const importFromPaste = useCallback(() => {
    const parsed = textToTable(paste, {
      delimiter,
      header,
      columnLabel: t.workspace.columnLabel,
    });
    setTable(parsed);
    setSearch("");
    setCleanStats("");
    setImportError(parsed.rows.length === 0 ? t.workspace.emptyPreview : "");
  }, [paste, delimiter, header, t]);

  const loadSample = useCallback(() => {
    setPaste(TEXT_SAMPLE);
    setDelimiter("semicolon");
    setHeader(true);
    const parsed = textToTable(TEXT_SAMPLE, {
      delimiter: "semicolon",
      header: true,
      columnLabel: t.workspace.columnLabel,
    });
    setTable(parsed);
    setSearch("");
    setCleanStats("");
    setImportError("");
  }, [t]);

  const onFiles = useCallback(
    async (files: File[]) => {
      setImportError("");
      const file = files[0];
      if (!file) return;
      if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
        setImportError(t.workspace.unsupportedFile);
        return;
      }
      try {
        const parsed = await readSpreadsheet(file, t.workspace.columnLabel);
        if (parsed.headers.length === 0 && parsed.rows.length === 0) {
          setImportError(t.workspace.parseFailed);
          return;
        }
        setTable(parsed);
        setPaste("");
        setSearch("");
        setCleanStats("");
      } catch {
        setImportError(t.workspace.parseFailed);
      }
    },
    [t],
  );

  const applyClean = useCallback(() => {
    const { table: cleaned, stats } = cleanTable(table, cleanOptions);
    setTable(cleaned);
    setCleanStats(t.workspace.statsLine(stats));
  }, [table, cleanOptions, t]);

  const applyFindReplace = useCallback(() => {
    if (!findText) return;
    setTable((current) => findReplaceInTable(current, findText, replaceText));
    setCleanStats("");
  }, [findText, replaceText]);

  const applyCase = useCallback((mode: "upper" | "lower" | "title") => {
    setTable((current) => applyTextCaseToTable(current, mode));
    setCleanStats("");
  }, []);

  const applyDedupeOnly = useCallback(() => {
    const { table: cleaned, stats } = cleanTable(table, {
      ...cleanOptions,
      dedupe: true,
    });
    setTable(cleaned);
    setCleanStats(t.workspace.statsLine(stats));
  }, [table, cleanOptions, t]);

  const filtered = useMemo(() => filterTableRows(table, search), [table, search]);
  const ready = filtered.rows.length > 0;
  const sheets = useMemo(
    () => [{ name: t.workspace.sheetItems, headers: filtered.headers, rows: filtered.rows }],
    [filtered, t.workspace.sheetItems],
  );

  const previewTitle = search
    ? `${t.workspace.previewTitle} · ${t.tableStudio.searchSummary(filtered.rows.length, table.rows.length)}`
    : `${t.workspace.previewTitle} · ${t.workspace.rowCount(filtered.rows.length)}`;

  return (
    <div className="puretable-page-shell puretable-cyan-shell relative flex min-h-dvh w-full min-w-0 flex-1 flex-col overflow-x-hidden bg-gray-950 font-sans text-gray-100">
      <SiteHeader maxWidth="6xl" />
      <header className="relative z-10 mx-auto w-full min-w-0 max-w-6xl px-4 pt-2 sm:px-6 md:px-8">
        <Link
          href={href("/")}
          className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-cyan-300"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.common.backToTools}
        </Link>
        <PrivacyBanner variant="compact" className="mt-4" />
        <div className="mt-6 max-w-3xl min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
            {t.tableStudio.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-400 sm:text-base">
            {t.tableStudio.description}
          </p>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col gap-6 px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-8 sm:px-6 md:px-8 md:pb-16">
        <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_min(100%,18rem)] xl:items-start">
          <div className="min-w-0 space-y-4" aria-label={t.tableStudio.toolbarAria}>
            <TableToolbarSection icon={Upload} title={t.tableStudio.categories.importData}>
              <p className="text-xs leading-relaxed text-gray-500">{t.tableStudio.importHint}</p>
              <FileDropzone
                accept={SPREADSHEET}
                title={t.workspace.dropTitle}
                hint={t.workspace.dropHint}
                onFiles={(list) => void onFiles(list)}
              />
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-medium text-gray-200">
                  {t.workspace.pasteLabel}
                </span>
                <textarea
                  value={paste}
                  onChange={(event) => setPaste(event.target.value)}
                  placeholder={t.workspace.pastePlaceholder}
                  className={cn(fieldClass, "min-h-36 resize-y")}
                />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1">
                  <span className="mb-2 block text-sm text-gray-300">{t.workspace.delimiterLabel}</span>
                  <select
                    value={delimiter}
                    onChange={(event) => setDelimiter(event.target.value as DelimiterId)}
                    className={fieldClass}
                  >
                    {delimiterOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="inline-flex items-center gap-2 pb-2 text-sm text-gray-200">
                  <input
                    type="checkbox"
                    checked={header}
                    onChange={(event) => setHeader(event.target.checked)}
                    className="h-4 w-4 accent-cyan-500"
                  />
                  {t.workspace.firstRowHeader}
                </label>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={importFromPaste}
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-cyan-400"
                >
                  {t.tableStudio.parsePasted}
                </button>
                <button
                  type="button"
                  onClick={loadSample}
                  className="rounded-xl border border-gray-700 px-4 py-2 text-sm font-medium text-gray-200 hover:border-cyan-500/40"
                >
                  {t.workspace.loadSample}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaste("");
                    setTable(EMPTY);
                    setSearch("");
                    setCleanStats("");
                    setImportError("");
                  }}
                  className="rounded-xl border border-gray-800 px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  {t.workspace.clear}
                </button>
              </div>
              {importError && <p className="text-sm text-amber-200/90">{importError}</p>}
            </TableToolbarSection>

            <TableToolbarSection icon={PenLine} title={t.tableStudio.categories.editClean}>
              <div className="grid gap-2 text-sm text-gray-200 sm:grid-cols-2">
                {(
                  [
                    ["trim", t.workspace.trimSpaces],
                    ["collapseSpaces", t.workspace.collapseSpaces],
                    ["dropEmpty", t.workspace.dropEmpty],
                    ["dedupe", t.workspace.removeDuplicates],
                    ["phones", t.workspace.formatPhones],
                    ["amounts", t.workspace.formatAmounts],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cleanOptions[key]}
                      onChange={(event) =>
                        setCleanOptions((current) => ({ ...current, [key]: event.target.checked }))
                      }
                      className="h-4 w-4 accent-cyan-500"
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  disabled={table.rows.length === 0}
                  onClick={applyClean}
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white ring-1 ring-gray-700 hover:ring-cyan-500/50 disabled:opacity-50"
                >
                  {t.tableStudio.applyClean}
                </button>
                <button
                  type="button"
                  disabled={table.rows.length === 0}
                  onClick={applyDedupeOnly}
                  title={t.workspace.removeDuplicates}
                  className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:border-cyan-500/40 disabled:opacity-50"
                >
                  {t.tableStudio.dedupeNow}
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs font-medium text-gray-400">{t.tableStudio.findLabel}</span>
                  <input
                    value={findText}
                    onChange={(event) => setFindText(event.target.value)}
                    placeholder={t.tableStudio.findPlaceholder}
                    className={fieldClass}
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs font-medium text-gray-400">
                    {t.tableStudio.replaceLabel}
                  </span>
                  <input
                    value={replaceText}
                    onChange={(event) => setReplaceText(event.target.value)}
                    placeholder={t.tableStudio.replacePlaceholder}
                    className={fieldClass}
                  />
                </label>
              </div>
              <button
                type="button"
                disabled={!findText || table.rows.length === 0}
                onClick={applyFindReplace}
                className="w-full rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/20 disabled:opacity-50 sm:w-auto"
              >
                {t.tableStudio.applyReplace}
              </button>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  disabled={table.rows.length === 0}
                  onClick={() => applyCase("upper")}
                  className="rounded-lg border border-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-cyan-500/40 disabled:opacity-50"
                >
                  {t.tableStudio.caseUpper}
                </button>
                <button
                  type="button"
                  disabled={table.rows.length === 0}
                  onClick={() => applyCase("lower")}
                  className="rounded-lg border border-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-cyan-500/40 disabled:opacity-50"
                >
                  {t.tableStudio.caseLower}
                </button>
                <button
                  type="button"
                  disabled={table.rows.length === 0}
                  onClick={() => applyCase("title")}
                  className="rounded-lg border border-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-cyan-500/40 disabled:opacity-50"
                >
                  {t.tableStudio.caseTitle}
                </button>
              </div>
              {cleanStats && <p className="text-xs text-cyan-200/80">{cleanStats}</p>}
            </TableToolbarSection>

            <TableToolbarSection icon={Search} title={t.tableStudio.categories.filtersSearch}>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-medium text-gray-200">{t.tableStudio.searchLabel}</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.tableStudio.searchPlaceholder}
                  className={fieldClass}
                  type="search"
                  autoComplete="off"
                />
              </label>
              {search && table.rows.length > 0 && (
                <p className="text-xs text-gray-500">
                  {t.tableStudio.searchSummary(filtered.rows.length, table.rows.length)}
                </p>
              )}
            </TableToolbarSection>

            <TableToolbarSection icon={Sheet} title={t.tableStudio.categories.exportConvert}>
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-medium text-gray-200">
                  {t.tableStudio.sqlTableName}
                </span>
                <input
                  value={sqlTableName}
                  onChange={(event) => setSqlTableName(event.target.value)}
                  placeholder={t.tableStudio.sqlTablePlaceholder}
                  className={fieldClass}
                />
              </label>
              <TableExportPanel
                filename="puretable-studio"
                sheets={sheets}
                ready={ready}
                rowCount={filtered.rows.length}
                sqlTableName={sqlTableName}
              />
            </TableToolbarSection>

            <TablePreview
              title={previewTitle}
              headers={filtered.headers}
              rows={filtered.rows}
              emptyLabel={t.workspace.emptyPreview}
              mobileScrollHint={t.tableStudio.mobileScrollHint}
              variant="studio"
            />
          </div>
          <AdBanner className="xl:sticky xl:top-6 xl:self-start" />
        </div>
      </main>
    </div>
  );
}
