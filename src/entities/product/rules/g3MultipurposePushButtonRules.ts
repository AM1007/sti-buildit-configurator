import type { ModelConstraints, ConstraintMatrix } from './types'

export const VALID_MODEL_CODES: readonly string[] = [
  'G3A209ZA-EN',
  'G3A209ZA-UA',
  'G3A229ZA-EN',
  'G3A229ZA-UA',
  'G3A309ZA-EN',
  'G3A309ZA-UA',
  'G3A329ZA-EN',
  'G3A329ZA-UA',
  'G3A409ZA-EN',
  'G3A409ZA-UA',
  'G3A429ZA-EN',
  'G3A429ZA-UA',

  'G3C002ZA-EN',
  'G3C002ZA-UA',
  'G3C022ZA-EN',
  'G3C022ZA-UA',
  'G3C102ZA-EN',
  'G3C102ZA-UA',
  'G3C105RM-EN',
  'G3C105XT-EN',
  'G3C109XT-EN',
  'G3C122ZA-EN',
  'G3C122ZA-UA',
  'G3C209ZA-EN',
  'G3C209ZA-UA',
  'G3C325ZA-EN',
  'G3C325ZA-UA',
  'G3C405ZA-EN',
  'G3C405ZA-UA',
  'G3C409ZA-EN',
  'G3C409ZA-UA',
  'G3C429ZA-EN',
  'G3C429ZA-UA',
] as const

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES)

export interface G3SelectionState {
  model?: string
  colour?: string
  cover?: string
  buttonType?: string
  text?: string
  language?: string
}

export function buildG3ModelCode(selections: G3SelectionState): string | null {
  const { model, colour, cover, buttonType, text, language } = selections

  if (!model || !colour || !cover || !buttonType || !text || !language) {
    return null
  }

  return `G3${model}${colour}${cover}${buttonType}${text}-${language}`
}

export function isValidG3Combination(
  selections: G3SelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildG3ModelCode(selections)

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

export function getValidOptionsForStep(
  stepId: keyof G3SelectionState,
  currentSelections: Omit<G3SelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>()

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseG3ModelCode(code)
    if (!parsed) continue

    let matches = true
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof G3SelectionState] !== value) {
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

export function parseG3ModelCode(code: string): G3SelectionState | null {
  const match = code.match(/^G3([AC])(\d)(\d)(\d)([A-Z]{2})-([A-Z]{2})$/)

  if (!match) {
    return null
  }

  return {
    model: match[1],
    colour: match[2],
    cover: match[3],
    buttonType: match[4],
    text: match[5],
    language: match[6],
  }
}

const MODEL_TO_COLOUR: ConstraintMatrix = {
  A: ['2', '3', '4'],
  C: ['0', '1', '2', '3', '4'],
}

const MODEL_TO_COVER: ConstraintMatrix = {
  A: ['0', '2'],
  C: ['0', '2'],
}

const MODEL_TO_BUTTONTYPE: ConstraintMatrix = {
  A: ['9'],
  C: ['2', '5', '9'],
}

const MODEL_TO_TEXT: ConstraintMatrix = {
  A: ['ZA'],
  C: ['ZA', 'RM', 'XT'],
}

const MODEL_TO_LANGUAGE: ConstraintMatrix = {
  A: ['EN', 'UA'],
  C: ['EN', 'UA'],
}

const COLOUR_TO_MODEL: ConstraintMatrix = {
  '0': ['C'],
  '1': ['C'],
  '2': ['A', 'C'],
  '3': ['A', 'C'],
  '4': ['A', 'C'],
}

const COLOUR_TO_COVER: ConstraintMatrix = {
  '0': ['0', '2'],
  '1': ['0', '2'],
  '2': ['0', '2'],
  '3': ['0', '2'],
  '4': ['0', '2'],
}

const COLOUR_TO_BUTTONTYPE: ConstraintMatrix = {
  '0': ['2'],
  '1': ['2', '5', '9'],
  '2': ['9'],
  '3': ['5', '9'],
  '4': ['5', '9'],
}

const COLOUR_TO_TEXT: ConstraintMatrix = {
  '0': ['ZA'],
  '1': ['RM', 'XT', 'ZA'],
  '2': ['ZA'],
  '3': ['ZA'],
  '4': ['ZA'],
}

const COVER_TO_MODEL: ConstraintMatrix = {
  '0': ['A', 'C'],
  '2': ['A', 'C'],
}

const COVER_TO_COLOUR: ConstraintMatrix = {
  '0': ['0', '1', '2', '3', '4'],
  '2': ['0', '1', '2', '3', '4'],
}

const COVER_TO_BUTTONTYPE: ConstraintMatrix = {
  '0': ['2', '5', '9'],
  '2': ['2', '5', '9'],
}

const COVER_TO_TEXT: ConstraintMatrix = {
  '0': ['ZA', 'RM', 'XT'],
  '2': ['ZA', 'XT'],
}

const BUTTONTYPE_TO_MODEL: ConstraintMatrix = {
  '2': ['C'],
  '5': ['C'],
  '9': ['A', 'C'],
}

const BUTTONTYPE_TO_COLOUR: ConstraintMatrix = {
  '2': ['0', '1'],
  '5': ['1', '3', '4'],
  '9': ['1', '2', '3', '4'],
}

const BUTTONTYPE_TO_COVER: ConstraintMatrix = {
  '2': ['0', '2'],
  '5': ['0', '2'],
  '9': ['0', '2'],
}

const BUTTONTYPE_TO_TEXT: ConstraintMatrix = {
  '2': ['ZA'],
  '5': ['RM', 'XT', 'ZA'],
  '9': ['ZA', 'XT'],
}

const TEXT_TO_MODEL: ConstraintMatrix = {
  ZA: ['A', 'C'],
  RM: ['C'],
  XT: ['C'],
  EX: ['C'],
}

const TEXT_TO_COLOUR: ConstraintMatrix = {
  ZA: ['0', '1', '2', '3', '4'],
  RM: ['1'],
  XT: ['1'],
  EX: ['1'],
}

const TEXT_TO_COVER: ConstraintMatrix = {
  ZA: ['0', '2'],
  RM: ['0'],
  XT: ['0', '2'],
  EX: ['0', '2'],
}

const TEXT_TO_BUTTONTYPE: ConstraintMatrix = {
  ZA: ['2', '5', '9'],
  RM: ['5'],
  XT: ['5', '9'],
  EX: ['2', '5'],
}

const TEXT_TO_LANGUAGE: ConstraintMatrix = {
  ZA: ['EN', 'UA'],
  RM: ['EN'],
  XT: ['EN'],
  EX: ['EN'],
}

const LANGUAGE_TO_MODEL: ConstraintMatrix = {
  EN: ['A', 'C'],
  UA: ['A', 'C'],
}

const LANGUAGE_TO_COLOUR: ConstraintMatrix = {
  EN: ['0', '1', '2', '3', '4'],
  UA: ['0', '1', '2', '3', '4'],
}

const LANGUAGE_TO_COVER: ConstraintMatrix = {
  EN: ['0', '2'],
  UA: ['0', '2'],
}

const LANGUAGE_TO_BUTTONTYPE: ConstraintMatrix = {
  EN: ['2', '5', '9'],
  UA: ['2', '5', '9'],
}

const LANGUAGE_TO_TEXT: ConstraintMatrix = {
  EN: ['ZA', 'RM', 'XT'],
  UA: ['ZA'],
}

export const G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS: ModelConstraints = {
  modelId: 'g3-multipurpose-push-button',
  constraints: [
    { sourceStep: 'model', targetStep: 'colour', matrix: MODEL_TO_COLOUR },
    { sourceStep: 'model', targetStep: 'cover', matrix: MODEL_TO_COVER },
    { sourceStep: 'model', targetStep: 'buttonType', matrix: MODEL_TO_BUTTONTYPE },
    { sourceStep: 'model', targetStep: 'text', matrix: MODEL_TO_TEXT },
    { sourceStep: 'model', targetStep: 'language', matrix: MODEL_TO_LANGUAGE },

    { sourceStep: 'colour', targetStep: 'model', matrix: COLOUR_TO_MODEL },
    { sourceStep: 'colour', targetStep: 'cover', matrix: COLOUR_TO_COVER },
    { sourceStep: 'colour', targetStep: 'buttonType', matrix: COLOUR_TO_BUTTONTYPE },
    { sourceStep: 'colour', targetStep: 'text', matrix: COLOUR_TO_TEXT },

    { sourceStep: 'cover', targetStep: 'model', matrix: COVER_TO_MODEL },
    { sourceStep: 'cover', targetStep: 'colour', matrix: COVER_TO_COLOUR },
    { sourceStep: 'cover', targetStep: 'buttonType', matrix: COVER_TO_BUTTONTYPE },
    { sourceStep: 'cover', targetStep: 'text', matrix: COVER_TO_TEXT },

    { sourceStep: 'buttonType', targetStep: 'model', matrix: BUTTONTYPE_TO_MODEL },
    { sourceStep: 'buttonType', targetStep: 'colour', matrix: BUTTONTYPE_TO_COLOUR },
    { sourceStep: 'buttonType', targetStep: 'cover', matrix: BUTTONTYPE_TO_COVER },
    { sourceStep: 'buttonType', targetStep: 'text', matrix: BUTTONTYPE_TO_TEXT },

    { sourceStep: 'text', targetStep: 'model', matrix: TEXT_TO_MODEL },
    { sourceStep: 'text', targetStep: 'colour', matrix: TEXT_TO_COLOUR },
    { sourceStep: 'text', targetStep: 'cover', matrix: TEXT_TO_COVER },
    { sourceStep: 'text', targetStep: 'buttonType', matrix: TEXT_TO_BUTTONTYPE },
    { sourceStep: 'text', targetStep: 'language', matrix: TEXT_TO_LANGUAGE },

    { sourceStep: 'language', targetStep: 'model', matrix: LANGUAGE_TO_MODEL },
    { sourceStep: 'language', targetStep: 'colour', matrix: LANGUAGE_TO_COLOUR },
    { sourceStep: 'language', targetStep: 'cover', matrix: LANGUAGE_TO_COVER },
    { sourceStep: 'language', targetStep: 'buttonType', matrix: LANGUAGE_TO_BUTTONTYPE },
    { sourceStep: 'language', targetStep: 'text', matrix: LANGUAGE_TO_TEXT },
  ],
}

export const DEBUG_MATRICES = {
  MODEL_TO_COLOUR,
  MODEL_TO_COVER,
  MODEL_TO_BUTTONTYPE,
  MODEL_TO_TEXT,
  MODEL_TO_LANGUAGE,
  COLOUR_TO_MODEL,
  COLOUR_TO_COVER,
  COLOUR_TO_BUTTONTYPE,
  COLOUR_TO_TEXT,
  COVER_TO_MODEL,
  COVER_TO_COLOUR,
  COVER_TO_BUTTONTYPE,
  COVER_TO_TEXT,
  BUTTONTYPE_TO_MODEL,
  BUTTONTYPE_TO_COLOUR,
  BUTTONTYPE_TO_COVER,
  BUTTONTYPE_TO_TEXT,
  TEXT_TO_MODEL,
  TEXT_TO_COLOUR,
  TEXT_TO_COVER,
  TEXT_TO_BUTTONTYPE,
  TEXT_TO_LANGUAGE,
  LANGUAGE_TO_MODEL,
  LANGUAGE_TO_COLOUR,
  LANGUAGE_TO_COVER,
  LANGUAGE_TO_BUTTONTYPE,
  LANGUAGE_TO_TEXT,
  VALID_MODEL_CODES,
}
