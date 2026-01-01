import type { ModelDefinition, Step } from "../../types";

const IMG = "/Stopper® Stations";

const steps: Step[] = [
  {
    id: "colour",
    title: "COLOUR",
    required: true,
    options: [
      { id: "0", label: "#0 Red", code: "0", image: `${IMG}/COLOUR/0-Red.webp` },
      { id: "1", label: "#1 Green", code: "1", image: `${IMG}/COLOUR/1-Green.webp` },
      { id: "2", label: "#2 Yellow", code: "2", image: `${IMG}/COLOUR/2-Yellow.webp` },
      { id: "3", label: "#3 White", code: "3", image: `${IMG}/COLOUR/3-White.webp` },
      { id: "4", label: "#4 Blue", code: "4", image: `${IMG}/COLOUR/4-Blue.webp` },
      { id: "5", label: "#5 Orange", code: "5", image: `${IMG}/COLOUR/5-Orange.webp` },
    ],
  },

  {
    id: "cover",
    title: "COVER",
    required: true,
    options: [
      { id: "0", label: "#0 No Cover", code: "0", image: `${IMG}/COVER/0-No-Cover.webp` },
      { id: "2", label: "#2 Shield", code: "2", image: `${IMG}/COVER/2-Shield.webp` },
      { 
        id: "contact-sales", 
        label: "#0 Contact Sales for More Options", 
        code: "0",
        image: `${IMG}/COVER/0-Contact-Sales.png`,
        // TODO: This option should trigger contact form or redirect, not add to Product Model
        notes: "Contact Sales",
      },
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
        image: `${IMG}/ACTIVATION/0 Key-to-Reset.webp`,
        availableFor: ["0", "1", "2", "3", "4"],
      },
      {
        id: "1",
        label: "#1 Turn-to-Reset",
        code: "1",
        image: `${IMG}/ACTIVATION/1 Turn-to-Reset.webp`,
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "2",
        label: "#2 Key-to-Reset Illuminates green, red or white",
        code: "2",
        image: `${IMG}/ACTIVATION/2 Key-to-Reset Illuminates green, red or white.webp`,
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "3",
        label: "#3 Key-to-Activate",
        code: "3",
        image: `${IMG}/ACTIVATION/3 Key-to-Activate.webp`,
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "4",
        label: "#4 Momentary",
        code: "4",
        image: `${IMG}/ACTIVATION/4 Momentary.webp`,
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "5",
        label: "#5 Momentary Illuminates green, red or white",
        code: "5",
        image: `${IMG}/ACTIVATION/5 Momentary Illuminates green, red or white..webp`,
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "6-red",
        label: "#6 Red Illuminated",
        code: "6",
        image: `${IMG}/ACTIVATION/6 Red Illuminated EXTENDED LEAD TIMES.webp`,
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["0", "2", "3", "5"],
      },
      {
        id: "6-green",
        label: "#6 Green Illuminated",
        code: "6",
        image: `${IMG}/ACTIVATION/6 Green Illuminated EXTENDED LEAD TIMES.webp`,
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["1", "3"],
      },
      {
        id: "6-blue",
        label: "#6 Blue Illuminated",
        code: "6",
        image: `${IMG}/ACTIVATION/6 Blue Illuminated EXTENDED LEAD TIMES.webp`,
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["3", "4"],
      },
      {
        id: "7-red",
        label: "#7 Weather Resistant Momentary Illuminated Red",
        code: "7",
        image: `${IMG}/ACTIVATION/7 Weather Resistant Momentary Illuminated Red EXTENDED LEAD TIMES.webp`,
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["0", "2", "3", "5"],
      },
      {
        id: "7-green",
        label: "#7 Weather Resistant Green Illuminated",
        code: "7",
        image: `${IMG}/ACTIVATION/7 Weather Resistant Green Illuminated EXTENDED LEAD TIMES.webp`,
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["1", "3"],
      },
      {
        id: "7-blue",
        label: "#7 Weather Resistant Blue Illuminated",
        code: "7",
        image: `${IMG}/ACTIVATION/7 Weather Resistant Blue Illuminated EXTENDED LEAD TIMES.webp`,
        notes: "EXTENDED LEAD TIMES",
        availableFor: ["3", "4"],
      },
      {
        id: "8",
        label: "#8 Pneumatic Illuminates green, red or white",
        code: "8",
        image: `${IMG}/ACTIVATION/8 Pneumatic Illuminates green, red or white. NOT UL LISTED.webp`,
        notes: "NOT UL LISTED",
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "9",
        label: "#9 Turn-to-Reset Illuminates green, red or white",
        code: "9",
        image: `${IMG}/ACTIVATION/9 Turn-to-Reset Illuminates green, red or white. EXTENDED LEAD TIMES.webp`,
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
      { id: "AB", label: "#AB ABORT", code: "AB", image: `${IMG}/TEXT/AB-ABORT.webp` },
      { id: "EM", label: "#EM EMERGENCY", code: "EM", image: `${IMG}/TEXT/EM-EMERGENCY.webp` },
      { id: "EX", label: "#EX EMERGENCY EXIT", code: "EX", image: `${IMG}/TEXT/EX-EMERGENCY EXIT.webp` },
      { id: "PO", label: "#PO EMERGENCY POWER OFF", code: "PO", image: `${IMG}/TEXT/PO-EMERGENCY-POWER-OFF.webp` },
      { id: "ES", label: "#ES EMERGENCY STOP", code: "ES", image: `${IMG}/TEXT/ES-EMERGENCY STOP.webp` },
      { id: "EV", label: "#EV EVACUATION", code: "EV", image: `${IMG}/TEXT/EV-EVACUATION.webp` },
      { id: "XT", label: "#XT EXIT", code: "XT", image: `${IMG}/TEXT/XT-EXIT.webp` },
      { id: "PS", label: "#PS FUEL PUMP SHUT-DOWN", code: "PS", image: `${IMG}/TEXT/PS-FUEL-PUMP-SHUT-DOWN.webp` },
      { id: "HV", label: "#HV HVAC SHUT-DOWN", code: "HV", image: `${IMG}/TEXT/HV-HVAC SHUT-DOWN.webp` },
      { id: "LD", label: "#LD LOCKDOWN", code: "LD", image: `${IMG}/TEXT/LD-LOCKDOWN.webp` },
      { id: "PX", label: "#PX PUSH TO EXIT", code: "PX", image: `${IMG}/TEXT/PX-PUSH-TO-EXIT.webp` },
      { id: "NT", label: "#NT NO TEXT, blank button and/or cover", code: "NT", image: `${IMG}/TEXT/NT-NO-TEXT.webp` },
      { id: "ZA", label: "#ZA NON-RETURNABLE custom text", code: "ZA", image: `${IMG}/TEXT/ZA-NON-RETURNABLE.webp` },
    ],
  },

  {
    id: "language",
    title: "LANGUAGE",
    required: true,
    options: [
      { id: "EN", label: "#EN English", code: "EN", image: `${IMG}/LANGUAGE/EN-English.webp` },
      { id: "ES", label: "#ES Spanish", code: "ES", image: `${IMG}/LANGUAGE/ES-Spanish.webp` },
      { id: "FR", label: "#FR French", code: "FR", image: `${IMG}/LANGUAGE/FR-French.webp` },
      { id: "ZL", label: "#ZL NON-RETURNABLE other language", code: "ZL", image: `${IMG}/LANGUAGE/ZL-NON-RETURNABLE.webp` },
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
        image: `${IMG}/INSTALLATION OPTIONS/No additional mounting.webp`,
        availableFor: ["0", "1", "2", "3", "4", "5"],
      },
      {
        id: "&KIT-71100A-R",
        label: "#&KIT-71100A-R Red Back Box for Surface Mounting",
        code: "&KIT-71100A-R",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71100A-R Red Back Box for Surface Mounting.webp`,
        availableFor: ["0", "3"],
      },
      {
        id: "&KIT-71100A-G",
        label: "#&KIT-71100A-G Green Back Box for Surface Mounting",
        code: "&KIT-71100A-G",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71100A-G Green Back Box for Surface Mounting.webp`,
        availableFor: ["1", "3"],
      },
      {
        id: "&KIT-71100A-Y",
        label: "#&KIT-71100A-Y Yellow Back Box for Surface Mounting",
        code: "&KIT-71100A-Y",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71100A-Y Yellow Back Box for Surface Mounting.webp`,
        availableFor: ["2", "3"],
      },
      {
        id: "&KIT-71100A-W",
        label: "#&KIT-71100A-W White Back Box for Surface Mounting",
        code: "&KIT-71100A-W",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71100A-W White Back Box for Surface Mounting.webp`,
        availableFor: ["3"],
      },
      {
        id: "&KIT-71100A-B",
        label: "#&KIT-71100A-B Blue Back Box for Surface Mounting",
        code: "&KIT-71100A-B",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71100A-B Blue Back Box for Surface Mounting.webp`,
        availableFor: ["3", "4"],
      },
      {
        id: "&KIT-71100A-E",
        label: "#&KIT-71100A-E Orange Back Box for Surface Mounting",
        code: "&KIT-71100A-E",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71100A-E Orange Back Box for Surface Mounting.webp`,
        availableFor: ["3", "5"],
      },
      {
        id: "&KIT-71101B-R",
        label: "#&KIT-71101B-R Red Back Box & Spacer Kit for Deep Mounting",
        code: "&KIT-71101B-R",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71101B-R Red Back Box & Spacer Kit for Deep Mounting.webp`,
        availableFor: ["0", "3"],
      },
      {
        id: "&KIT-71101B-G",
        label: "#&KIT-71101B-G Green Back Box & Spacer Kit for Deep Surface Mounting",
        code: "&KIT-71101B-G",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71101B-G Green Back Box & Spacer Kit for Deep Surface Mounting.webp`,
        availableFor: ["1", "3"],
      },
      {
        id: "&KIT-71101B-Y",
        label: "#&KIT-71101B-Y Yellow Back Box & Spacer Kit for Deep Surface Mounting",
        code: "&KIT-71101B-Y",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71101B-Y Yellow Back Box & Spacer Kit for Deep Surface Mounting.webp`,
        availableFor: ["2", "3"],
      },
      {
        id: "&KIT-71101B-W",
        label: "#&KIT-71101B-W White Back Box & Spacer Kit for Deep Surface Mounting",
        code: "&KIT-71101B-W",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71101B-W White Back Box & Spacer Kit for Deep Surface Mounting.webp`,
        availableFor: ["3"],
      },
      {
        id: "&KIT-71101B-B",
        label: "#&KIT-71101B-B Blue Back Box & Spacer Kit for Deep Surface Mounting",
        code: "&KIT-71101B-B",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71101B-B Blue Back Box & Spacer Kit for Deep Surface Mounting.webp`,
        availableFor: ["3", "4"],
      },
      {
        id: "&KIT-71101B-E",
        label: "#&KIT-71101B-E Orange Back Box & Spacer Kit for Deep Surface Mounting",
        code: "&KIT-71101B-E",
        image: `${IMG}/INSTALLATION OPTIONS/KIT-71101B-E Orange Back Box & Spacer Kit for Deep Surface Mounting.webp`,
        availableFor: ["3", "5"],
      },
    ],
  },
];

export const stopperStationsModel: ModelDefinition = {
  id: "stopper-stations",
  name: "Stopper® Stations",
  slug: "stopper-stations",
  
  steps,
  
  stepOrder: [
    "colour",
    "cover",
    "activation",
    "text",
    "language",
    "installationOptions",
  ],
  
  productModelSchema: {
    baseCode: "SS2",
    partsOrder: [
      "colour",
      "cover",
      "activation",
      "text",
      "language",
      "installationOptions",
    ],
    separator: "none",
    separatorMap: {
      colour: "",
      cover: "",
      activation: "",
      text: "",
      language: "-",
      installationOptions: "",
    },
  },
  
  primaryDependencyStep: "colour",
};

export function getStepById(stepId: string): Step | undefined {
  return steps.find((step) => step.id === stepId);
}

export function getOptionById(stepId: string, optionId: string) {
  const step = getStepById(stepId);
  return step?.options.find((opt) => opt.id === optionId);
}


