import type { ModelDefinition, Step } from "../../types";

const IMG = "/GF Fire Alarm Push Button";

const steps: Step[] = [
  {
    id: "model",
    title: "MODEL",
    required: true,
    options: [
      { id: "A", label: "#A No camera", code: "A", image: `${IMG}/MODEL/A No Camera.webp` },
      { id: "C", label: "#C With camera (includes back box)", code: "C", image: `${IMG}/MODEL/C With camera (includes back box).webp` },
    ],
  },

  {
    id: "cover",
    title: "COVER",
    required: true,
    options: [
      { id: "0", label: "#0 No Cover", code: "0", image: `${IMG}/COVER/0 No Cover.webp` },
      { id: "2", label: "#2 Shield", code: "2", image: `${IMG}/COVER/2 Shield.webp` },
      { id: "contact-sales", label: "#0 Contact Sales for More Options", code: "0", image: `${IMG}/COVER/0 Contact Sales for More Options.png`, notes: "Contact sales for custom options" },
    ],
  },

  {
    id: "text",
    title: "TEXT",
    required: true,
    options: [
      { id: "FR", label: "#FR FIRE", code: "FR", image: `${IMG}/TEXT/FR FIRE.webp` },
      { id: "HF", label: "#HF Fire/House/Flame Symbol", code: "HF", image: `${IMG}/TEXT/HF FireHouseFlame Symbol.webp` },
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
    ],
  },
];

export const gfFireAlarmPushButtonModel: ModelDefinition = {
  id: "gf-fire-alarm-push-button",
  name: "GF Fire Alarm Push Button",
  slug: "gf-fire-alarm-push-button",

  steps,

  stepOrder: [
    "model",
    "cover",
    "text",
    "language",
  ],

  productModelSchema: {
    baseCode: "GF",
    partsOrder: [
      "model",
      "cover",
      "text",
      "language",
    ],
    separator: "none",
    separatorMap: {
      model: "",
      cover: "",
      text: "",
      language: "-",
    },
  },
};