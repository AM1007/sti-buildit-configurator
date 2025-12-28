// ============================================================================
// UNIVERSAL RULE ENGINE - OPTION FILTERING
// ============================================================================
//
// Determines option availability based on:
// 1. Legacy `availableFor` rules (for models without constraint engine)
// 2. Constraint engine rules (for models with bidirectional deps)
//
// Migration status:
// - stopper-stations: ✅ constraint engine
// - indoor-push-buttons: ✅ constraint engine
// - Other models: legacy availableFor
//
// ============================================================================

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
  type IConstraintEngine,
  type ConstraintResult,
} from "./rules";

// ============================================================================
// CONSTRAINT ENGINE INSTANCES (cached)
// ============================================================================

const engineCache = new Map<string, IConstraintEngine>();

/**
 * Get or create constraint engine for a model.
 * Returns null if model doesn't have constraint rules.
 */
function getConstraintEngine(modelId: string): IConstraintEngine | null {
  if (engineCache.has(modelId)) {
    return engineCache.get(modelId)!;
  }
  
  // Models with constraint engine
  switch (modelId) {
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
    default:
      // Other models: no constraint engine yet
      return null;
  }
}

// ============================================================================
// CORE AVAILABILITY CHECK
// ============================================================================

/**
 * Checks if a single option is available based on current configuration.
 * Uses constraint engine if available, falls back to legacy logic.
 *
 * @param option - The option to check
 * @param config - Current configuration state
 * @param modelId - Optional model ID for constraint engine lookup
 * @param stepId - Optional step ID for constraint engine
 * @returns AvailabilityResult with available flag and reason if blocked
 */
export function checkOptionAvailability(
  option: Option,
  config: Configuration,
  modelId?: string,
  stepId?: string
): AvailabilityResult {
  // Try constraint engine first
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
  
  // Fall back to legacy logic
  return checkOptionAvailabilityLegacy(option, config);
}

/**
 * Legacy availability check using availableFor arrays.
 */
function checkOptionAvailabilityLegacy(
  option: Option,
  config: Configuration
): AvailabilityResult {
  // No dependency defined = always available
  if (!option.availableFor || !option.dependsOn) {
    return { available: true };
  }

  const dependencyStepId = option.dependsOn;
  const selectedValue = config[dependencyStepId];

  // Dependency step has no selection = blocked
  if (!selectedValue) {
    return {
      available: false,
      reason: `Requires ${dependencyStepId} selection first`,
      blockedBy: dependencyStepId,
    };
  }

  // Check if selected value is in the allowed list
  if (option.availableFor.includes(selectedValue)) {
    return { available: true };
  }

  return {
    available: false,
    reason: `Not compatible with selected ${dependencyStepId}`,
    blockedBy: dependencyStepId,
  };
}

/**
 * Simple boolean check for option availability.
 */
export function isOptionAvailable(
  option: Option,
  config: Configuration,
  modelId?: string,
  stepId?: string
): boolean {
  return checkOptionAvailability(option, config, modelId, stepId).available;
}

// ============================================================================
// STEP-LEVEL FILTERING
// ============================================================================

/**
 * Gets all options for a step with their availability status.
 * Uses constraint engine for supported models.
 */
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

/**
 * Filters options to return only those currently available.
 */
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

/**
 * Counts available options in a step.
 */
export function countAvailableOptions(
  step: Step,
  config: Configuration,
  modelId?: string
): number {
  return step.options.filter((opt) => 
    isOptionAvailable(opt, config, modelId, step.id)
  ).length;
}

// ============================================================================
// SELECTION VALIDATION
// ============================================================================

/**
 * Checks if a current selection is still valid after configuration change.
 */
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

/**
 * Finds all invalid selections in a configuration after a change.
 */
export function findInvalidSelections(
  model: ModelDefinition,
  config: Configuration
): StepId[] {
  const invalid: StepId[] = [];

  // Try constraint engine first
  const engine = getConstraintEngine(model.id);
  if (engine) {
    return engine.validateConfiguration(config);
  }

  // Fall back to legacy validation
  for (const step of model.steps) {
    const selectedId = config[step.id];
    if (selectedId && !isSelectionStillValid(selectedId, step, config, model.id)) {
      invalid.push(step.id);
    }
  }

  return invalid;
}

// ============================================================================
// CASCADE RESET LOGIC
// ============================================================================

/**
 * Determines which selections should be reset when a step changes.
 * Uses constraint engine for bidirectional validation.
 */
export function getSelectionsToReset(
  model: ModelDefinition,
  changedStepId: StepId,
  config: Configuration
): StepId[] {
  const toReset: StepId[] = [];

  // Use constraint engine if available
  const engine = getConstraintEngine(model.id);
  
  for (const step of model.steps) {
    // Skip the step that was just changed
    if (step.id === changedStepId) {
      continue;
    }

    const selectedId = config[step.id];
    if (!selectedId) {
      continue;
    }

    // Check if current selection is still valid
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

// ============================================================================
// MODEL-LEVEL UTILITIES
// ============================================================================

/**
 * Checks if a configuration is complete (all required steps selected).
 */
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

/**
 * Gets list of missing required steps.
 */
export function getMissingRequiredSteps(
  model: ModelDefinition,
  config: Configuration
): StepId[] {
  return model.steps
    .filter((step) => step.required && !config[step.id])
    .map((step) => step.id);
}

/**
 * Gets completion percentage (0-100).
 */
export function getCompletionPercentage(
  model: ModelDefinition,
  config: Configuration
): number {
  const requiredSteps = model.steps.filter((s) => s.required);
  if (requiredSteps.length === 0) return 100;

  const completedCount = requiredSteps.filter((s) => config[s.id]).length;
  return Math.round((completedCount / requiredSteps.length) * 100);
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

/**
 * Get detailed availability info for debugging.
 */
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

