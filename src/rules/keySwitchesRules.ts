import type { ModelConstraints, ConstraintMatrix } from "./types";

// ============================================================================
// Whitelist — source of truth: 14_Key_Switches.md (49 models)
// ============================================================================

export const VALID_MODEL_CODES: readonly string[] = [
  // Red (10)
  "SS3-1020",
  "SS3-1020-CL",
  "SS3-1030",
  "SS3-1030-CL",
  "SS3-1031-CL",
  "SS3-1032",
  "SS3-1041",
  "SS3-1041-CL",
  "SS3-1042",
  "SS3-1053",
  // Green (30)
  "SS3-3020",
  "SS3-3020-CL",
  "SS3-3030",
  "SS3-3031",
  "SS3-3032",
  "SS3-3041",
  "SS3-3041-CL",
  "SS3-3042",
  "SS3-3042-CL",
  // Yellow (50)
  "SS3-5020",
  "SS3-5020-CL",
  "SS3-5030",
  "SS3-5031",
  "SS3-5031-CL",
  "SS3-5041",
  "SS3-5042",
  "SS3-5042-CL",
  "SS3-5053",
  "SS3-5053-CL",
  // White (70)
  "SS3-7020",
  "SS3-7020-CL",
  "SS3-7030",
  "SS3-7031",
  "SS3-7042",
  "SS3-7042-CL",
  "SS3-7053",
  "SS3-7053-CL",
  // Blue (90)
  "SS3-9020",
  "SS3-9020-CL",
  "SS3-9030",
  "SS3-9030-CL",
  "SS3-9031",
  "SS3-9041",
  "SS3-9042",
  // Orange (E0)
  "SS3-E020",
  "SS3-E030",
  "SS3-E032",
  "SS3-E053",
  "SS3-E053-CL",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ============================================================================
// Selection state
// ============================================================================

export interface KSSelectionState {
  colourMounting?: string;        // "10" | "30" | "50" | "70" | "90" | "E0"
  switchType?: string;            // "2" | "3" | "4" | "5"
  electricalArrangement?: string; // "0" | "1" | "2" | "3"
  label?: string;                 // "SAK" | "CL"
}

// ============================================================================
// SKU structure:
//   SS3-{colourMounting}{switchType}{electricalArrangement}[-CL]
//
// Examples:
//   colourMounting=10, switchType=2, electricalArrangement=0, label=SAK → SS3-1020
//   colourMounting=E0, switchType=5, electricalArrangement=3, label=CL  → SS3-E053-CL
//
// Label mapping:
//   "SAK" → code "" (no suffix)
//   "CL"  → code "-CL" (appended as suffix)
// ============================================================================

/**
 * Build SKU from selections.
 * Returns null if any required field is missing.
 */
export function buildKSModelCode(selections: KSSelectionState): string | null {
  const { colourMounting, switchType, electricalArrangement, label } = selections;

  if (!colourMounting || !switchType || !electricalArrangement || !label) {
    return null;
  }

  const base = `SS3-${colourMounting}${switchType}${electricalArrangement}`;
  return label === "CL" ? `${base}-CL` : base;
}

/**
 * Parse SKU back to selections.
 * Returns null if format doesn't match.
 */
export function parseKSModelCode(code: string): KSSelectionState | null {
  // SS3-{cm:2}{st:1}{ea:1}       → 8 chars
  // SS3-{cm:2}{st:1}{ea:1}-CL    → 11 chars
  const match = code.match(/^SS3-([0-9A-Z]{2})(\d)(\d)(-CL)?$/);

  if (!match) {
    return null;
  }

  return {
    colourMounting: match[1],
    switchType: match[2],
    electricalArrangement: match[3],
    label: match[4] ? "CL" : "SAK",
  };
}

/**
 * Validate full combination against whitelist.
 */
export function isValidKSCombination(
  selections: KSSelectionState
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildKSModelCode(selections);

  if (!modelCode) {
    // Incomplete selection — not invalid yet
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

/**
 * Get valid options for a step given other selections (allowlist filter).
 * Iterates VALID_MODEL_CODES, keeps only options that lead to at least one valid SKU.
 */
export function getValidKSOptionsForStep(
  stepId: keyof KSSelectionState,
  otherSelections: Omit<KSSelectionState, typeof stepId>
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseKSModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(otherSelections)) {
      if (value && parsed[key as keyof KSSelectionState] !== value) {
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
// Constraint matrices — pairwise dependencies derived from whitelist
//
// False positives (matrix-valid but not in whitelist): 35
// All caught by allowlist level (getValidKSOptionsForStep / isValidKSCombination).
//
// Label step is NOT in matrices because its availability depends on the full
// triplet (colourMounting + switchType + electricalArrangement), not on any
// single step. Allowlist handles it.
// ============================================================================

// --- colourMounting → switchType ---
const COLOURMOUNTING_TO_SWITCHTYPE: ConstraintMatrix = {
  "10": ["2", "3", "4", "5"],
  "30": ["2", "3", "4"],
  "50": ["2", "3", "4", "5"],
  "70": ["2", "3", "4", "5"],
  "90": ["2", "3", "4"],
  "E0": ["2", "3", "5"],
};

// --- switchType → colourMounting ---
const SWITCHTYPE_TO_COLOURMOUNTING: ConstraintMatrix = {
  "2": ["10", "30", "50", "70", "90", "E0"],
  "3": ["10", "30", "50", "70", "90", "E0"],
  "4": ["10", "30", "50", "70", "90"],
  "5": ["10", "50", "70", "E0"],
};

// --- colourMounting → electricalArrangement ---
const COLOURMOUNTING_TO_ELECTRICALARRANGEMENT: ConstraintMatrix = {
  "10": ["0", "1", "2", "3"],
  "30": ["0", "1", "2"],
  "50": ["0", "1", "2", "3"],
  "70": ["0", "1", "2", "3"],
  "90": ["0", "1", "2"],
  "E0": ["0", "2", "3"],
};

// --- electricalArrangement → colourMounting ---
const ELECTRICALARRANGEMENT_TO_COLOURMOUNTING: ConstraintMatrix = {
  "0": ["10", "30", "50", "70", "90", "E0"],
  "1": ["10", "30", "50", "70", "90"],
  "2": ["10", "30", "50", "70", "90", "E0"],
  "3": ["10", "50", "70", "E0"],
};

// --- switchType → electricalArrangement ---
const SWITCHTYPE_TO_ELECTRICALARRANGEMENT: ConstraintMatrix = {
  "2": ["0"],
  "3": ["0", "1", "2"],
  "4": ["1", "2"],
  "5": ["3"],
};

// --- electricalArrangement → switchType ---
const ELECTRICALARRANGEMENT_TO_SWITCHTYPE: ConstraintMatrix = {
  "0": ["2", "3"],
  "1": ["3", "4"],
  "2": ["3", "4"],
  "3": ["5"],
};

// ============================================================================
// ModelConstraints export (consumed by constraintEngine.ts)
// ============================================================================

export const KEY_SWITCHES_CONSTRAINTS: ModelConstraints = {
  modelId: "key-switches",
  constraints: [
    // colourMounting ↔ switchType
    { sourceStep: "colourMounting", targetStep: "switchType", matrix: COLOURMOUNTING_TO_SWITCHTYPE },
    { sourceStep: "switchType", targetStep: "colourMounting", matrix: SWITCHTYPE_TO_COLOURMOUNTING },

    // colourMounting ↔ electricalArrangement
    { sourceStep: "colourMounting", targetStep: "electricalArrangement", matrix: COLOURMOUNTING_TO_ELECTRICALARRANGEMENT },
    { sourceStep: "electricalArrangement", targetStep: "colourMounting", matrix: ELECTRICALARRANGEMENT_TO_COLOURMOUNTING },

    // switchType ↔ electricalArrangement
    { sourceStep: "switchType", targetStep: "electricalArrangement", matrix: SWITCHTYPE_TO_ELECTRICALARRANGEMENT },
    { sourceStep: "electricalArrangement", targetStep: "switchType", matrix: ELECTRICALARRANGEMENT_TO_SWITCHTYPE },
  ],
};

// ============================================================================
// Debug export
// ============================================================================

export const DEBUG_MATRICES = {
  COLOURMOUNTING_TO_SWITCHTYPE,
  SWITCHTYPE_TO_COLOURMOUNTING,
  COLOURMOUNTING_TO_ELECTRICALARRANGEMENT,
  ELECTRICALARRANGEMENT_TO_COLOURMOUNTING,
  SWITCHTYPE_TO_ELECTRICALARRANGEMENT,
  ELECTRICALARRANGEMENT_TO_SWITCHTYPE,
  VALID_MODEL_CODES,
};