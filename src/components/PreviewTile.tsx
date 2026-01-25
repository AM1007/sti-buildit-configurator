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
        overflow-hidden border-2 border-solid px-1 py-3 transition-all duration-300
        md:h-42 md:px-2.5 md:py-6 lg:h-50
        hover:[&_.edit-box]:opacity-100
        ${isSelected ? "border-black bg-white" : "border-gray-300 bg-gray-200 hover:border-black/20"}
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
        <span className="w-full overflow-hidden wrap-break-word text-center text-sm font-medium text-black lg:text-base lg:font-bold">
          {label}
        </span>
      )}

      <div className="edit-box absolute inset-0 z-20 flex h-full w-full items-center justify-center bg-black/20 opacity-0 transition-all duration-300">
        <span className="flex items-center gap-1 bg-white px-1 py-0.5 text-sm font-bold md:px-2 lg:text-sm">
          <EditIcon />
          {t("common.edit")}
        </span>
      </div>
    </div>
  );
}

function EditIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-grid leading-none"
    >
      <path
        d="M6.92083 6.22523L6.36316 7.89881C6.33062 8.00144 6.32692 8.11103 6.35244 8.21562C6.37797 8.32021 6.43175 8.41577 6.50791 8.49187C6.58406 8.56796 6.67967 8.62167 6.78428 8.64711C6.88889 8.67255 6.99848 8.66876 7.10108 8.63614L8.77466 8.07848C8.8603 8.04973 8.93815 8.00162 9.00216 7.93789L12.9315 4.00856C13.1886 3.75109 13.3331 3.40208 13.3331 3.03819C13.3331 2.67429 13.1886 2.32528 12.9315 2.06781C12.6739 1.81112 12.3251 1.66699 11.9614 1.66699C11.5978 1.66699 11.2489 1.81112 10.9913 2.06781L7.06199 5.99773C6.99794 6.06159 6.94961 6.13947 6.92083 6.22523Z"
        fill="currentColor"
      />
      <path
        d="M12.7501 5.75033C12.5954 5.75033 12.447 5.81178 12.3376 5.92118C12.2282 6.03058 12.1667 6.17895 12.1667 6.33366V10.417C12.1667 10.8811 11.9824 11.3262 11.6542 11.6544C11.326 11.9826 10.8809 12.167 10.4167 12.167H4.58341C4.11929 12.167 3.67417 11.9826 3.34598 11.6544C3.01779 11.3262 2.83341 10.8811 2.83341 10.417V4.58366C2.83341 4.11953 3.01779 3.67441 3.34598 3.34622C3.67417 3.01803 4.11929 2.83366 4.58341 2.83366H8.66675C8.82146 2.83366 8.96983 2.7722 9.07923 2.6628C9.18862 2.55341 9.25008 2.40504 9.25008 2.25033C9.25008 2.09562 9.18862 1.94724 9.07923 1.83785C8.96983 1.72845 8.82146 1.66699 8.66675 1.66699H4.58341C3.81015 1.66792 3.06882 1.97551 2.52204 2.52229C1.97526 3.06907 1.66767 3.8104 1.66675 4.58366V10.417C1.66767 11.1903 1.97526 11.9316 2.52204 12.4784C3.06882 13.0251 3.81015 13.3327 4.58341 13.3337H10.4167C11.19 13.3327 11.9313 13.0251 12.4781 12.4784C13.0249 11.9316 13.3325 11.1903 13.3334 10.417V6.33366C13.3334 6.17895 13.272 6.03058 13.1626 5.92118C13.0532 5.81178 12.9048 5.75033 12.7501 5.75033Z"
        fill="currentColor"
      />
    </svg>
  );
}