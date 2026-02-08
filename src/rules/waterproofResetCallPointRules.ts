import type { ConstraintMatrix, ModelConstraints } from "./types";

// ─────────────────────────────────────────────────────────────
// ALLOWLIST: Valid Waterproof ReSet Call Point model codes
// Source: 08_Waterproof_ReSet_Call_Point.md (23 codes)
// Format: WRP2-{colour}-{electrical}[-CL]
//
// Label mapping to SKU:
//   HF (House Flame)       → no suffix
//   RM (Running Man)       → no suffix
//   SAK (Self-Assemble Kit)→ no suffix
//   CL (Custom Label)      → suffix "-CL"
// ─────────────────────────────────────────────────────────────

export const VALID_MODEL_CODES: readonly string[] = [
  // ── Red (colour=R): 3 models ──
  "WRP2-R-02",
  "WRP2-R-11",
  "WRP2-R-11-CL",

  // ── Green (colour=G): 4 models ──
  "WRP2-G-02",
  "WRP2-G-02-CL",
  "WRP2-G-11",
  "WRP2-G-11-CL",

  // ── Yellow (colour=Y): 4 models ──
  "WRP2-Y-02",
  "WRP2-Y-02-CL",
  "WRP2-Y-11",
  "WRP2-Y-11-CL",

  // ── White (colour=W): 4 models ──
  "WRP2-W-02",
  "WRP2-W-02-CL",
  "WRP2-W-11",
  "WRP2-W-11-CL",

  // ── Blue (colour=B): 4 models ──
  "WRP2-B-02",
  "WRP2-B-02-CL",
  "WRP2-B-11",
  "WRP2-B-11-CL",

  // ── Orange (colour=O): 4 models ──
  "WRP2-O-02",
  "WRP2-O-02-CL",
  "WRP2-O-11",
  "WRP2-O-11-CL",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ─────────────────────────────────────────────────────────────
// Selection state
// ─────────────────────────────────────────────────────────────

export interface WRPSelectionState {
  colour?: string;
  electricalArrangement?: string;
  label?: string;
}

// ─────────────────────────────────────────────────────────────
// Build model code from selections
//
// Label mapping:
//   HF, RM, SAK → no suffix (default label for that colour)
//   CL          → appends "-CL"
// ─────────────────────────────────────────────────────────────

export function buildWRPModelCode(selections: WRPSelectionState): string | null {
  const { colour, electricalArrangement, label } = selections;
  if (!colour || !electricalArrangement || !label) return null;

  const base = `WRP2-${colour}-${electricalArrangement}`;
  if (label === "CL") return `${base}-CL`;
  return base;
}

// ─────────────────────────────────────────────────────────────
// Parse model code back to selection state
//
// Returns label as "CL" if suffix present; otherwise null
// for label — the caller must infer default label from colour.
//
// ASSUMPTION: Without "-CL" suffix the label cannot be
// determined from the code alone (HF vs RM vs SAK depends
// on colour). parseWRPModelCode returns label=undefined in
// that case. This does NOT affect forward validation.
// ─────────────────────────────────────────────────────────────

export function parseWRPModelCode(code: string): WRPSelectionState | null {
  // WRP2-{colour:1}-{electrical:2}[-CL]
  const match = code.match(/^WRP2-([RGYBWO])-(\d{2})(-CL)?$/);
  if (!match) return null;

  const result: WRPSelectionState = {
    colour: match[1],
    electricalArrangement: match[2],
  };

  if (match[3]) {
    result.label = "CL";
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// Validate full combination against allowlist
// ─────────────────────────────────────────────────────────────

export function isValidWRPCombination(
  selections: WRPSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildWRPModelCode(selections);

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
// Used by filterOptions allowlist layer
// ─────────────────────────────────────────────────────────────

export function getValidWRPOptionsForStep(
  stepId: keyof WRPSelectionState,
  currentSelections: Omit<WRPSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseWRPModelCode(code);
    if (!parsed) continue;

    // For non-CL codes, infer label from colour
    if (!parsed.label) {
      parsed.label = getDefaultLabelForColour(parsed.colour!);
    }

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof WRPSelectionState] !== value) {
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

/**
 * Maps colour to its default (non-CL) label.
 * Used during allowlist filtering to resolve ambiguity
 * in parsed codes without "-CL" suffix.
 */
function getDefaultLabelForColour(colour: string): string {
  switch (colour) {
    case "R": return "HF";
    case "G": return "RM";
    default:  return "SAK"; // Y, B, W, O
  }
}

// ─────────────────────────────────────────────────────────────
// CONSTRAINT MATRICES
//
// Derived from 23-code whitelist analysis.
// Electrical arrangement "01" does NOT exist in whitelist.
//
// False positives (pass matrices, absent from whitelist): 1
//   R + 02 + CL → WRP2-R-02-CL (closed by allowlist)
// ─────────────────────────────────────────────────────────────

const COLOUR_TO_ELECTRICAL: ConstraintMatrix = {
  "R": ["02", "11"],
  "G": ["02", "11"],
  "Y": ["02", "11"],
  "B": ["02", "11"],
  "W": ["02", "11"],
  "O": ["02", "11"],
};

const ELECTRICAL_TO_COLOUR: ConstraintMatrix = {
  "02": ["R", "G", "Y", "B", "W", "O"],
  "11": ["R", "G", "Y", "B", "W", "O"],
};

const COLOUR_TO_LABEL: ConstraintMatrix = {
  "R": ["HF", "CL"],
  "G": ["RM", "CL"],
  "Y": ["SAK", "CL"],
  "B": ["SAK", "CL"],
  "W": ["SAK", "CL"],
  "O": ["SAK", "CL"],
};

const LABEL_TO_COLOUR: ConstraintMatrix = {
  "HF": ["R"],
  "RM": ["G"],
  "SAK": ["Y", "B", "W", "O"],
  "CL": ["R", "G", "Y", "B", "W", "O"],
};

const ELECTRICAL_TO_LABEL: ConstraintMatrix = {
  "02": ["HF", "RM", "SAK", "CL"],
  "11": ["HF", "RM", "SAK", "CL"],
};

const LABEL_TO_ELECTRICAL: ConstraintMatrix = {
  "HF": ["02", "11"],
  "RM": ["02", "11"],
  "SAK": ["02", "11"],
  "CL": ["02", "11"],
};

// ─────────────────────────────────────────────────────────────
// Exported constraints for constraintEngine
// ─────────────────────────────────────────────────────────────

export const WATERPROOF_RESET_CALL_POINT_CONSTRAINTS: ModelConstraints = {
  modelId: "waterproof-reset-call-point",
  constraints: [
    {
      sourceStep: "colour",
      targetStep: "electricalArrangement",
      matrix: COLOUR_TO_ELECTRICAL,
    },
    {
      sourceStep: "electricalArrangement",
      targetStep: "colour",
      matrix: ELECTRICAL_TO_COLOUR,
    },
    {
      sourceStep: "colour",
      targetStep: "label",
      matrix: COLOUR_TO_LABEL,
    },
    {
      sourceStep: "label",
      targetStep: "colour",
      matrix: LABEL_TO_COLOUR,
    },
    {
      sourceStep: "electricalArrangement",
      targetStep: "label",
      matrix: ELECTRICAL_TO_LABEL,
    },
    {
      sourceStep: "label",
      targetStep: "electricalArrangement",
      matrix: LABEL_TO_ELECTRICAL,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// Debug export
// ─────────────────────────────────────────────────────────────

export const DEBUG_MATRICES = {
  COLOUR_TO_ELECTRICAL,
  ELECTRICAL_TO_COLOUR,
  COLOUR_TO_LABEL,
  LABEL_TO_COLOUR,
  ELECTRICAL_TO_LABEL,
  LABEL_TO_ELECTRICAL,
  VALID_MODEL_CODES,
};