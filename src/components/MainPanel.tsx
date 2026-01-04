import { useState, useEffect } from "react";
import type { Configuration, ProductModel, ModelDefinition, StepId, CustomTextData } from "../types";
import { ProductPreview } from "./ProductPreview";
import { ProductModelDisplay } from "./ProductModelDisplay";
import { ActionButtons } from "./ActionButtons";
import { CustomTextForm } from "./CustomTextForm";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";
import { shouldShowCustomTextForm, getCustomTextConfig, getMaxLength, getEffectiveLineCount, isConfigurationReadyForActions } from "../utils/customTextHelpers";

type TabId = "edit" | "preview";

interface MainPanelProps {
  model: ModelDefinition;
  config: Configuration;
  customText: CustomTextData | null;
  productModel: ProductModel;
  onEditStep: (stepId: StepId) => void;
  onReset: () => void;
  onAddToMyList: () => void;
  onRemoveFromMyList: () => void;
  onCustomTextSubmit: (data: Omit<CustomTextData, "submitted">) => void;
  isInMyList?: boolean;
  className?: string;
}

export function MainPanel({
  model,
  config,
  customText,
  productModel,
  onEditStep,
  onReset,
  onAddToMyList,
  onRemoveFromMyList,
  onCustomTextSubmit,
  isInMyList = false,
  className = "",
}: MainPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("edit");

  const showCustomTextForm = shouldShowCustomTextForm(model, config, customText);
  const customTextConfig = getCustomTextConfig(model.id);
  const showActionButtons = productModel.isComplete && isConfigurationReadyForActions(model.id, config, customText);

  useEffect(() => {
    if (customText?.submitted) {
      setActiveTab("preview");
      return;
    }

    if (showCustomTextForm) {
      setActiveTab("edit");
      return;
    }

    if (productModel.isComplete) {
      setActiveTab("preview");
    } else {
      setActiveTab("edit");
    }
  }, [productModel.isComplete, showCustomTextForm, customText?.submitted]);

  const handleCustomTextSubmit = (data: Omit<CustomTextData, "submitted">) => {
    onCustomTextSubmit(data);
    setActiveTab("preview");
  };

  const { imagePath, reason } = getCompletedDeviceImage({
    fullCode: productModel.fullCode,
    modelId: model.id,
    config,
    isComplete: productModel.isComplete,
  });

  const getFormMaxLength = (): number => {
    if (!customTextConfig) return 20;
    
    const effectiveLineCount = getEffectiveLineCount(
      customTextConfig.variant,
      customText?.lineCount ?? 2
    );
    
    return getMaxLength(model.id, effectiveLineCount);
  };

  return (
    <div className={`hidden h-full w-full lg:block ${className}`}>
      <div className="sticky top-0 flex h-fit flex-col gap-16 p-5 lg:p-10 xl:gap-20 xl:p-16">
        <div className="min-h-144 w-full">
          <div className="inline-flex items-center justify-center h-auto gap-6 rounded-none bg-white p-0 text-black xl:gap-10">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`
                inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5
                text-sm font-medium transition-all focus-visible:outline-none
                rounded-none bg-white p-0 shadow-none outline-0 ring-0
                ${activeTab === "edit" ? "text-red-600" : "text-black"}
              `}
            >
              <span className="font-bold text-sm lg:text-lg">Edit Selections</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`
                inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5
                text-sm font-medium transition-all focus-visible:outline-none
                rounded-none bg-white p-0 shadow-none outline-0 ring-0
                ${activeTab === "preview" ? "text-red-600" : "text-black"}
              `}
            >
              <span className="font-bold text-sm lg:text-lg">Product Preview</span>
            </button>
          </div>

          {activeTab === "edit" && (
            <div className="mt-10">
              {showCustomTextForm && customTextConfig ? (
                <CustomTextForm
                  variant={customTextConfig.variant}
                  maxLength={getFormMaxLength()}
                  onSubmit={handleCustomTextSubmit}
                  initialData={customText ?? undefined}
                />
              ) : (
                <ProductPreview
                  model={model}
                  config={config}
                  onEditStep={onEditStep}
                />
              )}
            </div>
          )}

          {activeTab === "preview" && (
            <div className="mt-10">
              {imagePath ? (
                <ProductPreviewContent
                  imagePath={imagePath}
                  productCode={productModel.fullCode}
                  showActionButtons={showActionButtons}
                  productModel={productModel}
                  onReset={onReset}
                  onAddToMyList={onAddToMyList}
                  onRemoveFromMyList={onRemoveFromMyList}
                  isInMyList={isInMyList}
                />
              ) : (
                <div className="flex w-full flex-col items-center gap-11 py-16 text-center text-gray-500">
                  <p className="font-medium text-base lg:text-md">
                    PREVIEW<br />NOT AVAILABLE
                  </p>
                  <p className="font-normal text-base lg:text-md">
                    {reason || "Please complete build it selections"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <ProductModelDisplay
          model={model}
          productModel={productModel}
          onEditStep={onEditStep}
        />
      </div>
    </div>
  );
}

interface ProductPreviewContentProps {
  imagePath: string;
  productCode: string;
  showActionButtons: boolean;
  productModel: ProductModel;
  onReset: () => void;
  onAddToMyList: () => void;
  onRemoveFromMyList: () => void;
  isInMyList: boolean;
}

function ProductPreviewContent({
  imagePath,
  productCode,
  showActionButtons,
  productModel,
  onReset,
  onAddToMyList,
  onRemoveFromMyList,
  isInMyList,
}: ProductPreviewContentProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex w-full flex-col gap-10 py-5">
      {hasError ? (
        <div className="flex w-full flex-col items-center gap-11 py-16 text-center text-gray-500">
          <p className="font-medium text-base lg:text-md">
            PREVIEW<br />NOT AVAILABLE
          </p>
          <p className="font-normal text-base lg:text-md">
            Image failed to load
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-120 flex-1">
          <img
            alt={`Image of ${productCode}`}
            loading="lazy"
            width="600"
            height="600"
            className="select-none object-contain w-full h-auto"
            src={imagePath}
            onError={() => setHasError(true)}
          />
        </div>
      )}

      {showActionButtons && (
        <div className="flex w-full flex-wrap items-center justify-center gap-2 md:items-start md:gap-6">
          <ActionButtons
            productModel={productModel}
            onReset={onReset}
            onAddToMyList={onAddToMyList}
            onRemoveFromMyList={onRemoveFromMyList}
            isInMyList={isInMyList}
          />
        </div>
      )}
    </div>
  );
}