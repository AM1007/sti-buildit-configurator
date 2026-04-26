import type { ModelConstraints } from './types'
import { registerProductConstraints } from '../constraintRegistry'
import type { Configuration } from '@shared/types'

export const VALID_MODEL_CODES: readonly string[] = [
  'STI-1200NR',
  'STI-1200',
  'STI-1200A',
  'STI-1200-G',
  'STI-1200-Y',
  'STI-1200-B',
  'STI-1200-CY',
  'STI-1200-CB',
  'STI-1230NR',
  'STI-1230',
  'STI-1230-G',
  'STI-1230CR',
  'STI-1230CG',
  'STI-1230CY',
  'STI-1230-CB',
  'STI-1230CE',
  'STI-1230-Y',
  'STI-1230-B',
  'STI-1100NR',
  'STI-1100',
  'STI-1100-G',
  'STI-1100CR',
  'STI-1100CY',
  'STI-1100CB',
  'STI-1100CE',
  'STI-1100-Y',
  'STI-1130',
  'STI-1130-G',
  'STI-1130CR',
  'STI-1130CY',
  'STI-1130CB',
  'STI-1130-Y',
  'STI-1130-B',
  'STI-1130-RC-G',
  'STI-1250',
  'STI-1250-G',
  'STI-1250CR',
  'STI-1250CG',
  'STI-1250NR',
  'STI-1250NG',
  'STI-3150',
  'STI-3150-G',
  'STI-3150CR',
  'STI-3150CY',
  'STI-3150CB',
  'STI-3150NR',
  'STI-3150-Y',
  'STI-3150-B',
  'STI-1150',
  'STI-1155',
  'STI-1155-G',
] as const

export interface StopperIISelectionState {
  environment?: string
  mounting?: string
  sounder?: string
  colourLabel?: string
}

const CODE_TO_SELECTION: Record<string, StopperIISelectionState> = {
  'STI-1200NR': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'NC',
  },
  'STI-1200': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'FR',
  },
  'STI-1200A': {
    environment: 'indoor',
    mounting: 'backbox',
    sounder: 'none',
    colourLabel: 'FR',
  },
  'STI-1200-G': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'EG',
  },
  'STI-1200-Y': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'NY',
  },
  'STI-1200-B': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'NB',
  },
  'STI-1200-CY': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'CY',
  },
  'STI-1200-CB': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'CB',
  },
  'STI-1230NR': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'NC',
  },
  'STI-1230': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'FR',
  },
  'STI-1230-G': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'EG',
  },
  'STI-1230CR': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'CR',
  },
  'STI-1230CG': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'CG',
  },
  'STI-1230CY': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'CY',
  },
  'STI-1230-CB': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'CB',
  },
  'STI-1230CE': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'CE',
  },
  'STI-1230-Y': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'NY',
  },
  'STI-1230-B': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'NB',
  },
  'STI-1100NR': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'battery',
    colourLabel: 'NC',
  },
  'STI-1100': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'battery',
    colourLabel: 'FR',
  },
  'STI-1100-G': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'battery',
    colourLabel: 'EG',
  },
  'STI-1100CR': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'battery',
    colourLabel: 'CR',
  },
  'STI-1100CY': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'battery',
    colourLabel: 'CY',
  },
  'STI-1100CB': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'battery',
    colourLabel: 'CB',
  },
  'STI-1100CE': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'battery',
    colourLabel: 'CE',
  },
  'STI-1100-Y': {
    environment: 'indoor',
    mounting: 'flush',
    sounder: 'battery',
    colourLabel: 'NY',
  },
  'STI-1130': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'battery',
    colourLabel: 'FR',
  },
  'STI-1130-G': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'battery',
    colourLabel: 'EG',
  },
  'STI-1130CR': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'battery',
    colourLabel: 'CR',
  },
  'STI-1130CY': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'battery',
    colourLabel: 'CY',
  },
  'STI-1130CB': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'battery',
    colourLabel: 'CB',
  },
  'STI-1130-Y': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'battery',
    colourLabel: 'NY',
  },
  'STI-1130-B': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'battery',
    colourLabel: 'NB',
  },
  'STI-1130-RC-G': {
    environment: 'indoor',
    mounting: 'surface',
    sounder: 'dc',
    colourLabel: 'EG',
  },
  'STI-1250': {
    environment: 'outdoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'FR',
  },
  'STI-1250-G': {
    environment: 'outdoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'EG',
  },
  'STI-1250CR': {
    environment: 'outdoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'CR',
  },
  'STI-1250CG': {
    environment: 'outdoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'CG',
  },
  'STI-1250NR': {
    environment: 'outdoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'NR',
  },
  'STI-1250NG': {
    environment: 'outdoor',
    mounting: 'flush',
    sounder: 'none',
    colourLabel: 'NG',
  },
  'STI-3150': {
    environment: 'outdoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'FR',
  },
  'STI-3150-G': {
    environment: 'outdoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'EG',
  },
  'STI-3150CR': {
    environment: 'outdoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'CR',
  },
  'STI-3150CY': {
    environment: 'outdoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'CY',
  },
  'STI-3150CB': {
    environment: 'outdoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'CB',
  },
  'STI-3150NR': {
    environment: 'outdoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'NR',
  },
  'STI-3150-Y': {
    environment: 'outdoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'NY',
  },
  'STI-3150-B': {
    environment: 'outdoor',
    mounting: 'surface',
    sounder: 'none',
    colourLabel: 'NB',
  },
  'STI-1150': {
    environment: 'outdoor',
    mounting: 'flush',
    sounder: 'battery',
    colourLabel: 'FR',
  },
  'STI-1155': {
    environment: 'outdoor',
    mounting: 'surface',
    sounder: 'battery',
    colourLabel: 'FR',
  },
  'STI-1155-G': {
    environment: 'outdoor',
    mounting: 'surface',
    sounder: 'battery',
    colourLabel: 'EG',
  },
}

const ALL_SELECTIONS = Object.values(CODE_TO_SELECTION)

export function buildStopperIIModelCode(
  selections: StopperIISelectionState,
): string | null {
  const { environment, mounting, sounder, colourLabel } = selections

  if (!environment || !mounting || !sounder || !colourLabel) {
    return null
  }

  const key = `${environment}|${mounting}|${sounder}|${colourLabel}`

  for (const [code, sel] of Object.entries(CODE_TO_SELECTION)) {
    const selKey = `${sel.environment}|${sel.mounting}|${sel.sounder}|${sel.colourLabel}`
    if (selKey === key) return code
  }

  return null
}

export function parseStopperIIModelCode(code: string): StopperIISelectionState | null {
  return CODE_TO_SELECTION[code] ?? null
}

export function isValidStopperIICombination(
  selections: StopperIISelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildStopperIIModelCode(selections)

  if (!modelCode) {
    const { environment, mounting, sounder, colourLabel } = selections
    if (!environment || !mounting || !sounder || !colourLabel) {
      return { valid: true }
    }
    return {
      valid: false,
      reason: `This combination is not available in the Stopper II product range.`,
    }
  }

  return { valid: true }
}

export function getValidStopperIIOptionsForStep(
  stepId: keyof StopperIISelectionState,
  currentSelections: Partial<StopperIISelectionState>,
): string[] {
  const validOptions = new Set<string>()

  for (const sel of ALL_SELECTIONS) {
    let matches = true
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && sel[key as keyof StopperIISelectionState] !== value) {
        matches = false
        break
      }
    }

    if (matches) {
      const optionValue = sel[stepId]
      if (optionValue) {
        validOptions.add(optionValue)
      }
    }
  }

  return Array.from(validOptions)
}

export const STOPPER_II_CONSTRAINTS: ModelConstraints = {
  modelId: 'stopper-ii',
  constraints: [],
}

const STOPPER_II_STEPS = ['environment', 'mounting', 'sounder', 'colourLabel']

function stopperIIAllowlistFn(stepId: string, config: Configuration): Set<string> | null {
  const others: Partial<StopperIISelectionState> = {}
  for (const k of STOPPER_II_STEPS) {
    if (k !== stepId) {
      const v = config[k]
      if (v) (others as Record<string, string>)[k] = v
    }
  }
  return new Set(
    getValidStopperIIOptionsForStep(stepId as keyof StopperIISelectionState, others),
  )
}

registerProductConstraints('stopper-ii', STOPPER_II_CONSTRAINTS, stopperIIAllowlistFn)
