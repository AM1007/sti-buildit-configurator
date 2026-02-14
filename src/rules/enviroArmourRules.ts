import type { ModelConstraints, ConstraintMatrix } from "./types";

// ============================================================================
// Whitelist — source of truth: 13_EnviroArmour_.md (6 SKU)
// ============================================================================

export const VALID_MODEL_CODES: readonly string[] = [
  "ES-121005-O",
  "ES-161608-O",
  "ES-231609-O",
  "ES-312312-O",
  "ET-121006-C",
  "ET-181408-C",
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

// ============================================================================
// Selection state
// ============================================================================

export interface EASelectionState {
  material?: string;  // S | T
  size?: string;      // 121005 | 121006 | 161608 | 181408 | 231609 | 312312
  doorType?: string;  // O | C
}

// ============================================================================
// Build SKU: E{material}-{size}-{doorType}
// ============================================================================

export function buildEAModelCode(selections: EASelectionState): string | null {
  const { material, size, doorType } = selections;

  if (!material || !size || !doorType) {
    return null;
  }

  return `E${material}-${size}-${doorType}`;
}

// ============================================================================
// Parse SKU back to selections
// ============================================================================

export function parseEAModelCode(code: string): EASelectionState | null {
  const match = code.match(/^E([ST])-(\d{6})-([OC])$/);

  if (!match) {
    return null;
  }

  return {
    material: match[1],
    size: match[2],
    doorType: match[3],
  };
}

// ============================================================================
// Validate full combination against whitelist
// ============================================================================

export function isValidEACombination(
  selections: EASelectionState
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildEAModelCode(selections);

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

// ============================================================================
// Get valid options for a step (allowlist filter)
// ============================================================================

export function getValidEAOptionsForStep(
  stepId: keyof EASelectionState,
  currentSelections: Partial<EASelectionState>
): string[] {
  const validOptions = new Set<string>();

  for (const code of VALID_MODEL_CODES) {
    const parsed = parseEAModelCode(code);
    if (!parsed) continue;

    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof EASelectionState] !== value) {
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

// ============================================================================
// Constraint matrices (built from whitelist analysis)
// ============================================================================

// material → size
const MATERIAL_TO_SIZE: ConstraintMatrix = {
  "S": ["121005", "161608", "231609", "312312"],
  "T": ["121006", "181408"],
};

// material → doorType
const MATERIAL_TO_DOORTYPE: ConstraintMatrix = {
  "S": ["O"],
  "T": ["C"],
};

// size → material
const SIZE_TO_MATERIAL: ConstraintMatrix = {
  "121005": ["S"],
  "121006": ["T"],
  "161608": ["S"],
  "181408": ["T"],
  "231609": ["S"],
  "312312": ["S"],
};

// size → doorType
const SIZE_TO_DOORTYPE: ConstraintMatrix = {
  "121005": ["O"],
  "121006": ["C"],
  "161608": ["O"],
  "181408": ["C"],
  "231609": ["O"],
  "312312": ["O"],
};

// doorType → material
const DOORTYPE_TO_MATERIAL: ConstraintMatrix = {
  "O": ["S"],
  "C": ["T"],
};

// doorType → size
const DOORTYPE_TO_SIZE: ConstraintMatrix = {
  "O": ["121005", "161608", "231609", "312312"],
  "C": ["121006", "181408"],
};

// ============================================================================
// ModelConstraints export
// ============================================================================

export const ENVIRO_ARMOUR_CONSTRAINTS: ModelConstraints = {
  modelId: "enviro-armour",
  constraints: [
    { sourceStep: "material", targetStep: "size", matrix: MATERIAL_TO_SIZE },
    { sourceStep: "material", targetStep: "doorType", matrix: MATERIAL_TO_DOORTYPE },

    { sourceStep: "size", targetStep: "material", matrix: SIZE_TO_MATERIAL },
    { sourceStep: "size", targetStep: "doorType", matrix: SIZE_TO_DOORTYPE },

    { sourceStep: "doorType", targetStep: "material", matrix: DOORTYPE_TO_MATERIAL },
    { sourceStep: "doorType", targetStep: "size", matrix: DOORTYPE_TO_SIZE },
  ],
};

// ============================================================================
// Debug export
// ============================================================================

export const DEBUG_MATRICES = {
  MATERIAL_TO_SIZE,
  MATERIAL_TO_DOORTYPE,
  SIZE_TO_MATERIAL,
  SIZE_TO_DOORTYPE,
  DOORTYPE_TO_MATERIAL,
  DOORTYPE_TO_SIZE,
  VALID_MODEL_CODES,
};