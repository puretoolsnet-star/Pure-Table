import type { Locale } from "@/i18n/locales";

export const INVOICE_SAMPLE_UK = `Накладна № INV-1042
Дата: 06.11.2026
Постачальник: ТОВ «Світло»
Покупець: ФОП Коваленко

Найменування    К-сть    Ціна      Сума
Папір А4        10       120,00    1 200,00
Ручки сині      24       15,50     372,00
Папки-реєстратори  5     89,00     445,00

Разом: 2 017,00
ПДВ 20%: 403,40
До сплати: 2 420,40`;

export const INVOICE_SAMPLE_EN = `Invoice No: INV-1042
Date: 06.11.2026
Seller: Northwind Supplies
Buyer: Ada Martins

Description    Qty    Price     Amount
A4 paper       10     4.80      48.00
Blue pens      24     1.15      27.60
Binders        5      3.40      17.00

Subtotal: 93.20
VAT 20%: 18.64
Total: 111.84`;

export const TEXT_SAMPLE = `Name;Phone;City;Amount
Олена Коваленко;+380671112233;Київ;1 250,50
Mara Keller;0049 151 23456789;Berlin;890.00
Jean Dupont;+33 6 12 34 56 78;Lyon;2.450,75
Lucía Gómez;+34 612 345 678;Madrid;€ 75`;

export const CLEAN_SAMPLE = `Name;Phone;Amount
  Олена   Коваленко  ;067 111 22 33;1 250,50 ₴
Олена Коваленко;0671112233;1250,50 ₴
Mara Keller;0049 151 23456789;890.00 EUR
Mara Keller;004915123456789;890.00 EUR
Jean Dupont;+33 6 12 34 56 78;2.450,75
`;

/** Semicolon CSV, first row headers: item, buy, sell, qty — for margin calculator demo */
export const MARGIN_SAMPLE: Record<Locale, string> = {
  uk: `Товар;Закупівля;Продаж;К-сть
Папір А4;80;120;10
Ручки сині;12;18;24
Папки;45;69;5`,
  en: `Item;Buy;Sell;Qty
A4 paper;80;120;10
Blue pens;12;18;24
Binders;45;69;5`,
  de: `Artikel;Einkauf;Verkauf;Menge
A4 Papier;80;120;10
Kugelschreiber;12;18;24
Ordner;45;69;5`,
  fr: `Article;Achat;Vente;Qté
Papier A4;80;120;10
Stylos;12;18;24
Classeurs;45;69;5`,
  es: `Artículo;Compra;Venta;Cant.
Papel A4;80;120;10
Bolígrafos;12;18;24
Carpetas;45;69;5`,
  pl: `Towar;Zakup;Sprzedaż;Ilość
Papier A4;80;120;10
Długopisy;12;18;24
Segregatory;45;69;5`,
};

/** Single price column for currency converter demo (multiply by rate) */
export const CURRENCY_SAMPLE: Record<Locale, string> = {
  uk: `Товар;Ціна USD
Ноутбук;1200
Монітор;350,50
Клавіатура;45`,
  en: `Product;Price USD
Laptop;1200
Monitor;350.50
Keyboard;45`,
  de: `Produkt;Preis USD
Laptop;1200
Monitor;350,50
Tastatur;45`,
  fr: `Produit;Prix USD
Portable;1200
Écran;350,50
Clavier;45`,
  es: `Producto;Precio USD
Portátil;1200
Monitor;350,50
Teclado;45`,
  pl: `Produkt;Cena USD
Laptop;1200
Monitor;350,50
Klawiatura;45`,
};
