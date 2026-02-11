import type { ModelDefinition, Step } from "../../types";

const IMG = "/Low Profile Universal Stopper";

const steps: Step[] = [
  {
    id: "cover",
    title: "COVER",
    required: true,
    options: [
      { id: "14", label: "#14 Low profile cover", code: "14", image: `${IMG}/COVER/14 Low profile cover.webp` },
    ],
  },

  {
    id: "mounting",
    title: "MOUNTING",
    required: true,
    options: [
      { id: "0", label: "#0 Flush Mount Open Backed", code: "0", image: `${IMG}/MOUNTING/0 Flush Mount Open Backed.webp` },
      { id: "1", label: "#1 Surface Mount - Clear/Open Backed Spacer (Dual Mount)", code: "1", image: `${IMG}/MOUNTING/1 Surface Mount - ClearOpen Backed Spacer (Dual Mount).webp` },
      // ASSUMPTION: image for mounting "2" does not exist in /public/Low Profile Universal Stopper/MOUNTING/.
      // Using placeholder path. Requires adding the actual image file.
      { id: "2", label: "#2 Surface Mount with Matching Coloured Frame", code: "2", image: `${IMG}/MOUNTING/2 Surface Mount with Matching Coloured Frame.webp` },
    ],
  },

  {
    id: "hoodSounder",
    title: "HOOD & SOUNDER",
    required: true,
    options: [
      { id: "00", label: "#00 No Label Hood", code: "00", image: `${IMG}/HOUSING SHELL/00 No Label Hood.webp` },
      { id: "10", label: "#10 Label Hood without Sounder", code: "10", image: `${IMG}/HOUSING SHELL/10 Label Hood without Sounder.webp` },
      { id: "20", label: "#20 Label Hood with Sounder", code: "20", image: `${IMG}/HOUSING SHELL/20 Label Hood with Sounder EXTENDED LEAD TIMES.webp` },
    ],
  },

  {
    id: "colourLabel",
    title: "COLOUR & LABEL",
    required: true,
    options: [
      { id: "FR", label: "#FR Red 'Fire Alarm' label", code: "FR", image: `${IMG}/COLOUR & LABEL/FR Red 'Fire Alarm' label.webp` },
      { id: "EG", label: "#EG Green 'Emergency Exit' label", code: "EG", image: `${IMG}/COLOUR & LABEL/EG Green 'Emergency Exit' label.webp` },
      { id: "NC", label: "#NC Clear no label", code: "NC", image: `${IMG}/COLOUR & LABEL/NC Clear no label.webp` },
      { id: "NW", label: "#NW White no label", code: "NW", image: `${IMG}/COLOUR & LABEL/NW White no label.webp` },
      { id: "NY", label: "#NY Yellow no label", code: "NY", image: `${IMG}/COLOUR & LABEL/NY Yellow no label.webp` },
      { id: "CY", label: "#CY Yellow custom label - NON RETURNABLE", code: "CY", image: `${IMG}/COLOUR & LABEL/CY Yellow custom label - NON RETURNABLE.webp` },
    ],
  },
];

export const lowProfileUniversalStopperModel: ModelDefinition = {
  id: "low-profile-universal-stopper",
  name: "Low Profile Universal Stopper",
  slug: "low-profile-universal-stopper",

  steps,

  stepOrder: [
    "cover",
    "mounting",
    "hoodSounder",
    "colourLabel",
  ],

  productModelSchema: {
    baseCode: "STI",
    partsOrder: [
      "cover",
      "mounting",
      "hoodSounder",
      "colourLabel",
    ],
    separator: "none",
    separatorMap: {
      cover: "-",
      mounting: "",
      hoodSounder: "",
      colourLabel: "",
    },
  },
};