import type { Step } from "../types";

export const STEPS: Step[] = [
  {
    id: "colour",
    title: "COLOUR",
    required: true,
    options: [
      { id: "0", label: "#0 Red", code: "0" },
      { id: "1", label: "#1 Green", code: "1" },
      { id: "2", label: "#2 Yellow", code: "2" },
      { id: "3", label: "#3 White", code: "3" },
      { id: "4", label: "#4 Blue", code: "4" },
      { id: "5", label: "#5 Orange", code: "5" },
    ],
  },

  {
    id: "cover",
    title: "COVER",
    required: true,
    options: [
      { id: "0", label: "#0 No Cover", code: "0" },
      { id: "2", label: "#2 Shield", code: "2" },
    ],
  },

  {
    id: "activation",
    title: "ACTIVATION",
    required: true,
    options: [
      {
        id: "0",
        label: "#0 Key-to-Reset",
        code: "0",
        availableFor: ["0", "1", "2", "3", "4"],
      },
      {
        id: "1",
        label: "#1 Turn-to-Reset",
        code: "1",
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "2",
        label: "#2 Key-to-Reset Illuminates green, red or white",
        code: "2",
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "3",
        label: "#3 Key-to-Activate",
        code: "3",
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "4",
        label: "#4 Momentary",
        code: "4",
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "5",
        label: "#5 Momentary Illuminates green, red or white",
        code: "5",
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "6-red",
        label: "#6 Red Illuminated",
        code: "6",
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["0", "2", "3", "5"], 
      },
      {
        id: "6-green",
        label: "#6 Green Illuminated",
        code: "6",
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["1", "3"], 
      },
      {
        id: "6-blue",
        label: "#6 Blue Illuminated",
        code: "6",
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["3", "4"], 
      },
      {
        id: "7-red",
        label: "#7 Weather Resistant Momentary Illuminated Red",
        code: "7",
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["0", "2", "3", "5"], 
      },
      {
        id: "7-green",
        label: "#7 Weather Resistant Green Illuminated",
        code: "7",
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["1", "3"], 
      },
      {
        id: "7-blue",
        label: "#7 Weather Resistant Blue Illuminated",
        code: "7",
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["3", "4"],
      },
      {
        id: "8",
        label: "#8 Pneumatic Illuminates green, red or white",
        code: "8",
        notes: "NOT UL LISTED",
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "9",
        label: "#9 Turn-to-Reset Illuminates green, red or white",
        code: "9",
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
    ],
  },

  {
    id: "text",
    title: "TEXT",
    required: true,
    options: [
      { id: "AB", label: "#AB ABORT", code: "AB" },
      { id: "EM", label: "#EM EMERGENCY", code: "EM" },
      { id: "EX", label: "#EX EMERGENCY EXIT", code: "EX" },
      { id: "PO", label: "#PO EMERGENCY POWER OFF", code: "PO" },
      { id: "ES", label: "#ES EMERGENCY STOP", code: "ES" },
      { id: "EV", label: "#EV EVACUATION", code: "EV" },
      { id: "XT", label: "#XT EXIT", code: "XT" },
      { id: "PS", label: "#PS FUEL PUMP SHUT-DOWN", code: "PS" },
      { id: "HV", label: "#HV HVAC SHUT-DOWN", code: "HV" },
      { id: "LD", label: "#LD LOCKDOWN", code: "LD" },
      { id: "PX", label: "#PX PUSH TO EXIT", code: "PX" },
      { id: "NT", label: "#NT NO TEXT, blank button and/or cover", code: "NT" },
      { id: "ZA", label: "#ZA NON-RETURNABLE custom text", code: "ZA" },
    ],
  },

  {
    id: "language",
    title: "LANGUAGE",
    required: true,
    options: [
      { id: "EN", label: "#EN English", code: "EN" },
      { id: "ES", label: "#ES Spanish", code: "ES" },
      { id: "FR", label: "#FR French", code: "FR" },
      { id: "ZL", label: "#ZL NON-RETURNABLE other language", code: "ZL" },
    ],
  },
  {
    id: "installationOptions",
    title: "INSTALLATION OPTIONS",
    required: false, 
    options: [
      {
        id: "none",
        label: "# No additional mounting accessories are required",
        code: "",
        availableFor: ["0", "1", "2", "3", "4", "5"], 
      },
      {
        id: "&KIT-71100A-R",
        label: "#&KIT-71100A-R Red Back Box for Surface Mounting",
        code: "&KIT-71100A-R",
        availableFor: ["0", "3"], 
      },
      {
        id: "&KIT-71100A-G",
        label: "#&KIT-71100A-G Green Back Box for Surface Mounting",
        code: "&KIT-71100A-G",
        availableFor: ["1", "3"], 
      },
      {
        id: "&KIT-71100A-Y",
        label: "#&KIT-71100A-Y Yellow Back Box for Surface Mounting",
        code: "&KIT-71100A-Y",
        availableFor: ["2", "3"], 
      },
      {
        id: "&KIT-71100A-W",
        label: "#&KIT-71100A-W White Back Box for Surface Mounting",
        code: "&KIT-71100A-W",
        availableFor: ["3"], 
      },
      {
        id: "&KIT-71100A-B",
        label: "#&KIT-71100A-B Blue Back Box for Surface Mounting",
        code: "&KIT-71100A-B",
        availableFor: ["3", "4"], 
      },
      {
        id: "&KIT-71100A-E",
        label: "#&KIT-71100A-E Orange Back Box for Surface Mounting",
        code: "&KIT-71100A-E",
        availableFor: ["3", "5"], 
      },
      {
        id: "&KIT-71101B-R",
        label: "#&KIT-71101B-R Red Back Box & Spacer Kit for Deep Mounting",
        code: "&KIT-71101B-R",
        availableFor: ["0", "3"],
      },
      {
        id: "&KIT-71101B-G",
        label: "#&KIT-71101B-G Green Back Box & Spacer Kit for Deep Surface Mounting",
        code: "&KIT-71101B-G",
        availableFor: ["1", "3"],
      },
      {
        id: "&KIT-71101B-Y",
        label: "#&KIT-71101B-Y Yellow Back Box & Spacer Kit for Deep Surface Mounting",
        code: "&KIT-71101B-Y",
        availableFor: ["2", "3"],
      },
      {
        id: "&KIT-71101B-W",
        label: "#&KIT-71101B-W White Back Box & Spacer Kit for Deep Surface Mounting",
        code: "&KIT-71101B-W",
        availableFor: ["3"], 
      },
      {
        id: "&KIT-71101B-B",
        label: "#&KIT-71101B-B Blue Back Box & Spacer Kit for Deep Surface Mounting",
        code: "&KIT-71101B-B",
        availableFor: ["3", "4"], 
      },
      {
        id: "&KIT-71101B-E",
        label: "#&KIT-71101B-E Orange Back Box & Spacer Kit for Deep Surface Mounting",
        code: "&KIT-71101B-E",
        availableFor: ["3", "5"], 
      },
    ],
  },
];

export function getStepById(stepId: string): Step | undefined {
  return STEPS.find((step) => step.id === stepId);
}

export function getOptionById(stepId: string, optionId: string) {
  const step = getStepById(stepId);
  return step?.options.find((opt) => opt.id === optionId);
}