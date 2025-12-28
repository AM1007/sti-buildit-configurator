// ============================================================================
// CONSTRAINT ENGINE
// ============================================================================
//
// Universal rule engine for option availability checking.
//
// Features:
// - Bidirectional constraint support
// - Multi-dependency AND logic (intersection)
// - Detailed blocking reasons
// - Configuration validation
//
// Usage:
//   const engine = createConstraintEngine(STOPPER_STATIONS_CONSTRAINTS);
//   const result = engine.checkOptionAvailability("activation", "0", config);
//
// ============================================================================

import type {
  ModelConstraints,
  StepConstraint,
  ConstraintResult,
  BlockReason,
  ConfigurationState,
  IConstraintEngine,
  OptionAvailability,
  StepAvailability,
} from "./types";
import type { StepId, OptionId } from "../types";

// ============================================================================
// CONSTRAINT ENGINE IMPLEMENTATION
// ============================================================================

class ConstraintEngine implements IConstraintEngine {
  private constraints: StepConstraint[];
  private constraintsByTarget: Map<StepId, StepConstraint[]>;
  
  constructor(modelConstraints: ModelConstraints) {
    this.constraints = modelConstraints.constraints;
    
    // Index constraints by target step for fast lookup
    this.constraintsByTarget = new Map();
    for (const constraint of this.constraints) {
      const existing = this.constraintsByTarget.get(constraint.targetStep) || [];
      existing.push(constraint);
      this.constraintsByTarget.set(constraint.targetStep, existing);
    }
  }
  
  /**
   * Check if a specific option is available given current configuration.
   * Applies AND logic: option must satisfy ALL constraints.
   */
  checkOptionAvailability(
    stepId: StepId,
    optionId: OptionId,
    config: ConfigurationState
  ): ConstraintResult {
    const reasons: BlockReason[] = [];
    
    // Get all constraints that affect this step
    const constraintsForStep = this.constraintsByTarget.get(stepId) || [];
    
    for (const constraint of constraintsForStep) {
      const sourceSelection = config[constraint.sourceStep];
      
      // If source step has no selection, this constraint doesn't apply
      if (!sourceSelection) {
        continue;
      }
      
      // Get allowed options for this source selection
      const allowedOptions = constraint.matrix[sourceSelection];
      
      // If source selection is not in matrix, assume no restrictions
      // ASSUMPTION: Missing matrix entry = all options allowed
      if (!allowedOptions) {
        continue;
      }
      
      // Check if target option is in allowed list
      if (!allowedOptions.includes(optionId)) {
        reasons.push({
          blockedBy: constraint.sourceStep,
          selectedOption: sourceSelection,
          message: `Not compatible with ${constraint.sourceStep}: ${sourceSelection}`,
        });
      }
    }
    
    return {
      available: reasons.length === 0,
      reasons,
    };
  }
  
  /**
   * Get all available options for a step given current configuration.
   */
  getAvailableOptions(
    stepId: StepId,
    allOptionIds: OptionId[],
    config: ConfigurationState
  ): OptionId[] {
    return allOptionIds.filter((optionId) => {
      const result = this.checkOptionAvailability(stepId, optionId, config);
      return result.available;
    });
  }
  
  /**
   * Validate entire configuration, return steps with invalid selections.
   */
  validateConfiguration(config: ConfigurationState): StepId[] {
    const invalidSteps: StepId[] = [];
    
    for (const [stepId, optionId] of Object.entries(config)) {
      if (!optionId) {
        continue; // No selection = nothing to validate
      }
      
      const result = this.checkOptionAvailability(stepId, optionId, config);
      if (!result.available) {
        invalidSteps.push(stepId);
      }
    }
    
    return invalidSteps;
  }
  
  /**
   * Get options in targetStep that are blocked by a specific step's selection.
   */
  getBlockedByStep(
    targetStepId: StepId,
    blockingStepId: StepId,
    config: ConfigurationState
  ): OptionId[] {
    const blocked: OptionId[] = [];
    
    // Find constraint from blocking step to target step
    const constraint = this.constraints.find(
      (c) => c.sourceStep === blockingStepId && c.targetStep === targetStepId
    );
    
    if (!constraint) {
      return blocked;
    }
    
    const sourceSelection = config[blockingStepId];
    if (!sourceSelection) {
      return blocked;
    }
    
    const allowedOptions = constraint.matrix[sourceSelection];
    if (!allowedOptions) {
      return blocked;
    }
    
    // Return all options NOT in allowed list
    // ASSUMPTION: Caller provides all option IDs separately
    // This method just returns what's in the matrix as "blocked"
    for (const [optionId, allowedForOption] of Object.entries(constraint.matrix)) {
      if (!allowedForOption.includes(sourceSelection)) {
        blocked.push(optionId);
      }
    }
    
    return blocked;
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Create a constraint engine for a model.
 */
export function createConstraintEngine(
  modelConstraints: ModelConstraints
): IConstraintEngine {
  return new ConstraintEngine(modelConstraints);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get availability for all options in a step.
 * Convenience function for UI components.
 */
export function getStepAvailability(
  engine: IConstraintEngine,
  stepId: StepId,
  allOptionIds: OptionId[],
  config: ConfigurationState
): StepAvailability {
  const options: OptionAvailability[] = allOptionIds.map((optionId) => {
    const result = engine.checkOptionAvailability(stepId, optionId, config);
    return {
      optionId,
      available: result.available,
      reasons: result.reasons,
    };
  });
  
  const availableCount = options.filter((o) => o.available).length;
  
  return {
    stepId,
    options,
    availableCount,
    totalCount: allOptionIds.length,
  };
}

/**
 * Find steps that need to be reset after a selection change.
 * Returns steps whose current selection is now invalid.
 */
export function findInvalidSelectionsAfterChange(
  engine: IConstraintEngine,
  changedStepId: StepId,
  config: ConfigurationState
): StepId[] {
  const invalid: StepId[] = [];
  
  for (const [stepId, optionId] of Object.entries(config)) {
    // Skip the step that was just changed
    if (stepId === changedStepId) {
      continue;
    }
    
    // Skip steps with no selection
    if (!optionId) {
      continue;
    }
    
    // Check if current selection is still valid
    const result = engine.checkOptionAvailability(stepId, optionId, config);
    if (!result.available) {
      invalid.push(stepId);
    }
  }
  
  return invalid;
}

/**
 * Format blocking reasons into human-readable string.
 */
export function formatBlockReasons(reasons: BlockReason[]): string {
  if (reasons.length === 0) {
    return "";
  }
  
  if (reasons.length === 1) {
    return reasons[0].message;
  }
  
  return reasons.map((r) => r.message).join("; ");
}