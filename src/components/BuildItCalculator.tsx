import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ModelDefinition, CustomTextData, StepId, Configuration } from "../types";
import { useConfiguration } from "../hooks/useConfiguration";
import { buildProductModel } from "../buildProductModel";
import { Sidebar } from "./Sidebar";
import { MainPanel } from "./MainPanel";
import { ProductPreview } from "./ProductPreview";
import { ProductModelDisplay } from "./ProductModelDisplay";
import { OptionBottomSheet } from "./OptionBottomSheet";
import { ShareMenu } from "./ShareMenu";
import { PdfMenu } from "./PdfMenu";
import { CustomTextForm } from "./CustomTextForm";
import { CustomTextDisplay } from "./CustomTextDisplay";
import { useCustomText, useConfigurationStore, useIsProductInMyList, useIsProductInAnyProject, useMyListItemIdByProductCode } from "../stores/configurationStore";
import { useIsAuthenticated } from "../stores/authStore";
import { isConfigurationReadyForActions, shouldShowCustomTextForm, hasSubmittedCustomText, getCustomTextConfig, getMaxLength, getEffectiveLineCount } from "../utils/customTextHelpers";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";
import { getModelSummary } from "../utils/getModelSummary";
import { getHeroContent } from "../data/heroContent";
import { useTranslation, useLanguage } from "../i18n";
import { RotateCcw, Share2, Star, Pencil, FileText } from "lucide-react";
import { ClipLoader } from "react-spinners";

interface BuildItCalculatorProps {
  model: ModelDefinition;
  productName: string;
  onAddToMyList?: (productCode: string) => void;
  onRemoveFromMyList?: (itemId: string) => void;
  projectRefreshToken?: number;
  onBack?: () => void;
}

export function BuildItCalculator({
  model,
  productName,
  onAddToMyList,
  onRemoveFromMyList,
  projectRefreshToken = 0,
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
  const isAuthenticated = useIsAuthenticated();
  const productCode = productModel.isComplete ? productModel.fullCode : null;
  const isInMyListGuest = useIsProductInMyList(productCode, customText);
  const isInMyListAuth = useIsProductInAnyProject(productCode, projectRefreshToken);
  const isInMyList = isAuthenticated ? isInMyListAuth : isInMyListGuest;
  const myListItemId = useMyListItemIdByProductCode(productCode, customText);

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
    if (isAuthenticated) {
      if (productModel.isComplete && onAddToMyList) {
        onAddToMyList(productModel.fullCode);
      }
    } else {
      if (myListItemId && onRemoveFromMyList) {
        onRemoveFromMyList(myListItemId);
      }
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
          onCustomTextSubmit={handleCustomTextSubmit}
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
        modelId={model.id}
        onSelectOption={(stepId, optionId) => selectOption(stepId, optionId)}
        onClearOption={(stepId) => clearSelection(stepId)}
        onSetCurrentStep={setCurrentStep}
        className="w-[520px] shrink-0"
      />

      <MainPanel
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
        productDescription={heroDescription}
        productImageUrl={imagePath}
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
  onCustomTextSubmit: (data: Omit<CustomTextData, "submitted">) => void;
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
  onCustomTextSubmit,
}: MobileTabletLayoutProps) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showPdfMenu, setShowPdfMenu] = useState(false);
  const [modelDescription, setModelDescription] = useState<string | null>(null);
  const [userOverrideEdit, setUserOverrideEdit] = useState(false);
  const [previewImageLoading, setPreviewImageLoading] = useState(true);
  const [previewImageError, setPreviewImageError] = useState(false);

  const showCustomTextForm = shouldShowCustomTextForm(model, config, customText);
  const showCustomTextDisplay = hasSubmittedCustomText(model.id, config, customText);
  const customTextConfig = getCustomTextConfig(model.id);

  const canShowPreview = productModel.isComplete && !!imagePath;
  const showPreviewImage = canShowPreview && !userOverrideEdit && !showCustomTextForm;

  useEffect(() => {
    if (!canShowPreview) {
      setUserOverrideEdit(false);
    }
  }, [canShowPreview]);

  useEffect(() => {
    setPreviewImageLoading(true);
    setPreviewImageError(false);
  }, [imagePath]);

  useEffect(() => {
    let cancelled = false;

    if (productModel.isComplete) {
      const currentLang = lang as "en" | "uk";
      getModelSummary(productModel.fullCode, model.id, currentLang).then(
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

  const getFormMaxLength = (): number => {
    if (!customTextConfig) return 20;
    const effectiveLineCount = getEffectiveLineCount(
      customTextConfig.variant,
      customText?.lineCount ?? 2
    );
    return getMaxLength(model.id, effectiveLineCount);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 md:px-6">
      <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <AnimatePresence mode="wait" initial={false}>
          {showCustomTextForm && customTextConfig ? (
            <motion.div
              key="custom-text-form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="p-4 md:p-5"
            >
              <CustomTextForm
                variant={customTextConfig.variant}
                maxLength={getFormMaxLength()}
                onSubmit={onCustomTextSubmit}
                initialData={customText ?? undefined}
              />
            </motion.div>
          ) : showPreviewImage && imagePath ? (
            <motion.div
              key="preview-image"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative flex flex-col items-center justify-center p-6 md:p-8"
            >
              {previewImageError ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    {t("configurator.previewNotAvailable")}
                  </p>
                </div>
              ) : (
                <>
                  {previewImageLoading && (
                    <div className="flex items-center justify-center py-16">
                      <ClipLoader color="#c8102e" size={40} />
                    </div>
                  )}
                  <img
                    alt={productModel.fullCode}
                    src={imagePath}
                    width="400"
                    height="400"
                    className={`w-full max-w-sm select-none object-contain transition-opacity duration-300 ${
                      previewImageLoading ? "h-0 opacity-0" : "opacity-100"
                    }`}
                    onLoad={() => setPreviewImageLoading(false)}
                    onError={() => {
                      setPreviewImageLoading(false);
                      setPreviewImageError(true);
                    }}
                  />
                  {!previewImageLoading && !previewImageError && (
                    <p className="mt-3 text-center font-mono text-xs font-semibold text-slate-600">
                      {productModel.fullCode}
                    </p>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={() => setUserOverrideEdit(true)}
                className="absolute right-3 bottom-3 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm transition-colors hover:border-slate-300 hover:text-brand-600 md:h-9 md:w-9"
                aria-label={t("configurator.editSelections")}
                title={t("configurator.editSelections")}
              >
                <Pencil className="h-4 w-4 md:h-3.5 md:w-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="product-preview"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="p-4 md:p-5"
            >
              <ProductPreview
                model={model}
                config={config}
                onEditStep={onEditStep}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showCustomTextDisplay && customText && (
        <div className="mt-4 rounded-sm border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <CustomTextDisplay customText={customText} />
        </div>
      )}

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
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="min-w-0">
              <ProductModelDisplay
                model={model}
                productModel={productModel}
                config={config}
                onEditStep={onEditStep}
              />
            </div>
            {productModel.isComplete && (
              <div className="flex shrink-0 items-center gap-1 self-end md:self-auto md:ml-auto">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (!actionsReady) return;
                      setShowPdfMenu((prev) => !prev);
                      setShowShareMenu(false);
                    }}
                    disabled={!actionsReady}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors ${
                      actionsReady
                        ? "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-600"
                        : "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                    }`}
                    aria-expanded={showPdfMenu}
                    aria-haspopup="true"
                    aria-label="PDF"
                    title="PDF"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  {showPdfMenu && actionsReady && (
                    <PdfMenu
                      productModel={productModel}
                      modelId={model.id}
                      config={config}
                      customText={customText}
                      onClose={() => setShowPdfMenu(false)}
                      productName={productName}
                      productDescription={heroDescription}
                      productImageUrl={imagePath}
                    />
                  )}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      if (!actionsReady) return;
                      setShowShareMenu((prev) => !prev);
                      setShowPdfMenu(false);
                    }}
                    disabled={!actionsReady}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors ${
                      actionsReady
                        ? "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-brand-600"
                        : "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                    }`}
                    aria-expanded={showShareMenu}
                    aria-haspopup="true"
                    aria-label={shareTitle}
                    title={shareTitle}
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  {showShareMenu && actionsReady && (
                    <ShareMenu
                      productModel={productModel}
                      modelId={model.id}
                      config={config}
                      customText={customText}
                      onClose={() => setShowShareMenu(false)}
                    />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleStarClick}
                  disabled={!actionsReady}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors ${
                    !actionsReady
                      ? "border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed"
                      : isInMyList
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