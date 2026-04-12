import type { ModelDefinition, Step } from '@shared/types'

const IMG = '/Stopper II'

const steps: Step[] = [
  {
    id: 'environment',
    title: 'ENVIRONMENT',
    required: true,
    options: [
      {
        id: 'indoor',
        label: 'Indoor',
        code: '',
        image: `${IMG}/ENVIRONMENT/indoor.webp`,
      },
      {
        id: 'outdoor',
        label: 'Outdoor (IP54)',
        code: '',
        image: `${IMG}/ENVIRONMENT/outdoor.webp`,
      },
    ],
  },

  {
    id: 'sounder',
    title: 'SOUNDER',
    required: true,
    options: [
      {
        id: 'none',
        label: 'No Sounder',
        code: '',
        image: `${IMG}/SOUNDER/none No Sounder.webp`,
      },
      {
        id: 'battery',
        label: 'Built-in Sounder (9V PP3 Battery)',
        code: '',
        image: `${IMG}/SOUNDER/battery Built-in Sounder 9V PP3.webp`,
      },
      {
        id: 'dc',
        label: 'Built-in Sounder (12-24VDC)',
        code: '',
        image: `${IMG}/SOUNDER/dc Built-in Sounder 12-24VDC.webp`,
      },
    ],
  },

  {
    id: 'mounting',
    title: 'MOUNTING',
    required: true,
    options: [
      {
        id: 'flush',
        label: 'Flush Mount',
        code: '',
        image: `${IMG}/MOUNTING/flush Flush Mount.webp`,
      },
      {
        id: 'surface',
        label: 'Surface Mount',
        code: '',
        image: `${IMG}/MOUNTING/surface Surface Mount.webp`,
      },
      {
        id: 'backbox',
        label: 'Flush Mount with Back Box',
        code: '',
        image: `${IMG}/MOUNTING/backbox Flush Mount with Back Box.webp`,
      },
    ],
  },

  {
    id: 'colour',
    title: 'COLOUR',
    required: true,
    options: [
      {
        id: 'NR',
        label: 'No colour insert (clear)',
        code: '',
        image: `${IMG}/COLOUR/NR No colour insert.webp`,
      },
      {
        id: 'red',
        label: 'Red',
        code: '',
        image: `${IMG}/COLOUR/Red.webp`,
      },
      {
        id: 'green',
        label: 'Green',
        code: '',
        image: `${IMG}/COLOUR/G Green.webp`,
      },
      {
        id: 'yellow',
        label: 'Yellow',
        code: '',
        image: `${IMG}/COLOUR/Y Yellow.webp`,
      },
      {
        id: 'blue',
        label: 'Blue',
        code: '',
        image: `${IMG}/COLOUR/B Blue.webp`,
      },
      {
        id: 'orange',
        label: 'Orange',
        code: '',
        image: `${IMG}/COLOUR/E Orange.webp`,
      },
    ],
  },

  {
    id: 'label',
    title: 'LABEL',
    required: true,
    options: [
      {
        id: 'fire',
        label: 'Fire Alarm label',
        code: '',
        image: `${IMG}/LABEL/fire Fire Alarm.webp`,
      },
      {
        id: 'emergency',
        label: 'Emergency Exit label',
        code: '',
        image: `${IMG}/LABEL/emergency Emergency.webp`,
      },
      {
        id: 'none',
        label: 'No label',
        code: '',
        image: `${IMG}/LABEL/none No label.webp`,
      },
      {
        id: 'custom',
        label: 'Custom label (NON RETURNABLE)',
        code: '',
        image: `${IMG}/LABEL/custom Custom label.webp`,
      },
    ],
  },
]

const LOOKUP_MAP: Record<string, string> = {
  'indoor|none|flush|NR|none': 'STI-1200NR',
  'indoor|none|flush|red|fire': 'STI-1200',
  'indoor|none|backbox|red|fire': 'STI-1200A',
  'indoor|none|flush|green|emergency': 'STI-1200-G',
  'indoor|none|flush|yellow|none': 'STI-1200-Y',
  'indoor|none|flush|blue|none': 'STI-1200-B',
  'indoor|none|surface|NR|none': 'STI-1230NR',
  'indoor|none|surface|red|fire': 'STI-1230',
  'indoor|none|surface|green|emergency': 'STI-1230-G',
  'indoor|none|surface|red|custom': 'STI-1230CR',
  'indoor|none|surface|green|custom': 'STI-1230CG',
  'indoor|none|surface|yellow|custom': 'STI-1230CY',
  'indoor|none|surface|orange|custom': 'STI-1230CE',
  'indoor|none|surface|yellow|none': 'STI-1230-Y',
  'indoor|none|surface|blue|none': 'STI-1230-B',
  'indoor|battery|flush|NR|none': 'STI-1100NR',
  'indoor|battery|flush|red|fire': 'STI-1100',
  'indoor|battery|flush|green|emergency': 'STI-1100-G',
  'indoor|battery|flush|red|custom': 'STI-1100CR',
  'indoor|battery|flush|blue|custom': 'STI-1100CB',
  'indoor|battery|flush|orange|custom': 'STI-1100CE',
  'indoor|battery|flush|yellow|none': 'STI-1100-Y',
  'indoor|battery|surface|red|fire': 'STI-1130',
  'indoor|battery|surface|green|emergency': 'STI-1130-G',
  'indoor|battery|surface|red|custom': 'STI-1130CR',
  'indoor|battery|surface|yellow|custom': 'STI-1130CY',
  'indoor|battery|surface|blue|custom': 'STI-1130CB',
  'indoor|battery|surface|yellow|none': 'STI-1130-Y',
  'indoor|battery|surface|blue|none': 'STI-1130-B',
  'indoor|dc|surface|green|emergency': 'STI-1130-RC-G',
  'outdoor|none|flush|red|fire': 'STI-1250',
  'outdoor|none|flush|green|emergency': 'STI-1250-G',
  'outdoor|none|flush|red|custom': 'STI-1250CR',
  'outdoor|none|flush|red|none': 'STI-1250NR',
  'outdoor|none|flush|green|none': 'STI-1250NG',
  'outdoor|none|surface|red|fire': 'STI-3150',
  'outdoor|none|surface|green|emergency': 'STI-3150-G',
  'outdoor|none|surface|red|custom': 'STI-3150CR',
  'outdoor|none|surface|yellow|custom': 'STI-3150CY',
  'outdoor|none|surface|blue|custom': 'STI-3150CB',
  'outdoor|none|surface|red|none': 'STI-3150NR',
  'outdoor|none|surface|yellow|none': 'STI-3150-Y',
  'outdoor|none|surface|blue|none': 'STI-3150-B',
  'outdoor|battery|flush|red|fire': 'STI-1150',
  'outdoor|battery|surface|red|fire': 'STI-1155',
  'outdoor|battery|surface|green|emergency': 'STI-1155-G',
}

export const stopperIIModel: ModelDefinition = {
  id: 'stopper-ii',
  name: 'Stopper® II',
  slug: 'stopper-ii',

  steps,

  stepOrder: ['environment', 'sounder', 'mounting', 'colour', 'label'],

  productModelSchema: {
    baseCode: '',
    partsOrder: ['environment', 'sounder', 'mounting', 'colour', 'label'],
    separator: 'none',
    codeLookup: {
      steps: ['environment', 'sounder', 'mounting', 'colour', 'label'],
      map: LOOKUP_MAP,
    },
  },
}
