import { Pencil } from "lucide-react";
import type { StepId } from "../types";
import { useTranslation } from "../i18n";

interface PreviewTileProps {
  stepId: StepId;
  label: string;
  image?: string;
  isSelected?: boolean;
  onEdit: (stepId: StepId) => void;
}

export function PreviewTile({
  stepId,
  label,
  image,
  isSelected = false,
  onEdit,
}: PreviewTileProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`
        relative flex h-25 w-full cursor-pointer items-center justify-center
        overflow-hidden rounded-sm border px-1 py-3 transition-all duration-200
        md:h-42 md:px-2.5 md:py-6 xl:h-50
        hover:[&_.edit-box]:opacity-100
        ${isSelected
          ? "border-slate-900 bg-white"
          : "border-slate-200 bg-slate-50 hover:border-slate-300"
        }
      `}
      onClick={() => onEdit(stepId)}
    >
      {image ? (
        <img
          src={image}
          alt={label}
          className="max-h-full max-w-full object-contain"
        />
      ) : (
        <span className="w-full overflow-hidden text-center text-xs font-medium text-slate-500 wrap-break-word md:text-sm">
          {label}
        </span>
      )}

      <div className="edit-box absolute inset-0 z-20 flex h-full w-full items-center justify-center bg-slate-900/10 opacity-0 transition-all duration-200">
        <span className="flex items-center gap-1 rounded-sm bg-white px-2 py-1 text-xs font-medium text-slate-700 shadow-sm">
          <Pencil className="h-3 w-3" />
          {t("common.edit")}
        </span>
      </div>
    </div>
  );
}