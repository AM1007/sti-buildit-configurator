import { useState } from 'react'
import type { ModelDefinition, CustomTextData, StepId } from '@shared/types'
import { useConfiguration } from '../hooks/useConfiguration'
import { buildProductModel } from '@entities/product'
import { DesktopLayout } from './DesktopLayout'
import { MobileTabletLayout } from './MobileTabletLayout'
import { OptionBottomSheet } from './OptionBottomSheet'
import { useCustomText, useConfigurationStore } from '@features'
import {
  useIsProductInMyList,
  useIsProductInAnyProject,
  useMyListItemIdByProductCode,
} from '@features/projects'
import { useIsAuthenticated } from '@features/auth/store/authStore'
import { isConfigurationReadyForActions } from '@shared/utils/customTextHelpers'
import { getCompletedDeviceImage } from '@shared/utils/getCompletedDeviceImage'
import { getHeroContent } from '../lib/heroContent'
import {
  isConfigurationComplete,
  getVisibleSteps,
} from '@features/configurator/lib/filterOptions'

interface BuildItCalculatorProps {
  model: ModelDefinition
  productName: string
  onAddToMyList?: (productCode: string) => void
  onRemoveFromMyList?: (itemId: string) => void
  projectRefreshToken?: number
}

export function BuildItCalculator({
  model,
  productName,
  onAddToMyList,
  onRemoveFromMyList,
  projectRefreshToken = 0,
}: BuildItCalculatorProps) {
  const {
    config,
    currentStep,
    selectOption,
    clearSelection,
    resetConfiguration,
    setCurrentStep,
  } = useConfiguration(model)

  const customText = useCustomText()
  const setCustomText = useConfigurationStore((state) => state.setCustomText)

  const productModel = buildProductModel(config, model)
  const isComplete = isConfigurationComplete(model, config)

  const isAuthenticated = useIsAuthenticated()
  const productCode = isComplete ? productModel.fullCode : null
  const isInMyListGuest = useIsProductInMyList(productCode, customText)
  const isInMyListAuth = useIsProductInAnyProject(
    productCode,
    customText ?? null,
    projectRefreshToken,
  )
  const isInMyList = isAuthenticated ? isInMyListAuth : isInMyListGuest
  const myListItemId = useMyListItemIdByProductCode(productCode, customText)

  const visibleSteps = getVisibleSteps(model, config)
  const totalSteps = visibleSteps.length
  const completedSteps = visibleSteps.filter((step) => !!config[step.id]).length
  const completionPercent =
    totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100)

  const actionsReady =
    isComplete && isConfigurationReadyForActions(model.id, config, customText)

  const heroContent = getHeroContent(model.id)

  const enrichedProductModel = {
    ...productModel,
    isComplete,
  }

  const { imagePath } = getCompletedDeviceImage({
    fullCode: productModel.fullCode,
    modelId: model.id,
    config,
    isComplete,
  })

  const [activeSheetStep, setActiveSheetStep] = useState<StepId | null>(null)

  const handleEditStep = (stepId: string) => {
    setCurrentStep(stepId)
  }

  const handleEditStepMobile = (stepId: string) => {
    const step = model.steps.find((s) => s.id === stepId)
    if (step) {
      setActiveSheetStep(stepId)
    }
  }

  const handleSheetSelect = (optionId: string) => {
    if (activeSheetStep) {
      selectOption(activeSheetStep, optionId)
    }
  }

  const handleSheetClear = () => {
    if (activeSheetStep) {
      clearSelection(activeSheetStep)
    }
  }

  const handleReset = () => {
    resetConfiguration()
  }

  const handleAddToMyList = () => {
    if (isComplete && onAddToMyList) {
      onAddToMyList(productModel.fullCode)
    }
  }

  const handleRemoveFromMyList = () => {
    if (isAuthenticated) {
      if (isComplete && onAddToMyList) {
        onAddToMyList(productModel.fullCode)
      }
    } else {
      if (myListItemId && onRemoveFromMyList) {
        onRemoveFromMyList(myListItemId)
      }
    }
  }

  const handleCustomTextSubmit = (data: Omit<CustomTextData, 'submitted'>) => {
    setCustomText(data)
  }

  const activeStep = activeSheetStep
    ? (model.steps.find((s) => s.id === activeSheetStep) ?? null)
    : null

  const sharedLayoutProps = {
    model,
    config,
    customText,
    productModel: enrichedProductModel,
    completionPercent,
    completedSteps,
    totalSteps,
    onReset: handleReset,
    onAddToMyList: handleAddToMyList,
    onRemoveFromMyList: handleRemoveFromMyList,
    isInMyList,
    actionsReady,
    productName,
    heroDescription: heroContent?.description,
    imagePath,
    onCustomTextSubmit: handleCustomTextSubmit,
  }

  return (
    <>
      <div className="hidden lg:block">
        <DesktopLayout
          {...sharedLayoutProps}
          currentStep={currentStep}
          selectOption={selectOption}
          clearSelection={clearSelection}
          setCurrentStep={setCurrentStep}
          onEditStep={handleEditStep}
        />
      </div>

      <div className="lg:hidden">
        <MobileTabletLayout {...sharedLayoutProps} onEditStep={handleEditStepMobile} />
      </div>

      {activeStep && (
        <OptionBottomSheet
          open={!!activeSheetStep}
          step={activeStep}
          config={config}
          modelId={model.id}
          selectedOptionId={config[activeSheetStep!] ?? null}
          onSelect={handleSheetSelect}
          onClear={handleSheetClear}
          onClose={() => setActiveSheetStep(null)}
        />
      )}
    </>
  )
}
