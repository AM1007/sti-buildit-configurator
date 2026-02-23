import type { Step, OptionId, Configuration, ModelId } from "../types";
import { OptionCard } from "./OptionCard";
import { getOptionsWithAvailability } from "../filterOptions";
import { useTranslation } from "../i18n";
import { ChevronDown, ChevronRight, Check } from "lucide-react";

interface StepSelectorProps {
  step: Step;
  stepIndex: number;
  totalSteps: number;
  isOpen: boolean;
  isCompleted: boolean;
  selectedOptionId: OptionId | null;
  config: Configuration;
  modelId: ModelId;
  onSelect: (optionId: OptionId) => void;
  onClear: () => void;
  onToggle: () => void;
  getStepTitle?: (stepId: string) => string;
  getOptionLabel?: (stepId: string, optionId: string) => string;
}

function formatStepNumber(index: number): string {
  return index.toString().padStart(2, "0");
}

export function StepSelector({
  step,
  stepIndex,
  isOpen,
  isCompleted,
  selectedOptionId,
  config,
  modelId,
  onSelect,
  onClear,
  onToggle,
  getStepTitle,
  getOptionLabel,
}: StepSelectorProps) {
  const { t } = useTranslation();
  const selectedOption = step.options.find((o) => o.id === selectedOptionId);
  const optionsWithStatus = getOptionsWithAvailability(step, config, modelId);

  const handleOptionClick = (optionId: OptionId) => {
    if (optionId === selectedOptionId) {
      onClear();
    } else {
      onSelect(optionId);
    }
  };

  const title = getStepTitle ? getStepTitle(step.id) : step.title;
  const selectedLabel = selectedOption
    ? (getOptionLabel ? getOptionLabel(step.id, selectedOption.id) : selectedOption.label)
    : null;

  return (
    <div className={`relative ${stepIndex > 1 ? "border-t border-slate-100" : ""}`}>
      {isOpen && (
        <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-brand-600" />
      )}

      <button
        type="button"
        className="group flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`step-${step.id}-content`}
      >
        <div className="flex items-center gap-3">
          <StepIndicator
            stepIndex={stepIndex}
            isOpen={isOpen}
            isCompleted={isCompleted}
          />
          <div className="flex flex-col">
            <span
              className={`text-sm font-medium transition-colors ${
                isOpen
                  ? "text-slate-900"
                  : isCompleted
                    ? "text-slate-700"
                    : "text-slate-500 group-hover:text-slate-700"
              }`}
            >
              {title}
            </span>
            {!isOpen && selectedLabel && (
              <span className="mt-0.5 text-xs text-slate-400">
                {selectedLabel}
              </span>
            )}
            {!isOpen && !selectedLabel && (
              <span className="mt-0.5 text-xs italic text-slate-300">
                {t("configurator.noSelection")}
              </span>
            )}
          </div>
        </div>

        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
        )}
      </button>

      <div
        className="overflow-hidden transition-all"
        style={{ display: isOpen ? "block" : "none" }}
      >
        <div className="px-3 pb-6 pl-9 md:px-4 md:pl-11">
          <div
            id={`step-${step.id}-content`}
            className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3"
            role="listbox"
            aria-label={`${title} options`}
          >
            {optionsWithStatus.map(({ option, availability }) => (
              <OptionCard
                key={option.id}
                option={option}
                isSelected={option.id === selectedOptionId}
                isAvailable={availability.available}
                unavailableReason={availability.reason}
                onSelect={() => handleOptionClick(option.id)}
                label={getOptionLabel ? getOptionLabel(step.id, option.id) : option.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  stepIndex: number;
  isOpen: boolean;
  isCompleted: boolean;
}

function StepIndicator({ stepIndex, isOpen, isCompleted }: StepIndicatorProps) {
  if (isCompleted && !isOpen) {
    return (
      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-brand-600 bg-brand-600 text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
    );
  }

  if (isOpen) {
    return (
      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-brand-600 bg-red-50 font-mono text-[10px] font-medium text-brand-600">
        {formatStepNumber(stepIndex)}
      </span>
    );
  }

  return (
    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-slate-200 font-mono text-[10px] font-medium text-slate-400 group-hover:border-slate-300">
      {formatStepNumber(stepIndex)}
    </span>
  );
}