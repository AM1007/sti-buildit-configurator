import type { Configuration, ModelDefinition, StepId } from "../types";
import { PreviewTile } from "./PreviewTile";

interface ProductPreviewProps {
  model: ModelDefinition;
  config: Configuration;
  onEditStep: (stepId: StepId) => void;
}

export function ProductPreview({ model, config, onEditStep }: ProductPreviewProps) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3 xl:gap-8 2xl:grid-cols-4">
      {model.stepOrder.map((stepId) => {
        const step = model.steps.find((s) => s.id === stepId);
        if (!step) return null;

        const isUniversalStopperEnglish =
          (model.id === "universal-stopper" || model.id === "low-profile-universal-stopper") &&
          stepId === "language" &&
          config.language === "EN";

        if (isUniversalStopperEnglish) {
          return null;
        }

        const selectedOptionId = config[stepId];
        const selectedOption = step.options.find((o) => o.id === selectedOptionId);

        return (
          <PreviewTile
            key={stepId}
            stepId={stepId}
            label={step.title}
            image={selectedOption?.image}
            isSelected={!!selectedOptionId}
            onEdit={onEditStep}
          />
        );
      })}
    </div>
  );
}