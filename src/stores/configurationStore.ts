import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ModelId,
  Configuration,
  StepId,
  OptionId,
  ModelDefinition,
  SavedConfiguration,
} from "../types";
import { createEmptyConfiguration, generateSavedConfigurationId } from "../types";
import { getModelById } from "../data/models";
import {
  getSelectionsToReset,
  isConfigurationComplete,
  getMissingRequiredSteps,
} from "../filterOptions";
import { buildProductModel } from "../buildProductModel";

// ============================================================================
// PER-MODEL LOCALSTORAGE PERSISTENCE
// ============================================================================

interface StoredModelConfiguration {
  modelId: ModelId;
  productCode: string;
  configuration: Configuration;
  savedAt: number;
}

function getLocalStorageKey(modelId: ModelId): string {
  return `config-${modelId}`;
}

function saveModelToLocalStorage(
  modelId: ModelId,
  productCode: string,
  configuration: Configuration
): void {
  const data: StoredModelConfiguration = {
    modelId,
    productCode,
    configuration,
    savedAt: Date.now(),
  };
  
  try {
    localStorage.setItem(getLocalStorageKey(modelId), JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save configuration for ${modelId}:`, error);
  }
}

function loadModelFromLocalStorage(modelId: ModelId): StoredModelConfiguration | null {
  try {
    const raw = localStorage.getItem(getLocalStorageKey(modelId));
    if (!raw) return null;
    
    const data = JSON.parse(raw) as StoredModelConfiguration;
    
    // Validate structure
    if (data.modelId !== modelId || !data.configuration) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to load configuration for ${modelId}:`, error);
    return null;
  }
}

function clearModelFromLocalStorage(modelId: ModelId): void {
  try {
    localStorage.removeItem(getLocalStorageKey(modelId));
  } catch (error) {
    console.error(`Failed to clear configuration for ${modelId}:`, error);
  }
}

// ============================================================================
// URL HELPERS
// ============================================================================

export function buildProductModelUrl(modelId: ModelId, productCode: string): string {
  // Encode product code: replace special characters, ensure + is encoded as %2B
  const encodedProductModel = encodeURIComponent(productCode)
    .replace(/%2D/g, "-"); // Keep dashes readable
  
  return `?model=${modelId}&productModel=${encodedProductModel}#build-it`;
}

export function getStoredConfiguration(modelId: ModelId): StoredModelConfiguration | null {
  return loadModelFromLocalStorage(modelId);
}

// ============================================================================
// ZUSTAND STORE
// ============================================================================

interface ConfigurationState {
  currentModelId: ModelId | null;
  config: Configuration;
  currentStep: StepId | null;
  myList: SavedConfiguration[];
  setModel: (modelId: ModelId) => void;
  clearModel: () => void;
  selectOption: (stepId: StepId, optionId: OptionId) => void;
  clearSelection: (stepId: StepId) => void;
  resetConfiguration: () => void;
  setCurrentStep: (stepId: StepId) => void;
  addToMyList: (name?: string) => void;
  removeFromMyList: (id: string) => void;
  clearMyList: () => void;
  loadFromMyList: (id: string) => void;
  getModel: () => ModelDefinition | null;
  isComplete: () => boolean;
  getMissingSteps: () => StepId[];
  getProductCode: () => string | null;
  saveCompletedConfiguration: () => void;
}

export const useConfigurationStore = create<ConfigurationState>()(
  persist(
    (set, get) => ({
      currentModelId: null,
      config: {},
      currentStep: null,
      myList: [],
      
      setModel: (modelId) => {
        const model = getModelById(modelId);
        if (!model) {
          console.error(`Model not found: ${modelId}`);
          return;
        }

        // Try to load saved configuration from LocalStorage
        const saved = loadModelFromLocalStorage(modelId);
        
        if (saved && saved.configuration) {
          // Validate saved config matches current model structure
          const isValid = model.stepOrder.every(
            (stepId) => stepId in saved.configuration
          );
          
          if (isValid) {
            set({
              currentModelId: modelId,
              config: saved.configuration,
              currentStep: model.stepOrder[model.stepOrder.length - 1],
            });
            return;
          }
        }

        // No valid saved config — start fresh
        set({
          currentModelId: modelId,
          config: createEmptyConfiguration(model),
          currentStep: model.stepOrder[0],
        });
      },

      clearModel: () => {
        set({
          currentModelId: null,
          config: {},
          currentStep: null,
        });
      },

      selectOption: (stepId, optionId) => {
        const { currentModelId, config } = get();
        const model = currentModelId ? getModelById(currentModelId) : null;
        
        if (!model) return;
        const newConfig = { ...config, [stepId]: optionId };
        const toReset = getSelectionsToReset(model, stepId, newConfig);
        for (const resetStepId of toReset) {
          newConfig[resetStepId] = null;
        }
        const currentIndex = model.stepOrder.indexOf(stepId);
        const nextStep =
          currentIndex < model.stepOrder.length - 1
            ? model.stepOrder[currentIndex + 1]
            : stepId;

        set({
          config: newConfig,
          currentStep: nextStep,
        });

        // Auto-save if configuration is now complete
        const isNowComplete = isConfigurationComplete(model, newConfig);
        if (isNowComplete && currentModelId) {
          const productModel = buildProductModel(newConfig, model);
          saveModelToLocalStorage(currentModelId, productModel.fullCode, newConfig);
        }
      },

      clearSelection: (stepId) => {
        const { currentModelId, config } = get();
        const model = currentModelId ? getModelById(currentModelId) : null;
        
        if (!model) return;

        const newConfig = { ...config, [stepId]: null };
        const toReset = getSelectionsToReset(model, stepId, newConfig);
        for (const resetStepId of toReset) {
          newConfig[resetStepId] = null;
        }

        set({ config: newConfig });
      },

      resetConfiguration: () => {
        const { currentModelId } = get();
        const model = currentModelId ? getModelById(currentModelId) : null;
        
        if (!model) return;

        // Clear LocalStorage for this model
        if (currentModelId) {
          clearModelFromLocalStorage(currentModelId);
        }

        set({
          config: createEmptyConfiguration(model),
          currentStep: model.stepOrder[0],
        });
      },

      setCurrentStep: (stepId) => {
        set({ currentStep: stepId });
      },

      addToMyList: (name) => {
        const { currentModelId, config, myList } = get();
        
        if (!currentModelId) {
          console.warn("Cannot add to My List: no model selected");
          return;
        }

        const model = getModelById(currentModelId);
        
        if (!model || !isConfigurationComplete(model, config)) {
          console.warn("Cannot add incomplete configuration to My List");
          return;
        }

        const productModel = buildProductModel(config, model);

        const savedConfig: SavedConfiguration = {
          id: generateSavedConfigurationId(),
          modelId: currentModelId,
          productCode: productModel.fullCode,
          configuration: { ...config },
          savedAt: Date.now(),
          name,
        };

        set({ myList: [...myList, savedConfig] });
      },

      removeFromMyList: (id) => {
        const { myList } = get();
        set({ myList: myList.filter((item) => item.id !== id) });
      },

      clearMyList: () => {
        set({ myList: [] });
      },

      loadFromMyList: (id) => {
        const { myList } = get();
        const saved = myList.find((item) => item.id === id);
        
        if (!saved) {
          console.warn(`Saved configuration not found: ${id}`);
          return;
        }

        const model = getModelById(saved.modelId);
        if (!model) {
          console.warn(`Model not found: ${saved.modelId}`);
          return;
        }

        set({
          currentModelId: saved.modelId,
          config: { ...saved.configuration },
          currentStep: model.stepOrder[model.stepOrder.length - 1],
        });
      },

      getModel: () => {
        const { currentModelId } = get();
        return currentModelId ? getModelById(currentModelId) ?? null : null;
      },

      isComplete: () => {
        const { currentModelId, config } = get();
        const model = currentModelId ? getModelById(currentModelId) : null;
        return model ? isConfigurationComplete(model, config) : false;
      },

      getMissingSteps: () => {
        const { currentModelId, config } = get();
        const model = currentModelId ? getModelById(currentModelId) : null;
        return model ? getMissingRequiredSteps(model, config) : [];
      },

      getProductCode: () => {
        const { currentModelId, config } = get();
        const model = currentModelId ? getModelById(currentModelId) : null;
        
        if (!model || !isConfigurationComplete(model, config)) {
          return null;
        }

        return buildProductModel(config, model).fullCode;
      },

      saveCompletedConfiguration: () => {
        const { currentModelId, config } = get();
        const model = currentModelId ? getModelById(currentModelId) : null;
        
        if (!model || !currentModelId) return;
        
        if (!isConfigurationComplete(model, config)) {
          console.warn("Cannot save incomplete configuration");
          return;
        }

        const productModel = buildProductModel(config, model);
        saveModelToLocalStorage(currentModelId, productModel.fullCode, config);
      },
    }),
    {
      name: "configurator-storage",
      partialize: (state) => ({ myList: state.myList }),
    }
  )
);

export const useCurrentModelId = () =>
  useConfigurationStore((state) => state.currentModelId);

export const useConfig = () =>
  useConfigurationStore((state) => state.config);

export const useCurrentStep = () =>
  useConfigurationStore((state) => state.currentStep);

export const useMyList = () =>
  useConfigurationStore((state) => state.myList);

export const useMyListCount = () =>
  useConfigurationStore((state) => state.myList.length);