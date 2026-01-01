import type { ModelDefinition, Step } from "../../types";

const IMG = "/Indoor Push Buttons";

const steps: Step[] = [
  {
    id: "colour",
    title: "COLOUR",
    required: true,
    options: [
      { id: "1", label: "#1 Red (Dual Mount)", code: "1", image: `${IMG}/COLOUR/1-Red-(Dual-Mount).webp` },
      { id: "3", label: "#3 Green (Dual Mount)", code: "3", image: `${IMG}/COLOUR/3-Green-(Dual-Mount).webp` },
      { id: "5", label: "#5 Yellow (Dual Mount)", code: "5", image: `${IMG}/COLOUR/5-Yellow-(Dual-Mount).webp` },
      { id: "7", label: "#7 White (Dual Mount)", code: "7", image: `${IMG}/COLOUR/7-White-(Dual-Mount).webp` },
      { id: "9", label: "#9 Blue (Dual Mount)", code: "9", image: `${IMG}/COLOUR/9-Blue-(Dual-Mount).webp` },
      { id: "E", label: "#E Orange (Dual Mount)", code: "E", image: `${IMG}/COLOUR/E-Orange-(Dual-Mount).webp` },
    ],
  },

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

  {
    id: "pushButtonType",
    title: "PUSH BUTTON TYPE",
    required: true,
    options: [
      { id: "0", label: "#0 Key-to-Reset", code: "0", image: `${IMG}/PUSH BUTTON TYPE/0-Key-to-Reset.webp` },
      { id: "1", label: "#1 Momentary", code: "1", image: `${IMG}/PUSH BUTTON TYPE/1-Momentary.webp` },
      { 
        id: "6", 
        label: "#6 Pneumatic EXTENDED LEAD TIMES", 
        code: "6",
        image: `${IMG}/PUSH BUTTON TYPE/6-Pneumatic-EXTENDED-LEAD-TIMES.webp`,
        notes: "EXTENDED LEAD TIMES",
      },
    ],
  },

  {
    id: "electricalArrangements",
    title: "ELECTRICAL ARRANGEMENTS",
    required: true,
    options: [
      { id: "0", label: "#0 Single Pole Changeover", code: "0", image: `${IMG}/ELECTRICAL ARRANGEMENTS/0-Single-Pole-Changeover.webp` },
      { id: "4", label: "#4 Multi-Functional Signal (SPC & DPC)", code: "4", image: `${IMG}/ELECTRICAL ARRANGEMENTS/4-Multi-Functional-Signal-(SPC-&-DPC).webp` },
    ],
  },

  {
    id: "label",
    title: "LABEL",
    required: true,
    options: [
      {
        id: "SAK",
        label: "# Self-Assemble Label Kit",
        code: "",
        image: `${IMG}/LABEL/Self-Assemble-Label-Kit.webp`,
      },
      {
        id: "CL",
        label: "#CL Custom Label",
        code: "CL",
        image: `${IMG}/LABEL/CL-Custom-Label.webp`,
      },
    ],
  },
];

export const indoorPushButtonsModel: ModelDefinition = {
  id: "indoor-push-buttons",
  name: "StopperSwitches Indoor Push Buttons",
  slug: "indoor-push-buttons",
  
  steps,
  
  stepOrder: [
    "colour",
    "buttonColour",
    "pushButtonType",
    "electricalArrangements",
    "label",
  ],
  
  productModelSchema: {
    baseCode: "SS3-",
    partsOrder: [
      "colour",
      "buttonColour",
      "pushButtonType",
      "electricalArrangements",
      "label",
    ],
    separator: "none",
    separatorMap: {
      colour: "",
      buttonColour: "",
      pushButtonType: "",
      electricalArrangements: "",
      label: "-",
    },
  },
  
  primaryDependencyStep: "colour",
};