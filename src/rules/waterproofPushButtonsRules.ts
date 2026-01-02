import type { ModelConstraints, ConstraintMatrix } from "./types";

const HOUSING_TO_BUTTON_COLOUR: ConstraintMatrix = {
  "1": ["R", "W"],
  "3": ["G", "W"],
  "5": ["R", "G", "Y"],
  "7": ["R", "G", "W", "B"],
  "9": ["B"],
  "E": ["E"],
};

const BUTTON_COLOUR_TO_HOUSING: ConstraintMatrix = {
  "R": ["1", "5", "7"],
  "G": ["3", "5", "7"],
  "Y": ["5"],
  "W": ["1", "3", "7"],
  "B": ["7", "9"],
  "E": ["E"],
};

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