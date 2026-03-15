import type { ModelConstraints, ConstraintMatrix } from "./types";

export const VALID_MODEL_CODES: readonly string[] = [
  "G3A209ZA-EN",
  "G3A229HV-EN",
  "G3A229LD-EN",
  "G3A229PO-EN",
  "G3A229PS-EN",
  "G3A309EM-EN",
  "G3A309PO-EN",
  "G3A329EM-EN",
  "G3A409EM-EN",
  "G3A409LD-EN",
  "G3A429EM-EN",
  "G3A429LD-EN",

  "G3C002AB-EN", 
  "G3C002PS-EN", 
  "G3C102EX-EN", 
  "G3C105RM-EN", 
  "G3C105XT-EN", 
  "G3C109XT-EN", 
  "G3C122EX-EN", 
  "G3C209PO-EN", 
  "G3C209ZA-EN", 
  "G3C325ZA-EN", 
  "G3C405EX-EN", 
  "G3C409EM-EN", 
  "G3C409LD-EN", 
  "G3C429EM-EN", 
  "G3C429EV-EN", 
  "G3C429LD-EN", 
  "G3C429ZA-EN", 
] as const;

const VALID_MODEL_SET = new Set(VALID_MODEL_CODES);

export interface G3SelectionState {
  model?: string;      
  colour?: string;     
  cover?: string;      
  buttonType?: string; 
  text?: string;       
  language?: string;   
}

export function buildG3ModelCode(selections: G3SelectionState): string | null {
  const { model, colour, cover, buttonType, text, language } = selections;
  
  if (!model || !colour || !cover || !buttonType || !text || !language) {
    return null;
  }
  
  return `G3${model}${colour}${cover}${buttonType}${text}-${language}`;
}

export function isValidG3Combination(
  selections: G3SelectionState
): { valid: true } | { valid: false; reason: string } {
  const modelCode = buildG3ModelCode(selections);
  
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

export function getValidOptionsForStep(
  stepId: keyof G3SelectionState,
  currentSelections: Omit<G3SelectionState, typeof stepId>
): string[] {
  const validOptions = new Set<string>();
  
  for (const code of VALID_MODEL_CODES) {
    const parsed = parseG3ModelCode(code);
    if (!parsed) continue;
    
    let matches = true;
    for (const [key, value] of Object.entries(currentSelections)) {
      if (value && parsed[key as keyof G3SelectionState] !== value) {
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

export function parseG3ModelCode(code: string): G3SelectionState | null {
  const match = code.match(/^G3([AC])(\d)(\d)(\d)([A-Z]{2})-([A-Z]{2})$/);
  
  if (!match) {
    return null;
  }
  
  return {
    model: match[1],
    colour: match[2],
    cover: match[3],
    buttonType: match[4],
    text: match[5],
    language: match[6],
  };
}

const MODEL_TO_COLOUR: ConstraintMatrix = {
  "A": ["2", "3", "4"],
  "C": ["0", "1", "2", "3", "4"],
};

const MODEL_TO_COVER: ConstraintMatrix = {
  "A": ["0", "2"],
  "C": ["0", "2"],
};

const MODEL_TO_BUTTONTYPE: ConstraintMatrix = {
  "A": ["9"],
  "C": ["2", "5", "9"],
};

const MODEL_TO_TEXT: ConstraintMatrix = {
  "A": ["ZA", "HV", "LD", "PO", "PS", "EM"],
  "C": ["AB", "PS", "EX", "RM", "XT", "PO", "ZA", "EM", "LD", "EV"],
};

const COLOUR_TO_MODEL: ConstraintMatrix = {
  "0": ["C"],
  "1": ["C"],
  "2": ["A", "C"],
  "3": ["A", "C"],
  "4": ["A", "C"],
};

const COLOUR_TO_COVER: ConstraintMatrix = {
  "0": ["0", "2"],
  "1": ["0", "2"],
  "2": ["0", "2"],
  "3": ["0", "2"],
  "4": ["0", "2"],
};

const COLOUR_TO_BUTTONTYPE: ConstraintMatrix = {
  "0": ["2"],
  "1": ["2", "5", "9"],
  "2": ["9"],
  "3": ["5", "9"],
  "4": ["5", "9"],
};

const COLOUR_TO_TEXT: ConstraintMatrix = {
  "0": ["AB", "PS"],
  "1": ["EX", "RM", "XT"],
  "2": ["ZA", "HV", "LD", "PO", "PS"],
  "3": ["EM", "PO", "ZA"],
  "4": ["EM", "LD", "EX", "EV", "ZA"],
};

const COVER_TO_MODEL: ConstraintMatrix = {
  "0": ["A", "C"],
  "2": ["A", "C"],
};

const COVER_TO_COLOUR: ConstraintMatrix = {
  "0": ["0", "1", "2", "3", "4"],
  "2": ["0", "1", "2", "3", "4"],
};

const COVER_TO_BUTTONTYPE: ConstraintMatrix = {
  "0": ["2", "5", "9"],
  "2": ["2", "5", "9"],
};

const COVER_TO_TEXT: ConstraintMatrix = {
  "0": ["AB", "PS", "EX", "RM", "XT", "ZA", "PO", "EM", "LD"],
  "2": ["HV", "LD", "PO", "PS", "EM", "EX", "ZA", "EV"],
};

const BUTTONTYPE_TO_MODEL: ConstraintMatrix = {
  "2": ["C"],
  "5": ["C"],
  "9": ["A", "C"],
};

const BUTTONTYPE_TO_COLOUR: ConstraintMatrix = {
  "2": ["0", "1"],
  "5": ["1", "3", "4"],
  "9": ["1", "2", "3", "4"],
};

const BUTTONTYPE_TO_COVER: ConstraintMatrix = {
  "2": ["0", "2"],
  "5": ["0", "2"],
  "9": ["0", "2"],
};

const BUTTONTYPE_TO_TEXT: ConstraintMatrix = {
  "2": ["AB", "PS", "EX"],
  "5": ["RM", "XT", "ZA", "EX"],
  "9": ["ZA", "HV", "LD", "PO", "PS", "EM", "XT", "EV"],
};

const TEXT_TO_MODEL: ConstraintMatrix = {
  "AB": ["C"],
  "PS": ["A", "C"],
  "EX": ["C"],
  "RM": ["C"],
  "XT": ["C"],
  "ZA": ["A", "C"],
  "HV": ["A"],
  "LD": ["A", "C"],
  "PO": ["A", "C"],
  "EM": ["A", "C"],
  "EV": ["C"],
};

const TEXT_TO_COLOUR: ConstraintMatrix = {
  "AB": ["0"],
  "PS": ["0", "2"],
  "EX": ["1", "4"],
  "RM": ["1"],
  "XT": ["1"],
  "ZA": ["2", "3", "4"],
  "HV": ["2"],
  "LD": ["2", "4"],
  "PO": ["2", "3"],
  "EM": ["3", "4"],
  "EV": ["4"],
};

const TEXT_TO_COVER: ConstraintMatrix = {
  "AB": ["0"],
  "PS": ["0", "2"],
  "EX": ["0", "2"],
  "RM": ["0"],
  "XT": ["0"],
  "ZA": ["0", "2"],
  "HV": ["2"],
  "LD": ["0", "2"],
  "PO": ["0", "2"],
  "EM": ["0", "2"],
  "EV": ["2"],
};

const TEXT_TO_BUTTONTYPE: ConstraintMatrix = {
  "AB": ["2"],
  "PS": ["2", "9"],
  "EX": ["2", "5"],
  "RM": ["5"],
  "XT": ["5", "9"],
  "ZA": ["5", "9"],
  "HV": ["9"],
  "LD": ["9"],
  "PO": ["9"],
  "EM": ["9"],
  "EV": ["9"],
};

export const G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS: ModelConstraints = {
  modelId: "g3-multipurpose-push-button",
  constraints: [
    { sourceStep: "model", targetStep: "colour", matrix: MODEL_TO_COLOUR },
    { sourceStep: "model", targetStep: "cover", matrix: MODEL_TO_COVER },
    { sourceStep: "model", targetStep: "buttonType", matrix: MODEL_TO_BUTTONTYPE },
    { sourceStep: "model", targetStep: "text", matrix: MODEL_TO_TEXT },

    { sourceStep: "colour", targetStep: "model", matrix: COLOUR_TO_MODEL },
    { sourceStep: "colour", targetStep: "cover", matrix: COLOUR_TO_COVER },
    { sourceStep: "colour", targetStep: "buttonType", matrix: COLOUR_TO_BUTTONTYPE },
    { sourceStep: "colour", targetStep: "text", matrix: COLOUR_TO_TEXT },

    { sourceStep: "cover", targetStep: "model", matrix: COVER_TO_MODEL },
    { sourceStep: "cover", targetStep: "colour", matrix: COVER_TO_COLOUR },
    { sourceStep: "cover", targetStep: "buttonType", matrix: COVER_TO_BUTTONTYPE },
    { sourceStep: "cover", targetStep: "text", matrix: COVER_TO_TEXT },

    { sourceStep: "buttonType", targetStep: "model", matrix: BUTTONTYPE_TO_MODEL },
    { sourceStep: "buttonType", targetStep: "colour", matrix: BUTTONTYPE_TO_COLOUR },
    { sourceStep: "buttonType", targetStep: "cover", matrix: BUTTONTYPE_TO_COVER },
    { sourceStep: "buttonType", targetStep: "text", matrix: BUTTONTYPE_TO_TEXT },

    { sourceStep: "text", targetStep: "model", matrix: TEXT_TO_MODEL },
    { sourceStep: "text", targetStep: "colour", matrix: TEXT_TO_COLOUR },
    { sourceStep: "text", targetStep: "cover", matrix: TEXT_TO_COVER },
    { sourceStep: "text", targetStep: "buttonType", matrix: TEXT_TO_BUTTONTYPE },
  ],
};

export const DEBUG_MATRICES = {
  MODEL_TO_COLOUR,
  MODEL_TO_COVER,
  MODEL_TO_BUTTONTYPE,
  MODEL_TO_TEXT,
  COLOUR_TO_MODEL,
  COLOUR_TO_COVER,
  COLOUR_TO_BUTTONTYPE,
  COLOUR_TO_TEXT,
  COVER_TO_MODEL,
  COVER_TO_COLOUR,
  COVER_TO_BUTTONTYPE,
  COVER_TO_TEXT,
  BUTTONTYPE_TO_MODEL,
  BUTTONTYPE_TO_COLOUR,
  BUTTONTYPE_TO_COVER,
  BUTTONTYPE_TO_TEXT,
  TEXT_TO_MODEL,
  TEXT_TO_COLOUR,
  TEXT_TO_COVER,
  TEXT_TO_BUTTONTYPE,
  VALID_MODEL_CODES,
};