import type { ModelConstraints, ConstraintMatrix } from "./types";

// ─────────────────────────────────────────────────────────────
// ALLOWLIST: Valid Call Point Stopper model codes
// Source: 12_Call_Point_Stopper.md (26 codes)
// Format: STI-693{mounting}[-{colour}][-{label}]
//
// mounting:  0 = Flush (31mm),  1 = Surface (66mm)
// colour:    (none) = Red,  -G -Y -W -B -E
// label:     (none) = standard text,  -CL = custom,  -PLAIN = no text
// ─────────────────────────────────────────────────────────────

export const VALID_MODEL_CODES: readonly string[] = [
  // ── Flush mount (STI-6930): 10 models ──
  "STI-6930",
  "STI-6930-PLAIN",
  "STI-6930-G",
  "STI-6930-G-PLAIN",
  "STI-6930-Y",
  "STI-6930-Y-CL",
  "STI-6930-W",
  "STI-6930-W-PLAIN",
  "STI-6930-B",
  "STI-6930-E",

  // ── Surface mount (STI-6931): 16 models ──
  "STI-6931",
  "STI-6931-CL",
  "STI-6931-PLAIN",
  "STI-6931-G",
  "STI-6931-G-PLAIN",
  "STI-6931-Y",
  "STI-6931-Y-CL",
  "STI-6931-Y-PLAIN",
  "STI-6931-W",
  "STI-6931-W-PLAIN",
  "STI-6931-B",
  "STI-6931-B-CL",
  "STI-6931-B-PLAIN",
  "STI-6931-E",
  "STI-6931-E-CL",
  "STI-6931-E-PLAIN",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ─────────────────────────────────────────────────────────────
// Selection state
// ─────────────────────────────────────────────────────────────

export interface CPSSelectionState {
  mounting?: string;  // "0" | "1"
  colour?: string;    // "R" | "G" | "Y" | "W" | "B" | "E"
  label?: string;     // "FIRE" | "EMERGENCY_DOOR" | "EMERGENCY_OPERATE" | "CL" | "PLAIN"
}

// ─────────────────────────────────────────────────────────────
// Build model code from selections
//
// SKU structure (from MD):
//   STI-693{mounting} = base
//   colour: R → no suffix, G/Y/W/B/E → -{letter}
//   label:  standard → no suffix, CL → -CL, PLAIN → -PLAIN
//
// ASSUMPTION: label option ids (FIRE, EMERGENCY_DOOR,
// EMERGENCY_OPERATE) represent the "standard text" variant for
// each colour and map to no suffix in SKU. If the product owner
// changes label semantics, this mapping must be updated.
// ─────────────────────────────────────────────────────────────

const COLOUR_TO_SKU_SUFFIX: Record<string, string> = {
  "R": "",
  "G": "-G",
  "Y": "-Y",
  "W": "-W",
  "B": "-B",
  "E": "-E",
};

const LABEL_TO_SKU_SUFFIX: Record<string, string> = {
  "FIRE": "",
  "EMERGENCY_DOOR": "",
  "EMERGENCY_OPERATE": "",
  "CL": "-CL",
  "PLAIN": "-PLAIN",
};

export function buildCPSModelCode(selections: CPSSelectionState): string | null {
  const { mounting, colour, label } = selections;

  if (!mounting || !colour || !label) {
    return null;
  }

  const colourSuffix = COLOUR_TO_SKU_SUFFIX[colour];
  const labelSuffix = LABEL_TO_SKU_SUFFIX[label];

  if (colourSuffix === undefined || labelSuffix === undefined) {
    return null;
  }

  return `STI-693${mounting}${colourSuffix}${labelSuffix}`;
}

// ─────────────────────────────────────────────────────────────
// Parse model code back to selection state
// ─────────────────────────────────────────────────────────────

const SKU_COLOUR_MAP: Record<string, string> = {
  "": "R",
  "G": "G",
  "Y": "Y",
  "W": "W",
  "B": "B",
  "E": "E",
};

// Standard label per colour (when no label suffix present)
const COLOUR_TO_STANDARD_LABEL: Record<string, string> = {
  "R": "FIRE",
  "G": "EMERGENCY_DOOR",
  "Y": "EMERGENCY_OPERATE",
  "W": "EMERGENCY_OPERATE",
  "B": "EMERGENCY_OPERATE",
  "E": "EMERGENCY_OPERATE",
};

export function parseCPSModelCode(code: string): CPSSelectionState | null {
  // Pattern: STI-693{0|1}[-{G|Y|W|B|E}][-{CL|PLAIN}]
  const match = code.match(
    /^STI-693([01])(?:-(G|Y|W|B|E))?(?:-(CL|PLAIN))?$/
  );

  if (!match) {
    return null;
  }

  const mounting = match[1];
  const colourCode = match[2] ?? "";
  const labelCode = match[3] ?? "";

  const colour = SKU_COLOUR_MAP[colourCode];
  if (!colour) {
    return null;
  }

  let label: string;
  if (labelCode === "CL") {
    label = "CL";
  } else if (labelCode === "PLAIN") {
    label = "PLAIN";
  } else {
    // No label suffix → standard text for this colour
    label = COLOUR_TO_STANDARD_LABEL[colour];
  }

  return { mounting, colour, label };
}

// ─────────────────────────────────────────────────────────────
// Validate full combination against allowlist
// ─────────────────────────────────────────────────────────────

export function isValidCPSCombination(
  selections: CPSSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildCPSModelCode(selections);

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

export function getValidCPSOptionsForStep(
  stepId: keyof CPSSelectionState,
  currentSelections: Omit<CPSSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseCPSModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof CPSSelectionState] !== value) {
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
// Constraint matrices
//
// 3 steps → 3 pairs → 6 directional matrices.
//
// mounting↔colour: fully independent (all 2×6 combinations
// exist in whitelist) → NO matrix needed.
//
// mounting↔label: CL appears in both mounting=0 (Y-CL) and
// mounting=1 (R,Y,B,E). All 5 labels appear for both mountings.
// → fully independent → NO matrix needed.
//
// colour↔label: the ONLY pair with real constraints.
// Derived by scanning all 26 SKU.
//
// False positives from pairwise matrices (pass matrices but
// fail allowlist): 6 combinations — all Flush mount (mounting=0):
//   STI-6930-CL        (R + CL)
//   STI-6930-Y-PLAIN   (Y + PLAIN)
//   STI-6930-B-CL      (B + CL)
//   STI-6930-B-PLAIN   (B + PLAIN)
//   STI-6930-E-CL      (E + CL)
//   STI-6930-E-PLAIN   (E + PLAIN)
//
// All 6 closed by allowlist level.
// ─────────────────────────────────────────────────────────────

const COLOUR_TO_LABEL: ConstraintMatrix = {
  "R": ["FIRE", "CL", "PLAIN"],
  "G": ["EMERGENCY_DOOR", "PLAIN"],
  "Y": ["EMERGENCY_OPERATE", "CL", "PLAIN"],
  "W": ["EMERGENCY_OPERATE", "PLAIN"],
  "B": ["EMERGENCY_OPERATE", "CL", "PLAIN"],
  "E": ["EMERGENCY_OPERATE", "CL", "PLAIN"],
};

const LABEL_TO_COLOUR: ConstraintMatrix = {
  "FIRE": ["R"],
  "EMERGENCY_DOOR": ["G"],
  "EMERGENCY_OPERATE": ["Y", "W", "B", "E"],
  "CL": ["R", "Y", "B", "E"],
  "PLAIN": ["R", "G", "Y", "W", "B", "E"],
};

// ─────────────────────────────────────────────────────────────
// Exported constraints for constraintEngine
// ─────────────────────────────────────────────────────────────

export const CALL_POINT_STOPPER_CONSTRAINTS: ModelConstraints = {
  modelId: "call-point-stopper",
  constraints: [
    { sourceStep: "colour", targetStep: "label", matrix: COLOUR_TO_LABEL },
    { sourceStep: "label", targetStep: "colour", matrix: LABEL_TO_COLOUR },
  ],
};

// ─────────────────────────────────────────────────────────────
// Debug export
// ─────────────────────────────────────────────────────────────

export const DEBUG_MATRICES = {
  COLOUR_TO_LABEL,
  LABEL_TO_COLOUR,
  VALID_MODEL_CODES,
};