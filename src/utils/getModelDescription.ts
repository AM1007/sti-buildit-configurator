import type { ModelId } from "../types";

type Language = "en" | "uk";

type ModelDescriptions = Record<string, string>;

const descriptionModules = import.meta.glob<{ default: ModelDescriptions }>(
  "../i18n/locales/*/modelDescriptions/*.json",
  { eager: false }
);

const descriptionsCache = new Map<string, ModelDescriptions>();

function buildGlobPath(lang: Language, modelId: string): string {
  return `../i18n/locales/${lang}/modelDescriptions/${modelId}.json`;
}

function normalizeProductCode(productCode: string): string {
  return productCode.split("&")[0];
}

async function loadModelDescriptions(
  modelId: ModelId,
  lang: Language
): Promise<ModelDescriptions | null> {
  const cacheKey = `${modelId}:${lang}`;
  
  if (descriptionsCache.has(cacheKey)) {
    return descriptionsCache.get(cacheKey)!;
  }

  const globPath = buildGlobPath(lang, modelId);
  const loader = descriptionModules[globPath];

  if (!loader) {
    console.warn(
      `[getModelDescription] No description file found for path: ${globPath}`
    );
    console.warn(
      `[getModelDescription] Available paths:`,
      Object.keys(descriptionModules)
    );
    return null;
  }

  try {
    const module = await loader();
    const descriptions: ModelDescriptions = module.default;
    
    descriptionsCache.set(cacheKey, descriptions);
    console.log(
      `[getModelDescription] Loaded descriptions for ${modelId} (${lang}):`,
      Object.keys(descriptions).length,
      "entries"
    );
    
    return descriptions;
  } catch (error) {
    console.error(
      `[getModelDescription] Failed to load descriptions for ${modelId} (${lang}):`,
      error
    );
    return null;
  }
}

export async function getModelDescription(
  productCode: string,
  modelId: ModelId,
  lang: Language
): Promise<string | null> {
  const normalizedCode = normalizeProductCode(productCode);
  
  let descriptions = await loadModelDescriptions(modelId, lang);
  
  if (!descriptions && lang !== "en") {
    console.warn(
      `[getModelDescription] Falling back to EN for ${modelId}`
    );
    descriptions = await loadModelDescriptions(modelId, "en");
  }

  if (!descriptions) {
    console.warn(
      `[getModelDescription] No descriptions available for model: ${modelId}`
    );
    return null;
  }

  const description = descriptions[normalizedCode] ?? null;
  
  if (!description) {
    console.warn(
      `[getModelDescription] No description found for product code: ${productCode} (normalized: ${normalizedCode})`
    );
  }

  return description;
}

export function getModelDescriptionSync(
  productCode: string,
  modelId: ModelId,
  lang: Language
): string | null {
  const cacheKey = `${modelId}:${lang}`;
  const descriptions = descriptionsCache.get(cacheKey);
  
  if (!descriptions) {
    return null;
  }

  const normalizedCode = normalizeProductCode(productCode);

  return descriptions[normalizedCode] ?? null;
}

export async function preloadModelDescriptions(
  modelId: ModelId,
  lang: Language
): Promise<void> {
  await loadModelDescriptions(modelId, lang);
}

export function clearModelDescriptionsCache(): void {
  descriptionsCache.clear();
}

export function listAvailableDescriptionModules(): string[] {
  return Object.keys(descriptionModules);
}