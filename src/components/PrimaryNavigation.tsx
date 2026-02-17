import type { PrimaryTag } from "../data/catalog";
import { useTranslation } from "../i18n";

const SEGMENTS: readonly (PrimaryTag | "all")[] = [
  "all",
  "push-button",
  "call-point",
  "protective-cover",
  "enclosure",
];

const LABEL_KEYS: Record<PrimaryTag | "all", string> = {
  "all": "filter.all",
  "push-button": "filter.pushButtons",
  "call-point": "filter.callPoints",
  "protective-cover": "filter.covers",
  "enclosure": "filter.enclosures",
};

interface PrimaryNavigationProps {
  value: PrimaryTag | "all";
  onChange: (tag: PrimaryTag | "all") => void;
}

export function PrimaryNavigation({ value, onChange }: PrimaryNavigationProps) {
  const { t } = useTranslation();

  return (
    <nav
      role="tablist"
      aria-label={t("filter.productType")}
      className="flex gap-1 overflow-x-auto md:overflow-x-visible md:flex-wrap scrollbar-none"
    >
      {SEGMENTS.map((segment) => (
        <button
          key={segment}
          role="tab"
          aria-selected={value === segment}
          onClick={() => onChange(segment)}
          className={`
            shrink-0 h-11 px-4 text-sm font-medium rounded-md border transition-colors duration-150 cursor-pointer whitespace-nowrap
            ${value === segment
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }
          `}
        >
          {t(LABEL_KEYS[segment])}
        </button>
      ))}
    </nav>
  );
}