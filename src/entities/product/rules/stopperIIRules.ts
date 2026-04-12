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
  'STI-1230NR',
  'STI-1230',
  'STI-1230-G',
  'STI-1230CR',
  'STI-1230CG',
  'STI-1230CY',
  'STI-1230CE',
  'STI-1230-Y',
  'STI-1230-B',
  'STI-1100NR',
  'STI-1100',
  'STI-1100-G',
  'STI-1100CR',
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
  sounder?: string
  mounting?: string
  colour?: string
  label?: string
}

const CODE_TO_SELECTION: Record<string, StopperIISelectionState> = {
  'STI-1200NR': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'flush',
    colour: 'NR',
    label: 'none',
  },
  'STI-1200': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'flush',
    colour: 'red',
    label: 'fire',
  },
  'STI-1200A': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'backbox',
    colour: 'red',
    label: 'fire',
  },
  'STI-1200-G': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'flush',
    colour: 'green',
    label: 'emergency',
  },
  'STI-1200-Y': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'flush',
    colour: 'yellow',
    label: 'none',
  },
  'STI-1200-B': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'flush',
    colour: 'blue',
    label: 'none',
  },
  'STI-1230NR': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'NR',
    label: 'none',
  },
  'STI-1230': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'red',
    label: 'fire',
  },
  'STI-1230-G': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'green',
    label: 'emergency',
  },
  'STI-1230CR': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'red',
    label: 'custom',
  },
  'STI-1230CG': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'green',
    label: 'custom',
  },
  'STI-1230CY': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'yellow',
    label: 'custom',
  },
  'STI-1230CE': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'orange',
    label: 'custom',
  },
  'STI-1230-Y': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'yellow',
    label: 'none',
  },
  'STI-1230-B': {
    environment: 'indoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'blue',
    label: 'none',
  },
  'STI-1100NR': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'flush',
    colour: 'NR',
    label: 'none',
  },
  'STI-1100': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'flush',
    colour: 'red',
    label: 'fire',
  },
  'STI-1100-G': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'flush',
    colour: 'green',
    label: 'emergency',
  },
  'STI-1100CR': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'flush',
    colour: 'red',
    label: 'custom',
  },
  'STI-1100CB': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'flush',
    colour: 'blue',
    label: 'custom',
  },
  'STI-1100CE': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'flush',
    colour: 'orange',
    label: 'custom',
  },
  'STI-1100-Y': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'flush',
    colour: 'yellow',
    label: 'none',
  },
  'STI-1130': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'surface',
    colour: 'red',
    label: 'fire',
  },
  'STI-1130-G': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'surface',
    colour: 'green',
    label: 'emergency',
  },
  'STI-1130CR': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'surface',
    colour: 'red',
    label: 'custom',
  },
  'STI-1130CY': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'surface',
    colour: 'yellow',
    label: 'custom',
  },
  'STI-1130CB': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'surface',
    colour: 'blue',
    label: 'custom',
  },
  'STI-1130-Y': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'surface',
    colour: 'yellow',
    label: 'none',
  },
  'STI-1130-B': {
    environment: 'indoor',
    sounder: 'battery',
    mounting: 'surface',
    colour: 'blue',
    label: 'none',
  },
  'STI-1130-RC-G': {
    environment: 'indoor',
    sounder: 'dc',
    mounting: 'surface',
    colour: 'green',
    label: 'emergency',
  },
  'STI-1250': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'flush',
    colour: 'red',
    label: 'fire',
  },
  'STI-1250-G': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'flush',
    colour: 'green',
    label: 'emergency',
  },
  'STI-1250CR': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'flush',
    colour: 'red',
    label: 'custom',
  },
  'STI-1250NR': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'flush',
    colour: 'red',
    label: 'none',
  },
  'STI-1250NG': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'flush',
    colour: 'green',
    label: 'none',
  },
  'STI-3150': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'red',
    label: 'fire',
  },
  'STI-3150-G': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'green',
    label: 'emergency',
  },
  'STI-3150CR': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'red',
    label: 'custom',
  },
  'STI-3150CY': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'yellow',
    label: 'custom',
  },
  'STI-3150CB': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'blue',
    label: 'custom',
  },
  'STI-3150NR': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'red',
    label: 'none',
  },
  'STI-3150-Y': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'yellow',
    label: 'none',
  },
  'STI-3150-B': {
    environment: 'outdoor',
    sounder: 'none',
    mounting: 'surface',
    colour: 'blue',
    label: 'none',
  },
  'STI-1150': {
    environment: 'outdoor',
    sounder: 'battery',
    mounting: 'flush',
    colour: 'red',
    label: 'fire',
  },
  'STI-1155': {
    environment: 'outdoor',
    sounder: 'battery',
    mounting: 'surface',
    colour: 'red',
    label: 'fire',
  },
  'STI-1155-G': {
    environment: 'outdoor',
    sounder: 'battery',
    mounting: 'surface',
    colour: 'green',
    label: 'emergency',
  },
}

const ALL_SELECTIONS = Object.values(CODE_TO_SELECTION)

export function buildStopperIIModelCode(
  selections: StopperIISelectionState,
): string | null {
  const { environment, sounder, mounting, colour, label } = selections

  if (!environment || !sounder || !mounting || !colour || !label) {
    return null
  }

  const key = `${environment}|${sounder}|${mounting}|${colour}|${label}`

  for (const [code, sel] of Object.entries(CODE_TO_SELECTION)) {
    const selKey = `${sel.environment}|${sel.sounder}|${sel.mounting}|${sel.colour}|${sel.label}`
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
    const { environment, sounder, mounting, colour, label } = selections
    if (!environment || !sounder || !mounting || !colour || !label) {
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

const STOPPER_II_STEPS = ['environment', 'sounder', 'mounting', 'colour', 'label']

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
