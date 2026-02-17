import { useTranslation } from "../i18n";

interface ResultCounterProps {
  shown: number;
  total: number;
}

export function ResultCounter({ shown, total }: ResultCounterProps) {
  const { t } = useTranslation();

  return (
    <p className="text-sm text-gray-500">
      {t("filter.showingOf", { shown: String(shown), total: String(total) })}
    </p>
  );
}

interface EmptyStateProps {
  onClear: () => void;
}

export function EmptyState({ onClear }: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <p className="text-gray-500 text-base mb-4">
        {t("filter.noResults")}
      </p>
      <button
        onClick={onClear}
        className="w-full md:w-auto px-6 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors duration-150 cursor-pointer"
      >
        {t("filter.clearFilters")}
      </button>
    </div>
  );
}