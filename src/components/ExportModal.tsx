import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { ProjectMeta } from "../types";
import { useTranslation } from "../i18n";

interface ExportModalProps {
  isOpen: boolean;
  projectMeta: ProjectMeta;
  onClose: () => void;
  onExport: (meta: { projectName: string; clientName: string; date: string }) => void;
}

export function ExportModal({ isOpen, projectMeta, onClose, onExport }: ExportModalProps) {
  const { t } = useTranslation();
  const overlayRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [projectName, setProjectName] = useState(projectMeta.projectName);
  const [clientName, setClientName] = useState(projectMeta.clientName);
  const [date, setDate] = useState(projectMeta.date);
  const [touched, setTouched] = useState(false);

  const isValid = projectName.trim().length >= 3;
  const showError = touched && !isValid;

  useEffect(() => {
    if (isOpen) {
      setProjectName(projectMeta.projectName);
      setClientName(projectMeta.clientName);
      setDate(projectMeta.date);
      setTouched(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, projectMeta]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  const handleSubmit = () => {
    setTouched(true);
    if (!isValid) return;
    onExport({
      projectName: projectName.trim(),
      clientName: clientName.trim(),
      date,
    });
  };

  const formattedLastExported = projectMeta.lastExportedAt
    ? new Date(projectMeta.lastExportedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      >
        <div
          className="w-full max-w-md bg-white rounded-sm shadow-xl flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              {t("exportModal.title")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-900 rounded-sm hover:bg-slate-100 transition-colors"
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-5 flex flex-col gap-4">
            <p className="text-xs text-slate-500">
              {t("exportModal.description")}
            </p>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                {t("exportModal.projectName")} *
              </label>
              <input
                ref={inputRef}
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={t("myList.projectNamePlaceholder")}
                className={`w-full border rounded-sm px-3 py-2 text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-300 ${
                  showError
                    ? "border-red-400 focus:border-red-500"
                    : "border-slate-200 focus:border-slate-400"
                }`}
              />
              {showError && (
                <p className="text-[10px] text-red-500 mt-1">
                  {t("exportModal.projectNameRequired")}
                </p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                {t("exportModal.client")}
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={t("myList.clientNamePlaceholder")}
                className="w-full border border-slate-200 rounded-sm px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 transition-colors placeholder:text-slate-300"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                {t("exportModal.documentDate")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-200 rounded-sm px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-400 transition-colors"
              />
            </div>

            {formattedLastExported && (
              <p className="text-[10px] text-slate-400">
                {t("exportModal.lastExported", { date: formattedLastExported })}
              </p>
            )}
          </div>

          <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-sm hover:bg-slate-50 transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={touched && !isValid}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("exportModal.generateExcel")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}