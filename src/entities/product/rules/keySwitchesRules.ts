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
  'SS3-1032-CL',
  'SS3-1041',
  'SS3-1041-CL',
  'SS3-1042',
  'SS3-1042-CL',
  'SS3-1053',
  'SS3-1053-CL',

  'SS3-3020',
  'SS3-3020-CL',
  'SS3-3030',
  'SS3-3030-CL',
  'SS3-3031',
  'SS3-3031-CL',
  'SS3-3032',
  'SS3-3032-CL',
  'SS3-3041',
  'SS3-3041-CL',
  'SS3-3042',
  'SS3-3042-CL',

  'SS3-5020',
  'SS3-5020-CL',
  'SS3-5030',
  'SS3-5030-CL',
  'SS3-5031',
  'SS3-5031-CL',
  'SS3-5041',
  'SS3-5041-CL',
  'SS3-5042',
  'SS3-5042-CL',
  'SS3-5053',
  'SS3-5053-CL',

  'SS3-7020',
  'SS3-7020-CL',
  'SS3-7030',
  'SS3-7030-CL',
  'SS3-7031',
  'SS3-7031-CL',
  'SS3-7042',
  'SS3-7042-CL',
  'SS3-7053',
  'SS3-7053-CL',

  'SS3-9020',
  'SS3-9020-CL',
  'SS3-9030',
  'SS3-9030-CL',
  'SS3-9031',
  'SS3-9031-CL',
  'SS3-9041',
  'SS3-9041-CL',
  'SS3-9042',
  'SS3-9042-CL',

  'SS3-E020',
  'SS3-E020-CL',
  'SS3-E030',
  'SS3-E030-CL',
  'SS3-E032',
  'SS3-E032-CL',
  'SS3-E053',
  'SS3-E053-CL',
] as const

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES)

const CODE_FRAGMENT_TO_OPTIONS: Record<
  string,
  { switchType: string; electricalArrangement: string }
> = {
  '20': { switchType: 'two-pos', electricalArrangement: 'single-pole' },
  '30': { switchType: 'two-pos-lock', electricalArrangement: 'single-pole' },
  '31': { switchType: 'two-pos-lock', electricalArrangement: 'double-no-lock' },
  '32': { switchType: 'two-pos-lock', electricalArrangement: 'double-nc-lock' },
  '41': { switchType: 'two-pos', electricalArrangement: 'double-no' },
  '42': { switchType: 'two-pos', electricalArrangement: 'double-nc' },
  '53': { switchType: 'three-pos', electricalArrangement: 'three-pos-arr' },
}

export interface KSSelectionState {
  colourMounting?: string
  switchType?: string
  electricalArrangement?: string
  label?: string
}

export function parseKSModelCode(code: string): KSSelectionState | null {
  const match = code.match(/^SS3-(10|30|50|70|90|E0)(\d{2})(-CL)?$/)
  if (!match) return null

  const colourMounting = match[1]
  const fragment = match[2]
  const mapping = CODE_FRAGMENT_TO_OPTIONS[fragment]
  if (!mapping) return null

  return {
    colourMounting,
    switchType: mapping.switchType,
    electricalArrangement: mapping.electricalArrangement,
    label: match[3] ? 'CL' : 'SAK',
  }
}

const OPTIONS_TO_CODE_FRAGMENT: Record<string, string> = {
  'two-pos|single-pole': '20',
  'two-pos|double-no': '41',
  'two-pos|double-nc': '42',
  'two-pos-lock|single-pole': '30',
  'two-pos-lock|double-no-lock': '31',
  'two-pos-lock|double-nc-lock': '32',
  'three-pos|three-pos-arr': '53',
}

export function buildKSModelCode(selections: KSSelectionState): string | null {
  const { colourMounting, switchType, electricalArrangement, label } = selections
  if (!colourMounting || !switchType || !electricalArrangement || !label) return null

  const fragment = OPTIONS_TO_CODE_FRAGMENT[`${switchType}|${electricalArrangement}`]
  if (!fragment) return null

  const base = `SS3-${colourMounting}${fragment}`
  return label === 'CL' ? `${base}-CL` : base
}

export function isValidKSCombination(
  selections: KSSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildKSModelCode(selections)
  if (!modelCode) return { valid: true }

  if (VALID_MODEL_SET.has(modelCode)) return { valid: true }

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
  '10': ['two-pos', 'two-pos-lock', 'three-pos'],
  '30': ['two-pos', 'two-pos-lock'],
  '50': ['two-pos', 'two-pos-lock', 'three-pos'],
  '70': ['two-pos', 'two-pos-lock', 'three-pos'],
  '90': ['two-pos', 'two-pos-lock'],
  E0: ['two-pos', 'two-pos-lock', 'three-pos'],
}

const SWITCHTYPE_TO_COLOURMOUNTING: ConstraintMatrix = {
  'two-pos': ['10', '30', '50', '70', '90', 'E0'],
  'two-pos-lock': ['10', '30', '50', '70', '90', 'E0'],
  'three-pos': ['10', '50', '70', 'E0'],
}

const COLOURMOUNTING_TO_ELECTRICALARRANGEMENT: ConstraintMatrix = {
  '10': [
    'single-pole',
    'double-no',
    'double-no-lock',
    'double-nc',
    'double-nc-lock',
    'three-pos-arr',
  ],
  '30': ['single-pole', 'double-no', 'double-no-lock', 'double-nc', 'double-nc-lock'],
  '50': [
    'single-pole',
    'double-no',
    'double-no-lock',
    'double-nc',
    'double-nc-lock',
    'three-pos-arr',
  ],
  '70': ['single-pole', 'double-no-lock', 'double-nc', 'double-nc-lock', 'three-pos-arr'],
  '90': ['single-pole', 'double-no', 'double-no-lock', 'double-nc'],
  E0: ['single-pole', 'double-nc-lock', 'three-pos-arr'],
}

const ELECTRICALARRANGEMENT_TO_COLOURMOUNTING: ConstraintMatrix = {
  'single-pole': ['10', '30', '50', '70', '90', 'E0'],
  'double-no': ['10', '30', '50', '90'],
  'double-no-lock': ['10', '30', '50', '70', '90'],
  'double-nc': ['10', '30', '50', '70', '90'],
  'double-nc-lock': ['10', '30', '50', '70', 'E0'],
  'three-pos-arr': ['10', '50', '70', 'E0'],
}

const SWITCHTYPE_TO_ELECTRICALARRANGEMENT: ConstraintMatrix = {
  'two-pos': ['single-pole', 'double-no', 'double-nc'],
  'two-pos-lock': ['single-pole', 'double-no-lock', 'double-nc-lock'],
  'three-pos': ['three-pos-arr'],
}

const ELECTRICALARRANGEMENT_TO_SWITCHTYPE: ConstraintMatrix = {
  'single-pole': ['two-pos', 'two-pos-lock'],
  'double-no': ['two-pos'],
  'double-no-lock': ['two-pos-lock'],
  'double-nc': ['two-pos'],
  'double-nc-lock': ['two-pos-lock'],
  'three-pos-arr': ['three-pos'],
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
