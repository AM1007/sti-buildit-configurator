import type { ModelConstraints, ConstraintMatrix } from './types'

export const VALID_MODEL_CODES: readonly string[] = [
  'GFA0FR-EN',
  'GFA0HF-EN',
  'GFA2FR-EN',
  'GFA0PA-UA',
  'GFA2PA-UA',

  'GFC0FR-EN',
  'GFC0HF-EN',
  'GFC2FR-EN',
  'GFC0PA-UA',
  'GFC2PA-UA',
] as const

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES)

export interface GFSelectionState {
  model?: string
  cover?: string
  text?: string
  language?: string
}

export function buildGFModelCode(selections: GFSelectionState): string | null {
  const { model, cover, text, language } = selections

  if (!model || !cover || !text || !language) {
    return null
  }

  return `GF${model}${cover}${text}-${language}`
}

export function isValidGFCombination(
  selections: GFSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildGFModelCode(selections)

  if (!modelCode) {
    return { valid: true }
  }

  if (VALID_MODEL_SET.has(modelCode)) {
    return { valid: true }
  }

  return {
    valid: false,
    reason: `Model ${modelCode} is not available. This combination is not in the approved product list.`,
  }
}

export function getValidGFOptionsForStep(
  stepId: keyof GFSelectionState,
  currentSelections: Omit<GFSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>()

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseGFModelCode(code)
    if (!parsed) continue

    let matches = true
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof GFSelectionState] !== value) {
        matches = false
        break
      }
    }

    if (matches) {
      const optionValue = parsed[stepId]
      if (optionValue) {
        validOptions.add(optionValue)
      }
    }
  }

  return Array.from(validOptions)
}

export function parseGFModelCode(code: string): GFSelectionState | null {
  const match = code.match(/^GF([AC])(\d)([A-Z]{2})-([A-Z]{2})$/)

  if (!match) {
    return null
  }

  return {
    model: match[1],
    cover: match[2],
    text: match[3],
    language: match[4],
  }
}

const MODEL_TO_COVER: ConstraintMatrix = {
  A: ['0', '2'],
  C: ['0', '2'],
}

const MODEL_TO_TEXT: ConstraintMatrix = {
  A: ['FR', 'HF', 'PA'],
  C: ['FR', 'HF', 'PA'],
}

const MODEL_TO_LANGUAGE: ConstraintMatrix = {
  A: ['EN', 'UA'],
  C: ['EN', 'UA'],
}

const COVER_TO_MODEL: ConstraintMatrix = {
  '0': ['A', 'C'],
  '2': ['A', 'C'],
}

const COVER_TO_TEXT: ConstraintMatrix = {
  '0': ['FR', 'HF', 'PA'],
  '2': ['FR', 'PA'],
}

const COVER_TO_LANGUAGE: ConstraintMatrix = {
  '0': ['EN', 'UA'],
  '2': ['EN', 'UA'],
}

const TEXT_TO_MODEL: ConstraintMatrix = {
  FR: ['A', 'C'],
  HF: ['A', 'C'],
  PA: ['A', 'C'],
}

const TEXT_TO_COVER: ConstraintMatrix = {
  FR: ['0', '2'],
  HF: ['0'],
  PA: ['0', '2'],
}

const TEXT_TO_LANGUAGE: ConstraintMatrix = {
  FR: ['EN'],
  HF: ['EN'],
  PA: ['UA'],
}

const LANGUAGE_TO_MODEL: ConstraintMatrix = {
  EN: ['A', 'C'],
  UA: ['A', 'C'],
}

const LANGUAGE_TO_COVER: ConstraintMatrix = {
  EN: ['0', '2'],
  UA: ['0', '2'],
}

const LANGUAGE_TO_TEXT: ConstraintMatrix = {
  EN: ['FR', 'HF'],
  UA: ['PA'],
}

export const GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS: ModelConstraints = {
  modelId: 'gf-fire-alarm-push-button',
  constraints: [
    { sourceStep: 'model', targetStep: 'cover', matrix: MODEL_TO_COVER },
    { sourceStep: 'model', targetStep: 'text', matrix: MODEL_TO_TEXT },
    { sourceStep: 'model', targetStep: 'language', matrix: MODEL_TO_LANGUAGE },

    { sourceStep: 'cover', targetStep: 'model', matrix: COVER_TO_MODEL },
    { sourceStep: 'cover', targetStep: 'text', matrix: COVER_TO_TEXT },
    { sourceStep: 'cover', targetStep: 'language', matrix: COVER_TO_LANGUAGE },

    { sourceStep: 'text', targetStep: 'model', matrix: TEXT_TO_MODEL },
    { sourceStep: 'text', targetStep: 'cover', matrix: TEXT_TO_COVER },
    { sourceStep: 'text', targetStep: 'language', matrix: TEXT_TO_LANGUAGE },

    { sourceStep: 'language', targetStep: 'model', matrix: LANGUAGE_TO_MODEL },
    { sourceStep: 'language', targetStep: 'cover', matrix: LANGUAGE_TO_COVER },
    { sourceStep: 'language', targetStep: 'text', matrix: LANGUAGE_TO_TEXT },
  ],
}

export const DEBUG_MATRICES = {
  MODEL_TO_COVER,
  MODEL_TO_TEXT,
  MODEL_TO_LANGUAGE,
  COVER_TO_MODEL,
  COVER_TO_TEXT,
  COVER_TO_LANGUAGE,
  TEXT_TO_MODEL,
  TEXT_TO_COVER,
  TEXT_TO_LANGUAGE,
  LANGUAGE_TO_MODEL,
  LANGUAGE_TO_COVER,
  LANGUAGE_TO_TEXT,
  VALID_MODEL_CODES,
}
