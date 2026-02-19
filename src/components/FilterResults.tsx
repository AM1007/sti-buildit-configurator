import { LayoutGrid, List } from "lucide-react";
import { useTranslation } from "../i18n";

type ViewMode = "grid" | "list";

interface ResultCounterProps {
  shown: number;
  total: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isPaginated: boolean;
  onTogglePagination: () => void;
}

export function ResultCounter({
  shown,
  total,
  viewMode,
  onViewModeChange,
  isPaginated,
  onTogglePagination,
}: ResultCounterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onTogglePagination}
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer whitespace-nowrap"
      >
        {isPaginated
          ? t("filter.showingOf", { shown: String(shown), total: String(total) })
          : t("grid.showingAll")
        }
      </button>

      <div className="hidden md:flex items-center gap-1">
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          aria-label={t("view.list")}
          className={`rounded-sm p-1.5 transition-colors cursor-pointer ${
            viewMode === "list"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          aria-label={t("view.grid")}
          className={`rounded-sm p-1.5 transition-colors cursor-pointer ${
            viewMode === "grid"
              ? "bg-slate-100 text-slate-900"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <p className="text-slate-500 text-sm mb-4">
        {t("filter.noResults")}
      </p>
      <button
        type="button"
        onClick={onClear}
        className="w-full md:w-auto px-6 py-2 text-xs font-medium text-white bg-slate-900 rounded-sm hover:bg-slate-800 transition-colors cursor-pointer"
      >
        {t("filter.clearFilters")}
      </button>
    </div>
  );
}