import type { ModelDefinition, CustomTextData } from "../types";
import { useConfiguration } from "../hooks/useConfiguration";
import { buildProductModel } from "../buildProductModel";
import { Sidebar } from "./Sidebar";
import { MainPanel } from "./MainPanel";
import { ProductModelDisplay } from "./ProductModelDisplay";
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
    <div className="grid h-fit min-h-svh w-full grid-cols-1 md:grid-cols-[2fr_3fr] xl:grid-cols-2 xl:border-4 xl:border-solid xl:border-brand-600">
      {/* Mobile-only: compact model code summary at top */}
      <div className="order-1 border-b border-gray-200 bg-white md:hidden">
        <ProductModelDisplay
          model={model}
          productModel={productModel}
          config={config}
          onEditStep={handleEditStep}
        />
      </div>

      <Sidebar
        model={model}
        config={config}
        customText={customText}
        currentStep={currentStep}
        completionPercent={completionPercent}
        completedSteps={completedSteps}
        totalSteps={totalSteps}
        onSelectOption={(stepId, optionId) => {
          selectOption(stepId, optionId);
        }}
        onClearOption={(stepId) => {
          clearSelection(stepId);
        }}
        onSetCurrentStep={setCurrentStep}
        className="order-2 md:order-0"
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
        className="order-3 md:order-0"
      />
    </div>
  );
}