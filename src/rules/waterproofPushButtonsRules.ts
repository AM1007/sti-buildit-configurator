import type { ModelConstraints, ConstraintMatrix } from "./types";

// ─────────────────────────────────────────────────────────────
// ALLOWLIST: Valid Waterproof Push Buttons model codes
// Source: 11_Waterproof_Push_Buttons.md (36 codes)
// Format: WSS3-{housingColour}{buttonColour}{buttonType}4[-CL]
//
// electricalArrangements is always "4" (single option) —
// excluded from SelectionState and constraint matrices.
// ─────────────────────────────────────────────────────────────

export const VALID_MODEL_CODES: readonly string[] = [
  // ── Red housing (1): 3 models ──
  "WSS3-1R04",
  "WSS3-1R04-CL",
  "WSS3-1R14",

  // ── Green housing (3): 6 models ──
  "WSS3-3G04",
  "WSS3-3G14",
  "WSS3-3R04",
  "WSS3-3R14-CL",
  "WSS3-3W04",
  "WSS3-3W14",

  // ── Yellow housing (5): 7 models ──
  "WSS3-5R04",
  "WSS3-5R04-CL",
  "WSS3-5R14",
  "WSS3-5R14-CL",
  "WSS3-5Y04",
  "WSS3-5Y04-CL",
  "WSS3-5Y14",

  // ── White housing (7): 10 models ──
  "WSS3-7B04",
  "WSS3-7B04-CL",
  "WSS3-7B14",
  "WSS3-7G04",
  "WSS3-7G14",
  "WSS3-7G14-CL",
  "WSS3-7R04",
  "WSS3-7R04-CL",
  "WSS3-7R14",
  "WSS3-7W04",
  "WSS3-7W04-CL",

  // ── Blue housing (9): 8 models ──
  "WSS3-9B04",
  "WSS3-9B04-CL",
  "WSS3-9B14",
  "WSS3-9B14-CL",
  "WSS3-9W04",
  "WSS3-9W04-CL",
  "WSS3-9W14",
  "WSS3-9W14-CL",

  // ── Orange housing (E): 1 model ──
  "WSS3-EE04",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ─────────────────────────────────────────────────────────────
// Selection state
//
// electricalArrangements excluded — single option "4",
// no impact on validation or SKU variability.
// ─────────────────────────────────────────────────────────────

export interface WPBSelectionState {
  housingColour?: string;  // 1, 3, 5, 7, 9, E
  buttonColour?: string;   // R, G, Y, W, B, E
  buttonType?: string;     // 0, 1
  label?: string;          // SAK, CL
}

// ─────────────────────────────────────────────────────────────
// Build model code from selections
//
// Label mapping:
//   SAK → no suffix (code = "")
//   CL  → suffix "-CL" (code = "CL", separator "-")
//
// electricalArrangements is hardcoded as "4" in the SKU.
// ─────────────────────────────────────────────────────────────

export function buildWPBModelCode(selections: WPBSelectionState): string | null {
  const { housingColour, buttonColour, buttonType, label } = selections;
  if (!housingColour || !buttonColour || !buttonType || !label) return null;

  const suffix = label === "CL" ? "-CL" : "";
  return `WSS3-${housingColour}${buttonColour}${buttonType}4${suffix}`;
}

// ─────────────────────────────────────────────────────────────
// Parse model code back to selection state
// ─────────────────────────────────────────────────────────────

export function parseWPBModelCode(code: string): WPBSelectionState | null {
  const match = code.match(/^WSS3-([1357E9])([RGYWBE])([01])4(-CL)?$/);
  if (!match) return null;

  return {
    housingColour: match[1],
    buttonColour: match[2],
    buttonType: match[3],
    label: match[4] ? "CL" : "SAK",
  };
}

// ─────────────────────────────────────────────────────────────
// Validate full combination against allowlist
// ─────────────────────────────────────────────────────────────

export function isValidWPBCombination(
  selections: WPBSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildWPBModelCode(selections);

  // Incomplete selection — allow user to continue picking
  if (!modelCode) return { valid: true };

  if (VALID_MODEL_SET.has(modelCode)) return { valid: true };

  return {
    valid: false,
    reason: `Model ${modelCode} is not available. This combination is not in the approved product list.`,
  };
}

// ─────────────────────────────────────────────────────────────
// Get valid options for a specific step given other selections
// ─────────────────────────────────────────────────────────────

export function getValidWPBOptionsForStep(
  stepId: keyof WPBSelectionState,
  currentSelections: Omit<WPBSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseWPBModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof WPBSelectionState] !== value) {
        matches = false;
        break;
      }
    }

    if (matches) {
      const optionValue = parsed[stepId];
      if (optionValue) validOptions.add(optionValue);
    }
  }

  return Array.from(validOptions);
}

// ─────────────────────────────────────────────────────────────
// CONSTRAINT MATRICES
//
// 6 bidirectional pairs = 12 matrices.
// electricalArrangements excluded (single option, no dependencies).
//
// False positives (pass matrices, absent from allowlist): 13.
// Closed by allowlist level in filterOptions.ts.
// ─────────────────────────────────────────────────────────────

const HOUSING_TO_BUTTONCOLOUR: ConstraintMatrix = {
  "1": ["R"],
  "3": ["G", "R", "W"],
  "5": ["R", "Y"],
  "7": ["B", "G", "R", "W"],
  "9": ["B", "W"],
  "E": ["E"],
};

const BUTTONCOLOUR_TO_HOUSING: ConstraintMatrix = {
  "B": ["7", "9"],
  "E": ["E"],
  "G": ["3", "7"],
  "R": ["1", "3", "5", "7"],
  "W": ["3", "7", "9"],
  "Y": ["5"],
};

const HOUSING_TO_BUTTONTYPE: ConstraintMatrix = {
  "1": ["0", "1"],
  "3": ["0", "1"],
  "5": ["0", "1"],
  "7": ["0", "1"],
  "9": ["0", "1"],
  "E": ["0"],
};

const BUTTONTYPE_TO_HOUSING: ConstraintMatrix = {
  "0": ["1", "3", "5", "7", "9", "E"],
  "1": ["1", "3", "5", "7", "9"],
};

const HOUSING_TO_LABEL: ConstraintMatrix = {
  "1": ["CL", "SAK"],
  "3": ["CL", "SAK"],
  "5": ["CL", "SAK"],
  "7": ["CL", "SAK"],
  "9": ["CL", "SAK"],
  "E": ["SAK"],
};

const LABEL_TO_HOUSING: ConstraintMatrix = {
  "CL": ["1", "3", "5", "7", "9"],
  "SAK": ["1", "3", "5", "7", "9", "E"],
};

const BUTTONCOLOUR_TO_BUTTONTYPE: ConstraintMatrix = {
  "B": ["0", "1"],
  "E": ["0"],
  "G": ["0", "1"],
  "R": ["0", "1"],
  "W": ["0", "1"],
  "Y": ["0", "1"],
};

const BUTTONTYPE_TO_BUTTONCOLOUR: ConstraintMatrix = {
  "0": ["B", "E", "G", "R", "W", "Y"],
  "1": ["B", "G", "R", "W", "Y"],
};

const BUTTONCOLOUR_TO_LABEL: ConstraintMatrix = {
  "B": ["CL", "SAK"],
  "E": ["SAK"],
  "G": ["CL", "SAK"],
  "R": ["CL", "SAK"],
  "W": ["CL", "SAK"],
  "Y": ["CL", "SAK"],
};

const LABEL_TO_BUTTONCOLOUR: ConstraintMatrix = {
  "CL": ["B", "G", "R", "W", "Y"],
  "SAK": ["B", "E", "G", "R", "W", "Y"],
};

const BUTTONTYPE_TO_LABEL: ConstraintMatrix = {
  "0": ["CL", "SAK"],
  "1": ["CL", "SAK"],
};

const LABEL_TO_BUTTONTYPE: ConstraintMatrix = {
  "CL": ["0", "1"],
  "SAK": ["0", "1"],
};

// ─────────────────────────────────────────────────────────────
// ModelConstraints export for constraintEngine.ts
// ─────────────────────────────────────────────────────────────

export const WATERPROOF_PUSH_BUTTONS_CONSTRAINTS: ModelConstraints = {
  modelId: "waterproof-push-buttons",
  constraints: [
    { sourceStep: "housingColour", targetStep: "buttonColour", matrix: HOUSING_TO_BUTTONCOLOUR },
    { sourceStep: "buttonColour", targetStep: "housingColour", matrix: BUTTONCOLOUR_TO_HOUSING },

    { sourceStep: "housingColour", targetStep: "buttonType", matrix: HOUSING_TO_BUTTONTYPE },
    { sourceStep: "buttonType", targetStep: "housingColour", matrix: BUTTONTYPE_TO_HOUSING },

    { sourceStep: "housingColour", targetStep: "label", matrix: HOUSING_TO_LABEL },
    { sourceStep: "label", targetStep: "housingColour", matrix: LABEL_TO_HOUSING },

    { sourceStep: "buttonColour", targetStep: "buttonType", matrix: BUTTONCOLOUR_TO_BUTTONTYPE },
    { sourceStep: "buttonType", targetStep: "buttonColour", matrix: BUTTONTYPE_TO_BUTTONCOLOUR },

    { sourceStep: "buttonColour", targetStep: "label", matrix: BUTTONCOLOUR_TO_LABEL },
    { sourceStep: "label", targetStep: "buttonColour", matrix: LABEL_TO_BUTTONCOLOUR },

    { sourceStep: "buttonType", targetStep: "label", matrix: BUTTONTYPE_TO_LABEL },
    { sourceStep: "label", targetStep: "buttonType", matrix: LABEL_TO_BUTTONTYPE },
  ],
};

// ─────────────────────────────────────────────────────────────
// Debug export
// ─────────────────────────────────────────────────────────────

export const DEBUG_MATRICES = {
  HOUSING_TO_BUTTONCOLOUR,
  BUTTONCOLOUR_TO_HOUSING,
  HOUSING_TO_BUTTONTYPE,
  BUTTONTYPE_TO_HOUSING,
  HOUSING_TO_LABEL,
  LABEL_TO_HOUSING,
  BUTTONCOLOUR_TO_BUTTONTYPE,
  BUTTONTYPE_TO_BUTTONCOLOUR,
  BUTTONCOLOUR_TO_LABEL,
  LABEL_TO_BUTTONCOLOUR,
  BUTTONTYPE_TO_LABEL,
  LABEL_TO_BUTTONTYPE,
  VALID_MODEL_CODES,
};