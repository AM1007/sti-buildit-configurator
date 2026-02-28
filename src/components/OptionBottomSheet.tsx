import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Step, OptionId, Configuration, ModelId } from "../types";
import { OptionCard } from "./OptionCard";
import { getOptionsWithAvailability } from "../filterOptions";
import { useModelTranslations } from "../hooks/useModelTranslations";
import { useTranslation, useLanguage } from "../i18n";

interface OptionBottomSheetProps {
  open: boolean;
  step: Step;
  config: Configuration;
  modelId: ModelId;
  selectedOptionId: OptionId | null;
  onSelect: (optionId: OptionId) => void;
  onClear: () => void;
  onClose: () => void;
}

export function OptionBottomSheet({
  open,
  step,
  config,
  modelId,
  selectedOptionId,
  onSelect,
  onClear,
  onClose,
}: OptionBottomSheetProps) {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { getStepTitle, getOptionLabel } = useModelTranslations(modelId);
  const sheetRef = useRef<HTMLDivElement>(null);

  const title = getStepTitle(step.id);

  const optionsWithStatus = getOptionsWithAvailability(step, config, modelId);
  const availableOptions = optionsWithStatus.filter(({ availability }) => availability.available);

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const handleOptionClick = (optionId: OptionId) => {
    if (optionId === selectedOptionId) {
      onClear();
    } else {
      onSelect(optionId);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-0 left-0 right-0 flex max-h-[85vh] flex-col overflow-hidden rounded-t-lg bg-white"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div className="flex flex-col">
                <h3 className="text-[15px] font-semibold text-slate-900 md:text-sm">
                  {title}
                </h3>
                <span className="mt-0.5 text-xs text-slate-500">
                  {formatOptionsAvailable(availableOptions.length, lang, t)}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-900 rounded-sm hover:bg-slate-200 transition-colors"
                aria-label={t("common.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div
                className="grid grid-cols-2 gap-3 md:grid-cols-3"
                role="listbox"
                aria-label={`${title} options`}
              >
                {availableOptions.map(({ option }) => (
                  <OptionCard
                    key={option.id}
                    option={option}
                    isSelected={option.id === selectedOptionId}
                    isAvailable={true}
                    onSelect={() => handleOptionClick(option.id)}
                    label={getOptionLabel(step.id, option.id)}
                    forceTile
                  />
                ))}
              </div>
            </div>

            {selectedOptionId && (
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
                <button
                  type="button"
                  onClick={() => {
                    onClear();
                    onClose();
                  }}
                  className="h-10 w-full rounded-sm border border-slate-200 bg-white text-[13px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 md:h-9 md:w-auto md:px-5 md:text-xs"
                >
                  {t("configurator.clearSelection")}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function pluralizeUk(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  if (mod10 === 1 && mod100 !== 11) return `${n} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${n} ${few}`;
  return `${n} ${many}`;
}

function formatOptionsAvailable(
  count: number,
  lang: string,
  t: (key: string, params?: Record<string, string>) => string
): string {
  if (lang === "uk") {
    return pluralizeUk(
      count,
      t("configurator.optionsAvailable_one"),
      t("configurator.optionsAvailable_few"),
      t("configurator.optionsAvailable_many")
    );
  }
  return `${count} ${t("configurator.optionsAvailable")}`;
}