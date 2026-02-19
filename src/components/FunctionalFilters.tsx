import { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";
import type { FunctionalTag } from "../data/catalog";
import { FUNCTIONAL_TAGS } from "../utils/filterProducts";
import { useTranslation } from "../i18n";

const LABEL_KEYS: Record<FunctionalTag, string> = {
  "weather-rated": "filter.weatherRated",
  "sounder": "filter.sounder",
  "reset-device": "filter.resetDevice",
  "fire-alarm": "filter.fireAlarm",
  "key-operated": "filter.keyOperated",
};

interface FunctionalFiltersProps {
  selected: Set<FunctionalTag>;
  counts: Record<FunctionalTag, number>;
  onToggle: (tag: FunctionalTag) => void;
}

function ChipList({
  selected,
  counts,
  onToggle,
  t,
}: FunctionalFiltersProps & { t: (key: string, params?: Record<string, string>) => string }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      <div className="mr-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        <Filter className="h-3.5 w-3.5" />
        {t("filter.label")}
      </div>

      {FUNCTIONAL_TAGS.map((tag, index) => {
        const isActive = selected.has(tag);
        const count = counts[tag];
        const isDisabled = count === 0 && !isActive;
        const showSeparator = index === 2;

        return (
          <div key={tag} className="flex items-center gap-2">
            {showSeparator && (
              <div className="hidden h-4 w-px bg-slate-200 md:block" />
            )}
            <button
              type="button"
              onClick={() => onToggle(tag)}
              disabled={isDisabled}
              aria-pressed={isActive}
              className={`flex shrink-0 items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isDisabled
                  ? "opacity-30 cursor-not-allowed border-slate-200 bg-white text-slate-400"
                  : isActive
                    ? "border-brand-600 bg-white text-brand-600"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {t(LABEL_KEYS[tag])}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function FunctionalFilters({ selected, counts, onToggle }: FunctionalFiltersProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const activeCount = selected.size;

  return (
    <>
      <div className="hidden md:block">
        <ChipList selected={selected} counts={counts} onToggle={onToggle} t={t} />
      </div>

      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="flex items-center gap-2 rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>
            {activeCount > 0
              ? t("filter.filtersActive", { count: String(activeCount) })
              : t("filter.filters")
            }
          </span>
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded && (
          <div className="mt-2 flex flex-wrap gap-2">
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
                  className={`flex items-center rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isDisabled
                      ? "opacity-30 cursor-not-allowed border-slate-200 bg-white text-slate-400"
                      : isActive
                        ? "border-brand-600 bg-white text-brand-600"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  {t(LABEL_KEYS[tag])} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}