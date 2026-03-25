import type { ModelConstraints, ConstraintMatrix } from './types'
import { registerProductConstraints, buildAllowlistSet } from '../constraintRegistry'
import type { Configuration } from '@shared/types'

export const VALID_MODEL_CODES: readonly string[] = [
  'STI-13600NC',

  'STI-13610FR',
  'STI-13610EG',
  'STI-13610CR',
  'STI-13610CG',
  'STI-13610CY',
  'STI-13610CW',
  'STI-13610CB',
  'STI-13610NG',
  'STI-13610NY',
  'STI-13610NW',
  'STI-13610NB',

  'STI-13620FR',
  'STI-13620EG',
  'STI-13620CG',
  'STI-13620NG',
  'STI-13620NY',

  'STI-13630FR',
  'STI-13630EG',

  'STI-13700NC',

  'STI-13710FR',
  'STI-13710EG',
  'STI-13710CR',
  'STI-13710CG',
  'STI-13710CY',
  'STI-13710CB',
  'STI-13710NR',
  'STI-13710NG',
  'STI-13710NY',
  'STI-13710NB',

  'STI-13720FR',
  'STI-13720EG',
  'STI-13720NW',
  'STI-13720NY',

  'STI-13730EG',

  'STI-14600NC',

  'STI-14610FR',
  'STI-14610EG',
  'STI-14610CY',

  'STI-14700NC',

  'STI-14710EG',
  'STI-14710CW',
  'STI-14710NW',

  'STI-14730EG',
] as const

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES)

export interface ESSelectionState {
  cover?: string
  mounting?: string
  hoodSounder?: string
  colourLabel?: string
}

export function buildESModelCode(selections: ESSelectionState): string | null {
  const { cover, mounting, hoodSounder, colourLabel } = selections

  if (!cover || !mounting || !hoodSounder || !colourLabel) {
    return null
  }

  return `STI-${cover}${mounting}${hoodSounder}${colourLabel}`
}

export function parseESModelCode(code: string): ESSelectionState | null {
  const match = code.match(/^STI-(\d{2})(\d)(\d{2})([A-Z]{2})$/)

  if (!match) {
    return null
  }

  return {
    cover: match[1],
    mounting: match[2],
    hoodSounder: match[3],
    colourLabel: match[4],
  }
}

export function isValidESCombination(
  selections: ESSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildESModelCode(selections)

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

export function getValidESOptionsForStep(
  stepId: keyof ESSelectionState,
  currentSelections: Partial<ESSelectionState>,
): string[] {
  const validOptions = new Set<string>()

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseESModelCode(code)
    if (!parsed) continue

    let matches = true
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof ESSelectionState] !== value) {
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

const COVER_TO_HOOD_SOUNDER: ConstraintMatrix = {
  '13': ['00', '10', '20', '30'],
  '14': ['00', '10', '30'],
}

const HOOD_SOUNDER_TO_COVER: ConstraintMatrix = {
  '00': ['13', '14'],
  '10': ['13', '14'],
  '20': ['13'],
  '30': ['13', '14'],
}

const COVER_TO_COLOUR_LABEL: ConstraintMatrix = {
  '13': ['FR', 'EG', 'CR', 'CG', 'CY', 'CW', 'CB', 'NC', 'NR', 'NG', 'NY', 'NW', 'NB'],
  '14': ['FR', 'EG', 'CY', 'CW', 'NC', 'NW'],
}

const COLOUR_LABEL_TO_COVER: ConstraintMatrix = {
  FR: ['13', '14'],
  EG: ['13', '14'],
  CR: ['13'],
  CG: ['13'],
  CY: ['13', '14'],
  CW: ['13', '14'],
  CB: ['13'],
  NC: ['13', '14'],
  NR: ['13'],
  NG: ['13'],
  NY: ['13'],
  NW: ['13', '14'],
  NB: ['13'],
}

const MOUNTING_TO_COLOUR_LABEL: ConstraintMatrix = {
  '6': ['FR', 'EG', 'CR', 'CG', 'CY', 'CW', 'CB', 'NC', 'NG', 'NY', 'NW', 'NB'],
  '7': ['FR', 'EG', 'CR', 'CG', 'CY', 'CW', 'CB', 'NC', 'NR', 'NG', 'NY', 'NW', 'NB'],
}

const COLOUR_LABEL_TO_MOUNTING: ConstraintMatrix = {
  FR: ['6', '7'],
  EG: ['6', '7'],
  CR: ['6', '7'],
  CG: ['6', '7'],
  CY: ['6', '7'],
  CW: ['6', '7'],
  CB: ['6', '7'],
  NC: ['6', '7'],
  NR: ['7'],
  NG: ['6', '7'],
  NY: ['6', '7'],
  NW: ['6', '7'],
  NB: ['6', '7'],
}

const HOOD_SOUNDER_TO_COLOUR_LABEL: ConstraintMatrix = {
  '00': ['NC'],
  '10': ['FR', 'EG', 'CR', 'CG', 'CY', 'CW', 'CB', 'NR', 'NG', 'NY', 'NW', 'NB'],
  '20': ['FR', 'EG', 'CG', 'NG', 'NY', 'NW'],
  '30': ['FR', 'EG'],
}

const COLOUR_LABEL_TO_HOOD_SOUNDER: ConstraintMatrix = {
  FR: ['10', '20', '30'],
  EG: ['10', '20', '30'],
  CR: ['10'],
  CG: ['10', '20'],
  CY: ['10'],
  CW: ['10'],
  CB: ['10'],
  NC: ['00'],
  NR: ['10'],
  NG: ['10', '20'],
  NY: ['10', '20'],
  NW: ['10', '20'],
  NB: ['10'],
}

export const ENVIRO_STOPPER_CONSTRAINTS: ModelConstraints = {
  modelId: 'enviro-stopper',
  constraints: [
    { sourceStep: 'cover', targetStep: 'hoodSounder', matrix: COVER_TO_HOOD_SOUNDER },
    { sourceStep: 'hoodSounder', targetStep: 'cover', matrix: HOOD_SOUNDER_TO_COVER },

    { sourceStep: 'cover', targetStep: 'colourLabel', matrix: COVER_TO_COLOUR_LABEL },
    { sourceStep: 'colourLabel', targetStep: 'cover', matrix: COLOUR_LABEL_TO_COVER },

    {
      sourceStep: 'mounting',
      targetStep: 'colourLabel',
      matrix: MOUNTING_TO_COLOUR_LABEL,
    },
    {
      sourceStep: 'colourLabel',
      targetStep: 'mounting',
      matrix: COLOUR_LABEL_TO_MOUNTING,
    },

    {
      sourceStep: 'hoodSounder',
      targetStep: 'colourLabel',
      matrix: HOOD_SOUNDER_TO_COLOUR_LABEL,
    },
    {
      sourceStep: 'colourLabel',
      targetStep: 'hoodSounder',
      matrix: COLOUR_LABEL_TO_HOOD_SOUNDER,
    },
  ],
}

export const DEBUG_MATRICES = {
  COVER_TO_HOOD_SOUNDER,
  HOOD_SOUNDER_TO_COVER,
  COVER_TO_COLOUR_LABEL,
  COLOUR_LABEL_TO_COVER,
  MOUNTING_TO_COLOUR_LABEL,
  COLOUR_LABEL_TO_MOUNTING,
  HOOD_SOUNDER_TO_COLOUR_LABEL,
  COLOUR_LABEL_TO_HOOD_SOUNDER,
  VALID_MODEL_CODES,
}

const ES_STEPS = ['cover', 'mounting', 'hoodSounder', 'colourLabel']

function esAllowlistFn(stepId: string, config: Configuration): Set<string> | null {
  return buildAllowlistSet(stepId, config, ES_STEPS, (s, o) =>
    getValidESOptionsForStep(s as never, o as never),
  )
}

registerProductConstraints('enviro-stopper', ENVIRO_STOPPER_CONSTRAINTS, esAllowlistFn)
