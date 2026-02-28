import { useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import type { SavedConfiguration } from "../types";
import { MODEL_NAMES } from "../types";
import { getModelById } from "../data/models";
import { buildShareableUrl } from "../utils/configSerializer";
import { getCompletedDeviceImage } from "../utils/getCompletedDeviceImage";
import { formatCustomTextInline } from "../utils/customTextHelpers";
import { useTranslation } from "../i18n";

interface SpecificationMobileListProps {
  items: SavedConfiguration[];
  onQtyChange: (id: string, qty: number) => void;
  onNoteChange: (id: string, note: string) => void;
  onViewDetails: (id: string) => void;
  onRemove: (id: string) => void;
}

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

  const { imagePath } = getCompletedDeviceImage({
    fullCode: item.productCode,
    modelId: item.modelId,
    config: item.configuration,
    isComplete: true,
  });

  return (
    <div className="border border-slate-200 rounded-sm bg-white p-3">
      <div className="flex gap-3 mb-2">
        <div className="h-14 w-14 shrink-0 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-center overflow-hidden">
          {imagePath ? (
            <img
              src={imagePath}
              alt={item.productCode}
              className="object-contain w-full h-full"
              loading="lazy"
            />
          ) : (
            <span className="text-slate-300 text-[9px] text-center leading-tight">No img</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            to={configuratorUrl}
            className={`text-[10px] font-mono block mb-0.5 truncate ${
              isCustomBuilt
                ? "text-blue-600"
                : "text-slate-600"
            }`}
          >
            {item.productCode}
          </Link>
          <span className="text-xs font-medium text-slate-900 block truncate">
            {modelName}
          </span>
          {item.customText?.submitted && (
            <span className="text-[10px] text-slate-400 block truncate">
              {formatCustomTextInline(item.customText)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="text-slate-500 hover:text-red-600 transition-colors p-1 shrink-0 self-start"
          aria-label={t("myList.removeItem")}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

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