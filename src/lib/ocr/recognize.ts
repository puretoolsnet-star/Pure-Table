import { wordsToTable, type OcrWord } from "@/lib/table/ocr-layout";
import type { ParsedTable } from "@/lib/table/types";

export type OcrProgressPhase = "loading" | "recognizing";

type OcrWorker = {
  lang: string;
  recognize: (
    image: string,
    options?: object,
    output?: { blocks?: boolean; text?: boolean },
  ) => Promise<{ data: { blocks: OcrBlock[] | null; text: string } }>;
  setParameters: (params: Record<string, string>) => Promise<unknown>;
  terminate: () => Promise<unknown>;
};

type OcrBlock = {
  paragraphs?: Array<{
    lines?: Array<{
      text?: string;
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

let progressSink: ((phase: OcrProgressPhase, ratio: number) => void) | null = null;

const LOADING_STATUSES = new Set([
  "loading tesseract core",
  "initializing tesseract",
  "loading language traineddata",
  "initializing api",
  "downloading tesseract core",
]);

function ocrLogger(message: { status?: string; progress?: number }) {
  if (!progressSink || message.status === undefined) return;
  if (message.status === "recognizing text") {
    progressSink("recognizing", message.progress ?? 0);
    return;
  }
  if (LOADING_STATUSES.has(message.status)) {
    progressSink("loading", message.progress ?? 0);
  }
}

async function getWorker(lang: string): Promise<OcrWorker> {
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
      logger: ocrLogger,
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

function blocksToRawText(blocks: OcrBlock[] | null, fallback: string): string {
  const lines: string[] = [];
  for (const block of blocks ?? []) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        const fromWords = (line.words ?? []).map((word) => word.text).join(" ").trim();
        const text = line.text?.trim() || fromWords;
        if (text) lines.push(text);
      }
    }
  }
  const joined = lines.join("\n").trim();
  return joined || fallback.trim();
}

export type OcrRecognizeResult = {
  table: ParsedTable;
  rawText: string;
};

export async function recognizeTable(
  image: string,
  lang: string,
  columnLabel: (index: number) => string,
  onProgress?: (phase: OcrProgressPhase, ratio: number) => void,
): Promise<OcrRecognizeResult> {
  progressSink = onProgress ?? null;
  try {
    const worker = await getWorker(lang);
    const result = await worker.recognize(image, { rotateAuto: true }, { blocks: true, text: true });
    const rawText = blocksToRawText(result.data.blocks, result.data.text ?? "");
    const table = wordsToTable(collectWords(result.data.blocks), columnLabel);
    return { table, rawText };
  } finally {
    progressSink = null;
  }
}

export async function releaseOcrWorker() {
  if (!active) return;
  const worker = active.worker;
  active = null;
  await worker.terminate();
}