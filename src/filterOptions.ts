import type {
  Option,
  Step,
  Configuration,
  ModelDefinition,
  AvailabilityResult,
  StepId,
} from "./types";

import {
  createConstraintEngine,
  STOPPER_STATIONS_CONSTRAINTS,
  INDOOR_PUSH_BUTTONS_CONSTRAINTS,
  KEY_SWITCHES_CONSTRAINTS,
  WATERPROOF_PUSH_BUTTONS_CONSTRAINTS,
  RESET_CALL_POINTS_CONSTRAINTS,
  WATERPROOF_RESET_CALL_POINT_CONSTRAINTS,
  UNIVERSAL_STOPPER_CONSTRAINTS,
  LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS,
  type IConstraintEngine,
  type ConstraintResult,
} from "./rules";

const engineCache = new Map<string, IConstraintEngine>();

function getConstraintEngine(modelId: string): IConstraintEngine | null {
  if (engineCache.has(modelId)) {
    return engineCache.get(modelId)!;
  }
  
  switch (modelId) {
    case "low-profile-universal-stopper": {
      const engine = createConstraintEngine(LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS);
      engineCache.set(modelId, engine);
      return engine;
    }
    case "stopper-stations": {
      const engine = createConstraintEngine(STOPPER_STATIONS_CONSTRAINTS);
      engineCache.set(modelId, engine);
      return engine;
    }
    case "indoor-push-buttons": {
      const engine = createConstraintEngine(INDOOR_PUSH_BUTTONS_CONSTRAINTS);
      engineCache.set(modelId, engine);
      return engine;
    }
    case "key-switches": {
      const engine = createConstraintEngine(KEY_SWITCHES_CONSTRAINTS);
      engineCache.set(modelId, engine);
      return engine;
    }
    case "waterproof-push-buttons": {
      const engine = createConstraintEngine(WATERPROOF_PUSH_BUTTONS_CONSTRAINTS);
      engineCache.set(modelId, engine);
      return engine;
    }
    case "reset-call-points": {
      const engine = createConstraintEngine(RESET_CALL_POINTS_CONSTRAINTS);
      engineCache.set(modelId, engine);
      return engine;
    }
    case "waterproof-reset-call-point": {
      const engine = createConstraintEngine(WATERPROOF_RESET_CALL_POINT_CONSTRAINTS);
      engineCache.set(modelId, engine);
      return engine;
    }
    case "universal-stopper": {
      const engine = createConstraintEngine(UNIVERSAL_STOPPER_CONSTRAINTS);
      engineCache.set(modelId, engine);
      return engine;
    }
    default:
      return null;
  }
}

export function checkOptionAvailability(
  option: Option,
  config: Configuration,
  modelId?: string,
  stepId?: string
): AvailabilityResult {
  if (modelId && stepId) {
    const engine = getConstraintEngine(modelId);
    if (engine) {
      const result = engine.checkOptionAvailability(stepId, option.id, config);
      if (!result.available) {
        return {
          available: false,
          reason: result.reasons.map((r) => r.message).join("; "),
          blockedBy: result.reasons[0]?.blockedBy,
        };
      }
      return { available: true };
    }
  }
  
  return checkOptionAvailabilityLegacy(option, config);
}

function checkOptionAvailabilityLegacy(
  option: Option,
  config: Configuration
): AvailabilityResult {
  if (!option.availableFor || !option.dependsOn) {
    return { available: true };
  }

  const dependencyStepId = option.dependsOn;
  const selectedValue = config[dependencyStepId];

  if (!selectedValue) {
    return {
      available: false,
      reason: `Requires ${dependencyStepId} selection first`,
      blockedBy: dependencyStepId,
    };
  }

  if (option.availableFor.includes(selectedValue)) {
    return { available: true };
  }

  return {
    available: false,
    reason: `Not compatible with selected ${dependencyStepId}`,
    blockedBy: dependencyStepId,
  };
}

export function isOptionAvailable(
  option: Option,
  config: Configuration,
  modelId?: string,
  stepId?: string
): boolean {
  return checkOptionAvailability(option, config, modelId, stepId).available;
}

export function getOptionsWithAvailability(
  step: Step,
  config: Configuration,
  modelId?: string
): Array<{ option: Option; availability: AvailabilityResult }> {
  return step.options.map((option) => ({
    option,
    availability: checkOptionAvailability(option, config, modelId, step.id),
  }));
}

export function filterAvailableOptions(
  options: Option[],
  config: Configuration,
  modelId?: string,
  stepId?: string
): Option[] {
  return options.filter((option) => 
    isOptionAvailable(option, config, modelId, stepId)
  );
}

export function countAvailableOptions(
  step: Step,
  config: Configuration,
  modelId?: string
): number {
  return step.options.filter((opt) => 
    isOptionAvailable(opt, config, modelId, step.id)
  ).length;
}

export function isSelectionStillValid(
  optionId: string | null,
  step: Step,
  config: Configuration,
  modelId?: string
): boolean {
  if (!optionId) {
    return true;
  }

  const option = step.options.find((o) => o.id === optionId);
  if (!option) {
    return false;
  }

  return isOptionAvailable(option, config, modelId, step.id);
}

export function findInvalidSelections(
  model: ModelDefinition,
  config: Configuration
): StepId[] {
  const invalid: StepId[] = [];

  const engine = getConstraintEngine(model.id);
  if (engine) {
    return engine.validateConfiguration(config);
  }

  for (const step of model.steps) {
    const selectedId = config[step.id];
    if (selectedId && !isSelectionStillValid(selectedId, step, config, model.id)) {
      invalid.push(step.id);
    }
  }

  return invalid;
}

export function getSelectionsToReset(
  model: ModelDefinition,
  changedStepId: StepId,
  config: Configuration
): StepId[] {
  const toReset: StepId[] = [];

  const engine = getConstraintEngine(model.id);
  
  for (const step of model.steps) {
    if (step.id === changedStepId) {
      continue;
    }

    const selectedId = config[step.id];
    if (!selectedId) {
      continue;
    }

    let isValid: boolean;
    
    if (engine) {
      const result = engine.checkOptionAvailability(step.id, selectedId, config);
      isValid = result.available;
    } else {
      isValid = isSelectionStillValid(selectedId, step, config, model.id);
    }

    if (!isValid) {
      toReset.push(step.id);
    }
  }

  return toReset;
}

export function isConfigurationComplete(
  model: ModelDefinition,
  config: Configuration
): boolean {
  for (const step of model.steps) {
    if (step.required && !config[step.id]) {
      return false;
    }
  }
  return true;
}

export function getMissingRequiredSteps(
  model: ModelDefinition,
  config: Configuration
): StepId[] {
  return model.steps
    .filter((step) => step.required && !config[step.id])
    .map((step) => step.id);
}

export function getCompletionPercentage(
  model: ModelDefinition,
  config: Configuration
): number {
  const requiredSteps = model.steps.filter((s) => s.required);
  if (requiredSteps.length === 0) return 100;

  const completedCount = requiredSteps.filter((s) => config[s.id]).length;
  return Math.round((completedCount / requiredSteps.length) * 100);
}

export function debugOptionAvailability(
  modelId: string,
  stepId: StepId,
  optionId: string,
  config: Configuration
): ConstraintResult | null {
  const engine = getConstraintEngine(modelId);
  if (!engine) {
    return null;
  }
  return engine.checkOptionAvailability(stepId, optionId, config);
}

