import type { ModelDefinition, CustomTextData } from "../types";
import { useConfiguration } from "../hooks/useConfiguration";
import { buildProductModel } from "../buildProductModel";
import { Sidebar } from "./Sidebar";
import { MainPanel } from "./MainPanel";
import { FloatingCompactBar } from "./FloatingCompactBar";
import { useCustomText, useConfigurationStore, useIsProductInMyList, useMyListItemIdByProductCode } from "../stores/configurationStore";
import { isConfigurationReadyForActions } from "../utils/customTextHelpers";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";
import { getHeroContent } from "../data/heroContent";
import { useIsMobile } from "../hooks/useMediaQuery";

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

  const actionsReady = productModel.isComplete && isConfigurationReadyForActions(model.id, config, customText);

  const heroContent = getHeroContent(model.id);
  const isMobile = useIsMobile();

  const { imagePath } = getCompletedDeviceImage({
    fullCode: productModel.fullCode,
    modelId: model.id,
    config,
    isComplete: productModel.isComplete,
  });

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
    <>
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 pb-24 pt-8 md:flex-row md:px-6 md:pb-8 lg:px-8">
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
          onAddToMyList={handleAddToMyList}
          onRemoveFromMyList={handleRemoveFromMyList}
          isInMyList={isInMyList}
          actionsReady={actionsReady}
          productName={productName}
          productDescription={heroContent?.description}
          productImageUrl={imagePath}
          className="w-full shrink-0 md:w-[55%] lg:w-[520px]"
        />

        <MainPanel
          model={model}
          config={config}
          customText={customText}
          productModel={productModel}
          onEditStep={handleEditStep}
          onCustomTextSubmit={handleCustomTextSubmit}
          className="min-w-0 flex-1 md:sticky md:top-20"
        />
      </div>

      {isMobile && (
        <FloatingCompactBar
          productModel={productModel}
          modelId={model.id}
          config={config}
          customText={customText}
          completedSteps={completedSteps}
          totalSteps={totalSteps}
          imagePath={imagePath}
          actionsReady={actionsReady}
          isInMyList={isInMyList}
          onAddToMyList={handleAddToMyList}
          onRemoveFromMyList={handleRemoveFromMyList}
          productName={productName}
          productDescription={heroContent?.description}
          productImageUrl={imagePath}
        />
      )}
    </>
  );
}