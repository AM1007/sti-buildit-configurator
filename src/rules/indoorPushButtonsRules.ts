// ============================================================================
// INDOOR PUSH BUTTONS - CONSTRAINT RULES
// ============================================================================
//
// Source: 02_Конфигуратор_StopperSwitches_Indoor_Push_Buttons.md
//
// Bidirectional constraints:
// - COLOUR ↔ BUTTON COLOUR
//
// No other dependencies in this model.
// PUSH BUTTON TYPE and ELECTRICAL ARRANGEMENTS are independent.
//
// ============================================================================

import type { ModelConstraints, ConstraintMatrix } from "./types";

// ============================================================================
// COLOUR → BUTTON COLOUR
// ============================================================================
// Source: MD section "Выбор опций в меню COLOUR"
// ============================================================================

const COLOUR_TO_BUTTON_COLOUR: ConstraintMatrix = {
  // #1 Red (Dual Mount) → R, W
  "1": ["R", "W"],
  
  // #3 Green (Dual Mount) → ALL
  "3": ["G"],
  
  // #5 Yellow (Dual Mount) → R, G, Y
  "5": ["R", "G", "Y"],
  
  // #7 White (Dual Mount) → R, G, W, B
  "7": ["R", "G", "W", "B"],
  
  // #9 Blue (Dual Mount) → W, B
  "9": ["W", "B"],
  
  // #E Orange (Dual Mount) → W, E
  "E": ["W", "E"],
};

// ============================================================================
// BUTTON COLOUR → COLOUR (reverse)
// ============================================================================
// Source: MD section "Выбор опций в меню BUTTON COLOUR"
// ============================================================================

const BUTTON_COLOUR_TO_COLOUR: ConstraintMatrix = {
  // #R Red Button → 1, 5, 7
  "R": ["1", "5", "7"],
  
  // #G Green Button → 3, 5, 7
  "G": ["3", "5", "7"],
  
  // #Y Yellow Button → 5 only
  "Y": ["5"],
  
  // #W White Button → 1, 3, 7, 9, E
  "W": ["1", "3", "7", "9", "E"],
  
  // #B Blue Button → 7, 9
  "B": ["7", "9"],
  
  // #E Orange Button → E only
  // NOTE: MD has typo at line 384-390, says "#B Blue Button" but describes Orange
  "E": ["E"],
};

// ============================================================================
// ASSEMBLED CONSTRAINTS
// ============================================================================

export const INDOOR_PUSH_BUTTONS_CONSTRAINTS: ModelConstraints = {
  modelId: "indoor-push-buttons",
  constraints: [
    {
      sourceStep: "colour",
      targetStep: "buttonColour",
      matrix: COLOUR_TO_BUTTON_COLOUR,
    },
    
    {
      sourceStep: "buttonColour",
      targetStep: "colour",
      matrix: BUTTON_COLOUR_TO_COLOUR,
    },
  ],
};

export const DEBUG_MATRICES = {
  COLOUR_TO_BUTTON_COLOUR,
  BUTTON_COLOUR_TO_COLOUR,
};