// ============================================================================
// WATERPROOF RESET CALL POINT MODEL DEFINITION
// ============================================================================
//
// Source: 06_Конфигуратор_Waterproof_ReSet_Call_Point.md (VERIFIED)
// BaseCode: WRP2
// Format: WRP2-[colour]-[electrical][-CL]
//
// Example: WRP2-R-01 (Red, Conventional Fire Model)
// Example: WRP2-R-01-CL (with Custom Label)
//
// Steps:
// 1. COLOUR
// 2. ELECTRICAL ARRANGEMENT
// 3. LABEL
//
// KEY DIFFERENCES FROM RESET CALL POINTS:
// - No MOUNTING step (3 steps vs 4)
// - No #05 Sav-wire option in ELECTRICAL
// - BaseCode: WRP2 vs RP
//
// Dependencies handled by constraint engine in src/rules/waterproofResetCallPointRules.ts
// ============================================================================

import type { ModelDefinition, Step } from "../../types";

// ============================================================================
// IMAGE PATH CONSTANTS
// ============================================================================
const IMG = "/Waterproof ReSet Call Point";

// ============================================================================
// STEPS DEFINITION (VERIFIED FROM MD 06)
// ============================================================================

const steps: Step[] = [
  // ==========================================================================
  // STEP 1: COLOUR
  // ==========================================================================
  {
    id: "colour",
    title: "COLOUR",
    required: true,
    options: [
      { id: "R", label: "#R Red", code: "R", image: `${IMG}/COLOUR/R-Red.webp` },
      { id: "G", label: "#G Green", code: "G", image: `${IMG}/COLOUR/G-Green.webp` },
      { id: "Y", label: "#Y Yellow", code: "Y", image: `${IMG}/COLOUR/Y-Yellow.webp` },
      { id: "B", label: "#B Blue", code: "B", image: `${IMG}/COLOUR/B-Blue.webp` },
      { id: "W", label: "#W White", code: "W", image: `${IMG}/COLOUR/W-White.webp` },
      { id: "O", label: "#O Orange", code: "O", image: `${IMG}/COLOUR/O-Orange.webp` },
    ],
  },

  // ==========================================================================
  // STEP 2: ELECTRICAL ARRANGEMENT
  // ==========================================================================
  // Only 3 options (ReSet Call Points has 4 with #05)
  // Bidirectional dependencies with COLOUR and LABEL.
  // ==========================================================================
  {
    id: "electricalArrangement",
    title: "ELECTRICAL ARRANGEMENT",
    required: true,
    options: [
      { id: "01", label: "#01 Conventional Fire Model (EN54-11 approved)", code: "01", image: `${IMG}/ELECTRICAL ARRANGEMENT/01-Conventional-Fire-Model-(EN54-11-approved).webp` },
      { id: "02", label: "#02 Single Pole Changeover", code: "02", image: `${IMG}/ELECTRICAL ARRANGEMENT/02-Single-Pole-Changeover.webp` },
      { id: "11", label: "#11 Double Pole Changeover", code: "11", image: `${IMG}/ELECTRICAL ARRANGEMENT/11-Double-Pole-Changeover.webp` },
    ],
  },

  // ==========================================================================
  // STEP 3: LABEL
  // ==========================================================================
  // Bidirectional dependencies with COLOUR and ELECTRICAL.
  // Only #CL adds code to Product Model.
  // ==========================================================================
  {
    id: "label",
    title: "LABEL",
    required: true,
    options: [
      { id: "HF", label: "# 'House Flame' Logo", code: "", image: `${IMG}/LABEL/House-Flame-Logo.webp` },
      { id: "RM", label: "# 'Running Man' Logo", code: "", image: `${IMG}/LABEL/Running-Man-Logo.webp` },
      { id: "SAK", label: "# Self-Assemble Label Kit", code: "", image: `${IMG}/LABEL/Self-Assemble-Label-Kit.webp` },
      { id: "CL", label: "#CL Custom Label", code: "CL", image: `${IMG}/LABEL/CL-Custom-Label.webp` },
    ],
  },
];

// ============================================================================
// MODEL DEFINITION
// ============================================================================

export const waterproofResetCallPointModel: ModelDefinition = {
  id: "waterproof-reset-call-point",
  name: "Waterproof ReSet Call Point",
  slug: "waterproof-reset-call-point",
  
  steps,
  
  stepOrder: [
    "colour",
    "electricalArrangement",
    "label",
  ],
  
  productModelSchema: {
    baseCode: "WRP2",
    partsOrder: [
      "colour",
      "electricalArrangement",
      "label",
    ],
    separator: "dash",
    separatorMap: {
      colour: "-",
      electricalArrangement: "-",
      label: "-",
    },
  },
  
  primaryDependencyStep: "colour",
};