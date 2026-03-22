import type { ModelDefinition, Step } from '@shared/types'

const IMG = '/Global ReSet'

const steps: Step[] = [
  {
    id: 'series',
    title: 'SERIES',
    required: true,
    options: [
      {
        id: 'GLR',
        label: 'GLR General Purpose',
        code: 'GLR',
        image: `${IMG}/HERO/02.webp`,
      },
      {
        id: 'GR',
        label: 'GR Fire Alarm',
        code: 'GR',
        image: `${IMG}/HERO/01.webp`,
      },
    ],
  },

  {
    id: 'colour',
    title: 'COLOUR',
    required: false,
    options: [
      { id: '001', label: '#0 red', code: '001', image: `${IMG}/COLOUR/0 red.webp` },
      { id: '101', label: '#1 green', code: '101', image: `${IMG}/COLOUR/1 green.webp` },
      {
        id: '201',
        label: '#2 yellow',
        code: '201',
        image: `${IMG}/COLOUR/2 yellow.webp`,
      },
      { id: '301', label: '#3 white', code: '301', image: `${IMG}/COLOUR/3 white.webp` },
      { id: '401', label: '#4 blue', code: '401', image: `${IMG}/COLOUR/4 blue.webp` },
    ],
  },

  {
    id: 'text',
    title: 'TEXT',
    required: false,
    options: [
      {
        id: 'EM',
        label: '#EM EMERGENCY',
        code: 'EM',
        image: `${IMG}/TEXT/EM EMERGENCY.webp`,
      },
      {
        id: 'EX',
        label: '#EX EMERGENCY EXIT',
        code: 'EX',
        image: `${IMG}/TEXT/EX EMERGENCY EXIT.webp`,
      },
      {
        id: 'ZA',
        label: '#ZA NON-RETURNABLE custom text',
        code: 'ZA',
        image: `${IMG}/TEXT/ZA NON-RETURNABLE custom text.webp`,
      },
      {
        id: 'RM',
        label: '#RM Running Man Logo',
        code: 'RM',
        image: `${IMG}/TEXT/RM Running Man Logo.webp`,
      },
    ],
  },

  {
    id: 'language',
    title: 'LANGUAGE',
    required: false,
    options: [
      {
        id: 'EN',
        label: '#EN English',
        code: 'EN',
        image: `${IMG}/LANGUAGE/EN English.webp`,
      },
      {
        id: 'UA',
        label: '#UA Ukrainian',
        code: 'UA',
        image: `${IMG}/LANGUAGE/EN English.webp`,
      },
    ],
  },

  {
    id: 'mounting',
    title: 'MOUNTING',
    required: false,
    options: [
      {
        id: 'F',
        label: '#F Flush mount',
        code: 'RF',
        image: `${IMG}/COVER/01 no cover.webp`,
      },
      {
        id: 'S',
        label: '#S Surface mount',
        code: 'RS',
        image: `${IMG}/COMPLETED DEVICE/GR/KIT-GLR-BB-0.webp`,
      },
    ],
  },

  {
    id: 'grText',
    title: 'TEXT',
    required: false,
    options: [
      {
        id: '22-0',
        label: '#22-0 Running Man symbol',
        code: '22-0',
        image: `${IMG}/TEXT/RM Running Man Logo.webp`,
      },
      {
        id: '22-0-EN',
        label: '#22-0-EN FIRE',
        code: '22-0-EN',
        image: `${IMG}/TEXT/EM EMERGENCY.webp`,
      },
    ],
  },
]

export const globalResetModel: ModelDefinition = {
  id: 'global-reset',
  name: 'Global ReSet',
  slug: 'global-reset',

  steps,

  stepOrder: ['series', 'colour', 'text', 'language', 'mounting', 'grText'],

  productModelSchema: {
    baseCode: '',
    partsOrder: ['series', 'colour', 'text', 'language', 'mounting', 'grText'],
    separator: 'none',
    separatorMap: {
      series: '',
      colour: '',
      text: '',
      language: '-',
      mounting: '-',
      grText: '-',
    },
  },
}
