import type { ModelConstraints, ConstraintMatrix } from "./types";

// ─────────────────────────────────────────────────────────────
// ALLOWLIST: Valid GF Fire Alarm Push Button model codes
// Source: 04_GF_Fire_Alarm_Push_Button.md (6 models)
// Format: GF[model:1][cover:1][text:2]-[language:2]
// ─────────────────────────────────────────────────────────────

export const VALID_MODEL_CODES: readonly string[] = [
  // ── Without camera (model=A): 3 models ──
  "GFA0FR-EN", // No cover, FIRE text
  "GFA0HF-EN", // No cover, FireHouseFlame symbol
  "GFA2FR-EN", // Shield cover, FIRE text

  // ── With camera (model=C): 3 models ──
  "GFC0FR-EN", // No cover, FIRE text
  "GFC0HF-EN", // No cover, FireHouseFlame symbol
  "GFC2FR-EN", // Shield cover, FIRE text
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ─────────────────────────────────────────────────────────────
// Selection state interface
// ─────────────────────────────────────────────────────────────

export interface GFSelectionState {
  model?: string;    // A | C
  cover?: string;    // 0 | 2
  text?: string;     // FR | HF
  language?: string; // EN
}

// ─────────────────────────────────────────────────────────────
// Build model code from selections
// ─────────────────────────────────────────────────────────────

export function buildGFModelCode(selections: GFSelectionState): string | null {
  const { model, cover, text, language } = selections;

  if (!model || !cover || !text || !language) {
    return null;
  }

  return `GF${model}${cover}${text}-${language}`;
}

// ─────────────────────────────────────────────────────────────
// Validate combination against allowlist
// ─────────────────────────────────────────────────────────────

export function isValidGFCombination(
  selections: GFSelectionState
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildGFModelCode(selections);

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
// ─────────────────────────────────────────────────────────────

export function getValidGFOptionsForStep(
  stepId: keyof GFSelectionState,
  currentSelections: Omit<GFSelectionState, typeof stepId>
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseGFModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof GFSelectionState] !== value) {
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

export function parseGFModelCode(code: string): GFSelectionState | null {
  // GF[model:1][cover:1][text:2]-[language:2]
  const match = code.match(/^GF([AC])(\d)([A-Z]{2})-([A-Z]{2})$/);

  if (!match) {
    return null;
  }

  return {
    model: match[1],
    cover: match[2],
    text: match[3],
    language: match[4],
  };
}

// ─────────────────────────────────────────────────────────────
// CONSTRAINT MATRICES
// Bidirectional constraints derived from VALID_MODEL_CODES
// ─────────────────────────────────────────────────────────────

// MODEL → other steps
const MODEL_TO_COVER: ConstraintMatrix = {
  A: ["0", "2"],
  C: ["0", "2"],
};

const MODEL_TO_TEXT: ConstraintMatrix = {
  A: ["FR", "HF"],
  C: ["FR", "HF"],
};

const MODEL_TO_LANGUAGE: ConstraintMatrix = {
  A: ["EN"],
  C: ["EN"],
};

// COVER → other steps
const COVER_TO_MODEL: ConstraintMatrix = {
  "0": ["A", "C"],
  "2": ["A", "C"],
};

const COVER_TO_TEXT: ConstraintMatrix = {
  "0": ["FR", "HF"], // Both texts available with no cover
  "2": ["FR"],       // Only FR available with shield (no GF*2HF-EN models)
};

const COVER_TO_LANGUAGE: ConstraintMatrix = {
  "0": ["EN"],
  "2": ["EN"],
};

// TEXT → other steps
const TEXT_TO_MODEL: ConstraintMatrix = {
  FR: ["A", "C"],
  HF: ["A", "C"],
};

const TEXT_TO_COVER: ConstraintMatrix = {
  FR: ["0", "2"], // FR works with both covers
  HF: ["0"],      // HF only works with no cover (no GF*2HF-EN models)
};

const TEXT_TO_LANGUAGE: ConstraintMatrix = {
  FR: ["EN"],
  HF: ["EN"],
};

// LANGUAGE → other steps
const LANGUAGE_TO_MODEL: ConstraintMatrix = {
  EN: ["A", "C"],
};

const LANGUAGE_TO_COVER: ConstraintMatrix = {
  EN: ["0", "2"],
};

const LANGUAGE_TO_TEXT: ConstraintMatrix = {
  EN: ["FR", "HF"],
};

// ─────────────────────────────────────────────────────────────
// Export constraints for constraint engine
// ─────────────────────────────────────────────────────────────

export const GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS: ModelConstraints = {
  modelId: "gf-fire-alarm-push-button",
  constraints: [
    // MODEL constraints
    { sourceStep: "model", targetStep: "cover", matrix: MODEL_TO_COVER },
    { sourceStep: "model", targetStep: "text", matrix: MODEL_TO_TEXT },
    { sourceStep: "model", targetStep: "language", matrix: MODEL_TO_LANGUAGE },

    // COVER constraints
    { sourceStep: "cover", targetStep: "model", matrix: COVER_TO_MODEL },
    { sourceStep: "cover", targetStep: "text", matrix: COVER_TO_TEXT },
    { sourceStep: "cover", targetStep: "language", matrix: COVER_TO_LANGUAGE },

    // TEXT constraints
    { sourceStep: "text", targetStep: "model", matrix: TEXT_TO_MODEL },
    { sourceStep: "text", targetStep: "cover", matrix: TEXT_TO_COVER },
    { sourceStep: "text", targetStep: "language", matrix: TEXT_TO_LANGUAGE },

    // LANGUAGE constraints
    { sourceStep: "language", targetStep: "model", matrix: LANGUAGE_TO_MODEL },
    { sourceStep: "language", targetStep: "cover", matrix: LANGUAGE_TO_COVER },
    { sourceStep: "language", targetStep: "text", matrix: LANGUAGE_TO_TEXT },
  ],
};

// ─────────────────────────────────────────────────────────────
// Debug export for testing
// ─────────────────────────────────────────────────────────────

export const DEBUG_MATRICES = {
  MODEL_TO_COVER,
  MODEL_TO_TEXT,
  MODEL_TO_LANGUAGE,
  COVER_TO_MODEL,
  COVER_TO_TEXT,
  COVER_TO_LANGUAGE,
  TEXT_TO_MODEL,
  TEXT_TO_COVER,
  TEXT_TO_LANGUAGE,
  LANGUAGE_TO_MODEL,
  LANGUAGE_TO_COVER,
  LANGUAGE_TO_TEXT,
  VALID_MODEL_CODES,
};