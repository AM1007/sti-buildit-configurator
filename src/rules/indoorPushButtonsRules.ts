import type { ModelConstraints, ConstraintMatrix } from "./types";

// ─────────────────────────────────────────────────────────────
// ALLOWLIST: Valid Indoor Push Buttons model codes
// Source: 10_Indoor_Push_Buttons.md (26 codes, pushButtonType=1, ea=4)
//         11_Indoor_Push_Buttons.md  (9 codes, pushButtonType=6, ea=0)
//         12_Indoor_Push_Buttons.md (24 codes, pushButtonType=0, ea=4)
// Format: SS3-[colour][buttonColour][pushButtonType][electricalArrangements]
// Label "CL" appended as "-CL" by buildProductModel (code: "CL", separator: "-")
// Label "SAK" has empty code — no suffix
// ─────────────────────────────────────────────────────────────

export const VALID_MODEL_CODES: readonly string[] = [
  // ── StopperPush: Momentary (pushButtonType=1, electricalArrangements=4) ──
  // Source: 10_Indoor_Push_Buttons.md — 26 SKU

  // Red housing (colour=1)
  "SS3-1R14",
  "SS3-1R14-CL",
  "SS3-1W14",

  // Green housing (colour=3)
  "SS3-3G14",
  "SS3-3G14-CL",
  "SS3-3W14",
  "SS3-3W14-CL",

  // Yellow housing (colour=5)
  "SS3-5Y14",
  "SS3-5Y14-CL",
  "SS3-5R14",
  "SS3-5R14-CL",
  "SS3-5G14",

  // White housing (colour=7)
  "SS3-7W14",
  "SS3-7W14-CL",
  "SS3-7B14",
  "SS3-7B14-CL",
  "SS3-7G14",
  "SS3-7G14-CL",
  "SS3-7R14",
  "SS3-7R14-CL",

  // Blue housing (colour=9)
  "SS3-9B14",
  "SS3-9B14-CL",
  "SS3-9W14",
  "SS3-9W14-CL",

  // Orange housing (colour=E)
  "SS3-EE14",
  "SS3-EE14-CL",

  // ── StopperLatch: Pneumatic (pushButtonType=6, electricalArrangements=0) ──
  // Source: 11_Indoor_Push_Buttons.md — 9 SKU

  // Green housing (colour=3)
  "SS3-3G60",
  "SS3-3G60-CL",
  "SS3-3W60",
  "SS3-3W60-CL",

  // Yellow housing (colour=5)
  "SS3-5Y60",

  // White housing (colour=7)
  "SS3-7G60",
  "SS3-7G60-CL",
  "SS3-7R60",

  // Blue housing (colour=9)
  "SS3-9R60-CL",

  // ── StopperLatch: Key-to-Reset (pushButtonType=0, electricalArrangements=4) ──
  // Source: 12_Indoor_Push_Buttons.md — 24 SKU

  // Red housing (colour=1)
  "SS3-1R04",
  "SS3-1R04-CL",
  "SS3-1W04",
  "SS3-1W04-CL",

  // Green housing (colour=3)
  "SS3-3G04",
  "SS3-3G04-CL",
  "SS3-3W04",

  // Yellow housing (colour=5)
  "SS3-5Y04",
  "SS3-5Y04-CL",
  "SS3-5G04",
  "SS3-5G04-CL",
  "SS3-5R04",
  "SS3-5R04-CL",

  // White housing (colour=7)
  "SS3-7W04",
  "SS3-7W04-CL",
  "SS3-7B04",
  "SS3-7R04",
  "SS3-7R04-CL",

  // Blue housing (colour=9)
  "SS3-9B04",
  "SS3-9B04-CL",
  "SS3-9W04",
  "SS3-9W04-CL",
  "SS3-9Y04-CL",

  // Orange housing (colour=E)
  "SS3-EE04",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ─────────────────────────────────────────────────────────────
// Selection state
// ─────────────────────────────────────────────────────────────

export interface IPBSelectionState {
  colour?: string;
  buttonColour?: string;
  pushButtonType?: string;
  electricalArrangements?: string;
  label?: string;
}

// ─────────────────────────────────────────────────────────────
// Build model code from selections
//
// Label with code "CL" produces suffix "-CL" via buildProductModel
// (separatorMap.label = "-"). Label "SAK" has code "" — no suffix.
// We replicate this logic here for allowlist validation.
// ─────────────────────────────────────────────────────────────

export function buildIPBModelCode(selections: IPBSelectionState): string | null {
  const { colour, buttonColour, pushButtonType, electricalArrangements, label } = selections;
  if (!colour || !buttonColour || !pushButtonType || !electricalArrangements || !label) {
    return null;
  }

  const base = `SS3-${colour}${buttonColour}${pushButtonType}${electricalArrangements}`;
  return label === "CL" ? `${base}-CL` : base;
}

// ─────────────────────────────────────────────────────────────
// Validate full combination against allowlist
// ─────────────────────────────────────────────────────────────

export function isValidIPBCombination(
  selections: IPBSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildIPBModelCode(selections);

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

export function getValidIPBOptionsForStep(
  stepId: keyof IPBSelectionState,
  currentSelections: Omit<IPBSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseIPBModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof IPBSelectionState] !== value) {
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
// Parse model code back to selection state
// ─────────────────────────────────────────────────────────────

export function parseIPBModelCode(code: string): IPBSelectionState | null {
  // SS3-[colour:1][buttonColour:1][pushButtonType:1][electricalArrangements:1][-CL]?
  const match = code.match(/^SS3-([1-9E])([RGYWBE])(\d)(\d)(?:-(CL))?$/);
  if (!match) return null;

  return {
    colour: match[1],
    buttonColour: match[2],
    pushButtonType: match[3],
    electricalArrangements: match[4],
    label: match[5] ? "CL" : "SAK",
  };
}

// ─────────────────────────────────────────────────────────────
// CONSTRAINT MATRICES
//
// Derived from 59-model allowlist (3 source files).
// Three pushButtonType values are now active:
//   0 (Key-to-Reset)  → electricalArrangements=4 only
//   1 (Momentary)     → electricalArrangements=4 only
//   6 (Pneumatic)     → electricalArrangements=0 only
//
// 27 false positives are caught by allowlist validation.
// ─────────────────────────────────────────────────────────────

// ── colour ↔ buttonColour ──

const COLOUR_TO_BUTTONCOLOUR: ConstraintMatrix = {
  "1": ["R", "W"],
  "3": ["G", "W"],
  "5": ["G", "R", "Y"],
  "7": ["B", "G", "R", "W"],
  "9": ["B", "R", "W", "Y"],
  "E": ["E"],
};

const BUTTONCOLOUR_TO_COLOUR: ConstraintMatrix = {
  "B": ["7", "9"],
  "E": ["E"],
  "G": ["3", "5", "7"],
  "R": ["1", "5", "7", "9"],
  "W": ["1", "3", "7", "9"],
  "Y": ["5", "9"],
};

// ── colour ↔ pushButtonType ──

const COLOUR_TO_PUSHBUTTONTYPE: ConstraintMatrix = {
  "1": ["0", "1"],
  "3": ["0", "1", "6"],
  "5": ["0", "1", "6"],
  "7": ["0", "1", "6"],
  "9": ["0", "1", "6"],
  "E": ["0", "1"],
};

const PUSHBUTTONTYPE_TO_COLOUR: ConstraintMatrix = {
  "0": ["1", "3", "5", "7", "9", "E"],
  "1": ["1", "3", "5", "7", "9", "E"],
  "6": ["3", "5", "7", "9"],
};

// ── colour ↔ electricalArrangements ──

const COLOUR_TO_ELECTRICALARRANGEMENTS: ConstraintMatrix = {
  "1": ["4"],
  "3": ["0", "4"],
  "5": ["0", "4"],
  "7": ["0", "4"],
  "9": ["0", "4"],
  "E": ["4"],
};

const ELECTRICALARRANGEMENTS_TO_COLOUR: ConstraintMatrix = {
  "0": ["3", "5", "7", "9"],
  "4": ["1", "3", "5", "7", "9", "E"],
};

// ── colour ↔ label ──

const COLOUR_TO_LABEL: ConstraintMatrix = {
  "1": ["CL", "SAK"],
  "3": ["CL", "SAK"],
  "5": ["CL", "SAK"],
  "7": ["CL", "SAK"],
  "9": ["CL", "SAK"],
  "E": ["CL", "SAK"],
};

const LABEL_TO_COLOUR: ConstraintMatrix = {
  "CL": ["1", "3", "5", "7", "9", "E"],
  "SAK": ["1", "3", "5", "7", "9", "E"],
};

// ── buttonColour ↔ pushButtonType ──

const BUTTONCOLOUR_TO_PUSHBUTTONTYPE: ConstraintMatrix = {
  "B": ["0", "1"],
  "E": ["0", "1"],
  "G": ["0", "1", "6"],
  "R": ["0", "1", "6"],
  "W": ["0", "1", "6"],
  "Y": ["0", "1", "6"],
};

const PUSHBUTTONTYPE_TO_BUTTONCOLOUR: ConstraintMatrix = {
  "0": ["B", "E", "G", "R", "W", "Y"],
  "1": ["B", "E", "G", "R", "W", "Y"],
  "6": ["G", "R", "W", "Y"],
};

// ── buttonColour ↔ electricalArrangements ──

const BUTTONCOLOUR_TO_ELECTRICALARRANGEMENTS: ConstraintMatrix = {
  "B": ["4"],
  "E": ["4"],
  "G": ["0", "4"],
  "R": ["0", "4"],
  "W": ["0", "4"],
  "Y": ["0", "4"],
};

const ELECTRICALARRANGEMENTS_TO_BUTTONCOLOUR: ConstraintMatrix = {
  "0": ["G", "R", "W", "Y"],
  "4": ["B", "E", "G", "R", "W", "Y"],
};

// ── buttonColour ↔ label ──

const BUTTONCOLOUR_TO_LABEL: ConstraintMatrix = {
  "B": ["CL", "SAK"],
  "E": ["CL", "SAK"],
  "G": ["CL", "SAK"],
  "R": ["CL", "SAK"],
  "W": ["CL", "SAK"],
  "Y": ["CL", "SAK"],
};

const LABEL_TO_BUTTONCOLOUR: ConstraintMatrix = {
  "CL": ["B", "E", "G", "R", "W", "Y"],
  "SAK": ["B", "E", "G", "R", "W", "Y"],
};

// ── pushButtonType ↔ electricalArrangements ──

const PUSHBUTTONTYPE_TO_ELECTRICALARRANGEMENTS: ConstraintMatrix = {
  "0": ["4"],
  "1": ["4"],
  "6": ["0"],
};

const ELECTRICALARRANGEMENTS_TO_PUSHBUTTONTYPE: ConstraintMatrix = {
  "0": ["6"],
  "4": ["0", "1"],
};

// ── pushButtonType ↔ label ──

const PUSHBUTTONTYPE_TO_LABEL: ConstraintMatrix = {
  "0": ["CL", "SAK"],
  "1": ["CL", "SAK"],
  "6": ["CL", "SAK"],
};

const LABEL_TO_PUSHBUTTONTYPE: ConstraintMatrix = {
  "CL": ["0", "1", "6"],
  "SAK": ["0", "1", "6"],
};

// ── electricalArrangements ↔ label ──

const ELECTRICALARRANGEMENTS_TO_LABEL: ConstraintMatrix = {
  "0": ["CL", "SAK"],
  "4": ["CL", "SAK"],
};

const LABEL_TO_ELECTRICALARRANGEMENTS: ConstraintMatrix = {
  "CL": ["0", "4"],
  "SAK": ["0", "4"],
};

// ─────────────────────────────────────────────────────────────
// Exported constraints for constraintEngine
// ─────────────────────────────────────────────────────────────

export const INDOOR_PUSH_BUTTONS_CONSTRAINTS: ModelConstraints = {
  modelId: "indoor-push-buttons",
  constraints: [
    // colour ↔ buttonColour
    { sourceStep: "colour", targetStep: "buttonColour", matrix: COLOUR_TO_BUTTONCOLOUR },
    { sourceStep: "buttonColour", targetStep: "colour", matrix: BUTTONCOLOUR_TO_COLOUR },

    // colour ↔ pushButtonType
    { sourceStep: "colour", targetStep: "pushButtonType", matrix: COLOUR_TO_PUSHBUTTONTYPE },
    { sourceStep: "pushButtonType", targetStep: "colour", matrix: PUSHBUTTONTYPE_TO_COLOUR },

    // colour ↔ electricalArrangements
    { sourceStep: "colour", targetStep: "electricalArrangements", matrix: COLOUR_TO_ELECTRICALARRANGEMENTS },
    { sourceStep: "electricalArrangements", targetStep: "colour", matrix: ELECTRICALARRANGEMENTS_TO_COLOUR },

    // colour ↔ label
    { sourceStep: "colour", targetStep: "label", matrix: COLOUR_TO_LABEL },
    { sourceStep: "label", targetStep: "colour", matrix: LABEL_TO_COLOUR },

    // buttonColour ↔ pushButtonType
    { sourceStep: "buttonColour", targetStep: "pushButtonType", matrix: BUTTONCOLOUR_TO_PUSHBUTTONTYPE },
    { sourceStep: "pushButtonType", targetStep: "buttonColour", matrix: PUSHBUTTONTYPE_TO_BUTTONCOLOUR },

    // buttonColour ↔ electricalArrangements
    { sourceStep: "buttonColour", targetStep: "electricalArrangements", matrix: BUTTONCOLOUR_TO_ELECTRICALARRANGEMENTS },
    { sourceStep: "electricalArrangements", targetStep: "buttonColour", matrix: ELECTRICALARRANGEMENTS_TO_BUTTONCOLOUR },

    // buttonColour ↔ label
    { sourceStep: "buttonColour", targetStep: "label", matrix: BUTTONCOLOUR_TO_LABEL },
    { sourceStep: "label", targetStep: "buttonColour", matrix: LABEL_TO_BUTTONCOLOUR },

    // pushButtonType ↔ electricalArrangements
    { sourceStep: "pushButtonType", targetStep: "electricalArrangements", matrix: PUSHBUTTONTYPE_TO_ELECTRICALARRANGEMENTS },
    { sourceStep: "electricalArrangements", targetStep: "pushButtonType", matrix: ELECTRICALARRANGEMENTS_TO_PUSHBUTTONTYPE },

    // pushButtonType ↔ label
    { sourceStep: "pushButtonType", targetStep: "label", matrix: PUSHBUTTONTYPE_TO_LABEL },
    { sourceStep: "label", targetStep: "pushButtonType", matrix: LABEL_TO_PUSHBUTTONTYPE },

    // electricalArrangements ↔ label
    { sourceStep: "electricalArrangements", targetStep: "label", matrix: ELECTRICALARRANGEMENTS_TO_LABEL },
    { sourceStep: "label", targetStep: "electricalArrangements", matrix: LABEL_TO_ELECTRICALARRANGEMENTS },
  ],
};

// ─────────────────────────────────────────────────────────────
// Debug export
// ─────────────────────────────────────────────────────────────

export const DEBUG_MATRICES = {
  COLOUR_TO_BUTTONCOLOUR,
  BUTTONCOLOUR_TO_COLOUR,
  COLOUR_TO_PUSHBUTTONTYPE,
  PUSHBUTTONTYPE_TO_COLOUR,
  COLOUR_TO_ELECTRICALARRANGEMENTS,
  ELECTRICALARRANGEMENTS_TO_COLOUR,
  COLOUR_TO_LABEL,
  LABEL_TO_COLOUR,
  BUTTONCOLOUR_TO_PUSHBUTTONTYPE,
  PUSHBUTTONTYPE_TO_BUTTONCOLOUR,
  BUTTONCOLOUR_TO_ELECTRICALARRANGEMENTS,
  ELECTRICALARRANGEMENTS_TO_BUTTONCOLOUR,
  BUTTONCOLOUR_TO_LABEL,
  LABEL_TO_BUTTONCOLOUR,
  PUSHBUTTONTYPE_TO_ELECTRICALARRANGEMENTS,
  ELECTRICALARRANGEMENTS_TO_PUSHBUTTONTYPE,
  PUSHBUTTONTYPE_TO_LABEL,
  LABEL_TO_PUSHBUTTONTYPE,
  ELECTRICALARRANGEMENTS_TO_LABEL,
  LABEL_TO_ELECTRICALARRANGEMENTS,
  VALID_MODEL_CODES,
};