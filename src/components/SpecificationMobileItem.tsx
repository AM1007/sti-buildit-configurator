import { useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import type { SavedConfiguration } from "../types";
import { MODEL_NAMES } from "../types";
import { getModelById } from "../data/models";
import { buildShareableUrl } from "../utils/configSerializer";
import { useTranslation } from "../i18n";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface SpecificationMobileListProps {
  items: SavedConfiguration[];
  onQtyChange: (id: string, qty: number) => void;
  onNoteChange: (id: string, note: string) => void;
  onViewDetails: (id: string) => void;
  onRemove: (id: string) => void;
}

// -----------------------------------------------------------------------------
// List (mobile only — caller wraps with md:hidden)
// -----------------------------------------------------------------------------

export function SpecificationMobileList({
  items,
  onQtyChange,
  onNoteChange,
  onViewDetails,
  onRemove,
}: SpecificationMobileListProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <SpecificationMobileItem
          key={item.id}
          item={item}
          onQtyChange={onQtyChange}
          onNoteChange={onNoteChange}
          onViewDetails={onViewDetails}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Single Item Block
// -----------------------------------------------------------------------------

interface SpecificationMobileItemProps {
  item: SavedConfiguration;
  onQtyChange: (id: string, qty: number) => void;
  onNoteChange: (id: string, note: string) => void;
  onViewDetails: (id: string) => void;
  onRemove: (id: string) => void;
}

function SpecificationMobileItem({
  item,
  onQtyChange,
  onNoteChange,
  onViewDetails,
  onRemove,
}: SpecificationMobileItemProps) {
  const { t } = useTranslation();
  const modelName = MODEL_NAMES[item.modelId] ?? item.modelId;
  const isCustomBuilt = Object.values(item.configuration).some((v) => v !== null);

  const configuratorUrl = buildItemConfiguratorUrl(item);

  return (
    <div className="border border-slate-200 rounded-sm bg-white p-3">
      {/* Header: SKU + Model Name + Remove */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <Link
            to={configuratorUrl}
            className={`text-[10px] font-mono block mb-0.5 ${
              isCustomBuilt
                ? "text-blue-600"
                : "text-slate-600"
            }`}
          >
            {item.productCode}
          </Link>
          <span className="text-xs font-medium text-slate-900">
            {modelName}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="text-slate-300 hover:text-red-600 transition-colors p-1"
          aria-label={t("myList.removeItem")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Qty + Note inputs */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="col-span-1">
          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            {t("specTable.qty")}
          </label>
          <MobileQtyInput
            id={item.id}
            value={item.qty}
            onChange={onQtyChange}
          />
        </div>
        <div className="col-span-2">
          <label className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
            {t("specTable.note")}
          </label>
          <MobileNoteInput
            id={item.id}
            value={item.note}
            placeholder={t("myList.notePlaceholder")}
            onChange={onNoteChange}
          />
        </div>
      </div>

      {/* View Details button */}
      <button
        type="button"
        onClick={() => onViewDetails(item.id)}
        className="w-full py-1.5 bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-600 rounded-sm flex items-center justify-center gap-1.5 hover:bg-slate-100 transition-colors"
      >
        {t("productCard.viewDetails")}
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Mobile Qty Input
// -----------------------------------------------------------------------------

interface MobileQtyInputProps {
  id: string;
  value: number;
  onChange: (id: string, qty: number) => void;
}

function MobileQtyInput({ id, value, onChange }: MobileQtyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parseInt(e.target.value, 10);
      if (!Number.isNaN(parsed)) {
        onChange(id, parsed);
      }
    },
    [id, onChange]
  );

  const handleBlur = useCallback(() => {
    if (inputRef.current) {
      const parsed = parseInt(inputRef.current.value, 10);
      if (Number.isNaN(parsed) || parsed < 1) {
        onChange(id, 1);
      }
    }
  }, [id, onChange]);

  return (
    <input
      ref={inputRef}
      type="number"
      min={1}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2 py-1 text-xs font-mono text-slate-900 outline-none focus:border-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}

// -----------------------------------------------------------------------------
// Mobile Note Input
// -----------------------------------------------------------------------------

interface MobileNoteInputProps {
  id: string;
  value: string;
  placeholder: string;
  onChange: (id: string, note: string) => void;
}

function MobileNoteInput({ id, value, placeholder, onChange }: MobileNoteInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(id, e.target.value);
    },
    [id, onChange]
  );

  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      className="w-full bg-slate-50 border border-slate-200 rounded-sm px-2 py-1 text-xs text-slate-600 outline-none focus:border-slate-400 placeholder:text-slate-300"
    />
  );
}

// -----------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------

function buildItemConfiguratorUrl(item: SavedConfiguration): string {
  const model = getModelById(item.modelId);
  if (!model) return "/";

  return buildShareableUrl(
    `/configurator/${model.slug}`,
    model.id,
    item.configuration,
    item.customText
  );
}