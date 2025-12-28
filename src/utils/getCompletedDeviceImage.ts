// ============================================================================
// COMPLETED DEVICE IMAGE PATH RESOLVER
// ============================================================================
//
// Determines the path to completed device image for Product Preview tab.
//
// Current support:
// - stopper-stations: RED (colour = "0") only
//
// Rules:
// - Returns image path only if all conditions are met
// - Returns null if image should not be shown (placeholder instead)
//
// Future expansion:
// - Other colours for stopper-stations (GREEN, YELLOW, WHITE, BLUE, ORANGE)
// - Other 5 configurator models
//
// ============================================================================

import type { Configuration, ModelId } from "../types";

// ============================================================================
// TYPES
// ============================================================================

interface GetCompletedDeviceImageParams {
  /** Full product code (e.g., "SS2024NT-EN&KIT-71101B-R") */
  fullCode: string;
  
  /** Model identifier */
  modelId: ModelId;
  
  /** Current configuration state */
  config: Configuration;
  
  /** Whether configuration is complete */
  isComplete: boolean;
}

interface CompletedDeviceImageResult {
  /** Path to image, or null if placeholder should be shown */
  imagePath: string | null;
  
  /** Reason why image is not available (for debugging/UI) */
  reason?: string;
}

// ============================================================================
// COLOUR TO FOLDER MAPPING
// ============================================================================

// ASSUMPTION: Folder names match these values exactly
// Currently only RED is available, others will be added later
const COLOUR_TO_FOLDER: Record<string, string> = {
  "0": "RED",
  "1": "GREEN",
  "2": "YELLOW",
  // TODO: Uncomment when folders are available
  // "3": "WHITE",
  // "4": "BLUE",
  // "5": "ORANGE",
};

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Determines the path to completed device image.
 * 
 * @returns Object with imagePath (string | null) and optional reason
 * 
 * @example
 * const result = getCompletedDeviceImage({
 *   fullCode: "SS2024NT-EN&KIT-71101B-R",
 *   modelId: "stopper-stations",
 *   config: { colour: "0", language: "EN", ... },
 *   isComplete: true
 * });
 * // result.imagePath = "/Stopper® Stations/COMPLETED DEVICE/RED/SS2024NT-EN&KIT-71101B-R.webp"
 */
export function getCompletedDeviceImage({
  fullCode,
  modelId,
  config,
  isComplete,
}: GetCompletedDeviceImageParams): CompletedDeviceImageResult {
  
  // ---------------------------------------------------------------------------
  // Guard: Configuration must be complete
  // ---------------------------------------------------------------------------
  if (!isComplete) {
    return {
      imagePath: null,
      reason: "Configuration is not complete",
    };
  }

  // ---------------------------------------------------------------------------
  // Guard: Only stopper-stations supported currently
  // ---------------------------------------------------------------------------
  if (modelId !== "stopper-stations") {
    return {
      imagePath: null,
      reason: `Model "${modelId}" does not have completed device images yet`,
    };
  }

  // ---------------------------------------------------------------------------
  // Guard: Language = ZL means no image available
  // ---------------------------------------------------------------------------
  // Source: 01_Stopper®_Stations_IMG.md
  // All ZL (non-returnable other language) variants have no preview image
  if (config.language === "ZL") {
    return {
      imagePath: null,
      reason: "ZL language variants do not have preview images",
    };
  }

  // ---------------------------------------------------------------------------
  // Guard: Cover = "2" (Shield) means no image available
  // ---------------------------------------------------------------------------
  // Cover option "2" (SS2x2xx pattern - Shield) does not have completed device images
  if (config.cover === "2") {
    return {
      imagePath: null,
      reason: "Shield cover variants do not have preview images",
    };
  }

  // ---------------------------------------------------------------------------
  // Guard: Only RED (colour = "0") has images currently
  // ---------------------------------------------------------------------------
  const colourFolder = COLOUR_TO_FOLDER[config.colour ?? ""];
  
  if (!colourFolder) {
    return {
      imagePath: null,
      reason: `Colour "${config.colour}" does not have completed device images yet`,
    };
  }

  // ---------------------------------------------------------------------------
  // Build image path
  // ---------------------------------------------------------------------------
  // Path structure: /Stopper® Stations/COMPLETED DEVICE/{COLOUR}/{fullCode}.webp
  const imagePath = `/Stopper® Stations/COMPLETED DEVICE/${colourFolder}/${fullCode}.webp`;

  return {
    imagePath,
  };
}

// ============================================================================
// HELPER: Check if image might exist (for preload decisions)
// ============================================================================

/**
 * Quick check if completed device image could potentially exist.
 * Does NOT verify file existence, only checks business rules.
 */
export function canHaveCompletedDeviceImage(
  modelId: ModelId,
  config: Configuration
): boolean {
  // Only stopper-stations for now
  if (modelId !== "stopper-stations") {
    return false;
  }

  // ZL has no images
  if (config.language === "ZL") {
    return false;
  }

  // Cover = "2" (Shield) has no images
  if (config.cover === "2") {
    return false;
  }

  // Only RED, GREEN, YELLOW have images currently
  if (config.colour !== "0" && config.colour !== "1" && config.colour !== "2") {
    return false;
  }

  return true;
}