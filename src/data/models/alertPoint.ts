import type { ModelDefinition, Step } from "../../types";

const IMG = "/Alert Point";

const steps: Step[] = [
  {
    id: "series",
    title: "SERIES",
    required: true,
    options: [
      { id: "1", label: "#1 Alert Point - *Limited Stock - Contact sales for details", code: "1", image: `${IMG}/SERIES/1 Alert Point - Limited Stock - Contact sales for details.webp` },
      { id: "3", label: "#3 Alert Point with Beacon - *Limited Stock - Contact sales for details", code: "3", image: `${IMG}/SERIES/3 Alert Point with Beacon - Limited Stock - Contact sales for details.webp` },
    ],
  },

  {
    id: "colour",
    title: "COLOUR",
    required: true,
    options: [
      { id: "R", label: "#R Red", code: "R", image: `${IMG}/COLOUR/R Red.webp` },
      { id: "B", label: "#B Blue", code: "B", image: `${IMG}/COLOUR/B Blue.webp` },
      { id: "G", label: "#G Green", code: "G", image: `${IMG}/COLOUR/G Green.webp` },
      { id: "W", label: "#W White", code: "W", image: `${IMG}/COLOUR/W White.webp` },
    ],
  },

  {
    id: "label",
    title: "LABEL",
    required: true,
    options: [
      { id: "A", label: "#A 'A' Label", code: "A", image: `${IMG}/LABEL/A 'A' Label.webp` },
      { id: "B", label: "#B 'B' Label", code: "B", image: `${IMG}/LABEL/B 'B' Label.webp` },
      { id: "C", label: "#C 'C' Label", code: "C", image: `${IMG}/LABEL/C 'C' Label.webp` },
      { id: "D", label: "#D 'D' Label", code: "D", image: `${IMG}/LABEL/D 'D' Label.webp` },
      { id: "E", label: "#E 'E' Label", code: "E", image: `${IMG}/LABEL/E 'E' Label.webp` },
      { id: "F", label: "#F 'F' Label", code: "F", image: `${IMG}/LABEL/F 'F' Label.webp` },
      { id: "G", label: "#G 'G' Label", code: "G", image: `${IMG}/LABEL/G 'G' Label.webp` },
      { id: "H", label: "#H 'H' Label", code: "H", image: `${IMG}/LABEL/H 'H' Label.webp` },
      { id: "I", label: "#I 'I' Label", code: "I", image: `${IMG}/LABEL/I 'I' Label.webp` },
      { id: "R", label: "#R 'R' Label", code: "R", image: `${IMG}/LABEL/R 'R' Label.webp` },
      { id: "X", label: "#X Custom or No Label", code: "X", image: `${IMG}/LABEL/X Custom or No Label.webp` },
    ],
  },
];

export const alertPointModel: ModelDefinition = {
  id: "alert-point",
  name: "Alert Point",
  slug: "alert-point",

  steps,

  stepOrder: [
    "series",
    "colour",
    "label",
  ],

  productModelSchema: {
    baseCode: "AP",
    partsOrder: [
      "series",
      "colour",
      "label",
    ],
    separator: "none",
    separatorMap: {
      series: "",
      colour: "-",
      label: "-",
    },
  },
};