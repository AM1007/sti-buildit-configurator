import { useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { SlidersHorizontal, RotateCcw, Share2, Star } from "lucide-react";
import type { Configuration, ProductModel, ModelDefinition, StepId, CustomTextData } from "../types";
import { ProductPreview } from "./ProductPreview";
import { ProductModelDisplay } from "./ProductModelDisplay";
import { CustomTextForm } from "./CustomTextForm";
import { CustomTextDisplay } from "./CustomTextDisplay";
import { ShareMenu } from "./ShareMenu";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";
import { getModelDescription } from "../utils/getModelDescription";
import {
  shouldShowCustomTextForm,
  hasSubmittedCustomText,
  getCustomTextConfig,
  getMaxLength,
  getEffectiveLineCount,
} from "../utils/customTextHelpers";
import { useTranslation, useLanguage } from "../i18n";

type TabId = "edit" | "preview";

interface MainPanelProps {
  model: ModelDefinition;
  config: Configuration;
  customText: CustomTextData | null;
  productModel: ProductModel;
  completionPercent: number;
  completedSteps: number;
  totalSteps: number;
  onEditStep: (stepId: StepId) => void;
  onReset: () => void;
  onAddToMyList: () => void;
  onRemoveFromMyList: () => void;
  isInMyList: boolean;
  actionsReady: boolean;
  productName: string;
  productDescription?: string;
  productImageUrl?: string | null;
  onCustomTextSubmit: (data: Omit<CustomTextData, "submitted">) => void;
  className?: string;
}

export function MainPanel({
  model,
  config,
  customText,
  productModel,
  completionPercent,
  completedSteps,
  totalSteps,
  onEditStep,
  onReset,
  onAddToMyList,
  onRemoveFromMyList,
  isInMyList,
  actionsReady,
  productName,
  productDescription,
  productImageUrl,
  onCustomTextSubmit,
  className = "",
}: MainPanelProps) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>("edit");
  const [modelDescription, setModelDescription] = useState<string | null>(null);

  const showCustomTextForm = shouldShowCustomTextForm(model, config, customText);
  const showCustomTextDisplay = hasSubmittedCustomText(model.id, config, customText);
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
      {/* ── Main panel with tabs ── */}
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

      {/* ── Custom text display (if submitted) ── */}
      {showCustomTextDisplay && customText && (
        <div className="mt-4 rounded-sm border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <CustomTextDisplay customText={customText} />
        </div>
      )}

      {/* ── Configuration block (progress + SKU + actions) ── */}
      <ConfigurationBlock
        model={model}
        config={config}
        customText={customText}
        productModel={productModel}
        completionPercent={completionPercent}
        completedSteps={completedSteps}
        totalSteps={totalSteps}
        onEditStep={onEditStep}
        onReset={onReset}
        onAddToMyList={onAddToMyList}
        onRemoveFromMyList={onRemoveFromMyList}
        isInMyList={isInMyList}
        actionsReady={actionsReady}
        productName={productName}
        productDescription={productDescription}
        productImageUrl={productImageUrl}
      />

      {/* ── Model description (always last) ── */}
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

/* ═══════════════════════════════════════════════════════════════════
   ConfigurationBlock — extracted from Sidebar
   ═══════════════════════════════════════════════════════════════════ */

interface ConfigurationBlockProps {
  model: ModelDefinition;
  config: Configuration;
  customText: CustomTextData | null;
  productModel: ProductModel;
  completionPercent: number;
  completedSteps: number;
  totalSteps: number;
  onEditStep: (stepId: StepId) => void;
  onReset: () => void;
  onAddToMyList: () => void;
  onRemoveFromMyList: () => void;
  isInMyList: boolean;
  actionsReady: boolean;
  productName: string;
  productDescription?: string;
  productImageUrl?: string | null;
}

function ConfigurationBlock({
  model,
  config,
  customText,
  productModel,
  completionPercent,
  completedSteps,
  totalSteps,
  onEditStep,
  onReset,
  onAddToMyList,
  onRemoveFromMyList,
  isInMyList,
  actionsReady,
  productName,
  productDescription,
  productImageUrl,
}: ConfigurationBlockProps) {
  const { t } = useTranslation();
  const [showShareMenu, setShowShareMenu] = useState(false);

  const clampedPercent = Math.min(100, Math.max(0, completionPercent));

  const handleStarClick = () => {
    if (!actionsReady) return;
    if (isInMyList) {
      onRemoveFromMyList();
    } else {
      onAddToMyList();
    }
  };

  const starTitle = !actionsReady
    ? t("configurator.submitCustomTextHint")
    : isInMyList
      ? t("configurator.removeFromMyList")
      : t("configurator.addToMyList");

  const shareTitle = !actionsReady
    ? t("configurator.submitCustomTextHint")
    : t("common.share");

  return (
    <div className="mt-4 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header row */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-slate-900 md:text-sm">
          {t("configurator.configuration", { defaultValue: "Configuration" })}
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-[13px] text-slate-500 transition-colors hover:text-brand-600 md:text-xs md:text-slate-400"
        >
          <RotateCcw className="h-3.5 w-3.5 md:h-3 md:w-3" />
          {t("common.reset")}
        </button>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-end justify-between">
          <span className="text-[13px] font-medium text-slate-600 md:text-xs md:text-slate-500">
            {t("configurator.stepsCompleted", {
              completed: completedSteps.toString(),
              total: totalSteps.toString(),
            })}
          </span>
          <span className="font-mono text-[13px] text-slate-500 md:text-xs md:text-slate-400">
            {clampedPercent}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 md:h-1">
          <div
            className="h-full bg-brand-600 transition-all duration-300"
            style={{ width: `${clampedPercent}%` }}
            role="progressbar"
            aria-valuenow={clampedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* SKU + actions */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500 md:text-[10px] md:text-slate-400">
          {t("configurator.productModel", { defaultValue: "Target SKU" })}
        </span>
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <ProductModelDisplay
              model={model}
              productModel={productModel}
              config={config}
              onEditStep={onEditStep}
            />
          </div>
          {productModel.isComplete && (
            <div className="flex shrink-0 items-center gap-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => actionsReady && setShowShareMenu((prev) => !prev)}
                  disabled={!actionsReady}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors md:h-7 md:w-7 ${
                    actionsReady
                      ? "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-600 md:text-slate-400"
                      : "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                  }`}
                  aria-expanded={showShareMenu}
                  aria-haspopup="true"
                  aria-label={shareTitle}
                  title={shareTitle}
                >
                  <Share2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
                </button>
                {showShareMenu && actionsReady && (
                  <ShareMenu
                    productModel={productModel}
                    modelId={model.id}
                    config={config}
                    customText={customText}
                    onClose={() => setShowShareMenu(false)}
                    productName={productName}
                    productDescription={productDescription}
                    productImageUrl={productImageUrl}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={handleStarClick}
                disabled={!actionsReady}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors md:h-7 md:w-7 ${
                  !actionsReady
                    ? "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                    : isInMyList
                      ? "border-brand-600 bg-brand-600 text-white hover:bg-brand-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-600 md:text-slate-400"
                }`}
                aria-label={starTitle}
                aria-pressed={isInMyList}
                title={starTitle}
              >
                <Star className={`h-4 w-4 md:h-3.5 md:w-3.5 ${isInMyList ? "fill-current" : ""}`} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Sub-components (unchanged)
   ═══════════════════════════════════════════════════════════════════ */

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