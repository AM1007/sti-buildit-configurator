import * as XLSX from "xlsx-js-style";
import type { SavedConfiguration, ProjectMeta } from "../types";
import { MODEL_NAMES } from "../types";
import { getModelDescription } from "./getModelDescription";

type Language = "en" | "uk";

type CellStyle = XLSX.CellObject["s"];

const COLOR_BRAND = "C8102E";
const COLOR_HEADER_BG = "1F2937";
const COLOR_HEADER_TEXT = "FFFFFF";
const COLOR_META_LABEL_BG = "F1F5F9";
const COLOR_META_LABEL_TEXT = "334155";
const COLOR_META_VALUE_TEXT = "0F172A";
const COLOR_TABLE_BORDER = "CBD5E1";
const COLOR_ZEBRA = "F8FAFC";
const COLOR_WHITE = "FFFFFF";

const BORDER_THIN = {
  style: "thin" as const,
  color: { rgb: COLOR_TABLE_BORDER },
};

const BORDERS_ALL = {
  top: BORDER_THIN,
  bottom: BORDER_THIN,
  left: BORDER_THIN,
  right: BORDER_THIN,
};

const STYLE_META_LABEL: CellStyle = {
  font: { bold: true, sz: 10, color: { rgb: COLOR_META_LABEL_TEXT } },
  fill: { fgColor: { rgb: COLOR_META_LABEL_BG } },
  alignment: { vertical: "center" },
  border: BORDERS_ALL,
};

const STYLE_META_VALUE: CellStyle = {
  font: { sz: 10, color: { rgb: COLOR_META_VALUE_TEXT } },
  alignment: { vertical: "center" },
  border: BORDERS_ALL,
};

const STYLE_SECTION_TITLE: CellStyle = {
  font: { bold: true, sz: 11, color: { rgb: COLOR_HEADER_TEXT } },
  fill: { fgColor: { rgb: COLOR_BRAND } },
  alignment: { horizontal: "left", vertical: "center" },
  border: BORDERS_ALL,
};

const STYLE_TABLE_HEADER: CellStyle = {
  font: { bold: true, sz: 10, color: { rgb: COLOR_HEADER_TEXT } },
  fill: { fgColor: { rgb: COLOR_HEADER_BG } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: BORDERS_ALL,
};

function makeDataStyle(isZebra: boolean, wrap: boolean, align?: string): CellStyle {
  return {
    font: { sz: 10, color: { rgb: COLOR_META_VALUE_TEXT } },
    fill: { fgColor: { rgb: isZebra ? COLOR_ZEBRA : COLOR_WHITE } },
    alignment: {
      vertical: "top",
      horizontal: (align as "left" | "center" | "right") ?? "left",
      wrapText: wrap,
    },
    border: BORDERS_ALL,
  };
}

const COL_WIDTHS_CH = [5, 25, 30, 80, 8, 30];
const COL_WRAP = [false, false, true, true, false, true];
const LINE_HEIGHT_PT = 14;
const MIN_ROW_HEIGHT_PT = 18;
const CHAR_WIDTH_FACTOR = 1.2;

function estimateLineCount(text: string, colWidthCh: number): number {
  if (!text) return 1;
  const lines = text.split("\n");
  let total = 0;
  for (const line of lines) {
    const charsFit = Math.max(1, Math.floor(colWidthCh / CHAR_WIDTH_FACTOR));
    total += Math.max(1, Math.ceil(line.length / charsFit));
  }
  return total;
}

function calcRowHeight(row: (string | number)[], wrapFlags: boolean[], colWidths: number[]): number {
  let maxLines = 1;
  for (let c = 0; c < row.length; c++) {
    if (!wrapFlags[c]) continue;
    const text = String(row[c] ?? "");
    const lines = estimateLineCount(text, colWidths[c]);
    if (lines > maxLines) maxLines = lines;
  }
  return Math.max(MIN_ROW_HEIGHT_PT, maxLines * LINE_HEIGHT_PT);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9а-яА-ЯіІїЇєЄґҐ _-]/g, "").trim().replace(/\s+/g, "_");
}

function buildSummaryPairs(
  projectMeta: ProjectMeta,
  totalUnits: number,
  uniqueModels: number,
  lang: Language
): [string, string][] {
  if (lang === "uk") {
    return [
      ["Назва проєкту", projectMeta.projectName || "—"],
      ["Клієнт / Підрядник", projectMeta.clientName || "—"],
      ["Дата документа", projectMeta.date || "—"],
      ["Унікальних моделей", String(uniqueModels)],
      ["Загальна кількість", String(totalUnits)],
    ];
  }
  return [
    ["Project Name", projectMeta.projectName || "—"],
    ["Client / Contractor", projectMeta.clientName || "—"],
    ["Document Date", projectMeta.date || "—"],
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

function applyCellStyle(ws: XLSX.WorkSheet, row: number, col: number, style: CellStyle): void {
  const ref = XLSX.utils.encode_cell({ r: row, c: col });
  if (!ws[ref]) {
    ws[ref] = { t: "s", v: "" };
  }
  ws[ref].s = style;
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
  const rowHeights: number[] = [];
  const merges: XLSX.Range[] = [];
  let currentRow = 0;
  const colCount = 6;

  const sectionLabel = lang === "uk" ? "ІНФОРМАЦІЯ ПРО ПРОЄКТ" : "PROJECT INFORMATION";
  aoa.push([sectionLabel, "", "", "", "", ""]);
  rowHeights.push(22);
  const sectionTitleRow = currentRow;
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colCount - 1 } });
  currentRow++;

  const metaStartRow = currentRow;
  let metaRowCount = 0;
  if (projectMeta) {
    const pairs = buildSummaryPairs(projectMeta, totalUnits, uniqueModels, lang);
    for (const [label, value] of pairs) {
      aoa.push([label, "", value, "", "", ""]);
      rowHeights.push(MIN_ROW_HEIGHT_PT);
      merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 1 } });
      currentRow++;
      metaRowCount++;
    }
  }

  aoa.push(["", "", "", "", "", ""]);
  rowHeights.push(10);
  currentRow++;

  const specLabel = lang === "uk" ? "СПЕЦИФІКАЦІЯ" : "SPECIFICATION";
  aoa.push([specLabel, "", "", "", "", ""]);
  rowHeights.push(22);
  const specTitleRow = currentRow;
  merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: colCount - 1 } });
  currentRow++;

  const headerRowIndex = currentRow;
  aoa.push(buildSpecHeader(lang));
  rowHeights.push(MIN_ROW_HEIGHT_PT);
  currentRow++;

  const dataRows = await buildSpecDataRows(items, lang);
  const dataStartRow = currentRow;
  for (const row of dataRows) {
    aoa.push(row);
    rowHeights.push(calcRowHeight(row, COL_WRAP, COL_WIDTHS_CH));
    currentRow++;
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  ws["!merges"] = merges;

  for (let c = 0; c < colCount; c++) {
    applyCellStyle(ws, sectionTitleRow, c, STYLE_SECTION_TITLE);
  }

  if (projectMeta) {
    for (let i = 0; i < metaRowCount; i++) {
      const r = metaStartRow + i;
      applyCellStyle(ws, r, 0, STYLE_META_LABEL);
      applyCellStyle(ws, r, 1, STYLE_META_LABEL);
      applyCellStyle(ws, r, 2, STYLE_META_VALUE);
      for (let c = 3; c < colCount; c++) {
        applyCellStyle(ws, r, c, {
          fill: { fgColor: { rgb: COLOR_WHITE } },
          border: BORDERS_ALL,
        });
      }
    }
  }

  for (let c = 0; c < colCount; c++) {
    applyCellStyle(ws, specTitleRow, c, STYLE_SECTION_TITLE);
  }

  for (let c = 0; c < colCount; c++) {
    applyCellStyle(ws, headerRowIndex, c, STYLE_TABLE_HEADER);
  }

  const COL_ALIGNS = ["center", "left", "left", "left", "center", "left"];

  for (let i = 0; i < dataRows.length; i++) {
    const r = dataStartRow + i;
    const isZebra = i % 2 === 1;
    for (let c = 0; c < colCount; c++) {
      applyCellStyle(ws, r, c, makeDataStyle(isZebra, COL_WRAP[c], COL_ALIGNS[c]));
    }
  }

  ws["!cols"] = COL_WIDTHS_CH.map((wch) => ({ wch }));
  ws["!rows"] = rowHeights.map((hpt) => ({ hpt }));

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