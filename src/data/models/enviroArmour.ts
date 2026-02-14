import type { ModelDefinition, Step } from "../../types";

const IMG = "/EnviroArmour";

const steps: Step[] = [
  {
    id: "material",
    title: "MATERIAL",
    required: true,
    options: [
      { id: "T", label: "#T Polycarbonate (Limited Stock)", code: "T", image: `${IMG}/MATERIAL/T Polycarbonate (Limited Stock).webp` },
      { id: "S", label: "#S Fibreglass (Limited Stock)", code: "S", image: `${IMG}/MATERIAL/S Fibreglass (Limited Stock).webp` },
    ],
  },

  {
    id: "size",
    title: "SIZE (INTERNAL)",
    required: true,
    options: [
      { id: "121005", label: "#121005 274mm x 240mm x 124mm (Limited Stock)", code: "121005", image: `${IMG}/SIZE (INTERNAL)/121005 274mm x 240mm x 124mm (Limited Stock).webp` },
      { id: "121006", label: "#121006 291mm x 241mm x 129mm (Limited Stock)", code: "121006", image: `${IMG}/SIZE (INTERNAL)/121006 291mm x 241mm x 129mm (Limited Stock).webp` },
      { id: "161608", label: "#161608 366mm x 388mm x 181mm (Limited Stock)", code: "161608", image: `${IMG}/SIZE (INTERNAL)/161608 366mm x 388mm x 181mm (Limited Stock).webp` },
      { id: "181408", label: "#181408 462mm x 347mm x 179mm (Limited Stock)", code: "181408", image: `${IMG}/SIZE (INTERNAL)/181408 462mm x 347mm x 179mm (Limited Stock).webp` },
      { id: "231609", label: "#231609 565mm x 387mm x 211mm (Limited Stock)", code: "231609", image: `${IMG}/SIZE (INTERNAL)/231609 565mm x 387mm x 211mm (Limited Stock).webp` },
      { id: "312312", label: "#312312 762mm x 582mm x 276mm (Limited Stock)", code: "312312", image: `${IMG}/SIZE (INTERNAL)/312312 762mm x 582mm x 276mm (Limited Stock).webp` },
    ],
  },

  {
    id: "doorType",
    title: "TYPE OF DOOR",
    required: true,
    options: [
      { id: "C", label: "#C Clear Door (Limited Stock)", code: "C", image: `${IMG}/TYPE OF DOOR/C Clear Door (Limited Stock).webp` },
      { id: "O", label: "#O Opaque Door (Limited Stock)", code: "O", image: `${IMG}/TYPE OF DOOR/O Opaque Door (Limited Stock).webp` },
    ],
  },
];

export const enviroArmourModel: ModelDefinition = {
  id: "enviro-armour",
  name: "EnviroArmour",
  slug: "enviro-armour",

  steps,

  stepOrder: [
    "material",
    "size",
    "doorType",
  ],

  productModelSchema: {
    baseCode: "E",
    partsOrder: [
      "material",
      "size",
      "doorType",
    ],
    separator: "none",
    separatorMap: {
      material: "",
      size: "-",
      doorType: "-",
    },
  },
};