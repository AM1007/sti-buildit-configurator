import type { ModelDefinition, Step } from "../../types";

const IMG = "/Universal Stopper";

const steps: Step[] = [
  {
    id: "mounting",
    title: "MOUNTING",
    required: true,
    options: [
      { id: "0", label: "#0 Flush Mount Open Backed", code: "0", image: `${IMG}/MOUNTING/0 Flush Mount Open Backed.webp` },
      { id: "1", label: "#1 Surface Mount - Clear/Open Backed Spacer (Dual Mount)", code: "1", image: `${IMG}/MOUNTING/1 Surface Mount - ClearOpen Backed Spacer (Dual Mount).webp` },
      // ASSUMPTION: No dedicated image for mounting=2. Reusing mounting=1 image.
      // TODO: Replace with correct image when available.
      { id: "2", label: "#2 Surface Mount with Matching Coloured Frame", code: "2", image: `${IMG}/MOUNTING/1 Surface Mount - ClearOpen Backed Spacer (Dual Mount).webp` },
    ],
  },

  {
    id: "hoodSounder",
    title: "HOOD & SOUNDER",
    required: true,
    options: [
      { id: "00", label: "#00 No Label Hood", code: "00", image: `${IMG}/HOOD & SOUNDER/00 No Label Hood.webp` },
      { id: "10", label: "#10 Label Hood without Sounder", code: "10", image: `${IMG}/HOOD & SOUNDER/10 Label Hood without Sounder.webp` },
      { id: "20", label: "#20 Label Hood with Sounder", code: "20", image: `${IMG}/HOOD & SOUNDER/20 Label Hood with Sounder.webp` },
      { id: "30", label: "#30 Label Hood with Sounder & Relay", code: "30", image: `${IMG}/HOOD & SOUNDER/30 Label Hood with Sounder & Relay.webp` },
    ],
  },

  {
    id: "colourLabel",
    title: "COLOUR & LABEL",
    required: true,
    options: [
      { id: "FR", label: "#FR Red 'FIRE ALARM' label", code: "FR", image: `${IMG}/COLOUR & LABEL/FR Red 'FIRE ALARM' label.webp` },
      { id: "NR", label: "#NR Red no label", code: "NR", image: `${IMG}/COLOUR & LABEL/NR Red no label.webp` },
      { id: "CR", label: "#CR Red custom label NON RETURNABLE", code: "CR", image: `${IMG}/COLOUR & LABEL/CR Red custom label NON RETURNABLE.webp` },
      { id: "EG", label: "#EG Green 'Emergency Exit' label", code: "EG", image: `${IMG}/COLOUR & LABEL/EG Green 'Emergency Exit' label.webp` },
      { id: "NG", label: "#NG Green no label", code: "NG", image: `${IMG}/COLOUR & LABEL/NG Green no label.webp` },
      { id: "CG", label: "#CG Green custom label NON RETURNABLE", code: "CG", image: `${IMG}/COLOUR & LABEL/CG Green custom label NON RETURNABLE.webp` },
      { id: "NC", label: "#NC Clear no label", code: "NC", image: `${IMG}/COLOUR & LABEL/NC Clear no label.webp` },
      { id: "CK", label: "#CK Black custom label NON RETURNABLE", code: "CK", image: `${IMG}/COLOUR & LABEL/CK Black custom label NON RETURNABLE.webp` },
      { id: "NB", label: "#NB Blue no label", code: "NB", image: `${IMG}/COLOUR & LABEL/NB Blue no label.webp` },
      { id: "CB", label: "#CB Blue custom label NON RETURNABLE", code: "CB", image: `${IMG}/COLOUR & LABEL/CB Blue custom label NON RETURNABLE.webp` },
      { id: "NW", label: "#NW White no label", code: "NW", image: `${IMG}/COLOUR & LABEL/NW White no label.webp` },
      { id: "CW", label: "#CW White custom label NON RETURNABLE", code: "CW", image: `${IMG}/COLOUR & LABEL/CW White custom label NON RETURNABLE.webp` },
      { id: "NY", label: "#NY Yellow no label", code: "NY", image: `${IMG}/COLOUR & LABEL/NY Yellow no label.webp` },
      { id: "CY", label: "#CY Yellow Custom Label NON RETURNABLE", code: "CY", image: `${IMG}/COLOUR & LABEL/CY Yellow Custom Label NON RETURNABLE.webp` },
    ],
  },
];

export const universalStopperModel: ModelDefinition = {
  id: "universal-stopper",
  name: "Universal Stopper",
  slug: "universal-stopper",
  
  steps,
  
  stepOrder: [
    "mounting",
    "hoodSounder",
    "colourLabel",
  ],
  
  productModelSchema: {
    baseCode: "STI-13",
    partsOrder: [
      "mounting",
      "hoodSounder",
      "colourLabel",
    ],
    separator: "none",
    separatorMap: {
      mounting: "",
      hoodSounder: "",
      colourLabel: "",
    },
  },
};