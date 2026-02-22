import type { Option } from "../types";

interface OptionCardProps {
  option: Option;
  isSelected: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
  onSelect: () => void;
  label?: string;
}

export function OptionCard({
  option,
  isSelected,
  isAvailable,
  unavailableReason,
  onSelect,
  label,
}: OptionCardProps) {
  const displayLabel = label ?? option.label;

  return (
    <div
      className={`
        flex cursor-pointer flex-col gap-1 rounded-sm border p-1.5 transition-all duration-200
        ${isSelected
          ? "border-brand-600 bg-white"
          : "border-slate-200 bg-slate-50 hover:border-slate-300"
        }
        ${!isAvailable ? "cursor-not-allowed opacity-40" : ""}
      `}
      aria-disabled={!isAvailable}
      aria-selected={isSelected}
      title={!isAvailable ? unavailableReason : undefined}
      onClick={isAvailable ? onSelect : undefined}
      role="option"
    >
      {option.image && (
        <div className="max-h-[9.37rem]">
          <img
            alt={displayLabel}
            loading="lazy"
            width="150"
            height="150"
            className={`
              h-full w-full select-none object-contain
              ${!isAvailable ? "grayscale" : ""}
            `}
            src={option.image}
          />
        </div>
      )}
      <span className="text-center text-xs font-medium text-slate-700 wrap-break-word">
        {displayLabel}
      </span>
      {option.notes && (
        <span className="text-center text-[10px] font-medium text-yellow-600">
          {option.notes}
        </span>
      )}
    </div>
  );
}