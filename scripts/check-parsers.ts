import { cleanTable, formatAmount, formatPhone } from "../src/lib/table/clean";
import { parseInvoice } from "../src/lib/table/parse-invoice";
import { CLEAN_SAMPLE, INVOICE_SAMPLE_UK, TEXT_SAMPLE } from "../src/lib/table/samples";
import { textToTable } from "../src/lib/table/split-text";

const invoice = parseInvoice(INVOICE_SAMPLE_UK, {
  item: "Найменування",
  qty: "Кількість",
  price: "Ціна",
  amount: "Сума",
  field: "Поле",
  value: "Значення",
});

if (invoice.rows.length !== 3) {
  throw new Error(`Expected 3 invoice rows, got ${invoice.rows.length}: ${JSON.stringify(invoice.rows)}`);
}
if (!invoice.meta.some((field) => field.label.includes("Постачальник"))) {
  throw new Error(`Missing seller meta: ${JSON.stringify(invoice.meta)}`);
}
if (invoice.rows[0][0] !== "Папір А4" || !invoice.rows[0].includes("1 200,00")) {
  throw new Error(`Bad first row: ${JSON.stringify(invoice.rows[0])}`);
}

const text = textToTable(TEXT_SAMPLE, { delimiter: "semicolon", header: true });
if (text.headers[0] !== "Name" || text.rows.length !== 4 || text.headers.length !== 4) {
  throw new Error(`Bad text table: ${JSON.stringify(text)}`);
}

const cleaned = cleanTable(
  textToTable(CLEAN_SAMPLE, { delimiter: "semicolon", header: true }),
  { trim: true, collapseSpaces: true, dropEmpty: true, dedupe: true, phones: true, amounts: true },
);

if (cleaned.table.rows.length !== 3) {
  throw new Error(`Expected 3 cleaned rows, got ${cleaned.table.rows.length}: ${JSON.stringify(cleaned.table.rows)}`);
}
if (cleaned.stats.duplicates < 1) {
  throw new Error(`Duplicates not removed: ${JSON.stringify(cleaned.stats)}`);
}
if (!cleaned.table.rows.some((row) => row.some((cell) => cell.startsWith("+380")))) {
  throw new Error(`Phone not formatted: ${JSON.stringify(cleaned.table.rows)}`);
}

const phone = formatPhone("067 111 22 33");
if (phone !== "+380 67 111 22 33") throw new Error(`Phone ${phone}`);
const amount = formatAmount("1 250,50 ₴");
if (amount !== "1 250.50 ₴") throw new Error(`Amount ${amount}`);

console.log("parsers ok", {
  invoiceRows: invoice.rows.length,
  meta: invoice.meta.length,
  cleaned: cleaned.table.rows.length,
  stats: cleaned.stats,
});
