import type { ModelConstraints, ConstraintMatrix } from "./types";

// ─────────────────────────────────────────────────────────────
// ALLOWLIST: Valid ReSet Call Points model codes
// Source: 07_ReSet_Call_Points.md (50 codes)
// Format: RP-[colour][mounting]-[electrical] or
//         RP-[colour][mounting]-[electrical]-CL
//
// Label encoding:
//   HF  = House Flame logo      → RED only, no suffix
//   RM  = Running Man logo       → GREEN only, no suffix
//   SAK = Self-Assemble Kit      → Y/W/B/O, no suffix
//   CL  = Custom Label           → appends "-CL" suffix
// ─────────────────────────────────────────────────────────────

export const VALID_MODEL_CODES: readonly string[] = [
  // ── Red (R): 3 models ──
  "RP-RD2-02",
  "RP-RD2-11",
  "RP-RS2-02",

  // ── Green (G): 9 models ──
  "RP-GD2-02",
  "RP-GD2-02-CL",
  "RP-GD2-11",
  "RP-GD2-11-CL",
  "RP-GF2-02",
  "RP-GF2-02-CL",
  "RP-GF2-11",
  "RP-GS2-02",
  "RP-GS2-11",

  // ── Yellow (Y): 12 models ──
  "RP-YD2-02",
  "RP-YD2-02-CL",
  "RP-YD2-11",
  "RP-YD2-11-CL",
  "RP-YF2-02",
  "RP-YF2-02-CL",
  "RP-YF2-11",
  "RP-YF2-11-CL",
  "RP-YS2-02",
  "RP-YS2-02-CL",
  "RP-YS2-11",
  "RP-YS2-11-CL",

  // ── White (W): 8 models ──
  "RP-WD2-02",
  "RP-WD2-11",
  "RP-WD2-11-CL",
  "RP-WF2-02",
  "RP-WF2-11",
  "RP-WS2-02",
  "RP-WS2-11",
  "RP-WS2-11-CL",

  // ── Blue (B): 9 models ──
  "RP-BD2-02",
  "RP-BD2-02-CL",
  "RP-BD2-11",
  "RP-BD2-11-CL",
  "RP-BF2-02",
  "RP-BS2-02",
  "RP-BS2-02-CL",
  "RP-BS2-11",
  "RP-BS2-11-CL",

  // ── Orange (O): 9 models ──
  "RP-OD2-02",
  "RP-OD2-02-CL",
  "RP-OD2-11",
  "RP-OF2-02-CL",
  "RP-OF2-11",
  "RP-OS2-02",
  "RP-OS2-02-CL",
  "RP-OS2-11",
  "RP-OS2-11-CL",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ─────────────────────────────────────────────────────────────
// Selection state
// ─────────────────────────────────────────────────────────────

export interface RPSelectionState {
  colour?: string;              // R | G | Y | W | B | O
  mounting?: string;            // D2 | S2 | F2
  electricalArrangement?: string; // 02 | 11 (01 and 05 are globally blocked)
  label?: string;               // HF | RM | SAK | CL
}

// ─────────────────────────────────────────────────────────────
// Build model code from selections
//
// Labels HF, RM, SAK do NOT contribute a suffix.
// Label CL appends "-CL" to the code.
// ─────────────────────────────────────────────────────────────

export function buildRPModelCode(selections: RPSelectionState): string | null {
  const { colour, mounting, electricalArrangement, label } = selections;

  if (!colour || !mounting || !electricalArrangement || !label) {
    return null;
  }

  const base = `RP-${colour}${mounting}-${electricalArrangement}`;
  return label === "CL" ? `${base}-CL` : base;
}

// ─────────────────────────────────────────────────────────────
// Parse model code back to selection state
//
// ASSUMPTION: For codes without "-CL" suffix, the label cannot
// be determined from the code alone — it depends on colour:
//   R → HF, G → RM, Y/W/B/O → SAK
// ─────────────────────────────────────────────────────────────

export function parseRPModelCode(code: string): RPSelectionState | null {
  const match = code.match(
    /^RP-([RGYWBO])([DSF]2)-(\d{2})(?:-(CL))?$/
  );

  if (!match) {
    return null;
  }

  const colour = match[1];
  const mounting = match[2];
  const electricalArrangement = match[3];
  const clSuffix = match[4];

  let label: string;
  if (clSuffix === "CL") {
    label = "CL";
  } else {
    // Derive label from colour
    switch (colour) {
      case "R": label = "HF"; break;
      case "G": label = "RM"; break;
      default:  label = "SAK"; break;
    }
  }

  return { colour, mounting, electricalArrangement, label };
}

// ─────────────────────────────────────────────────────────────
// Validate full combination against allowlist
// ─────────────────────────────────────────────────────────────

export function isValidRPCombination(
  selections: RPSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildRPModelCode(selections);

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
// Used by filterOptions to disable unavailable options
// ─────────────────────────────────────────────────────────────

export function getValidRPOptionsForStep(
  stepId: keyof RPSelectionState,
  currentSelections: Omit<RPSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseRPModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof RPSelectionState] !== value) {
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
// Derived from 50 valid model codes.
//
// NOTE: 14 false positives exist when using only pairwise
// matrices (combinations that pass all pairwise checks but
// are NOT in the whitelist). The allowlist functions above
// (isValidRPCombination, getValidRPOptionsForStep) provide
// the definitive validation. Matrices provide fast UI-level
// filtering; the allowlist is the final gate.
// ─────────────────────────────────────────────────────────────

// ── colour ↔ mounting ──

const COLOUR_TO_MOUNTING: ConstraintMatrix = {
  "R": ["D2", "S2"],
  "G": ["D2", "F2", "S2"],
  "Y": ["D2", "F2", "S2"],
  "W": ["D2", "F2", "S2"],
  "B": ["D2", "F2", "S2"],
  "O": ["D2", "F2", "S2"],
};

const MOUNTING_TO_COLOUR: ConstraintMatrix = {
  "D2": ["R", "G", "Y", "W", "B", "O"],
  "F2": ["G", "Y", "W", "B", "O"],
  "S2": ["R", "G", "Y", "W", "B", "O"],
};

// ── colour ↔ electricalArrangement ──

const COLOUR_TO_ELECTRICAL: ConstraintMatrix = {
  "R": ["02", "11"],
  "G": ["02", "11"],
  "Y": ["02", "11"],
  "W": ["02", "11"],
  "B": ["02", "11"],
  "O": ["02", "11"],
};

const ELECTRICAL_TO_COLOUR: ConstraintMatrix = {
  "02": ["R", "G", "Y", "W", "B", "O"],
  "11": ["R", "G", "Y", "W", "B", "O"],
};

// ── colour ↔ label ──

const COLOUR_TO_LABEL: ConstraintMatrix = {
  "R": ["HF"],
  "G": ["RM", "CL"],
  "Y": ["SAK", "CL"],
  "W": ["SAK", "CL"],
  "B": ["SAK", "CL"],
  "O": ["SAK", "CL"],
};

const LABEL_TO_COLOUR: ConstraintMatrix = {
  "HF": ["R"],
  "RM": ["G"],
  "SAK": ["Y", "W", "B", "O"],
  "CL": ["G", "Y", "W", "B", "O"],
};

// ── mounting ↔ electricalArrangement ──

const MOUNTING_TO_ELECTRICAL: ConstraintMatrix = {
  "D2": ["02", "11"],
  "F2": ["02", "11"],
  "S2": ["02", "11"],
};

const ELECTRICAL_TO_MOUNTING: ConstraintMatrix = {
  "02": ["D2", "F2", "S2"],
  "11": ["D2", "F2", "S2"],
};

// ── mounting ↔ label ──

const MOUNTING_TO_LABEL: ConstraintMatrix = {
  "D2": ["HF", "RM", "SAK", "CL"],
  "F2": ["RM", "SAK", "CL"],
  "S2": ["HF", "RM", "SAK", "CL"],
};

const LABEL_TO_MOUNTING: ConstraintMatrix = {
  "HF": ["D2", "S2"],
  "RM": ["D2", "F2", "S2"],
  "SAK": ["D2", "F2", "S2"],
  "CL": ["D2", "F2", "S2"],
};

// ── electricalArrangement ↔ label ──

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

export const RESET_CALL_POINTS_CONSTRAINTS: ModelConstraints = {
  modelId: "reset-call-points",
  constraints: [
    { sourceStep: "colour", targetStep: "mounting", matrix: COLOUR_TO_MOUNTING },
    { sourceStep: "mounting", targetStep: "colour", matrix: MOUNTING_TO_COLOUR },

    { sourceStep: "colour", targetStep: "electricalArrangement", matrix: COLOUR_TO_ELECTRICAL },
    { sourceStep: "electricalArrangement", targetStep: "colour", matrix: ELECTRICAL_TO_COLOUR },

    { sourceStep: "colour", targetStep: "label", matrix: COLOUR_TO_LABEL },
    { sourceStep: "label", targetStep: "colour", matrix: LABEL_TO_COLOUR },

    { sourceStep: "mounting", targetStep: "electricalArrangement", matrix: MOUNTING_TO_ELECTRICAL },
    { sourceStep: "electricalArrangement", targetStep: "mounting", matrix: ELECTRICAL_TO_MOUNTING },

    { sourceStep: "mounting", targetStep: "label", matrix: MOUNTING_TO_LABEL },
    { sourceStep: "label", targetStep: "mounting", matrix: LABEL_TO_MOUNTING },

    { sourceStep: "electricalArrangement", targetStep: "label", matrix: ELECTRICAL_TO_LABEL },
    { sourceStep: "label", targetStep: "electricalArrangement", matrix: LABEL_TO_ELECTRICAL },
  ],
};

// ─────────────────────────────────────────────────────────────
// Debug export (matches G3 / StopperStations pattern)
// ─────────────────────────────────────────────────────────────

export const DEBUG_MATRICES = {
  COLOUR_TO_MOUNTING,
  MOUNTING_TO_COLOUR,
  COLOUR_TO_ELECTRICAL,
  ELECTRICAL_TO_COLOUR,
  COLOUR_TO_LABEL,
  LABEL_TO_COLOUR,
  MOUNTING_TO_ELECTRICAL,
  ELECTRICAL_TO_MOUNTING,
  MOUNTING_TO_LABEL,
  LABEL_TO_MOUNTING,
  ELECTRICAL_TO_LABEL,
  LABEL_TO_ELECTRICAL,
  VALID_MODEL_CODES,
};