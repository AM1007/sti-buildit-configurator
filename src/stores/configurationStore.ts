import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ModelId,
  Configuration,
  StepId,
  OptionId,
  ModelDefinition,
  SavedConfiguration,
  CustomTextData,
} from "../types";
import { createEmptyConfiguration, generateSavedConfigurationId } from "../types";
import { getModelById } from "../data/models";
import {
  getSelectionsToReset,
  isConfigurationComplete,
  getMissingRequiredSteps,
} from "../filterOptions";
import { buildProductModel } from "../buildProductModel";
import { shouldClearCustomText } from "../utils/customTextHelpers";

// ============================================================================
// URL HELPERS
// ============================================================================

export function buildProductModelUrl(modelId: ModelId, productCode: string): string {
  const encodedProductModel = encodeURIComponent(productCode).replace(/%2D/g, "-");
  return `?model=${modelId}&productModel=${encodedProductModel}#build-it`;
}

// ============================================================================
// ZUSTAND STORE
// ============================================================================

interface ConfigurationState {
  currentModelId: ModelId | null;
  config: Configuration;
  customText: CustomTextData | null;
  currentStep: StepId | null;
  myList: SavedConfiguration[];
  setModel: (modelId: ModelId) => void;
  clearModel: () => void;
  selectOption: (stepId: StepId, optionId: OptionId) => void;
  clearSelection: (stepId: StepId) => void;
  resetConfiguration: () => void;
  setCurrentStep: (stepId: StepId) => void;
  setCustomText: (data: Omit<CustomTextData, "submitted">) => void;
  clearCustomText: () => void;
  addToMyList: (name?: string) => void;
  removeFromMyList: (id: string) => void;
  clearMyList: () => void;
  loadFromMyList: (id: string) => void;
  getModel: () => ModelDefinition | null;
  isComplete: () => boolean;
  getMissingSteps: () => StepId[];
  getProductCode: () => string | null;
}

export const useConfigurationStore = create<ConfigurationState>()(
  persist(
    (set, get) => ({
      currentModelId: null,
      config: {},
      customText: null,
      currentStep: null,
      myList: [],

      setModel: (modelId) => {
        const model = getModelById(modelId);
        if (!model) {
          console.error(`Model not found: ${modelId}`);
          return;
        }

        set({
          currentModelId: modelId,
          config: createEmptyConfiguration(model),
          customText: null,
          currentStep: model.stepOrder[0],
        });
      },

      clearModel: () => {
        set({
          currentModelId: null,
          config: {},
          customText: null,
          currentStep: null,
        });
      },

      selectOption: (stepId, optionId) => {
        const { currentModelId, config, customText } = get();
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

        let newCustomText = customText;
        if (stepId === "text") {
          const prevTextOption = config.text ?? null;
          const newTextOption = optionId;
          if (shouldClearCustomText(prevTextOption, newTextOption)) {
            newCustomText = null;
          }
        }

        set({
          config: newConfig,
          customText: newCustomText,
          currentStep: nextStep,
        });
      },

      clearSelection: (stepId) => {
        const { currentModelId, config, customText } = get();
        const model = currentModelId ? getModelById(currentModelId) : null;

        if (!model) return;

        const newConfig = { ...config, [stepId]: null };
        const toReset = getSelectionsToReset(model, stepId, newConfig);
        for (const resetStepId of toReset) {
          newConfig[resetStepId] = null;
        }

        let newCustomText = customText;
        if (stepId === "text") {
          newCustomText = null;
        }

        set({
          config: newConfig,
          customText: newCustomText,
        });
      },

      resetConfiguration: () => {
        const { currentModelId } = get();
        const model = currentModelId ? getModelById(currentModelId) : null;

        if (!model) return;

        set({
          config: createEmptyConfiguration(model),
          customText: null,
          currentStep: model.stepOrder[0],
        });
      },

      setCurrentStep: (stepId) => {
        set({ currentStep: stepId });
      },

      setCustomText: (data) => {
        const customTextData: CustomTextData = {
          ...data,
          submitted: true,
        };

        set({ customText: customTextData });
      },

      clearCustomText: () => {
        set({ customText: null });
      },

      addToMyList: (name) => {
        const { currentModelId, config, customText, myList } = get();

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
          customText: customText ?? undefined,
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
          customText: saved.customText ?? null,
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

export const useCustomText = () =>
  useConfigurationStore((state) => state.customText);

export const useCurrentStep = () =>
  useConfigurationStore((state) => state.currentStep);

export const useMyList = () =>
  useConfigurationStore((state) => state.myList);

export const useMyListCount = () =>
  useConfigurationStore((state) => state.myList.length);

export const useIsProductInMyList = (productCode: string | null) =>
  useConfigurationStore((state) => {
    if (!productCode) return false;
    return state.myList.some((item) => item.productCode === productCode);
  });