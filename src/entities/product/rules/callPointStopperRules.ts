import type { ModelConstraints, ConstraintMatrix } from './types'
import { registerProductConstraints, buildAllowlistSet } from '../constraintRegistry'
import type { Configuration } from '@shared/types'

export const VALID_MODEL_CODES: readonly string[] = [
  'STI-6930-CL',
  'STI-6930-PLAIN',
  'STI-6930-G-CL',
  'STI-6930-G-PLAIN',
  'STI-6930-Y-CL',
  'STI-6930-Y-PLAIN',
  'STI-6930-W-CL',
  'STI-6930-W-PLAIN',
  'STI-6930-B-CL',
  'STI-6930-B-PLAIN',
  'STI-6930-E-CL',
  'STI-6930-E-PLAIN',

  'STI-6931-CL',
  'STI-6931-PLAIN',
  'STI-6931-G-CL',
  'STI-6931-G-PLAIN',
  'STI-6931-Y-CL',
  'STI-6931-Y-PLAIN',
  'STI-6931-W-CL',
  'STI-6931-W-PLAIN',
  'STI-6931-B-CL',
  'STI-6931-B-PLAIN',
  'STI-6931-E-CL',
  'STI-6931-E-PLAIN',
] as const

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES)

export interface CPSSelectionState {
  mounting?: string
  colour?: string
  label?: string
}

const COLOUR_TO_SKU_SUFFIX: Record<string, string> = {
  R: '',
  G: '-G',
  Y: '-Y',
  W: '-W',
  B: '-B',
  E: '-E',
}

const LABEL_TO_SKU_SUFFIX: Record<string, string> = {
  CL: '-CL',
  PLAIN: '-PLAIN',
}

export function buildCPSModelCode(selections: CPSSelectionState): string | null {
  const { mounting, colour, label } = selections

  if (!mounting || !colour || !label) {
    return null
  }

  const colourSuffix = COLOUR_TO_SKU_SUFFIX[colour]
  const labelSuffix = LABEL_TO_SKU_SUFFIX[label]

  if (colourSuffix === undefined || labelSuffix === undefined) {
    return null
  }

  return `STI-693${mounting}${colourSuffix}${labelSuffix}`
}

const SKU_COLOUR_MAP: Record<string, string> = {
  '': 'R',
  G: 'G',
  Y: 'Y',
  W: 'W',
  B: 'B',
  E: 'E',
}

export function parseCPSModelCode(code: string): CPSSelectionState | null {
  const match = code.match(/^STI-693([01])(?:-(G|Y|W|B|E))?-(CL|PLAIN)$/)

  if (!match) {
    return null
  }

  const mounting = match[1]
  const colourCode = match[2] ?? ''
  const labelCode = match[3]

  const colour = SKU_COLOUR_MAP[colourCode]
  if (!colour) {
    return null
  }

  return { mounting, colour, label: labelCode }
}

export function isValidCPSCombination(
  selections: CPSSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildCPSModelCode(selections)

  if (!modelCode) return { valid: true }

  if (VALID_MODEL_SET.has(modelCode)) return { valid: true }

  return {
    valid: false,
    reason: `Model ${modelCode} is not available. This combination is not in the approved product list.`,
  }
}

export function getValidCPSOptionsForStep(
  stepId: keyof CPSSelectionState,
  currentSelections: Omit<CPSSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>()

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseCPSModelCode(code)
    if (!parsed) continue

    let matches = true
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof CPSSelectionState] !== value) {
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

const COLOUR_TO_LABEL: ConstraintMatrix = {
  R: ['CL', 'PLAIN'],
  G: ['CL', 'PLAIN'],
  Y: ['CL', 'PLAIN'],
  W: ['CL', 'PLAIN'],
  B: ['CL', 'PLAIN'],
  E: ['CL', 'PLAIN'],
}

const LABEL_TO_COLOUR: ConstraintMatrix = {
  CL: ['R', 'G', 'Y', 'W', 'B', 'E'],
  PLAIN: ['R', 'G', 'Y', 'W', 'B', 'E'],
}

export const CALL_POINT_STOPPER_CONSTRAINTS: ModelConstraints = {
  modelId: 'call-point-stopper',
  constraints: [
    { sourceStep: 'colour', targetStep: 'label', matrix: COLOUR_TO_LABEL },
    { sourceStep: 'label', targetStep: 'colour', matrix: LABEL_TO_COLOUR },
  ],
}

export const DEBUG_MATRICES = {
  COLOUR_TO_LABEL,
  LABEL_TO_COLOUR,
  VALID_MODEL_CODES,
}

const CPS_STEPS = ['mounting', 'colour', 'label']

function cpsAllowlistFn(stepId: string, config: Configuration): Set<string> | null {
  return buildAllowlistSet(stepId, config, CPS_STEPS, (s, o) =>
    getValidCPSOptionsForStep(s as never, o as never),
  )
}

registerProductConstraints(
  'call-point-stopper',
  CALL_POINT_STOPPER_CONSTRAINTS,
  cpsAllowlistFn,
)
