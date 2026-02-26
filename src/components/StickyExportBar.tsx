import { useTranslation } from "../i18n";

interface StickyExportBarProps {
  totalUnits: number;
  onDownload: () => void;
  onClear: () => void;
  isDownloading: boolean;
}

export function StickyExportBar({
  totalUnits,
  onDownload,
  onClear,
  isDownloading,
}: StickyExportBarProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 xl:px-8 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-mono text-slate-500">
          {t("stickyBar.totalUnits", { count: String(totalUnits) })}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-sm hover:bg-slate-50 transition-colors"
          >
            {t("myList.clearList")}
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading}
            className="px-4 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-sm hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? t("common.loading") : t("myList.downloadList")}
          </button>
        </div>
      </div>
    </div>
  );
}