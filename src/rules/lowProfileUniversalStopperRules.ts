import type { ModelConstraints, ConstraintMatrix } from "./types";

// ─────────────────────────────────────────────────────────────
// ALLOWLIST: Valid Low Profile Universal Stopper model codes
// Source: 06_Low_Profile_Universal_Stopper.md (14 codes)
// Format: STI-14[mounting][hoodSounder][colourLabel]
//   mounting:    0=flush, 1=surface (dual mount), 2=surface+frame
//   hoodSounder: 00=none, 10=label hood, 20=sounder
//   colourLabel: 2-char code (FR, EG, NC, NW, CY, NY)
//
// Cover is always "14" (Low Profile) — hardcoded in baseCode.
// Language is not encoded in SKU (always English).
// ─────────────────────────────────────────────────────────────

export const VALID_MODEL_CODES: readonly string[] = [
  // ── Mounting 0 (Flush): 5 models ──
  "STI-14000NC",
  "STI-14010EG",
  "STI-14010NY",
  "STI-14020FR",
  "STI-14020EG",

  // ── Mounting 1 (Surface, Dual Mount): 7 models ──
  "STI-14100NC",
  "STI-14110FR",
  "STI-14110EG",
  "STI-14110CY",
  "STI-14110NY",
  "STI-14120FR",
  "STI-14120EG",

  // ── Mounting 2 (Surface + Frame): 2 models ──
  "STI-14200NW",
  "STI-14220CY",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ─────────────────────────────────────────────────────────────
// Allowlist selection state
// ─────────────────────────────────────────────────────────────

export interface LPUSSelectionState {
  mounting?: string;
  hoodSounder?: string;
  colourLabel?: string;
}

// ─────────────────────────────────────────────────────────────
// Build model code from selections
// ─────────────────────────────────────────────────────────────

export function buildLPUSModelCode(selections: LPUSSelectionState): string | null {
  const { mounting, hoodSounder, colourLabel } = selections;
  if (!mounting || !hoodSounder || !colourLabel) return null;

  return `STI-14${mounting}${hoodSounder}${colourLabel}`;
}

// ─────────────────────────────────────────────────────────────
// Parse model code back to selection state
// ─────────────────────────────────────────────────────────────

export function parseLPUSModelCode(code: string): LPUSSelectionState | null {
  const match = code.match(/^STI-14(\d)(\d{2})([A-Z]{2})$/);
  if (!match) return null;

  return {
    mounting: match[1],
    hoodSounder: match[2],
    colourLabel: match[3],
  };
}

// ─────────────────────────────────────────────────────────────
// Validate full combination against allowlist
// ─────────────────────────────────────────────────────────────

export function isValidLPUSCombination(
  selections: LPUSSelectionState,
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildLPUSModelCode(selections);

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

export function getValidLPUSOptionsForStep(
  stepId: keyof LPUSSelectionState,
  currentSelections: Omit<LPUSSelectionState, typeof stepId>,
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseLPUSModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof LPUSSelectionState] !== value) {
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
// Source: computed from 06_Low_Profile_Universal_Stopper.md (14 SKUs)
// False positives (2): STI-14010FR, STI-14120CY
// Closed by allowlist validation above.
// ─────────────────────────────────────────────────────────────

const MOUNTING_TO_HOODSOUDER: ConstraintMatrix = {
  "0": ["00", "10", "20"],
  "1": ["00", "10", "20"],
  "2": ["00", "20"],
};

const HOODSOUDER_TO_MOUNTING: ConstraintMatrix = {
  "00": ["0", "1", "2"],
  "10": ["0", "1"],
  "20": ["0", "1", "2"],
};

const MOUNTING_TO_COLOURLABEL: ConstraintMatrix = {
  "0": ["NC", "EG", "NY", "FR"],
  "1": ["NC", "FR", "EG", "CY", "NY"],
  "2": ["NW", "CY"],
};

const COLOURLABEL_TO_MOUNTING: ConstraintMatrix = {
  "NC": ["0", "1"],
  "EG": ["0", "1"],
  "NY": ["0", "1"],
  "FR": ["0", "1"],
  "CY": ["1", "2"],
  "NW": ["2"],
};

const HOODSOUDER_TO_COLOURLABEL: ConstraintMatrix = {
  "00": ["NC", "NW"],
  "10": ["EG", "NY", "FR", "CY"],
  "20": ["FR", "EG", "CY"],
};

const COLOURLABEL_TO_HOODSOUDER: ConstraintMatrix = {
  "NC": ["00"],
  "NW": ["00"],
  "EG": ["10", "20"],
  "NY": ["10"],
  "FR": ["10", "20"],
  "CY": ["10", "20"],
};

// ─────────────────────────────────────────────────────────────
// Exported constraints for constraint engine
// ─────────────────────────────────────────────────────────────

export const LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS: ModelConstraints = {
  modelId: "low-profile-universal-stopper",
  constraints: [
    { sourceStep: "mounting", targetStep: "hoodSounder", matrix: MOUNTING_TO_HOODSOUDER },
    { sourceStep: "hoodSounder", targetStep: "mounting", matrix: HOODSOUDER_TO_MOUNTING },

    { sourceStep: "mounting", targetStep: "colourLabel", matrix: MOUNTING_TO_COLOURLABEL },
    { sourceStep: "colourLabel", targetStep: "mounting", matrix: COLOURLABEL_TO_MOUNTING },

    { sourceStep: "hoodSounder", targetStep: "colourLabel", matrix: HOODSOUDER_TO_COLOURLABEL },
    { sourceStep: "colourLabel", targetStep: "hoodSounder", matrix: COLOURLABEL_TO_HOODSOUDER },
  ],
};

// ─────────────────────────────────────────────────────────────
// Debug export for verification
// ─────────────────────────────────────────────────────────────

export const DEBUG_MATRICES = {
  MOUNTING_TO_HOODSOUDER,
  HOODSOUDER_TO_MOUNTING,
  MOUNTING_TO_COLOURLABEL,
  COLOURLABEL_TO_MOUNTING,
  HOODSOUDER_TO_COLOURLABEL,
  COLOURLABEL_TO_HOODSOUDER,
  VALID_MODEL_CODES,
};