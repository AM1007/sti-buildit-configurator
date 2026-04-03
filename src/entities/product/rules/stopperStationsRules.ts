import type { ModelConstraints, ConstraintMatrix } from './types'
import { registerProductConstraints } from '../constraintRegistry'
import type { Configuration } from '@shared/types'

export const VALID_MODEL_CODES: readonly string[] = [
  'SS2000NT-EN',
  'SS2000ZA-EN',
  'SS2000ZA-UA',
  'SS2001NT-EN',
  'SS2001ZA-EN',
  'SS2001ZA-UA',
  'SS2002NT-EN',
  'SS2002ZA-EN',
  'SS2002ZA-UA',
  'SS2003NT-EN',
  'SS2003ZA-EN',
  'SS2003ZA-UA',
  'SS2004NT-EN',
  'SS2004ZA-EN',
  'SS2004ZA-UA',
  'SS2005NT-EN',
  'SS2005ZA-EN',
  'SS2005ZA-UA',
  'SS2006NT-EN',
  'SS2006ZA-EN',
  'SS2006ZA-UA',
  'SS2007ZA-EN',
  'SS2007ZA-UA',
  'SS2008ZA-EN',
  'SS2008ZA-UA',
  'SS2009ZA-EN',
  'SS2009ZA-UA',

  'SS2100NT-EN',
  'SS2100ZA-EN',
  'SS2100ZA-UA',
  'SS2101ZA-EN',
  'SS2101ZA-UA',
  'SS2102NT-EN',
  'SS2102XT-EN',
  'SS2102ZA-EN',
  'SS2102ZA-UA',
  'SS2103NT-EN',
  'SS2103ZA-EN',
  'SS2103ZA-UA',
  'SS2104NT-EN',
  'SS2104PX-EN',
  'SS2104XT-EN',
  'SS2104ZA-EN',
  'SS2104ZA-UA',
  'SS2105NT-EN',
  'SS2105PX-EN',
  'SS2105ZA-EN',
  'SS2105ZA-UA',
  'SS2106NT-EN',
  'SS2106PX-EN',
  'SS2106XT-EN',
  'SS2106ZA-EN',
  'SS2106ZA-UA',
  'SS2107XT-EN',
  'SS2107ZA-EN',
  'SS2107ZA-UA',
  'SS2108NT-EN',
  'SS2108PX-EN',
  'SS2108XT-EN',
  'SS2108ZA-EN',
  'SS2108ZA-UA',
  'SS2109NT-EN',
  'SS2109PX-EN',
  'SS2109ZA-EN',

  'SS2200ZA-EN',
  'SS2200ZA-UA',
  'SS2201NT-EN',
  'SS2201ZA-EN',
  'SS2201ZA-UA',
  'SS2202NT-EN',
  'SS2202ZA-EN',
  'SS2202ZA-UA',
  'SS2203NT-EN',
  'SS2203ZA-EN',
  'SS2203ZA-UA',
  'SS2204NT-EN',
  'SS2204ZA-EN',
  'SS2204ZA-UA',
  'SS2205NT-EN',
  'SS2205ZA-EN',
  'SS2205ZA-UA',
  'SS2207ZA-EN',
  'SS2207ZA-UA',
  'SS2208NT-EN',
  'SS2208ZA-EN',
  'SS2208ZA-UA',
  'SS2209NT-EN',
  'SS2209ZA-EN',
  'SS2209ZA-UA',

  'SS2300EM-EN',
  'SS2301NT-EN',
  'SS2301ZA-EN',
  'SS2301ZA-UA',
  'SS2302ZA-EN',
  'SS2302ZA-UA',
  'SS2303NT-EN',
  'SS2303ZA-EN',
  'SS2303ZA-UA',
  'SS2304NT-EN',
  'SS2304ZA-EN',
  'SS2304ZA-UA',
  'SS2305ZA-EN',
  'SS2305ZA-UA',
  'SS2307ZA-EN',
  'SS2307ZA-UA',
  'SS2308NT-EN',
  'SS2308ZA-EN',
  'SS2308ZA-UA',
  'SS2309ZA-EN',
  'SS2309ZA-UA',

  'SS2400NT-EN',
  'SS2400ZA-EN',
  'SS2400ZA-UA',
  'SS2401NT-EN',
  'SS2401ZA-EN',
  'SS2401ZA-UA',
  'SS2402NT-EN',
  'SS2402ZA-EN',
  'SS2402ZA-UA',
  'SS2403NT-EN',
  'SS2403ZA-EN',
  'SS2403ZA-UA',
  'SS2404ZA-EN',
  'SS2404ZA-UA',
  'SS2405ZA-EN',
  'SS2405ZA-UA',
  'SS2406ZA-EN',
  'SS2406ZA-UA',
  'SS2408NT-EN',
  'SS2408ZA-EN',
  'SS2408ZA-UA',
  'SS2409NT-EN',
  'SS2409ZA-EN',
  'SS2409ZA-UA',

  'SS2501ZA-EN',
  'SS2501ZA-UA',
  'SS2502ZA-EN',
  'SS2502ZA-UA',
  'SS2503ZA-EN',
  'SS2503ZA-UA',
  'SS2509ZA-EN',
  'SS2509ZA-UA',
] as const

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES)

export interface SSSelectionState {
  colour?: string
  activation?: string
  text?: string
  language?: string
}

export function buildSSModelCode(selections: SSSelectionState): string | null {
  const { colour, activation, text, language } = selections
  if (!colour || !activation || !text || !language) return null

  return `SS2${colour}0${activation}${text}-${language}`
}

export function isValidSSCombination(
  selections: SSSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildSSModelCode(selections)

  if (!modelCode) return { valid: true }

  if (VALID_MODEL_SET.has(modelCode)) return { valid: true }

  return {
    valid: false,
    reason: `Model ${modelCode} is not available. This combination is not in the approved product list.`,
  }
}

export function getValidSSOptionsForStep(
  stepId: keyof SSSelectionState,
  currentSelections: Omit<SSSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>()

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseSSModelCode(code)
    if (!parsed) continue

    let matches = true
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof SSSelectionState] !== value) {
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

export function parseSSModelCode(code: string): SSSelectionState | null {
  const match = code.match(/^SS2(\d)0(\d)([A-Z]{2})-([A-Z]{2})$/)
  if (!match) return null

  return {
    colour: match[1],
    activation: match[2],
    text: match[3],
    language: match[4],
  }
}

const COLOUR_TO_ACTIVATION: ConstraintMatrix = {
  '0': ['0', '1', '2', '3', '4', '5', '6-red', '7-red', '8', '9'],
  '1': ['0', '1', '2', '3', '4', '5', '6-green', '7-green', '8', '9'],
  '2': ['0', '1', '2', '3', '4', '5', '7-red', '8', '9'],
  '3': ['0', '1', '2', '3', '4', '5', '7-red', '8', '9'],
  '4': ['0', '1', '2', '3', '4', '5', '6-blue', '8', '9'],
  '5': ['1', '2', '3', '9'],
}

const ACTIVATION_TO_COLOUR: ConstraintMatrix = {
  '0': ['0', '1', '2', '3', '4'],
  '1': ['0', '1', '2', '3', '4', '5'],
  '2': ['0', '1', '2', '3', '4', '5'],
  '3': ['0', '1', '2', '3', '4', '5'],
  '4': ['0', '1', '2', '3', '4'],
  '5': ['0', '1', '2', '3', '4'],
  '6-red': ['0'],
  '6-green': ['1'],
  '6-blue': ['4'],
  '7-red': ['0', '2', '3'],
  '7-green': ['1'],
  '8': ['0', '1', '2', '3', '4'],
  '9': ['0', '1', '2', '3', '4', '5'],
}

const COLOUR_TO_TEXT: ConstraintMatrix = {
  '0': ['NT', 'ZA'],
  '1': ['NT', 'PX', 'XT', 'ZA'],
  '2': ['NT', 'ZA'],
  '3': ['EM', 'NT', 'ZA'],
  '4': ['NT', 'ZA'],
  '5': ['ZA'],
}

const TEXT_TO_COLOUR: ConstraintMatrix = {
  EM: ['3'],
  NT: ['0', '1', '2', '3', '4'],
  PX: ['1'],
  XT: ['1'],
  ZA: ['0', '1', '2', '3', '4', '5'],
}

const COLOUR_TO_LANGUAGE: ConstraintMatrix = {
  '0': ['EN', 'UA'],
  '1': ['EN', 'UA'],
  '2': ['EN', 'UA'],
  '3': ['EN', 'UA'],
  '4': ['EN', 'UA'],
  '5': ['EN', 'UA'],
}

const LANGUAGE_TO_COLOUR: ConstraintMatrix = {
  EN: ['0', '1', '2', '3', '4', '5'],
  UA: ['0', '1', '2', '3', '4', '5'],
}

const ACTIVATION_TO_TEXT: ConstraintMatrix = {
  '0': ['EM', 'NT', 'ZA'],
  '1': ['NT', 'ZA'],
  '2': ['NT', 'XT', 'ZA'],
  '3': ['NT', 'ZA'],
  '4': ['NT', 'PX', 'XT', 'ZA'],
  '5': ['NT', 'PX', 'ZA'],
  '6-red': ['NT', 'ZA'],
  '6-green': ['NT', 'PX', 'XT', 'ZA'],
  '6-blue': ['ZA'],
  '7-red': ['ZA'],
  '7-green': ['XT', 'ZA'],
  '8': ['NT', 'PX', 'XT', 'ZA'],
  '9': ['NT', 'PX', 'ZA'],
}

const TEXT_TO_ACTIVATION: ConstraintMatrix = {
  EM: ['0'],
  NT: ['0', '1', '2', '3', '4', '5', '6-red', '6-green', '8', '9'],
  PX: ['4', '5', '6-green', '8', '9'],
  XT: ['2', '4', '6-green', '7-green', '8'],
  ZA: [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6-red',
    '6-green',
    '6-blue',
    '7-red',
    '7-green',
    '8',
    '9',
  ],
}

const ACTIVATION_TO_LANGUAGE: ConstraintMatrix = {
  '0': ['EN', 'UA'],
  '1': ['EN', 'UA'],
  '2': ['EN', 'UA'],
  '3': ['EN', 'UA'],
  '4': ['EN', 'UA'],
  '5': ['EN', 'UA'],
  '6-red': ['EN', 'UA'],
  '6-green': ['EN', 'UA'],
  '6-blue': ['EN', 'UA'],
  '7-red': ['EN', 'UA'],
  '7-green': ['EN', 'UA'],
  '8': ['EN', 'UA'],
  '9': ['EN', 'UA'],
}

const LANGUAGE_TO_ACTIVATION: ConstraintMatrix = {
  EN: [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6-red',
    '6-green',
    '6-blue',
    '7-red',
    '7-green',
    '8',
    '9',
  ],
  UA: [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6-red',
    '6-green',
    '6-blue',
    '7-red',
    '7-green',
    '8',
    '9',
  ],
}

const TEXT_TO_LANGUAGE: ConstraintMatrix = {
  EM: ['EN'],
  NT: ['EN'],
  PX: ['EN'],
  XT: ['EN'],
  ZA: ['EN', 'UA'],
}

const LANGUAGE_TO_TEXT: ConstraintMatrix = {
  EN: ['EM', 'NT', 'PX', 'XT', 'ZA'],
  UA: ['ZA'],
}

export const STOPPER_STATIONS_CONSTRAINTS: ModelConstraints = {
  modelId: 'stopper-stations',
  constraints: [
    { sourceStep: 'colour', targetStep: 'activation', matrix: COLOUR_TO_ACTIVATION },
    { sourceStep: 'activation', targetStep: 'colour', matrix: ACTIVATION_TO_COLOUR },

    { sourceStep: 'colour', targetStep: 'text', matrix: COLOUR_TO_TEXT },
    { sourceStep: 'text', targetStep: 'colour', matrix: TEXT_TO_COLOUR },

    { sourceStep: 'colour', targetStep: 'language', matrix: COLOUR_TO_LANGUAGE },
    { sourceStep: 'language', targetStep: 'colour', matrix: LANGUAGE_TO_COLOUR },

    { sourceStep: 'activation', targetStep: 'text', matrix: ACTIVATION_TO_TEXT },
    { sourceStep: 'text', targetStep: 'activation', matrix: TEXT_TO_ACTIVATION },

    { sourceStep: 'activation', targetStep: 'language', matrix: ACTIVATION_TO_LANGUAGE },
    { sourceStep: 'language', targetStep: 'activation', matrix: LANGUAGE_TO_ACTIVATION },

    { sourceStep: 'text', targetStep: 'language', matrix: TEXT_TO_LANGUAGE },
    { sourceStep: 'language', targetStep: 'text', matrix: LANGUAGE_TO_TEXT },
  ],
}

export const DEBUG_MATRICES = {
  COLOUR_TO_ACTIVATION,
  ACTIVATION_TO_COLOUR,
  COLOUR_TO_TEXT,
  TEXT_TO_COLOUR,
  COLOUR_TO_LANGUAGE,
  LANGUAGE_TO_COLOUR,
  ACTIVATION_TO_TEXT,
  TEXT_TO_ACTIVATION,
  ACTIVATION_TO_LANGUAGE,
  LANGUAGE_TO_ACTIVATION,
  TEXT_TO_LANGUAGE,
  LANGUAGE_TO_TEXT,
  VALID_MODEL_CODES,
}

function normalizeActivationToCode(id: string): string {
  if (id.startsWith('6-')) return '6'
  if (id.startsWith('7-')) return '7'
  return id
}

function expandActivationCodeToIds(code: string): string[] {
  if (code === '6') return ['6-red', '6-green', '6-blue']
  if (code === '7') return ['7-red', '7-green']
  return [code]
}

const SS_ALLOWLIST_STEPS = ['colour', 'activation', 'text', 'language']

function ssAllowlistFn(stepId: string, config: Configuration): Set<string> | null {
  if (!SS_ALLOWLIST_STEPS.includes(stepId)) return null

  const others: Record<string, string | undefined> = {}
  for (const k of SS_ALLOWLIST_STEPS) {
    if (k === stepId) continue
    const v = config[k as keyof Configuration] ?? undefined
    others[k] = k === 'activation' && v ? normalizeActivationToCode(v) : v
  }

  const validCodes = getValidSSOptionsForStep(stepId as never, others as never)

  if (stepId === 'activation') {
    const expanded = new Set<string>()
    for (const code of validCodes) {
      for (const id of expandActivationCodeToIds(code)) expanded.add(id)
    }
    return expanded
  }

  return new Set(validCodes)
}

registerProductConstraints(
  'stopper-stations',
  STOPPER_STATIONS_CONSTRAINTS,
  ssAllowlistFn,
)
