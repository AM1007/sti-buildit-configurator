import type { ModelDefinition, CustomTextData, StepId } from "../types";
import { useConfiguration } from "../hooks/useConfiguration";
import { buildProductModel } from "../buildProductModel";
import { DesktopLayout } from "./DesktopLayout";
import { MobileTabletLayout } from "./MobileTabletLayout";
import { OptionBottomSheet } from "./OptionBottomSheet";
import { useCustomText, useConfigurationStore } from "../stores/configurationStore";
import {
  useIsProductInMyList,
  useIsProductInAnyProject,
  useMyListItemIdByProductCode,
} from "../hooks/useProjectSelectors";
import { useIsAuthenticated } from "../stores/authStore";
import { isConfigurationReadyForActions } from "../utils/customTextHelpers";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";
import { getHeroContent } from "../data/heroContent";
import { useState } from "react";

interface BuildItCalculatorProps {
  model: ModelDefinition;
  productName: string;
  onAddToMyList?: (productCode: string) => void;
  onRemoveFromMyList?: (itemId: string) => void;
  projectRefreshToken?: number;
  onBack?: () => void;
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
    completionPercent,
  } = useConfiguration(model);

  const customText = useCustomText();
  const setCustomText = useConfigurationStore((state) => state.setCustomText);

  const productModel = buildProductModel(config, model);
  const isAuthenticated = useIsAuthenticated();
  const productCode = productModel.isComplete ? productModel.fullCode : null;
  const isInMyListGuest = useIsProductInMyList(productCode, customText);
  const isInMyListAuth = useIsProductInAnyProject(productCode, projectRefreshToken);
  const isInMyList = isAuthenticated ? isInMyListAuth : isInMyListGuest;
  const myListItemId = useMyListItemIdByProductCode(productCode, customText);

  const totalSteps = model.stepOrder.length;
  const completedSteps = model.stepOrder.filter((stepId) => !!config[stepId]).length;

  const actionsReady =
    productModel.isComplete &&
    isConfigurationReadyForActions(model.id, config, customText);

  const heroContent = getHeroContent(model.id);

  const { imagePath } = getCompletedDeviceImage({
    fullCode: productModel.fullCode,
    modelId: model.id,
    config,
    isComplete: productModel.isComplete,
  });

  const [activeSheetStep, setActiveSheetStep] = useState<StepId | null>(null);

  const handleEditStep = (stepId: string) => {
    setCurrentStep(stepId);
  };

  const handleEditStepMobile = (stepId: string) => {
    const step = model.steps.find((s) => s.id === stepId);
    if (step) {
      setActiveSheetStep(stepId);
    }
  };

  const handleSheetSelect = (optionId: string) => {
    if (activeSheetStep) {
      selectOption(activeSheetStep, optionId);
    }
  };

  const handleSheetClear = () => {
    if (activeSheetStep) {
      clearSelection(activeSheetStep);
    }
  };

  const handleReset = () => {
    resetConfiguration();
  };

  const handleAddToMyList = () => {
    if (productModel.isComplete && onAddToMyList) {
      onAddToMyList(productModel.fullCode);
    }
  };

  const handleRemoveFromMyList = () => {
    if (isAuthenticated) {
      if (productModel.isComplete && onAddToMyList) {
        onAddToMyList(productModel.fullCode);
      }
    } else {
      if (myListItemId && onRemoveFromMyList) {
        onRemoveFromMyList(myListItemId);
      }
    }
  };

  const handleCustomTextSubmit = (data: Omit<CustomTextData, "submitted">) => {
    setCustomText(data);
  };

  const activeStep = activeSheetStep
    ? model.steps.find((s) => s.id === activeSheetStep) ?? null
    : null;

  const sharedLayoutProps = {
    model,
    config,
    customText,
    productModel,
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
  };

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
        <MobileTabletLayout
          {...sharedLayoutProps}
          onEditStep={handleEditStepMobile}
        />
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
  );
}