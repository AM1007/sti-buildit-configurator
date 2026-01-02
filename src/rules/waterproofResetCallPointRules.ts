import type { ConstraintMatrix, ModelConstraints } from "./types";

const COLOUR_TO_ELECTRICAL: ConstraintMatrix = {
  "R": ["01"],
  "G": ["02", "11"],
  "Y": ["02", "11"],
  "B": ["02", "11"],
  "W": ["02", "11"],
  "O": ["02", "11"],
};

const ELECTRICAL_TO_COLOUR: ConstraintMatrix = {
  "01": ["R"],
  "02": ["G", "Y", "B", "W", "O"],
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
  "11": ["RM", "SAK", "CL"],
};

const LABEL_TO_ELECTRICAL: ConstraintMatrix = {
  "HF": ["01"],
  "RM": ["02", "11"],
  "SAK": ["02", "11"],
  "CL": ["01", "02", "11"],
};

export const WATERPROOF_RESET_CALL_POINT_CONSTRAINTS: ModelConstraints = {
  modelId: "waterproof-reset-call-point",
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