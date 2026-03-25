import type { ModelConstraints, ConstraintMatrix } from './types'
import { registerProductConstraints, buildAllowlistSet } from '../constraintRegistry'
import type { Configuration } from '@shared/types'

export const VALID_MODEL_CODES: readonly string[] = [
  'SS3-1020',
  'SS3-1020-CL',
  'SS3-1030',
  'SS3-1030-CL',
  'SS3-1031-CL',
  'SS3-1032',
  'SS3-1041',
  'SS3-1041-CL',
  'SS3-1042',
  'SS3-1053',

  'SS3-3020',
  'SS3-3020-CL',
  'SS3-3030',
  'SS3-3031',
  'SS3-3032',
  'SS3-3041',
  'SS3-3041-CL',
  'SS3-3042',
  'SS3-3042-CL',

  'SS3-5020',
  'SS3-5020-CL',
  'SS3-5030',
  'SS3-5031',
  'SS3-5031-CL',
  'SS3-5041',
  'SS3-5042',
  'SS3-5042-CL',
  'SS3-5053',
  'SS3-5053-CL',

  'SS3-7020',
  'SS3-7020-CL',
  'SS3-7030',
  'SS3-7031',
  'SS3-7042',
  'SS3-7042-CL',
  'SS3-7053',
  'SS3-7053-CL',

  'SS3-9020',
  'SS3-9020-CL',
  'SS3-9030',
  'SS3-9030-CL',
  'SS3-9031',
  'SS3-9041',
  'SS3-9042',

  'SS3-E020',
  'SS3-E030',
  'SS3-E032',
  'SS3-E053',
  'SS3-E053-CL',
] as const

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES)

export interface KSSelectionState {
  colourMounting?: string
  switchType?: string
  electricalArrangement?: string
  label?: string
}

export function buildKSModelCode(selections: KSSelectionState): string | null {
  const { colourMounting, switchType, electricalArrangement, label } = selections

  if (!colourMounting || !switchType || !electricalArrangement || !label) {
    return null
  }

  const base = `SS3-${colourMounting}${switchType}${electricalArrangement}`
  return label === 'CL' ? `${base}-CL` : base
}

export function parseKSModelCode(code: string): KSSelectionState | null {
  const match = code.match(/^SS3-(10|30|50|70|90|E0)(\d)(\d)(-CL)?$/)

  if (!match) {
    return null
  }

  return {
    colourMounting: match[1],
    switchType: match[2],
    electricalArrangement: match[3],
    label: match[4] ? 'CL' : 'SAK',
  }
}

export function isValidKSCombination(
  selections: KSSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildKSModelCode(selections)

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

export function getValidKSOptionsForStep(
  stepId: keyof KSSelectionState,
  otherSelections: Omit<KSSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>()

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseKSModelCode(code)
    if (!parsed) continue

    let matches = true
    for (const [key, value] of Object.entries(otherSelections)) {
      if (value && parsed[key as keyof KSSelectionState] !== value) {
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

const COLOURMOUNTING_TO_SWITCHTYPE: ConstraintMatrix = {
  '10': ['2', '3', '4', '5'],
  '30': ['2', '3'],
  '50': ['2', '3', '4', '5'],
  '70': ['2', '3', '4', '5'],
  '90': ['2', '3'],
  E0: ['2', '3', '5'],
}

const SWITCHTYPE_TO_COLOURMOUNTING: ConstraintMatrix = {
  '2': ['10', '30', '50', '70', '90', 'E0'],
  '3': ['10', '30', '50', '70', '90', 'E0'],
  '4': ['10', '50', '70'],
  '5': ['10', '50', '70', 'E0'],
}

const COLOURMOUNTING_TO_ELECTRICALARRANGEMENT: ConstraintMatrix = {
  '10': ['0', '1', '2', '3'],
  '30': ['0', '1', '2'],
  '50': ['0', '1', '2', '3'],
  '70': ['0', '1', '2', '3'],
  '90': ['0', '1', '2'],
  E0: ['0', '2', '3'],
}

const ELECTRICALARRANGEMENT_TO_COLOURMOUNTING: ConstraintMatrix = {
  '0': ['10', '30', '50', '70', '90', 'E0'],
  '1': ['10', '30', '50', '70', '90'],
  '2': ['10', '30', '50', '70', '90', 'E0'],
  '3': ['10', '50', '70', 'E0'],
}

const SWITCHTYPE_TO_ELECTRICALARRANGEMENT: ConstraintMatrix = {
  '2': ['0'],
  '3': ['0', '1', '2'],
  '4': ['1', '2'],
  '5': ['3'],
}

const ELECTRICALARRANGEMENT_TO_SWITCHTYPE: ConstraintMatrix = {
  '0': ['2', '3'],
  '1': ['3', '4'],
  '2': ['3', '4'],
  '3': ['5'],
}

export const KEY_SWITCHES_CONSTRAINTS: ModelConstraints = {
  modelId: 'key-switches',
  constraints: [
    {
      sourceStep: 'colourMounting',
      targetStep: 'switchType',
      matrix: COLOURMOUNTING_TO_SWITCHTYPE,
    },
    {
      sourceStep: 'switchType',
      targetStep: 'colourMounting',
      matrix: SWITCHTYPE_TO_COLOURMOUNTING,
    },
    {
      sourceStep: 'colourMounting',
      targetStep: 'electricalArrangement',
      matrix: COLOURMOUNTING_TO_ELECTRICALARRANGEMENT,
    },
    {
      sourceStep: 'electricalArrangement',
      targetStep: 'colourMounting',
      matrix: ELECTRICALARRANGEMENT_TO_COLOURMOUNTING,
    },
    {
      sourceStep: 'switchType',
      targetStep: 'electricalArrangement',
      matrix: SWITCHTYPE_TO_ELECTRICALARRANGEMENT,
    },
    {
      sourceStep: 'electricalArrangement',
      targetStep: 'switchType',
      matrix: ELECTRICALARRANGEMENT_TO_SWITCHTYPE,
    },
  ],
}

export const DEBUG_MATRICES = {
  COLOURMOUNTING_TO_SWITCHTYPE,
  SWITCHTYPE_TO_COLOURMOUNTING,
  COLOURMOUNTING_TO_ELECTRICALARRANGEMENT,
  ELECTRICALARRANGEMENT_TO_COLOURMOUNTING,
  SWITCHTYPE_TO_ELECTRICALARRANGEMENT,
  ELECTRICALARRANGEMENT_TO_SWITCHTYPE,
  VALID_MODEL_CODES,
}

const KS_STEPS = ['colourMounting', 'switchType', 'electricalArrangement', 'label']

function ksAllowlistFn(stepId: string, config: Configuration): Set<string> | null {
  return buildAllowlistSet(stepId, config, KS_STEPS, (s, o) =>
    getValidKSOptionsForStep(s as never, o as never),
  )
}

registerProductConstraints('key-switches', KEY_SWITCHES_CONSTRAINTS, ksAllowlistFn)
