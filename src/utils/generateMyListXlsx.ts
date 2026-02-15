import type { SavedConfiguration } from "../types";
import { MODEL_NAMES } from "../types";
import { getModelDescription } from "./getModelDescription";

type Language = "en" | "uk";

interface MyListRowEn {
  "№": number;
  "Product Code": string;
  "Model": string;
  "Description": string;
  "Date Added": string;
}

interface MyListRowUk {
  "№": number;
  "Код продукту": string;
  "Модель": string;
  "Опис": string;
  "Дата додавання": string;
}

type MyListRow = MyListRowEn | MyListRowUk;

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}

async function buildRows(
  items: SavedConfiguration[],
  lang: Language
): Promise<MyListRow[]> {
  const rows: MyListRow[] = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const modelName = MODEL_NAMES[item.modelId] ?? item.modelId;
    const dateAdded = formatDate(item.savedAt);
    
    // Fetch description for this product code
    const description = await getModelDescription(
      item.productCode,
      item.modelId,
      lang
    ) ?? "";

    if (lang === "uk") {
      rows.push({
        "№": index + 1,
        "Код продукту": item.productCode,
        "Модель": modelName,
        "Опис": description,
        "Дата додавання": dateAdded,
      });
    } else {
      rows.push({
        "№": index + 1,
        "Product Code": item.productCode,
        "Model": modelName,
        "Description": description,
        "Date Added": dateAdded,
      });
    }
  }

  return rows;
}

export async function downloadMyListXlsx(
  items: SavedConfiguration[],
  lang: Language = "en"
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const XLSX = await import("xlsx");

  const rows = await buildRows(items, lang);

  const worksheet = XLSX.utils.json_to_sheet(rows);

  const columnWidths = [
    { wch: 5 },   // №
    { wch: 25 },  // Product Code / Код продукту
    { wch: 30 },  // Model / Модель
    { wch: 80 },  // Description / Опис
    { wch: 14 },  // Date Added / Дата додавання
  ];
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  const sheetName = lang === "uk" ? "Мій список" : "My List";
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const timestamp = formatTimestamp();
  const filename = `my-list-${timestamp}.xlsx`;

  XLSX.writeFile(workbook, filename);
}