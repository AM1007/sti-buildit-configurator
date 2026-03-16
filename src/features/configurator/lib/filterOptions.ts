import type { Option, Configuration, Step, ModelId, ModelDefinition } from '@shared/types'
import type { ModelConstraints } from '@entities/product/rules/types'
import {
  createConstraintEngine,
  getStepAvailability,
} from '@entities/product/rules/constraintEngine'

import {
  G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS,
  getValidOptionsForStep as getValidG3Options,
} from '@entities/product/rules/g3multipurposepushbuttonrules'
import {
  STOPPER_STATIONS_CONSTRAINTS,
  getValidSSOptionsForStep,
} from '@entities/product/rules/stopperStationsRules'
import {
  GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS,
  getValidGFOptionsForStep,
} from '@entities/product/rules/gfFireAlarmPushButtonRules'
import {
  GLOBAL_RESET_CONSTRAINTS,
  getValidGLROptionsForStep,
} from '@entities/product/rules/globalResetRules'
import {
  RESET_CALL_POINTS_CONSTRAINTS,
  getValidRPOptionsForStep,
} from '@entities/product/rules/resetCallPointsRules'
import {
  WATERPROOF_RESET_CALL_POINT_CONSTRAINTS,
  getValidWRPOptionsForStep,
} from '@entities/product/rules/waterproofResetCallPointRules'
import {
  INDOOR_PUSH_BUTTONS_CONSTRAINTS,
  getValidIPBOptionsForStep,
} from '@entities/product/rules/indoorPushButtonsRules'
import {
  KEY_SWITCHES_CONSTRAINTS,
  getValidKSOptionsForStep,
} from '@entities/product/rules/keySwitchesRules'
import {
  WATERPROOF_PUSH_BUTTONS_CONSTRAINTS,
  getValidWPBOptionsForStep,
} from '@entities/product/rules/waterproofPushButtonsRules'
import {
  UNIVERSAL_STOPPER_CONSTRAINTS,
  getValidUSOptionsForStep,
} from '@entities/product/rules/universalStopperRules'
import {
  LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS,
  getValidLPUSOptionsForStep,
} from '@entities/product/rules/lowProfileUniversalStopperRules'
import {
  ENVIRO_STOPPER_CONSTRAINTS,
  getValidESOptionsForStep,
} from '@entities/product/rules/enviroStopperRules'
import {
  CALL_POINT_STOPPER_CONSTRAINTS,
  getValidCPSOptionsForStep,
} from '@entities/product/rules/callPointStopperRules'
import {
  ENVIRO_ARMOUR_CONSTRAINTS,
  getValidEAOptionsForStep,
} from '@entities/product/rules/enviroArmourRules'
import {
  EURO_STOPPER_CONSTRAINTS,
  getValidEUSOptionsForStep,
} from '@entities/product/rules/euroStopperRules'

export interface OptionAvailabilityResult {
  available: boolean
  reason?: string
}

export interface OptionWithAvailability {
  option: Option
  availability: OptionAvailabilityResult
}

const CONSTRAINTS_MAP: Record<string, ModelConstraints> = {
  'g3-multipurpose-push-button': G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS,
  'stopper-stations': STOPPER_STATIONS_CONSTRAINTS,
  'gf-fire-alarm-push-button': GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS,
  'global-reset': GLOBAL_RESET_CONSTRAINTS,
  'reset-call-points': RESET_CALL_POINTS_CONSTRAINTS,
  'waterproof-reset-call-point': WATERPROOF_RESET_CALL_POINT_CONSTRAINTS,
  'indoor-push-buttons': INDOOR_PUSH_BUTTONS_CONSTRAINTS,
  'key-switches': KEY_SWITCHES_CONSTRAINTS,
  'waterproof-push-buttons': WATERPROOF_PUSH_BUTTONS_CONSTRAINTS,
  'universal-stopper': UNIVERSAL_STOPPER_CONSTRAINTS,
  'low-profile-universal-stopper': LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS,
  'enviro-stopper': ENVIRO_STOPPER_CONSTRAINTS,
  'call-point-stopper': CALL_POINT_STOPPER_CONSTRAINTS,
  'enviro-armour': ENVIRO_ARMOUR_CONSTRAINTS,
  'euro-stopper': EURO_STOPPER_CONSTRAINTS,
}

function getModelConstraints(modelId: ModelId): ModelConstraints | null {
  return CONSTRAINTS_MAP[modelId] ?? null
}

type AllowlistFn = (stepId: string, config: Configuration) => Set<string> | null

function configKeys(
  config: Configuration,
  keys: string[],
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const k of keys) {
    const v = config[k as keyof Configuration]
    out[k] = v ?? undefined
  }
  return out
}

function buildAllowlistSet(
  stepId: string,
  config: Configuration,
  keys: string[],
  getValid: (stepId: string, others: Record<string, string | undefined>) => string[],
): Set<string> | null {
  const selection = configKeys(config, keys)
  const others: Record<string, string | undefined> = {}
  for (const k of keys) {
    if (k !== stepId) others[k] = selection[k]
  }
  return new Set(getValid(stepId, others))
}

function normalizeActivationToCode(id: string): string {
  if (id.startsWith('6-')) return '6'
  if (id.startsWith('7-')) return '7'
  return id
}

function expandActivationCodeToIds(code: string): string[] {
  if (code === '6') return ['6-red', '6-green', '6-blue']
  if (code === '7') return ['7-red', '7-green', '7-blue']
  return [code]
}

const SS_STEPS = ['colour', 'cover', 'activation', 'text', 'language']

function getSSAllowlist(stepId: string, config: Configuration): Set<string> | null {
  if (!SS_STEPS.includes(stepId)) return null

  const others: Record<string, string | undefined> = {}
  for (const k of SS_STEPS) {
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

const ALLOWLIST_REGISTRY: Record<string, AllowlistFn> = {
  'g3-multipurpose-push-button': (stepId, config) =>
    buildAllowlistSet(
      stepId,
      config,
      ['model', 'colour', 'cover', 'buttonType', 'text', 'language'],
      (s, o) => getValidG3Options(s as never, o as never),
    ),

  'stopper-stations': getSSAllowlist,

  'gf-fire-alarm-push-button': (stepId, config) =>
    buildAllowlistSet(stepId, config, ['model', 'cover', 'text', 'language'], (s, o) =>
      getValidGFOptionsForStep(s as never, o as never),
    ),

  'global-reset': (stepId, config) =>
    buildAllowlistSet(stepId, config, ['colour', 'cover', 'text', 'language'], (s, o) =>
      getValidGLROptionsForStep(s as never, o as never),
    ),

  'reset-call-points': (stepId, config) =>
    buildAllowlistSet(
      stepId,
      config,
      ['colour', 'mounting', 'electricalArrangement', 'label'],
      (s, o) => getValidRPOptionsForStep(s as never, o as never),
    ),

  'waterproof-reset-call-point': (stepId, config) =>
    buildAllowlistSet(
      stepId,
      config,
      ['colour', 'electricalArrangement', 'label'],
      (s, o) => getValidWRPOptionsForStep(s as never, o as never),
    ),

  'indoor-push-buttons': (stepId, config) =>
    buildAllowlistSet(
      stepId,
      config,
      ['colour', 'buttonColour', 'pushButtonType', 'electricalArrangements', 'label'],
      (s, o) => getValidIPBOptionsForStep(s as never, o as never),
    ),

  'key-switches': (stepId, config) =>
    buildAllowlistSet(
      stepId,
      config,
      ['colourMounting', 'switchType', 'electricalArrangement', 'label'],
      (s, o) => getValidKSOptionsForStep(s as never, o as never),
    ),

  'waterproof-push-buttons': (stepId, config) =>
    buildAllowlistSet(
      stepId,
      config,
      ['housingColour', 'buttonColour', 'buttonType', 'label'],
      (s, o) => getValidWPBOptionsForStep(s as never, o as never),
    ),

  'universal-stopper': (stepId, config) =>
    buildAllowlistSet(
      stepId,
      config,
      ['mounting', 'hoodSounder', 'colourLabel'],
      (s, o) => getValidUSOptionsForStep(s as never, o as never),
    ),

  'low-profile-universal-stopper': (stepId, config) =>
    buildAllowlistSet(
      stepId,
      config,
      ['mounting', 'hoodSounder', 'colourLabel'],
      (s, o) => getValidLPUSOptionsForStep(s as never, o as never),
    ),

  'enviro-stopper': (stepId, config) =>
    buildAllowlistSet(
      stepId,
      config,
      ['cover', 'mounting', 'hoodSounder', 'colourLabel'],
      (s, o) => getValidESOptionsForStep(s as never, o as never),
    ),

  'call-point-stopper': (stepId, config) =>
    buildAllowlistSet(stepId, config, ['mounting', 'colour', 'label'], (s, o) =>
      getValidCPSOptionsForStep(s as never, o as never),
    ),

  'enviro-armour': (stepId, config) =>
    buildAllowlistSet(stepId, config, ['material', 'size', 'doorType'], (s, o) =>
      getValidEAOptionsForStep(s as never, o as never),
    ),

  'euro-stopper': (stepId, config) =>
    buildAllowlistSet(stepId, config, ['mounting', 'sounder', 'colourLabel'], (s, o) =>
      getValidEUSOptionsForStep(s as never, o as never),
    ),
}

function getAllowlistValidOptions(
  modelId: ModelId,
  stepId: string,
  config: Configuration,
): Set<string> | null {
  const fn = ALLOWLIST_REGISTRY[modelId]
  return fn ? fn(stepId, config) : null
}

export function isOptionAvailable(option: Option, config: Configuration): boolean {
  if (!option.availableFor) return true
  if (!config.colour) return false
  return option.availableFor.includes(config.colour)
}

export function filterAvailableOptions(
  options: Option[],
  config: Configuration,
): Option[] {
  return options.filter((option) => isOptionAvailable(option, config))
}

export function isSelectionStillValid(
  optionId: string | null,
  options: Option[],
  config: Configuration,
): boolean {
  if (!optionId) return true
  const option = options.find((o) => o.id === optionId)
  if (!option) return false
  return isOptionAvailable(option, config)
}

export function getOptionsWithAvailability(
  step: Step,
  config: Configuration,
  modelId: ModelId,
): OptionWithAvailability[] {
  const constraints = getModelConstraints(modelId)

  if (!constraints) {
    return step.options.map((option) => ({
      option,
      availability: { available: true },
    }))
  }

  const engine = createConstraintEngine(constraints)
  const allOptionIds = step.options.map((o) => o.id)
  const stepAvailability = getStepAvailability(engine, step.id, allOptionIds, config)
  const allowlistValid = getAllowlistValidOptions(modelId, step.id, config)

  return step.options.map((option) => {
    const constraintResult = stepAvailability.options.find(
      (o) => o.optionId === option.id,
    )

    if (constraintResult && !constraintResult.available) {
      const reason =
        constraintResult.reasons.length > 0
          ? constraintResult.reasons[0].message
          : 'Not available with current configuration'
      return { option, availability: { available: false, reason } }
    }

    if (allowlistValid && !allowlistValid.has(option.id)) {
      return {
        option,
        availability: {
          available: false,
          reason: 'This option does not lead to a valid product model',
        },
      }
    }

    return { option, availability: { available: true } }
  })
}

export function isConfigurationComplete(
  model: ModelDefinition,
  config: Configuration,
): boolean {
  for (const stepId of model.stepOrder) {
    const step = model.steps.find((s) => s.id === stepId)
    if (!step?.required) continue
    if (!config[stepId]) return false
  }
  return true
}

export function getMissingRequiredSteps(
  model: ModelDefinition,
  config: Configuration,
): string[] {
  const missing: string[] = []
  for (const stepId of model.stepOrder) {
    const step = model.steps.find((s) => s.id === stepId)
    if (!step?.required) continue
    if (!config[stepId]) missing.push(stepId)
  }
  return missing
}

export function getCompletionPercentage(
  model: ModelDefinition,
  config: Configuration,
): number {
  const required = model.stepOrder.filter((id) => {
    const step = model.steps.find((s) => s.id === id)
    return step?.required
  })
  if (required.length === 0) return 100
  const completed = required.filter((id) => config[id] != null).length
  return Math.round((completed / required.length) * 100)
}

export function getSelectionsToReset(
  model: ModelDefinition,
  changedStepId: string,
  newConfig: Configuration,
): string[] {
  const toReset: string[] = []
  const constraints = getModelConstraints(model.id)

  if (!constraints) return toReset

  const engine = createConstraintEngine(constraints)
  const changedStepIndex = model.stepOrder.indexOf(changedStepId)

  for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
    const stepId = model.stepOrder[i]
    const current = newConfig[stepId]
    if (!current) continue

    const result = engine.checkOptionAvailability(stepId, current, newConfig)
    if (!result.available) toReset.push(stepId)
  }

  const allowlistFn = ALLOWLIST_REGISTRY[model.id]
  if (allowlistFn) {
    for (let i = changedStepIndex + 1; i < model.stepOrder.length; i++) {
      const stepId = model.stepOrder[i]
      if (toReset.includes(stepId)) continue

      const current = newConfig[stepId]
      if (!current) continue

      const valid = allowlistFn(stepId, newConfig)
      if (valid && !valid.has(current)) toReset.push(stepId)
    }
  }

  return toReset
}
