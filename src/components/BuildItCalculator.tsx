import type { ModelDefinition, CustomTextData } from "../types";
import { useConfiguration } from "../hooks/useConfiguration";
import { buildProductModel } from "../buildProductModel";
import { Sidebar } from "./Sidebar";
import { MainPanel } from "./MainPanel";
import { useCustomText, useConfigurationStore, useIsProductInMyList } from "../stores/configurationStore";

interface BuildItCalculatorProps {
  model: ModelDefinition;
  onAddToMyList?: (productCode: string) => void;
  onBack?: () => void;
}

export function BuildItCalculator({
  model,
  onAddToMyList,
}: BuildItCalculatorProps) {
  const {
    config,
    currentStep,
    selectOption,
    clearSelection,
    resetConfiguration,
    setCurrentStep,
  } = useConfiguration(model);

  const customText = useCustomText();
  const setCustomText = useConfigurationStore((state) => state.setCustomText);

  const productModel = buildProductModel(config, model);
  const isInMyList = useIsProductInMyList(productModel.isComplete ? productModel.fullCode : null);

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

  const handleCustomTextSubmit = (data: Omit<CustomTextData, "submitted">) => {
    setCustomText(data);
  };

  return (
    <div className="grid h-fit min-h-svh w-full grid-cols-1 lg:grid-cols-2 lg:border-4 lg:border-solid lg:border-red-600">
      <Sidebar
        model={model}
        config={config}
        customText={customText}
        currentStep={currentStep}
        onSelectOption={(stepId, optionId) => {
          selectOption(stepId, optionId);
        }}
        onClearOption={(stepId) => {
          clearSelection(stepId);
        }}
        onSetCurrentStep={setCurrentStep}
      />

      <MainPanel
        model={model}
        config={config}
        customText={customText}
        productModel={productModel}
        onEditStep={handleEditStep}
        onReset={handleReset}
        onAddToMyList={handleAddToMyList}
        onCustomTextSubmit={handleCustomTextSubmit}
        isInMyList={isInMyList}
      />
    </div>
  );
}