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
        flex cursor-pointer flex-col gap-1 transition-all duration-300
        border border-solid
        ${isSelected ? "border-black" : "border-transparent"}
        ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}
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
      <span className="font-normal text-sm wrap-break-word text-center transition-all duration-0 text-black">
        {displayLabel}
      </span>
      {option.notes && (
        <span className="text-xs text-yellow-600 text-center font-medium">
          {option.notes}
        </span>
      )}
    </div>
  );
}