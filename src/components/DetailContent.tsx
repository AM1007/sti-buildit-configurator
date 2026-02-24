import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Clipboard, Check } from "lucide-react";
import type { SavedConfiguration } from "../types";
import { MODEL_NAMES } from "../types";
import { getModelById } from "../data/models";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";
import { buildShareableUrl } from "../utils/configSerializer";
import { useModelTranslations } from "../hooks/useModelTranslations";
import { useTranslation } from "../i18n";

// -----------------------------------------------------------------------------
// Shared helper
// -----------------------------------------------------------------------------

export function isCustomBuiltItem(item: SavedConfiguration): boolean {
  return Object.values(item.configuration).some((v) => v !== null);
}

export function buildItemConfiguratorUrl(item: SavedConfiguration): string {
  const model = getModelById(item.modelId);
  if (!model) return "/";
  return buildShareableUrl(
    `/configurator/${model.slug}`,
    model.id,
    item.configuration,
    item.customText
  );
}

// -----------------------------------------------------------------------------
// Header
// -----------------------------------------------------------------------------

interface DetailHeaderProps {
  item: SavedConfiguration;
  onClose: () => void;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function DetailHeader({ item, onClose, closeButtonRef }: DetailHeaderProps) {
  const { t } = useTranslation();
  const modelName = MODEL_NAMES[item.modelId] ?? item.modelId;
  const isCustom = isCustomBuiltItem(item);

  return (
    <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <CopySku sku={item.productCode} />
          <span
            className={`px-1.5 py-0.5 rounded-sm text-[9px] font-semibold tracking-wider uppercase border ${
              isCustom
                ? "bg-blue-50 border-blue-100 text-blue-700"
                : "bg-slate-100 border-slate-200 text-slate-600"
            }`}
          >
            {isCustom ? t("drawer.customBuilt") : t("drawer.standardProduct")}
          </span>
        </div>
        <h2 className="text-sm font-medium text-slate-900">{modelName}</h2>
      </div>
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-slate-900 rounded-sm hover:bg-slate-200 transition-colors"
        aria-label={t("common.close")}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Scrollable Body
// -----------------------------------------------------------------------------

interface DetailBodyProps {
  item: SavedConfiguration;
}

export function DetailBody({ item }: DetailBodyProps) {
  const isCustom = isCustomBuiltItem(item);

  const { imagePath } = getCompletedDeviceImage({
    fullCode: item.productCode,
    modelId: item.modelId,
    config: item.configuration,
    isComplete: true,
  });

  return (
    <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
      {/* Image */}
      <div className="aspect-4/3 w-full bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-center overflow-hidden">
        {imagePath ? (
          <img
            src={imagePath}
            alt={item.productCode}
            className="object-contain w-full h-full"
            loading="lazy"
          />
        ) : (
          <span className="text-slate-300 text-sm">No preview</span>
        )}
      </div>

      {/* Configuration Summary or Product Details */}
      {isCustom ? (
        <ConfigurationSummary item={item} />
      ) : (
        <ProductDetails modelId={item.modelId} />
      )}

      {/* Project Info */}
      <ProjectInfo qty={item.qty} note={item.note} />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Footer
// -----------------------------------------------------------------------------

interface DetailFooterProps {
  item: SavedConfiguration;
  onClose: () => void;
  onRemove: (id: string) => void;
}

export function DetailFooter({ item, onClose, onRemove }: DetailFooterProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isCustom = isCustomBuiltItem(item);

  const configuratorUrl = useMemo(() => buildItemConfiguratorUrl(item), [item]);

  const handleOpenInConfigurator = () => {
    onClose();
    navigate(configuratorUrl);
  };

  const handleRemove = () => {
    onRemove(item.id);
    onClose();
  };

  return (
    <div className="p-5 border-t border-slate-200 bg-slate-50 flex flex-col gap-2">
      <button
        type="button"
        onClick={handleOpenInConfigurator}
        className="w-full py-2 bg-white border border-slate-300 text-slate-900 text-xs font-medium rounded-sm hover:bg-slate-50 hover:border-slate-400 transition-colors flex items-center justify-center gap-1.5"
      >
        {isCustom
          ? t("myList.openInConfigurator")
          : t("myList.viewProductPage")}
      </button>
      <button
        type="button"
        onClick={handleRemove}
        className="w-full py-2 text-red-600 text-xs font-medium rounded-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
      >
        {t("myList.removeFromProject")}
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Configuration Summary (Custom Built)
// -----------------------------------------------------------------------------

function ConfigurationSummary({ item }: { item: SavedConfiguration }) {
  const { t } = useTranslation();
  const { getStepTitle, getOptionLabel, isLoaded } = useModelTranslations(item.modelId);
  const model = getModelById(item.modelId);

  const entries = useMemo(() => {
    if (!model || !isLoaded) return [];

    return model.stepOrder
      .filter((stepId) => item.configuration[stepId] !== null && item.configuration[stepId] !== undefined)
      .map((stepId) => ({
        stepId,
        label: getStepTitle(stepId),
        value: getOptionLabel(stepId, item.configuration[stepId]!),
      }));
  }, [model, item.configuration, getStepTitle, getOptionLabel, isLoaded]);

  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
        {t("drawer.configurationSummary")}
      </h3>
      <div className="border border-slate-200 rounded-sm divide-y divide-slate-100 bg-white">
        {entries.length === 0 && !isLoaded ? (
          <div className="py-3 px-3 text-xs text-slate-400">{t("common.loading")}</div>
        ) : (
          entries.map((entry, index) => (
            <div
              key={entry.stepId}
              className={`flex justify-between py-2 px-3 ${
                index % 2 === 1 ? "bg-slate-50" : ""
              }`}
            >
              <span className="text-xs text-slate-500">{entry.label}</span>
              <span className="text-xs font-medium text-slate-900">{entry.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Product Details (Standard)
// ASSUMPTION: Standard products currently have no structured metadata
// (category, certification, material). Showing model name and ID as fallback.
// When catalog metadata is available, this section should be extended.
// -----------------------------------------------------------------------------

function ProductDetails({ modelId }: { modelId: string }) {
  const { t } = useTranslation();
  const { meta, isLoaded } = useModelTranslations(modelId);

  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
        {t("drawer.productDetails")}
      </h3>
      <div className="border border-slate-200 rounded-sm divide-y divide-slate-100 bg-white">
        {!isLoaded ? (
          <div className="py-3 px-3 text-xs text-slate-400">{t("common.loading")}</div>
        ) : (
          <>
            <div className="flex justify-between py-2 px-3">
              <span className="text-xs text-slate-500">Category</span>
              <span className="text-xs font-medium text-slate-900">
                {meta?.series ?? MODEL_NAMES[modelId as keyof typeof MODEL_NAMES] ?? modelId}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Project Info (read-only)
// -----------------------------------------------------------------------------

function ProjectInfo({ qty, note }: { qty: number; note: string }) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
        {t("drawer.projectInfo")}
      </h3>
      <div className="flex flex-col gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            {t("drawer.quantityAssigned")}
          </span>
          <span className="text-xs font-mono font-medium text-slate-900 bg-slate-50 border border-slate-200 px-2 py-1 rounded-sm inline-block">
            {qty} {t("drawer.units")}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            {t("drawer.attachedNote")}
          </span>
          <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-sm leading-relaxed">
            {note || t("drawer.noNote")}
          </p>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Copy SKU (minimal: clipboard + tooltip)
// -----------------------------------------------------------------------------

function CopySku({ sku }: { sku: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sku);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable — silent fail
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 group/sku"
      title={copied ? t("myList.skuCopied") : t("common.copy")}
    >
      <span className="text-xs font-mono text-slate-900">{sku}</span>
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Clipboard className="h-3 w-3 text-slate-300 opacity-0 group-hover/sku:opacity-100 transition-opacity" />
      )}
    </button>
  );
}