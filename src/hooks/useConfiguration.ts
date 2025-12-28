// ============================================================================
// UNIVERSAL CONFIGURATION STATE HOOK
// ============================================================================
//
// Custom hook that manages configurator state for any model:
// - Current configuration (selected options for each step)
// - Current open step (accordion navigation)
// - Auto-reset of dependent options when dependencies change
// - Navigation to next step after selection
//
// ============================================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  Configuration,
  StepId,
  OptionId,
  ModelDefinition,
} from "../types";
import { createEmptyConfiguration } from "../types";
import {
  getSelectionsToReset,
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from "../filterOptions";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Hook return type
 */
export interface UseConfigurationReturn {
  /** Current configuration state */
  config: Configuration;

  /** Currently open accordion step (null = all closed) */
  currentStep: StepId | null;

  /** Select an option for a step */
  selectOption: (stepId: StepId, optionId: OptionId) => void;

  /** Clear selection for a step */
  clearSelection: (stepId: StepId) => void;

  /** Reset entire configuration to initial state */
  resetConfiguration: () => void;

  /** Toggle which step is open (click again to close) */
  setCurrentStep: (stepId: StepId) => void;

  /** Whether all required steps are complete */
  isComplete: boolean;

  /** List of missing required step IDs */
  missingSteps: StepId[];

  /** Completion percentage (0-100) */
  completionPercent: number;

  /** The model this configuration is for */
  model: ModelDefinition;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

/**
 * Custom hook for managing configurator state.
 *
 * Features:
 * - Tracks selections for all steps in the model
 * - Auto-advances to next step after selection
 * - Auto-resets dependent steps when their dependency changes
 * - Provides completion status
 * - Toggle accordion: click same step to close
 *
 * @param model - The model definition to configure
 * @param initialConfig - Optional initial configuration state
 * @returns Configuration state and control functions
 */
export function useConfiguration(
  model: ModelDefinition,
  initialConfig?: Configuration
): UseConfigurationReturn {
  // Initialize with empty config or provided initial state
  const [config, setConfig] = useState<Configuration>(
    initialConfig ?? createEmptyConfiguration(model)
  );

  // Start at first step (null = all closed)
  const [currentStep, setCurrentStep] = useState<StepId | null>(model.stepOrder[0]);

  // Track which step triggered the last change (for cascade reset)
  const [lastChangedStep, setLastChangedStep] = useState<StepId | null>(null);

  // ==========================================================================
  // CRITICAL: Reset dependent steps when their dependency changes
  // ==========================================================================
  useEffect(() => {
    if (!lastChangedStep) {
      return;
    }

    // Find selections that need to be reset
    const toReset = getSelectionsToReset(model, lastChangedStep, config);

    if (toReset.length > 0) {
      setConfig((prev) => {
        const newConfig = { ...prev };
        for (const stepId of toReset) {
          newConfig[stepId] = null;
        }
        return newConfig;
      });
    }

    // Clear the trigger
    setLastChangedStep(null);
  }, [lastChangedStep, model, config]);

  // ==========================================================================
  // Reset config when model changes
  // ==========================================================================
  useEffect(() => {
    setConfig(createEmptyConfiguration(model));
    setCurrentStep(model.stepOrder[0]);
    setLastChangedStep(null);
  }, [model.id]); // Only reset when model ID changes

  // ==========================================================================
  // Select an option and advance to next step
  // ==========================================================================
  const selectOption = useCallback(
    (stepId: StepId, optionId: OptionId) => {
      // Update configuration
      setConfig((prev) => ({
        ...prev,
        [stepId]: optionId,
      }));

      // Mark this step as changed (triggers cascade reset effect)
      setLastChangedStep(stepId);

      // Auto-advance to next step
      const currentIndex = model.stepOrder.indexOf(stepId);
      if (currentIndex < model.stepOrder.length - 1) {
        setCurrentStep(model.stepOrder[currentIndex + 1]);
      }
    },
    [model.stepOrder]
  );

  // ==========================================================================
  // Clear selection for a specific step
  // ==========================================================================
  const clearSelection = useCallback(
    (stepId: StepId) => {
      setConfig((prev) => ({
        ...prev,
        [stepId]: null,
      }));

      // Mark as changed to trigger cascade reset
      setLastChangedStep(stepId);
    },
    []
  );

  // ==========================================================================
  // Reset configuration to initial state
  // ==========================================================================
  const resetConfiguration = useCallback(() => {
    setConfig(createEmptyConfiguration(model));
    setCurrentStep(model.stepOrder[0]);
    setLastChangedStep(null);
  }, [model]);

  // ==========================================================================
  // Manual step navigation (TOGGLE: click same step to close)
  // ==========================================================================
  const handleSetCurrentStep = useCallback((stepId: StepId) => {
    setCurrentStep((prev) => (prev === stepId ? null : stepId));
  }, []);

  // ==========================================================================
  // Computed values
  // ==========================================================================
  const isComplete = useMemo(
    () => isConfigurationComplete(model, config),
    [model, config]
  );

  const missingSteps = useMemo(
    () => getMissingRequiredSteps(model, config),
    [model, config]
  );

  const completionPercent = useMemo(
    () => getCompletionPercentage(model, config),
    [model, config]
  );

  // ==========================================================================
  // Return
  // ==========================================================================
  return {
    config,
    currentStep,
    selectOption,
    clearSelection,
    resetConfiguration,
    setCurrentStep: handleSetCurrentStep,
    isComplete,
    missingSteps,
    completionPercent,
    model,
  };
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

/**
 * @deprecated Import model and use useConfiguration(model) instead.
 * This wrapper maintains compatibility with existing Stopper Stations code.
 */
export function useConfigurationLegacy() {
  throw new Error(
    "useConfigurationLegacy is deprecated. Use useConfiguration(model) instead."
  );
}