import { create } from 'zustand'
import type {
  ModelId,
  Configuration,
  StepId,
  OptionId,
  CustomTextData,
} from '@shared/types'
import { createEmptyConfiguration } from '@shared/types'
import { getModelById } from '@entities/product'
import {
  getSelectionsToReset,
  getVisibleSteps,
} from '@features/configurator/lib/filterOptions'
import {
  shouldClearCustomText,
  getCustomTextTrigger,
} from '@entities/product/customTextConfig'

interface ConfigurationState {
  currentModelId: ModelId | null
  config: Configuration
  customText: CustomTextData | null
  currentStep: StepId | null
  setModel: (modelId: ModelId) => void
  clearModel: () => void
  selectOption: (stepId: StepId, optionId: OptionId) => void
  clearSelection: (stepId: StepId) => void
  resetConfiguration: () => void
  setCurrentStep: (stepId: StepId | null) => void
  setCustomText: (data: Omit<CustomTextData, 'submitted'>) => void
  clearCustomText: () => void
  loadConfigFromUrl: (
    modelId: ModelId,
    config: Configuration,
    customText: CustomTextData | null,
  ) => void
}

export const useConfigurationStore = create<ConfigurationState>()((set, get) => ({
  currentModelId: null,
  config: {},
  customText: null,
  currentStep: null,

  setModel: (modelId) => {
    const { currentModelId } = get()

    if (currentModelId === modelId) {
      return
    }

    const model = getModelById(modelId)
    if (!model) {
      console.error(`Model not found: ${modelId}`)
      return
    }

    set({
      currentModelId: modelId,
      config: createEmptyConfiguration(model),
      customText: null,
      currentStep: model.stepOrder[0],
    })
  },

  clearModel: () => {
    set({
      currentModelId: null,
      config: {},
      customText: null,
      currentStep: null,
    })
  },

  selectOption: (stepId, optionId) => {
    const { currentModelId, config, customText } = get()
    const model = currentModelId ? getModelById(currentModelId) : null

    if (!model || !currentModelId) return

    const prevOptionId = config[stepId] ?? null
    const newConfig = { ...config, [stepId]: optionId }
    const toReset = getSelectionsToReset(model, stepId, newConfig)
    for (const resetStepId of toReset) {
      newConfig[resetStepId] = null
    }

    const currentIndex = model.stepOrder.indexOf(stepId)
    const visibleSteps = getVisibleSteps(model, newConfig)
    const visibleIds = new Set(visibleSteps.map((s) => s.id))
    let nextStep = stepId
    for (let i = currentIndex + 1; i < model.stepOrder.length; i++) {
      const candidate = model.stepOrder[i]
      if (visibleIds.has(candidate) && !newConfig[candidate]) {
        nextStep = candidate
        break
      }
    }

    let newCustomText = customText
    if (shouldClearCustomText(currentModelId, stepId, prevOptionId, optionId)) {
      newCustomText = null
    }

    set({
      config: newConfig,
      customText: newCustomText,
      currentStep: nextStep,
    })
  },

  clearSelection: (stepId) => {
    const { currentModelId, config, customText } = get()
    const model = currentModelId ? getModelById(currentModelId) : null

    if (!model || !currentModelId) return

    const prevOptionId = config[stepId] ?? null
    const newConfig = { ...config, [stepId]: null }
    const toReset = getSelectionsToReset(model, stepId, newConfig)
    for (const resetStepId of toReset) {
      newConfig[resetStepId] = null
    }

    let newCustomText = customText
    const trigger = getCustomTextTrigger(currentModelId)
    if (trigger && stepId === trigger.stepId && prevOptionId === trigger.optionId) {
      newCustomText = null
    }

    set({
      config: newConfig,
      customText: newCustomText,
    })
  },

  resetConfiguration: () => {
    const { currentModelId } = get()
    const model = currentModelId ? getModelById(currentModelId) : null

    if (!model) return

    set({
      config: createEmptyConfiguration(model),
      customText: null,
      currentStep: model.stepOrder[0],
    })
  },

  setCurrentStep: (stepId) => {
    set({ currentStep: stepId })
  },

  setCustomText: (data) => {
    const customTextData: CustomTextData = {
      ...data,
      submitted: true,
    }
    set({ customText: customTextData })
  },

  clearCustomText: () => {
    set({ customText: null })
  },

  loadConfigFromUrl: (modelId, config, customText) => {
    const model = getModelById(modelId)
    if (!model) {
      console.warn(`Model not found: ${modelId}`)
      return
    }

    const validatedConfig: Configuration = {}
    for (const stepId of model.stepOrder) {
      const value = config[stepId]
      if (value !== undefined && value !== null) {
        validatedConfig[stepId] = value
      }
    }

    set({
      currentModelId: modelId,
      config: validatedConfig,
      customText: customText,
      currentStep: model.stepOrder[model.stepOrder.length - 1],
    })
  },
}))

export const useCurrentModelId = () => useConfigurationStore((s) => s.currentModelId)
export const useConfig = () => useConfigurationStore((s) => s.config)
export const useCustomText = () => useConfigurationStore((s) => s.customText)
export const useCurrentStep = () => useConfigurationStore((s) => s.currentStep)
