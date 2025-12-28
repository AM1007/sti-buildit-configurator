// ============================================================================
// PREVIEW TILE COMPONENT
// ============================================================================
//
// Single tile in the Product Preview grid.
// Shows either:
// - Image of selected option (if available)
// - Selected label (if option selected but no image)
// - Step label placeholder (if nothing selected)
//
// Interaction:
// - Hover: darkened overlay with "Edit" button
// - Click: opens corresponding step in sidebar
//
// ============================================================================

import type { StepId } from "../types";

// ============================================================================
// TYPES
// ============================================================================

interface PreviewTileProps {
  /** Step ID for callback */
  stepId: StepId;

  /** Step label to show as header (e.g., "COLOUR", "ACTIVATION") */
  label: string;

  /** Image URL of selected option (optional) */
  image?: string;

  /** Text to display when option is selected */
  selectedLabel?: string;

  /** Whether an option is selected for this step */
  isSelected?: boolean;

  /** Callback when tile is clicked (to open step in sidebar) */
  onEdit: (stepId: StepId) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Single preview tile showing selected option or placeholder.
 *
 * States:
 * - No selection: Shows step label in grey, dashed border
 * - Selected with image: Shows image + label
 * - Selected without image: Shows selected option label
 *
 * Interaction:
 * - Hover: Dark overlay with "Edit" button appears
 * - Click: Triggers onEdit callback to open step in sidebar
 */
export function PreviewTile({
  stepId,
  label,
  image,
  selectedLabel,
  isSelected = false,
  onEdit,
}: PreviewTileProps) {
  return (
    <button
      type="button"
      onClick={() => onEdit(stepId)}
      className={`
        relative group cursor-pointer
        rounded-lg bg-white p-3
        h-28 md:h-32 flex flex-col items-center justify-center
        transition-all
        ${
          isSelected
            ? "border-2 border-gray-300 shadow-sm"
            : "border-2 border-dashed border-gray-200"
        }
        hover:border-gray-400
      `}
      aria-label={`Edit ${label}`}
    >
      {/* Step label header */}
      <p
        className={`
          text-[10px] uppercase tracking-wide mb-1 text-center w-full truncate
          ${isSelected ? "text-gray-500" : "text-gray-400"}
        `}
      >
        {label}
      </p>

      {/* Content area */}
      <div className="flex-1 flex items-center justify-center w-full">
        {image ? (
          // Show image if available
          <img
            src={image}
            alt={selectedLabel ?? label}
            className="max-h-14 md:max-h-16 w-full object-contain"
          />
        ) : selectedLabel ? (
          // Show selected label if no image
          <p className="text-xs text-gray-700 text-center font-medium px-1 line-clamp-2">
            {selectedLabel}
          </p>
        ) : (
          // Show placeholder
          <div className="flex items-center justify-center">
            <span className="text-gray-300 text-2xl">—</span>
          </div>
        )}
      </div>

      {/* Selection indicator dot */}
      {isSelected && (
        <div className="mt-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
        </div>
      )}

      {/* Hover Overlay */}
      <div
        className="
          absolute inset-0 rounded-lg
          bg-black/50 opacity-0 group-hover:opacity-100
          transition-opacity duration-150
          flex items-center justify-center
        "
        aria-hidden="true"
      >
        <span
          className="
            bg-white text-gray-800 
            px-3 py-1.5 rounded
            text-sm font-medium
            flex items-center gap-1.5
            shadow-sm
          "
        >
          <EditIcon />
          Edit
        </span>
      </div>
    </button>
  );
}

// ============================================================================
// ICONS
// ============================================================================

function EditIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}