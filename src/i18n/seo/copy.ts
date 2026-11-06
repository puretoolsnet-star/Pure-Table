import type { Locale } from "@/i18n/locales";
import type { ToolId } from "@/i18n/types";

export type SeoPageId = "home" | ToolId;

export type SeoCopy = {
  title: string;
  description: string;
  keywords: string[];
};

const home: Record<Locale, SeoCopy> = {
  uk: {
    title: "PureTable — накладні, OCR і прайси в Excel локально",
    description:
      "Шість інструментів у браузері: OCR чеків, парсер накладних, текст за роздільниками, злиття файлів, калькулятор маржі й конвертер валютних цін. Усе без відправки на сервер.",
    keywords: ["Excel онлайн", "CSV", "OCR чек", "маржа", "валюта в Excel", "PureTable"],
  },
  en: {
    title: "PureTable — invoices, OCR, and pricing in Excel",
    description:
      "Six local tools: receipt OCR, invoice parsing, delimiter splits, file merge, margin calculator, and currency price conversion. No server upload.",
    keywords: ["invoice to Excel", "receipt OCR", "margin calculator", "currency table", "PureTable"],
  },
  de: {
    title: "PureTable — Rechnungen, OCR und Preise in Excel",
    description:
      "Sechs lokale Tools: Beleg-OCR, Rechnungsparser, Trennzeichen, Zusammenführen, Margenrechner und Währungsumrechnung. Kein Server-Upload.",
    keywords: ["Rechnung zu Excel", "Beleg OCR", "Marge", "Währung Excel", "PureTable"],
  },
  fr: {
    title: "PureTable — factures, OCR et prix dans Excel",
    description:
      "Six outils locaux : OCR de reçus, analyse de factures, délimiteurs, fusion, calcul de marge et conversion de devises. Aucun envoi serveur.",
    keywords: ["facture Excel", "OCR reçu", "marge", "devise tableau", "PureTable"],
  },
  es: {
    title: "PureTable — facturas, OCR y precios en Excel",
    description:
      "Seis herramientas locales: OCR de recibos, análisis de facturas, delimitadores, fusión, margen y conversión de divisas. Sin subir archivos.",
    keywords: ["factura Excel", "OCR recibo", "margen", "divisa tabla", "PureTable"],
  },
  pl: {
    title: "PureTable — faktury, OCR i ceny w Excelu",
    description:
      "Sześć narzędzi lokalnych: OCR paragonów, parser faktur, separatory, scalanie, marża i przeliczanie walut. Bez wysyłania na serwer.",
    keywords: ["faktura Excel", "OCR paragon", "marża", "waluta w tabeli", "PureTable"],
  },
};

const tools: Record<ToolId, Record<Locale, SeoCopy>> = {
  "image-to-table": {
    uk: {
      title: "Фото чека в Excel — OCR локально",
      description:
        "Розпізнайте таблицю з фотографії чека, квитанції чи накладної у браузері. JPG і PNG не відправляються на сервер.",
      keywords: ["OCR чек", "фото в Excel", "скан накладної", "PureTable"],
    },
    en: {
      title: "Photo to Excel — local OCR",
      description:
        "Extract a table from a receipt, invoice, or scan photo in your browser. JPG and PNG stay on your device.",
      keywords: ["receipt OCR", "photo to Excel", "scan to CSV", "PureTable"],
    },
    de: {
      title: "Foto zu Excel — lokale OCR",
      description:
        "Tabelle aus einem Beleg- oder Rechnungsfoto im Browser auslesen. JPG und PNG bleiben auf dem Gerät.",
      keywords: ["Beleg OCR", "Foto zu Excel", "Scan zu CSV", "PureTable"],
    },
    fr: {
      title: "Photo vers Excel — OCR local",
      description:
        "Extrayez un tableau depuis la photo d’un reçu ou d’une facture dans le navigateur. Le fichier reste sur l’appareil.",
      keywords: ["OCR reçu", "photo vers Excel", "scan CSV", "PureTable"],
    },
    es: {
      title: "Foto a Excel — OCR local",
      description:
        "Extrae una tabla desde la foto de un recibo o factura en el navegador. JPG y PNG no se suben.",
      keywords: ["OCR recibo", "foto a Excel", "escaneo CSV", "PureTable"],
    },
    pl: {
      title: "Zdjęcie do Excel — lokalne OCR",
      description:
        "Odczytaj tabelę ze zdjęcia paragonu lub faktury w przeglądarce. JPG i PNG zostają na urządzeniu.",
      keywords: ["OCR paragon", "zdjęcie do Excel", "skan CSV", "PureTable"],
    },
  },
  "invoice-parser": {
    uk: {
      title: "Парсер накладних у Excel — PureTable",
      description:
        "Вставте текст рахунку чи накладної й отримайте таблицю позицій. Розбір і файл Excel/CSV створюються локально у браузері.",
      keywords: ["парсер накладних", "рахунок у Excel", "чек у CSV", "PureTable"],
    },
    en: {
      title: "Invoice parser to Excel — PureTable",
      description:
        "Paste invoice or receipt text and get a line-item table. Parsing and the Excel/CSV file stay in your browser.",
      keywords: ["invoice parser", "receipt to Excel", "invoice to CSV", "PureTable"],
    },
    de: {
      title: "Rechnungsparser nach Excel — PureTable",
      description:
        "Rechnungstext einfügen und eine Positionstabelle erhalten. Parsing und Excel/CSV bleiben im Browser.",
      keywords: ["Rechnungsparser", "Beleg zu Excel", "PureTable"],
    },
    fr: {
      title: "Analyseur de factures vers Excel — PureTable",
      description:
        "Collez une facture et obtenez un tableau de lignes. L’analyse et le fichier Excel/CSV restent dans le navigateur.",
      keywords: ["analyseur de factures", "facture Excel", "PureTable"],
    },
    es: {
      title: "Analizador de facturas a Excel — PureTable",
      description:
        "Pega el texto de una factura y obtén la tabla de líneas. El análisis y el Excel/CSV se quedan en el navegador.",
      keywords: ["analizador de facturas", "factura a Excel", "PureTable"],
    },
    pl: {
      title: "Parser faktur do Excel — PureTable",
      description:
        "Wklej tekst faktury i odbierz tabelę pozycji. Parsowanie oraz plik Excel/CSV zostają w przeglądarce.",
      keywords: ["parser faktur", "faktura do Excel", "PureTable"],
    },
  },
  "text-to-excel": {
    uk: {
      title: "Текст у Excel — конвертер колонок | PureTable",
      description:
        "Розіб’є текстовий блок на рядки й колонки та збереже Excel або CSV. Обробка повністю на вашому пристрої.",
      keywords: ["текст у Excel", "текст у CSV", "конвертер таблиць", "PureTable"],
    },
    en: {
      title: "Text to Excel converter — PureTable",
      description:
        "Split a text block into rows and columns, then save Excel or CSV. Processing stays on your device.",
      keywords: ["text to Excel", "text to CSV", "column splitter", "PureTable"],
    },
    de: {
      title: "Text zu Excel — PureTable",
      description:
        "Textblock in Zeilen und Spalten teilen und als Excel oder CSV speichern. Verarbeitung auf Ihrem Gerät.",
      keywords: ["Text zu Excel", "Text zu CSV", "PureTable"],
    },
    fr: {
      title: "Texte vers Excel — PureTable",
      description:
        "Découpez un bloc de texte en lignes et colonnes, puis enregistrez un Excel ou un CSV. Traitement local.",
      keywords: ["texte vers Excel", "texte en CSV", "PureTable"],
    },
    es: {
      title: "Texto a Excel — PureTable",
      description:
        "Divide un bloque de texto en filas y columnas y guarda Excel o CSV. El proceso es local.",
      keywords: ["texto a Excel", "texto a CSV", "PureTable"],
    },
    pl: {
      title: "Tekst do Excel — PureTable",
      description:
        "Podziel blok tekstu na wiersze i kolumny, a potem zapisz Excel lub CSV. Przetwarzanie zostaje na urządzeniu.",
      keywords: ["tekst do Excel", "tekst do CSV", "PureTable"],
    },
  },
  "merge-tables": {
    uk: {
      title: "Об’єднати CSV і Excel локально — PureTable",
      description:
        "Злийте кілька таблиць CSV або Excel в один файл у браузері. Колонки вирівнюються за заголовками, файли не залишають пристрій.",
      keywords: ["об’єднати CSV", "злиття Excel", "merge spreadsheet", "PureTable"],
    },
    en: {
      title: "Merge CSV and Excel locally — PureTable",
      description:
        "Combine several CSV or Excel tables into one file in the browser. Headers can be aligned. Files never leave the device.",
      keywords: ["merge CSV", "combine Excel", "spreadsheet merge", "PureTable"],
    },
    de: {
      title: "CSV und Excel lokal zusammenführen — PureTable",
      description:
        "Mehrere CSV- oder Excel-Tabellen im Browser zu einer Datei vereinen. Dateien verlassen das Gerät nicht.",
      keywords: ["CSV zusammenführen", "Excel vereinen", "PureTable"],
    },
    fr: {
      title: "Fusionner CSV et Excel localement — PureTable",
      description:
        "Réunissez plusieurs tableaux CSV ou Excel en un fichier dans le navigateur. Les fichiers restent sur l’appareil.",
      keywords: ["fusionner CSV", "combiner Excel", "PureTable"],
    },
    es: {
      title: "Unir CSV y Excel en local — PureTable",
      description:
        "Combina varias tablas CSV o Excel en un archivo dentro del navegador. Los archivos no salen del dispositivo.",
      keywords: ["unir CSV", "combinar Excel", "PureTable"],
    },
    pl: {
      title: "Scal CSV i Excel lokalnie — PureTable",
      description:
        "Połącz kilka tabel CSV lub Excel w jeden plik w przeglądarce. Pliki nie opuszczają urządzenia.",
      keywords: ["scal CSV", "połącz Excel", "PureTable"],
    },
  },
  "margin-calculator": {
    uk: {
      title: "Калькулятор маржі та прайс-лист у Excel — PureTable",
      description:
        "Обчисліть маржу, націнку й прибуток за колонками закупівлі та продажу. Експорт Excel/CSV лише у браузері.",
      keywords: ["маржа", "націнка", "прайс Excel", "PureTable"],
    },
    en: {
      title: "Margin calculator & Excel price list — PureTable",
      description:
        "Compute markup, margin, and profit from buy and sell columns. Export Excel or CSV entirely in the browser.",
      keywords: ["margin calculator", "markup Excel", "price list", "PureTable"],
    },
    de: {
      title: "Marge und Preisliste in Excel — PureTable",
      description:
        "Berechnen Sie Aufschlag, Marge und Gewinn aus Einkaufs- und Verkaufsspalten. Export nur im Browser.",
      keywords: ["Margenrechner", "Preisliste Excel", "PureTable"],
    },
    fr: {
      title: "Calculateur de marge et liste de prix Excel — PureTable",
      description:
        "Calculez marge, marque et profit à partir des colonnes d’achat et de vente. Export Excel local.",
      keywords: ["marge Excel", "liste de prix", "PureTable"],
    },
    es: {
      title: "Calculadora de margen y lista de precios — PureTable",
      description:
        "Calcula margen, recargo y beneficio desde columnas de compra y venta. Exporta Excel en el navegador.",
      keywords: ["margen Excel", "lista de precios", "PureTable"],
    },
    pl: {
      title: "Kalkulator marży i cennik w Excelu — PureTable",
      description:
        "Oblicz marżę, narzut i zysk z kolumn zakupu i sprzedaży. Eksport tylko w przeglądarce.",
      keywords: ["marża Excel", "cennik", "PureTable"],
    },
  },
  "currency-converter": {
    uk: {
      title: "Конвертер валютних цін у таблиці — PureTable",
      description:
        "Перемножте колонку цін на заданий курс і збережіть результат у Excel. Обробка лише на пристрої.",
      keywords: ["курс валют", "ціни Excel", "конвертація", "PureTable"],
    },
    en: {
      title: "Currency price converter for spreadsheets — PureTable",
      description:
        "Multiply a price column by your exchange rate and export Excel. All processing stays local.",
      keywords: ["currency Excel", "exchange rate table", "PureTable"],
    },
    de: {
      title: "Währungsumrechner für Tabellenpreise — PureTable",
      description:
        "Multiplizieren Sie eine Preisspalte mit Ihrem Kurs und exportieren Sie Excel. Verarbeitung lokal.",
      keywords: ["Wechselkurs Excel", "Preisumrechnung", "PureTable"],
    },
    fr: {
      title: "Conversion de prix devises dans un tableau — PureTable",
      description:
        "Multipliez une colonne de prix par votre taux et exportez Excel. Traitement local.",
      keywords: ["taux de change Excel", "prix devises", "PureTable"],
    },
    es: {
      title: "Conversor de precios por tipo de cambio — PureTable",
      description:
        "Multiplica una columna de precios por tu tipo de cambio y exporta Excel. Todo local.",
      keywords: ["tipo de cambio Excel", "precios divisa", "PureTable"],
    },
    pl: {
      title: "Przelicznik walut w tabeli — PureTable",
      description:
        "Pomnóż kolumnę cen przez kurs i zapisz Excel. Przetwarzanie tylko lokalne.",
      keywords: ["kurs walut Excel", "ceny", "PureTable"],
    },
  },
};

export function getSeoCopy(page: SeoPageId, locale: Locale): SeoCopy {
  if (page === "home") return home[locale];
  return tools[page][locale];
}
