import type { ModelConstraints, ConstraintMatrix } from "./types";

const COLOUR_TO_BUTTON_COLOUR: ConstraintMatrix = {
  "1": ["R", "W"],
  
  "3": ["G"],
  
  "5": ["R", "G", "Y"],
  
  "7": ["R", "G", "W", "B"],
  
  "9": ["W", "B"],
  
  "E": ["W", "E"],
};

const BUTTON_COLOUR_TO_COLOUR: ConstraintMatrix = {
  "R": ["1", "5", "7"],
  
  "G": ["3", "5", "7"],
  
  "Y": ["5"],
  
  "W": ["1", "3", "7", "9", "E"],
  
  "B": ["7", "9"],
  
  "E": ["E"],
};

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