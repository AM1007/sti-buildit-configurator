// ============================================================================
// PRODUCT PREVIEW COMPONENT
// ============================================================================
//
// Grid of preview tiles showing current selections.
// Dynamic based on model's stepOrder.
//
// Interaction:
// - Click on tile → opens corresponding step in sidebar
//
// Layout:
// - Mobile: 2 columns
// - Tablet: 3 columns
// - Desktop: 4-6 columns depending on step count
//
// ============================================================================

import type { Configuration, ModelDefinition, StepId } from "../types";
import { PreviewTile } from "./PreviewTile";

// ============================================================================
// TYPES
// ============================================================================

interface ProductPreviewProps {
  /** Current model definition */
  model: ModelDefinition;

  /** Current configuration state */
  config: Configuration;

  /** Callback when user clicks tile to edit step */
  onEditStep: (stepId: StepId) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Determines grid columns based on step count.
 */
function getGridClasses(stepCount: number): string {
  if (stepCount <= 3) {
    return "grid-cols-2 md:grid-cols-3";
  }
  if (stepCount <= 4) {
    return "grid-cols-2 md:grid-cols-4";
  }
  if (stepCount <= 5) {
    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
  }
  // 6+ steps
  return "grid-cols-2 md:grid-cols-3 lg:grid-cols-6";
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Grid of preview tiles showing all current selections.
 *
 * Layout adapts to number of steps in the model:
 * - Stopper Stations: 6 tiles
 * - Indoor Push Buttons: 5 tiles
 * - Key Switches: 4 tiles
 * - etc.
 *
 * Interaction:
 * - Click tile → onEditStep callback → opens step in sidebar
 */
export function ProductPreview({ model, config, onEditStep }: ProductPreviewProps) {
  const gridClasses = getGridClasses(model.stepOrder.length);

  return (
    <div className="mb-6">
      {/* Preview Grid */}
      <div className={`grid ${gridClasses} gap-3 md:gap-4`}>
        {model.stepOrder.map((stepId) => {
          // Find the step data
          const step = model.steps.find((s) => s.id === stepId);
          if (!step) return null;

          // Get selected option ID from config
          const selectedOptionId = config[stepId];

          // Find the selected option details
          const selectedOption = step.options.find(
            (o) => o.id === selectedOptionId
          );

          return (
            <PreviewTile
              key={stepId}
              stepId={stepId}
              label={step.title}
              image={selectedOption?.image}
              selectedLabel={selectedOption?.label}
              isSelected={!!selectedOptionId}
              onEdit={onEditStep}
            />
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT PREVIEW (for My List page)
// ============================================================================

interface CompactPreviewProps {
  /** Current model definition */
  model: ModelDefinition;

  /** Current configuration state */
  config: Configuration;

  /** Max tiles to show (rest collapsed into "+N more") */
  maxTiles?: number;
}

/**
 * Compact version for My List items.
 * Shows limited tiles with "+N more" indicator.
 */
export function CompactPreview({
  model,
  config,
  maxTiles = 3,
}: CompactPreviewProps) {
  const visibleSteps = model.stepOrder.slice(0, maxTiles);
  const hiddenCount = model.stepOrder.length - maxTiles;

  return (
    <div className="flex gap-2 items-center">
      {visibleSteps.map((stepId) => {
        const step = model.steps.find((s) => s.id === stepId);
        const selectedOptionId = config[stepId];
        const selectedOption = step?.options.find(
          (o) => o.id === selectedOptionId
        );

        return (
          <div
            key={stepId}
            className="w-10 h-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center overflow-hidden"
            title={selectedOption?.label ?? step?.title}
          >
            {selectedOption?.image ? (
              <img
                src={selectedOption.image}
                alt=""
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
          </div>
        );
      })}

      {hiddenCount > 0 && (
        <span className="text-xs text-gray-500">+{hiddenCount} more</span>
      )}
    </div>
  );
}