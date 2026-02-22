import { useState } from "react";
import { RotateCcw, Share2, Star } from "lucide-react";
import type { ProductModel, ModelId, Configuration, CustomTextData } from "../types";
import { ShareMenu } from "./ShareMenu";
import { useTranslation } from "../i18n";

interface ActionButtonsProps {
  productModel: ProductModel;
  modelId?: ModelId;
  config: Configuration;
  customText?: CustomTextData | null;
  onReset: () => void;
  onAddToMyList: () => void;
  onRemoveFromMyList: () => void;
  isInMyList?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  productName?: string;
  productDescription?: string;
  productImageUrl?: string | null;
}

export function ActionButtons({
  productModel,
  modelId,
  config,
  customText,
  onReset,
  onAddToMyList,
  onRemoveFromMyList,
  isInMyList = false,
  disabled = false,
  disabledReason,
  productName,
  productDescription,
  productImageUrl,
}: ActionButtonsProps) {
  const { t } = useTranslation();
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleStarClick = () => {
    if (disabled) return;
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
    <div className="flex w-full flex-col gap-3">
      {disabled && disabledReason && (
        <p className="text-center text-xs font-medium text-slate-400">
          {disabledReason}
        </p>
      )}

      <div
        className={`flex w-full flex-wrap items-center justify-center gap-2 md:justify-start ${
          disabled ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {t("common.reset")}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setShowShareMenu((prev) => !prev)}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-sm border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed"
            aria-expanded={showShareMenu}
            aria-haspopup="true"
          >
            {t("common.share")}
            <Share2 className="h-3.5 w-3.5" />
          </button>

          {showShareMenu && !disabled && (
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
        </div>

        <button
          type="button"
          onClick={handleStarClick}
          disabled={disabled}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-sm border transition-colors disabled:cursor-not-allowed ${
            isInMyList
              ? "border-brand-600 bg-brand-600 text-white hover:bg-brand-700"
              : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-brand-600"
          }`}
          aria-label={starTitle}
          aria-pressed={isInMyList}
          title={starTitle}
        >
          <Star className={`h-4 w-4 ${isInMyList ? "fill-current" : ""}`} />
        </button>
      </div>
    </div>
  );
}