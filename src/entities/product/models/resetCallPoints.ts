import type { ModelDefinition, Step } from '@shared/types'

const IMG = '/ReSet Call Points'

const steps: Step[] = [
  {
    id: 'colour',
    title: 'COLOUR',
    required: true,
    options: [
      { id: 'R', label: '#R Red', code: 'R', image: `${IMG}/COLOUR/R-Red.webp` },
      { id: 'G', label: '#G Green', code: 'G', image: `${IMG}/COLOUR/G-Green.webp` },
      { id: 'Y', label: '#Y Yellow', code: 'Y', image: `${IMG}/COLOUR/Y-Yellow.webp` },
      { id: 'B', label: '#B Blue', code: 'B', image: `${IMG}/COLOUR/B-Blue.webp` },
      { id: 'W', label: '#W White', code: 'W', image: `${IMG}/COLOUR/W-White.webp` },
      { id: 'O', label: '#O Orange', code: 'O', image: `${IMG}/COLOUR/O-Orange.webp` },
    ],
  },

  {
    id: 'mounting',
    title: 'MOUNTING',
    required: true,
    options: [
      {
        id: 'D2',
        label: "#D2 Dual Mount (wall plate & back box) Previously 'S'",
        code: 'D2',
        image: `${IMG}/MOUNTING/D2-Dual-Mount-(wall-plate-back-box)-Previously-S.webp`,
        imageMap: {
          R: `${IMG}/MOUNTING/R-D2-Dual-Mount-(wall-plate-back-box)-Previously-S.webp`,
          G: `${IMG}/MOUNTING/G-D2-Dual-Mount-(wall-plate-back-box)-Previously-S.webp`,
          Y: `${IMG}/MOUNTING/Y-D2-Dual-Mount-(wall-plate-back-box)-Previously-S.webp`,
          B: `${IMG}/MOUNTING/B-D2-Dual-Mount-(wall-plate-back-box)-Previously-S.webp`,
          W: `${IMG}/MOUNTING/W-D2-Dual-Mount-(wall-plate-back-box)-Previously-S.webp`,
          O: `${IMG}/MOUNTING/O-D2-Dual-Mount-(wall-plate-back-box)-Previously-S.webp`,
        },
      },
      {
        id: 'S2',
        label: "#S2 Surface Mounted - back box Previously 'S1'",
        code: 'S2',
        image: `${IMG}/MOUNTING/S2-Surface-Mounted-back-box-Previously-S1.webp`,
        imageMap: {
          R: `${IMG}/MOUNTING/R-S2-Surface-Mounted-back-box-Previously-S1.webp`,
          G: `${IMG}/MOUNTING/G-S2-Surface-Mounted-back-box-Previously-S1.webp`,
          Y: `${IMG}/MOUNTING/Y-S2-Surface-Mounted-back-box-Previously-S1.webp`,
          B: `${IMG}/MOUNTING/B-S2-Surface-Mounted-back-box-Previously-S1.webp`,
          W: `${IMG}/MOUNTING/W-S2-Surface-Mounted-back-box-Previously-S1.webp`,
          O: `${IMG}/MOUNTING/O-S2-Surface-Mounted-back-box-Previously-S1.webp`,
        },
      },
      {
        id: 'F2',
        label: "#F2 Flush Mounted - wall plate Previously 'F'",
        code: 'F2',
        image: `${IMG}/MOUNTING/F2-Flush-Mounted-wall-plate-Previously-F.webp`,
        imageMap: {
          R: `${IMG}/MOUNTING/R-F2-Flush-Mounted-wall-plate-Previously-F.webp`,
          G: `${IMG}/MOUNTING/G-F2-Flush-Mounted-wall-plate-Previously-F.webp`,
          Y: `${IMG}/MOUNTING/Y-F2-Flush-Mounted-wall-plate-Previously-F.webp`,
          B: `${IMG}/MOUNTING/B-F2-Flush-Mounted-wall-plate-Previously-F.webp`,
          W: `${IMG}/MOUNTING/W-F2-Flush-Mounted-wall-plate-Previously-F.webp`,
          O: `${IMG}/MOUNTING/O-F2-Flush-Mounted-wall-plate-Previously-F.webp`,
        },
      },
    ],
  },

  {
    id: 'electricalArrangement',
    title: 'ELECTRICAL ARRANGEMENT',
    required: true,
    options: [
      {
        id: '01',
        label: '#01 Conventional Model with 470/680 Ω Resistor Value, Series 01',
        code: '01',
        image: `${IMG}/ELECTRICAL ARRANGEMENT/01-Conventional-Model-with-470680_Resistor-Value, Series 01.webp`,
      },
      {
        id: '02',
        label: '#02 Single Pole Changeover, Series 02',
        code: '02',
        image: `${IMG}/ELECTRICAL ARRANGEMENT/02-Single-Pole-Changeover, Series 02.webp`,
      },
      {
        id: '05',
        label: '#05 Sav-wire (2-wire) 470/680 Ω Resistor Value & Diode, Series 05',
        code: '05',
        image: `${IMG}/ELECTRICAL ARRANGEMENT/05-05-Sav-wire (2-wire) 470680_Resistor Value_Diode, Series 05.webp`,
      },
      {
        id: '11',
        label: '#11 Double Pole Changeover, Series 11',
        code: '11',
        image: `${IMG}/ELECTRICAL ARRANGEMENT/11-11-Double-Pole-Changeover, Series 11.webp`,
      },
    ],
  },

  {
    id: 'label',
    title: 'LABEL',
    required: false,
    options: [
      {
        id: 'CL',
        label: '#CL Custom Label',
        code: 'CL',
        image: `${IMG}/LABEL/CL-Custom-Label.webp`,
      },
    ],
  },
]

export const resetCallPointsModel: ModelDefinition = {
  id: 'reset-call-points',
  name: 'ReSet Call Points',
  slug: 'reset-call-points',

  steps,

  stepOrder: ['colour', 'mounting', 'electricalArrangement', 'label'],

  productModelSchema: {
    baseCode: 'RP',
    partsOrder: ['colour', 'mounting', 'electricalArrangement', 'label'],
    separator: 'dash',
    separatorMap: {
      colour: '-',
      mounting: '',
      electricalArrangement: '-',
      label: '-',
    },
  },

  primaryDependencyStep: 'colour',
}
