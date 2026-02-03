import type { ModelId } from "../types";

type Language = "en" | "uk";

type ModelTranslations = {
  meta?: {
    heroDescription?: string;
    description?: string;
    name?: string;
  };
};

const translationModules = import.meta.glob<{ default: ModelTranslations }>(
  "../i18n/locales/*/models/*.json",
  { eager: false }
);

const heroDescriptionCache = new Map<string, string>();

function buildGlobPath(lang: Language, modelId: string): string {
  return `../i18n/locales/${lang}/models/${modelId}.json`;
}

async function loadModelTranslations(
  modelId: ModelId,
  lang: Language
): Promise<ModelTranslations | null> {
  const globPath = buildGlobPath(lang, modelId);
  const loader = translationModules[globPath];

  if (!loader) {
    console.warn(
      `[getHeroDescription] No translation file found for path: ${globPath}`
    );
    return null;
  }

  try {
    const module = await loader();
    return module.default;
  } catch (error) {
    console.error(
      `[getHeroDescription] Failed to load translations for ${modelId} (${lang}):`,
      error
    );
    return null;
  }
}

export async function getHeroDescription(
  modelId: ModelId,
  lang: Language
): Promise<string | null> {
  const cacheKey = `${modelId}:${lang}`;

  if (heroDescriptionCache.has(cacheKey)) {
    return heroDescriptionCache.get(cacheKey)!;
  }

  let translations = await loadModelTranslations(modelId, lang);

  if (!translations && lang !== "en") {
    console.warn(
      `[getHeroDescription] Falling back to EN for ${modelId}`
    );
    translations = await loadModelTranslations(modelId, "en");
  }

  if (!translations?.meta?.heroDescription) {
    console.warn(
      `[getHeroDescription] No heroDescription found for model: ${modelId}`
    );
    return null;
  }

  const heroDescription = translations.meta.heroDescription;
  heroDescriptionCache.set(cacheKey, heroDescription);

  return heroDescription;
}

export function clearHeroDescriptionCache(): void {
  heroDescriptionCache.clear();
}