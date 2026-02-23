import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "../i18n";

interface FilterDropdownProps {
  open: boolean;
  onClose: () => void;
  title: string;
  activeCount: number;
  onClear: () => void;
  children: ReactNode;
}

export function FilterDropdown({
  open,
  onClose,
  title,
  activeCount,
  onClear,
  children,
}: FilterDropdownProps) {
  const { t } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute top-full left-0 z-50 mt-1 w-80 overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center border-b border-slate-200 px-4 py-3">
            <h4 className="text-xs font-semibold text-slate-900">{title}</h4>
          </div>

          <div className="px-4 py-4">
            {children}
          </div>

          {activeCount > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  onClear();
                  onClose();
                }}
                className="h-8 w-full rounded-sm border border-slate-200 bg-white text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                {t("common.clear")} ({activeCount})
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}