import * as XLSX from "xlsx";
import type { SavedConfiguration, ProjectMeta } from "../types";
import { MODEL_NAMES } from "../types";
import { getModelDescription } from "./getModelDescription";

type Language = "en" | "uk";

interface SpecRowEn {
  "№": number;
  "Product Code": string;
  "Model": string;
  "Description": string;
  "Qty": number;
  "Note": string;
}

interface SpecRowUk {
  "№": number;
  "Код продукту": string;
  "Модель": string;
  "Опис": string;
  "К-сть": number;
  "Нотатка": string;
}

type SpecRow = SpecRowEn | SpecRowUk;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9а-яА-ЯіІїЇєЄґҐ _-]/g, "").trim().replace(/\s+/g, "_");
}

async function buildSpecRows(
  items: SavedConfiguration[],
  lang: Language
): Promise<SpecRow[]> {
  const rows: SpecRow[] = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const modelName = MODEL_NAMES[item.modelId] ?? item.modelId;

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
        "Нотатка": item.note,
      });
    } else {
      rows.push({
        "№": index + 1,
        "Product Code": item.productCode,
        "Model": modelName,
        "Description": description,
        "Qty": item.qty,
        "Note": item.note,
      });
    }
  }

  return rows;
}

function buildSummarySheet(
  projectMeta: ProjectMeta,
  totalUnits: number,
  uniqueModels: number,
  lang: Language
): XLSX.WorkSheet {
  const rows: string[][] = lang === "uk"
    ? [
        ["Назва проєкту", projectMeta.projectName || "—"],
        ["Клієнт / Підрядник", projectMeta.clientName || "—"],
        ["Дата документа", projectMeta.date || "—"],
        [],
        ["Унікальних моделей", String(uniqueModels)],
        ["Загальна кількість", String(totalUnits)],
      ]
    : [
        ["Project Name", projectMeta.projectName || "—"],
        ["Client / Contractor", projectMeta.clientName || "—"],
        ["Document Date", projectMeta.date || "—"],
        [],
        ["Unique Models", String(uniqueModels)],
        ["Total Units", String(totalUnits)],
      ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 22 }, { wch: 40 }];
  return ws;
}

function buildSpecificationSheet(
  rows: SpecRow[]
): XLSX.WorkSheet {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 5 },
    { wch: 25 },
    { wch: 30 },
    { wch: 80 },
    { wch: 6 },
    { wch: 30 },
  ];
  return ws;
}

export async function downloadMyListXlsx(
  items: SavedConfiguration[],
  lang: Language = "en",
  projectMeta?: ProjectMeta
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const totalUnits = items.reduce((sum, item) => sum + item.qty, 0);
  const uniqueModels = items.length;

  const specRows = await buildSpecRows(items, lang);
  const workbook = XLSX.utils.book_new();

  const summarySheetName = lang === "uk" ? "Зведення" : "Summary";
  const specSheetName = lang === "uk" ? "Специфікація" : "Specification";

  if (projectMeta) {
    const summarySheet = buildSummarySheet(projectMeta, totalUnits, uniqueModels, lang);
    XLSX.utils.book_append_sheet(workbook, summarySheet, summarySheetName);
  }

  const specSheet = buildSpecificationSheet(specRows);
  XLSX.utils.book_append_sheet(workbook, specSheet, specSheetName);

  let filename: string;
  if (projectMeta?.projectName) {
    const safeName = sanitizeFilename(projectMeta.projectName);
    const date = projectMeta.date || new Date().toISOString().slice(0, 10);
    filename = `${safeName}_${date}.xlsx`;
  } else {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    filename = `project-specification_${y}-${m}-${d}.xlsx`;
  }

  XLSX.writeFile(workbook, filename);
}