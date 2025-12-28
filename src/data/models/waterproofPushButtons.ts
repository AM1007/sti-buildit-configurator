// ============================================================================
// WATERPROOF PUSH BUTTONS MODEL DEFINITION
// ============================================================================
//
// Source: 04_Конфигуратор_StopperSwitches_Waterproof_Push_Buttons.md (VERIFIED)
// BaseCode: WSS3
// Format: WSS3-[housing][buttonColour][buttonType][electrical][-CL]
//
// Example: WSS3-1R04 (Red housing, Red button, Latching, Multi-Functional)
// Example: WSS3-1R04-CL (with Custom Label)
//
// Steps:
// 1. HOUSING COLOUR & MOUNTING
// 2. BUTTON COLOUR
// 3. BUTTON TYPE
// 4. ELECTRICAL ARRANGEMENTS
// 5. LABEL
//
// KEY DIFFERENCES FROM INDOOR PUSH BUTTONS:
// - BaseCode: WSS3 vs SS3-
// - All housing options are "Surface Mount" (not "Dual Mount")
// - BUTTON TYPE: 2 options (#0, #1) vs 3 options (#0, #1, #6)
// - ELECTRICAL: Only 1 option (#4) vs 2 options (#0, #4)
// - Different HOUSING → BUTTON COLOUR compatibility matrix
//
// Dependencies handled by constraint engine in src/rules/waterproofPushButtonsRules.ts
// ============================================================================

import type { ModelDefinition, Step } from "../../types";

// ============================================================================
// IMAGE PATH CONSTANTS
// ============================================================================
const IMG = "/Waterproof Push Buttons";

// ============================================================================
// STEPS DEFINITION (VERIFIED FROM MD 04)
// ============================================================================

const steps: Step[] = [
  // ==========================================================================
  // STEP 1: HOUSING COLOUR & MOUNTING
  // ==========================================================================
  {
    id: "housingColour",
    title: "HOUSING COLOUR & MOUNTING",
    required: true,
    options: [
      { id: "1", label: "#1 Red (Surface Mount)", code: "1", image: `${IMG}/HOUSING COLOUR & MOUNTING/1-Red (Surface Mount).webp` },
      { id: "3", label: "#3 Green (Surface Mount)", code: "3", image: `${IMG}/HOUSING COLOUR & MOUNTING/3-Green (Surface Mount).webp` },
      { id: "5", label: "#5 Yellow (Surface Mount)", code: "5", image: `${IMG}/HOUSING COLOUR & MOUNTING/5-Yellow (Surface Mount).webp` },
      { id: "7", label: "#7 White (Surface Mount)", code: "7", image: `${IMG}/HOUSING COLOUR & MOUNTING/7-White (Surface Mount).webp` },
      { id: "9", label: "#9 Blue (Surface Mount)", code: "9", image: `${IMG}/HOUSING COLOUR & MOUNTING/9-Blue (Surface Mount).webp` },
      { id: "E", label: "#E Orange (Surface Mount)", code: "E", image: `${IMG}/HOUSING COLOUR & MOUNTING/E-Orange (Surface Mount).webp` },
    ],
  },

  // ==========================================================================
  // STEP 2: BUTTON COLOUR
  // ==========================================================================
  // Bidirectional dependencies with HOUSING COLOUR.
  // Handled by constraint engine.
  // ==========================================================================
  {
    id: "buttonColour",
    title: "BUTTON COLOUR",
    required: true,
    options: [
      { id: "R", label: "#R Red Button", code: "R", image: `${IMG}/BUTTON COLOUR/R-Red-Button.webp` },
      { id: "G", label: "#G Green Button", code: "G", image: `${IMG}/BUTTON COLOUR/G-Green-Button.webp` },
      { id: "Y", label: "#Y Yellow Button", code: "Y", image: `${IMG}/BUTTON COLOUR/Y-Yellow-Button.webp` },
      { id: "W", label: "#W White Button", code: "W", image: `${IMG}/BUTTON COLOUR/W-White-Button.webp` },
      { id: "B", label: "#B Blue Button", code: "B", image: `${IMG}/BUTTON COLOUR/B-Blue-Button.webp` },
      { id: "E", label: "#E Orange Button", code: "E", image: `${IMG}/BUTTON COLOUR/E-Orange-Button.webp` },
    ],
  },

  // ==========================================================================
  // STEP 3: BUTTON TYPE
  // ==========================================================================
  // Only 2 options (Indoor has 3 with #6 Pneumatic)
  // No dependencies
  // ==========================================================================
  {
    id: "buttonType",
    title: "BUTTON TYPE",
    required: true,
    options: [
      { id: "0", label: "#0 Latching (Key-to-Reset)", code: "0", image: `${IMG}/BUTTON TYPE/0-Latching-(Key-to-Reset).webp` },
      { id: "1", label: "#1 Momentary", code: "1", image: `${IMG}/BUTTON TYPE/1-Momentary.webp` },
    ],
  },

  // ==========================================================================
  // STEP 4: ELECTRICAL ARRANGEMENTS
  // ==========================================================================
  // Only 1 option (Indoor has 2: #0 and #4)
  // No dependencies
  // ==========================================================================
  {
    id: "electricalArrangements",
    title: "ELECTRICAL ARRANGEMENTS",
    required: true,
    options: [
      { id: "4", label: "#4 Multi-Functional Signal (SPC & DPC)", code: "4", image: `${IMG}/ELECTRICAL ARRANGEMENTS/4-Multi-Functional-Signal-(SPC-DPC).webp` },
    ],
  },

  // ==========================================================================
  // STEP 5: LABEL
  // ==========================================================================
  {
    id: "label",
    title: "LABEL",
    required: true,
    options: [
      {
        id: "SAK",
        label: "# Self-Assemble Label Kit",
        code: "",
        image: `${IMG}/LABEL/Self-Assemble Label Kit.webp`,
      },
      {
        id: "CL",
        label: "#CL Custom Label",
        code: "CL",
        image: `${IMG}/LABEL/CL Custom Label.webp`,
      },
    ],
  },
];

// ============================================================================
// MODEL DEFINITION
// ============================================================================

export const waterproofPushButtonsModel: ModelDefinition = {
  id: "waterproof-push-buttons",
  name: "StopperSwitches Waterproof Push Buttons",
  slug: "waterproof-push-buttons",
  
  steps,
  
  stepOrder: [
    "housingColour",
    "buttonColour",
    "buttonType",
    "electricalArrangements",
    "label",
  ],
  
  productModelSchema: {
    baseCode: "WSS3",
    partsOrder: [
      "housingColour",
      "buttonColour",
      "buttonType",
      "electricalArrangements",
      "label",
    ],
    separator: "none",
    separatorMap: {
      housingColour: "-",
      buttonColour: "",
      buttonType: "",
      electricalArrangements: "",
      label: "-",
    },
  },
  
  primaryDependencyStep: "housingColour",
};