import type { ModelConstraints, ConstraintMatrix } from "./types";

const ALL_TEXT_WITHOUT_RM = ["AB", "EM", "EX", "PO", "ES", "EV", "XT", "PS", "HV", "LD", "PX", "NT", "ZA"];
const ALL_TEXT = [...ALL_TEXT_WITHOUT_RM, "RM"];

const COLOUR_TO_COVER: ConstraintMatrix = {
  "0": ["01"],
  "1": ["01"],
  "2": ["01"],
  "3": ["01"],
  "4": ["01"],
};

const COLOUR_TO_TEXT: ConstraintMatrix = {
  "0": ALL_TEXT_WITHOUT_RM,
  "1": ALL_TEXT,
  "2": ALL_TEXT_WITHOUT_RM,
  "3": ALL_TEXT_WITHOUT_RM,
  "4": ALL_TEXT_WITHOUT_RM,
};

const COVER_TO_COLOUR: ConstraintMatrix = {
  "01": ["0", "1", "2", "3", "4"],
  "21": [],
};

const TEXT_TO_COLOUR: ConstraintMatrix = {
  "AB": ["0", "1", "2", "3", "4"],
  "EM": ["0", "1", "2", "3", "4"],
  "EX": ["0", "1", "2", "3", "4"],
  "PO": ["0", "1", "2", "3", "4"],
  "ES": ["0", "1", "2", "3", "4"],
  "EV": ["0", "1", "2", "3", "4"],
  "XT": ["0", "1", "2", "3", "4"],
  "PS": ["0", "1", "2", "3", "4"],
  "HV": ["0", "1", "2", "3", "4"],
  "LD": ["0", "1", "2", "3", "4"],
  "PX": ["0", "1", "2", "3", "4"],
  "NT": ["0", "1", "2", "3", "4"],
  "ZA": ["0", "1", "2", "3", "4"],
  "RM": ["1"],
};

export const GLOBAL_RESET_CONSTRAINTS: ModelConstraints = {
  modelId: "global-reset",
  constraints: [
    {
      sourceStep: "colour",
      targetStep: "cover",
      matrix: COLOUR_TO_COVER,
    },
    {
      sourceStep: "colour",
      targetStep: "text",
      matrix: COLOUR_TO_TEXT,
    },
    {
      sourceStep: "cover",
      targetStep: "colour",
      matrix: COVER_TO_COLOUR,
    },
    {
      sourceStep: "text",
      targetStep: "colour",
      matrix: TEXT_TO_COLOUR,
    },
  ],
};