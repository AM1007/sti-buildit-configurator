import type { ModelConstraints, ConstraintMatrix } from "./types";

// ============================================================================
// Whitelist — source of truth: 06_Enviro_Stopper.md (44 SKU)
// ============================================================================
// ASSUMPTION: STI-13710NR replaces the duplicate STI-13710NG (line 44 of MD).
//   Line 44 described "червоний, без напису" (red, no label) which is NR, not NG.
//   Confirmed by product owner.

export const VALID_MODEL_CODES: readonly string[] = [
  // Dome cover (13), Sealed mounting plate IP66 (6), no hood (00)
  "STI-13600NC",
  // Dome cover (13), Sealed mounting plate IP66 (6), label hood (10)
  "STI-13610FR",
  "STI-13610EG",
  "STI-13610CR",
  "STI-13610CG",
  "STI-13610CY",
  "STI-13610CW",
  "STI-13610CB",
  "STI-13610NG",
  "STI-13610NY",
  "STI-13610NW",
  "STI-13610NB",
  // Dome cover (13), Sealed mounting plate IP66 (6), sounder 9V (20)
  "STI-13620FR",
  "STI-13620EG",
  "STI-13620CG",
  "STI-13620NG",
  "STI-13620NY",
  // Dome cover (13), Sealed mounting plate IP66 (6), sounder 12-24VDC (30)
  "STI-13630FR",
  "STI-13630EG",
  // Dome cover (13), Open mounting plate IP56 (7), no hood (00)
  "STI-13700NC",
  // Dome cover (13), Open mounting plate IP56 (7), label hood (10)
  "STI-13710FR",
  "STI-13710EG",
  "STI-13710CR",
  "STI-13710CG",
  "STI-13710CY",
  "STI-13710CB",
  "STI-13710NR",
  "STI-13710NG",
  "STI-13710NY",
  "STI-13710NB",
  // Dome cover (13), Open mounting plate IP56 (7), sounder 9V (20)
  "STI-13720FR",
  "STI-13720EG",
  "STI-13720NW",
  "STI-13720NY",
  // Dome cover (13), Open mounting plate IP56 (7), sounder 12-24VDC (30)
  "STI-13730EG",
  // Low-profile cover (14), Sealed mounting plate IP66 (6), no hood (00)
  "STI-14600NC",
  // Low-profile cover (14), Sealed mounting plate IP66 (6), label hood (10)
  "STI-14610FR",
  "STI-14610EG",
  "STI-14610CY",
  // Low-profile cover (14), Open mounting plate IP56 (7), no hood (00)
  "STI-14700NC",
  // Low-profile cover (14), Open mounting plate IP56 (7), label hood (10)
  "STI-14710EG",
  "STI-14710CW",
  "STI-14710NW",
  // Low-profile cover (14), Open mounting plate IP56 (7), sounder 12-24VDC (30)
  "STI-14730EG",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ============================================================================
// Selection state
// ============================================================================

export interface ESSelectionState {
  cover?: string;        // "13" | "14"
  mounting?: string;     // "6" | "7"
  hoodSounder?: string;  // "00" | "10" | "20" | "30"
  colourLabel?: string;  // "FR" | "EG" | "CR" | ... (2-char code)
}

// ============================================================================
// Build SKU from selections
// ============================================================================

export function buildESModelCode(selections: ESSelectionState): string | null {
  const { cover, mounting, hoodSounder, colourLabel } = selections;

  if (!cover || !mounting || !hoodSounder || !colourLabel) {
    return null;
  }

  return `STI-${cover}${mounting}${hoodSounder}${colourLabel}`;
}

// ============================================================================
// Parse SKU back to selections
// ============================================================================

export function parseESModelCode(code: string): ESSelectionState | null {
  const match = code.match(/^STI-(\d{2})(\d)(\d{2})([A-Z]{2})$/);

  if (!match) {
    return null;
  }

  return {
    cover: match[1],
    mounting: match[2],
    hoodSounder: match[3],
    colourLabel: match[4],
  };
}

// ============================================================================
// Validate full combination against whitelist
// ============================================================================

export function isValidESCombination(
  selections: ESSelectionState
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildESModelCode(selections);

  if (!modelCode) {
    return { valid: true };
  }

  if (VALID_MODEL_SET.has(modelCode)) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: `Model ${modelCode} is not available. This combination is not in the approved product list.`,
  };
}

// ============================================================================
// Get valid options for a step (allowlist filter)
// ============================================================================

export function getValidESOptionsForStep(
  stepId: keyof ESSelectionState,
  currentSelections: Partial<ESSelectionState>
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseESModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof ESSelectionState] !== value) {
        matches = false;
        break;
      }
    }

    if (matches) {
      const optionValue = parsed[stepId];
      if (optionValue) {
        validOptions.add(optionValue);
      }
    }
  }

  return Array.from(validOptions);
}

// ============================================================================
// Constraint matrices — derived from whitelist analysis
// ============================================================================
// Each matrix: for a given value of source step, which values of target step
// appear in at least one valid SKU.
// Bidirectional matrices for every non-trivial pair.

// --- cover ↔ mounting ---
// Both covers work with both mountings → trivial, no matrix needed.
// Verified: cover 13 has mounting 6,7; cover 14 has mounting 6,7.

// --- cover ↔ hoodSounder ---

const COVER_TO_HOOD_SOUNDER: ConstraintMatrix = {
  "13": ["00", "10", "20", "30"],
  "14": ["00", "10", "30"],
};

const HOOD_SOUNDER_TO_COVER: ConstraintMatrix = {
  "00": ["13", "14"],
  "10": ["13", "14"],
  "20": ["13"],
  "30": ["13", "14"],
};

// --- cover ↔ colourLabel ---

const COVER_TO_COLOUR_LABEL: ConstraintMatrix = {
  "13": ["FR", "EG", "CR", "CG", "CY", "CW", "CB", "NC", "NR", "NG", "NY", "NW", "NB"],
  "14": ["FR", "EG", "CY", "CW", "NC", "NW"],
};

const COLOUR_LABEL_TO_COVER: ConstraintMatrix = {
  "FR": ["13", "14"],
  "EG": ["13", "14"],
  "CR": ["13"],
  "CG": ["13"],
  "CY": ["13", "14"],
  "CW": ["13", "14"],
  "CB": ["13"],
  "NC": ["13", "14"],
  "NR": ["13"],
  "NG": ["13"],
  "NY": ["13"],
  "NW": ["13", "14"],
  "NB": ["13"],
};

// --- mounting ↔ colourLabel ---

const MOUNTING_TO_COLOUR_LABEL: ConstraintMatrix = {
  "6": ["FR", "EG", "CR", "CG", "CY", "CW", "CB", "NC", "NG", "NY", "NW", "NB"],
  "7": ["FR", "EG", "CR", "CG", "CY", "CW", "CB", "NC", "NR", "NG", "NY", "NW", "NB"],
};

const COLOUR_LABEL_TO_MOUNTING: ConstraintMatrix = {
  "FR": ["6", "7"],
  "EG": ["6", "7"],
  "CR": ["6", "7"],
  "CG": ["6", "7"],
  "CY": ["6", "7"],
  "CW": ["6", "7"],
  "CB": ["6", "7"],
  "NC": ["6", "7"],
  "NR": ["7"],
  "NG": ["6", "7"],
  "NY": ["6", "7"],
  "NW": ["6", "7"],
  "NB": ["6", "7"],
};

// --- hoodSounder ↔ colourLabel ---

const HOOD_SOUNDER_TO_COLOUR_LABEL: ConstraintMatrix = {
  "00": ["NC"],
  "10": ["FR", "EG", "CR", "CG", "CY", "CW", "CB", "NR", "NG", "NY", "NW", "NB"],
  "20": ["FR", "EG", "CG", "NG", "NY", "NW"],
  "30": ["FR", "EG"],
};

const COLOUR_LABEL_TO_HOOD_SOUNDER: ConstraintMatrix = {
  "FR": ["10", "20", "30"],
  "EG": ["10", "20", "30"],
  "CR": ["10"],
  "CG": ["10", "20"],
  "CY": ["10"],
  "CW": ["10"],
  "CB": ["10"],
  "NC": ["00"],
  "NR": ["10"],
  "NG": ["10", "20"],
  "NY": ["10", "20"],
  "NW": ["10", "20"],
  "NB": ["10"],
};

// --- mounting ↔ hoodSounder ---
// Both mountings work with all hoods → trivial, no matrix needed.
// Verified: mounting 6 has hoods 00,10,20,30; mounting 7 has hoods 00,10,20,30.

// ============================================================================
// ModelConstraints export
// ============================================================================

export const ENVIRO_STOPPER_CONSTRAINTS: ModelConstraints = {
  modelId: "enviro-stopper",
  constraints: [
    // cover ↔ hoodSounder
    { sourceStep: "cover", targetStep: "hoodSounder", matrix: COVER_TO_HOOD_SOUNDER },
    { sourceStep: "hoodSounder", targetStep: "cover", matrix: HOOD_SOUNDER_TO_COVER },

    // cover ↔ colourLabel
    { sourceStep: "cover", targetStep: "colourLabel", matrix: COVER_TO_COLOUR_LABEL },
    { sourceStep: "colourLabel", targetStep: "cover", matrix: COLOUR_LABEL_TO_COVER },

    // mounting ↔ colourLabel
    { sourceStep: "mounting", targetStep: "colourLabel", matrix: MOUNTING_TO_COLOUR_LABEL },
    { sourceStep: "colourLabel", targetStep: "mounting", matrix: COLOUR_LABEL_TO_MOUNTING },

    // hoodSounder ↔ colourLabel
    { sourceStep: "hoodSounder", targetStep: "colourLabel", matrix: HOOD_SOUNDER_TO_COLOUR_LABEL },
    { sourceStep: "colourLabel", targetStep: "hoodSounder", matrix: COLOUR_LABEL_TO_HOOD_SOUNDER },
  ],
};

// ============================================================================
// Debug export
// ============================================================================

export const DEBUG_MATRICES = {
  COVER_TO_HOOD_SOUNDER,
  HOOD_SOUNDER_TO_COVER,
  COVER_TO_COLOUR_LABEL,
  COLOUR_LABEL_TO_COVER,
  MOUNTING_TO_COLOUR_LABEL,
  COLOUR_LABEL_TO_MOUNTING,
  HOOD_SOUNDER_TO_COLOUR_LABEL,
  COLOUR_LABEL_TO_HOOD_SOUNDER,
  VALID_MODEL_CODES,
};