import type { StepId, OptionId } from "../types";

export type ConstraintMatrix = Record<OptionId, OptionId[]>;

export interface StepConstraint {
  sourceStep: StepId;
  targetStep: StepId;
  matrix: ConstraintMatrix;
}

export interface ModelConstraints {
  modelId: string;
  constraints: StepConstraint[];
}

export interface BlockReason {
  blockedBy: StepId;
  selectedOption: OptionId;
  message: string;
}

export interface ConstraintResult {
  available: boolean;
  reasons: BlockReason[];
}

export type ConfigurationState = Record<StepId, OptionId | null>;

export interface IConstraintEngine {
  checkOptionAvailability(
    stepId: StepId,
    optionId: OptionId,
    config: ConfigurationState
  ): ConstraintResult;
  
  getAvailableOptions(
    stepId: StepId,
    allOptionIds: OptionId[],
    config: ConfigurationState
  ): OptionId[];
  
  validateConfiguration(
    config: ConfigurationState
  ): StepId[];
  
  getBlockedByStep(
    targetStepId: StepId,
    blockingStepId: StepId,
    config: ConfigurationState
  ): OptionId[];
}

export interface OptionAvailability {
  optionId: OptionId;
  available: boolean;
  reasons: BlockReason[];
}

export interface StepAvailability {
  stepId: StepId;
  options: OptionAvailability[];
  availableCount: number;
  totalCount: number;
}