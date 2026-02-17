import { useState } from "react";
import { Link } from "react-router-dom";
import { useConfigurationStore, useMyList, useProjectMeta } from "../stores/configurationStore";
import { ProductCard } from "../components/ProductCard";
import { toast } from "../utils/toast";
import { downloadMyListXlsx } from "../utils/generateMyListXlsx";
import { useTranslation, useLanguage } from "../i18n";

export function MyListPage() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const myList = useMyList();
  const projectMeta = useProjectMeta();
  const removeFromMyList = useConfigurationStore((state) => state.removeFromMyList);
  const clearMyList = useConfigurationStore((state) => state.clearMyList);
  const updateItemQty = useConfigurationStore((state) => state.updateItemQty);
  const updateItemNote = useConfigurationStore((state) => state.updateItemNote);
  const setProjectMeta = useConfigurationStore((state) => state.setProjectMeta);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleClearAll = () => {
    toast.confirm(t("myList.clearListConfirm"), () => {
      clearMyList();
    });
  };

  const handleDownloadMyList = async () => {
    if (isDownloading) return;
    
    setIsDownloading(true);
    try {
      await downloadMyListXlsx(myList, lang as "en" | "uk", projectMeta);
    } catch (error) {
      console.error("Failed to download My List:", error);
      toast.error(t("toast.errorOccurred"));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 md:px-6 xl:px-8 py-8 xl:py-12">
        {myList.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-7 xl:gap-12">
            {/* Project header */}
            <ProjectHeader
              projectMeta={projectMeta}
              onUpdate={setProjectMeta}
            />

            {/* Title + actions */}
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:gap-6">
              <div className="max-w-200 flex-1">
                <h4 className="font-bold text-lg md:text-xl xl:text-2xl mb-4">{t("myList.title")}</h4>
                <p className="font-medium text-base md:text-md">
                  {t("myList.description")}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleDownloadMyList}
                  disabled={isDownloading}
                  className="cursor-pointer inline-flex items-center justify-center relative ring-offset-0 transition-all duration-300 ease-in-out focus-visible:outline-none box-border font-bold text-sm gap-1 px-4.5 py-0.5 min-h-9 border-4 md:gap-1.5 md:px-6 md:py-1 md:min-h-11 xl:text-base bg-brand-600 border-brand-600 text-white hover:bg-brand-700 hover:border-brand-700 h-max w-full basis-1/2 text-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDownloading ? t("common.loading") : t("myList.downloadList")}
                </button>
                <div className="w-full basis-1/2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="cursor-pointer inline-flex items-center justify-center relative ring-offset-0 transition-all duration-300 ease-in-out focus-visible:outline-none box-border font-bold text-sm gap-1 px-4.5 py-0.5 min-h-9 border-4 md:gap-1.5 md:px-6 md:py-1 md:min-h-11 xl:text-base bg-gray-500 border-gray-500 text-white hover:bg-gray-600 hover:border-gray-600 h-max w-full text-nowrap"
                  >
                    {t("myList.clearList")}
                  </button>
                </div>
              </div>
            </div>

            {/* Product cards grid */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-8 2xl:grid-cols-4">
              {myList.map((item) => (
                <div key={item.id} className="flex flex-col gap-3">
                  <ProductCard
                    item={item}
                    onRemove={removeFromMyList}
                  />
                  {/* Qty + Note fields */}
                  <ItemFields
                    id={item.id}
                    qty={item.qty}
                    note={item.note}
                    onQtyChange={updateItemQty}
                    onNoteChange={updateItemNote}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Project Header ---

interface ProjectHeaderProps {
  projectMeta: { projectName: string; clientName: string; createdAt: number };
  onUpdate: (meta: Partial<{ projectName: string; clientName: string }>) => void;
}

function ProjectHeader({ projectMeta, onUpdate }: ProjectHeaderProps) {
  const { t } = useTranslation();
  const dateStr = new Date(projectMeta.createdAt).toLocaleDateString();

  return (
    <div className="bg-white border-2 border-gray-200 p-4 md:p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            {t("myList.projectName")}
          </label>
          <input
            type="text"
            value={projectMeta.projectName}
            onChange={(e) => onUpdate({ projectName: e.target.value })}
            placeholder={t("myList.projectNamePlaceholder")}
            className="border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-normal text-gray-800 placeholder:text-gray-400 hover:border-gray-400 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            {t("myList.clientName")}
          </label>
          <input
            type="text"
            value={projectMeta.clientName}
            onChange={(e) => onUpdate({ clientName: e.target.value })}
            placeholder={t("myList.clientNamePlaceholder")}
            className="border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-normal text-gray-800 placeholder:text-gray-400 hover:border-gray-400 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            {t("myList.date")}
          </label>
          <span className="px-3 py-2 text-sm font-normal text-gray-600">
            {dateStr}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Item Qty + Note fields ---

interface ItemFieldsProps {
  id: string;
  qty: number;
  note: string;
  onQtyChange: (id: string, qty: number) => void;
  onNoteChange: (id: string, note: string) => void;
}

function ItemFields({ id, qty, note, onQtyChange, onNoteChange }: ItemFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-1 w-20 shrink-0">
        <label className="text-xs font-bold text-gray-500 uppercase">
          {t("myList.qty")}
        </label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => onQtyChange(id, parseInt(e.target.value, 10) || 1)}
          className="border border-gray-300 bg-white px-2 py-1.5 text-sm text-center font-normal text-gray-800 focus:border-gray-500 focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs font-bold text-gray-500 uppercase">
          {t("myList.note")}
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(id, e.target.value)}
          placeholder={t("myList.notePlaceholder")}
          className="border border-gray-300 bg-white px-2 py-1.5 text-sm font-normal text-gray-800 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

// --- Empty State ---

function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-7 xl:gap-12">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:gap-6">
        <div className="max-w-200 flex-1">
          <h4 className="font-bold text-lg md:text-xl xl:text-2xl mb-4">{t("myList.title")}</h4>
          <p className="font-medium text-base md:text-md">
            {t("myList.description")}
          </p>
        </div>
      </div>

      <div className="text-center py-16 bg-white border-2 border-gray-200">
        <div className="text-6xl mb-4">☆</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {t("myList.emptyTitle")}
        </h2>
        <p className="text-gray-600 mb-6">
          {t("myList.emptyDescription")}
        </p>
        <Link
          to="/"
          className="cursor-pointer inline-flex items-center justify-center font-bold text-sm gap-1 px-4.5 py-0.5 min-h-9 border-4 md:gap-1.5 md:px-6 md:py-1 md:min-h-11 xl:text-base bg-brand-600 border-brand-600 text-white hover:bg-brand-700 hover:border-brand-700 transition-all duration-300"
        >
          {t("myList.startConfiguring")}
        </Link>
      </div>
    </div>
  );
}