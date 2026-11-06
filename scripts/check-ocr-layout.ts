import { wordsToTable } from "../src/lib/table/ocr-layout";

const table = wordsToTable(
  [
    { text: "Item", x0: 20, y0: 10, x1: 90, y1: 28 },
    { text: "Qty", x0: 220, y0: 10, x1: 270, y1: 28 },
    { text: "Amount", x0: 360, y0: 10, x1: 460, y1: 28 },
    { text: "A4", x0: 20, y0: 48, x1: 50, y1: 66 },
    { text: "paper", x0: 58, y0: 48, x1: 130, y1: 66 },
    { text: "10", x0: 220, y0: 48, x1: 250, y1: 66 },
    { text: "48.00", x0: 360, y0: 48, x1: 430, y1: 66 },
    { text: "Pens", x0: 20, y0: 86, x1: 80, y1: 104 },
    { text: "24", x0: 220, y0: 86, x1: 250, y1: 104 },
    { text: "27.60", x0: 360, y0: 86, x1: 430, y1: 104 },
  ],
  (index) => `Column ${index}`,
);

if (table.rows.length !== 3) {
  throw new Error(`rows ${table.rows.length} ${JSON.stringify(table)}`);
}
if (table.headers.length !== 3) {
  throw new Error(`cols ${JSON.stringify(table.headers)}`);
}
if (table.rows[1][0] !== "A4 paper" || table.rows[1][1] !== "10" || table.rows[1][2] !== "48.00") {
  throw new Error(`row ${JSON.stringify(table.rows[1])}`);
}

const sparse = wordsToTable(
  [
    { text: "Item", x0: 20, y0: 10, x1: 90, y1: 28 },
    { text: "Qty", x0: 220, y0: 10, x1: 270, y1: 28 },
    { text: "Amount", x0: 360, y0: 10, x1: 460, y1: 28 },
    { text: "Pens", x0: 20, y0: 48, x1: 80, y1: 66 },
    { text: "27.60", x0: 360, y0: 48, x1: 430, y1: 66 },
  ],
  (index) => `Column ${index}`,
);

if (sparse.rows[1]?.[0] !== "Pens" || sparse.rows[1]?.[1] !== "" || sparse.rows[1]?.[2] !== "27.60") {
  throw new Error(`sparse ${JSON.stringify(sparse)}`);
}

console.log("ocr layout ok", table.rows);
