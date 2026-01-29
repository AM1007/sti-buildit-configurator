import type { ModelConstraints, ConstraintMatrix } from "./types";

const CAMERA_TO_COLOUR: ConstraintMatrix = {

  "A": ["2", "3", "4"],

  "C": ["0", "1", "2", "3", "4"],
};


const CAMERA_TO_COVER: ConstraintMatrix = {
  "A": ["0", "2"],
  "C": ["0", "2"],
};

const CAMERA_TO_ACTIVATION: ConstraintMatrix = {
  "A": ["1"],
  "C": ["0", "1", "4"],
};

const CAMERA_TO_TEXT: ConstraintMatrix = {
  "A": ["ZA", "HV", "LD", "PO", "PS", "EM"],
  "C": ["AB", "PS", "EX", "RM", "XT", "PO", "ZA", "EM", "LD", "EV"],
};


const COLOUR_TO_CAMERA: ConstraintMatrix = {
  "0": ["C"],
  "1": ["C"],
  "2": ["A", "C"],
  "3": ["A", "C"],
  "4": ["A", "C"],
};

const COLOUR_TO_COVER: ConstraintMatrix = {
  "0": ["0", "2"],
  "1": ["0", "2"],
  "2": ["0", "2"],
  "3": ["0", "2"],
  "4": ["0", "2"],
};

const COLOUR_TO_ACTIVATION: ConstraintMatrix = {
  "0": ["0"],
  "1": ["0", "1", "4"],
  "2": ["1"],
  "3": ["1", "4"],
  "4": ["1", "4"],
};

const COLOUR_TO_TEXT: ConstraintMatrix = {
  "0": ["AB", "PS"],
  "1": ["EX", "RM", "XT"],
  "2": ["ZA", "HV", "LD", "PO", "PS"],
  "3": ["EM", "PO", "ZA"],
  "4": ["EM", "LD", "EX", "EV", "ZA"],
};

const COVER_TO_CAMERA: ConstraintMatrix = {
  "0": ["A", "C"],
  "2": ["A", "C"],
};


const COVER_TO_COLOUR: ConstraintMatrix = {
  "0": ["0", "1", "2", "3", "4"],
  "2": ["0", "1", "2", "3", "4"],
};

const COVER_TO_ACTIVATION: ConstraintMatrix = {
  "0": ["0", "1", "4"],
  "2": ["0", "1", "4"],
};

const COVER_TO_TEXT: ConstraintMatrix = {
  "0": ["AB", "PS", "EX", "RM", "XT", "ZA", "PO", "EM", "LD"],
  "2": ["AB", "HV", "LD", "PO", "PS", "EM", "EX", "ZA", "EV"],
};

const ACTIVATION_TO_CAMERA: ConstraintMatrix = {

  "0": ["C"],
  "1": ["A", "C"],
  "4": ["C"],
};

const ACTIVATION_TO_COLOUR: ConstraintMatrix = {
  "0": ["0", "1"],
  "1": ["1", "2", "3", "4"],
  "4": ["1", "3", "4"],
};

const ACTIVATION_TO_COVER: ConstraintMatrix = {
  "0": ["0", "2"],
  "1": ["0", "2"],
  "4": ["0", "2"],
};

// Activation → Text
const ACTIVATION_TO_TEXT: ConstraintMatrix = {
  // Key: AB, PS, EX
  "0": ["AB", "PS", "EX"],
  // Turn: ZA, HV, LD, PO, PS, EM, XT, EV
  "1": ["ZA", "HV", "LD", "PO", "PS", "EM", "XT", "EV"],
  // Momentary: RM, XT, EX, ZA
  "4": ["RM", "XT", "EX", "ZA"],
};

// ============================================================================
// TEXT constraints
// ============================================================================

// Text → Camera
const TEXT_TO_CAMERA: ConstraintMatrix = {
  "AB": ["C"],
  "PS": ["A", "C"],
  "EX": ["C"],
  "RM": ["C"],
  "XT": ["C"],
  "ZA": ["A", "C"],
  "HV": ["A"],
  "LD": ["A", "C"],
  "PO": ["A", "C"],
  "EM": ["A", "C"],
  "EV": ["C"],
};

const TEXT_TO_COLOUR: ConstraintMatrix = {
  "AB": ["0"],           
  "PS": ["0", "2"],      
  "EX": ["1", "4"],      
  "RM": ["1"],           
  "XT": ["1"],           
  "ZA": ["2", "3", "4"], 
  "HV": ["2"],           
  "LD": ["2", "4"],      
  "PO": ["2", "3"],      
  "EM": ["3", "4"],      
  "EV": ["4"],           
};

// Text → Cover
const TEXT_TO_COVER: ConstraintMatrix = {
  "AB": ["0", "2"],      
  "PS": ["0", "2"],      
  "EX": ["0", "2"],      
  "RM": ["0"],           
  "XT": ["0"],           
  "ZA": ["0", "2"],      
  "HV": ["2"],           
  "LD": ["0", "2"],      
  "PO": ["0", "2"],      
  "EM": ["0", "2"],      
  "EV": ["2"],           
};

const TEXT_TO_ACTIVATION: ConstraintMatrix = {
  "AB": ["0"],           
  "PS": ["0", "1"],      
  "EX": ["0", "4"],      
  "RM": ["4"],           
  "XT": ["1", "4"],      
  "ZA": ["1", "4"],      
  "HV": ["1"],           
  "LD": ["1"],           
  "PO": ["1"],           
  "EM": ["1"],           
  "EV": ["1"],           
};

export const G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS: ModelConstraints = {
  modelId: "g3-multipurpose-push-button",
  constraints: [
    
    { sourceStep: "camera", targetStep: "colour", matrix: CAMERA_TO_COLOUR },
    { sourceStep: "camera", targetStep: "cover", matrix: CAMERA_TO_COVER },
    { sourceStep: "camera", targetStep: "activation", matrix: CAMERA_TO_ACTIVATION },
    { sourceStep: "camera", targetStep: "text", matrix: CAMERA_TO_TEXT },
    
    { sourceStep: "colour", targetStep: "camera", matrix: COLOUR_TO_CAMERA },
    { sourceStep: "colour", targetStep: "cover", matrix: COLOUR_TO_COVER },
    { sourceStep: "colour", targetStep: "activation", matrix: COLOUR_TO_ACTIVATION },
    { sourceStep: "colour", targetStep: "text", matrix: COLOUR_TO_TEXT },
    
    // Cover → others
    { sourceStep: "cover", targetStep: "camera", matrix: COVER_TO_CAMERA },
    { sourceStep: "cover", targetStep: "colour", matrix: COVER_TO_COLOUR },
    { sourceStep: "cover", targetStep: "activation", matrix: COVER_TO_ACTIVATION },
    { sourceStep: "cover", targetStep: "text", matrix: COVER_TO_TEXT },
    
    // Activation → others
    { sourceStep: "activation", targetStep: "camera", matrix: ACTIVATION_TO_CAMERA },
    { sourceStep: "activation", targetStep: "colour", matrix: ACTIVATION_TO_COLOUR },
    { sourceStep: "activation", targetStep: "cover", matrix: ACTIVATION_TO_COVER },
    { sourceStep: "activation", targetStep: "text", matrix: ACTIVATION_TO_TEXT },
    
    // Text → others
    { sourceStep: "text", targetStep: "camera", matrix: TEXT_TO_CAMERA },
    { sourceStep: "text", targetStep: "colour", matrix: TEXT_TO_COLOUR },
    { sourceStep: "text", targetStep: "cover", matrix: TEXT_TO_COVER },
    { sourceStep: "text", targetStep: "activation", matrix: TEXT_TO_ACTIVATION },
  ],
};

// ============================================================================
// Valid SKU list for final validation
// ============================================================================

export const VALID_G3_SKUS = [
  // G3A series (no camera)
  "G3A209ZA-EN",
  "G3A229HV-EN",
  "G3A229LD-EN",
  "G3A229PO-EN",
  "G3A229PS-EN",
  "G3A309EM-EN",
  "G3A309PO-EN",
  "G3A329EM-EN",
  "G3A409EM-EN",
  "G3A409LD-EN",
  "G3A429EM-EN",
  "G3A429LD-EN",
  // G3C series (with camera)
  "G3C002AB-EN",
  "G3C002PS-EN",
  // G3C002AB-EN with shield - same SKU, different config (source data issue)
  "G3C102EX-EN",
  "G3C105RM-EN",
  "G3C105XT-EN",
  "G3C109XT-EN",
  "G3C122EX-EN",
  "G3C209PO-EN",
  "G3C209ZA-EN",
  "G3C325ZA-EN",
  "G3C405EX-EN",
  "G3C409EM-EN",
  "G3C409LD-EN",
  "G3C429EM-EN",
  "G3C429EV-EN",
  "G3C429LD-EN",
  "G3C429ZA-EN",
] as const;

export type ValidG3Sku = (typeof VALID_G3_SKUS)[number];

// ============================================================================
// Debug export
// ============================================================================

export const DEBUG_MATRICES = {
  CAMERA_TO_COLOUR,
  CAMERA_TO_COVER,
  CAMERA_TO_ACTIVATION,
  CAMERA_TO_TEXT,
  COLOUR_TO_CAMERA,
  COLOUR_TO_COVER,
  COLOUR_TO_ACTIVATION,
  COLOUR_TO_TEXT,
  COVER_TO_CAMERA,
  COVER_TO_COLOUR,
  COVER_TO_ACTIVATION,
  COVER_TO_TEXT,
  ACTIVATION_TO_CAMERA,
  ACTIVATION_TO_COLOUR,
  ACTIVATION_TO_COVER,
  ACTIVATION_TO_TEXT,
  TEXT_TO_CAMERA,
  TEXT_TO_COLOUR,
  TEXT_TO_COVER,
  TEXT_TO_ACTIVATION,
};