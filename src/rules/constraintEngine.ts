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

class ConstraintEngine implements IConstraintEngine {
  private constraints: StepConstraint[];
  private constraintsByTarget: Map<StepId, StepConstraint[]>;
  
  constructor(modelConstraints: ModelConstraints) {
    this.constraints = modelConstraints.constraints;
    
    this.constraintsByTarget = new Map();
    for (const constraint of this.constraints) {
      const existing = this.constraintsByTarget.get(constraint.targetStep) || [];
      existing.push(constraint);
      this.constraintsByTarget.set(constraint.targetStep, existing);
    }
  }
  
  checkOptionAvailability(
    stepId: StepId,
    optionId: OptionId,
    config: ConfigurationState
  ): ConstraintResult {
    const reasons: BlockReason[] = [];
    
    const constraintsForStep = this.constraintsByTarget.get(stepId) || [];
    
    for (const constraint of constraintsForStep) {
      const sourceSelection = config[constraint.sourceStep];
      
      if (!sourceSelection) {
        continue;
      }
      
      const allowedOptions = constraint.matrix[sourceSelection];
      
      if (!allowedOptions) {
        continue;
      }
      
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
  
  validateConfiguration(config: ConfigurationState): StepId[] {
    const invalidSteps: StepId[] = [];
    
    for (const [stepId, optionId] of Object.entries(config)) {
      if (!optionId) {
        continue;
      }
      
      const result = this.checkOptionAvailability(stepId, optionId, config);
      if (!result.available) {
        invalidSteps.push(stepId);
      }
    }
    
    return invalidSteps;
  }
  
  getBlockedByStep(
    targetStepId: StepId,
    blockingStepId: StepId,
    config: ConfigurationState
  ): OptionId[] {
    const blocked: OptionId[] = [];
    
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
    
    for (const [optionId, allowedForOption] of Object.entries(constraint.matrix)) {
      if (!allowedForOption.includes(sourceSelection)) {
        blocked.push(optionId);
      }
    }
    
    return blocked;
  }
}

export function createConstraintEngine(
  modelConstraints: ModelConstraints
): IConstraintEngine {
  return new ConstraintEngine(modelConstraints);
}

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

export function findInvalidSelectionsAfterChange(
  engine: IConstraintEngine,
  changedStepId: StepId,
  config: ConfigurationState
): StepId[] {
  const invalid: StepId[] = [];
  
  for (const [stepId, optionId] of Object.entries(config)) {
    if (stepId === changedStepId) {
      continue;
    }
    
    if (!optionId) {
      continue;
    }
    
    const result = engine.checkOptionAvailability(stepId, optionId, config);
    if (!result.available) {
      invalid.push(stepId);
    }
  }
  
  return invalid;
}

export function formatBlockReasons(reasons: BlockReason[]): string {
  if (reasons.length === 0) {
    return "";
  }
  
  if (reasons.length === 1) {
    return reasons[0].message;
  }
  
  return reasons.map((r) => r.message).join("; ");
}