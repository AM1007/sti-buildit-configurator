import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { SlidersHorizontal } from "lucide-react";
import type { Configuration, ProductModel, ModelDefinition, StepId, CustomTextData } from "../types";
import { ProductPreview } from "./ProductPreview";
import { CustomTextForm } from "./CustomTextForm";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";
import { getModelDescription } from "../utils/getModelDescription";
import { shouldShowCustomTextForm, getCustomTextConfig, getMaxLength, getEffectiveLineCount } from "../utils/customTextHelpers";
import { useTranslation, useLanguage } from "../i18n";

type TabId = "edit" | "preview";

interface MainPanelProps {
  model: ModelDefinition;
  config: Configuration;
  customText: CustomTextData | null;
  productModel: ProductModel;
  onEditStep: (stepId: StepId) => void;
  onCustomTextSubmit: (data: Omit<CustomTextData, "submitted">) => void;
  className?: string;
}

export function MainPanel({
  model,
  config,
  customText,
  productModel,
  onEditStep,
  onCustomTextSubmit,
  className = "",
}: MainPanelProps) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>("edit");
  const [modelDescription, setModelDescription] = useState<string | null>(null);

  const showCustomTextForm = shouldShowCustomTextForm(model, config, customText);
  const customTextConfig = getCustomTextConfig(model.id);

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

  useEffect(() => {
    let cancelled = false;

    if (productModel.isComplete) {
      const currentLang = lang as "en" | "uk";
      getModelDescription(productModel.fullCode, model.id, currentLang).then(
        (desc) => {
          if (!cancelled) {
            setModelDescription(desc);
          }
        }
      );
    } else {
      setModelDescription(null);
    }

    return () => {
      cancelled = true;
    };
  }, [productModel.isComplete, productModel.fullCode, model.id, lang]);

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
    <div className={`flex flex-col ${className}`}>
      <div className="flex min-h-[600px] flex-1 flex-col overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`
                relative px-5 py-3 text-[15px] font-medium transition-colors md:text-sm
                ${activeTab === "edit"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700 md:text-slate-400 md:hover:text-slate-600"
                }
              `}
            >
              {t("configurator.editSelections")}
              {activeTab === "edit" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-brand-600" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`
                relative px-5 py-3 text-[15px] font-medium transition-colors md:text-sm
                ${activeTab === "preview"
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-700 md:text-slate-400 md:hover:text-slate-600"
                }
              `}
            >
              {t("configurator.productPreview")}
              {activeTab === "preview" && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-brand-600" />
              )}
            </button>
          </div>
        </div>

        <div className="tech-grid relative flex-1">
          {activeTab === "edit" && (
            <div className="h-full p-8">
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
            <div className="flex h-full flex-col">
              {imagePath ? (
                <ProductPreviewContent
                  imagePath={imagePath}
                  productCode={productModel.fullCode}
                />
              ) : (
                <EmptyStateContent reason={reason} />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-slate-200 p-3 font-mono text-[10px] text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                productModel.isComplete ? "bg-green-400" : "bg-slate-300"
              }`}
            />
            {productModel.isComplete ? "CONFIGURED" : "WAITING FOR INPUT"}
          </div>
        </div>
      </div>

      {modelDescription && (
        <div className="mt-4 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {t("configurator.modelDescription", { defaultValue: "Model Description" })}
          </span>
          <p className="text-sm leading-relaxed text-slate-600">
            {modelDescription}
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyStateContent({ reason }: { reason?: string }) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center p-12 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-50 shadow-sm">
        <SlidersHorizontal className="h-10 w-10 text-slate-300" strokeWidth={1} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">
        {t("configurator.previewNotAvailable", { defaultValue: "Select a configuration to begin" })}
      </h3>
      <p className="max-w-sm text-sm leading-relaxed text-slate-500">
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
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      {hasError ? (
        <div className="flex w-full flex-col items-center gap-4 py-16 text-center">
          <p className="text-sm font-medium text-slate-500">
            {t("configurator.previewNotAvailable")}
          </p>
          <p className="text-xs text-slate-400">
            {t("configurator.imageFailedToLoad")}
          </p>
        </div>
      ) : (
        <div className="relative mx-auto flex w-full max-w-lg items-center justify-center">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ClipLoader color="#c8102e" size={40} />
            </div>
          )}
          <img
            alt={`${productCode}`}
            loading="lazy"
            width="600"
            height="600"
            className={`w-full select-none object-contain transition-opacity duration-300 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            src={imagePath}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </div>
      )}
      {!hasError && !isLoading && (
        <p className="mt-4 text-center font-mono text-xs font-semibold text-slate-600">
          {productCode}
        </p>
      )}
    </div>
  );
}