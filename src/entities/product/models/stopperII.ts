import type { ModelDefinition, Step } from '@shared/types'

const IMG = '/Stopper II'

const SII_COLOUR_MAP: Record<string, string> = {
  FR: 'R',
  NR: 'R',
  CR: 'R',
  EG: 'G',
  NG: 'G',
  CG: 'G',
  NC: 'NC',
  NY: 'Y',
  CY: 'Y',
  NB: 'B',
  CB: 'B',
  CE: 'E',
}

function buildSounderImageMap(baseName: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const [labelId, prefix] of Object.entries(SII_COLOUR_MAP)) {
    map[labelId] = `${IMG}/SOUNDER/${prefix}-${baseName}.webp`
  }
  return map
}

const MOUNTINGS = ['flush', 'surface'] as const

function buildEnvironmentImageMap(env: string): Record<string, string> {
  const map: Record<string, string> = {}

  for (const mnt of MOUNTINGS) {
    map[`${mnt}|`] = `${IMG}/ENVIRONMENT/GR-${mnt} ${env}.webp`

    for (const [labelId, colourPrefix] of Object.entries(SII_COLOUR_MAP)) {
      map[`${mnt}|${labelId}`] = `${IMG}/ENVIRONMENT/${colourPrefix}-${mnt} ${env}.webp`
    }
  }

  map['backbox|'] = `${IMG}/ENVIRONMENT/GR-flush ${env}.webp`
  for (const [labelId, colourPrefix] of Object.entries(SII_COLOUR_MAP)) {
    map[`backbox|${labelId}`] = `${IMG}/ENVIRONMENT/${colourPrefix}-flush ${env}.webp`
  }

  return map
}

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
        image: `${IMG}/ENVIRONMENT/GR-flush indoor.webp`,
        imageMap: buildEnvironmentImageMap('indoor'),
      },
      {
        id: 'outdoor',
        label: 'Outdoor (IP54)',
        code: '',
        image: `${IMG}/ENVIRONMENT/GR-flush outdoor.webp`,
        imageMap: buildEnvironmentImageMap('outdoor'),
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
    id: 'sounder',
    title: 'SOUNDER',
    required: true,
    options: [
      {
        id: 'none',
        label: 'No Sounder',
        code: '',
        image: `${IMG}/SOUNDER/10 Colour Hood.webp`,
        imageMap: buildSounderImageMap('10 Colour Hood'),
      },
      {
        id: 'battery',
        label: 'Built-in Sounder (9V PP3 Battery)',
        code: '',
        image: `${IMG}/SOUNDER/20 Sounder Battery.webp`,
        imageMap: buildSounderImageMap('20 Sounder Battery'),
      },
      {
        id: 'dc',
        label: 'Built-in Sounder (12-24VDC)',
        code: '',
        image: `${IMG}/SOUNDER/30-DC Sounder DC.webp`,
        imageMap: buildSounderImageMap('30-DC Sounder DC'),
      },
    ],
  },

  {
    id: 'colourLabel',
    title: 'COLOUR & LABEL',
    required: true,
    options: [
      {
        id: 'FR',
        label: "#FR Red 'FIRE ALARM' label",
        code: 'FR',
        image: `${IMG}/COLOUR & LABEL/FR Red 'FIRE ALARM' label.webp`,
      },
      {
        id: 'NR',
        label: '#NR Red no label',
        code: 'NR',
        image: `${IMG}/COLOUR & LABEL/NR Red no label.webp`,
      },
      {
        id: 'CR',
        label: '#CR Red custom label NON RETURNABLE',
        code: 'CR',
        image: `${IMG}/COLOUR & LABEL/CR Red custom label NON RETURNABLE.webp`,
      },
      {
        id: 'EG',
        label: "#EG Green 'Emergency Exit' label",
        code: 'EG',
        image: `${IMG}/COLOUR & LABEL/EG Green 'Emergency Exit' label.webp`,
      },
      {
        id: 'NG',
        label: '#NG Green no label',
        code: 'NG',
        image: `${IMG}/COLOUR & LABEL/NG Green no label.webp`,
      },
      {
        id: 'CG',
        label: '#CG Green custom label NON RETURNABLE',
        code: 'CG',
        image: `${IMG}/COLOUR & LABEL/CG Green custom label NON RETURNABLE.webp`,
      },
      {
        id: 'NC',
        label: '#NC Clear no label',
        code: 'NC',
        image: `${IMG}/COLOUR & LABEL/NC Clear no label.webp`,
      },
      {
        id: 'NY',
        label: '#NY Yellow no label',
        code: 'NY',
        image: `${IMG}/COLOUR & LABEL/NY Yellow no label.webp`,
      },
      {
        id: 'CY',
        label: '#CY Yellow custom label NON RETURNABLE',
        code: 'CY',
        image: `${IMG}/COLOUR & LABEL/CY Yellow Custom Label NON RETURNABLE.webp`,
      },
      {
        id: 'NB',
        label: '#NB Blue no label',
        code: 'NB',
        image: `${IMG}/COLOUR & LABEL/NB Blue no label.webp`,
      },
      {
        id: 'CB',
        label: '#CB Blue custom label NON RETURNABLE',
        code: 'CB',
        image: `${IMG}/COLOUR & LABEL/CB Blue custom label NON RETURNABLE.webp`,
      },
      {
        id: 'CE',
        label: '#CE Orange custom label NON RETURNABLE',
        code: 'CE',
        image: `${IMG}/COLOUR & LABEL/CE Orange custom label NON RETURNABLE.webp`,
      },
    ],
  },
]

const LOOKUP_MAP: Record<string, string> = {
  'indoor|flush|none|FR': 'STI-1200',
  'indoor|flush|none|NC': 'STI-1200NR',
  'indoor|backbox|none|FR': 'STI-1200A',
  'indoor|flush|none|EG': 'STI-1200-G',
  'indoor|flush|none|NY': 'STI-1200-Y',
  'indoor|flush|none|NB': 'STI-1200-B',
  'indoor|flush|none|CY': 'STI-1200-CY',
  'indoor|flush|none|CB': 'STI-1200-CB',
  'indoor|surface|none|NC': 'STI-1230NR',
  'indoor|surface|none|FR': 'STI-1230',
  'indoor|surface|none|EG': 'STI-1230-G',
  'indoor|surface|none|CR': 'STI-1230CR',
  'indoor|surface|none|CG': 'STI-1230CG',
  'indoor|surface|none|CY': 'STI-1230CY',
  'indoor|surface|none|CB': 'STI-1230-CB',
  'indoor|surface|none|CE': 'STI-1230CE',
  'indoor|surface|none|NY': 'STI-1230-Y',
  'indoor|surface|none|NB': 'STI-1230-B',
  'indoor|flush|battery|NC': 'STI-1100NR',
  'indoor|flush|battery|FR': 'STI-1100',
  'indoor|flush|battery|EG': 'STI-1100-G',
  'indoor|flush|battery|CR': 'STI-1100CR',
  'indoor|flush|battery|CY': 'STI-1100CY',
  'indoor|flush|battery|CB': 'STI-1100CB',
  'indoor|flush|battery|CE': 'STI-1100CE',
  'indoor|flush|battery|NY': 'STI-1100-Y',
  'indoor|surface|battery|FR': 'STI-1130',
  'indoor|surface|battery|EG': 'STI-1130-G',
  'indoor|surface|battery|CR': 'STI-1130CR',
  'indoor|surface|battery|CY': 'STI-1130CY',
  'indoor|surface|battery|CB': 'STI-1130CB',
  'indoor|surface|battery|NY': 'STI-1130-Y',
  'indoor|surface|battery|NB': 'STI-1130-B',
  'indoor|surface|dc|EG': 'STI-1130-RC-G',
  'outdoor|flush|none|FR': 'STI-1250',
  'outdoor|flush|none|EG': 'STI-1250-G',
  'outdoor|flush|none|CR': 'STI-1250CR',
  'outdoor|flush|none|CG': 'STI-1250CG',
  'outdoor|flush|none|NR': 'STI-1250NR',
  'outdoor|flush|none|NG': 'STI-1250NG',
  'outdoor|surface|none|FR': 'STI-3150',
  'outdoor|surface|none|EG': 'STI-3150-G',
  'outdoor|surface|none|CR': 'STI-3150CR',
  'outdoor|surface|none|CY': 'STI-3150CY',
  'outdoor|surface|none|CB': 'STI-3150CB',
  'outdoor|surface|none|NR': 'STI-3150NR',
  'outdoor|surface|none|NY': 'STI-3150-Y',
  'outdoor|surface|none|NB': 'STI-3150-B',
  'outdoor|flush|battery|FR': 'STI-1150',
  'outdoor|surface|battery|FR': 'STI-1155',
  'outdoor|surface|battery|EG': 'STI-1155-G',
}

export const stopperIIModel: ModelDefinition = {
  id: 'stopper-ii',
  name: 'Stopper® II',
  slug: 'stopper-ii',

  steps,

  stepOrder: ['environment', 'mounting', 'sounder', 'colourLabel'],

  productModelSchema: {
    baseCode: '',
    partsOrder: ['environment', 'mounting', 'sounder', 'colourLabel'],
    separator: 'none',
    codeLookup: {
      steps: ['environment', 'mounting', 'sounder', 'colourLabel'],
      map: LOOKUP_MAP,
    },
  },

  primaryDependencyStep: 'colourLabel',
  dependencySteps: ['mounting', 'colourLabel'],
}
