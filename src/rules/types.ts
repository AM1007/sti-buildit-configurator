// ============================================================================
// CONSTRAINT ENGINE - TYPE DEFINITIONS
// ============================================================================
//
// Types for bidirectional dependency rule system.
// Supports:
// - Multi-step dependencies (A depends on B AND C)
// - Bidirectional constraints (A ↔ B)
// - Intersection logic (AND) for conflicting constraints
//
// ============================================================================

import type { StepId, OptionId } from "../types";

// ============================================================================
// CONSTRAINT MATRIX
// ============================================================================

/**
 * Defines which options in targetStep are available based on sourceStep selection.
 * 
 * Key: sourceStep optionId
 * Value: array of allowed targetStep optionIds
 * 
 * @example
 * // COLOUR → ACTIVATION: Red allows these activations
 * { "0": ["0", "1", "2", "3", "4", "5", "6-red", "7-red", "8", "9"] }
 */
export type ConstraintMatrix = Record<OptionId, OptionId[]>;

/**
 * Named constraint between two steps.
 */
export interface StepConstraint {
  /** Step that drives the constraint */
  sourceStep: StepId;
  
  /** Step that is constrained */
  targetStep: StepId;
  
  /** Matrix of allowed options */
  matrix: ConstraintMatrix;
}

/**
 * Complete constraint definition for a model.
 * Contains all forward and reverse constraints.
 */
export interface ModelConstraints {
  /** Model this applies to */
  modelId: string;
  
  /** All constraints for this model */
  constraints: StepConstraint[];
}

// ============================================================================
// AVAILABILITY RESULT
// ============================================================================

/**
 * Single reason why an option is blocked.
 */
export interface BlockReason {
  /** Step that caused the block */
  blockedBy: StepId;
  
  /** Selected option in that step that caused the block */
  selectedOption: OptionId;
  
  /** Human-readable explanation */
  message: string;
}

/**
 * Result of checking option availability.
 */
export interface ConstraintResult {
  /** Whether the option can be selected */
  available: boolean;
  
  /** All reasons why option is blocked (empty if available) */
  reasons: BlockReason[];
}

// ============================================================================
// ENGINE INTERFACE
// ============================================================================

/**
 * Current configuration state.
 * Maps stepId to selected optionId (null if not selected).
 */
export type ConfigurationState = Record<StepId, OptionId | null>;

/**
 * Constraint engine interface.
 */
export interface IConstraintEngine {
  /**
   * Check if a specific option is available given current configuration.
   */
  checkOptionAvailability(
    stepId: StepId,
    optionId: OptionId,
    config: ConfigurationState
  ): ConstraintResult;
  
  /**
   * Get all available options for a step given current configuration.
   */
  getAvailableOptions(
    stepId: StepId,
    allOptionIds: OptionId[],
    config: ConfigurationState
  ): OptionId[];
  
  /**
   * Validate entire configuration, return invalid steps.
   */
  validateConfiguration(
    config: ConfigurationState
  ): StepId[];
  
  /**
   * Get options that would become available if a selection is cleared.
   * Useful for UI hints.
   */
  getBlockedByStep(
    targetStepId: StepId,
    blockingStepId: StepId,
    config: ConfigurationState
  ): OptionId[];
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Option with its availability status.
 * Used by UI components.
 */
export interface OptionAvailability {
  optionId: OptionId;
  available: boolean;
  reasons: BlockReason[];
}

/**
 * Step with all options and their availability.
 */
export interface StepAvailability {
  stepId: StepId;
  options: OptionAvailability[];
  availableCount: number;
  totalCount: number;
}