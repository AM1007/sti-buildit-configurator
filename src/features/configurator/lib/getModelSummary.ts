import type { ModelId } from '@shared/types'

type Language = 'en' | 'uk'

type ModelSummaries = Record<string, string>

const summaryModules = import.meta.glob<{ default: ModelSummaries }>(
  '../../../shared/i18n/locales/*/modelSummaries/*.json',
  { eager: false },
)

const summariesCache = new Map<string, ModelSummaries>()

function buildGlobPath(lang: Language, modelId: string): string {
  return `../../../shared/i18n/locales/${lang}/modelSummaries/${modelId}.json`
}

function normalizeProductCode(productCode: string): string {
  return productCode.split('&')[0]
}

async function loadModelSummaries(
  modelId: ModelId,
  lang: Language,
): Promise<ModelSummaries | null> {
  const cacheKey = `${modelId}:${lang}`

  if (summariesCache.has(cacheKey)) {
    return summariesCache.get(cacheKey)!
  }

  const globPath = buildGlobPath(lang, modelId)
  const loader = summaryModules[globPath]

  if (!loader) {
    console.warn(`[getModelSummary] No summary file found for path: ${globPath}`)
    return null
  }

  try {
    const module = await loader()
    const summaries: ModelSummaries = module.default

    summariesCache.set(cacheKey, summaries)

    return summaries
  } catch (error) {
    console.error(
      `[getModelSummary] Failed to load summaries for ${modelId} (${lang}):`,
      error,
    )
    return null
  }
}

export async function getModelSummary(
  productCode: string,
  modelId: ModelId,
  lang: Language,
): Promise<string | null> {
  const normalizedCode = normalizeProductCode(productCode)

  let summaries = await loadModelSummaries(modelId, lang)

  if (!summaries && lang !== 'en') {
    summaries = await loadModelSummaries(modelId, 'en')
  }

  if (!summaries) {
    return null
  }

  return summaries[normalizedCode] ?? null
}

export function getModelSummarySync(
  productCode: string,
  modelId: ModelId,
  lang: Language,
): string | null {
  const cacheKey = `${modelId}:${lang}`
  const summaries = summariesCache.get(cacheKey)

  if (!summaries) {
    return null
  }

  const normalizedCode = normalizeProductCode(productCode)

  return summaries[normalizedCode] ?? null
}

export async function preloadModelSummaries(
  modelId: ModelId,
  lang: Language,
): Promise<void> {
  await loadModelSummaries(modelId, lang)
}

export function clearModelSummariesCache(): void {
  summariesCache.clear()
}
