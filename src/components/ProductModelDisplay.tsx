import { Pencil } from "lucide-react";
import type { ProductModel, ModelDefinition, StepId, Configuration } from "../types";

interface ProductModelDisplayProps {
  model: ModelDefinition;
  productModel: ProductModel;
  config: Configuration;
  onEditStep: (stepId: StepId) => void;
}

export function ProductModelDisplay({
  model,
  productModel,
  config,
  onEditStep,
}: ProductModelDisplayProps) {
  const { parts, baseCode } = productModel;
  const { partsOrder, separatorMap } = model.productModelSchema;

  return (
    <div className="flex flex-wrap items-center gap-1 font-mono text-[15px] md:text-sm">
      <span className="font-medium text-slate-900">{baseCode}</span>

      {partsOrder.map((stepId, index) => {
        const value = parts[stepId] ?? "";
        const separator = separatorMap?.[stepId] ?? "";
        const isLabelStep = stepId === "label" || stepId === "installationOptions";
        const isEmpty = !value;
        const hasValue = !!value;

        const shouldHideEmptyLabel = isLabelStep && isEmpty && model.id !== "call-point-stopper";

        if (shouldHideEmptyLabel) {
          return null;
        }

        const isUniversalStopperEnglish =
          (model.id === "universal-stopper" || model.id === "low-profile-universal-stopper" || model.id === "enviro-stopper") &&
          stepId === "language" &&
          config.language === "EN";

        if (isUniversalStopperEnglish) {
          return null;
        }

        const isGlobalResetShield =
          model.id === "global-reset" &&
          stepId === "colour" &&
          config.cover === "21";

        if (isGlobalResetShield) {
          return null;
        }

        const isCallPointStopperHidden =
          model.id === "call-point-stopper" && (
            (stepId === "colour" && config.colour === "R") ||
            (stepId === "label" && ["FIRE", "EMERGENCY_DOOR", "EMERGENCY_OPERATE"].includes(config.label as string))
          );

        if (isCallPointStopperHidden) {
          return null;
        }

        const showSeparator = separator === "-" && index > 0;

        return (
          <div key={stepId} className="contents">
            {showSeparator && (
              <span className="text-slate-400">-</span>
            )}

            <button
              type="button"
              onClick={() => onEditStep(stepId)}
              className={`group relative min-w-10 rounded-sm border px-2.5 py-1.5 text-center transition-colors md:min-w-6 md:px-1.5 md:py-0.5 ${
                hasValue
                  ? "border-slate-300 bg-white text-slate-900 hover:border-slate-400"
                  : "border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300"
              }`}
            >
              {value || "?"}
              <span className="pointer-events-none absolute -right-1 -top-1 hidden text-slate-400 group-hover:block max-md:hidden!">
                <Pencil className="h-2.5 w-2.5" />
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}