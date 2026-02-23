import { Check } from "lucide-react";
import type { Option } from "../types";
import { useTranslation } from "../i18n";
import { useIsMobile } from "../hooks/useMediaQuery";

interface OptionCardProps {
  option: Option;
  isSelected: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
  onSelect: () => void;
  label?: string;
}

const NOTES_KEY_MAP: Record<string, string> = {
  "EXTENDED LEAD TIMES": "notes.EXTENDED_LEAD_TIMES",
  "NOT UL LISTED": "notes.NOT_UL_LISTED",
  "NON-RETURNABLE": "notes.NON-RETURNABLE",
};

function parseLabel(label: string): { code: string | null; name: string } {
  const match = label.match(/^#(\S+)\s+(.+)$/);
  if (match) {
    return { code: match[1], name: match[2] };
  }
  if (label.startsWith("#")) {
    return { code: label.slice(1), name: "" };
  }
  return { code: null, name: label };
}

export function OptionCard({
  option,
  isSelected,
  isAvailable,
  unavailableReason,
  onSelect,
  label,
}: OptionCardProps) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const displayLabel = label ?? option.label;
  const { code, name } = parseLabel(displayLabel);

  const noteKey = option.notes ? NOTES_KEY_MAP[option.notes] : null;
  const noteText = noteKey ? t(noteKey) : option.notes;

  const fullTooltip = !isAvailable
    ? unavailableReason
    : name.length > 40
      ? displayLabel
      : undefined;

  if (isMobile) {
    return (
      <div
        className={`
          flex min-h-14 cursor-pointer items-center gap-3 rounded-sm border px-3 py-2.5
          transition-all duration-150
          ${isSelected
            ? "border-brand-600 bg-white ring-1 ring-brand-600/20"
            : "border-slate-200 bg-white active:border-slate-300"
          }
          ${!isAvailable ? "cursor-not-allowed opacity-40" : ""}
        `}
        aria-disabled={!isAvailable}
        aria-selected={isSelected}
        title={fullTooltip}
        onClick={isAvailable ? onSelect : undefined}
        role="option"
      >
        {option.image && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-slate-50">
            <img
              alt={displayLabel}
              loading="lazy"
              width="48"
              height="48"
              className={`
                h-full w-full select-none object-contain
                ${!isAvailable ? "grayscale" : ""}
              `}
              src={option.image}
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          {code && (
            <span className="font-mono text-[10px] leading-tight text-slate-400">
              {code}
            </span>
          )}
          {name && (
            <span className="text-sm leading-snug font-medium text-slate-700">
              {name}
            </span>
          )}
          {noteText && (
            <span className="mt-0.5 inline-flex self-start rounded-sm bg-amber-50 px-1 py-0.5 text-[9px] font-semibold leading-tight text-amber-700">
              {noteText}
            </span>
          )}
        </div>

        <div
          className={`
            flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2
            ${isSelected
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-slate-200"
            }
          `}
        >
          {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        flex cursor-pointer flex-col rounded-sm border transition-all duration-150
        ${isSelected
          ? "border-brand-600 bg-white ring-1 ring-brand-600/20"
          : "border-slate-200 bg-white hover:border-slate-300"
        }
        ${!isAvailable ? "cursor-not-allowed opacity-40" : ""}
      `}
      aria-disabled={!isAvailable}
      aria-selected={isSelected}
      title={fullTooltip}
      onClick={isAvailable ? onSelect : undefined}
      role="option"
    >
      {option.image && (
        <div className="flex items-center justify-center overflow-hidden bg-slate-50 p-1.5">
          <img
            alt={displayLabel}
            loading="lazy"
            width="150"
            height="150"
            className={`
              h-auto max-h-28 w-full select-none object-contain
              ${!isAvailable ? "grayscale" : ""}
            `}
            src={option.image}
          />
        </div>
      )}

      <div className="flex h-[100px] flex-col gap-0.5 px-1.5 pt-3.5 pb-1.5">
        {code && (
          <span className="font-mono text-[10px] leading-tight text-slate-400">
            {code}
          </span>
        )}
        {name && (
          <span className="line-clamp-3 text-xs leading-snug font-medium text-slate-700">
            {name}
          </span>
        )}
        {noteText && (
          <span className="mt-auto inline-flex self-start rounded-sm bg-amber-50 px-1 py-0.5 text-[9px] font-semibold leading-tight text-amber-700">
            {noteText}
          </span>
        )}
      </div>
    </div>
  );
}