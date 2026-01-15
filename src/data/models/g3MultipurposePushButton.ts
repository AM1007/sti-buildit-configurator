import type { ModelDefinition, Step } from "../../types";

const IMG = "/G3 Multipurpose Push Button";

const steps: Step[] = [
  {
    id: "model",
    title: "MODEL",
    required: true,
    options: [
      { id: "A", label: "#A No camera", code: "A", image: `${IMG}/MODEL/A No camera.webp` },
      { id: "C", label: "#C With camera (includes back box)", code: "C", image: `${IMG}/MODEL/C With camera (includes back box).webp` },
    ],
  },

  {
    id: "colour",
    title: "COLOUR",
    required: true,
    options: [
      { id: "0", label: "#0 Red", code: "0", image: `${IMG}/COLOUR/0 Red.webp` },
      { id: "1", label: "#1 Green", code: "1", image: `${IMG}/COLOUR/1 Green.webp` },
      { id: "2", label: "#2 Yellow", code: "2", image: `${IMG}/COLOUR/2 Yellow.webp` },
      { id: "3", label: "#3 White", code: "3", image: `${IMG}/COLOUR/3 white.webp` },
      { id: "4", label: "#4 Blue", code: "4", image: `${IMG}/COLOUR/4 Blue.webp` },
      { id: "5", label: "#5 Orange", code: "5", image: `${IMG}/COLOUR/5 Orange.webp` },
    ],
  },

  {
    id: "cover",
    title: "COVER",
    required: true,
    options: [
      { id: "0", label: "#0 No Cover", code: "0", image: `${IMG}/COVER/0 No Cover.webp` },
      { id: "2", label: "#2 Shield", code: "2", image: `${IMG}/COVER/2 Shield.webp` },
      { 
        id: "contact-sales", 
        label: "#0 Contact Sales for More Options", 
        code: "0",
        image: `${IMG}/COVER/0 Contact Sales for More Options.png`,
        notes: "Contact Sales",
      },
    ],
  },

  {
    id: "buttonType",
    title: "BUTTON TYPE",
    required: true,
    options: [
      { id: "2", label: "#2 Key-to-Reset", code: "2", image: `${IMG}/BUTTON TYPE/2 Key-to-Reset.webp` },
      { id: "5", label: "#5 Momentary", code: "5", image: `${IMG}/BUTTON TYPE/5 Momentary.webp` },
      { id: "9", label: "#9 Turn-to-Reset", code: "9", image: `${IMG}/BUTTON TYPE/9 Turn-to-Reset.webp` },
    ],
  },

  {
    id: "text",
    title: "TEXT",
    required: true,
    options: [
      { id: "AB", label: "#AB ABORT", code: "AB", image: `${IMG}/TEXT/AB ABORT.webp` },
      { id: "EM", label: "#EM EMERGENCY", code: "EM", image: `${IMG}/TEXT/EM EMERGENCY.webp` },
      { id: "EX", label: "#EX EMERGENCY EXIT", code: "EX", image: `${IMG}/TEXT/EX EMERGENCY EXIT.webp` },
      { id: "PO", label: "#PO EMERGENCY POWER OFF", code: "PO", image: `${IMG}/TEXT/PO EMERGENCY POWER OFF.webp` },
      { id: "ES", label: "#ES EMERGENCY STOP", code: "ES", image: `${IMG}/TEXT/ES EMERGENCY STOP.webp` },
      { id: "EV", label: "#EV EVACUATION", code: "EV", image: `${IMG}/TEXT/EV EVACUATION.webp` },
      { id: "XT", label: "#XT EXIT", code: "XT", image: `${IMG}/TEXT/XT EXIT.webp` },
      { id: "PS", label: "#PS FUEL PUMP SHUT-DOWN", code: "PS", image: `${IMG}/TEXT/PS FUEL PUMP SHUT-DOWN.webp` },
      { id: "HV", label: "#HV HVAC SHUT-DOWN", code: "HV", image: `${IMG}/TEXT/HV HVAC SHUT-DOWN.webp` },
      { id: "LD", label: "#LD LOCKDOWN", code: "LD", image: `${IMG}/TEXT/LD LOCKDOWN.webp` },
      { id: "PL", label: "#PL POLICE", code: "PL", image: `${IMG}/TEXT/PL POLICE.webp` },
      { id: "PX", label: "#PX PUSH TO EXIT", code: "PX", image: `${IMG}/TEXT/PX PUSH TO EXIT.webp` },
      { id: "NT", label: "#NT NO TEXT", code: "NT", image: `${IMG}/TEXT/NT NO TEXT.webp` },
      { id: "ZA", label: "#ZA Custom text", code: "ZA", image: `${IMG}/TEXT/ZA Custom text.webp` },
      { id: "RM", label: "#RM Running Man symbol", code: "RM", image: `${IMG}/TEXT/RM Running Man symbol.webp` },
    ],
  },

  {
    id: "language",
    title: "LANGUAGE",
    required: true,
    options: [
      { id: "EN", label: "#EN English", code: "EN", image: `${IMG}/LANGUAGE/EN English.webp` },
      { id: "ES", label: "#ES Spanish", code: "ES", image: `${IMG}/LANGUAGE/ES Spanish.webp` },
      { id: "FR", label: "#FR French", code: "FR", image: `${IMG}/LANGUAGE/FR French.webp` },
      { id: "ZL", label: "#ZL Custom", code: "ZL", image: `${IMG}/LANGUAGE/ZL Custom.webp` },
    ],
  },
];

export const g3MultipurposePushButtonModel: ModelDefinition = {
  id: "g3-multipurpose-push-button",
  name: "G3 Multipurpose Push Button",
  slug: "g3-multipurpose-push-button",
  
  steps,
  
  stepOrder: [
    "model",
    "colour",
    "cover",
    "buttonType",
    "text",
    "language",
  ],
  
  productModelSchema: {
    baseCode: "G3",
    partsOrder: [
      "model",
      "colour",
      "cover",
      "buttonType",
      "text",
      "language",
    ],
    separator: "none",
    separatorMap: {
      model: "",
      colour: "",
      cover: "",
      buttonType: "",
      text: "",
      language: "-",
    },
  },
};