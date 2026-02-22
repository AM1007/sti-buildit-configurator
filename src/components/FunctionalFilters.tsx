import { useState } from "react";
import { Filter, ChevronDown, SlidersHorizontal, CloudRain, Volume2, RotateCcw, Flame, KeyRound } from "lucide-react";
import type { FunctionalTag } from "../data/catalog";
import { FUNCTIONAL_TAGS } from "../utils/filterProducts";
import { useTranslation } from "../i18n";
import { FilterBottomSheet } from "./FilterBottomSheet";
import { FilterDropdown } from "./FilterDropdown";

const LABEL_KEYS: Record<FunctionalTag, string> = {
  "weather-rated": "filter.weatherRated",
  "sounder": "filter.sounder",
  "reset-device": "filter.resetDevice",
  "fire-alarm": "filter.fireAlarm",
  "key-operated": "filter.keyOperated",
};

const ICON_MAP: Record<FunctionalTag, React.ComponentType<{ className?: string }>> = {
  "weather-rated": CloudRain,
  "sounder": Volume2,
  "reset-device": RotateCcw,
  "fire-alarm": Flame,
  "key-operated": KeyRound,
};

interface FunctionalFiltersProps {
  selected: Set<FunctionalTag>;
  counts: Record<FunctionalTag, number>;
  onToggle: (tag: FunctionalTag) => void;
  onClear: () => void;
}

function CheckboxGrid({
  selected,
  counts,
  onToggle,
  t,
}: {
  selected: Set<FunctionalTag>;
  counts: Record<FunctionalTag, number>;
  onToggle: (tag: FunctionalTag) => void;
  t: (key: string) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {FUNCTIONAL_TAGS.map((tag) => {
        const isActive = selected.has(tag);
        const count = counts[tag];
        const isDisabled = count === 0 && !isActive;
        const Icon = ICON_MAP[tag];

        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            disabled={isDisabled}
            aria-pressed={isActive}
            className={`flex items-center gap-2 rounded-sm border px-3 py-2.5 text-xs font-medium transition-colors ${
              isDisabled
                ? "cursor-not-allowed border-slate-200 text-slate-300"
                : isActive
                  ? "border-brand-600 text-brand-600"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{t(LABEL_KEYS[tag])}</span>
          </button>
        );
      })}
    </div>
  );
}

export function FunctionalFilters({ selected, counts, onToggle, onClear }: FunctionalFiltersProps) {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const activeCount = selected.size;

  return (
    <>
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex h-9 w-full items-center gap-2 rounded-sm border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{t("filter.specs")}</span>
          {activeCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-sm bg-brand-600 px-1 text-[10px] font-semibold text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown className="ml-auto h-3 w-3 shrink-0 text-slate-400" />
        </button>

        <FilterBottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={t("filter.specs")}
          activeCount={activeCount}
          onClear={onClear}
        >
          <CheckboxGrid selected={selected} counts={counts} onToggle={onToggle} t={t} />
        </FilterBottomSheet>
      </div>

      <div className="relative hidden md:block xl:hidden">
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex h-9 items-center gap-2 rounded-sm border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          {t("filter.specs")}
          {activeCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-sm bg-brand-600 px-1 text-[10px] font-semibold text-white">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={`ml-auto h-3 w-3 text-slate-400 transition-transform duration-150 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <FilterDropdown
          open={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
          title={t("filter.specs")}
          activeCount={activeCount}
          onClear={onClear}
        >
          <CheckboxGrid selected={selected} counts={counts} onToggle={onToggle} t={t} />
        </FilterDropdown>
      </div>

      <div className="hidden xl:flex items-center gap-2">
        <div className="mr-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          {t("filter.label")}
        </div>

        {FUNCTIONAL_TAGS.map((tag) => {
          const isActive = selected.has(tag);
          const count = counts[tag];
          const isDisabled = count === 0 && !isActive;

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              disabled={isDisabled}
              aria-pressed={isActive}
              className={`flex shrink-0 items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isDisabled
                  ? "cursor-not-allowed border-slate-200 text-slate-300"
                  : isActive
                    ? "border-brand-600 text-brand-600"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {t(LABEL_KEYS[tag])}
            </button>
          );
        })}
      </div>
    </>
  );
}