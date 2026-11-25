export type TableSheet = {
  name: string;
  headers: string[];
  rows: string[][];
};

export type ParsedTable = {
  headers: string[];
  rows: string[][];
};

export type DelimiterId =
  | "auto"
  | "tab"
  | "comma"
  | "semicolon"
  | "pipe"
  | "space";

export type InvoiceParse = {
  meta: Array<{ label: string; value: string }>;
  headers: string[];
  rows: string[][];
};

export type CleanColumnScope = "all" | "auto" | "column";

export type CleanStats = {
  trimmed: number;
  emptyRows: number;
  /** @deprecated use duplicatesFull + duplicatesByColumn; kept as sum for summaries */
  duplicates: number;
  duplicatesFull: number;
  duplicatesByColumn: number;
  phones: number;
  amounts: number;
};

export type CleanOptions = {
  trim: boolean;
  collapseSpaces: boolean;
  dropEmpty: boolean;
  dedupe: boolean;
  dedupeByColumn: boolean;
  dedupeColumn: number;
  phones: boolean;
  phoneScope: CleanColumnScope;
  phoneColumn: number;
  amounts: boolean;
  amountScope: CleanColumnScope;
  amountColumn: number;
};

export const DEFAULT_CLEAN_OPTIONS: CleanOptions = {
  trim: true,
  collapseSpaces: true,
  dropEmpty: true,
  dedupe: false,
  dedupeByColumn: false,
  dedupeColumn: 0,
  phones: false,
  phoneScope: "auto",
  phoneColumn: 0,
  amounts: false,
  amountScope: "auto",
  amountColumn: 0,
};
