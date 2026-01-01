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

const COLOUR_TO_ELECTRICAL: ConstraintMatrix = {
  "R": ["01", "05"],
  "G": ["02", "05", "11"],
  "Y": ["02", "05", "11"],
  "B": ["02", "05", "11"],
  "W": ["02", "05", "11"],
  "O": ["02", "05", "11"],
};

const ELECTRICAL_TO_COLOUR: ConstraintMatrix = {
  "01": ["R"],
  "02": ["G", "Y", "B", "W", "O"],
  "05": ["R", "G", "Y", "B", "W", "O"],
  "11": ["G", "Y", "B", "W", "O"],
};

const COLOUR_TO_LABEL: ConstraintMatrix = {
  "R": ["HF", "CL"],
  "G": ["RM", "CL"],
  "Y": ["SAK", "CL"],
  "B": ["SAK", "CL"],
  "W": ["SAK", "CL"],
  "O": ["SAK", "CL"],
};

const LABEL_TO_COLOUR: ConstraintMatrix = {
  "HF": ["R"],
  "RM": ["G"],
  "SAK": ["Y", "B", "W", "O"],
  "CL": ["R", "G", "Y", "B", "W", "O"],
};

const ELECTRICAL_TO_LABEL: ConstraintMatrix = {
  "01": ["HF", "CL"],
  "02": ["RM", "SAK", "CL"],
  "05": ["HF", "RM", "SAK", "CL"],
  "11": ["RM", "SAK", "CL"],
};

const LABEL_TO_ELECTRICAL: ConstraintMatrix = {
  "HF": ["01", "05"],
  "RM": ["02", "05", "11"],
  "SAK": ["02", "05", "11"],
  "CL": ["01", "02", "05", "11"],
};

export const RESET_CALL_POINTS_CONSTRAINTS: ModelConstraints = {
  modelId: "reset-call-points",
  constraints: [
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