import type { ModelConstraints, ConstraintMatrix } from "./types";

// ─────────────────────────────────────────────────────────────
// ALLOWLIST: Valid Global ReSet model codes
// Source: 05_Global_ReSet.md (13 codes)
// Format: GLR{colour:1}{cover:2}{text:2}-{language:2}
// Cover is always "01", Language is always "EN"
// ─────────────────────────────────────────────────────────────

export const VALID_MODEL_CODES: readonly string[] = [
  // ── Red (colour=0): 1 model ──
  "GLR001ZA-EN",

  // ── Green (colour=1): 3 models ──
  "GLR101EM-EN",
  "GLR101EX-EN",
  "GLR101RM-EN",

  // ── Yellow (colour=2): 4 models ──
  "GLR201EX-EN",
  "GLR201NT-EN",
  "GLR201PS-EN",
  "GLR201ZA-EN",

  // ── White (colour=3): 1 model ──
  "GLR301ZA-EN",

  // ── Blue (colour=4): 4 models ──
  "GLR401EM-EN",
  "GLR401EV-EN",
  "GLR401LD-EN",
  "GLR401ZA-EN",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ─────────────────────────────────────────────────────────────
// Selection state interface
// ─────────────────────────────────────────────────────────────

export interface GLRSelectionState {
  colour?: string;
  cover?: string;
  text?: string;
  language?: string;
}

// ─────────────────────────────────────────────────────────────
// Build model code from selections
// ─────────────────────────────────────────────────────────────

export function buildGLRModelCode(selections: GLRSelectionState): string | null {
  const { colour, cover, text, language } = selections;

  if (!colour || !cover || !text || !language) {
    return null;
  }

  return `GLR${colour}${cover}${text}-${language}`;
}

// ─────────────────────────────────────────────────────────────
// Validate full combination against allowlist
// ─────────────────────────────────────────────────────────────

export function isValidGLRCombination(
  selections: GLRSelectionState
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildGLRModelCode(selections);

  // Incomplete selection — allow user to continue picking
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

// ─────────────────────────────────────────────────────────────
// Get valid options for a specific step given other selections
// Used by filterOptions to disable unavailable options
// ─────────────────────────────────────────────────────────────

export function getValidGLROptionsForStep(
  stepId: keyof GLRSelectionState,
  currentSelections: Omit<GLRSelectionState, typeof stepId>
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseGLRModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof GLRSelectionState] !== value) {
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

// ─────────────────────────────────────────────────────────────
// Parse model code back to selection state
// ─────────────────────────────────────────────────────────────

export function parseGLRModelCode(code: string): GLRSelectionState | null {
  // GLR{colour:1}{cover:2}{text:2}-{language:2}
  // Example: GLR001ZA-EN
  const match = code.match(/^GLR(\d)(\d{2})([A-Z]{2})-([A-Z]{2})$/);

  if (!match) {
    return null;
  }

  return {
    colour: match[1],
    cover: match[2],
    text: match[3],
    language: match[4],
  };
}

// ─────────────────────────────────────────────────────────────
// CONSTRAINT MATRICES
// Derived from VALID_MODEL_CODES
// Cover and Language are fixed ("01" and "EN") — no matrices needed
// ─────────────────────────────────────────────────────────────

const COLOUR_TO_TEXT: ConstraintMatrix = {
  "0": ["ZA"],
  "1": ["EM", "EX", "RM"],
  "2": ["EX", "NT", "PS", "ZA"],
  "3": ["ZA"],
  "4": ["EM", "EV", "LD", "ZA"],
};

const TEXT_TO_COLOUR: ConstraintMatrix = {
  "EM": ["1", "4"],
  "EV": ["4"],
  "EX": ["1", "2"],
  "LD": ["4"],
  "NT": ["2"],
  "PS": ["2"],
  "RM": ["1"],
  "ZA": ["0", "2", "3", "4"],
};

// ─────────────────────────────────────────────────────────────
// Commented out: unused matrices for fixed steps
// ─────────────────────────────────────────────────────────────

// const COLOUR_TO_COVER: ConstraintMatrix = {
//   "0": ["01"],
//   "1": ["01"],
//   "2": ["01"],
//   "3": ["01"],
//   "4": ["01"],
// };

// const COVER_TO_COLOUR: ConstraintMatrix = {
//   "01": ["0", "1", "2", "3", "4"],
//   // "21": [],  // shield — no valid models
// };

// const COLOUR_TO_LANGUAGE: ConstraintMatrix = {
//   "0": ["EN"],
//   "1": ["EN"],
//   "2": ["EN"],
//   "3": ["EN"],
//   "4": ["EN"],
// };

// const LANGUAGE_TO_COLOUR: ConstraintMatrix = {
//   "EN": ["0", "1", "2", "3", "4"],
// };

// const TEXT_TO_LANGUAGE: ConstraintMatrix = {
//   "EM": ["EN"],
//   "EV": ["EN"],
//   "EX": ["EN"],
//   "LD": ["EN"],
//   "NT": ["EN"],
//   "PS": ["EN"],
//   "RM": ["EN"],
//   "ZA": ["EN"],
// };

// const LANGUAGE_TO_TEXT: ConstraintMatrix = {
//   "EN": ["EM", "EV", "EX", "LD", "NT", "PS", "RM", "ZA"],
// };

// ─────────────────────────────────────────────────────────────
// CONSTRAINTS EXPORT
// Only colour <-> text constraints are needed
// Cover and Language have single options (auto-selected)
// ─────────────────────────────────────────────────────────────

export const GLOBAL_RESET_CONSTRAINTS: ModelConstraints = {
  modelId: "global-reset",
  constraints: [
    {
      sourceStep: "colour",
      targetStep: "text",
      matrix: COLOUR_TO_TEXT,
    },
    {
      sourceStep: "text",
      targetStep: "colour",
      matrix: TEXT_TO_COLOUR,
    },
  ],
};

export const DEBUG_MATRICES = {
  COLOUR_TO_TEXT,
  TEXT_TO_COLOUR,
  VALID_MODEL_CODES,
};