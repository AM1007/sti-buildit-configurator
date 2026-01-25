import type { Step, OptionId, Configuration, ModelId } from "../types";
import { OptionCard } from "./OptionCard";
import { getOptionsWithAvailability } from "../filterOptions";
import { useTranslation } from "../i18n";

interface StepSelectorProps {
  step: Step;
  isOpen: boolean;
  selectedOptionId: OptionId | null;
  config: Configuration;
  modelId: ModelId;
  onSelect: (optionId: OptionId) => void;
  onClear: () => void;
  onToggle: () => void;
  getStepTitle?: (stepId: string) => string;
  getOptionLabel?: (stepId: string, optionId: string) => string;
}

function getGridClasses(optionCount: number): string {
  if (optionCount <= 3) {
    return "grid-cols-3";
  }
  if (optionCount <= 4) {
    return "grid-cols-3 lg:grid-cols-4";
  }
  return "grid-cols-3 lg:grid-cols-4";
}

export function StepSelector({
  step,
  isOpen,
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
  const gridClasses = getGridClasses(step.options.length);

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
    : t("configurator.noSelection");

  return (
    <div
      className={`
        box-border border-2 border-solid p-4 lg:p-5 transition-all duration-300
        ${isOpen ? "border-black bg-white" : "border-transparent border-b-white"}
      `}
    >
      <button
        type="button"
        className={`
          w-full flex flex-col gap-2 text-left focus-visible:outline-0
          ${isOpen ? "text-black" : "text-white"}
        `}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`step-${step.id}-content`}
      >
        <div className="flex w-full items-center justify-between gap-4">
          <h4 className="font-bold text-lg lg:text-2xl text-inherit transition-all duration-300">
            {title}
          </h4>
          <span
            className={`
              inline-grid text-lg leading-none text-inherit transition-all duration-300
              ${isOpen ? "rotate-180" : ""}
            `}
          >
            <ChevronIcon />
          </span>
        </div>
        <p className="font-normal text-base lg:text-md block w-full text-start text-inherit transition-all duration-300">
          {selectedLabel}
        </p>
      </button>

      <div
        className="overflow-hidden text-sm transition-all"
        style={{ display: isOpen ? "block" : "none" }}
      >
        <div className="mt-4 p-0">
          <div
            id={`step-${step.id}-content`}
            className={`grid ${gridClasses} gap-x-2.5 gap-y-3`}
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

function ChevronIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 47 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24.9441 33.6786L24.944 33.6787C24.3784 34.244 23.6356 34.5274 22.8944 34.5274C22.1535 34.5274 21.4108 34.2447 20.8448 33.6792L20.8447 33.679L6.11333 18.9473C6.1133 18.9473 6.11327 18.9473 6.11324 18.9472C4.98046 17.8149 4.98034 15.979 6.11322 14.8469L24.9441 33.6786ZM24.9441 33.6786L39.6757 18.9468C40.808 17.8145 40.8082 15.9785 39.6757 14.8464C38.5437 13.7144 36.7081 13.7145 35.5757 14.8463L35.5756 14.8464L22.8944 27.5284L10.2131 14.8469L10.213 14.8468C9.08074 13.715 7.2454 13.7148 6.1134 14.8467L24.9441 33.6786Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}