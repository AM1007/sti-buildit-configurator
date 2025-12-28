// ============================================================================
// KEY SWITCHES - CONSTRAINT RULES
// ============================================================================
//
// Source: 03_Конфигуратор_StopperSwitches_Key_Switches.md
//
// Dependencies:
// - COLOUR & MOUNTING: No dependencies (all options always available)
// - SWITCH TYPE ↔ ELECTRICAL ARRANGEMENT: Bidirectional
// - LABEL: No dependencies
//
// ============================================================================

import type { ModelConstraints, ConstraintMatrix } from "./types";

// ============================================================================
// CONSTRAINT MATRICES (from MD lines 238-278)
// ============================================================================

/**
 * SWITCH TYPE → ELECTRICAL ARRANGEMENT
 *
 * | SWITCH TYPE | Available ELECTRICAL |
 * |-------------|---------------------|
 * | #2          | 0                   |
 * | #3          | 0, 1, 2             |
 * | #4          | 1, 2                |
 * | #5          | 3                   |
 */
const SWITCH_TYPE_TO_ELECTRICAL: ConstraintMatrix = {
  "2": ["0"],
  "3": ["0", "1", "2"],
  "4": ["1", "2"],
  "5": ["3"],
};

/**
 * ELECTRICAL ARRANGEMENT → SWITCH TYPE (reverse)
 *
 * | ELECTRICAL | Available SWITCH TYPE |
 * |------------|----------------------|
 * | #0         | 2, 3                 |
 * | #1         | 3, 4                 |
 * | #2         | 3, 4                 |
 * | #3         | 5                    |
 */
const ELECTRICAL_TO_SWITCH_TYPE: ConstraintMatrix = {
  "0": ["2", "3"],
  "1": ["3", "4"],
  "2": ["3", "4"],
  "3": ["5"],
};

// ============================================================================
// EXPORTED CONSTRAINTS
// ============================================================================

export const KEY_SWITCHES_CONSTRAINTS: ModelConstraints = {
  modelId: "key-switches",
  constraints: [
    {
      sourceStep: "switchType",
      targetStep: "electricalArrangement",
      matrix: SWITCH_TYPE_TO_ELECTRICAL,
    },
    {
      sourceStep: "electricalArrangement",
      targetStep: "switchType",
      matrix: ELECTRICAL_TO_SWITCH_TYPE,
    },
  ],
};