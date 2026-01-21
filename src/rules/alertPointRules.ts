import type { ModelConstraints, ConstraintMatrix } from "./types";

const ALL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "R", "X"];

const COLOUR_TO_LABEL: ConstraintMatrix = {
  "R": ALL_LABELS.filter(l => !["I", "R"].includes(l)),
  "B": ALL_LABELS.filter(l => !["A", "B", "I", "R"].includes(l)),
  "G": ALL_LABELS.filter(l => !["A", "B"].includes(l)),
  "W": ALL_LABELS.filter(l => !["A", "B", "I", "R"].includes(l)),
};

const LABEL_TO_COLOUR: ConstraintMatrix = {
  "A": ["R"],
  "B": ["R"],
  "C": ["R", "B", "G", "W"],
  "D": ["R", "B", "G", "W"],
  "E": ["R", "B", "G", "W"],
  "F": ["R", "B", "G", "W"],
  "G": ["R", "B", "G", "W"],
  "H": ["R", "B", "G", "W"],
  "I": ["G"],
  "R": ["G"],
  "X": ["R", "B", "G", "W"],
};

export const ALERT_POINT_CONSTRAINTS: ModelConstraints = {
  modelId: "alert-point",
  constraints: [
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
  ],
};