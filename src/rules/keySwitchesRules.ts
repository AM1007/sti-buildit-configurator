import type { ModelConstraints, ConstraintMatrix } from "./types";

const SWITCH_TYPE_TO_ELECTRICAL: ConstraintMatrix = {
  "2": ["0"],
  "3": ["0", "1", "2"],
  "4": ["1", "2"],
  "5": ["3"],
};

const ELECTRICAL_TO_SWITCH_TYPE: ConstraintMatrix = {
  "0": ["2", "3"],
  "1": ["3", "4"],
  "2": ["3", "4"],
  "3": ["5"],
};

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