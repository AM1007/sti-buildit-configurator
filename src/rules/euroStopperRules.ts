import type { ModelConstraints, ConstraintMatrix } from "./types";

// ─────────────────────────────────────────────────────────────
// ALLOWLIST: Valid Euro Stopper model codes
// Source: 15_Euro_Stopper.md (57 codes)
// Format: STI-15{mounting:1}{sounder:2}{colourLabel:2}
// ─────────────────────────────────────────────────────────────

export const VALID_MODEL_CODES: readonly string[] = [
  // ── Flush Mount (mounting=0): 16 models ──
  "STI-15010CB",
  "STI-15010CE",
  "STI-15010CG",
  "STI-15010ML",
  "STI-15010NB",
  "STI-15010NE",
  "STI-15010NK",
  "STI-15010NW",
  "STI-15010NY",
  "STI-15020CW",
  "STI-15020ML",
  "STI-15020NE",
  "STI-15030EG",
  "STI-15030FR",
  "STI-15030NG",
  "STI-15030NR",

  // ── Surface Mount 32mm (mounting=C): 21 models ──
  "STI-15C10CB",
  "STI-15C10CE",
  "STI-15C10ML",
  "STI-15C10NB",
  "STI-15C10NR",
  "STI-15C10NW",
  "STI-15C10NY",
  "STI-15C20CB",
  "STI-15C20CE",
  "STI-15C20CY",
  "STI-15C20ML",
  "STI-15C20NB",
  "STI-15C20NE",
  "STI-15C20NG",
  "STI-15C20NW",
  "STI-15C20NY",
  "STI-15C30CG",
  "STI-15C30FR",
  "STI-15C30NB",
  "STI-15C30NG",
  "STI-15C30NY",

  // ── Surface Mount 50mm (mounting=D): 20 models ──
  "STI-15D10CB",
  "STI-15D10CE",
  "STI-15D10CG",
  "STI-15D10CR",
  "STI-15D10CW",
  "STI-15D10CY",
  "STI-15D10FR",
  "STI-15D10ML",
  "STI-15D10NB",
  "STI-15D10NR",
  "STI-15D10NW",
  "STI-15D10NY",
  "STI-15D20CY",
  "STI-15D20ML",
  "STI-15D20NG",
  "STI-15D20NR",
  "STI-15D30CG",
  "STI-15D30EG",
  "STI-15D30NB",
  "STI-15D30NG",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ─────────────────────────────────────────────────────────────
// Selection state
// ─────────────────────────────────────────────────────────────

export interface EUSSelectionState {
  mounting?: string;
  sounder?: string;
  colourLabel?: string;
}

// ─────────────────────────────────────────────────────────────
// Build SKU from selections
// ─────────────────────────────────────────────────────────────

export function buildEUSModelCode(selections: EUSSelectionState): string | null {
  const { mounting, sounder, colourLabel } = selections;

  if (!mounting || !sounder || !colourLabel) {
    return null;
  }

  return `STI-15${mounting}${sounder}${colourLabel}`;
}

// ─────────────────────────────────────────────────────────────
// Parse SKU back to selections
// ─────────────────────────────────────────────────────────────

export function parseEUSModelCode(code: string): EUSSelectionState | null {
  // STI-15{mounting:1}{sounder:2}{colourLabel:2}
  const match = code.match(/^STI-15([0CD])(\d{2})([A-Z]{2})$/);

  if (!match) {
    return null;
  }

  return {
    mounting: match[1],
    sounder: match[2],
    colourLabel: match[3],
  };
}

// ─────────────────────────────────────────────────────────────
// Validate full combination against allowlist
// ─────────────────────────────────────────────────────────────

export function isValidEUSCombination(
  selections: EUSSelectionState
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildEUSModelCode(selections);

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

// ─────────────────────────────────────────────────────────────
// Get valid options for a step given other selections
// ─────────────────────────────────────────────────────────────

export function getValidEUSOptionsForStep(
  stepId: keyof EUSSelectionState,
  currentSelections: Omit<EUSSelectionState, typeof stepId>
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseEUSModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof EUSSelectionState] !== value) {
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
// Constraint matrices
//
// mounting ↔ sounder: FULLY INDEPENDENT (all×all), no matrix needed
// mounting ↔ colourLabel: partial dependency
// sounder ↔ colourLabel: strong dependency
// ─────────────────────────────────────────────────────────────

// ── mounting → colourLabel ──
const MOUNTING_TO_COLOUR_LABEL: ConstraintMatrix = {
  "0": ["CB", "CE", "CG", "CW", "EG", "FR", "ML", "NB", "NE", "NG", "NK", "NR", "NW", "NY"],
  "C": ["CB", "CE", "CG", "CY", "FR", "ML", "NB", "NE", "NG", "NR", "NW", "NY"],
  "D": ["CB", "CE", "CG", "CR", "CW", "CY", "EG", "FR", "ML", "NB", "NG", "NR", "NW", "NY"],
};

// ── colourLabel → mounting ──
const COLOUR_LABEL_TO_MOUNTING: ConstraintMatrix = {
  "CB": ["0", "C", "D"],
  "CE": ["0", "C", "D"],
  "CG": ["0", "C", "D"],
  "CR": ["D"],
  "CW": ["0", "D"],
  "CY": ["C", "D"],
  "EG": ["0", "D"],
  "FR": ["0", "C", "D"],
  "ML": ["0", "C", "D"],
  "NB": ["0", "C", "D"],
  "NE": ["0", "C"],
  "NG": ["0", "C", "D"],
  "NK": ["0"],
  "NR": ["0", "C", "D"],
  "NW": ["0", "C", "D"],
  "NY": ["0", "C", "D"],
};

// ── sounder → colourLabel ──
const SOUNDER_TO_COLOUR_LABEL: ConstraintMatrix = {
  "10": ["CB", "CE", "CG", "CR", "CW", "CY", "FR", "ML", "NB", "NE", "NK", "NR", "NW", "NY"],
  "20": ["CB", "CE", "CW", "CY", "ML", "NB", "NE", "NG", "NR", "NW", "NY"],
  "30": ["CG", "EG", "FR", "NB", "NG", "NR", "NY"],
};

// ── colourLabel → sounder ──
const COLOUR_LABEL_TO_SOUNDER: ConstraintMatrix = {
  "CB": ["10", "20"],
  "CE": ["10", "20"],
  "CG": ["10", "30"],
  "CR": ["10"],
  "CW": ["10", "20"],
  "CY": ["10", "20"],
  "EG": ["30"],
  "FR": ["10", "30"],
  "ML": ["10", "20"],
  "NB": ["10", "20", "30"],
  "NE": ["10", "20"],
  "NG": ["20", "30"],
  "NK": ["10"],
  "NR": ["10", "20", "30"],
  "NW": ["10", "20"],
  "NY": ["10", "20", "30"],
};

// ─────────────────────────────────────────────────────────────
// ModelConstraints export
//
// mounting ↔ sounder omitted: fully independent (all×all).
// Including them would add no filtering value and waste cycles.
// ─────────────────────────────────────────────────────────────

export const EURO_STOPPER_CONSTRAINTS: ModelConstraints = {
  modelId: "euro-stopper",
  constraints: [
    { sourceStep: "mounting", targetStep: "colourLabel", matrix: MOUNTING_TO_COLOUR_LABEL },
    { sourceStep: "colourLabel", targetStep: "mounting", matrix: COLOUR_LABEL_TO_MOUNTING },
    { sourceStep: "sounder", targetStep: "colourLabel", matrix: SOUNDER_TO_COLOUR_LABEL },
    { sourceStep: "colourLabel", targetStep: "sounder", matrix: COLOUR_LABEL_TO_SOUNDER },
  ],
};

// ─────────────────────────────────────────────────────────────
// Debug export
// ─────────────────────────────────────────────────────────────

export const DEBUG_MATRICES = {
  MOUNTING_TO_COLOUR_LABEL,
  COLOUR_LABEL_TO_MOUNTING,
  SOUNDER_TO_COLOUR_LABEL,
  COLOUR_LABEL_TO_SOUNDER,
  VALID_MODEL_CODES,
};