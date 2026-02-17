import { useState } from "react";
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

function ChipList({ selected, counts, onToggle, t }: FunctionalFiltersProps & { t: (key: string, params?: Record<string, string>) => string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FUNCTIONAL_TAGS.map((tag) => {
        const isActive = selected.has(tag);
        const count = counts[tag];
        const isDisabled = count === 0 && !isActive;

        return (
          <button
            key={tag}
            onClick={() => onToggle(tag)}
            disabled={isDisabled}
            aria-pressed={isActive}
            className={`
              h-8 px-3 text-sm font-medium rounded-full border transition-colors duration-150 cursor-pointer whitespace-nowrap
              ${isDisabled
                ? "opacity-30 cursor-not-allowed border-gray-300 bg-white text-gray-500"
                : isActive
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }
            `}
          >
            {t(LABEL_KEYS[tag])} ({count})
          </button>
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
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="flex items-center gap-2 h-9 px-3 text-sm font-medium text-gray-700 border border-gray-300 rounded-md bg-white hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
        >
          <span>
            {activeCount > 0
              ? t("filter.filtersActive", { count: String(activeCount) })
              : t("filter.filters")
            }
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className={`transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {expanded && (
          <div className="mt-2">
            <ChipList selected={selected} counts={counts} onToggle={onToggle} t={t} />
          </div>
        )}
      </div>
    </>
  );
}