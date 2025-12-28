// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================
//
// Left panel of the configurator containing:
// - "Build it" logo/header
// - Dynamic step accordions based on current model
//
// Responsive:
// - Desktop: Fixed width sidebar (w-96 = 384px)
// - Mobile: Full-width, accordion/drawer behavior (handled by parent)
//
// ============================================================================

import type { Configuration, StepId, OptionId, ModelDefinition } from "../types";
import { StepSelector } from "./StepSelector";

// ============================================================================
// TYPES
// ============================================================================

interface SidebarProps {
  /** Current model definition */
  model: ModelDefinition;

  /** Current configuration state */
  config: Configuration;

  /** Which step accordion is currently open */
  currentStep: StepId | null;

  /** Callback when an option is selected */
  onSelectOption: (stepId: StepId, optionId: OptionId) => void;

  /** Callback when an option is cleared (deselected) */
  onClearOption: (stepId: StepId) => void;

  /** Callback when step accordion is toggled */
  onSetCurrentStep: (stepId: StepId) => void;

  /** Optional: additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Left sidebar with step accordions.
 *
 * Layout (Desktop):
 * - Fixed width (w-96 = 384px)
 * - Red background
 * - "Build it" header at top
 * - Scrollable list of StepSelector components
 *
 * Layout (Mobile):
 * - Full width
 * - Controlled by parent component
 */
export function Sidebar({
  model,
  config,
  currentStep,
  onSelectOption,
  onClearOption,
  onSetCurrentStep,
  className = "",
}: SidebarProps) {
  // Get steps in display order from model
  const orderedSteps = model.stepOrder
    .map((stepId) => model.steps.find((s) => s.id === stepId))
    .filter((step): step is NonNullable<typeof step> => step !== undefined);

  return (
    <aside
      className={`bg-red-700 text-white flex flex-col h-full ${className}`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="text-4xl font-bold">
          Build <span className="text-black bg-white px-2">it</span>
        </h1>
        {/* Model name subtitle */}
        <p className="text-sm text-red-200 mt-2 truncate" title={model.name}>
          {model.name}
        </p>
      </div>

      {/* Steps List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-2">
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

// ============================================================================
// SIDEBAR HEADER (reusable for mobile)
// ============================================================================

interface SidebarHeaderProps {
  modelName: string;
}

/**
 * Standalone header component for use in mobile layouts.
 */
export function SidebarHeader({ modelName }: SidebarHeaderProps) {
  return (
    <div className="p-6 pb-4 bg-red-700 text-white">
      <h1 className="text-4xl font-bold">
        Build <span className="text-black bg-white px-2">it</span>
      </h1>
      <p className="text-sm text-red-200 mt-2 truncate" title={modelName}>
        {modelName}
      </p>
    </div>
  );
}