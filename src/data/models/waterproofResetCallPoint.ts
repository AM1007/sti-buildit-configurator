import type { ModelDefinition, Step } from "../../types";

const IMG = "/Waterproof ReSet Call Point";
const steps: Step[] = [
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

  {
    id: "electricalArrangement",
    title: "ELECTRICAL ARRANGEMENT",
    required: true,
    options: [
      // Option "01" (Conventional Fire Model) removed — absent from whitelist.
      // No SKU in 08_Waterproof_ReSet_Call_Point.md uses electrical code "01".
      { id: "02", label: "#02 Single Pole Changeover", code: "02", image: `${IMG}/ELECTRICAL ARRANGEMENT/02-Single-Pole-Changeover.webp` },
      { id: "11", label: "#11 Double Pole Changeover", code: "11", image: `${IMG}/ELECTRICAL ARRANGEMENT/11-Double-Pole-Changeover.webp` },
    ],
  },

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