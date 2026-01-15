import type { ModelConstraints, ConstraintMatrix } from "./types";

const COVER_TO_HOOD_SOUNDER: ConstraintMatrix = {
  "13": ["00", "10", "20", "30"],
  "14": ["00", "10"],
};

const COVER_TO_COLOUR_LABEL: ConstraintMatrix = {
  "13": ["FR", "NR", "CR", "EG", "NG", "CG", "NC", "NK", "CK", "NB", "CB", "NW", "CW", "NY", "CY"],
  "14": ["FR", "NR", "CR", "EG", "NG", "CG", "NB", "CB", "NW", "CW", "NY", "CY"],
};

const HOOD_SOUNDER_TO_COVER: ConstraintMatrix = {
  "00": ["13", "14"],
  "10": ["13", "14"],
  "20": ["13"],
  "30": ["13"],
};

const HOOD_SOUNDER_TO_COLOUR_LABEL: ConstraintMatrix = {
  "00": ["NC"],
  "10": ["FR", "NR", "CR", "EG", "NG", "CG", "NK", "CK", "NB", "CB", "NW", "CW", "NY", "CY"],
  "20": ["FR", "NR", "CR", "EG", "NG", "CG", "NK", "CK", "NB", "CB", "NW", "CW", "NY", "CY"],
  "30": ["FR", "NR", "CR", "EG", "NG", "CG", "NK", "CK", "NB", "CB", "NW", "CW", "NY", "CY"],
};

const COLOUR_LABEL_TO_HOOD_SOUNDER: ConstraintMatrix = {
  "FR": ["10", "20", "30"],
  "NR": ["10", "20", "30"],
  "CR": ["10", "20", "30"],
  "EG": ["10", "20", "30"],
  "NG": ["10", "20", "30"],
  "CG": ["10", "20", "30"],
  "NC": ["00"],
  "NK": ["10", "20", "30"],
  "CK": ["10", "20", "30"],
  "NB": ["10", "20", "30"],
  "CB": ["10", "20", "30"],
  "NW": ["10", "20", "30"],
  "CW": ["10", "20", "30"],
  "NY": ["10", "20", "30"],
  "CY": ["10", "20", "30"],
};

const COLOUR_LABEL_TO_COVER: ConstraintMatrix = {
  "FR": ["13", "14"],
  "NR": ["13", "14"],
  "CR": ["13", "14"],
  "EG": ["13", "14"],
  "NG": ["13", "14"],
  "CG": ["13", "14"],
  "NC": ["13", "14"],
  "NK": ["13"],
  "CK": ["13"],
  "NB": ["13", "14"],
  "CB": ["13", "14"],
  "NW": ["13", "14"],
  "CW": ["13", "14"],
  "NY": ["13", "14"],
  "CY": ["13", "14"],
};

export const UNIVERSAL_STOPPER_CONSTRAINTS: ModelConstraints = {
  modelId: "universal-stopper",
  constraints: [
    {
      sourceStep: "cover",
      targetStep: "hoodSounder",
      matrix: COVER_TO_HOOD_SOUNDER,
    },
    {
      sourceStep: "cover",
      targetStep: "colourLabel",
      matrix: COVER_TO_COLOUR_LABEL,
    },
    {
      sourceStep: "hoodSounder",
      targetStep: "cover",
      matrix: HOOD_SOUNDER_TO_COVER,
    },
    {
      sourceStep: "hoodSounder",
      targetStep: "colourLabel",
      matrix: HOOD_SOUNDER_TO_COLOUR_LABEL,
    },
    {
      sourceStep: "colourLabel",
      targetStep: "hoodSounder",
      matrix: COLOUR_LABEL_TO_HOOD_SOUNDER,
    },
    {
      sourceStep: "colourLabel",
      targetStep: "cover",
      matrix: COLOUR_LABEL_TO_COVER,
    },
  ],
};