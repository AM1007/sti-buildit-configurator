import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  useMyList,
  useProjectMeta,
  useConfigurationStore,
} from "../stores/configurationStore";
import { useTranslation, useLanguage } from "../i18n";
import { downloadMyListXlsx } from "../utils/generateMyListXlsx";
import { ExportModal } from "./ExportModal";
import { toast } from "../utils/toast";

export function StickyExportBar() {
  const location = useLocation();
  const myList = useMyList();
  const projectMeta = useProjectMeta();
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const clearMyList = useConfigurationStore((s) => s.clearMyList);
  const setProjectMeta = useConfigurationStore((s) => s.setProjectMeta);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (location.pathname !== "/my-list" || myList.length === 0) return null;

  const totalUnits = myList.reduce((sum, item) => sum + item.qty, 0);

  const handleClearAll = () => {
    toast.confirm(t("myList.clearListConfirm"), () => {
      clearMyList();
    });
  };

  const handleExport = async (meta: { projectName: string; clientName: string; date: string }) => {
    setProjectMeta({
      projectName: meta.projectName,
      clientName: meta.clientName,
      date: meta.date,
    });

    setIsExportModalOpen(false);
    setIsDownloading(true);

    try {
      const updatedMeta = {
        ...projectMeta,
        projectName: meta.projectName,
        clientName: meta.clientName,
        date: meta.date,
      };
      await downloadMyListXlsx(myList, lang as "en" | "uk", updatedMeta);
      setProjectMeta({ lastExportedAt: Date.now(), updatedAt: Date.now() });
    } catch {
      toast.error(t("toast.errorOccurred"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6 xl:px-8 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-mono text-slate-500">
            {t("stickyBar.totalUnits", { count: String(totalUnits) })}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAll}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-sm hover:bg-slate-50 transition-colors"
            >
              {t("myList.clearList")}
            </button>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              disabled={isDownloading}
              className="px-4 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-sm hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? t("common.loading") : t("myList.downloadList")}
            </button>
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        projectMeta={projectMeta}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
      />
    </>
  );
}