import type { ModelDefinition } from "../types";
import { useConfiguration } from "../hooks/useConfiguration";
import { buildProductModel } from "../buildProductModel";
import { Sidebar } from "./Sidebar";
import { MainPanel } from "./MainPanel";

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

  const productModel = buildProductModel(config, model);

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

  return (
    <div className="grid h-fit min-h-svh w-full grid-cols-1 lg:grid-cols-2 lg:border-4 lg:border-solid lg:border-red-600">
      <Sidebar
        model={model}
        config={config}
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
        productModel={productModel}
        onEditStep={handleEditStep}
        onReset={handleReset}
        onAddToMyList={handleAddToMyList}
      />
    </div>
  );
}