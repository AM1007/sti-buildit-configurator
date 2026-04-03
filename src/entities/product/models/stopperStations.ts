import type { ModelDefinition, Step } from '@shared/types'

const IMG = '/Stopper Stations'

const steps: Step[] = [
  {
    id: 'colour',
    title: 'COLOUR',
    required: true,
    options: [
      { id: '0', label: '#0 Red', code: '00', image: `${IMG}/COLOUR/0-Red.webp` },
      { id: '1', label: '#1 Green', code: '10', image: `${IMG}/COLOUR/1-Green.webp` },
      { id: '2', label: '#2 Yellow', code: '20', image: `${IMG}/COLOUR/2-Yellow.webp` },
      { id: '3', label: '#3 White', code: '30', image: `${IMG}/COLOUR/3-White.webp` },
      { id: '4', label: '#4 Blue', code: '40', image: `${IMG}/COLOUR/4-Blue.webp` },
      { id: '5', label: '#5 Orange', code: '50', image: `${IMG}/COLOUR/5-Orange.webp` },
    ],
  },

  {
    id: 'activation',
    title: 'ACTIVATION',
    required: true,
    options: [
      {
        id: '0',
        label: '#0 Key-to-Reset',
        code: '0',
        image: `${IMG}/ACTIVATION/0 Key-to-Reset.webp`,
        availableFor: ['0', '1', '2', '3', '4'],
      },
      {
        id: '1',
        label: '#1 Turn-to-Reset',
        code: '1',
        image: `${IMG}/ACTIVATION/1 Turn-to-Reset.webp`,
        availableFor: ['0', '1', '2', '3', '4', '5'],
      },
      {
        id: '2',
        label: '#2 Key-to-Reset Illuminates green, red or white',
        code: '2',
        image: `${IMG}/ACTIVATION/2 Key-to-Reset Illuminates green, red or white.webp`,
        availableFor: ['0', '1', '2', '3', '4', '5'],
      },
      {
        id: '3',
        label: '#3 Key-to-Activate',
        code: '3',
        image: `${IMG}/ACTIVATION/3 Key-to-Activate.webp`,
        availableFor: ['0', '1', '2', '3', '4', '5'],
      },
      {
        id: '4',
        label: '#4 Momentary',
        code: '4',
        image: `${IMG}/ACTIVATION/4 Momentary.webp`,
        availableFor: ['0', '1', '2', '3', '4'],
      },
      {
        id: '5',
        label: '#5 Momentary Illuminates green, red or white',
        code: '5',
        image: `${IMG}/ACTIVATION/5 Momentary Illuminates green, red or white..webp`,
        availableFor: ['0', '1', '2', '3', '4'],
      },
      {
        id: '6-red',
        label: '#6 Red Illuminated',
        code: '6',
        image: `${IMG}/ACTIVATION/6 Red Illuminated EXTENDED LEAD TIMES.webp`,
        availableFor: ['0'],
      },
      {
        id: '6-green',
        label: '#6 Green Illuminated',
        code: '6',
        image: `${IMG}/ACTIVATION/6 Green Illuminated EXTENDED LEAD TIMES.webp`,
        availableFor: ['1'],
      },
      {
        id: '6-blue',
        label: '#6 Blue Illuminated',
        code: '6',
        image: `${IMG}/ACTIVATION/6 Blue Illuminated EXTENDED LEAD TIMES.webp`,
        availableFor: ['4'],
      },
      {
        id: '7-red',
        label: '#7 Weather Resistant Momentary Illuminated Red',
        code: '7',
        image: `${IMG}/ACTIVATION/7 Weather Resistant Momentary Illuminated Red EXTENDED LEAD TIMES.webp`,
        availableFor: ['0', '2', '3'],
      },
      {
        id: '7-green',
        label: '#7 Weather Resistant Green Illuminated',
        code: '7',
        image: `${IMG}/ACTIVATION/7 Weather Resistant Green Illuminated EXTENDED LEAD TIMES.webp`,
        availableFor: ['1'],
      },
      {
        id: '8',
        label: '#8 Pneumatic Illuminates green, red or white',
        code: '8',
        image: `${IMG}/ACTIVATION/8 Pneumatic Illuminates green, red or white. NOT UL LISTED.webp`,
        availableFor: ['0', '1', '2', '3', '4'],
      },
      {
        id: '9',
        label: '#9 Turn-to-Reset Illuminates green, red or white',
        code: '9',
        image: `${IMG}/ACTIVATION/9 Turn-to-Reset Illuminates green, red or white. EXTENDED LEAD TIMES.webp`,
        availableFor: ['0', '1', '2', '3', '4', '5'],
      },
    ],
  },

  {
    id: 'text',
    title: 'TEXT',
    required: true,
    options: [
      {
        id: 'EM',
        label: '#EM EMERGENCY',
        code: 'EM',
        image: `${IMG}/TEXT/EM-EMERGENCY.webp`,
      },
      {
        id: 'NT',
        label: '#NT NO TEXT, blank button and/or cover',
        code: 'NT',
        image: `${IMG}/TEXT/NT-NO-TEXT.webp`,
      },
      {
        id: 'PX',
        label: '#PX PUSH TO EXIT',
        code: 'PX',
        image: `${IMG}/TEXT/PX-PUSH-TO-EXIT.webp`,
      },
      { id: 'XT', label: '#XT EXIT', code: 'XT', image: `${IMG}/TEXT/XT-EXIT.webp` },
      {
        id: 'ZA',
        label: '#ZA NON-RETURNABLE custom text',
        code: 'ZA',
        image: `${IMG}/TEXT/ZA-NON-RETURNABLE.webp`,
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
        image: `${IMG}/LANGUAGE/EN-English.webp`,
      },
      {
        id: 'UA',
        label: '#UA Українська',
        code: 'UA',
        image: `${IMG}/LANGUAGE/UA-Ukrainian.webp`,
      },
    ],
  },
]

export const stopperStationsModel: ModelDefinition = {
  id: 'stopper-stations',
  name: 'Stopper® Stations',
  slug: 'stopper-stations',

  steps,

  stepOrder: ['colour', 'activation', 'text', 'language'],

  productModelSchema: {
    baseCode: 'SS2',
    partsOrder: ['colour', 'activation', 'text', 'language'],
    separator: 'none',
    separatorMap: {
      colour: '',
      activation: '',
      text: '',
      language: '-',
    },
  },

  primaryDependencyStep: 'colour',
}

export function getStepById(stepId: string): Step | undefined {
  return steps.find((step) => step.id === stepId)
}

export function getOptionById(stepId: string, optionId: string) {
  const step = getStepById(stepId)
  return step?.options.find((opt) => opt.id === optionId)
}
