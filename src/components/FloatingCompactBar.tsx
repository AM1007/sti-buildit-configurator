import { Share2, Star } from "lucide-react";
import { useState } from "react";
import type { ProductModel, ModelId, Configuration, CustomTextData } from "../types";
import { ShareMenu } from "./ShareMenu";
import { useTranslation } from "../i18n";

interface FloatingCompactBarProps {
  productModel: ProductModel;
  modelId: ModelId;
  config: Configuration;
  customText: CustomTextData | null;
  completedSteps: number;
  totalSteps: number;
  imagePath: string | null;
  actionsReady: boolean;
  isInMyList: boolean;
  onAddToMyList: () => void;
  onRemoveFromMyList: () => void;
  productName?: string;
  productDescription?: string;
  productImageUrl?: string | null;
}

export function FloatingCompactBar({
  productModel,
  modelId,
  config,
  customText,
  completedSteps,
  totalSteps,
  imagePath,
  actionsReady,
  isInMyList,
  onAddToMyList,
  onRemoveFromMyList,
}: FloatingCompactBarProps) {
  const { t } = useTranslation();
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleStarClick = () => {
    if (isInMyList) {
      onRemoveFromMyList();
    } else {
      onAddToMyList();
    }
  };

  const starTitle = isInMyList
    ? t("configurator.removeFromMyList")
    : t("configurator.addToMyList");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-sm md:hidden">
      <div
        className={`mx-auto flex h-[76px] max-w-7xl items-center gap-3 px-4 ${
          productModel.isComplete ? "border-t-2 border-t-brand-600" : ""
        }`}
      >
        <div className="flex h-13 w-13 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
          {imagePath ? (
            <img
              alt={productModel.fullCode}
              src={imagePath}
              width="52"
              height="52"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-slate-200" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[13px] font-medium text-slate-800">
            {productModel.fullCode}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                productModel.isComplete ? "bg-green-500" : "bg-slate-300"
              }`}
            />
            {productModel.isComplete
              ? isInMyList
                ? t("configurator.inMyList", { defaultValue: "IN MY LIST" })
                : t("configurator.configured", { defaultValue: "CONFIGURED" })
              : `${completedSteps} / ${totalSteps}`}
          </p>
        </div>

        <div className="relative flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowShareMenu((prev) => !prev)}
            disabled={!actionsReady}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-sm border transition-colors ${
              actionsReady
                ? "border-slate-200 bg-white text-slate-500 active:bg-slate-50"
                : "border-slate-200 bg-slate-50 text-slate-300"
            }`}
            aria-expanded={showShareMenu}
            aria-haspopup="true"
            aria-label={t("common.share")}
          >
            <Share2 className="h-[18px] w-[18px]" />
          </button>

          {showShareMenu && actionsReady && (
            <ShareMenu
              productModel={productModel}
              modelId={modelId}
              config={config}
              customText={customText}
              onClose={() => setShowShareMenu(false)}
            />
          )}

          <button
            type="button"
            onClick={actionsReady ? handleStarClick : undefined}
            disabled={!actionsReady}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-sm border transition-colors ${
              !actionsReady
                ? "border-slate-200 bg-slate-50 text-slate-300"
                : isInMyList
                  ? "border-brand-600 bg-brand-600 text-white active:bg-brand-700"
                  : "border-slate-200 bg-white text-slate-500 active:bg-slate-50"
            }`}
            aria-label={starTitle}
            aria-pressed={isInMyList}
          >
            <Star className={`h-[18px] w-[18px] ${isInMyList ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}