// ============================================================================
// WATERPROOF RESET CALL POINT CONSTRAINT RULES
// ============================================================================
//
// Source: 06_Configurator_Waterproof_ReSet_Call_Point.md
//
// Multi-directional dependencies (3 pairs bidirectional):
// - COLOUR <-> ELECTRICAL ARRANGEMENT
// - COLOUR <-> LABEL
// - ELECTRICAL ARRANGEMENT <-> LABEL
//
// KEY DIFFERENCES FROM RESET CALL POINTS:
// - No MOUNTING step
// - No #05 Sav-wire option in ELECTRICAL
// - Simpler matrices due to fewer options
// ============================================================================

import type { ConstraintMatrix, ModelConstraints } from "./types";

// ============================================================================
// COLOUR <-> ELECTRICAL ARRANGEMENT MATRICES
// ============================================================================

/**
 * COLOUR -> ELECTRICAL ARRANGEMENT
 * 
 * R Red -> 01
 * G Green -> 02, 11
 * Y Yellow -> 02, 11
 * B Blue -> 02, 11
 * W White -> 02, 11
 * O Orange -> 02, 11
 */
const COLOUR_TO_ELECTRICAL: ConstraintMatrix = {
  "R": ["01"],
  "G": ["02", "11"],
  "Y": ["02", "11"],
  "B": ["02", "11"],
  "W": ["02", "11"],
  "O": ["02", "11"],
};

/**
 * ELECTRICAL ARRANGEMENT -> COLOUR
 * 
 * 01 -> R
 * 02 -> G, Y, B, W, O
 * 11 -> G, Y, B, W, O
 */
const ELECTRICAL_TO_COLOUR: ConstraintMatrix = {
  "01": ["R"],
  "02": ["G", "Y", "B", "W", "O"],
  "11": ["G", "Y", "B", "W", "O"],
};

// ============================================================================
// COLOUR <-> LABEL MATRICES
// ============================================================================

/**
 * COLOUR -> LABEL
 * 
 * R Red -> HF, CL
 * G Green -> RM, CL
 * Y Yellow -> SAK, CL
 * B Blue -> SAK, CL
 * W White -> SAK, CL
 * O Orange -> SAK, CL
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
 * LABEL -> COLOUR
 * 
 * HF House Flame -> R
 * RM Running Man -> G
 * SAK Self-Assemble -> Y, B, W, O
 * CL Custom -> ALL
 */
const LABEL_TO_COLOUR: ConstraintMatrix = {
  "HF": ["R"],
  "RM": ["G"],
  "SAK": ["Y", "B", "W", "O"],
  "CL": ["R", "G", "Y", "B", "W", "O"],
};

// ============================================================================
// ELECTRICAL ARRANGEMENT <-> LABEL MATRICES
// ============================================================================

/**
 * ELECTRICAL ARRANGEMENT -> LABEL
 * 
 * 01 -> HF, CL
 * 02 -> RM, SAK, CL
 * 11 -> RM, SAK, CL
 */
const ELECTRICAL_TO_LABEL: ConstraintMatrix = {
  "01": ["HF", "CL"],
  "02": ["RM", "SAK", "CL"],
  "11": ["RM", "SAK", "CL"],
};

/**
 * LABEL -> ELECTRICAL ARRANGEMENT
 * 
 * HF House Flame -> 01
 * RM Running Man -> 02, 11
 * SAK Self-Assemble -> 02, 11
 * CL Custom -> ALL
 */
const LABEL_TO_ELECTRICAL: ConstraintMatrix = {
  "HF": ["01"],
  "RM": ["02", "11"],
  "SAK": ["02", "11"],
  "CL": ["01", "02", "11"],
};

// ============================================================================
// CONSTRAINT DEFINITIONS
// ============================================================================

export const WATERPROOF_RESET_CALL_POINT_CONSTRAINTS: ModelConstraints = {
  modelId: "waterproof-reset-call-point",
  constraints: [
    // COLOUR <-> ELECTRICAL (bidirectional)
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
    
    // COLOUR <-> LABEL (bidirectional)
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
    
    // ELECTRICAL <-> LABEL (bidirectional)
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