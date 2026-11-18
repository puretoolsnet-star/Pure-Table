import type { Locale } from "@/i18n/locales";
import type { ToolId } from "@/i18n/types";
import type { PageSeoContent } from "@/i18n/seo/page-content";

type ToolContentMap = Record<ToolId, Record<Locale, PageSeoContent>>;

export const toolsPageContent: ToolContentMap = {
  "image-to-table": {
    uk: {
      benefitsTitle: "Фото чека або накладної в Excel без OCR у хмарі",
      benefitsLead:
        "Розпізнавання таблиці з JPG/PNG відбувається у браузері — зображення не завантажуються на сторонні сервери PureTable.",
      benefitPoints: [
        "Підходить для чеків, квитанцій і фото накладних.",
        "Попередній перегляд перед експортом CSV або XLSX.",
        "Можна поєднати з очищенням даних у Pro-інструментах.",
      ],
      faqTitle: "FAQ — фото в таблицю",
      faqs: [
        {
          question: "Які формати фото підтримуються?",
          answer: "Зазвичай JPG і PNG з камери або скану. Файл обробляється локально.",
        },
        {
          question: "Наскільки точний OCR?",
          answer:
            "Якість залежить від різкості знімка. Завжди перевіряйте комірки у попередньому перегляді перед експортом.",
        },
        {
          question: "Чи відправляється фото в інтернет?",
          answer: "Ні. OCR виконується на вашому пристрої в межах сторінки PureTable.",
        },
      ],
    },
    en: {
      benefitsTitle: "Receipt photo to Excel with local OCR",
      benefitsLead:
        "Extract a table from JPG or PNG in your browser — images are not uploaded to PureTable servers.",
      benefitPoints: [
        "Built for receipts, tickets, and invoice photos.",
        "Preview cells before CSV or XLSX export.",
        "Pair with Data Cleaner for post-OCR cleanup.",
      ],
      faqTitle: "Photo to table FAQ",
      faqs: [
        {
          question: "Which image formats work?",
          answer: "Typically JPG and PNG from a camera or scan, processed locally.",
        },
        {
          question: "How accurate is OCR?",
          answer:
            "Depends on photo sharpness. Always review the preview before exporting.",
        },
        {
          question: "Is the photo sent online?",
          answer: "No. Recognition runs on your device inside the PureTable page.",
        },
      ],
    },
    de: {
      benefitsTitle: "Belegfoto zu Excel — lokale OCR",
      benefitsLead: "JPG/PNG im Browser auslesen, ohne Upload zu PureTable.",
      benefitPoints: ["Für Belege und Rechnungsfotos.", "Vorschau vor CSV/XLSX.", "Mit Datenbereinigung kombinierbar."],
      faqTitle: "FAQ Foto zu Tabelle",
      faqs: [
        { question: "Welche Bildformate?", answer: "JPG und PNG, lokal verarbeitet." },
        { question: "OCR-Genauigkeit?", answer: "Abhängig von der Bildqualität — Vorschau prüfen." },
        { question: "Wird das Bild hochgeladen?", answer: "Nein, Verarbeitung nur auf dem Gerät." },
      ],
    },
    fr: {
      benefitsTitle: "Photo de reçu vers Excel — OCR local",
      benefitsLead: "Extraire un tableau depuis JPG/PNG sans envoi serveur.",
      benefitPoints: ["Reçus et factures photographiés.", "Aperçu avant export.", "Compléter avec nettoyage de données."],
      faqTitle: "FAQ photo vers tableau",
      faqs: [
        { question: "Formats image ?", answer: "JPG et PNG traités localement." },
        { question: "Précision OCR ?", answer: "Selon la netteté — vérifier l’aperçu." },
        { question: "Envoi en ligne ?", answer: "Non, traitement sur l’appareil." },
      ],
    },
    es: {
      benefitsTitle: "Foto de recibo a Excel — OCR local",
      benefitsLead: "Extrae tablas de JPG/PNG sin subirlas al servidor.",
      benefitPoints: ["Recibos y facturas.", "Vista previa antes del export.", "Combinar con limpieza de datos."],
      faqTitle: "FAQ foto a tabla",
      faqs: [
        { question: "¿Qué formatos?", answer: "JPG y PNG procesados localmente." },
        { question: "¿Precisión del OCR?", answer: "Depende de la foto; revisa la vista previa." },
        { question: "¿Se sube la imagen?", answer: "No, todo en tu dispositivo." },
      ],
    },
    pl: {
      benefitsTitle: "Zdjęcie paragonu do Excela — lokalne OCR",
      benefitsLead: "Odczyt tabeli z JPG/PNG bez wysyłania na serwer PureTable.",
      benefitPoints: ["Paragony i faktury ze zdjęcia.", "Podgląd przed eksportem.", "Po OCR użyj czyszczenia danych."],
      faqTitle: "FAQ zdjęcie do tabeli",
      faqs: [
        { question: "Jakie formaty?", answer: "JPG i PNG — lokalnie." },
        { question: "Dokładność OCR?", answer: "Zależy od jakości zdjęcia; sprawdź podgląd." },
        { question: "Czy zdjęcie jest wysyłane?", answer: "Nie — tylko na urządzeniu." },
      ],
    },
  },
  "invoice-parser": {
    uk: {
      benefitsTitle: "Текст накладної в таблицю Excel локально",
      benefitsLead: "Вставте текст рахунку — PureTable збере рядки позицій у CSV/Excel без серверного парсингу.",
      benefitPoints: ["Швидкий старт з копіюванням з PDF або пошти.", "Редагування перед збереженням.", "Підходить для дрібного опту й ФОП."],
      faqTitle: "FAQ парсера накладних",
      faqs: [
        { question: "Чи підтримуються PDF?", answer: "Скопіюйте текст з PDF у буфер і вставте — файл PDF напряму не обов’язковий." },
        { question: "Що якщо структура незвична?", answer: "Перевірте попередній перегляд і за потреби відредагуйте комірки вручну." },
        { question: "Чи бачить PureTable мої дані?", answer: "Ні — розбір відбувається лише у вашому браузері." },
      ],
    },
    en: {
      benefitsTitle: "Invoice text to Excel — local parsing",
      benefitsLead: "Paste invoice text and build a line-item table in CSV or Excel without server-side parsing.",
      benefitPoints: ["Paste from PDF, email, or ERP export.", "Edit before download.", "Ideal for SMB purchasing."],
      faqTitle: "Invoice parser FAQ",
      faqs: [
        { question: "Do you support PDF files?", answer: "Copy text from the PDF and paste it — a direct PDF upload is not required." },
        { question: "Unusual layout?", answer: "Use the preview and fix rows manually if needed." },
        { question: "Does PureTable see my invoices?", answer: "No — parsing stays in your browser." },
      ],
    },
    de: {
      benefitsTitle: "Rechnungstext zu Excel — lokal",
      benefitsLead: "Text einfügen, Positionstabelle erzeugen, ohne Server-Parsing.",
      benefitPoints: ["Aus PDF/E-Mail kopieren.", "Vor Export bearbeiten.", "Für Einkauf im KMU."],
      faqTitle: "FAQ Rechnungsparser",
      faqs: [
        { question: "PDF direkt?", answer: "Text aus PDF kopieren und einfügen." },
        { question: "Sonderlayout?", answer: "Vorschau prüfen und manuell korrigieren." },
        { question: "Daten auf dem Server?", answer: "Nein — nur im Browser." },
      ],
    },
    fr: {
      benefitsTitle: "Texte de facture vers Excel — local",
      benefitsLead: "Collez le texte et obtenez un tableau de lignes sans serveur.",
      benefitPoints: ["Copie depuis PDF ou e-mail.", "Édition avant export.", "Pour TPE / achats."],
      faqTitle: "FAQ analyseur de factures",
      faqs: [
        { question: "PDF ?", answer: "Copiez le texte du PDF et collez-le." },
        { question: "Mise en page atypique ?", answer: "Corrigez via l’aperçu." },
        { question: "Données sur serveur ?", answer: "Non — traitement local." },
      ],
    },
    es: {
      benefitsTitle: "Texto de factura a Excel en local",
      benefitsLead: "Pega el texto y genera líneas en CSV/Excel sin servidor.",
      benefitPoints: ["Copiar desde PDF o correo.", "Editar antes de descargar.", "Para pymes."],
      faqTitle: "FAQ analizador de facturas",
      faqs: [
        { question: "¿PDF?", answer: "Copia el texto del PDF y pégalo." },
        { question: "¿Formato raro?", answer: "Revisa la vista previa y ajusta." },
        { question: "¿Suben mis datos?", answer: "No — solo en el navegador." },
      ],
    },
    pl: {
      benefitsTitle: "Tekst faktury do Excela — lokalnie",
      benefitsLead: "Wklej tekst i zbuduj tabelę pozycji bez serwera.",
      benefitPoints: ["Kopiuj z PDF lub maila.", "Edycja przed pobraniem.", "Dla małych firm."],
      faqTitle: "FAQ parser faktur",
      faqs: [
        { question: "PDF?", answer: "Skopiuj tekst z PDF i wklej." },
        { question: "Nietypowy układ?", answer: "Sprawdź podgląd i popraw ręcznie." },
        { question: "Dane na serwerze?", answer: "Nie — tylko w przeglądarce." },
      ],
    },
  },
  "text-to-excel": {
    uk: {
      benefitsTitle: "Конвертер тексту в Excel і CSV онлайн",
      benefitsLead: "Розділіть текст за табуляцією, комою чи іншим символом і завантажте таблицю — без завантаження на сервер.",
      benefitPoints: ["Автовизначення роздільника.", "Перший рядок як заголовок.", "Експорт CSV або XLSX."],
      faqTitle: "FAQ текст у таблицю",
      faqs: [
        { question: "Який роздільник обрати?", answer: "Спробуйте «Авто» — інструмент підбере табуляцію, кому або крапку з комою." },
        { question: "Чи можна з логів?", answer: "Так, якщо поля відокремлені стабільним символом." },
        { question: "Чи зберігається текст?", answer: "Ні на сервері — лише у пам’яті вкладки до експорту." },
      ],
    },
    en: {
      benefitsTitle: "Text to Excel / CSV converter online",
      benefitsLead: "Split pasted text by tab, comma, or custom delimiter and download a spreadsheet locally.",
      benefitPoints: ["Auto delimiter detection.", "Optional header row.", "CSV or XLSX export."],
      faqTitle: "Text to table FAQ",
      faqs: [
        { question: "Which delimiter should I use?", answer: "Start with Auto — it detects tabs, commas, or semicolons." },
        { question: "Works with logs?", answer: "Yes, when fields use a consistent separator." },
        { question: "Is pasted text stored?", answer: "Not on servers — only in your tab until you export." },
      ],
    },
    de: {
      benefitsTitle: "Text zu Excel/CSV online",
      benefitsLead: "Text mit Trennzeichen lokal in eine Tabelle umwandeln.",
      benefitPoints: ["Auto-Trennzeichen.", "Kopfzeile optional.", "CSV/XLSX-Export."],
      faqTitle: "FAQ Text zu Tabelle",
      faqs: [
        { question: "Trennzeichen?", answer: "„Auto“ erkennt Tab, Komma oder Semikolon." },
        { question: "Logdateien?", answer: "Ja bei festem Separator." },
        { question: "Speicherung?", answer: "Nur lokal im Tab." },
      ],
    },
    fr: {
      benefitsTitle: "Convertisseur texte vers Excel/CSV",
      benefitsLead: "Découpez un texte collé par délimiteur, sans serveur.",
      benefitPoints: ["Délimiteur auto.", "Ligne d’en-tête.", "Export CSV/XLSX."],
      faqTitle: "FAQ texte vers tableau",
      faqs: [
        { question: "Quel délimiteur ?", answer: "Commencez par Auto (tab, virgule, point-virgule)." },
        { question: "Fichiers logs ?", answer: "Oui si séparateur stable." },
        { question: "Stockage ?", answer: "Uniquement dans l’onglet." },
      ],
    },
    es: {
      benefitsTitle: "Convertidor de texto a Excel/CSV",
      benefitsLead: "Divide texto pegado por delimitador en local.",
      benefitPoints: ["Delimitador automático.", "Fila de encabezado.", "Export CSV/XLSX."],
      faqTitle: "FAQ texto a tabla",
      faqs: [
        { question: "¿Delimitador?", answer: "Usa Auto para tabulador, coma o punto y coma." },
        { question: "¿Logs?", answer: "Sí con separador constante." },
        { question: "¿Se guarda el texto?", answer: "No en servidor." },
      ],
    },
    pl: {
      benefitsTitle: "Konwerter tekstu do Excel/CSV online",
      benefitsLead: "Podziel wklejony tekst według separatora lokalnie.",
      benefitPoints: ["Auto separator.", "Opcjonalny nagłówek.", "Eksport CSV/XLSX."],
      faqTitle: "FAQ tekst do tabeli",
      faqs: [
        { question: "Separator?", answer: "Użyj Auto — wykryje tab, przecinek lub średnik." },
        { question: "Logi?", answer: "Tak przy stałym separatorze." },
        { question: "Czy tekst jest zapisywany?", answer: "Nie na serwerze." },
      ],
    },
  },
  "merge-tables": {
    uk: {
      benefitsTitle: "Об’єднання CSV і Excel у один файл онлайн",
      benefitsLead: "Злийте кілька таблиць за заголовками або складіть рядки — файли не покидають пристрій.",
      benefitPoints: ["Два і більше CSV/XLSX.", "Вирівнювання колонок.", "Один файл на виході."],
      faqTitle: "FAQ злиття таблиць",
      faqs: [
        { question: "Що якщо різні назви колонок?", answer: "Увімкніть вирівнювання за заголовками або перейменуйте їх перед злиттям." },
        { question: "Чи можна додати колонку джерела?", answer: "Так — позначте, з якого файлу прийшов рядок." },
        { question: "Ліміт файлів?", answer: "Обмеження — пам’ять браузера; для великих наборів зливайте частинами." },
      ],
    },
    en: {
      benefitsTitle: "Merge CSV and Excel files online — locally",
      benefitsLead: "Combine multiple spreadsheets by headers or stack rows. Files never leave your device.",
      benefitPoints: ["Two or more CSV/XLSX inputs.", "Header alignment.", "Single combined export."],
      faqTitle: "Merge tables FAQ",
      faqs: [
        { question: "Different column names?", answer: "Align by headers or rename columns before merging." },
        { question: "Source column?", answer: "Yes — tag which file each row came from." },
        { question: "File limit?", answer: "Browser memory is the limit; merge in batches for huge sets." },
      ],
    },
    de: {
      benefitsTitle: "CSV/Excel zusammenführen — online & lokal",
      benefitsLead: "Mehrere Tabellen nach Kopfzeilen vereinen, ohne Upload.",
      benefitPoints: ["Mehrere Dateien.", "Kopfzeilenabgleich.", "Ein Export."],
      faqTitle: "FAQ Zusammenführen",
      faqs: [
        { question: "Unterschiedliche Spalten?", answer: "Nach Header ausrichten oder umbenennen." },
        { question: "Quellspalte?", answer: "Ja — Herkunftsdatei markieren." },
        { question: "Limit?", answer: "Browserspeicher; bei Riesendaten in Teilen." },
      ],
    },
    fr: {
      benefitsTitle: "Fusionner CSV et Excel en ligne",
      benefitsLead: "Combinez plusieurs fichiers localement.",
      benefitPoints: ["Plusieurs CSV/XLSX.", "Alignement des en-têtes.", "Un seul export."],
      faqTitle: "FAQ fusion",
      faqs: [
        { question: "Colonnes différentes ?", answer: "Aligner sur les en-têtes ou renommer." },
        { question: "Colonne source ?", answer: "Oui — indiquer le fichier d’origine." },
        { question: "Limite ?", answer: "Mémoire du navigateur." },
      ],
    },
    es: {
      benefitsTitle: "Unir CSV y Excel online en local",
      benefitsLead: "Combina varias hojas sin subirlas.",
      benefitPoints: ["Varios archivos.", "Alinear encabezados.", "Un solo export."],
      faqTitle: "FAQ unir tablas",
      faqs: [
        { question: "¿Columnas distintas?", answer: "Alinea encabezados o renombra." },
        { question: "¿Columna de origen?", answer: "Sí, para marcar el archivo." },
        { question: "¿Límite?", answer: "Memoria del navegador." },
      ],
    },
    pl: {
      benefitsTitle: "Scalanie CSV i Excel online",
      benefitsLead: "Połącz wiele plików lokalnie w przeglądarce.",
      benefitPoints: ["Wiele plików.", "Wyrównanie nagłówków.", "Jeden eksport."],
      faqTitle: "FAQ scalanie",
      faqs: [
        { question: "Inne nazwy kolumn?", answer: "Wyrównaj nagłówki lub zmień nazwy." },
        { question: "Kolumna źródła?", answer: "Tak — oznacz plik pochodzenia." },
        { question: "Limit?", answer: "Pamięć przeglądarki." },
      ],
    },
  },
  "margin-calculator": {
    uk: {
      benefitsTitle: "Калькулятор маржі та націнки для Excel",
      benefitsLead: "Обчисліть прибуток, маржу й націнку за колонками закупівлі та продажу — локально.",
      benefitPoints: ["Режими маржі або націнки.", "Підсумкові рядки.", "Експорт прайсу в XLSX/CSV."],
      faqTitle: "FAQ калькулятора маржі",
      faqs: [
        { question: "Чим маржа відрізняється від націнки?", answer: "Маржа — від продажної ціни, націнка — від собівартості. Оберіть режим у панелі." },
        { question: "Чи враховується кількість?", answer: "Так, якщо ви вкажете колонку кількості." },
        { question: "Чи потрібен Excel?", answer: "Можна вставити CSV або завантажити файл — результат знову в Excel/CSV." },
      ],
    },
    en: {
      benefitsTitle: "Margin and markup calculator for spreadsheets",
      benefitsLead: "Compute profit, margin, and markup from buy/sell columns entirely in the browser.",
      benefitPoints: ["Margin or markup mode.", "Totals row.", "Export updated price list."],
      faqTitle: "Margin calculator FAQ",
      faqs: [
        { question: "Margin vs markup?", answer: "Margin is based on sell price; markup on cost. Pick the mode in the toolbar." },
        { question: "Quantity column?", answer: "Optional — enables line totals when mapped." },
        { question: "Need Excel installed?", answer: "No — paste CSV or upload a file and download results." },
      ],
    },
    de: {
      benefitsTitle: "Margen- und Aufschlagsrechner für Tabellen",
      benefitsLead: "Gewinn, Marge und Aufschlag lokal aus Einkaufs-/Verkaufspreisen.",
      benefitPoints: ["Marge oder Aufschlag.", "Summenzeile.", "Export XLSX/CSV."],
      faqTitle: "FAQ Margenrechner",
      faqs: [
        { question: "Marge vs. Aufschlag?", answer: "Modus in der Leiste wählen." },
        { question: "Mengenspalte?", answer: "Optional für Zeilensummen." },
        { question: "Excel nötig?", answer: "Nein — CSV einfügen und exportieren." },
      ],
    },
    fr: {
      benefitsTitle: "Calculateur de marge pour tableurs",
      benefitsLead: "Marge, marque et profit en local à partir des colonnes achat/vente.",
      benefitPoints: ["Mode marge ou marque.", "Ligne totaux.", "Export liste de prix."],
      faqTitle: "FAQ marge",
      faqs: [
        { question: "Marge ou marque ?", answer: "Choisissez le mode dans la barre." },
        { question: "Colonne quantité ?", answer: "Optionnelle pour les totaux." },
        { question: "Excel requis ?", answer: "Non — collez un CSV et exportez." },
      ],
    },
    es: {
      benefitsTitle: "Calculadora de margen para hojas de cálculo",
      benefitsLead: "Beneficio, margen y recargo en local desde columnas compra/venta.",
      benefitPoints: ["Modo margen o recargo.", "Fila de totales.", "Exportar lista."],
      faqTitle: "FAQ margen",
      faqs: [
        { question: "¿Margen vs recargo?", answer: "Elige el modo en la barra." },
        { question: "¿Columna cantidad?", answer: "Opcional para totales." },
        { question: "¿Necesito Excel?", answer: "No — pega CSV y descarga." },
      ],
    },
    pl: {
      benefitsTitle: "Kalkulator marży dla arkuszy",
      benefitsLead: "Zysk, marża i narzut lokalnie z kolumn zakupu i sprzedaży.",
      benefitPoints: ["Tryb marży lub narzutu.", "Wiersz sum.", "Eksport cennika."],
      faqTitle: "FAQ marży",
      faqs: [
        { question: "Marża vs narzut?", answer: "Wybierz tryb na pasku." },
        { question: "Kolumna ilości?", answer: "Opcjonalna dla sum." },
        { question: "Potrzebny Excel?", answer: "Nie — wklej CSV i pobierz wynik." },
      ],
    },
  },
  "currency-converter": {
    uk: {
      benefitsTitle: "Конвертер валютних цін у таблиці Excel",
      benefitsLead: "Помножте колонку цін на курс і отримайте новий прайс — без API та серверів PureTable.",
      benefitPoints: ["Власний курс від користувача.", "Збереження структури таблиці.", "Експорт готового файлу."],
      faqTitle: "FAQ валютного конвертера",
      faqs: [
        { question: "Звідки курс?", answer: "Ви вводите курс вручну — з банку, ERP або іншого джерела." },
        { question: "Чи оновлюється автоматично?", answer: "Ні, це свідомий локальний інструмент без зовнішніх запитів курсу." },
        { question: "Які файли?", answer: "CSV або Excel з числовою колонкою цін." },
      ],
    },
    en: {
      benefitsTitle: "Currency price converter for Excel tables",
      benefitsLead: "Multiply a price column by your rate and export a new list — no FX API or server uploads.",
      benefitPoints: ["You provide the exchange rate.", "Keeps column layout.", "Download updated sheet."],
      faqTitle: "Currency converter FAQ",
      faqs: [
        { question: "Where does the rate come from?", answer: "You enter it manually from your bank, ERP, or policy." },
        { question: "Live rates?", answer: "No — intentionally offline/local with no external rate requests." },
        { question: "Supported files?", answer: "CSV or Excel with a numeric price column." },
      ],
    },
    de: {
      benefitsTitle: "Währungsumrechner für Tabellenpreise",
      benefitsLead: "Preisspalte mit Kurs multiplizieren — lokal, ohne API.",
      benefitPoints: ["Eigener Kurs.", "Layout bleibt.", "Export der Datei."],
      faqTitle: "FAQ Währung",
      faqs: [
        { question: "Kursquelle?", answer: "Manuell vom Nutzer." },
        { question: "Live-Kurse?", answer: "Nein — bewusst ohne externe Abfragen." },
        { question: "Dateiformate?", answer: "CSV oder Excel." },
      ],
    },
    fr: {
      benefitsTitle: "Conversion de prix par taux de change",
      benefitsLead: "Multipliez une colonne de prix — local, sans API.",
      benefitPoints: ["Taux saisi par vous.", "Structure conservée.", "Export du fichier."],
      faqTitle: "FAQ devises",
      faqs: [
        { question: "Source du taux ?", answer: "Saisie manuelle." },
        { question: "Taux en direct ?", answer: "Non — pas de requêtes externes." },
        { question: "Fichiers ?", answer: "CSV ou Excel." },
      ],
    },
    es: {
      benefitsTitle: "Conversor de precios por tipo de cambio",
      benefitsLead: "Multiplica una columna de precios localmente, sin API.",
      benefitPoints: ["Tú introduces el tipo.", "Mantiene columnas.", "Descarga el archivo."],
      faqTitle: "FAQ divisas",
      faqs: [
        { question: "¿De dónde sale el tipo?", answer: "Lo introduces manualmente." },
        { question: "¿Tipos en vivo?", answer: "No — sin consultas externas." },
        { question: "¿Archivos?", answer: "CSV o Excel." },
      ],
    },
    pl: {
      benefitsTitle: "Przelicznik walut w tabeli cen",
      benefitsLead: "Pomnóż kolumnę cen przez kurs — lokalnie, bez API.",
      benefitPoints: ["Własny kurs.", "Zachowany układ.", "Eksport pliku."],
      faqTitle: "FAQ waluty",
      faqs: [
        { question: "Skąd kurs?", answer: "Wpisywany ręcznie." },
        { question: "Kursy na żywo?", answer: "Nie — bez zapytań zewnętrznych." },
        { question: "Pliki?", answer: "CSV lub Excel." },
      ],
    },
  },
  "price-diff": {
    uk: {
      benefitsTitle: "Порівняння двох прайсів CSV/Excel онлайн",
      benefitsLead: "Знайдіть різницю цін між двома постачальниками або версіями прайсу локально.",
      benefitPoints: ["Ключова колонка товару.", "Дельта ціни та відсоток.", "Без завантаження на сервер."],
      faqTitle: "FAQ порівняння цін",
      faqs: [
        { question: "Що якщо різні артикули?", answer: "Зіставте колонку ключа (SKU, назва) в обох файлах." },
        { question: "Чи показуються лише зміни?", answer: "Таблиця містить стару ціну, нову та різницю." },
        { question: "Формати?", answer: "Два файли CSV або Excel у браузері." },
      ],
    },
    en: {
      benefitsTitle: "Compare two CSV/Excel price lists online",
      benefitsLead: "Find price changes between suppliers or list versions — 100% local.",
      benefitPoints: ["Map a product key column.", "Price delta and percent.", "No server upload."],
      faqTitle: "Price diff FAQ",
      faqs: [
        { question: "Different SKUs?", answer: "Align the key column (SKU or name) in both files." },
        { question: "Only changes shown?", answer: "You get old price, new price, and delta columns." },
        { question: "Formats?", answer: "Two CSV or Excel files in the browser." },
      ],
    },
    de: {
      benefitsTitle: "Zwei Preislisten vergleichen — online & lokal",
      benefitsLead: "Preisänderungen zwischen Dateien finden.",
      benefitPoints: ["Schlüsselspalte.", "Delta und Prozent.", "Kein Upload."],
      faqTitle: "FAQ Preisvergleich",
      faqs: [
        { question: "Unterschiedliche SKUs?", answer: "Schlüsselspalte abstimmen." },
        { question: "Nur Änderungen?", answer: "Alte/neue Preise plus Delta." },
        { question: "Formate?", answer: "Zwei CSV/XLSX lokal." },
      ],
    },
    fr: {
      benefitsTitle: "Comparer deux grilles de prix en ligne",
      benefitsLead: "Écarts de prix entre fournisseurs — en local.",
      benefitPoints: ["Colonne clé.", "Delta et pourcentage.", "Sans serveur."],
      faqTitle: "FAQ comparateur",
      faqs: [
        { question: "SKU différents ?", answer: "Harmoniser la colonne clé." },
        { question: "Voir les changements ?", answer: "Ancien, nouveau prix et écart." },
        { question: "Formats ?", answer: "Deux CSV/Excel." },
      ],
    },
    es: {
      benefitsTitle: "Comparar dos listas de precios en línea",
      benefitsLead: "Detecta cambios entre archivos localmente.",
      benefitPoints: ["Columna clave.", "Delta y porcentaje.", "Sin servidor."],
      faqTitle: "FAQ comparación",
      faqs: [
        { question: "¿SKU distintos?", answer: "Alinea la columna clave." },
        { question: "¿Solo cambios?", answer: "Precio viejo, nuevo y diferencia." },
        { question: "¿Formatos?", answer: "Dos CSV/Excel." },
      ],
    },
    pl: {
      benefitsTitle: "Porównaj dwa cenniki CSV/Excel online",
      benefitsLead: "Różnice cen między plikami — lokalnie.",
      benefitPoints: ["Kolumna klucza.", "Delta i procent.", "Bez serwera."],
      faqTitle: "FAQ porównanie cen",
      faqs: [
        { question: "Różne SKU?", answer: "Wyrównaj kolumnę klucza." },
        { question: "Tylko zmiany?", answer: "Stara, nowa cena i różnica." },
        { question: "Formaty?", answer: "Dwa CSV/Excel." },
      ],
    },
  },
  "data-cleaner": {
    uk: {
      benefitsTitle: "Очищення CSV і Excel онлайн — локально",
      benefitsLead: "Приберіть дублікати, зайві пробіли та відформатуйте телефони й суми у браузері.",
      benefitPoints: ["Пакетні правила очищення.", "Статистика застосованих змін.", "Експорт чистої таблиці."],
      faqTitle: "FAQ очищення даних",
      faqs: [
        { question: "Чи змінюється оригінал?", answer: "Початковий файл на диску не чіпається — завантажте нову копію." },
        { question: "Телефони й суми?", answer: "Опційне форматування для колонок з номерами та грошима." },
        { question: "Дублікати за чим?", answer: "За повним збігом рядка після інших правил очищення." },
      ],
    },
    en: {
      benefitsTitle: "Clean CSV and Excel data online — locally",
      benefitsLead: "Remove duplicates, trim spaces, and format phones and amounts in your browser.",
      benefitPoints: ["Toggle cleaning rules.", "See stats for applied fixes.", "Export the cleaned sheet."],
      faqTitle: "Data cleaner FAQ",
      faqs: [
        { question: "Is my original file modified?", answer: "No — download a new file; the source on disk stays untouched." },
        { question: "Phones and money columns?", answer: "Optional normalizers for those column types." },
        { question: "How are duplicates defined?", answer: "Exact full-row match after other cleaning steps." },
      ],
    },
    de: {
      benefitsTitle: "CSV/Excel bereinigen — online & lokal",
      benefitsLead: "Duplikate, Leerzeichen, Telefone und Beträge im Browser.",
      benefitPoints: ["Regeln umschalten.", "Statistik.", "Export bereinigte Datei."],
      faqTitle: "FAQ Datenbereinigung",
      faqs: [
        { question: "Originaldatei?", answer: "Bleibt unverändert — neuer Download." },
        { question: "Telefon/Beträge?", answer: "Optionale Formatierung." },
        { question: "Duplikate?", answer: "Volle Zeilenübereinstimmung." },
      ],
    },
    fr: {
      benefitsTitle: "Nettoyer CSV/Excel en ligne — local",
      benefitsLead: "Doublons, espaces, téléphones et montants dans le navigateur.",
      benefitPoints: ["Règles activables.", "Statistiques.", "Export propre."],
      faqTitle: "FAQ nettoyage",
      faqs: [
        { question: "Fichier d’origine ?", answer: "Inchangé — nouveau téléchargement." },
        { question: "Téléphones/montants ?", answer: "Formatage optionnel." },
        { question: "Doublons ?", answer: "Ligne entière identique." },
      ],
    },
    es: {
      benefitsTitle: "Limpiar CSV/Excel online en local",
      benefitsLead: "Duplicados, espacios, teléfonos e importes en el navegador.",
      benefitPoints: ["Reglas configurables.", "Estadísticas.", "Exportar limpio."],
      faqTitle: "FAQ limpieza",
      faqs: [
        { question: "¿Archivo original?", answer: "No cambia — descarga uno nuevo." },
        { question: "¿Teléfonos e importes?", answer: "Formateo opcional." },
        { question: "¿Duplicados?", answer: "Coincidencia de fila completa." },
      ],
    },
    pl: {
      benefitsTitle: "Czyszczenie CSV/Excel online — lokalnie",
      benefitsLead: "Duplikaty, spacje, telefony i kwoty w przeglądarce.",
      benefitPoints: ["Reguły włącz/wyłącz.", "Statystyki.", "Eksport oczyszczonego pliku."],
      faqTitle: "FAQ czyszczenie",
      faqs: [
        { question: "Plik źródłowy?", answer: "Bez zmian — pobierz nowy." },
        { question: "Telefony i kwoty?", answer: "Opcjonalne formatowanie." },
        { question: "Duplikaty?", answer: "Pełne dopasowanie wiersza." },
      ],
    },
  },
  "qr-generator": {
    uk: {
      benefitsTitle: "QR і штрихкоди з колонок Excel/CSV",
      benefitsLead: "Згенеруйте QR або CODE128 для кожного рядка таблиці — зображення збираються локально.",
      benefitPoints: ["Вибір колонок для підпису й коду.", "Галерея перед завантаженням.", "Без хмарного API."],
      faqTitle: "FAQ QR з таблиці",
      faqs: [
        { question: "Які типи кодів?", answer: "QR та штрихкод CODE128 — оберіть формат у панелі." },
        { question: "Скільки кодів?", answer: "По одному на рядок; обмеження — продуктивність пристрою." },
        { question: "Чи потрібен інтернет?", answer: "Лише для завантаження сторінки; генерація працює офлайн після відкриття." },
      ],
    },
    en: {
      benefitsTitle: "QR and barcodes from Excel/CSV columns",
      benefitsLead: "Generate QR or CODE128 labels per row — images are built locally in the browser.",
      benefitPoints: ["Pick name and payload columns.", "Preview gallery before download.", "No cloud barcode API."],
      faqTitle: "Spreadsheet QR FAQ",
      faqs: [
        { question: "Which code types?", answer: "QR and CODE128 — select in the options panel." },
        { question: "How many codes?", answer: "One per row; very large lists depend on device performance." },
        { question: "Internet required?", answer: "Only to load the page; generation works offline after that." },
      ],
    },
    de: {
      benefitsTitle: "QR & Barcodes aus Excel/CSV",
      benefitsLead: "QR oder CODE128 pro Zeile — lokal erzeugt.",
      benefitPoints: ["Spalten wählen.", "Galerie-Vorschau.", "Keine Cloud-API."],
      faqTitle: "FAQ QR",
      faqs: [
        { question: "Code-Typen?", answer: "QR und CODE128." },
        { question: "Anzahl?", answer: "Ein Code pro Zeile." },
        { question: "Internet?", answer: "Nur zum Laden der Seite." },
      ],
    },
    fr: {
      benefitsTitle: "QR et codes-barres depuis Excel/CSV",
      benefitsLead: "Un QR ou CODE128 par ligne — génération locale.",
      benefitPoints: ["Colonnes libellé/donnée.", "Galerie.", "Sans API cloud."],
      faqTitle: "FAQ QR",
      faqs: [
        { question: "Types ?", answer: "QR et CODE128." },
        { question: "Volume ?", answer: "Un par ligne." },
        { question: "Internet ?", answer: "Pour charger la page seulement." },
      ],
    },
    es: {
      benefitsTitle: "QR y códigos desde columnas Excel/CSV",
      benefitsLead: "Un QR o CODE128 por fila — generación local.",
      benefitPoints: ["Elige columnas.", "Galería previa.", "Sin API en la nube."],
      faqTitle: "FAQ QR",
      faqs: [
        { question: "¿Tipos?", answer: "QR y CODE128." },
        { question: "¿Cuántos?", answer: "Uno por fila." },
        { question: "¿Internet?", answer: "Solo para cargar la página." },
      ],
    },
    pl: {
      benefitsTitle: "QR i kody kreskowe z Excel/CSV",
      benefitsLead: "QR lub CODE128 na wiersz — lokalnie w przeglądarce.",
      benefitPoints: ["Wybór kolumn.", "Galeria podglądu.", "Bez chmurowego API."],
      faqTitle: "FAQ QR",
      faqs: [
        { question: "Typy kodów?", answer: "QR i CODE128." },
        { question: "Ile kodów?", answer: "Jeden na wiersz." },
        { question: "Internet?", answer: "Tylko do załadowania strony." },
      ],
    },
  },
};