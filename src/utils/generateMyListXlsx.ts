import * as XLSX from "xlsx";
import type { SavedConfiguration, ProjectMeta } from "../types";
import { MODEL_NAMES } from "../types";
import { getModelDescription } from "./getModelDescription";

type Language = "en" | "uk";

interface MyListRowEn {
  "№": number;
  "Product Code": string;
  "Model": string;
  "Description": string;
  "Qty": number;
  "Comment": string;
  "Date Added": string;
}

interface MyListRowUk {
  "№": number;
  "Код продукту": string;
  "Модель": string;
  "Опис": string;
  "К-сть": number;
  "Коментар": string;
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
        "К-сть": item.qty,
        "Коментар": item.note,
        "Дата додавання": dateAdded,
      });
    } else {
      rows.push({
        "№": index + 1,
        "Product Code": item.productCode,
        "Model": modelName,
        "Description": description,
        "Qty": item.qty,
        "Comment": item.note,
        "Date Added": dateAdded,
      });
    }
  }

  return rows;
}

function buildProjectHeaderRows(
  projectMeta: ProjectMeta,
  lang: Language
): string[][] {
  const date = formatDate(projectMeta.createdAt);

  if (lang === "uk") {
    return [
      ["Назва проєкту:", projectMeta.projectName || "—"],
      ["Клієнт:", projectMeta.clientName || "—"],
      ["Дата:", date],
      [], // empty row separator
    ];
  }

  return [
    ["Project Name:", projectMeta.projectName || "—"],
    ["Client:", projectMeta.clientName || "—"],
    ["Date:", date],
    [], // empty row separator
  ];
}

export async function downloadMyListXlsx(
  items: SavedConfiguration[],
  lang: Language = "en",
  projectMeta?: ProjectMeta
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const rows = await buildRows(items, lang);

  const worksheet = XLSX.utils.aoa_to_sheet([]);

  // Add project header if available
  if (projectMeta) {
    const headerRows = buildProjectHeaderRows(projectMeta, lang);
    XLSX.utils.sheet_add_aoa(worksheet, headerRows, { origin: "A1" });
    
    // Add data rows after header
    const startRow = headerRows.length;
    XLSX.utils.sheet_add_json(worksheet, rows, { origin: `A${startRow + 1}` });
  } else {
    XLSX.utils.sheet_add_json(worksheet, rows);
  }

  const columnWidths = [
    { wch: 5 },   // №
    { wch: 25 },  // Product Code
    { wch: 30 },  // Model
    { wch: 80 },  // Description
    { wch: 6 },   // Qty
    { wch: 30 },  // Comment
    { wch: 14 },  // Date Added
  ];
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  const sheetName = lang === "uk" ? "Мій список" : "My List";
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const timestamp = formatTimestamp();
  const filename = `my-list-${timestamp}.xlsx`;

  XLSX.writeFile(workbook, filename);
}