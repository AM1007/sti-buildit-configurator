// ============================================================================
// RESET CALL POINTS - CONSTRAINT RULES
// ============================================================================
//
// Source: 05_Конфигуратор_ReSet_Call_Points.md
//
// CRITICAL: This model has MULTI-DIRECTIONAL dependencies:
// - COLOUR ↔ ELECTRICAL ARRANGEMENT (bidirectional)
// - COLOUR ↔ LABEL (bidirectional)
// - ELECTRICAL ↔ LABEL (bidirectional)
// - MOUNTING: No dependencies
//
// ============================================================================

import type { ModelConstraints, ConstraintMatrix } from "./types";

// ============================================================================
// COLOUR ↔ ELECTRICAL ARRANGEMENT (from MD lines 238-324)
// ============================================================================

/**
 * COLOUR → ELECTRICAL ARRANGEMENT
 *
 * | COLOUR   | Available ELECTRICAL |
 * |----------|---------------------|
 * | R Red    | 01, 05              |
 * | G Green  | 02, 11              |
 * | Y Yellow | 02, 11              |
 * | B Blue   | 02, 11              |
 * | W White  | 02, 11              |
 * | O Orange | 02, 11              |
 *
 * Note: MD shows Green also has 02, 11 (not 05)
 */
const COLOUR_TO_ELECTRICAL: ConstraintMatrix = {
  "R": ["01", "05"],
  "G": ["02", "05", "11"],
  "Y": ["02", "05", "11"],
  "B": ["02", "05", "11"],
  "W": ["02", "05", "11"],
  "O": ["02", "05", "11"],
};

/**
 * ELECTRICAL ARRANGEMENT → COLOUR
 *
 * | ELECTRICAL | Available COLOUR    |
 * |------------|---------------------|
 * | 01         | R                   |
 * | 02         | G, Y, B, W, O       |
 * | 05         | ALL                 |
 * | 11         | G, Y, B, W, O       |
 */
const ELECTRICAL_TO_COLOUR: ConstraintMatrix = {
  "01": ["R"],
  "02": ["G", "Y", "B", "W", "O"],
  "05": ["R", "G", "Y", "B", "W", "O"],
  "11": ["G", "Y", "B", "W", "O"],
};

// ============================================================================
// COLOUR ↔ LABEL (from MD lines 246-372)
// ============================================================================

/**
 * COLOUR → LABEL
 *
 * | COLOUR   | Available LABEL |
 * |----------|-----------------|
 * | R Red    | HF, CL          |
 * | G Green  | RM, CL          |
 * | Y Yellow | SAK, CL         |
 * | B Blue   | SAK, CL         |
 * | W White  | SAK, CL         |
 * | O Orange | SAK, CL         |
 */
const COLOUR_TO_LABEL: ConstraintMatrix = {
  "R": ["HF", "CL"],
  "G": ["RM", "CL"],
  "Y": ["SAK", "CL"],
  "B": ["SAK", "CL"],
  "W": ["SAK", "CL"],
  "O": ["SAK", "CL"],
};

/**
 * LABEL → COLOUR
 *
 * | LABEL          | Available COLOUR  |
 * |----------------|-------------------|
 * | HF House Flame | R                 |
 * | RM Running Man | G                 |
 * | SAK            | Y, B, W, O        |
 * | CL Custom      | ALL               |
 */
const LABEL_TO_COLOUR: ConstraintMatrix = {
  "HF": ["R"],
  "RM": ["G"],
  "SAK": ["Y", "B", "W", "O"],
  "CL": ["R", "G", "Y", "B", "W", "O"],
};

// ============================================================================
// ELECTRICAL ↔ LABEL (from MD lines 313-341)
// ============================================================================

/**
 * ELECTRICAL ARRANGEMENT → LABEL
 *
 * | ELECTRICAL | Available LABEL   |
 * |------------|-------------------|
 * | 01         | HF, CL            |
 * | 02         | RM, SAK, CL       |
 * | 05         | ALL               |
 * | 11         | RM, SAK, CL       |
 */
const ELECTRICAL_TO_LABEL: ConstraintMatrix = {
  "01": ["HF", "CL"],
  "02": ["RM", "SAK", "CL"],
  "05": ["HF", "RM", "SAK", "CL"],
  "11": ["RM", "SAK", "CL"],
};

/**
 * LABEL → ELECTRICAL ARRANGEMENT
 *
 * | LABEL          | Available ELECTRICAL |
 * |----------------|---------------------|
 * | HF House Flame | 01, 05              |
 * | RM Running Man | 02, 05, 11          |
 * | SAK            | 02, 05, 11          |
 * | CL Custom      | ALL                 |
 */
const LABEL_TO_ELECTRICAL: ConstraintMatrix = {
  "HF": ["01", "05"],
  "RM": ["02", "05", "11"],
  "SAK": ["02", "05", "11"],
  "CL": ["01", "02", "05", "11"],
};

// ============================================================================
// EXPORTED CONSTRAINTS
// ============================================================================

export const RESET_CALL_POINTS_CONSTRAINTS: ModelConstraints = {
  modelId: "reset-call-points",
  constraints: [
    // COLOUR ↔ ELECTRICAL
    {
      sourceStep: "colour",
      targetStep: "electricalArrangement",
      matrix: COLOUR_TO_ELECTRICAL,
    },
    {
      sourceStep: "electricalArrangement",
      targetStep: "colour",
      matrix: ELECTRICAL_TO_COLOUR,
    },
    // COLOUR ↔ LABEL
    {
      sourceStep: "colour",
      targetStep: "label",
      matrix: COLOUR_TO_LABEL,
    },
    {
      sourceStep: "label",
      targetStep: "colour",
      matrix: LABEL_TO_COLOUR,
    },
    // ELECTRICAL ↔ LABEL
    {
      sourceStep: "electricalArrangement",
      targetStep: "label",
      matrix: ELECTRICAL_TO_LABEL,
    },
    {
      sourceStep: "label",
      targetStep: "electricalArrangement",
      matrix: LABEL_TO_ELECTRICAL,
    },
  ],
};