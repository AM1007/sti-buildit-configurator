import { LayoutGrid, ToggleLeft, BellRing, ShieldCheck, Box } from "lucide-react";
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

const ICON_MAP: Record<PrimaryTag | "all", React.ComponentType<{ className?: string }>> = {
  "all": LayoutGrid,
  "push-button": ToggleLeft,
  "call-point": BellRing,
  "protective-cover": ShieldCheck,
  "enclosure": Box,
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
      className="sticky top-16 z-40 -mx-4 border-b border-slate-200 bg-white px-4 md:-mx-6 md:px-6 xl:-mx-8 xl:px-8"
    >
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar md:gap-8">
        {SEGMENTS.map((segment) => {
          const Icon = ICON_MAP[segment];
          const isActive = value === segment;

          return (
            <button
              key={segment}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => onChange(segment)}
              className={`group relative flex min-w-max items-center gap-2 py-4 text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "text-brand-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {t(LABEL_KEYS[segment])}
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-brand-600 transition-all duration-300 ${
                  isActive
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}