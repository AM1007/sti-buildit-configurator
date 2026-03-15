import { SlidersHorizontal } from "lucide-react";
import { useTranslation } from "../i18n";

interface EmptyStateContentProps {
  reason?: string;
}

export function EmptyStateContent({ reason }: EmptyStateContentProps) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center p-12 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-50 shadow-sm">
        <SlidersHorizontal className="h-10 w-10 text-slate-300" strokeWidth={1} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900">
        {t("configurator.previewNotAvailable", { defaultValue: "Select a configuration to begin" })}
      </h3>
      <p className="max-w-sm text-sm leading-relaxed text-slate-500">
        {reason || t("configurator.completeSelections")}
      </p>
    </div>
  );
}