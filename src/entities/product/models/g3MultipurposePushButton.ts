import type { ModelDefinition, Step } from '@shared/types'

const IMG = '/G3 Multipurpose Push Button'

const steps: Step[] = [
  {
    id: 'model',
    title: 'MODEL',
    required: true,
    options: [
      {
        id: 'A',
        label: '#A No camera',
        code: 'A',
        image: `${IMG}/MODEL/A No camera.webp`,
      },
      {
        id: 'C',
        label: '#C With camera',
        code: 'C',
        image: `${IMG}/MODEL/C With camera (includes back box).webp`,
      },
    ],
  },

  {
    id: 'colour',
    title: 'COLOUR',
    required: true,
    options: [
      { id: '0', label: '#0 Red', code: '0', image: `${IMG}/COLOUR/0 Red.webp` },
      { id: '1', label: '#1 Green', code: '1', image: `${IMG}/COLOUR/1 Green.webp` },
      { id: '2', label: '#2 Yellow', code: '2', image: `${IMG}/COLOUR/2 Yellow.webp` },
      { id: '3', label: '#3 White', code: '3', image: `${IMG}/COLOUR/3 white.webp` },
      { id: '4', label: '#4 Blue', code: '4', image: `${IMG}/COLOUR/4 Blue.webp` },
    ],
  },

  {
    id: 'cover',
    title: 'COVER',
    required: true,
    options: [
      { id: '0', label: '#0 No Cover', code: '0', image: `${IMG}/COVER/0 No Cover.webp` },
      {
        id: '2',
        label: '#2 Protective cover',
        code: '2',
        image: `${IMG}/COVER/2 Shield.webp`,
      },
    ],
  },

  {
    id: 'buttonType',
    title: 'BUTTON TYPE',
    required: true,
    options: [
      {
        id: '2',
        label: '#2 Key-to-Reset',
        code: '2',
        image: `${IMG}/BUTTON TYPE/2 Key-to-Reset.webp`,
      },
      {
        id: '5',
        label: '#5 Momentary',
        code: '5',
        image: `${IMG}/BUTTON TYPE/5 Momentary.webp`,
      },
      {
        id: '9',
        label: '#9 Turn-to-Reset',
        code: '9',
        image: `${IMG}/BUTTON TYPE/9 Turn-to-Reset.webp`,
      },
    ],
  },

  {
    id: 'text',
    title: 'TEXT',
    required: true,
    options: [
      {
        id: 'EX',
        label: '#EX EMERGENCY EXIT',
        code: 'EX',
        image: `${IMG}/TEXT/EX EMERGENCY EXIT.webp`,
      },
      { id: 'XT', label: '#XT EXIT', code: 'XT', image: `${IMG}/TEXT/XT EXIT.webp` },
      {
        id: 'ZA',
        label: '#ZA Custom text',
        code: 'ZA',
        image: `${IMG}/TEXT/ZA Custom text.webp`,
      },
      {
        id: 'RM',
        label: '#RM Running Man symbol',
        code: 'RM',
        image: `${IMG}/TEXT/RM Running Man symbol.webp`,
      },
    ],
  },

  {
    id: 'language',
    title: 'LANGUAGE',
    required: true,
    options: [
      {
        id: 'EN',
        label: '#EN English',
        code: 'EN',
        image: `${IMG}/LANGUAGE/EN English.webp`,
      },
      {
        id: 'UA',
        label: '#UA Українська',
        code: 'UA',
        image: `${IMG}/LANGUAGE/UA Ukrainian.webp`,
      },
    ],
  },
]

export const g3MultipurposePushButtonModel: ModelDefinition = {
  id: 'g3-multipurpose-push-button',
  name: 'G3 Multipurpose Push Button',
  slug: 'g3-multipurpose-push-button',

  steps,

  stepOrder: ['model', 'colour', 'cover', 'buttonType', 'text', 'language'],

  productModelSchema: {
    baseCode: 'G3',
    partsOrder: ['model', 'colour', 'cover', 'buttonType', 'text', 'language'],
    separator: 'none',
    separatorMap: {
      model: '',
      colour: '',
      cover: '',
      buttonType: '',
      text: '',
      language: '-',
    },
  },
}
