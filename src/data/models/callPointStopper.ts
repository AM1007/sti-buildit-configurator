import type { ModelDefinition, Step } from "../../types";

const IMG = "/Call Point Stopper";

const steps: Step[] = [
  {
    id: "mounting",
    title: "MOUNTING",
    required: true,
    options: [
      { id: "0", label: "#0 Flush", code: "0", image: `${IMG}/MOUNTING/0 Flush.webp` },
      { id: "1", label: "#1 Surface mount (35mm)", code: "1", image: `${IMG}/MOUNTING/1 Surface mount (35mm).webp` },
    ],
  },

  {
    id: "colour",
    title: "COLOUR",
    required: true,
    options: [
      { id: "R", label: "# Red", code: "", image: `${IMG}/COLOUR/Red.webp` },
      { id: "G", label: "#G Green", code: "G", image: `${IMG}/COLOUR/G Green.webp` },
      { id: "Y", label: "#Y Yellow", code: "Y", image: `${IMG}/COLOUR/Y Yellow.webp` },
      { id: "W", label: "#W White", code: "W", image: `${IMG}/COLOUR/W White.webp` },
      { id: "B", label: "#B Blue", code: "B", image: `${IMG}/COLOUR/B Blue.webp` },
      { id: "E", label: "#E Orange", code: "E", image: `${IMG}/COLOUR/E Orange.webp` },
    ],
  },

  {
    id: "label",
    title: "LABEL",
    required: true,
    options: [
      { id: "FIRE", label: "# IN CASE OF FIRE LIFT COVER - BREAK GLASS", code: "", image: `${IMG}/LABEL/in case of fire.webp` },
      { id: "EMERGENCY_DOOR", label: "# IN CASE OF EMERGENCY - LIFT COVER BREAK GLASS TO OPEN DOOR", code: "", image: `${IMG}/LABEL/in case of emergency break glass.webp` },
      { id: "EMERGENCY_OPERATE", label: "# IN CASE OF EMERGENCY LIFT COVER - OPERATE DEVICE", code: "", image: `${IMG}/LABEL/in case of emergency operate.webp` },
      { id: "CL", label: "#CL Custom Label", code: "CL", image: `${IMG}/LABEL/CL Custom Label.webp` },
      { id: "PLAIN", label: "#PLAIN No text", code: "PLAIN", image: `${IMG}/LABEL/plain no text.webp` },
    ],
  },
];

export const callPointStopperModel: ModelDefinition = {
  id: "call-point-stopper",
  name: "Call Point Stopper",
  slug: "call-point-stopper",

  steps,

  stepOrder: [
    "mounting",
    "colour",
    "label",
  ],

  productModelSchema: {
    baseCode: "STI-693",
    partsOrder: [
      "mounting",
      "colour",
      "label",
    ],
    separator: "none",
    separatorMap: {
      mounting: "",
      colour: "-",
      label: "-",
    },
  },
};