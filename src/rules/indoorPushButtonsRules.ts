import type { ModelConstraints, ConstraintMatrix } from "./types";

// ─────────────────────────────────────────────────────────────
// ALLOWLIST: Valid Indoor Push Buttons model codes
// Source: 10_Indoor_Push_Buttons.md (26 codes)
// Format: SS3-{colour}{buttonColour}{pushButtonType}{electricalArrangements}[-CL]
//
// OBSERVATION: All 26 SKUs share pushButtonType=1 and
// electricalArrangements=4. Options 0/6 for pushButtonType
// and 0 for electricalArrangements exist in the step definitions
// but have NO valid SKU. They will be blocked by the allowlist
// layer, not by constraint matrices.
// ─────────────────────────────────────────────────────────────

export const VALID_MODEL_CODES: readonly string[] = [
  // ── Red housing (colour=1): 3 models ──
  "SS3-1R14",
  "SS3-1R14-CL",
  "SS3-1W14",

  // ── Green housing (colour=3): 4 models ──
  "SS3-3G14",
  "SS3-3G14-CL",
  "SS3-3W14",
  "SS3-3W14-CL",

  // ── Yellow housing (colour=5): 5 models ──
  "SS3-5Y14",
  "SS3-5Y14-CL",
  "SS3-5R14",
  "SS3-5R14-CL",
  "SS3-5G14",

  // ── White housing (colour=7): 8 models ──
  "SS3-7W14",
  "SS3-7W14-CL",
  "SS3-7B14",
  "SS3-7B14-CL",
  "SS3-7G14",
  "SS3-7G14-CL",
  "SS3-7R14",
  "SS3-7R14-CL",

  // ── Blue housing (colour=9): 4 models ──
  "SS3-9B14",
  "SS3-9B14-CL",
  "SS3-9W14",
  "SS3-9W14-CL",

  // ── Orange housing (colour=E): 2 models ──
  "SS3-EE14",
  "SS3-EE14-CL",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ─────────────────────────────────────────────────────────────
// Selection state
// ─────────────────────────────────────────────────────────────

export interface IPBSelectionState {
  colour?: string;                // 1, 3, 5, 7, 9, E
  buttonColour?: string;          // R, G, Y, W, B, E
  pushButtonType?: string;        // 0, 1, 6 (only 1 in whitelist)
  electricalArrangements?: string; // 0, 4 (only 4 in whitelist)
  label?: string;                 // SAK, CL
}

// ─────────────────────────────────────────────────────────────
// Build model code from selections
// ─────────────────────────────────────────────────────────────

export function buildIPBModelCode(selections: IPBSelectionState): string | null {
  const { colour, buttonColour, pushButtonType, electricalArrangements, label } = selections;

  if (!colour || !buttonColour || !pushButtonType || !electricalArrangements || !label) {
    return null;
  }

  const base = `SS3-${colour}${buttonColour}${pushButtonType}${electricalArrangements}`;

  if (label === "CL") {
    return `${base}-CL`;
  }

  // ASSUMPTION: label "SAK" produces no suffix.
  // Any other label value also produces no suffix (defensive).
  return base;
}

// ─────────────────────────────────────────────────────────────
// Parse model code back to selections
// ─────────────────────────────────────────────────────────────

export function parseIPBModelCode(code: string): IPBSelectionState | null {
  // SS3-{colour:1}{buttonColour:1}{pushButtonType:1}{electricalArrangements:1}[-CL]
  const match = code.match(
    /^SS3-([13579E])([RGYWBE])(\d)(\d)(?:-(CL))?$/
  );

  if (!match) {
    return null;
  }

  return {
    colour: match[1],
    buttonColour: match[2],
    pushButtonType: match[3],
    electricalArrangements: match[4],
    label: match[5] === "CL" ? "CL" : "SAK",
  };
}

// ─────────────────────────────────────────────────────────────
// Validate full combination against allowlist
// ─────────────────────────────────────────────────────────────

export function isValidIPBCombination(
  selections: IPBSelectionState
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildIPBModelCode(selections);

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

export function getValidIPBOptionsForStep(
  stepId: keyof IPBSelectionState,
  currentSelections: Omit<IPBSelectionState, typeof stepId>
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
// CONSTRAINT MATRICES
//
// Only colour ↔ buttonColour has a real dependency.
// pushButtonType and electricalArrangements are fixed at
// single values in the whitelist (1 and 4 respectively).
// The allowlist layer handles their blocking — no matrices
// needed for those steps.
//
// False positives caught by allowlist (2):
//   SS3-1W14-CL  (colour=1, buttonColour=W, label=CL)
//   SS3-5G14-CL  (colour=5, buttonColour=G, label=CL)
// These pass pairwise colour↔buttonColour but are absent
// from the whitelist. The allowlist closes them.
// ─────────────────────────────────────────────────────────────

const COLOUR_TO_BUTTONCOLOUR: ConstraintMatrix = {
  "1": ["R", "W"],
  "3": ["G", "W"],
  "5": ["Y", "R", "G"],
  "7": ["W", "B", "G", "R"],
  "9": ["B", "W"],
  "E": ["E"],
};

const BUTTONCOLOUR_TO_COLOUR: ConstraintMatrix = {
  "R": ["1", "5", "7"],
  "G": ["3", "5", "7"],
  "Y": ["5"],
  "W": ["1", "3", "7", "9"],
  "B": ["7", "9"],
  "E": ["E"],
};

export const INDOOR_PUSH_BUTTONS_CONSTRAINTS: ModelConstraints = {
  modelId: "indoor-push-buttons",
  constraints: [
    { sourceStep: "colour", targetStep: "buttonColour", matrix: COLOUR_TO_BUTTONCOLOUR },
    { sourceStep: "buttonColour", targetStep: "colour", matrix: BUTTONCOLOUR_TO_COLOUR },
  ],
};

// ─────────────────────────────────────────────────────────────
// Debug export
// ─────────────────────────────────────────────────────────────

export const DEBUG_MATRICES = {
  COLOUR_TO_BUTTONCOLOUR,
  BUTTONCOLOUR_TO_COLOUR,
  VALID_MODEL_CODES,
};