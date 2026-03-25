import type { ModelConstraints, ConstraintMatrix } from './types'
import { registerProductConstraints, buildAllowlistSet } from '../constraintRegistry'
import type { Configuration } from '@shared/types'

export const VALID_GLR_CODES: readonly string[] = [
  'GLR001ZA-EN',
  'GLR001ZA-UA',
  'GLR101EM-EN',
  'GLR101EX-EN',
  'GLR101RM-EN',
  'GLR101ZA-EN',
  'GLR101ZA-UA',
  'GLR201ZA-EN',
  'GLR201ZA-UA',
  'GLR301ZA-EN',
  'GLR301ZA-UA',
  'GLR401ZA-EN',
  'GLR401ZA-UA',
] as const

export const VALID_GR_CODES: readonly string[] = [
  'GR-RF-22-0',
  'GR-RF-22-0-EN',
  'GR-RS-22-0',
  'GR-RS-22-0-EN',
] as const

export const VALID_MODEL_CODES: readonly string[] = [
  ...VALID_GLR_CODES,
  ...VALID_GR_CODES,
] as const

const VALID_GLR_SET = new Set(VALID_GLR_CODES)
const VALID_GR_SET = new Set(VALID_GR_CODES)

export interface GLRSelectionState {
  colour?: string
  text?: string
  language?: string
}

export interface GRSelectionState {
  mounting?: string
  grText?: string
}

export function buildGLRModelCode(selections: GLRSelectionState): string | null {
  const { colour, text, language } = selections
  if (!colour || !text || !language) return null
  return `GLR${colour}${text}-${language}`
}

export function buildGRModelCode(selections: GRSelectionState): string | null {
  const { mounting, grText } = selections
  if (!mounting || !grText) return null
  return `GR-R${mounting}-${grText}`
}

export function isValidGLRCombination(
  selections: GLRSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildGLRModelCode(selections)
  if (!modelCode) return { valid: true }
  if (VALID_GLR_SET.has(modelCode)) return { valid: true }
  return { valid: false, reason: `Model ${modelCode} is not available.` }
}

export function isValidGRCombination(
  selections: GRSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildGRModelCode(selections)
  if (!modelCode) return { valid: true }
  if (VALID_GR_SET.has(modelCode)) return { valid: true }
  return { valid: false, reason: `Model ${modelCode} is not available.` }
}

export function parseGLRModelCode(code: string): GLRSelectionState | null {
  const match = code.match(/^GLR(\d{3})([A-Z]{2})-([A-Z]{2})$/)
  if (!match) return null
  return {
    colour: match[1],
    text: match[2],
    language: match[3],
  }
}

export function parseGRModelCode(code: string): GRSelectionState | null {
  const match = code.match(/^GR-R([FS])-(.+)$/)
  if (!match) return null
  return {
    mounting: match[1],
    grText: match[2],
  }
}

export function getValidGLROptionsForStep(
  stepId: keyof GLRSelectionState,
  currentSelections: Omit<GLRSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>()
  for (const code of VALID_GLR_CODES) {
    const parsed = parseGLRModelCode(code)
    if (!parsed) continue
    let matches = true
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof GLRSelectionState] !== value) {
        matches = false
        break
      }
    }
    if (matches) {
      const optionValue = parsed[stepId]
      if (optionValue) validOptions.add(optionValue)
    }
  }
  return Array.from(validOptions)
}

export function getValidGROptionsForStep(
  stepId: keyof GRSelectionState,
  currentSelections: Omit<GRSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>()
  for (const code of VALID_GR_CODES) {
    const parsed = parseGRModelCode(code)
    if (!parsed) continue
    let matches = true
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof GRSelectionState] !== value) {
        matches = false
        break
      }
    }
    if (matches) {
      const optionValue = parsed[stepId]
      if (optionValue) validOptions.add(optionValue)
    }
  }
  return Array.from(validOptions)
}

const GLR_COLOUR_TO_TEXT: ConstraintMatrix = {
  '001': ['ZA'],
  '101': ['EM', 'EX', 'RM', 'ZA'],
  '201': ['ZA'],
  '301': ['ZA'],
  '401': ['ZA'],
}

const GLR_TEXT_TO_COLOUR: ConstraintMatrix = {
  EM: ['101'],
  EX: ['101'],
  RM: ['101'],
  ZA: ['001', '101', '201', '301', '401'],
}

const GLR_TEXT_TO_LANGUAGE: ConstraintMatrix = {
  EM: ['EN'],
  EX: ['EN'],
  RM: ['EN'],
  ZA: ['EN', 'UA'],
}

const GLR_LANGUAGE_TO_TEXT: ConstraintMatrix = {
  EN: ['EM', 'EX', 'RM', 'ZA'],
  UA: ['ZA'],
}

const GLR_COLOUR_TO_LANGUAGE: ConstraintMatrix = {
  '001': ['EN', 'UA'],
  '101': ['EN', 'UA'],
  '201': ['EN', 'UA'],
  '301': ['EN', 'UA'],
  '401': ['EN', 'UA'],
}

const GLR_LANGUAGE_TO_COLOUR: ConstraintMatrix = {
  EN: ['001', '101', '201', '301', '401'],
  UA: ['001', '101', '201', '301', '401'],
}

export const GLOBAL_RESET_CONSTRAINTS: ModelConstraints = {
  modelId: 'global-reset',
  constraints: [
    { sourceStep: 'colour', targetStep: 'text', matrix: GLR_COLOUR_TO_TEXT },
    { sourceStep: 'text', targetStep: 'colour', matrix: GLR_TEXT_TO_COLOUR },
    { sourceStep: 'text', targetStep: 'language', matrix: GLR_TEXT_TO_LANGUAGE },
    { sourceStep: 'language', targetStep: 'text', matrix: GLR_LANGUAGE_TO_TEXT },
    { sourceStep: 'colour', targetStep: 'language', matrix: GLR_COLOUR_TO_LANGUAGE },
    { sourceStep: 'language', targetStep: 'colour', matrix: GLR_LANGUAGE_TO_COLOUR },
  ],
}

export const DEBUG_MATRICES = {
  GLR_COLOUR_TO_TEXT,
  GLR_TEXT_TO_COLOUR,
  GLR_TEXT_TO_LANGUAGE,
  GLR_LANGUAGE_TO_TEXT,
  VALID_GLR_CODES,
  VALID_GR_CODES,
}

const GLR_ALLOWLIST_STEPS = ['colour', 'cover', 'text', 'language']
const GR_ALLOWLIST_STEPS = ['mounting', 'grText']

function globalResetAllowlistFn(
  stepId: string,
  config: Configuration,
): Set<string> | null {
  const series = config['series'] ?? null

  if (stepId === 'series') return null

  if (series === 'GR') {
    if (GLR_ALLOWLIST_STEPS.includes(stepId)) return new Set()
    if (GR_ALLOWLIST_STEPS.includes(stepId)) {
      return buildAllowlistSet(stepId, config, GR_ALLOWLIST_STEPS, (s, o) =>
        getValidGROptionsForStep(s as never, o as never),
      )
    }
    return null
  }

  if (series === 'GLR') {
    if (GR_ALLOWLIST_STEPS.includes(stepId)) return new Set()
    if (GLR_ALLOWLIST_STEPS.includes(stepId)) {
      return buildAllowlistSet(stepId, config, GLR_ALLOWLIST_STEPS, (s, o) =>
        getValidGLROptionsForStep(s as never, o as never),
      )
    }
    return null
  }

  if (GLR_ALLOWLIST_STEPS.includes(stepId) || GR_ALLOWLIST_STEPS.includes(stepId)) {
    return new Set()
  }

  return null
}

registerProductConstraints(
  'global-reset',
  GLOBAL_RESET_CONSTRAINTS,
  globalResetAllowlistFn,
)
