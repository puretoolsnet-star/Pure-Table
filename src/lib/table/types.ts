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

export type CleanStats = {
  trimmed: number;
  emptyRows: number;
  duplicates: number;
  phones: number;
  amounts: number;
};

export type CleanOptions = {
  trim: boolean;
  collapseSpaces: boolean;
  dropEmpty: boolean;
  dedupe: boolean;
  phones: boolean;
  amounts: boolean;
};
