import type { EcosystemProjectId } from "@/lib/ecosystem";

export const TOOL_IDS = [
  "image-to-table",
  "invoice-parser",
  "text-to-excel",
  "merge-tables",
  "margin-calculator",
  "currency-converter",
  "price-diff",
  "data-cleaner",
  "qr-generator",
] as const;

export type ToolId = (typeof TOOL_IDS)[number];

export type ToolCopy = {
  title: string;
  description: string;
  hint: string;
};

export type Dictionary = {
  brand: { name: string; tagline: string };
  nav: { selectLanguage: string; menuAria: string; menuClose: string };
  ecosystem: {
    menuLabel: string;
    menuShort: string;
    menuAria: string;
    menuHint: string;
    activeHere: string;
    current: string;
    comingSoon: string;
    close: string;
    items: Record<EcosystemProjectId, { name: string; tagline: string }>;
  };
  security: {
    badge: string;
    badgeShort: string;
    bannerTitle: string;
    bannerBody: string;
    pointLocal: string;
    pointNoUpload: string;
    pointPrivate: string;
    toolNote: string;
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    tableStudioTitle: string;
    tableStudioCta: string;
    tableStudioHint: string;
    proToolsTitle: string;
    proToolsCta: string;
    proToolsHint: string;
    toolsHeading: string;
    toolsAria: string;
    openTool: string;
  };
  proHub: {
    badge: string;
    title: string;
    description: string;
    toolsHeading: string;
    openTool: string;
    backToHub: string;
  };
  tableStudio: {
    title: string;
    description: string;
    toolbarAria: string;
    categories: {
      importData: string;
      editClean: string;
      filtersSearch: string;
      exportConvert: string;
    };
    importHint: string;
    parsePasted: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchSummary: (visible: number, total: number) => string;
    findLabel: string;
    replaceLabel: string;
    findPlaceholder: string;
    replacePlaceholder: string;
    applyReplace: string;
    caseUpper: string;
    caseLower: string;
    caseTitle: string;
    applyClean: string;
    dedupeNow: string;
    downloadMd: string;
    downloadSql: string;
    downloadHtml: string;
    largeExportHint: string;
    mobileScrollHint: string;
    sqlTableName: string;
    sqlTablePlaceholder: string;
  };
  rewardedAd: {
    sponsored: string;
    title: string;
    message: string;
    watch: string;
    watching: string;
    download: string;
    waitHint: string;
    progress: (seconds: number) => string;
    thanks: string;
    close: string;
    slotLabel: string;
  };
  toolAd: { sponsored: string; slotTitle: string; slotHint: string };
  common: { backToTools: string };
  tools: Record<ToolId, ToolCopy>;
  workspace: {
    pasteLabel: string;
    pastePlaceholder: string;
    loadSample: string;
    clear: string;
    rowCount: (count: number) => string;
    emptyPreview: string;
    previewTitle: string;
    downloadCsv: string;
    downloadXlsx: string;
    firstRowHeader: string;
    delimiterLabel: string;
    delimiterAuto: string;
    delimiterTab: string;
    delimiterComma: string;
    delimiterSemicolon: string;
    delimiterPipe: string;
    delimiterSpace: string;
    metaTitle: string;
    itemsTitle: string;
    columnLabel: (index: number) => string;
    dropTitle: string;
    dropHint: string;
    remove: string;
    alignHeaders: string;
    stackRows: string;
    sourceColumn: string;
    includeSource: string;
    needTwoFiles: string;
    trimSpaces: string;
    collapseSpaces: string;
    dropEmpty: string;
    removeDuplicates: string;
    formatPhones: string;
    formatAmounts: string;
    cleanedTitle: string;
    statsLine: (stats: {
      trimmed: number;
      emptyRows: number;
      duplicates: number;
      phones: number;
      amounts: number;
    }) => string;
    nothingToExport: string;
    parseFailed: string;
    unsupportedFile: string;
    pasteMode: string;
    fileMode: string;
    sheetDetails: string;
    sheetItems: string;
    colItem: string;
    colQty: string;
    colPrice: string;
    colAmount: string;
    colField: string;
    colValue: string;
    ocrDropTitle: string;
    ocrDropHint: string;
    ocrRecognizing: string;
    ocrProgress: (percent: number) => string;
    ocrEmpty: string;
    ocrFailed: string;
    ocrUnsupported: string;
    ocrPreparing: string;
    ocrSample: string;
    ocrDownloadXlsx: string;
    ocrDownloadCsv: string;
    marginBuyColumn: string;
    marginSellColumn: string;
    marginQtyColumn: string;
    marginQtyOptional: string;
    marginModeMarkup: string;
    marginModeMargin: string;
    marginPercentLabel: string;
    marginInputPreview: string;
    marginResultPreview: string;
    marginSample: string;
    marginEmpty: string;
    marginInvalidPercent: string;
    colBuy: string;
    colSell: string;
    colCostTotal: string;
    colRevenue: string;
    colProfit: string;
    colMarginPct: string;
    colMarkupPct: string;
    marginTotalsRow: string;
    currencyColumnLabel: string;
    currencyRateLabel: string;
    currencyConvertedHeader: string;
    currencyInputPreview: string;
    currencyResultPreview: string;
    currencySample: string;
    currencyEmpty: string;
    currencyInvalidRate: string;
    priceDiffSourceA: string;
    priceDiffSourceB: string;
    priceDiffKeyColumn: string;
    priceDiffLeftPriceColumn: string;
    priceDiffRightKeyColumn: string;
    priceDiffRightPriceColumn: string;
    priceDiffEmpty: string;
    colPriceOld: string;
    colPriceNew: string;
    colPriceDelta: string;
    colPriceDeltaPct: string;
    dataCleanerApply: string;
    qrNameColumn: string;
    qrCodeColumn: string;
    qrFormatLabel: string;
    qrFormatQr: string;
    qrFormatBarcode: string;
    qrGenerate: string;
    qrGenerating: string;
    qrDownloadGallery: string;
    qrPreviewTitle: string;
    qrEmpty: string;
    qrFailed: string;
  };
};
