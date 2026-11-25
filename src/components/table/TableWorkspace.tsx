"use client";

import { ArrowLeft, RotateCcw, RotateCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { EditableOcrTable } from "@/components/tools/EditableOcrTable";
import { FileDropzone } from "@/components/tools/FileDropzone";
import { TablePreview } from "@/components/tools/TablePreview";
import { PrivacyBanner } from "@/components/layout/PrivacyBanner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TableStudioCategoryNav, type StudioCategory } from "@/components/table/TableStudioCategoryNav";
import { TableStudioExportPanel } from "@/components/table/TableStudioExportPanel";
import { useI18n } from "@/i18n/context";
import { useTableHistory } from "@/hooks/use-table-history";
import { cleanTable } from "@/lib/table/clean";
import { readSpreadsheet } from "@/lib/table/read-file";
import { TEXT_SAMPLE } from "@/lib/table/samples";
import { textToTable } from "@/lib/table/split-text";
import {
  applyPrefixSuffix,
  applyTextCaseToTable,
  fillEmptyCells,
  filterTableRowsByColumn,
  findReplaceInTable,
  findSearchMatches,
  removeRowsMatching,
  type ColumnScope,
} from "@/lib/table/transform";
import { DEFAULT_CLEAN_OPTIONS, type CleanOptions, type DelimiterId, type ParsedTable } from "@/lib/table/types";
import { PageSeoSection } from "@/components/seo/PageSeoSection";
import { useLocalizedPath } from "@/lib/i18n/use-localized-path";
import { usePageSeoContent } from "@/lib/i18n/use-page-seo-content";
import { cn } from "@/lib/cn";

const SPREADSHEET =
  ".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

const fieldClass =
  "w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/50";

const selectClass =
  "w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50";

const EMPTY: ParsedTable = { headers: [], rows: [] };

function tableWidth(table: ParsedTable): number {
  return Math.max(table.headers.length, table.rows.reduce((m, row) => Math.max(m, row.length), 0), 0);
}

function clampIndex(index: number, width: number): number {
  if (width <= 0) return 0;
  return Math.max(0, Math.min(index, width - 1));
}

export function TableWorkspace() {
  const { t } = useI18n();
  const href = useLocalizedPath();
  const seoContent = usePageSeoContent("table");

  const { table, commit, replace, undo, redo, canUndo, canRedo, reset } = useTableHistory(EMPTY);
  const [category, setCategory] = useState<StudioCategory>("import");
  const [paste, setPaste] = useState("");
  const [delimiter, setDelimiter] = useState<DelimiterId>("auto");
  const [header, setHeader] = useState(true);
  const [importError, setImportError] = useState("");
  const [search, setSearch] = useState("");
  const [searchColumn, setSearchColumn] = useState<number | "all">("all");
  const [searchFilterOnly, setSearchFilterOnly] = useState(false);
  const [matchPointer, setMatchPointer] = useState(0);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [bulkScope, setBulkScope] = useState<ColumnScope | "all">("all");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [fillValue, setFillValue] = useState("");
  const [sqlTableName, setSqlTableName] = useState("puretable_data");
  const [cleanStats, setCleanStats] = useState("");

  const [cleanOptions, setCleanOptions] = useState<CleanOptions>({
    ...DEFAULT_CLEAN_OPTIONS,
    trim: true,
    collapseSpaces: true,
    dropEmpty: true,
    dedupe: false,
    dedupeByColumn: false,
    dedupeColumn: 0,
    phones: false,
    amounts: false,
  });

  const width = useMemo(() => tableWidth(table), [table]);
  const columnScope = useMemo((): ColumnScope => {
    if (bulkScope === "all") return "all";
    return clampIndex(bulkScope as number, width);
  }, [bulkScope, width]);
  const searchScope = useMemo((): ColumnScope => {
    if (searchColumn === "all") return "all";
    return clampIndex(searchColumn, width);
  }, [searchColumn, width]);

  const columnOptions = useMemo(
    () =>
      Array.from({ length: Math.max(width, 1) }, (_, index) => ({
        index,
        label: table.headers[index]?.trim() || t.workspace.columnLabel(index + 1),
      })),
    [width, table.headers, t],
  );

  const categoryLabels: Record<StudioCategory, string> = {
    import: t.tableStudio.categories.importData,
    clean: t.tableStudio.categories.clean,
    search: t.tableStudio.categories.search,
    bulk: t.tableStudio.categories.bulkEdit,
    export: t.tableStudio.categories.exportData,
  };

  const delimiterOptions: Array<{ id: DelimiterId; label: string }> = [
    { id: "auto", label: t.workspace.delimiterAuto },
    { id: "tab", label: t.workspace.delimiterTab },
    { id: "comma", label: t.workspace.delimiterComma },
    { id: "semicolon", label: t.workspace.delimiterSemicolon },
    { id: "pipe", label: t.workspace.delimiterPipe },
    { id: "space", label: t.workspace.delimiterSpace },
  ];

  const matches = useMemo(
    () => findSearchMatches(table, search, searchScope),
    [table, search, searchScope],
  );

  const displayTable = useMemo(() => {
    if (!search.trim() || !searchFilterOnly) return table;
    return filterTableRowsByColumn(table, search, searchScope);
  }, [table, search, searchFilterOnly, searchScope]);

  const importFromPaste = useCallback(() => {
    const parsed = textToTable(paste, {
      delimiter,
      header,
      columnLabel: t.workspace.columnLabel,
    });
    reset(parsed);
    setSearch("");
    setCleanStats("");
    setImportError(parsed.rows.length === 0 ? t.workspace.emptyPreview : "");
  }, [paste, delimiter, header, t, reset]);

  const loadSample = useCallback(() => {
    setPaste(TEXT_SAMPLE);
    setDelimiter("semicolon");
    setHeader(true);
    const parsed = textToTable(TEXT_SAMPLE, {
      delimiter: "semicolon",
      header: true,
      columnLabel: t.workspace.columnLabel,
    });
    reset(parsed);
    setSearch("");
    setCleanStats("");
    setImportError("");
  }, [t, reset]);

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
        const { table: parsed } = await readSpreadsheet(file, t.workspace.columnLabel);
        if (parsed.headers.length === 0 && parsed.rows.length === 0) {
          setImportError(t.workspace.parseFailed);
          return;
        }
        reset(parsed);
        setPaste("");
        setSearch("");
        setCleanStats("");
      } catch {
        setImportError(t.workspace.parseFailed);
      }
    },
    [t, reset],
  );

  const applyClean = useCallback(() => {
    const opts: CleanOptions = {
      ...cleanOptions,
      dedupeColumn: clampIndex(cleanOptions.dedupeColumn, width),
      phoneColumn: clampIndex(cleanOptions.phoneColumn, width),
      amountColumn: clampIndex(cleanOptions.amountColumn, width),
    };
    const { table: cleaned, stats } = cleanTable(table, opts);
    replace(cleaned);
    const hasChanges =
      stats.trimmed > 0 ||
      stats.emptyRows > 0 ||
      stats.duplicates > 0 ||
      stats.phones > 0 ||
      stats.amounts > 0;
    setCleanStats(hasChanges ? t.workspace.dataCleanerStats(stats) : t.workspace.dataCleanerStatsNone);
  }, [table, cleanOptions, width, replace, t]);

  const applyFindReplace = useCallback(() => {
    if (!findText) return;
    replace(findReplaceInTable(table, findText, replaceText, columnScope));
    setCleanStats("");
  }, [findText, replaceText, table, columnScope, replace]);

  const applyCase = useCallback(
    (mode: "upper" | "lower" | "title") => {
      replace(applyTextCaseToTable(table, mode, columnScope));
      setCleanStats("");
    },
    [table, columnScope, replace],
  );

  const applyPrefixSuffixAction = useCallback(() => {
    if (!prefix && !suffix) return;
    replace(applyPrefixSuffix(table, prefix, suffix, columnScope));
  }, [table, prefix, suffix, columnScope, replace]);

  const applyFill = useCallback(() => {
    replace(fillEmptyCells(table, fillValue, columnScope));
  }, [table, fillValue, columnScope, replace]);

  const applyRemoveMatching = useCallback(() => {
    const needle = findText || search;
    if (!needle) return;
    replace(removeRowsMatching(table, needle, columnScope));
  }, [findText, search, table, columnScope, replace]);

  const ready = table.rows.length > 0;
  const exportSheets = useMemo(
    () => [{ name: t.workspace.sheetItems, headers: table.headers, rows: table.rows }],
    [table, t.workspace.sheetItems],
  );

  const matchTotal = matches.length;
  const matchCurrent = matchTotal > 0 ? (matchPointer % matchTotal) + 1 : 0;

  const previewTitle = `${t.workspace.previewTitle} · ${t.workspace.rowCount(displayTable.rows.length)}`;

  return (
    <div className="puretable-page-shell relative flex min-h-dvh w-full min-w-0 flex-1 flex-col overflow-x-hidden bg-gray-950 font-sans text-gray-100">
      <SiteHeader maxWidth="6xl" />
      <header className="relative z-10 mx-auto w-full min-w-0 max-w-6xl px-4 pt-2 sm:px-6 md:px-8">
        <Link
          href={href("/")}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t.common.backToTools}
        </Link>
        <PrivacyBanner variant="compact" className="mt-4" />
        <div className="mt-6 max-w-3xl min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
            {t.tableStudio.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">{t.tableStudio.description}</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full min-w-0 max-w-6xl flex-1 flex-col gap-6 px-4 pb-[max(4rem,env(safe-area-inset-bottom))] pt-8 sm:px-6 md:px-8 md:pb-16">
        <TableStudioCategoryNav
          active={category}
          onChange={setCategory}
          labels={categoryLabels}
          ariaLabel={t.tableStudio.categoryNavAria}
        />

        <div
          className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/30 p-4 sm:p-5"
          aria-label={t.tableStudio.toolbarAria}
        >
          {category === "import" && (
            <div className="min-w-0 space-y-4">
              <p className="text-xs leading-relaxed text-slate-500">{t.tableStudio.importHint}</p>
              <FileDropzone
                accept={SPREADSHEET}
                multiple={false}
                title={t.workspace.dropTitle}
                hint={t.workspace.dropHint}
                onFiles={(list) => void onFiles(list)}
              />
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-medium text-slate-200">{t.workspace.pasteLabel}</span>
                <textarea
                  value={paste}
                  onChange={(event) => setPaste(event.target.value)}
                  placeholder={t.workspace.pastePlaceholder}
                  className={cn(fieldClass, "min-h-36 resize-y")}
                />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="min-w-0 flex-1">
                  <span className="mb-2 block text-sm text-slate-300">{t.workspace.delimiterLabel}</span>
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
                <label className="inline-flex min-h-11 items-center gap-2 pb-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={header}
                    onChange={(event) => setHeader(event.target.checked)}
                    className="h-5 w-5 accent-primary"
                  />
                  {t.workspace.firstRowHeader}
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={importFromPaste}
                  className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  {t.tableStudio.parsePasted}
                </button>
                <button type="button" onClick={loadSample} className="min-h-11 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200">
                  {t.workspace.loadSample}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset(EMPTY);
                    setPaste("");
                    setSearch("");
                    setCleanStats("");
                    setImportError("");
                  }}
                  className="min-h-11 rounded-xl border border-slate-800 px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  {t.workspace.clear}
                </button>
              </div>
              {importError && <p className="text-sm text-amber-200/90">{importError}</p>}
            </div>
          )}

          {category === "clean" && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm text-slate-200 sm:grid-cols-2">
                {(
                  [
                    ["trim", t.workspace.trimSpaces],
                    ["collapseSpaces", t.workspace.collapseSpaces],
                    ["dropEmpty", t.workspace.dropEmpty],
                    ["dedupe", t.workspace.removeDuplicates],
                    ["dedupeByColumn", t.tableStudio.cleanDedupeColumn],
                    ["phones", t.workspace.formatPhones],
                    ["amounts", t.workspace.formatAmounts],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="inline-flex min-h-10 items-center gap-3 rounded-lg border border-slate-800/80 px-3 py-2">
                    <input
                      type="checkbox"
                      checked={cleanOptions[key]}
                      onChange={(event) =>
                        setCleanOptions((current) => ({ ...current, [key]: event.target.checked }))
                      }
                      className="h-4 w-4 accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>
              {cleanOptions.dedupeByColumn && (
                <label className="block max-w-md min-w-0">
                  <span className="mb-2 block text-xs text-slate-400">{t.workspace.dataCleanerDedupeColumn}</span>
                  <select
                    value={clampIndex(cleanOptions.dedupeColumn, columnOptions.length)}
                    onChange={(e) => setCleanOptions((c) => ({ ...c, dedupeColumn: Number(e.target.value) }))}
                    className={selectClass}
                  >
                    {columnOptions.map((option) => (
                      <option key={option.index} value={option.index}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                type="button"
                disabled={!ready}
                onClick={applyClean}
                className="min-h-11 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-white disabled:opacity-50"
              >
                {t.tableStudio.applyClean}
              </button>
              {cleanStats && <p className="text-sm text-primary/90">{cleanStats}</p>}
            </div>
          )}

          {category === "search" && (
            <div className="space-y-4">
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-medium text-slate-200">{t.tableStudio.searchLabel}</span>
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setMatchPointer(0);
                  }}
                  placeholder={t.tableStudio.searchPlaceholder}
                  className={fieldClass}
                  type="search"
                  autoComplete="off"
                />
              </label>
              <label className="block max-w-md min-w-0">
                <span className="mb-2 block text-xs text-slate-400">{t.tableStudio.bulkScopeLabel}</span>
                <select
                  value={searchColumn === "all" ? "all" : searchColumn}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchColumn(v === "all" ? "all" : Number(v));
                    setMatchPointer(0);
                  }}
                  className={selectClass}
                >
                  <option value="all">{t.tableStudio.searchColumnAll}</option>
                  {columnOptions.map((option) => (
                    <option key={option.index} value={option.index}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inline-flex min-h-11 items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={searchFilterOnly}
                  onChange={(e) => setSearchFilterOnly(e.target.checked)}
                  className="h-5 w-5 accent-primary"
                />
                {t.tableStudio.searchFilterOnly}
              </label>
              {search && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <span>
                    {matchTotal > 0
                      ? t.tableStudio.searchMatchNav(matchCurrent, matchTotal)
                      : t.tableStudio.searchNoMatches}
                  </span>
                  {matchTotal > 0 && !searchFilterOnly && (
                    <>
                      <button
                        type="button"
                        onClick={() => setMatchPointer((p) => (p - 1 + matchTotal) % matchTotal)}
                        className="min-h-9 rounded-lg border border-slate-700 px-3 text-xs font-medium text-slate-200"
                      >
                        {t.tableStudio.searchPrevMatch}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchPointer((p) => (p + 1) % matchTotal)}
                        className="min-h-9 rounded-lg border border-slate-700 px-3 text-xs font-medium text-slate-200"
                      >
                        {t.tableStudio.searchNextMatch}
                      </button>
                    </>
                  )}
                  {searchFilterOnly && table.rows.length > 0 && (
                    <span className="text-xs">
                      {t.tableStudio.searchSummary(displayTable.rows.length, table.rows.length)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {category === "bulk" && (
            <div className="space-y-4">
              <label className="block max-w-md min-w-0">
                <span className="mb-2 block text-xs text-slate-400">{t.tableStudio.bulkScopeLabel}</span>
                <select
                  value={bulkScope === "all" ? "all" : bulkScope}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBulkScope(v === "all" ? "all" : Number(v));
                  }}
                  className={selectClass}
                >
                  <option value="all">{t.tableStudio.searchColumnAll}</option>
                  {columnOptions.map((option) => (
                    <option key={option.index} value={option.index}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs font-medium text-slate-400">{t.tableStudio.findLabel}</span>
                  <input
                    value={findText}
                    onChange={(event) => setFindText(event.target.value)}
                    placeholder={t.tableStudio.findPlaceholder}
                    className={fieldClass}
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs font-medium text-slate-400">{t.tableStudio.replaceLabel}</span>
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
                disabled={!findText || !ready}
                onClick={applyFindReplace}
                className="min-h-11 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-white hover:bg-primary/20 disabled:opacity-50"
              >
                {t.tableStudio.applyReplace}
              </button>
              <div className="flex flex-wrap gap-2">
                {(["upper", "lower", "title"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    disabled={!ready}
                    onClick={() => applyCase(mode)}
                    className="min-h-10 rounded-lg border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 disabled:opacity-50"
                  >
                    {mode === "upper"
                      ? t.tableStudio.caseUpper
                      : mode === "lower"
                        ? t.tableStudio.caseLower
                        : t.tableStudio.caseTitle}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs text-slate-400">{t.tableStudio.bulkPrefix}</span>
                  <input value={prefix} onChange={(e) => setPrefix(e.target.value)} className={fieldClass} />
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs text-slate-400">{t.tableStudio.bulkSuffix}</span>
                  <input value={suffix} onChange={(e) => setSuffix(e.target.value)} className={fieldClass} />
                </label>
              </div>
              <button
                type="button"
                disabled={!ready || (!prefix && !suffix)}
                onClick={applyPrefixSuffixAction}
                className="min-h-10 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:opacity-50"
              >
                {t.tableStudio.bulkApplyPrefixSuffix}
              </button>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block min-w-0">
                  <span className="mb-1 block text-xs text-slate-400">{t.tableStudio.bulkFillValue}</span>
                  <input value={fillValue} onChange={(e) => setFillValue(e.target.value)} className={fieldClass} />
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!ready}
                  onClick={applyFill}
                  className="min-h-10 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 disabled:opacity-50"
                >
                  {t.tableStudio.bulkApplyFill}
                </button>
                <button
                  type="button"
                  disabled={!ready || !(findText || search)}
                  onClick={applyRemoveMatching}
                  className="min-h-10 rounded-xl border border-amber-900/50 px-4 py-2 text-sm text-amber-100/90 disabled:opacity-50"
                >
                  {t.tableStudio.bulkRemoveMatching}
                </button>
              </div>
            </div>
          )}

          {category === "export" && (
            <div className="space-y-4">
              <label className="block min-w-0">
                <span className="mb-2 block text-sm font-medium text-slate-200">{t.tableStudio.sqlTableName}</span>
                <input
                  value={sqlTableName}
                  onChange={(event) => setSqlTableName(event.target.value)}
                  placeholder={t.tableStudio.sqlTablePlaceholder}
                  className={fieldClass}
                />
              </label>
              <TableStudioExportPanel
                filename="puretable-studio"
                sheets={exportSheets}
                ready={ready}
                rowCount={table.rows.length}
                sqlTableName={sqlTableName}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!canUndo}
            onClick={undo}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-200 disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {t.tableStudio.undo}
          </button>
          <button
            type="button"
            disabled={!canRedo}
            onClick={redo}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-sm text-slate-200 disabled:opacity-40"
          >
            <RotateCw className="h-4 w-4" aria-hidden />
            {t.tableStudio.redo}
          </button>
        </div>

        {searchFilterOnly && search.trim() ? (
          <TablePreview
            title={previewTitle}
            headers={displayTable.headers}
            rows={displayTable.rows}
            emptyLabel={t.tableStudio.searchNoMatches}
            mobileScrollHint={t.tableStudio.mobileScrollHint}
            variant="studio"
          />
        ) : (
          <EditableOcrTable
            title={`${t.workspace.previewTitle} · ${t.workspace.rowCount(table.rows.length)}`}
            hint={t.tableStudio.editTableHint}
            mobileScrollHint={t.tableStudio.mobileScrollHint}
            headers={table.headers}
            rows={table.rows}
            emptyLabel={t.workspace.emptyPreview}
            addRowLabel={t.workspace.ocrAddRow}
            addColumnLabel={t.workspace.ocrAddColumn}
            removeRowLabel={t.workspace.ocrRemoveRow}
            removeColumnLabel={t.workspace.ocrRemoveColumn}
            columnLabel={t.workspace.columnLabel}
            onChange={(next) => commit(next)}
          />
        )}

        <PageSeoSection content={seoContent} />
      </main>
    </div>
  );
}