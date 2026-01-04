import type { ModelDefinition, Step } from "../../types";

const IMG = "/Key Switches";

const steps: Step[] = [
  {
    id: "colourMounting",
    title: "COLOUR & MOUNTING",
    required: true,
    options: [
      { id: "10", label: "#10 Red (Dual Mount)", code: "10", image: `${IMG}/COLOUR & MOUNTING/10-Red (Dual-Mount).webp` },
      { id: "30", label: "#30 Green (Dual Mount)", code: "30", image: `${IMG}/COLOUR & MOUNTING/30-Green(Dual-Mount).webp` },
      { id: "50", label: "#50 Yellow (Dual Mount)", code: "50", image: `${IMG}/COLOUR & MOUNTING/50-Yellow-(Dual-Mount).webp` },
      { id: "70", label: "#70 White (Dual Mount)", code: "70", image: `${IMG}/COLOUR & MOUNTING/70-White-(Dual-Mount).webp` },
      { id: "90", label: "#90 Blue (Dual Mount)", code: "90", image: `${IMG}/COLOUR & MOUNTING/90-Blue-(Dual-Mount).webp` },
      { id: "E0", label: "#E0 Orange (Dual Mount)", code: "E0", image: `${IMG}/COLOUR & MOUNTING/E0-Orange-(Dual-Mount).webp` },
    ],
  },

  {
    id: "switchType",
    title: "SWITCH TYPE",
    required: true,
    options: [
      { id: "2", label: "#2 Switch Type", code: "2", image: `${IMG}/SWITCH TYPE/2-Switch-Type.webp` },
      { id: "3", label: "#3 Switch Type", code: "3", image: `${IMG}/SWITCH TYPE/3-Switch-Type.webp` },
      { id: "4", label: "#4 Switch Type", code: "4", image: `${IMG}/SWITCH TYPE/4-Switch-Type.webp` },
      { id: "5", label: "#5 Switch Type", code: "5", image: `${IMG}/SWITCH TYPE/5-Switch-Type.webp` },
    ],
  },

  {
    id: "electricalArrangement",
    title: "ELECTRICAL ARRANGEMENT",
    required: true,
    options: [
      {
        id: "0",
        label: "#0 Single Pole Changeover",
        code: "0",
        image: `${IMG}/ELECTRICAL ARRANGEMENT/0-Single-Pole-Changeover.webp`,
        availableFor: ["2", "3"],
        dependsOn: "switchType",
      },
      {
        id: "1",
        label: "#1 Double Pole Normally Open",
        code: "1",
        image: `${IMG}/ELECTRICAL ARRANGEMENT/1-Double-Pole-Normally-Open.webp`,
        availableFor: ["3", "4"],
        dependsOn: "switchType",
      },
      {
        id: "2",
        label: "#2 Double Pole Normally Closed",
        code: "2",
        image: `${IMG}/ELECTRICAL ARRANGEMENT/2-Double-Pole-Normally-Closed.webp`,
        availableFor: ["3", "4"],
        dependsOn: "switchType",
      },
      {
        id: "3",
        label: "#3 Position Key Switch Arrangement",
        code: "3",
        image: `${IMG}/ELECTRICAL ARRANGEMENT/3-Position-Key-Switch-Arrangement.webp`,
        availableFor: ["5"],
        dependsOn: "switchType",
      },
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

export const keySwitchesModel: ModelDefinition = {
  id: "key-switches",
  name: "StopperSwitches Key Switches",
  slug: "key-switches",
  
  steps,
  
  stepOrder: [
    "colourMounting",
    "switchType",
    "electricalArrangement",
    "label",
  ],
  
  productModelSchema: {
    baseCode: "SS3-",
    partsOrder: [
      "colourMounting",
      "switchType",
      "electricalArrangement",
      "label",
    ],
    separator: "none",
    separatorMap: {
      colourMounting: "",
      switchType: "",
      electricalArrangement: "",
      label: "-",
    },
  },
  
  primaryDependencyStep: "switchType",
};