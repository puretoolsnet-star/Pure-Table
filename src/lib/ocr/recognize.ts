import type { Locale } from "@/i18n/locales";
import { wordsToTable, type OcrWord } from "@/lib/table/ocr-layout";
import type { ParsedTable } from "@/lib/table/types";

const LANG_BY_LOCALE: Record<Locale, string> = {
  uk: "ukr+eng",
  en: "eng",
  de: "deu+eng",
  fr: "fra+eng",
  es: "spa+eng",
  pl: "pol+eng",
};

type OcrWorker = {
  lang: string;
  recognize: (
    image: string,
    options?: object,
    output?: { blocks?: boolean; text?: boolean },
  ) => Promise<{ data: { blocks: OcrBlock[] | null } }>;
  setParameters: (params: Record<string, string>) => Promise<unknown>;
  terminate: () => Promise<unknown>;
};

type OcrBlock = {
  paragraphs?: Array<{
    lines?: Array<{
      words?: Array<{
        text: string;
        confidence: number;
        bbox: { x0: number; y0: number; x1: number; y1: number };
      }>;
    }>;
  }>;
};

let active: { lang: string; worker: OcrWorker } | null = null;
let pending: Promise<OcrWorker> | null = null;

async function getWorker(lang: string, onProgress?: (ratio: number) => void): Promise<OcrWorker> {
  if (active?.lang === lang) return active.worker;
  if (pending) {
    const worker = await pending;
    if (active?.lang === lang) return worker;
  }

  pending = (async () => {
    if (active) {
      await active.worker.terminate();
      active = null;
    }
    const { createWorker, PSM } = await import("tesseract.js");
    const worker = (await createWorker(lang, 1, {
      logger: (message) => {
        if (!onProgress) return;
        if (message.status === "recognizing text") onProgress(message.progress ?? 0);
      },
    })) as unknown as OcrWorker;
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      preserve_interword_spaces: "1",
    });
    active = { lang, worker };
    return worker;
  })();

  try {
    return await pending;
  } finally {
    pending = null;
  }
}

function collectWords(blocks: OcrBlock[] | null): OcrWord[] {
  const words: OcrWord[] = [];
  for (const block of blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        for (const word of line.words ?? []) {
          words.push({
            text: word.text,
            confidence: word.confidence,
            x0: word.bbox.x0,
            y0: word.bbox.y0,
            x1: word.bbox.x1,
            y1: word.bbox.y1,
          });
        }
      }
    }
  }
  return words;
}

export async function recognizeTable(
  image: string,
  locale: Locale,
  columnLabel: (index: number) => string,
  onProgress?: (ratio: number) => void,
): Promise<ParsedTable> {
  const worker = await getWorker(LANG_BY_LOCALE[locale], onProgress);
  const result = await worker.recognize(image, { rotateAuto: true }, { blocks: true, text: true });
  return wordsToTable(collectWords(result.data.blocks), columnLabel);
}

export async function releaseOcrWorker() {
  if (!active) return;
  const worker = active.worker;
  active = null;
  await worker.terminate();
}
