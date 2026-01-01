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

export interface UseConfigurationReturn {
  config: Configuration;
  currentStep: StepId | null;
  selectOption: (stepId: StepId, optionId: OptionId) => void;
  clearSelection: (stepId: StepId) => void;
  resetConfiguration: () => void;
  setCurrentStep: (stepId: StepId) => void;
  isComplete: boolean;
  missingSteps: StepId[];
  completionPercent: number;
  model: ModelDefinition;
}

export function useConfiguration(
  model: ModelDefinition,
  initialConfig?: Configuration
): UseConfigurationReturn {
  const [config, setConfig] = useState<Configuration>(
    initialConfig ?? createEmptyConfiguration(model)
  );

  const [currentStep, setCurrentStep] = useState<StepId | null>(model.stepOrder[0]);
  const [lastChangedStep, setLastChangedStep] = useState<StepId | null>(null);

  useEffect(() => {
    if (!lastChangedStep) {
      return;
    }

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

    setLastChangedStep(null);
  }, [lastChangedStep, model, config]);

  useEffect(() => {
    setConfig(createEmptyConfiguration(model));
    setCurrentStep(model.stepOrder[0]);
    setLastChangedStep(null);
  }, [model.id]); 

  const selectOption = useCallback(
    (stepId: StepId, optionId: OptionId) => {
      setConfig((prev) => ({
        ...prev,
        [stepId]: optionId,
      }));

      setLastChangedStep(stepId);

      const currentIndex = model.stepOrder.indexOf(stepId);
      if (currentIndex < model.stepOrder.length - 1) {
        setCurrentStep(model.stepOrder[currentIndex + 1]);
      }
    },
    [model.stepOrder]
  );

  const clearSelection = useCallback(
    (stepId: StepId) => {
      setConfig((prev) => ({
        ...prev,
        [stepId]: null,
      }));

      setLastChangedStep(stepId);
    },
    []
  );

  const resetConfiguration = useCallback(() => {
    setConfig(createEmptyConfiguration(model));
    setCurrentStep(model.stepOrder[0]);
    setLastChangedStep(null);
  }, [model]);

  const handleSetCurrentStep = useCallback((stepId: StepId) => {
    setCurrentStep((prev) => (prev === stepId ? null : stepId));
  }, []);

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

export function useConfigurationLegacy() {
  throw new Error(
    "useConfigurationLegacy is deprecated. Use useConfiguration(model) instead."
  );
}