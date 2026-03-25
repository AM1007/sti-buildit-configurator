import type { ModelConstraints, ConstraintMatrix } from './types'
import { registerProductConstraints, buildAllowlistSet } from '../constraintRegistry'
import type { Configuration } from '@shared/types'

export const VALID_MODEL_CODES: readonly string[] = [
  'ES-121005-O',
  'ES-161608-O',
  'ES-231609-O',
  'ES-312312-O',
  'ET-121006-C',
  'ET-181408-C',
] as const

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES)

export interface EASelectionState {
  material?: string
  size?: string
  doorType?: string
}

export function buildEAModelCode(selections: EASelectionState): string | null {
  const { material, size, doorType } = selections

  if (!material || !size || !doorType) {
    return null
  }

  return `E${material}-${size}-${doorType}`
}

export function parseEAModelCode(code: string): EASelectionState | null {
  const match = code.match(/^E([ST])-(\d{6})-([OC])$/)

  if (!match) {
    return null
  }

  return {
    material: match[1],
    size: match[2],
    doorType: match[3],
  }
}

export function isValidEACombination(
  selections: EASelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildEAModelCode(selections)

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

export function getValidEAOptionsForStep(
  stepId: keyof EASelectionState,
  currentSelections: Partial<EASelectionState>,
): string[] {
  const validOptions = new Set<string>()

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseEAModelCode(code)
    if (!parsed) continue

    let matches = true
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof EASelectionState] !== value) {
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

const MATERIAL_TO_SIZE: ConstraintMatrix = {
  S: ['121005', '161608', '231609', '312312'],
  T: ['121006', '181408'],
}

const MATERIAL_TO_DOORTYPE: ConstraintMatrix = {
  S: ['O'],
  T: ['C'],
}

const SIZE_TO_MATERIAL: ConstraintMatrix = {
  '121005': ['S'],
  '121006': ['T'],
  '161608': ['S'],
  '181408': ['T'],
  '231609': ['S'],
  '312312': ['S'],
}

const SIZE_TO_DOORTYPE: ConstraintMatrix = {
  '121005': ['O'],
  '121006': ['C'],
  '161608': ['O'],
  '181408': ['C'],
  '231609': ['O'],
  '312312': ['O'],
}

const DOORTYPE_TO_MATERIAL: ConstraintMatrix = {
  O: ['S'],
  C: ['T'],
}

const DOORTYPE_TO_SIZE: ConstraintMatrix = {
  O: ['121005', '161608', '231609', '312312'],
  C: ['121006', '181408'],
}

export const ENVIRO_ARMOUR_CONSTRAINTS: ModelConstraints = {
  modelId: 'enviro-armour',
  constraints: [
    { sourceStep: 'material', targetStep: 'size', matrix: MATERIAL_TO_SIZE },
    { sourceStep: 'material', targetStep: 'doorType', matrix: MATERIAL_TO_DOORTYPE },

    { sourceStep: 'size', targetStep: 'material', matrix: SIZE_TO_MATERIAL },
    { sourceStep: 'size', targetStep: 'doorType', matrix: SIZE_TO_DOORTYPE },

    { sourceStep: 'doorType', targetStep: 'material', matrix: DOORTYPE_TO_MATERIAL },
    { sourceStep: 'doorType', targetStep: 'size', matrix: DOORTYPE_TO_SIZE },
  ],
}

export const DEBUG_MATRICES = {
  MATERIAL_TO_SIZE,
  MATERIAL_TO_DOORTYPE,
  SIZE_TO_MATERIAL,
  SIZE_TO_DOORTYPE,
  DOORTYPE_TO_MATERIAL,
  DOORTYPE_TO_SIZE,
  VALID_MODEL_CODES,
}

const EA_STEPS = ['material', 'size', 'doorType']

function eaAllowlistFn(stepId: string, config: Configuration): Set<string> | null {
  return buildAllowlistSet(stepId, config, EA_STEPS, (s, o) =>
    getValidEAOptionsForStep(s as never, o as never),
  )
}

registerProductConstraints('enviro-armour', ENVIRO_ARMOUR_CONSTRAINTS, eaAllowlistFn)
