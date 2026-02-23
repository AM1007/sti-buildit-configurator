import { useState, useEffect } from "react";
import type { ModelDefinition, CustomTextData, StepId, Configuration } from "../types";
import { useConfiguration } from "../hooks/useConfiguration";
import { buildProductModel } from "../buildProductModel";
import { Sidebar } from "./Sidebar";
import { MainPanel } from "./MainPanel";
import { ProductPreview } from "./ProductPreview";
import { ProductModelDisplay } from "./ProductModelDisplay";
import { OptionBottomSheet } from "./OptionBottomSheet";
import { ShareMenu } from "./ShareMenu";
import { useCustomText, useConfigurationStore, useIsProductInMyList, useMyListItemIdByProductCode } from "../stores/configurationStore";
import { isConfigurationReadyForActions } from "../utils/customTextHelpers";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";
import { getModelDescription } from "../utils/getModelDescription";
import { getHeroContent } from "../data/heroContent";
import { useTranslation, useLanguage } from "../i18n";
import { RotateCcw, Share2, Star } from "lucide-react";

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
    if (myListItemId && onRemoveFromMyList) {
      onRemoveFromMyList(myListItemId);
    }
  };

  const handleCustomTextSubmit = (data: Omit<CustomTextData, "submitted">) => {
    setCustomText(data);
  };

  const activeStep = activeSheetStep
    ? model.steps.find((s) => s.id === activeSheetStep) ?? null
    : null;

  return (
    <>
      <div className="hidden lg:block">
        <DesktopLayout
          model={model}
          config={config}
          customText={customText}
          currentStep={currentStep}
          completionPercent={completionPercent}
          completedSteps={completedSteps}
          totalSteps={totalSteps}
          productModel={productModel}
          selectOption={selectOption}
          clearSelection={clearSelection}
          setCurrentStep={setCurrentStep}
          onEditStep={handleEditStep}
          onReset={handleReset}
          onAddToMyList={handleAddToMyList}
          onRemoveFromMyList={handleRemoveFromMyList}
          isInMyList={isInMyList}
          actionsReady={actionsReady}
          productName={productName}
          heroDescription={heroContent?.description}
          imagePath={imagePath}
          onCustomTextSubmit={handleCustomTextSubmit}
        />
      </div>

      <div className="lg:hidden">
        <MobileTabletLayout
          model={model}
          config={config}
          customText={customText}
          productModel={productModel}
          completionPercent={completionPercent}
          completedSteps={completedSteps}
          totalSteps={totalSteps}
          onEditStep={handleEditStepMobile}
          onReset={handleReset}
          onAddToMyList={handleAddToMyList}
          onRemoveFromMyList={handleRemoveFromMyList}
          isInMyList={isInMyList}
          actionsReady={actionsReady}
          productName={productName}
          heroDescription={heroContent?.description}
          imagePath={imagePath}
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

interface DesktopLayoutProps {
  model: ModelDefinition;
  config: Configuration;
  customText: CustomTextData | null;
  currentStep: string | null;
  completionPercent: number;
  completedSteps: number;
  totalSteps: number;
  productModel: ReturnType<typeof buildProductModel>;
  selectOption: (stepId: string, optionId: string) => void;
  clearSelection: (stepId: string) => void;
  setCurrentStep: (stepId: string) => void;
  onEditStep: (stepId: string) => void;
  onReset: () => void;
  onAddToMyList: () => void;
  onRemoveFromMyList: () => void;
  isInMyList: boolean;
  actionsReady: boolean;
  productName: string;
  heroDescription?: string;
  imagePath: string | null;
  onCustomTextSubmit: (data: Omit<CustomTextData, "submitted">) => void;
}

function DesktopLayout({
  model,
  config,
  customText,
  currentStep,
  completionPercent,
  completedSteps,
  totalSteps,
  productModel,
  selectOption,
  clearSelection,
  setCurrentStep,
  onEditStep,
  onReset,
  onAddToMyList,
  onRemoveFromMyList,
  isInMyList,
  actionsReady,
  productName,
  heroDescription,
  imagePath,
  onCustomTextSubmit,
}: DesktopLayoutProps) {
  return (
    <div className="mx-auto flex max-w-7xl items-start gap-6 px-6 pb-8 pt-8 lg:px-8">
      <Sidebar
        model={model}
        config={config}
        customText={customText}
        currentStep={currentStep}
        completionPercent={completionPercent}
        completedSteps={completedSteps}
        totalSteps={totalSteps}
        productModel={productModel}
        onSelectOption={(stepId, optionId) => selectOption(stepId, optionId)}
        onClearOption={(stepId) => clearSelection(stepId)}
        onSetCurrentStep={setCurrentStep}
        onEditStep={onEditStep}
        onReset={onReset}
        onAddToMyList={onAddToMyList}
        onRemoveFromMyList={onRemoveFromMyList}
        isInMyList={isInMyList}
        actionsReady={actionsReady}
        productName={productName}
        productDescription={heroDescription}
        productImageUrl={imagePath}
        className="w-[520px] shrink-0"
      />

      <MainPanel
        model={model}
        config={config}
        customText={customText}
        productModel={productModel}
        onEditStep={onEditStep}
        onCustomTextSubmit={onCustomTextSubmit}
        className="min-w-0 flex-1 sticky top-20"
      />
    </div>
  );
}

interface MobileTabletLayoutProps {
  model: ModelDefinition;
  config: Configuration;
  customText: CustomTextData | null;
  productModel: ReturnType<typeof buildProductModel>;
  completionPercent: number;
  completedSteps: number;
  totalSteps: number;
  onEditStep: (stepId: string) => void;
  onReset: () => void;
  onAddToMyList: () => void;
  onRemoveFromMyList: () => void;
  isInMyList: boolean;
  actionsReady: boolean;
  productName: string;
  heroDescription?: string;
  imagePath: string | null;
}

function MobileTabletLayout({
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
  heroDescription,
  imagePath,
}: MobileTabletLayoutProps) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [modelDescription, setModelDescription] = useState<string | null>(null);

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

  const handleStarClick = () => {
    if (isInMyList) {
      onRemoveFromMyList();
    } else {
      onAddToMyList();
    }
  };

  const starTitle = isInMyList
    ? t("configurator.removeFromMyList")
    : t("configurator.addToMyList");

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 md:px-6">
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <ProductPreview
          model={model}
          config={config}
          onEditStep={onEditStep}
        />
      </div>

      <div className="mt-4 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-slate-900">
            {t("configurator.configuration", { defaultValue: "Configuration" })}
          </h2>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-[13px] text-slate-500 transition-colors hover:text-brand-600"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t("common.reset")}
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <span className="text-[13px] font-medium text-slate-600">
              {t("configurator.stepsCompleted", {
                completed: completedSteps.toString(),
                total: totalSteps.toString(),
              })}
            </span>
            <span className="font-mono text-[13px] text-slate-500">
              {Math.min(100, Math.max(0, completionPercent))}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-brand-600 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, completionPercent))}%` }}
              role="progressbar"
              aria-valuenow={Math.min(100, Math.max(0, completionPercent))}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
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
            {actionsReady && (
              <div className="flex shrink-0 items-center gap-1">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowShareMenu((prev) => !prev)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-brand-600"
                    aria-expanded={showShareMenu}
                    aria-haspopup="true"
                    aria-label={t("common.share")}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  {showShareMenu && (
                    <ShareMenu
                      productModel={productModel}
                      modelId={model.id}
                      config={config}
                      customText={customText}
                      onClose={() => setShowShareMenu(false)}
                      productName={productName}
                      productDescription={heroDescription}
                      productImageUrl={imagePath}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleStarClick}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors ${
                    isInMyList
                      ? "border-brand-600 bg-brand-600 text-white hover:bg-brand-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-600"
                  }`}
                  aria-label={starTitle}
                  aria-pressed={isInMyList}
                  title={starTitle}
                >
                  <Star className={`h-4 w-4 ${isInMyList ? "fill-current" : ""}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {modelDescription && (
        <div className="mt-4 rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("configurator.modelDescription", { defaultValue: "Model Description" })}
          </span>
          <p className="text-[15px] leading-relaxed text-slate-600">
            {modelDescription}
          </p>
        </div>
      )}
    </div>
  );
}