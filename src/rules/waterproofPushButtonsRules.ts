// ============================================================================
// WATERPROOF PUSH BUTTONS - CONSTRAINT RULES
// ============================================================================
//
// Source: 04_Конфигуратор_StopperSwitches_Waterproof_Push_Buttons.md
//
// Dependencies:
// - HOUSING COLOUR ↔ BUTTON COLOUR: Bidirectional
// - BUTTON TYPE: No dependencies
// - ELECTRICAL ARRANGEMENTS: No dependencies (only 1 option)
// - LABEL: No dependencies
//
// ============================================================================

import type { ModelConstraints, ConstraintMatrix } from "./types";

// ============================================================================
// CONSTRAINT MATRICES (from MD lines 239-296)
// ============================================================================

/**
 * HOUSING COLOUR → BUTTON COLOUR
 *
 * | HOUSING   | Available BUTTON COLOUR |
 * |-----------|-------------------------|
 * | #1 Red    | R, W                    |
 * | #3 Green  | G, W                    |
 * | #5 Yellow | R, G, Y                 |
 * | #7 White  | R, G, W, B              |
 * | #9 Blue   | B                       |
 * | #E Orange | E                       |
 */
const HOUSING_TO_BUTTON_COLOUR: ConstraintMatrix = {
  "1": ["R", "W"],
  "3": ["G", "W"],
  "5": ["R", "G", "Y"],
  "7": ["R", "G", "W", "B"],
  "9": ["B"],
  "E": ["E"],
};

/**
 * BUTTON COLOUR → HOUSING COLOUR (reverse)
 *
 * | BUTTON | Available HOUSING |
 * |--------|-------------------|
 * | R      | 1, 5, 7           |
 * | G      | 3, 5, 7           |
 * | Y      | 5                 |
 * | W      | 1, 3, 7           |
 * | B      | 7, 9              |
 * | E      | E                 |
 */
const BUTTON_COLOUR_TO_HOUSING: ConstraintMatrix = {
  "R": ["1", "5", "7"],
  "G": ["3", "5", "7"],
  "Y": ["5"],
  "W": ["1", "3", "7"],
  "B": ["7", "9"],
  "E": ["E"],
};

// ============================================================================
// EXPORTED CONSTRAINTS
// ============================================================================

export const WATERPROOF_PUSH_BUTTONS_CONSTRAINTS: ModelConstraints = {
  modelId: "waterproof-push-buttons",
  constraints: [
    {
      sourceStep: "housingColour",
      targetStep: "buttonColour",
      matrix: HOUSING_TO_BUTTON_COLOUR,
    },
    {
      sourceStep: "buttonColour",
      targetStep: "housingColour",
      matrix: BUTTON_COLOUR_TO_HOUSING,
    },
  ],
};