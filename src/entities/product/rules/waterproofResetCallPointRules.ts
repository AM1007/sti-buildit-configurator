import type { ConstraintMatrix, ModelConstraints } from './types'
import { registerProductConstraints, buildAllowlistSet } from '../constraintRegistry'
import type { Configuration } from '@shared/types'

export const VALID_MODEL_CODES: readonly string[] = [
  'WRP2-R-02',
  'WRP2-R-11',
  'WRP2-R-11-CL',

  'WRP2-G-02',
  'WRP2-G-02-CL',
  'WRP2-G-11',
  'WRP2-G-11-CL',

  'WRP2-Y-02',
  'WRP2-Y-02-CL',
  'WRP2-Y-11',
  'WRP2-Y-11-CL',

  'WRP2-W-02',
  'WRP2-W-02-CL',
  'WRP2-W-11',
  'WRP2-W-11-CL',

  'WRP2-B-02',
  'WRP2-B-02-CL',
  'WRP2-B-11',
  'WRP2-B-11-CL',

  'WRP2-O-02',
  'WRP2-O-02-CL',
  'WRP2-O-11',
  'WRP2-O-11-CL',
] as const

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES)

export interface WRPSelectionState {
  colour?: string
  electricalArrangement?: string
  label?: string
}

export function buildWRPModelCode(selections: WRPSelectionState): string | null {
  const { colour, electricalArrangement, label } = selections
  if (!colour || !electricalArrangement || !label) return null

  const base = `WRP2-${colour}-${electricalArrangement}`
  if (label === 'CL') return `${base}-CL`
  return base
}

export function parseWRPModelCode(code: string): WRPSelectionState | null {
  const match = code.match(/^WRP2-([RGYBWO])-(\d{2})(-CL)?$/)
  if (!match) return null

  const result: WRPSelectionState = {
    colour: match[1],
    electricalArrangement: match[2],
  }

  if (match[3]) {
    result.label = 'CL'
  }

  return result
}

export function isValidWRPCombination(
  selections: WRPSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const { colour, label } = selections
  const modelCode = buildWRPModelCode(selections)

  if (!modelCode) return { valid: true }

  if (colour && label) {
    if (label === 'HF' && colour !== 'R') {
      return { valid: false, reason: `HF label is only available for Red (R) colour.` }
    }
    if (label === 'RM' && colour !== 'G') {
      return { valid: false, reason: `RM label is only available for Green (G) colour.` }
    }
    if (label === 'SAK' && (colour === 'R' || colour === 'G')) {
      return {
        valid: false,
        reason: `SAK label is not available for Red or Green colour.`,
      }
    }
  }

  if (VALID_MODEL_SET.has(modelCode)) return { valid: true }

  return {
    valid: false,
    reason: `Model ${modelCode} is not available. This combination is not in the approved product list.`,
  }
}

export function getValidWRPOptionsForStep(
  stepId: keyof WRPSelectionState,
  currentSelections: Omit<WRPSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>()

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseWRPModelCode(code)
    if (!parsed) continue

    if (!parsed.label) {
      parsed.label = getDefaultLabelForColour(parsed.colour!)
    }

    let matches = true
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof WRPSelectionState] !== value) {
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

function getDefaultLabelForColour(colour: string): string {
  switch (colour) {
    case 'R':
      return 'HF'
    case 'G':
      return 'RM'
    default:
      return 'SAK' // Y, B, W, O
  }
}

const COLOUR_TO_ELECTRICAL: ConstraintMatrix = {
  R: ['02', '11'],
  G: ['02', '11'],
  Y: ['02', '11'],
  B: ['02', '11'],
  W: ['02', '11'],
  O: ['02', '11'],
}

const ELECTRICAL_TO_COLOUR: ConstraintMatrix = {
  '02': ['R', 'G', 'Y', 'B', 'W', 'O'],
  '11': ['R', 'G', 'Y', 'B', 'W', 'O'],
}

const COLOUR_TO_LABEL: ConstraintMatrix = {
  R: ['HF', 'CL'],
  G: ['RM', 'CL'],
  Y: ['SAK', 'CL'],
  B: ['SAK', 'CL'],
  W: ['SAK', 'CL'],
  O: ['SAK', 'CL'],
}

const LABEL_TO_COLOUR: ConstraintMatrix = {
  HF: ['R'],
  RM: ['G'],
  SAK: ['Y', 'B', 'W', 'O'],
  CL: ['R', 'G', 'Y', 'B', 'W', 'O'],
}

const ELECTRICAL_TO_LABEL: ConstraintMatrix = {
  '02': ['HF', 'RM', 'SAK', 'CL'],
  '11': ['HF', 'RM', 'SAK', 'CL'],
}

const LABEL_TO_ELECTRICAL: ConstraintMatrix = {
  HF: ['02', '11'],
  RM: ['02', '11'],
  SAK: ['02', '11'],
  CL: ['02', '11'],
}

export const WATERPROOF_RESET_CALL_POINT_CONSTRAINTS: ModelConstraints = {
  modelId: 'waterproof-reset-call-point',
  constraints: [
    {
      sourceStep: 'colour',
      targetStep: 'electricalArrangement',
      matrix: COLOUR_TO_ELECTRICAL,
    },
    {
      sourceStep: 'electricalArrangement',
      targetStep: 'colour',
      matrix: ELECTRICAL_TO_COLOUR,
    },
    {
      sourceStep: 'colour',
      targetStep: 'label',
      matrix: COLOUR_TO_LABEL,
    },
    {
      sourceStep: 'label',
      targetStep: 'colour',
      matrix: LABEL_TO_COLOUR,
    },
    {
      sourceStep: 'electricalArrangement',
      targetStep: 'label',
      matrix: ELECTRICAL_TO_LABEL,
    },
    {
      sourceStep: 'label',
      targetStep: 'electricalArrangement',
      matrix: LABEL_TO_ELECTRICAL,
    },
  ],
}

export const DEBUG_MATRICES = {
  COLOUR_TO_ELECTRICAL,
  ELECTRICAL_TO_COLOUR,
  COLOUR_TO_LABEL,
  LABEL_TO_COLOUR,
  ELECTRICAL_TO_LABEL,
  LABEL_TO_ELECTRICAL,
  VALID_MODEL_CODES,
}

const WRP_STEPS = ['colour', 'electricalArrangement', 'label']

function wrpAllowlistFn(stepId: string, config: Configuration): Set<string> | null {
  return buildAllowlistSet(stepId, config, WRP_STEPS, (s, o) =>
    getValidWRPOptionsForStep(s as never, o as never),
  )
}

registerProductConstraints(
  'waterproof-reset-call-point',
  WATERPROOF_RESET_CALL_POINT_CONSTRAINTS,
  wrpAllowlistFn,
)
