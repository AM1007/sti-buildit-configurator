import type { Configuration, StepId, OptionId, ModelDefinition, CustomTextData } from "../types";
import { StepSelector } from "./StepSelector";
import { CustomTextDisplay } from "./CustomTextDisplay";
import { hasSubmittedCustomText } from "../utils/customTextHelpers";
import { useModelTranslations } from "../hooks/useModelTranslations";
import { useTranslation } from "../i18n";

interface SidebarProps {
  model: ModelDefinition;
  config: Configuration;
  customText: CustomTextData | null;
  currentStep: StepId | null;
  completionPercent: number;
  completedSteps: number;
  totalSteps: number;
  onSelectOption: (stepId: StepId, optionId: OptionId) => void;
  onClearOption: (stepId: StepId) => void;
  onSetCurrentStep: (stepId: StepId) => void;
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
  onSelectOption,
  onClearOption,
  onSetCurrentStep,
  className = "",
}: SidebarProps) {
  const { getStepTitle, getOptionLabel } = useModelTranslations(model.id);

  const orderedSteps = model.stepOrder
    .map((stepId) => model.steps.find((s) => s.id === stepId))
    .filter((step): step is NonNullable<typeof step> => step !== undefined);

  const showCustomTextDisplay = hasSubmittedCustomText(model.id, config, customText);

  return (
    <aside className={`bg-brand-600 text-white flex flex-col h-full ${className}`}>
      <div className="p-5 md:p-8 xl:p-10 2xl:p-16">
        <h3 className="mb-4 xl:mb-6">
          <span className="inline-block h-fit w-fit bg-black p-4 text-5xl font-bold text-white md:text-6xl xl:text-7xl xl:-tracking-[0.175rem] 2xl:text-9xl">
            Build
          </span>
          <span className="inline-block py-4 pl-4 text-5xl font-bold text-black md:text-6xl xl:pl-8 xl:text-7xl xl:-tracking-[0.175rem] 2xl:text-9xl">
            it
          </span>
        </h3>

        {/* Progress indicator */}
        <ProgressBar
          completedSteps={completedSteps}
          totalSteps={totalSteps}
          completionPercent={completionPercent}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 xl:px-10 2xl:px-16 pb-6">
        <div className="flex flex-col gap-1 md:gap-2">
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
            <CustomTextDisplay customText={customText} />
          )}
        </div>
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
      <div className="flex items-center justify-between text-sm font-medium text-white/80">
        <span>
          {/* ASSUMPTION: i18n key "configurator.stepsCompleted" must be added.
              Fallback to interpolated string for now. */}
          {t("configurator.stepsCompleted", {
            completed: completedSteps.toString(),
            total: totalSteps.toString(),
          })}
        </span>
        <span>{clampedPercent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
        <div
          className="h-full rounded-full bg-white transition-all duration-300 ease-out"
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