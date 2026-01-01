import type { ModelDefinition, Step } from "../../types";

const SWITCH_TO_ELECTRICAL: Record<string, string[]> = {
  "2": ["0"],           
  "3": ["0", "1", "2"], 
  "4": ["1", "2"],      
  "5": ["3"],           
};

const ELECTRICAL_TO_SWITCH: Record<string, string[]> = {
  "0": ["2", "3"],      
  "1": ["3", "4"],      
  "2": ["3", "4"],      
  "3": ["5"],           
};

const steps: Step[] = [
  {
    id: "colourMounting",
    title: "COLOUR & MOUNTING",
    required: true,
    options: [
      { id: "10", label: "#10 Red (Dual Mount)", code: "10" },
      { id: "30", label: "#30 Green (Dual Mount)", code: "30" },
      { id: "50", label: "#50 Yellow (Dual Mount)", code: "50" },
      { id: "70", label: "#70 White (Dual Mount)", code: "70" },
      { id: "90", label: "#90 Blue (Dual Mount)", code: "90" },
      { id: "E0", label: "#E0 Orange (Dual Mount)", code: "E0" },
    ],
  },

  {
    id: "switchType",
    title: "SWITCH TYPE",
    required: true,
    options: [
      { id: "2", label: "#2 Switch Type", code: "2" },
      { id: "3", label: "#3 Switch Type", code: "3" },
      { id: "4", label: "#4 Switch Type", code: "4" },
      { id: "5", label: "#5 Switch Type", code: "5" },
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
        availableFor: ["2", "3"], 
        dependsOn: "switchType",
      },
      {
        id: "1",
        label: "#1 Double Pole Normally Open",
        code: "1",
        availableFor: ["3", "4"],
        dependsOn: "switchType",
      },
      {
        id: "2",
        label: "#2 Double Pole Normally Closed",
        code: "2",
        availableFor: ["3", "4"],
        dependsOn: "switchType",
      },
      {
        id: "3",
        label: "#3 Position Key Switch Arrangement",
        code: "3",
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
      },
      {
        id: "CL",
        label: "#CL Custom Label",
        code: "CL", 
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

export const keySwitchesCompatibility = {
  switchToElectrical: SWITCH_TO_ELECTRICAL,
  electricalToSwitch: ELECTRICAL_TO_SWITCH,
};