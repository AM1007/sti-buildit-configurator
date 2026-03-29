import type { Option, Configuration, Step, ModelId, ModelDefinition } from '@shared/types'
import {
  createConstraintEngine,
  getStepAvailability,
} from '@entities/product/rules/constraintEngine'
import { getModelConstraints, getAllowlistFn } from '@entities/product/constraintRegistry'
import '@entities/product/rules'

export interface OptionAvailabilityResult {
  available: boolean
  reason?: string
}

export interface OptionWithAvailability {
  option: Option
  availability: OptionAvailabilityResult
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

  const allowlistFn = getAllowlistFn(modelId)
  const allowlistValid = allowlistFn ? allowlistFn(step.id, config) : null

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

export function getVisibleSteps(model: ModelDefinition, config: Configuration): Step[] {
  return model.stepOrder
    .map((stepId) => model.steps.find((s) => s.id === stepId))
    .filter((step): step is Step => step !== undefined)
    .filter((step) => {
      const options = getOptionsWithAvailability(step, config, model.id)
      return options.some(({ availability }) => availability.available)
    })
}

export function isConfigurationComplete(
  model: ModelDefinition,
  config: Configuration,
): boolean {
  const visibleSteps = getVisibleSteps(model, config)
  for (const step of visibleSteps) {
    if (!step.required) continue
    if (!config[step.id]) return false
  }
  return true
}

export function getMissingRequiredSteps(
  model: ModelDefinition,
  config: Configuration,
): string[] {
  const missing: string[] = []
  const visibleSteps = getVisibleSteps(model, config)
  for (const step of visibleSteps) {
    if (!step.required) continue
    if (!config[step.id]) missing.push(step.id)
  }
  return missing
}

export function getCompletionPercentage(
  model: ModelDefinition,
  config: Configuration,
): number {
  const visibleSteps = getVisibleSteps(model, config)
  if (visibleSteps.length === 0) return 0
  const completed = visibleSteps.filter((step) => config[step.id] != null).length
  return Math.round((completed / visibleSteps.length) * 100)
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

  const allowlistFn = getAllowlistFn(model.id)
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
