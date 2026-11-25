import { isValidCode128, safeCodeFilename } from "../src/lib/table/qr-gallery";
import { textToTable } from "../src/lib/table/split-text";

const table = textToTable(
  `Name;Code
Paper;4820156671234
Cyrillic;ТЕСТ
Empty;
`,
  { delimiter: "auto", header: true },
);

if (!isValidCode128("4820156671234")) throw new Error("ASCII should pass");
if (isValidCode128("Кирилиця")) throw new Error("Cyrillic should fail");
if (isValidCode128("SKU-🙂")) throw new Error("Emoji should fail");

let wouldGenerate = 0;
let wouldSkip = 0;
for (const row of table.rows) {
  const code = (row[1] ?? "").trim();
  if (!code) wouldSkip += 1;
  else if (!isValidCode128(code)) wouldSkip += 1;
  else wouldGenerate += 1;
}
if (wouldGenerate !== 1 || wouldSkip !== 2) {
  throw new Error(`Counts gen=${wouldGenerate} skip=${wouldSkip}`);
}

const fname = safeCodeFilename("Папір А4", "SKU-1", 0, "png");
if (fname.includes("\\") || fname.includes(":")) throw new Error(`Bad fname ${fname}`);

console.log("qr ok", { wouldGenerate, wouldSkip, fname });