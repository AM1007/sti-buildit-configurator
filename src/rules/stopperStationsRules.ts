import type { ModelConstraints, ConstraintMatrix } from "./types";

const COLOUR_TO_ACTIVATION: ConstraintMatrix = {
  "0": [
    "0", "1", "2", "3", "4", "5",
    "6-red", "7-red",
    "8", "9"
  ],
  
  "1": [
    "0", "1", "2", "3", "4", "5",
    "6-green", "7-green",
    "8", "9"
  ],
  
  "2": [
    "0", "1", "2", "3", "4", "5",
    "6-red", "7-red",
    "8", "9"
  ],
  
  "3": [
    "0", "1", "2", "3", "4", "5",
    "6-red", 
    "7-red", 
    "8", "9"
  ],
  
  "4": [
    "0", "1", "2", "3", "4", "5",
    "6-blue", "7-blue",
    "8", "9"
  ],
  
  "5": [
    "1", "2", "3", "4", "5",
    "6-red", "7-red",
    "8", "9"
  ],
};

const ACTIVATION_TO_COLOUR: ConstraintMatrix = {
  "0": ["0", "1", "2", "3", "4"],
  "1": ["0", "1", "2", "3", "4", "5"],
  "2": ["0", "1", "2", "3", "4", "5"],
  "3": ["0", "1", "2", "3", "4", "5"],
  "4": ["0", "1", "2", "3", "4", "5"],
  "5": ["0", "1", "2", "3", "4", "5"],
  "6-red": ["0", "2", "3", "5"],
  "6-green": ["1"],
  "6-blue": ["4"],
  "7-red": ["0", "2", "3", "5"],
  "7-green": ["1"],
  "7-blue": ["4"],
  "8": ["0", "1", "2", "3", "4", "5"],
  "9": ["0", "1", "2", "3", "4", "5"],
};

const COLOUR_TO_INSTALLATION: ConstraintMatrix = {
  "0": [
    "none",
    "&KIT-71100A-R",
    "&KIT-71101B-R",
  ],
  
  "1": [
    "none",
    "&KIT-71100A-G",
    "&KIT-71101B-G",
  ],
  
  "2": [
    "none",
    "&KIT-71100A-Y",
    "&KIT-71101B-Y",
  ],
  
  "3": [
    "none",
    "&KIT-71100A-W",
    "&KIT-71101B-W"
  ],
  
  "4": [
    "none",
    "&KIT-71100A-B",
    "&KIT-71101B-B",
  ],
  
  "5": [
    "none",
    "&KIT-71100A-E",
    "&KIT-71101B-E",
  ],
};

const ACTIVATION_TO_INSTALLATION: ConstraintMatrix = {
  "0": [
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  
  "1": [
    
    "&KIT-71101B-R", 
     "&KIT-71101B-E",
    "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B",
  ],
  
  "2": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
  
  "3": [
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  
  "4": [
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  
  "5": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
  
  "6-red": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-G", "&KIT-71101B-B",
  ],
  
  "6-green": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-R", "&KIT-71101B-Y", "&KIT-71101B-W",
    "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  
  "6-blue": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-E",
  ],
  
  "7-red": [
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-G", "&KIT-71101B-B",
  ],
  
  "7-green": [
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-R", "&KIT-71101B-Y", "&KIT-71101B-W",
    "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  
  "7-blue": [
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-E",
  ],
  
  "8": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
  
  "9": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
};

const INSTALLATION_TO_ACTIVATION: ConstraintMatrix = {
  "none": [
    "2", "5",
    "6-red", "6-green", "6-blue",
    "8", "9",
  ],
  "&KIT-71100A-R": [
    "2", "5",
    "6-red", "6-green", "6-blue",
    "7-red", "7-green", "7-blue",
    "8", "9",
  ],
  "&KIT-71100A-G": [
    "2", "5",
    "6-red", "6-green", "6-blue",
    "7-red", "7-green", "7-blue",
    "8", "9",
  ],
  "&KIT-71100A-Y": [
    "2", "5",
    "6-red", "6-green", "6-blue",
    "7-red", "7-green", "7-blue",
    "8", "9",
  ],
  "&KIT-71100A-W": [
    "2", "5",
    "6-red", "6-green", "6-blue",
    "7-red", "7-green", "7-blue",
    "8", "9",
  ],
  "&KIT-71100A-B": [
    "2", "5",
    "6-red", "6-green", "6-blue",
    "7-red", "7-green", "7-blue",
    "8", "9",
  ],
  "&KIT-71100A-E": [
    "2", "5",
    "6-red", "6-green", "6-blue",
    "7-red", "7-green", "7-blue",
    "8", "9",
  ],

  "&KIT-71101B-R": [
    "0", "1", "3", "4",
    "6-green", "6-blue",
    "7-green", "7-blue",
  ],
  
  "&KIT-71101B-G": [
    "0", "1", "3", "4",
    "6-red", "6-blue",
    "7-red", "7-blue",
  ],
  
  "&KIT-71101B-Y": [
    "0", "1", "3", "4",
    "6-green", "6-blue",
    "7-green", "7-blue",
  ],
  
  "&KIT-71101B-W": [
    "0", "1", "3", "4",
    "6-green", "6-blue",
    "7-green", "7-blue",
  ],
  
  "&KIT-71101B-B": [
    "0", "1", "3", "4",
    "6-red", "6-green",
    "7-red", "7-green",
  ],
  
  "&KIT-71101B-E": [
    "0", "1", "3", "4",
    "6-green", "6-blue",
    "7-green", "7-blue",
  ],
};

// ============================================================================
// INSTALLATION OPTIONS → COLOUR (reverse)
// ============================================================================
// Derived from COLOUR_TO_INSTALLATION by inverting
// ============================================================================

const INSTALLATION_TO_COLOUR: ConstraintMatrix = {
  // "none" → all colours
  "none": ["0", "1", "2", "3", "4", "5"],
  
  // Red kits → Red or White
  "&KIT-71100A-R": ["0"],
  "&KIT-71101B-R": ["0"],
  
  // Green kits → Green or White
  "&KIT-71100A-G": ["1"],
  "&KIT-71101B-G": ["1"],
  
  // Yellow kits → Yellow or White
  "&KIT-71100A-Y": ["2"],
  "&KIT-71101B-Y": ["2"],
  
  // White kits → White only
  "&KIT-71100A-W": ["3"],
  "&KIT-71101B-W": ["3"],
  
  // Blue kits → Blue or White
  "&KIT-71100A-B": [ "4"],
  "&KIT-71101B-B": [ "4"],
  
  // Orange kits → Orange or White
  "&KIT-71100A-E": [ "5"],
  "&KIT-71101B-E": [ "5"],
};

export const STOPPER_STATIONS_CONSTRAINTS: ModelConstraints = {
  modelId: "stopper-stations",
  constraints: [
    // Forward constraints
    {
      sourceStep: "colour",
      targetStep: "activation",
      matrix: COLOUR_TO_ACTIVATION,
    },
    {
      sourceStep: "colour",
      targetStep: "installationOptions",
      matrix: COLOUR_TO_INSTALLATION,
    },
    {
      sourceStep: "activation",
      targetStep: "installationOptions",
      matrix: ACTIVATION_TO_INSTALLATION,
    },
    
    // Reverse constraints (bidirectional)
    {
      sourceStep: "activation",
      targetStep: "colour",
      matrix: ACTIVATION_TO_COLOUR,
    },
    {
      sourceStep: "installationOptions",
      targetStep: "colour",
      matrix: INSTALLATION_TO_COLOUR,
    },
    {
      sourceStep: "installationOptions",
      targetStep: "activation",
      matrix: INSTALLATION_TO_ACTIVATION,
    },
  ],
};

// ============================================================================
// EXPORTS FOR TESTING / DEBUGGING
// ============================================================================

export const DEBUG_MATRICES = {
  COLOUR_TO_ACTIVATION,
  COLOUR_TO_INSTALLATION,
  ACTIVATION_TO_INSTALLATION,
  ACTIVATION_TO_COLOUR,
  INSTALLATION_TO_COLOUR,
  INSTALLATION_TO_ACTIVATION,
};