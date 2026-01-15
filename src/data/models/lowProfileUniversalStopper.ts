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
      { id: "6", label: "#6 European Enclosed Back Box, 20mm Thread Point & Sealed Mounting Plate", code: "6", image: `${IMG}/MOUNTING/6 European Enclosed Back Box, 20mm Thread Point & Sealed Mounting Plate.webp` },
      { id: "7", label: "#7 European Enclosed Back Box, 20mm Thread Point & Open Mounting Plate", code: "7", image: `${IMG}/MOUNTING/7 European Enclosed Back Box, 20mm Thread Point & Open Mounting Plate.webp` },
    ],
  },

  {
    id: "housingShell",
    title: "HOUSING SHELL",
    required: true,
    options: [
      { id: "00", label: "#00 No Label Hood", code: "00", image: `${IMG}/HOUSING SHELL/00 No Label Hood.webp` },
      { id: "10", label: "#10 Label Hood without Sounder", code: "10", image: `${IMG}/HOUSING SHELL/10 Label Hood without Sounder.webp` },
      { id: "20", label: "#20 Label Hood with Sounder EXTENDED LEAD TIMES", code: "20", image: `${IMG}/HOUSING SHELL/20 Label Hood with Sounder EXTENDED LEAD TIMES.webp` },
      { id: "30", label: "#30 Label Hood with Sounder and Relay Cable EXTENDED LEAD TIMES", code: "30", image: `${IMG}/HOUSING SHELL/30 Label Hood with Sounder and Relay Cable EXTENDED LEAD TIMES.webp` },
    ],
  },

  {
    id: "colourLabel",
    title: "COLOUR & LABEL",
    required: true,
    options: [
      { id: "FR", label: "#FR Red 'Fire Alarm' label", code: "FR", image: `${IMG}/COLOUR & LABEL/FR Red 'Fire Alarm' label.webp` },
      { id: "NR", label: "#NR Red no label", code: "NR", image: `${IMG}/COLOUR & LABEL/NR Red no label.webp` },
      { id: "CR", label: "#CR Red custom label - NON RETURNABLE", code: "CR", image: `${IMG}/COLOUR & LABEL/CR Red custom label - NON RETURNABLE.webp` },
      { id: "EG", label: "#EG Green 'Emergency Exit' label", code: "EG", image: `${IMG}/COLOUR & LABEL/EG Green 'Emergency Exit' label.webp` },
      { id: "NG", label: "#NG Green no label", code: "NG", image: `${IMG}/COLOUR & LABEL/NG Green no label.webp` },
      { id: "CG", label: "#CG Green custom label - NON RETURNABLE", code: "CG", image: `${IMG}/COLOUR & LABEL/CG Green custom label - NON RETURNABLE.webp` },
      { id: "NB", label: "#NB Blue no label", code: "NB", image: `${IMG}/COLOUR & LABEL/NB Blue no label.webp` },
      { id: "CB", label: "#CB Blue custom label - NON RETURNABLE", code: "CB", image: `${IMG}/COLOUR & LABEL/CB Blue custom label - NON RETURNABLE.webp` },
      { id: "NW", label: "#NW White no label", code: "NW", image: `${IMG}/COLOUR & LABEL/NW White no label.webp` },
      { id: "CW", label: "#CW White custom label - NON RETURNABLE", code: "CW", image: `${IMG}/COLOUR & LABEL/CW White custom label - NON RETURNABLE.webp` },
      { id: "NY", label: "#NY Yellow no label", code: "NY", image: `${IMG}/COLOUR & LABEL/NY Yellow no label.webp` },
      { id: "CY", label: "#CY Yellow custom label - NON RETURNABLE", code: "CY", image: `${IMG}/COLOUR & LABEL/CY Yellow custom label - NON RETURNABLE.webp` },
      { id: "NC", label: "#NC Clear no label", code: "NC", image: `${IMG}/COLOUR & LABEL/NC Clear no label.webp` },
    ],
  },

  {
    id: "language",
    title: "LANGUAGE",
    required: true,
    options: [
      { id: "EN", label: "# English", code: "", image: `${IMG}/LANGUAGE/English.webp` },
      { id: "FR", label: "#FR French", code: "FR", image: `${IMG}/LANGUAGE/FR French.webp` },
      { id: "ES", label: "#ES Spanish", code: "ES", image: `${IMG}/LANGUAGE/ES Spanish.webp` },
      { id: "NL", label: "#NL Dutch", code: "NL", image: `${IMG}/LANGUAGE/NL Dutch.webp` },
      { id: "DE", label: "#DE German", code: "DE", image: `${IMG}/LANGUAGE/DE German.webp` },
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
    "housingShell",
    "colourLabel",
    "language",
  ],

  productModelSchema: {
    baseCode: "STI",
    partsOrder: [
      "cover",
      "mounting",
      "housingShell",
      "colourLabel",
      "language",
    ],
    separator: "none",
    separatorMap: {
      cover: "-",
      mounting: "",
      housingShell: "",
      colourLabel: "",
      language: "-",
    },
  },
};