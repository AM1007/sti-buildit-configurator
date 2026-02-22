import type { Configuration, StepId, OptionId, ModelDefinition, ProductModel, CustomTextData } from "../types";
import { StepSelector } from "./StepSelector";
import { CustomTextDisplay } from "./CustomTextDisplay";
import { ProductModelDisplay } from "./ProductModelDisplay";
import { hasSubmittedCustomText } from "../utils/customTextHelpers";
import { useModelTranslations } from "../hooks/useModelTranslations";
import { useTranslation } from "../i18n";
import { RotateCcw } from "lucide-react";

interface SidebarProps {
  model: ModelDefinition;
  config: Configuration;
  customText: CustomTextData | null;
  currentStep: StepId | null;
  completionPercent: number;
  completedSteps: number;
  totalSteps: number;
  productModel: ProductModel;
  onSelectOption: (stepId: StepId, optionId: OptionId) => void;
  onClearOption: (stepId: StepId) => void;
  onSetCurrentStep: (stepId: StepId) => void;
  onEditStep: (stepId: StepId) => void;
  onReset: () => void;
  className?: string;
}

export function Sidebar({
  model,
  config,
  customText,
  currentStep,
  completionPercent,
  completedSteps,
  totalSteps,
  productModel,
  onSelectOption,
  onClearOption,
  onSetCurrentStep,
  onEditStep,
  onReset,
  className = "",
}: SidebarProps) {
  const { getStepTitle, getOptionLabel } = useModelTranslations(model.id);
  const { t } = useTranslation();

  const orderedSteps = model.stepOrder
    .map((stepId) => model.steps.find((s) => s.id === stepId))
    .filter((step): step is NonNullable<typeof step> => step !== undefined);

  const showCustomTextDisplay = hasSubmittedCustomText(model.id, config, customText);

  return (
    <aside className={`flex flex-col gap-4 ${className}`}>
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            {t("configurator.configuration", { defaultValue: "Configuration" })}
          </h2>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-brand-600"
          >
            <RotateCcw className="h-3 w-3" />
            {t("common.reset")}
          </button>
        </div>

        <ProgressBar
          completedSteps={completedSteps}
          totalSteps={totalSteps}
          completionPercent={completionPercent}
        />

        <div className="mt-6 border-t border-slate-100 pt-4">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {t("configurator.productModel", { defaultValue: "Target SKU" })}
          </span>
          <ProductModelDisplay
            model={model}
            productModel={productModel}
            config={config}
            onEditStep={onEditStep}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        {orderedSteps.map((step, index) => (
          <StepSelector
            key={step.id}
            step={step}
            stepIndex={index + 1}
            totalSteps={totalSteps}
            isOpen={currentStep === step.id}
            isCompleted={!!config[step.id]}
            selectedOptionId={config[step.id] ?? null}
            config={config}
            modelId={model.id}
            onSelect={(optionId) => onSelectOption(step.id, optionId)}
            onClear={() => onClearOption(step.id)}
            onToggle={() => onSetCurrentStep(step.id)}
            getStepTitle={getStepTitle}
            getOptionLabel={getOptionLabel}
          />
        ))}

        {showCustomTextDisplay && customText && (
          <div className="border-t border-slate-100 p-4">
            <CustomTextDisplay customText={customText} />
          </div>
        )}
      </div>
    </aside>
  );
}

interface ProgressBarProps {
  completedSteps: number;
  totalSteps: number;
  completionPercent: number;
}

function ProgressBar({ completedSteps, totalSteps, completionPercent }: ProgressBarProps) {
  const { t } = useTranslation();
  const clampedPercent = Math.min(100, Math.max(0, completionPercent));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end justify-between">
        <span className="text-xs font-medium text-slate-500">
          {t("configurator.stepsCompleted", {
            completed: completedSteps.toString(),
            total: totalSteps.toString(),
          })}
        </span>
        <span className="font-mono text-xs text-slate-400">{clampedPercent}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
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
  );
}