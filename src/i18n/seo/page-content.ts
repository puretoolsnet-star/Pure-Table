import type { Locale } from "@/i18n/locales";
import type { ToolId } from "@/i18n/types";
import { toolsPageContent } from "@/i18n/seo/page-content-tools";

export type SeoContentPageId = "home" | "pro" | "table" | ToolId;

export type PageSeoFaqItem = {
  question: string;
  answer: string;
};

export type PageSeoContent = {
  benefitsTitle: string;
  benefitsLead: string;
  benefitPoints: string[];
  faqTitle: string;
  faqs: PageSeoFaqItem[];
};

const home: Record<Locale, PageSeoContent> = {
  uk: {
    benefitsTitle: "Чому PureTable — зручний онлайн-конвертер таблиць",
    benefitsLead:
      "Фото чеків, накладні, прайси та CSV-файли перетворюються в Excel або CSV прямо у браузері. Жодних завантажень на сервер — дані залишаються на вашому пристрої.",
    benefitPoints: [
      "Дев’ять локальних інструментів: OCR, парсер накладних, злиття CSV, маржа й валюта.",
      "Студія таблиць з експортом у CSV, Excel, Markdown, SQL і HTML.",
      "Працює на ПК і телефоні — без реєстрації та встановлення.",
    ],
    faqTitle: "Часті питання",
    faqs: [
      {
        question: "Чи потрібно завантажувати файли на сервер?",
        answer:
          "Ні. Усі операції з таблицями виконуються у JavaScript на вашому пристрої. Файли не надсилаються в хмару.",
      },
      {
        question: "Які формати підтримуються?",
        answer:
          "CSV, Excel (XLSX), вставлений текст із роздільниками, а також експорт у Markdown, SQL INSERT і HTML зі студії таблиць.",
      },
      {
        question: "Чи безкоштовний PureTable?",
        answer:
          "Так. Базові інструменти безкоштовні; перед великим експортом може з’явитися короткий рекламний ролик, щоб підтримати проєкт.",
      },
      {
        question: "Чи є українська версія сайту?",
        answer:
          "Так. Оберіть мову в меню — доступні uk, en, de, fr, es і pl з коректними hreflang-посиланнями для пошуку.",
      },
    ],
  },
  en: {
    benefitsTitle: "Why PureTable is a privacy-first online table converter",
    benefitsLead:
      "Turn receipts, invoices, price lists, and CSV files into Excel or CSV entirely in your browser. Nothing is uploaded to a server — your data stays on your device.",
    benefitPoints: [
      "Nine local tools: OCR, invoice parsing, CSV merge, margin math, and currency conversion.",
      "Table studio with export to CSV, Excel, Markdown, SQL, and HTML.",
      "Works on desktop and mobile — no account or install required.",
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        question: "Do I need to upload files to a server?",
        answer:
          "No. All spreadsheet work runs in JavaScript on your device. Files are never sent to the cloud.",
      },
      {
        question: "Which formats are supported?",
        answer:
          "CSV, Excel (XLSX), pasted delimiter text, plus Markdown, SQL INSERT, and HTML export from the table studio.",
      },
      {
        question: "Is PureTable free?",
        answer:
          "Yes. Core tools are free; a short sponsored clip may appear before large exports to support the project.",
      },
      {
        question: "Is the site available in multiple languages?",
        answer:
          "Yes. Choose from six locales (including English and Ukrainian) with full hreflang alternates for search engines.",
      },
    ],
  },
  de: {
    benefitsTitle: "Warum PureTable ein lokaler Online-Tabellenkonverter ist",
    benefitsLead:
      "Belege, Rechnungen und CSV werden vollständig im Browser zu Excel oder CSV. Kein Server-Upload — Daten bleiben auf Ihrem Gerät.",
    benefitPoints: [
      "Neun lokale Tools: OCR, Rechnungsparser, CSV-Merge, Marge und Währung.",
      "Tabellen-Studio mit Export nach CSV, Excel, Markdown, SQL und HTML.",
      "Läuft auf Desktop und Mobilgerät — ohne Konto.",
    ],
    faqTitle: "Häufige Fragen",
    faqs: [
      {
        question: "Muss ich Dateien auf einen Server hochladen?",
        answer: "Nein. Die Verarbeitung erfolgt nur im Browser auf Ihrem Gerät.",
      },
      {
        question: "Welche Formate werden unterstützt?",
        answer: "CSV, XLSX, Text mit Trennzeichen sowie Markdown, SQL und HTML aus dem Studio.",
      },
      {
        question: "Ist PureTable kostenlos?",
        answer: "Ja. Kernfunktionen sind gratis; bei großen Exporten kann eine kurze Anzeige erscheinen.",
      },
      {
        question: "Gibt es mehrsprachige Seiten?",
        answer: "Ja — u. a. Deutsch und Englisch mit hreflang-Alternativen für Google.",
      },
    ],
  },
  fr: {
    benefitsTitle: "Pourquoi PureTable convertit les tableaux localement",
    benefitsLead:
      "Reçus, factures et CSV vers Excel ou CSV dans le navigateur, sans envoi serveur.",
    benefitPoints: [
      "Neuf outils locaux : OCR, analyse de factures, fusion CSV, marge et devises.",
      "Studio avec export CSV, Excel, Markdown, SQL et HTML.",
      "Ordinateur et mobile — sans inscription.",
    ],
    faqTitle: "Questions fréquentes",
    faqs: [
      {
        question: "Faut-il envoyer les fichiers sur un serveur ?",
        answer: "Non. Tout le traitement reste dans votre navigateur.",
      },
      {
        question: "Quels formats sont pris en charge ?",
        answer: "CSV, XLSX, texte délimité, plus Markdown, SQL et HTML depuis le studio.",
      },
      {
        question: "PureTable est-il gratuit ?",
        answer: "Oui. Les outils de base sont gratuits ; une courte annonce peut précéder les gros exports.",
      },
      {
        question: "Le site est-il multilingue ?",
        answer: "Oui — six langues avec balises hreflang pour le référencement.",
      },
    ],
  },
  es: {
    benefitsTitle: "Por qué PureTable convierte tablas en el navegador",
    benefitsLead:
      "Recibos, facturas y CSV a Excel o CSV sin subir archivos a ningún servidor.",
    benefitPoints: [
      "Nueve herramientas locales: OCR, facturas, fusión CSV, margen y divisas.",
      "Estudio con exportación CSV, Excel, Markdown, SQL y HTML.",
      "Escritorio y móvil — sin registro.",
    ],
    faqTitle: "Preguntas frecuentes",
    faqs: [
      {
        question: "¿Debo subir archivos a un servidor?",
        answer: "No. Todo se procesa en JavaScript en su dispositivo.",
      },
      {
        question: "¿Qué formatos admite?",
        answer: "CSV, XLSX, texto con delimitadores y exportación Markdown, SQL y HTML.",
      },
      {
        question: "¿Es gratis?",
        answer: "Sí. Las herramientas base son gratuitas; puede haber un anuncio breve antes de exportaciones grandes.",
      },
      {
        question: "¿Hay varios idiomas?",
        answer: "Sí — seis idiomas con alternativas hreflang para buscadores.",
      },
    ],
  },
  pl: {
    benefitsTitle: "Dlaczego PureTable to lokalny konwerter tabel online",
    benefitsLead:
      "Paragony, faktury i CSV do Excela lub CSV w przeglądarce — bez wysyłania plików na serwer.",
    benefitPoints: [
      "Dziewięć lokalnych narzędzi: OCR, faktury, scalanie CSV, marża i waluty.",
      "Studio z eksportem CSV, Excel, Markdown, SQL i HTML.",
      "Komputer i telefon — bez konta.",
    ],
    faqTitle: "Częste pytania",
    faqs: [
      {
        question: "Czy muszę wysyłać pliki na serwer?",
        answer: "Nie. Przetwarzanie odbywa się tylko w przeglądarce na Twoim urządzeniu.",
      },
      {
        question: "Jakie formaty są obsługiwane?",
        answer: "CSV, XLSX, tekst z separatorami oraz Markdown, SQL i HTML ze studia.",
      },
      {
        question: "Czy PureTable jest darmowy?",
        answer: "Tak. Podstawowe narzędzia są bezpłatne; przy dużym eksporcie może pojawić się krótka reklama.",
      },
      {
        question: "Czy strona jest wielojęzyczna?",
        answer: "Tak — sześć wersji językowych z hreflang dla Google.",
      },
    ],
  },
};

const pro: Record<Locale, PageSeoContent> = {
  uk: {
    benefitsTitle: "Pro-інструменти для бізнес-таблиць без хмари",
    benefitsLead:
      "Розширений набір утиліт для чеків, накладних і прайсів: OCR, парсинг, злиття, маржа, валюта, порівняння цін, очищення та QR. Усе локально.",
    benefitPoints: [
      "Кожен інструмент відкривається окремою сторінкою з власним SEO та FAQ.",
      "Один стиль роботи: вставка, файл або фото — і експорт CSV/Excel.",
      "Ідеально для бухгалтерів, закупівель і невеликих магазинів.",
    ],
    faqTitle: "FAQ про PureTable Pro",
    faqs: [
      {
        question: "Чим Pro відрізняється від студії таблиць?",
        answer:
          "Студія — універсальний редактор і конвертер. Pro — вузькі сценарії: OCR чека, парсер накладної, порівняння двох прайсів тощо.",
      },
      {
        question: "Чи можна комбінувати інструменти?",
        answer:
          "Так. Наприклад, отримайте таблицю з OCR, очистьте її в Data Cleaner і порівняйте з новим прайсом у Price diff.",
      },
      {
        question: "Чи зберігаються мої дані?",
        answer: "Ні на серверах PureTable. Після перезавантаження сторінки робоча копія зникає, якщо ви не зберегли файл.",
      },
    ],
  },
  en: {
    benefitsTitle: "Pro tools for business spreadsheets — still 100% local",
    benefitsLead:
      "Advanced utilities for receipts, invoices, and price lists: OCR, parsing, merge, margin, currency, price diff, cleaning, and QR. Everything runs in the browser.",
    benefitPoints: [
      "Each tool has its own page with tailored guidance and FAQs.",
      "Same workflow everywhere: paste, file, or photo — then export CSV or Excel.",
      "Built for accountants, purchasing teams, and small retailers.",
    ],
    faqTitle: "PureTable Pro FAQ",
    faqs: [
      {
        question: "How is Pro different from the table studio?",
        answer:
          "The studio is a general editor and converter. Pro pages are focused workflows such as receipt OCR or comparing two price lists.",
      },
      {
        question: "Can I chain tools together?",
        answer:
          "Yes. For example, OCR a receipt, clean it in Data Cleaner, then compare against a supplier CSV in Price diff.",
      },
      {
        question: "Does PureTable store my data?",
        answer:
          "No server copies. If you reload without exporting, in-memory table data is cleared like any local web app.",
      },
    ],
  },
  de: {
    benefitsTitle: "Pro-Tools für Geschäftstabellen — 100 % lokal",
    benefitsLead: "Erweiterte Hilfen für Belege und Preislisten, komplett im Browser.",
    benefitPoints: [
      "Jedes Tool mit eigener Seite und FAQ.",
      "Einheitlicher Ablauf: einfügen, Datei oder Foto — Export CSV/Excel.",
      "Für Einkauf, Buchhaltung und Handel.",
    ],
    faqTitle: "FAQ zu PureTable Pro",
    faqs: [
      {
        question: "Unterschied zum Tabellen-Studio?",
        answer: "Studio = allgemeiner Editor; Pro = spezialisierte Workflows wie OCR oder Preisvergleich.",
      },
      {
        question: "Tools kombinieren?",
        answer: "Ja — z. B. OCR, dann Bereinigung, dann Price diff.",
      },
      {
        question: "Werden Daten gespeichert?",
        answer: "Nein auf PureTable-Servern; ohne Export gehen Daten beim Neuladen verloren.",
      },
    ],
  },
  fr: {
    benefitsTitle: "Outils Pro — tableaux métier en local",
    benefitsLead: "Utilitaires avancés pour reçus et grilles tarifaires, 100 % navigateur.",
    benefitPoints: [
      "Une page dédiée par outil avec FAQ.",
      "Coller, fichier ou photo — export CSV/Excel.",
      "Pour achats, compta et commerces.",
    ],
    faqTitle: "FAQ PureTable Pro",
    faqs: [
      {
        question: "Différence avec le studio ?",
        answer: "Studio = éditeur général ; Pro = flux ciblés (OCR, comparateur de prix, etc.).",
      },
      {
        question: "Enchaîner les outils ?",
        answer: "Oui — OCR, nettoyage, puis comparateur de prix.",
      },
      {
        question: "Stockage des données ?",
        answer: "Aucune copie serveur ; recharge sans export = perte en mémoire.",
      },
    ],
  },
  es: {
    benefitsTitle: "Herramientas Pro para tablas de negocio en local",
    benefitsLead: "Utilidades avanzadas para recibos y listas de precios, solo en el navegador.",
    benefitPoints: [
      "Cada herramienta con página y FAQ propias.",
      "Pegar, archivo o foto — exportar CSV/Excel.",
      "Para compras, contabilidad y tiendas.",
    ],
    faqTitle: "FAQ PureTable Pro",
    faqs: [
      {
        question: "¿Diferencia con el estudio?",
        answer: "Estudio = editor general; Pro = flujos como OCR o comparar precios.",
      },
      {
        question: "¿Combinar herramientas?",
        answer: "Sí — OCR, limpieza y luego comparador de precios.",
      },
      {
        question: "¿Guardan mis datos?",
        answer: "No en servidores; sin exportar, se pierden al recargar.",
      },
    ],
  },
  pl: {
    benefitsTitle: "Narzędzia Pro dla tabel biznesowych — lokalnie",
    benefitsLead: "Zaawansowane narzędzia dla paragonów i cenników w przeglądarce.",
    benefitPoints: [
      "Osobna strona i FAQ dla każdego narzędzia.",
      "Wklej, plik lub zdjęcie — eksport CSV/Excel.",
      "Dla zakupów, księgowości i handlu.",
    ],
    faqTitle: "FAQ PureTable Pro",
    faqs: [
      {
        question: "Czym różni się od studia?",
        answer: "Studio = ogólny edytor; Pro = scenariusze typu OCR lub porównanie cen.",
      },
      {
        question: "Łączyć narzędzia?",
        answer: "Tak — OCR, czyszczenie, potem porównanie cen.",
      },
      {
        question: "Czy dane są zapisywane?",
        answer: "Nie na serwerach; bez eksportu znikają po odświeżeniu.",
      },
    ],
  },
};

const table: Record<Locale, PageSeoContent> = {
  uk: {
    benefitsTitle: "Онлайн-конвертер таблиць CSV, Excel, Markdown і SQL",
    benefitsLead:
      "Завантажте або вставте дані, відредагуйте рядки та експортуйте у CSV, XLSX, Markdown, SQL INSERT або HTML — без відправки файлів на сервер.",
    benefitPoints: [
      "Імпорт CSV/Excel і тексту з табуляцією, комою чи іншим роздільником.",
      "Пошук, find & replace, очищення дублікатів і форматування регістру.",
      "Експорт готовий для Excel, документації (Markdown) або БД (SQL).",
    ],
    faqTitle: "Питання про студію таблиць",
    faqs: [
      {
        question: "Як конвертувати CSV у Excel онлайн?",
        answer:
          "Завантажте .csv або вставте текст, перевірте попередній перегляд і натисніть завантаження XLSX — файл збирається локально.",
      },
      {
        question: "Чи можна отримати Markdown або SQL?",
        answer:
          "Так. У блоці «Експорт» доступні Markdown-таблиця, SQL INSERT із назвою таблиці та HTML.",
      },
      {
        question: "Скільки рядків витримує студія?",
        answer:
          "Залежить від пам’яті пристрою; для дуже великих таблиць рекомендуємо фільтрувати рядки перед експортом.",
      },
      {
        question: "Чи безпечно вставляти конфіденційні дані?",
        answer:
          "Обробка лише у браузері — PureTable не бачить ваші файли на сервері, бо їх туди не надсилають.",
      },
    ],
  },
  en: {
    benefitsTitle: "Online table converter — CSV, Excel, Markdown & SQL",
    benefitsLead:
      "Upload or paste data, edit rows, and export to CSV, XLSX, Markdown, SQL INSERT, or HTML. Files never leave your browser.",
    benefitPoints: [
      "Import CSV/Excel and delimiter-separated pasted text.",
      "Search, find & replace, dedupe, and change text case in bulk.",
      "Export ready for Excel, docs (Markdown), or databases (SQL).",
    ],
    faqTitle: "Table studio FAQ",
    faqs: [
      {
        question: "How do I convert CSV to Excel online?",
        answer:
          "Upload a .csv or paste values, check the live preview, then download XLSX — the file is built on your device.",
      },
      {
        question: "Can I export Markdown or SQL?",
        answer:
          "Yes. The export panel includes Markdown tables, SQL INSERT statements with a custom table name, and HTML.",
      },
      {
        question: "How large can my sheet be?",
        answer:
          "Limited by device memory; filter rows before export if you work with very large datasets.",
      },
      {
        question: "Is it safe for confidential data?",
        answer:
          "Processing is client-side only — PureTable does not receive your files because nothing is uploaded.",
      },
    ],
  },
  de: {
    benefitsTitle: "Online-Tabellenkonverter — CSV, Excel, Markdown, SQL",
    benefitsLead: "Daten laden, bearbeiten und lokal nach CSV, XLSX, Markdown, SQL oder HTML exportieren.",
    benefitPoints: [
      "CSV/Excel-Import und Text mit Trennzeichen.",
      "Suchen, Ersetzen, Duplikate entfernen, Schreibweise ändern.",
      "Export für Excel, Doku (Markdown) oder Datenbanken (SQL).",
    ],
    faqTitle: "FAQ Tabellen-Studio",
    faqs: [
      {
        question: "CSV online in Excel?",
        answer: "CSV laden oder einfügen, Vorschau prüfen, XLSX lokal herunterladen.",
      },
      {
        question: "Markdown oder SQL?",
        answer: "Ja — Markdown-Tabelle, SQL INSERT und HTML im Export-Bereich.",
      },
      {
        question: "Wie groß darf die Tabelle sein?",
        answer: "Abhängig vom Gerätespeicher; große Daten vorher filtern.",
      },
      {
        question: "Vertrauliche Daten?",
        answer: "Nur Client-seitig — keine Uploads zu PureTable.",
      },
    ],
  },
  fr: {
    benefitsTitle: "Convertisseur de tableaux — CSV, Excel, Markdown, SQL",
    benefitsLead: "Importez, éditez et exportez en CSV, XLSX, Markdown, SQL ou HTML localement.",
    benefitPoints: [
      "Import CSV/Excel et texte délimité.",
      "Recherche, remplacement, dédoublonnage, casse.",
      "Export Excel, Markdown ou SQL.",
    ],
    faqTitle: "FAQ studio tableur",
    faqs: [
      {
        question: "CSV vers Excel en ligne ?",
        answer: "Charger ou coller, prévisualiser, télécharger XLSX localement.",
      },
      {
        question: "Markdown ou SQL ?",
        answer: "Oui — tableau Markdown, INSERT SQL et HTML.",
      },
      {
        question: "Taille maximale ?",
        answer: "Selon la mémoire de l’appareil ; filtrer les grosses feuilles.",
      },
      {
        question: "Données sensibles ?",
        answer: "Traitement local uniquement — pas d’envoi serveur.",
      },
    ],
  },
  es: {
    benefitsTitle: "Convertidor de tablas — CSV, Excel, Markdown y SQL",
    benefitsLead: "Carga, edita y exporta a CSV, XLSX, Markdown, SQL o HTML sin subir archivos.",
    benefitPoints: [
      "Importación CSV/Excel y texto delimitado.",
      "Buscar, reemplazar, duplicados y mayúsculas.",
      "Exportación para Excel, Markdown o SQL.",
    ],
    faqTitle: "FAQ del estudio",
    faqs: [
      {
        question: "¿CSV a Excel online?",
        answer: "Sube o pega, revisa la vista previa y descarga XLSX localmente.",
      },
      {
        question: "¿Markdown o SQL?",
        answer: "Sí — tabla Markdown, INSERT SQL y HTML.",
      },
      {
        question: "¿Tamaño máximo?",
        answer: "Depende de la memoria; filtra filas en tablas muy grandes.",
      },
      {
        question: "¿Datos confidenciales?",
        answer: "Solo en el cliente — sin subidas al servidor.",
      },
    ],
  },
  pl: {
    benefitsTitle: "Konwerter tabel online — CSV, Excel, Markdown, SQL",
    benefitsLead: "Wczytaj, edytuj i eksportuj do CSV, XLSX, Markdown, SQL lub HTML lokalnie.",
    benefitPoints: [
      "Import CSV/Excel i tekstu z separatorami.",
      "Szukaj, zamieniaj, usuwaj duplikaty, zmieniaj wielkość liter.",
      "Eksport pod Excel, Markdown lub SQL.",
    ],
    faqTitle: "FAQ studia tabel",
    faqs: [
      {
        question: "CSV do Excela online?",
        answer: "Wgraj lub wklej, sprawdź podgląd, pobierz XLSX na urządzeniu.",
      },
      {
        question: "Markdown lub SQL?",
        answer: "Tak — tabela Markdown, INSERT SQL i HTML.",
      },
      {
        question: "Jak duża może być tabela?",
        answer: "Zależy od pamięci urządzenia; filtruj bardzo duże zestawy.",
      },
      {
        question: "Dane poufne?",
        answer: "Tylko po stronie klienta — brak uploadu na serwer.",
      },
    ],
  },
};

const pages: Record<
  Exclude<SeoContentPageId, ToolId>,
  Record<Locale, PageSeoContent>
> = {
  home,
  pro,
  table,
};

export function getPageSeoContent(page: SeoContentPageId, locale: Locale): PageSeoContent {
  if (page in toolsPageContent) {
    return toolsPageContent[page as ToolId][locale];
  }
  return pages[page as Exclude<SeoContentPageId, ToolId>][locale];
}