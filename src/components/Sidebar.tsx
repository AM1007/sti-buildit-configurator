import type { Configuration, StepId, OptionId, ModelDefinition } from "../types";
import { StepSelector } from "./StepSelector";

interface SidebarProps {
  model: ModelDefinition;
  config: Configuration;
  currentStep: StepId | null;
  onSelectOption: (stepId: StepId, optionId: OptionId) => void;
  onClearOption: (stepId: StepId) => void;
  onSetCurrentStep: (stepId: StepId) => void;
  className?: string;
}

export function Sidebar({
  model,
  config,
  currentStep,
  onSelectOption,
  onClearOption,
  onSetCurrentStep,
  className = "",
}: SidebarProps) {
  const orderedSteps = model.stepOrder
    .map((stepId) => model.steps.find((s) => s.id === stepId))
    .filter((step): step is NonNullable<typeof step> => step !== undefined);

  return (
    <aside className={`bg-red-600 text-white flex flex-col h-full ${className}`}>
      <div className="p-5 lg:p-10 xl:p-16">
        <h3 className="mb-6">
          <span className="inline-block h-fit w-fit bg-black p-4 text-5xl font-bold text-white lg:text-7xl lg:-tracking-[0.175rem] 2xl:text-9xl">
            Build
          </span>
          <span className="inline-block py-4 pl-4 text-5xl font-bold text-black lg:pl-8 lg:text-7xl lg:-tracking-[0.175rem] 2xl:text-9xl">
            it
          </span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto px-5 lg:px-10 xl:px-16 pb-6">
        <div className="flex flex-col gap-1 lg:gap-2">
          {orderedSteps.map((step) => (
            <StepSelector
              key={step.id}
              step={step}
              isOpen={currentStep === step.id}
              selectedOptionId={config[step.id] ?? null}
              config={config}
              modelId={model.id}
              onSelect={(optionId) => onSelectOption(step.id, optionId)}
              onClear={() => onClearOption(step.id)}
              onToggle={() => onSetCurrentStep(step.id)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}