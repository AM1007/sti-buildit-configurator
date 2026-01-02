import { useEffect, useCallback, useMemo } from "react";
import type {
  Configuration,
  StepId,
  OptionId,
  ModelDefinition,
} from "../types";
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from "../filterOptions";
import { useConfigurationStore } from "../stores/configurationStore";

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
  _initialConfig?: Configuration
): UseConfigurationReturn {
  const config = useConfigurationStore((state) => state.config);
  const currentStep = useConfigurationStore((state) => state.currentStep);
  const currentModelId = useConfigurationStore((state) => state.currentModelId);
  const storeSetModel = useConfigurationStore((state) => state.setModel);
  const storeSelectOption = useConfigurationStore((state) => state.selectOption);
  const storeClearSelection = useConfigurationStore((state) => state.clearSelection);
  const storeResetConfiguration = useConfigurationStore((state) => state.resetConfiguration);
  const storeSetCurrentStep = useConfigurationStore((state) => state.setCurrentStep);

  useEffect(() => {
    if (currentModelId !== model.id) {
      storeSetModel(model.id);
    }
  }, [model.id, currentModelId, storeSetModel]);

  const selectOption = useCallback(
    (stepId: StepId, optionId: OptionId) => {
      storeSelectOption(stepId, optionId);
    },
    [storeSelectOption]
  );

  const clearSelection = useCallback(
    (stepId: StepId) => {
      storeClearSelection(stepId);
    },
    [storeClearSelection]
  );

  const resetConfiguration = useCallback(() => {
    storeResetConfiguration();
  }, [storeResetConfiguration]);

  const handleSetCurrentStep = useCallback(
    (stepId: StepId) => {
      const current = useConfigurationStore.getState().currentStep;
      if (current === stepId) {
        storeSetCurrentStep(stepId);
      } else {
        storeSetCurrentStep(stepId);
      }
    },
    [storeSetCurrentStep]
  );

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