import type { ModelDefinition, Step } from "../../types";

const IMG = "/Enviro Stopper";

const steps: Step[] = [
  {
    id: "cover",
    title: "COVER",
    required: true,
    options: [
      { id: "13", label: "#13 Dome cover", code: "13", image: `${IMG}/COVER/13 Dome cover.webp` },
      { id: "14", label: "#14 Low profile cover", code: "14", image: `${IMG}/COVER/14 Low profile cover.webp` },
    ],
  },

  {
    id: "mounting",
    title: "MOUNTING",
    required: true,
    options: [
      { id: "6", label: "#6 European Enclosed Back Box, 20mm Entry Point & Sealed Mounting Plate", code: "6", image: `${IMG}/MOUNTING/6 European Enclosed Back Box, 20mm Entry Point & Sealed Mounting Plate.webp` },
      { id: "7", label: "#7 European Enclosed Back Box, 20mm Entry Point & Open Mounting Plate", code: "7", image: `${IMG}/MOUNTING/7 European Enclosed Back Box, 20mm Entry Point & Open Mounting Plate.webp` },
    ],
  },

  {
    id: "hoodSounder",
    title: "HOOD, SOUNDER & WIRELESS",
    required: true,
    options: [
      { id: "00", label: "#00 No Label Hood", code: "00", image: `${IMG}/HOOD_SOUNDER & WIRELESS/00 No Label Hood.webp` },
      { id: "10", label: "#10 Label Hood without Sounder", code: "10", image: `${IMG}/HOOD_SOUNDER & WIRELESS/10 Label Hood without Sounder.webp` },
      { id: "20", label: "#20 Label Hood with Sounder", code: "20", image: `${IMG}/HOOD_SOUNDER & WIRELESS/20 Label Hood with Sounder.webp` },
      { id: "30", label: "#30 Label Hood with Sounder & Relay", code: "30", image: `${IMG}/HOOD_SOUNDER & WIRELESS/30 Label Hood with Sounder & Relay.webp` },
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
      { id: "NK", label: "#NK Black no label", code: "NK", image: `${IMG}/COLOUR & LABEL/NK Black no label.webp` },
      { id: "CK", label: "#CK Black custom label NON RETURNABLE", code: "CK", image: `${IMG}/COLOUR & LABEL/CK Black custom label NON RETURNABLE.webp` },
      { id: "NB", label: "#NB Blue no label", code: "NB", image: `${IMG}/COLOUR & LABEL/NB Blue no label.webp` },
      { id: "CB", label: "#CB Blue custom label NON RETURNABLE", code: "CB", image: `${IMG}/COLOUR & LABEL/CB Blue custom label NON RETURNABLE.webp` },
      { id: "NC", label: "#NC Clear no label", code: "NC", image: `${IMG}/COLOUR & LABEL/NC Clear no label.webp` },
      { id: "NW", label: "#NW White no label", code: "NW", image: `${IMG}/COLOUR & LABEL/NW White no label.webp` },
      { id: "CW", label: "#CW White custom label NON RETURNABLE", code: "CW", image: `${IMG}/COLOUR & LABEL/CW White custom label NON RETURNABLE.webp` },
      { id: "NY", label: "#NY Yellow no label", code: "NY", image: `${IMG}/COLOUR & LABEL/NY Yellow no label.webp` },
      { id: "CY", label: "#CY Yellow Custom Label NON RETURNABLE", code: "CY", image: `${IMG}/COLOUR & LABEL/CY Yellow Custom Label NON RETURNABLE.webp` },
    ],
  },
];

export const enviroStopperModel: ModelDefinition = {
  id: "enviro-stopper",
  name: "Enviro Stopper",
  slug: "enviro-stopper",

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