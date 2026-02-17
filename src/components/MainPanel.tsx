import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import type { Configuration, ProductModel, ModelDefinition, StepId, CustomTextData,  } from "../types";
import { ProductPreview } from "./ProductPreview";
import { ProductModelDisplay } from "./ProductModelDisplay";
import { ActionButtons } from "./ActionButtons";
import { CustomTextForm } from "./CustomTextForm";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";
import { shouldShowCustomTextForm, getCustomTextConfig, getMaxLength, getEffectiveLineCount, isConfigurationReadyForActions } from "../utils/customTextHelpers";
import { getHeroContent } from "../data/heroContent";
import { useTranslation } from "../i18n";

type TabId = "edit" | "preview";

interface MainPanelProps {
  model: ModelDefinition;
  config: Configuration;
  customText: CustomTextData | null;
  productModel: ProductModel;
  productName: string;
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
  productName,
  onEditStep,
  onReset,
  onAddToMyList,
  onRemoveFromMyList,
  onCustomTextSubmit,
  isInMyList = false,
  className = "",
}: MainPanelProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>("edit");

  const showCustomTextForm = shouldShowCustomTextForm(model, config, customText);
  const customTextConfig = getCustomTextConfig(model.id);
  const actionsReady = productModel.isComplete && isConfigurationReadyForActions(model.id, config, customText);

  const heroContent = getHeroContent(model.id);

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

  // Shared action buttons props
  const actionButtonsProps = {
    productModel,
    modelId: model.id,
    config,
    customText,
    onReset,
    onAddToMyList,
    onRemoveFromMyList,
    isInMyList,
    disabled: !actionsReady,
    disabledReason: !actionsReady ? t("configurator.completeSelections") : undefined,
    productName,
    productDescription: heroContent?.description,
    productImageUrl: imagePath,
  };

  return (
    <div className={`h-full w-full ${className}`}>
      <div className="flex h-fit flex-col gap-8 p-5 md:p-8 xl:sticky xl:top-0 xl:gap-16 xl:p-10 2xl:gap-20 2xl:p-16">
        <div className="w-full xl:min-h-144">
          <div className="inline-flex items-center justify-center h-auto gap-6 rounded-none bg-white p-0 text-black xl:gap-10">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`
                inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5
                text-sm font-medium transition-all focus-visible:outline-none
                rounded-none bg-white p-0 shadow-none outline-0 ring-0
                ${activeTab === "edit" ? "text-brand-600" : "text-black"}
              `}
            >
              <span className="font-bold text-sm md:text-base xl:text-lg">{t("configurator.editSelections")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`
                inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5
                text-sm font-medium transition-all focus-visible:outline-none
                rounded-none bg-white p-0 shadow-none outline-0 ring-0
                ${activeTab === "preview" ? "text-brand-600" : "text-black"}
              `}
            >
              <span className="font-bold text-sm md:text-base xl:text-lg">{t("configurator.productPreview")}</span>
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
                />
              ) : (
                <NoPreviewContent reason={reason} />
              )}
            </div>
          )}
        </div>

        {/* Actions — always visible */}
        <div className="flex w-full flex-wrap items-center justify-center gap-2 md:items-start md:gap-6">
          <ActionButtons {...actionButtonsProps} />
        </div>

        <ProductModelDisplay
          model={model}
          productModel={productModel}
          config={config}
          onEditStep={onEditStep}
        />
      </div>
    </div>
  );
}

interface NoPreviewContentProps {
  reason?: string;
}

function NoPreviewContent({ reason }: NoPreviewContentProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col items-center gap-11 py-16 text-center text-gray-500">
      <p className="font-medium text-base md:text-md whitespace-pre-line">
        {t("configurator.previewNotAvailable")}
      </p>
      <p className="font-normal text-base md:text-md">
        {reason || t("configurator.completeSelections")}
      </p>
    </div>
  );
}

interface ProductPreviewContentProps {
  imagePath: string;
  productCode: string;
}

function ProductPreviewContent({
  imagePath,
  productCode,
}: ProductPreviewContentProps) {
  const { t } = useTranslation();
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [prevImagePath, setPrevImagePath] = useState(imagePath);
  if (imagePath !== prevImagePath) {
    setPrevImagePath(imagePath);
    setIsLoading(true);
    setHasError(false);
  }

  return (
    <div className="flex w-full flex-col gap-10 py-5">
      {hasError ? (
        <div className="flex w-full flex-col items-center gap-11 py-16 text-center text-gray-500">
          <p className="font-medium text-base md:text-md whitespace-pre-line">
            {t("configurator.previewNotAvailable")}
          </p>
          <p className="font-normal text-base md:text-md">
            {t("configurator.imageFailedToLoad")}
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-120 w-full min-h-[600px] flex items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ClipLoader color="#c8102e" size={50} />
            </div>
          )}
          <img
            alt={`Image of ${productCode}`}
            loading="lazy"
            width="600"
            height="600"
            className={`select-none object-contain w-full h-auto ${isLoading ? "opacity-0" : "opacity-100"}`}
            src={imagePath}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </div>
      )}
    </div>
  );
}