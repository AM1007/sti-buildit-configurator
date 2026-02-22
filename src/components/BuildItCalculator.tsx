import type { ModelDefinition, CustomTextData } from "../types";
import { useConfiguration } from "../hooks/useConfiguration";
import { buildProductModel } from "../buildProductModel";
import { Sidebar } from "./Sidebar";
import { MainPanel } from "./MainPanel";
import { useCustomText, useConfigurationStore, useIsProductInMyList, useMyListItemIdByProductCode } from "../stores/configurationStore";

interface BuildItCalculatorProps {
  model: ModelDefinition;
  productName: string;
  onAddToMyList?: (productCode: string) => void;
  onRemoveFromMyList?: (itemId: string) => void;
  onBack?: () => void;
}

export function BuildItCalculator({
  model,
  productName,
  onAddToMyList,
  onRemoveFromMyList,
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
  const isInMyList = useIsProductInMyList(productModel.isComplete ? productModel.fullCode : null);
  const myListItemId = useMyListItemIdByProductCode(productModel.isComplete ? productModel.fullCode : null);

  const totalSteps = model.stepOrder.length;
  const completedSteps = model.stepOrder.filter((stepId) => !!config[stepId]).length;

  const handleEditStep = (stepId: string) => {
    setCurrentStep(stepId);
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
    if (myListItemId && onRemoveFromMyList) {
      onRemoveFromMyList(myListItemId);
    }
  };

  const handleCustomTextSubmit = (data: Omit<CustomTextData, "submitted">) => {
    setCustomText(data);
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-8 md:px-6 lg:flex-row lg:px-8">
      <Sidebar
        model={model}
        config={config}
        customText={customText}
        currentStep={currentStep}
        completionPercent={completionPercent}
        completedSteps={completedSteps}
        totalSteps={totalSteps}
        productModel={productModel}
        onSelectOption={(stepId, optionId) => {
          selectOption(stepId, optionId);
        }}
        onClearOption={(stepId) => {
          clearSelection(stepId);
        }}
        onSetCurrentStep={setCurrentStep}
        onEditStep={handleEditStep}
        onReset={handleReset}
        className="w-full shrink-0 lg:w-[420px]"
      />

      <MainPanel
        model={model}
        config={config}
        customText={customText}
        productModel={productModel}
        productName={productName}
        onEditStep={handleEditStep}
        onReset={handleReset}
        onAddToMyList={handleAddToMyList}
        onRemoveFromMyList={handleRemoveFromMyList}
        onCustomTextSubmit={handleCustomTextSubmit}
        isInMyList={isInMyList}
        className="min-w-0 flex-1"
      />
    </div>
  );
}