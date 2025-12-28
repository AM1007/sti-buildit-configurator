// ============================================================================
// STOPPER STATIONS - CONSTRAINT RULES
// ============================================================================
//
// Source: Example2.md (PRIORITY), cross-referenced with stopperStations.ts
//
// Bidirectional constraints:
// - COLOUR ↔ ACTIVATION
// - COLOUR ↔ INSTALLATION OPTIONS
// - ACTIVATION ↔ INSTALLATION OPTIONS
//
// Logic: AND (intersection) when multiple constraints apply
//
// ============================================================================

import type { ModelConstraints, ConstraintMatrix } from "./types";

// ============================================================================
// COLOUR → ACTIVATION
// ============================================================================
// Source: Example2.md "Выбор опций в меню COLOUR"
// ============================================================================

const COLOUR_TO_ACTIVATION: ConstraintMatrix = {
  // #0 Red → all except blue variants
  "0": [
    "0", "1", "2", "3", "4", "5",
    "6-red", "7-red",
    "8", "9"
  ],
  
  // #1 Green → all except red/blue variants
  "1": [
    "0", "1", "2", "3", "4", "5",
    "6-green", "7-green",
    "8", "9"
  ],
  
  // #2 Yellow → same as Red (uses red illuminated variants)
  "2": [
    "0", "1", "2", "3", "4", "5",
    "6-red", "7-red",
    "8", "9"
  ],
  
  // #3 White → ALL options available
  "3": [
    "0", "1", "2", "3", "4", "5",
    "6-red", 
    // "6-green", "6-blue",
    "7-red", 
    // "7-green", "7-blue",
    "8", "9"
  ],
  
  // #4 Blue → all except red/green variants
  "4": [
    "0", "1", "2", "3", "4", "5",
    "6-blue", "7-blue",
    "8", "9"
  ],
  
  // #5 Orange → NO #0 Key-to-Reset, uses red illuminated variants
  "5": [
    "1", "2", "3", "4", "5",
    "6-red", "7-red",
    "8", "9"
  ],
};

// ============================================================================
// ACTIVATION → COLOUR (reverse)
// ============================================================================
// Source: Example2.md "Выбор опций в меню ACTIVATION"
// ============================================================================

const ACTIVATION_TO_COLOUR: ConstraintMatrix = {
  // #0 Key-to-Reset → NOT Orange
  "0": ["0", "1", "2", "3", "4"],
  
  // #1 Turn-to-Reset → all colours
  "1": ["0", "1", "2", "3", "4", "5"],
  
  // #2 Key-to-Reset Illuminates → all colours
  "2": ["0", "1", "2", "3", "4", "5"],
  
  // #3 Key-to-Activate → all colours
  "3": ["0", "1", "2", "3", "4", "5"],
  
  // #4 Momentary → all colours
  "4": ["0", "1", "2", "3", "4", "5"],
  
  // #5 Momentary Illuminates → all colours
  "5": ["0", "1", "2", "3", "4", "5"],
  
  // #6 Red Illuminated → Red, Yellow, White, Orange
  "6-red": ["0", "2", "3", "5"],
  
  // #6 Green Illuminated → Green only
  "6-green": ["1"],
  
  // #6 Blue Illuminated → Blue only
  "6-blue": ["4"],
  
  // #7 Weather Resistant Red → Red, Yellow, White, Orange
  "7-red": ["0", "2", "3", "5"],
  
  // #7 Weather Resistant Green → Green only
  "7-green": ["1"],
  
  // #7 Weather Resistant Blue → Blue only
  "7-blue": ["4"],
  
  // #8 Pneumatic → all colours
  "8": ["0", "1", "2", "3", "4", "5"],
  
  // #9 Turn-to-Reset Illuminates → all colours
  "9": ["0", "1", "2", "3", "4", "5"],
};

// ============================================================================
// COLOUR → INSTALLATION OPTIONS
// ============================================================================
// Source: Example2.md "Выбор опций в меню COLOUR" - INSTALLATION OPTION sections
// ============================================================================

const COLOUR_TO_INSTALLATION: ConstraintMatrix = {
  // #0 Red → Red kits only
  "0": [
    "none",
    "&KIT-71100A-R",
    "&KIT-71101B-R",
  ],
  
  // #1 Green → Green kits only
  "1": [
    "none",
    "&KIT-71100A-G",
    "&KIT-71101B-G",
  ],
  
  // #2 Yellow → Yellow kits only
  "2": [
    "none",
    "&KIT-71100A-Y",
    "&KIT-71101B-Y",
  ],
  
  // #3 White → ALL kits
  "3": [
    "none",
    "&KIT-71100A-W",
    "&KIT-71101B-W"
    // "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    // "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    // "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    // "&KIT-71101B-W", "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  
  // #4 Blue → Blue kits only
  "4": [
    "none",
    "&KIT-71100A-B",
    "&KIT-71101B-B",
  ],
  
  // #5 Orange → Orange kits only
  "5": [
    "none",
    "&KIT-71100A-E",
    "&KIT-71101B-E",
  ],
};

// ============================================================================
// ACTIVATION → INSTALLATION OPTIONS
// ============================================================================
// Source: Example2.md "Выбор опций в меню ACTIVATION" - INSTALLATION OPTIONS sections
// CRITICAL: This is the complex part with kit type restrictions
// ============================================================================

const ACTIVATION_TO_INSTALLATION: ConstraintMatrix = {
  // #0 Key-to-Reset → Deep kits only (KIT-71101B-*), NO "none", NO surface kits
  "0": [
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  
  // #1 Turn-to-Reset → Deep kits only (KIT-71101B-*)
  "1": [
    
    "&KIT-71101B-R", 
     "&KIT-71101B-E",
    "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B",
  ],
  
  // #2 Key-to-Reset Illuminates → "none" + Surface kits only (KIT-71100A-*)
  "2": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
  
  // #3 Key-to-Activate → Deep kits only (KIT-71101B-*)
  "3": [
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  
  // #4 Momentary → Deep kits only (KIT-71101B-*)
  "4": [
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  
  // #5 Momentary Illuminates → "none" + Surface kits only (KIT-71100A-*)
  "5": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
  
  // #6 Red Illuminated → "none" + Surface + partial Deep (Green, Blue)
  // Source: Example2.md page with "#6 Red Illuminated EXTENDED LEAD TIMES"
  "6-red": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-G", "&KIT-71101B-B",
  ],
  
  // #6 Green Illuminated → "none" + Surface + partial Deep (Red, Yellow, White, Blue, Orange)
  // Source: Example2.md second "#6" section (for Green)
  "6-green": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-R", "&KIT-71101B-Y", "&KIT-71101B-W",
    "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  
  // #6 Blue Illuminated → "none" + Surface + partial Deep (all except Blue)
  // Source: Example2.md "#6 Blue Illuminated EXTENDED LEAD TIMES"
  "6-blue": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-E",
  ],
  
  // #7 Weather Resistant Red → Surface kits only (NO "none" per Example2.md)
  // + partial Deep (Green, Blue)
  "7-red": [
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-G", "&KIT-71101B-B",
  ],
  
  // #7 Weather Resistant Green → Surface + partial Deep
  "7-green": [
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-R", "&KIT-71101B-Y", "&KIT-71101B-W",
    "&KIT-71101B-B", "&KIT-71101B-E",
  ],
  
  // #7 Weather Resistant Blue → Surface + partial Deep (all except Blue Deep)
  "7-blue": [
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
    "&KIT-71101B-R", "&KIT-71101B-G", "&KIT-71101B-Y",
    "&KIT-71101B-W", "&KIT-71101B-E",
  ],
  
  // #8 Pneumatic → "none" + Surface kits only
  "8": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
  
  // #9 Turn-to-Reset Illuminates → "none" + Surface kits only
  "9": [
    "none",
    "&KIT-71100A-R", "&KIT-71100A-G", "&KIT-71100A-Y",
    "&KIT-71100A-W", "&KIT-71100A-B", "&KIT-71100A-E",
  ],
};

// ============================================================================
// INSTALLATION OPTIONS → ACTIVATION (reverse)
// ============================================================================
// Derived from ACTIVATION_TO_INSTALLATION by inverting the matrix
// ============================================================================

const INSTALLATION_TO_ACTIVATION: ConstraintMatrix = {
  // "none" → activations that allow "none"
  "none": [
    "2", "5",
    "6-red", "6-green", "6-blue",
    "8", "9",
  ],
  
  // Surface kits (KIT-71100A-*) → activations that allow surface
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
  
  // Deep kits (KIT-71101B-*) → activations that allow deep
  // Red Deep: 0, 1, 3, 4, 6-green, 6-blue, 7-green, 7-blue
  "&KIT-71101B-R": [
    "0", "1", "3", "4",
    "6-green", "6-blue",
    "7-green", "7-blue",
  ],
  
  // Green Deep: 0, 1, 3, 4, 6-red, 6-blue, 7-red, 7-blue
  "&KIT-71101B-G": [
    "0", "1", "3", "4",
    "6-red", "6-blue",
    "7-red", "7-blue",
  ],
  
  // Yellow Deep: 0, 1, 3, 4, 6-green, 6-blue, 7-green, 7-blue
  "&KIT-71101B-Y": [
    "0", "1", "3", "4",
    "6-green", "6-blue",
    "7-green", "7-blue",
  ],
  
  // White Deep: 0, 1, 3, 4, 6-green, 6-blue, 7-green, 7-blue
  "&KIT-71101B-W": [
    "0", "1", "3", "4",
    "6-green", "6-blue",
    "7-green", "7-blue",
  ],
  
  // Blue Deep: 0, 1, 3, 4, 6-red, 6-green, 7-red, 7-green
  "&KIT-71101B-B": [
    "0", "1", "3", "4",
    "6-red", "6-green",
    "7-red", "7-green",
  ],
  
  // Orange Deep: 0, 1, 3, 4, 6-green, 6-blue, 7-green, 7-blue
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

// ============================================================================
// ASSEMBLED CONSTRAINTS
// ============================================================================

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