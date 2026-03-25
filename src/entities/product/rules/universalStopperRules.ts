import type { ModelConstraints, ConstraintMatrix } from './types'
import { registerProductConstraints, buildAllowlistSet } from '../constraintRegistry'
import type { Configuration } from '@shared/types'

export const VALID_MODEL_CODES: readonly string[] = [
  'STI-13000NC',
  'STI-13010CB',
  'STI-13010CG',
  'STI-13010CK',
  'STI-13010CR',
  'STI-13010CY',
  'STI-13010EG',
  'STI-13010FR',
  'STI-13010NB',
  'STI-13010NG',
  'STI-13010NR',
  'STI-13010NW',
  'STI-13010NY',
  'STI-13020CB',
  'STI-13020CR',
  'STI-13020CY',
  'STI-13020EG',
  'STI-13020FR',
  'STI-13020NB',
  'STI-13020NG',
  'STI-13020NR',
  'STI-13030CG',
  'STI-13030EG',
  'STI-13030NG',
  'STI-13030NR',

  'STI-13100NC',
  'STI-13110CB',
  'STI-13110CG',
  'STI-13110CR',
  'STI-13110CW',
  'STI-13110CY',
  'STI-13110EG',
  'STI-13110FR',
  'STI-13110NB',
  'STI-13110NG',
  'STI-13110NR',
  'STI-13110NW',
  'STI-13110NY',
  'STI-13120CB',
  'STI-13120CG',
  'STI-13120CR',
  'STI-13120CW',
  'STI-13120CY',
  'STI-13120EG',
  'STI-13120FR',
  'STI-13120NB',
  'STI-13120NG',
  'STI-13120NR',
  'STI-13120NY',
  'STI-13130CB',
  'STI-13130CG',
  'STI-13130CY',
  'STI-13130EG',
  'STI-13130FR',
  'STI-13130NR',

  'STI-13210CB',
  'STI-13210CK',
  'STI-13210CR',
  'STI-13210CY',
  'STI-13210FR',
  'STI-13210NG',
  'STI-13210NW',
  'STI-13220EG',
  'STI-13220FR',
  'STI-13230CG',
  'STI-13230FR',
  'STI-13230NB',
] as const

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES)

export interface USSelectionState {
  mounting?: string
  hoodSounder?: string
  colourLabel?: string
}

export function buildUSModelCode(selections: USSelectionState): string | null {
  const { mounting, hoodSounder, colourLabel } = selections
  if (!mounting || !hoodSounder || !colourLabel) return null

  return `STI-13${mounting}${hoodSounder}${colourLabel}`
}

export function parseUSModelCode(code: string): USSelectionState | null {
  const match = code.match(/^STI-13(\d)(\d{2})([A-Z]{2})$/)
  if (!match) return null

  return {
    mounting: match[1],
    hoodSounder: match[2],
    colourLabel: match[3],
  }
}

export function isValidUSCombination(
  selections: USSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildUSModelCode(selections)

  if (!modelCode) return { valid: true }

  if (VALID_MODEL_SET.has(modelCode)) return { valid: true }

  return {
    valid: false,
    reason: `Model ${modelCode} is not available. This combination is not in the approved product list.`,
  }
}

export function getValidUSOptionsForStep(
  stepId: keyof USSelectionState,
  currentSelections: Omit<USSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>()

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseUSModelCode(code)
    if (!parsed) continue

    let matches = true
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof USSelectionState] !== value) {
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

const MOUNTING_TO_HOODSOUDER: ConstraintMatrix = {
  '0': ['00', '10', '20', '30'],
  '1': ['00', '10', '20', '30'],
  '2': ['10', '20', '30'],
}

const HOODSOUDER_TO_MOUNTING: ConstraintMatrix = {
  '00': ['0', '1'],
  '10': ['0', '1', '2'],
  '20': ['0', '1', '2'],
  '30': ['0', '1', '2'],
}

const MOUNTING_TO_COLOURLABEL: ConstraintMatrix = {
  '0': ['CB', 'CG', 'CK', 'CR', 'CY', 'EG', 'FR', 'NB', 'NC', 'NG', 'NR', 'NW', 'NY'],
  '1': ['CB', 'CG', 'CR', 'CW', 'CY', 'EG', 'FR', 'NB', 'NC', 'NG', 'NR', 'NW', 'NY'],
  '2': ['CB', 'CG', 'CK', 'CR', 'CY', 'EG', 'FR', 'NB', 'NG', 'NW'],
}

const COLOURLABEL_TO_MOUNTING: ConstraintMatrix = {
  CB: ['0', '1', '2'],
  CG: ['0', '1', '2'],
  CK: ['0', '2'],
  CR: ['0', '1', '2'],
  CW: ['1'],
  CY: ['0', '1', '2'],
  EG: ['0', '1', '2'],
  FR: ['0', '1', '2'],
  NB: ['0', '1', '2'],
  NC: ['0', '1'],
  NG: ['0', '1', '2'],
  NR: ['0', '1'],
  NW: ['0', '1', '2'],
  NY: ['0', '1'],
}

const HOODSOUDER_TO_COLOURLABEL: ConstraintMatrix = {
  '00': ['NC'],
  '10': ['CB', 'CG', 'CK', 'CR', 'CW', 'CY', 'EG', 'FR', 'NB', 'NG', 'NR', 'NW', 'NY'],
  '20': ['CB', 'CG', 'CR', 'CW', 'CY', 'EG', 'FR', 'NB', 'NG', 'NR', 'NY'],
  '30': ['CB', 'CG', 'CY', 'EG', 'FR', 'NB', 'NG', 'NR'],
}

const COLOURLABEL_TO_HOODSOUDER: ConstraintMatrix = {
  CB: ['10', '20', '30'],
  CG: ['10', '20', '30'],
  CK: ['10'],
  CR: ['10', '20'],
  CW: ['10', '20'],
  CY: ['10', '20', '30'],
  EG: ['10', '20', '30'],
  FR: ['10', '20', '30'],
  NB: ['10', '20', '30'],
  NC: ['00'],
  NG: ['10', '20', '30'],
  NR: ['10', '20', '30'],
  NW: ['10'],
  NY: ['10', '20'],
}

export const UNIVERSAL_STOPPER_CONSTRAINTS: ModelConstraints = {
  modelId: 'universal-stopper',
  constraints: [
    { sourceStep: 'mounting', targetStep: 'hoodSounder', matrix: MOUNTING_TO_HOODSOUDER },
    { sourceStep: 'hoodSounder', targetStep: 'mounting', matrix: HOODSOUDER_TO_MOUNTING },

    {
      sourceStep: 'mounting',
      targetStep: 'colourLabel',
      matrix: MOUNTING_TO_COLOURLABEL,
    },
    {
      sourceStep: 'colourLabel',
      targetStep: 'mounting',
      matrix: COLOURLABEL_TO_MOUNTING,
    },

    {
      sourceStep: 'hoodSounder',
      targetStep: 'colourLabel',
      matrix: HOODSOUDER_TO_COLOURLABEL,
    },
    {
      sourceStep: 'colourLabel',
      targetStep: 'hoodSounder',
      matrix: COLOURLABEL_TO_HOODSOUDER,
    },
  ],
}

export const DEBUG_MATRICES = {
  MOUNTING_TO_HOODSOUDER,
  HOODSOUDER_TO_MOUNTING,
  MOUNTING_TO_COLOURLABEL,
  COLOURLABEL_TO_MOUNTING,
  HOODSOUDER_TO_COLOURLABEL,
  COLOURLABEL_TO_HOODSOUDER,
  VALID_MODEL_CODES,
}

const US_STEPS = ['mounting', 'hoodSounder', 'colourLabel']

function usAllowlistFn(stepId: string, config: Configuration): Set<string> | null {
  return buildAllowlistSet(stepId, config, US_STEPS, (s, o) =>
    getValidUSOptionsForStep(s as never, o as never),
  )
}

registerProductConstraints(
  'universal-stopper',
  UNIVERSAL_STOPPER_CONSTRAINTS,
  usAllowlistFn,
)
