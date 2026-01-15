import type { ModelConstraints, ConstraintMatrix } from "./types";

const HOUSING_SHELL_TO_COLOUR_LABEL: ConstraintMatrix = {
  "00": ["NC"],
  "10": ["FR", "NR", "CR", "EG", "NG", "CG", "NB", "CB", "NW", "CW", "NY", "CY"],
  "20": ["FR", "NR", "CR", "EG", "NG", "CG", "NB", "CB", "NW", "CW", "NY", "CY"],
  "30": ["FR", "NR", "CR", "EG", "NG", "CG", "NB", "CB", "NW", "CW", "NY", "CY"],
};

const COLOUR_LABEL_TO_HOUSING_SHELL: ConstraintMatrix = {
  "FR": ["10", "20", "30"],
  "NR": ["10", "20", "30"],
  "CR": ["10", "20", "30"],
  "EG": ["10", "20", "30"],
  "NG": ["10", "20", "30"],
  "CG": ["10", "20", "30"],
  "NB": ["10", "20", "30"],
  "CB": ["10", "20", "30"],
  "NW": ["10", "20", "30"],
  "CW": ["10", "20", "30"],
  "NY": ["10", "20", "30"],
  "CY": ["10", "20", "30"],
  "NC": ["00"],
};

export const LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS: ModelConstraints = {
  modelId: "low-profile-universal-stopper",
  constraints: [
    {
      sourceStep: "housingShell",
      targetStep: "colourLabel",
      matrix: HOUSING_SHELL_TO_COLOUR_LABEL,
    },
    {
      sourceStep: "colourLabel",
      targetStep: "housingShell",
      matrix: COLOUR_LABEL_TO_HOUSING_SHELL,
    },
  ],
};