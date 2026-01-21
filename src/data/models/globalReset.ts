import type { ModelDefinition, Step } from "../../types";

const IMG = "/Global ReSet";

const steps: Step[] = [
  {
    id: "colour",
    title: "COLOUR",
    required: false,
    options: [
      { id: "0", label: "#0 red", code: "0", image: `${IMG}/COLOUR/0 red.webp` },
      { id: "1", label: "#1 green", code: "1", image: `${IMG}/COLOUR/1 green.webp` },
      { id: "2", label: "#2 yellow", code: "2", image: `${IMG}/COLOUR/2 yellow.webp` },
      { id: "3", label: "#3 white", code: "3", image: `${IMG}/COLOUR/3 white.webp` },
      { id: "4", label: "#4 blue", code: "4", image: `${IMG}/COLOUR/4 blue.webp` },
    ],
  },

  {
    id: "cover",
    title: "COVER",
    required: true,
    options: [
      { id: "01", label: "#01 no cover", code: "01", image: `${IMG}/COVER/01 no cover.webp` },
      { id: "21", label: "#21 shield", code: "21", image: `${IMG}/COVER/21 shield.webp` },
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
      { id: "PX", label: "#PX PUSH TO EXIT", code: "PX", image: `${IMG}/TEXT/PX PUSH TO EXIT.webp` },
      { id: "NT", label: "#NT NO TEXT", code: "NT", image: `${IMG}/TEXT/NT NO TEXT.webp` },
      { id: "ZA", label: "#ZA NON-RETURNABLE custom text", code: "ZA", image: `${IMG}/TEXT/ZA NON-RETURNABLE custom text.webp` },
      { id: "RM", label: "#RM Running Man Logo", code: "RM", image: `${IMG}/TEXT/RM Running Man Logo.webp` },
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
      { id: "ZL", label: "#ZL NON-RETURNABLE other language", code: "ZL", image: `${IMG}/LANGUAGE/ZL NON-RETURNABLE other language.webp` },
    ],
  },
];

export const globalResetModel: ModelDefinition = {
  id: "global-reset",
  name: "Global ReSet",
  slug: "global-reset",

  steps,

  stepOrder: [
    "colour",
    "cover",
    "text",
    "language",
  ],

  productModelSchema: {
    baseCode: "GLR",
    partsOrder: [
      "colour",
      "cover",
      "text",
      "language",
    ],
    separator: "none",
    separatorMap: {
      colour: "",
      cover: "",
      text: "",
      language: "-",
    },
  },
};