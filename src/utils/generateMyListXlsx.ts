import * as XLSX from "xlsx";
import type { SavedConfiguration, ProjectMeta } from "../types";
import { MODEL_NAMES } from "../types";
import { getModelDescription } from "./getModelDescription";

type Language = "en" | "uk";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9а-яА-ЯіІїЇєЄґҐ _-]/g, "").trim().replace(/\s+/g, "_");
}

function buildSummaryRows(
  projectMeta: ProjectMeta,
  totalUnits: number,
  uniqueModels: number,
  lang: Language
): string[][] {
  if (lang === "uk") {
    return [
      ["Назва проєкту", projectMeta.projectName || "—"],
      ["Клієнт / Підрядник", projectMeta.clientName || "—"],
      ["Дата документа", projectMeta.date || "—"],
      [],
      ["Унікальних моделей", String(uniqueModels)],
      ["Загальна кількість", String(totalUnits)],
    ];
  }
  return [
    ["Project Name", projectMeta.projectName || "—"],
    ["Client / Contractor", projectMeta.clientName || "—"],
    ["Document Date", projectMeta.date || "—"],
    [],
    ["Unique Models", String(uniqueModels)],
    ["Total Units", String(totalUnits)],
  ];
}

function buildSpecHeader(lang: Language): string[] {
  if (lang === "uk") {
    return ["№", "Код продукту", "Модель", "Опис", "К-сть", "Нотатка"];
  }
  return ["№", "Product Code", "Model", "Description", "Qty", "Note"];
}

async function buildSpecDataRows(
  items: SavedConfiguration[],
  lang: Language
): Promise<(string | number)[][]> {
  const rows: (string | number)[][] = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const modelName = MODEL_NAMES[item.modelId] ?? item.modelId;

    const description = await getModelDescription(
      item.productCode,
      item.modelId,
      lang
    ) ?? "";

    rows.push([
      index + 1,
      item.productCode,
      modelName,
      description,
      item.qty,
      item.note,
    ]);
  }

  return rows;
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

  const aoa: (string | number)[][] = [];

  if (projectMeta) {
    const summaryRows = buildSummaryRows(projectMeta, totalUnits, uniqueModels, lang);
    aoa.push(...summaryRows);
    aoa.push([]);
  }

  const headerRowIndex = aoa.length;
  aoa.push(buildSpecHeader(lang));

  const dataRows = await buildSpecDataRows(items, lang);
  aoa.push(...dataRows);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!cols"] = [
    { wch: 5 },
    { wch: 25 },
    { wch: 30 },
    { wch: 80 },
    { wch: 8 },
    { wch: 30 },
  ];

  const headerRef = {
    s: { r: headerRowIndex, c: 0 },
    e: { r: headerRowIndex, c: 5 },
  };

  for (let c = headerRef.s.c; c <= headerRef.e.c; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c });
    if (ws[cellRef]) {
      ws[cellRef].s = { font: { bold: true } };
    }
  }

  const workbook = XLSX.utils.book_new();
  const sheetName = lang === "uk" ? "Специфікація" : "Specification";
  XLSX.utils.book_append_sheet(workbook, ws, sheetName);

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