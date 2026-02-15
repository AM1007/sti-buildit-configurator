import type { ModelDefinition, Step } from "../../types";

const IMG = "/Euro Stopper";

const steps: Step[] = [
  {
    id: "mounting",
    title: "MOUNTING",
    required: true,
    options: [
      { id: "0", label: "#0 Flush Mount", code: "0", image: `${IMG}/MOUNTING/0 Flush Mount.webp` },
      { id: "C", label: "#C Surface Mount 32mm Spacer", code: "C", image: `${IMG}/MOUNTING/C Surface Mount 32mm Spacer.webp` },
      { id: "D", label: "#D Surface Mount 50mm Spacer", code: "D", image: `${IMG}/MOUNTING/D Surface Mount 50mm Spacer.webp` },
    ],
  },

  {
    id: "sounder",
    title: "SOUNDER",
    required: true,
    options: [
      { id: "10", label: "#10 Label Hood without Sounder", code: "10", image: `${IMG}/SOUNDER/10 Label Hood without Sounder.webp` },
      { id: "20", label: "#20 Label Hood with Sounder", code: "20", image: `${IMG}/SOUNDER/20 Label Hood with Sounder.webp` },
      { id: "30", label: "#30 Label Hood with Sounder & Relay", code: "30", image: `${IMG}/SOUNDER/30 Label Hood with Sounder & Relay.webp` },
    ],
  },

  {
    id: "colourLabel",
    title: "COLOUR & LABEL",
    required: true,
    options: [
      // Special labels
      { id: "ML", label: "#ML Multi-Language Kit (Red & Green Cover)", code: "ML", image: `${IMG}/COLOUR & LABEL/NR Red no label.webp` },
      // ASSUMPTION: ML has no dedicated image. Using Red no-label as placeholder.
      // Risk: visual mismatch — ML is a red+green dual-cover kit.
      { id: "FR", label: "#FR Fire Alarm label (Red)", code: "FR", image: `${IMG}/COLOUR & LABEL/CR Red custom label.webp` },
      // ASSUMPTION: FR has no dedicated image. Using Red custom-label as closest match.
      { id: "EG", label: "#EG Emergency Exit label (Green)", code: "EG", image: `${IMG}/COLOUR & LABEL/CG Green custom label.webp` },
      // ASSUMPTION: EG has no dedicated image. Using Green custom-label as closest match.

      // No label variants
      { id: "NR", label: "#NR Red no label", code: "NR", image: `${IMG}/COLOUR & LABEL/NR Red no label.webp` },
      { id: "NG", label: "#NG Green no label", code: "NG", image: `${IMG}/COLOUR & LABEL/NG Green no label.webp` },
      { id: "NY", label: "#NY Yellow no label", code: "NY", image: `${IMG}/COLOUR & LABEL/NY Yellow no label.webp` },
      { id: "NW", label: "#NW White no label", code: "NW", image: `${IMG}/COLOUR & LABEL/NW White no label.webp` },
      { id: "NB", label: "#NB Blue no label", code: "NB", image: `${IMG}/COLOUR & LABEL/NB Blue no label.webp` },
      { id: "NE", label: "#NE Orange no label", code: "NE", image: `${IMG}/COLOUR & LABEL/NE Orange no label.webp` },
      { id: "NK", label: "#NK Black no label", code: "NK", image: `${IMG}/COLOUR & LABEL/NK Black no label.webp` },

      // Custom label variants
      { id: "CR", label: "#CR Red custom label", code: "CR", image: `${IMG}/COLOUR & LABEL/CR Red custom label.webp` },
      { id: "CG", label: "#CG Green custom label", code: "CG", image: `${IMG}/COLOUR & LABEL/CG Green custom label.webp` },
      { id: "CY", label: "#CY Yellow custom label", code: "CY", image: `${IMG}/COLOUR & LABEL/CY Yellow custom label.webp` },
      { id: "CW", label: "#CW White custom label", code: "CW", image: `${IMG}/COLOUR & LABEL/CW White custom label.webp` },
      { id: "CB", label: "#CB Blue custom label", code: "CB", image: `${IMG}/COLOUR & LABEL/CB Blue custom label.webp` },
      { id: "CE", label: "#CE Orange custom label", code: "CE", image: `${IMG}/COLOUR & LABEL/CE Orange custom label.webp` },
      { id: "CK", label: "#CK Black custom label", code: "CK", image: `${IMG}/COLOUR & LABEL/CK Black custom label.webp` },
    ],
  },
];

export const euroStopperModel: ModelDefinition = {
  id: "euro-stopper",
  name: "Euro Stopper",
  slug: "euro-stopper",

  steps,

  stepOrder: [
    "mounting",
    "sounder",
    "colourLabel",
  ],

  productModelSchema: {
    baseCode: "STI-15",
    partsOrder: [
      "mounting",
      "sounder",
      "colourLabel",
    ],
    separator: "none",
    separatorMap: {
      mounting: "",
      sounder: "",
      colourLabel: "",
    },
  },
};