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
  productName,
  productDescription,
  productImageUrl,
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
        className={`mx-auto flex h-[72px] max-w-7xl items-center gap-3 px-4 ${
          productModel.isComplete ? "border-t-2 border-t-brand-600" : ""
        }`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
          {imagePath ? (
            <img
              alt={productModel.fullCode}
              src={imagePath}
              width="48"
              height="48"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-slate-200" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs font-medium text-slate-800">
            {productModel.fullCode}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
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
            className={`inline-flex h-10 w-10 items-center justify-center rounded-sm border transition-colors ${
              actionsReady
                ? "border-slate-200 bg-white text-slate-500 active:bg-slate-50"
                : "border-slate-100 bg-slate-50 text-slate-200"
            }`}
            aria-expanded={showShareMenu}
            aria-haspopup="true"
            aria-label={t("common.share")}
          >
            <Share2 className="h-4 w-4" />
          </button>

          {showShareMenu && actionsReady && (
            <ShareMenu
              productModel={productModel}
              modelId={modelId}
              config={config}
              customText={customText}
              onClose={() => setShowShareMenu(false)}
              productName={productName}
              productDescription={productDescription}
              productImageUrl={productImageUrl}
            />
          )}

          <button
            type="button"
            onClick={actionsReady ? handleStarClick : undefined}
            disabled={!actionsReady}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-sm border transition-colors ${
              !actionsReady
                ? "border-slate-100 bg-slate-50 text-slate-200"
                : isInMyList
                  ? "border-brand-600 bg-brand-600 text-white active:bg-brand-700"
                  : "border-slate-200 bg-white text-slate-500 active:bg-slate-50"
            }`}
            aria-label={starTitle}
            aria-pressed={isInMyList}
          >
            <Star className={`h-4 w-4 ${isInMyList ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}