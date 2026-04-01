import type { ModelDefinition, Step } from '@shared/types'

const IMG = '/Key Switches'

const steps: Step[] = [
  {
    id: 'colourMounting',
    title: 'COLOUR & MOUNTING',
    required: true,
    options: [
      {
        id: '10',
        label: 'Red (Dual Mount)',
        code: '10',
        image: `${IMG}/COLOUR & MOUNTING/10-Red (Dual-Mount).webp`,
      },
      {
        id: '30',
        label: 'Green (Dual Mount)',
        code: '30',
        image: `${IMG}/COLOUR & MOUNTING/30-Green(Dual-Mount).webp`,
      },
      {
        id: '50',
        label: 'Yellow (Dual Mount)',
        code: '50',
        image: `${IMG}/COLOUR & MOUNTING/50-Yellow-(Dual-Mount).webp`,
      },
      {
        id: '70',
        label: 'White (Dual Mount)',
        code: '70',
        image: `${IMG}/COLOUR & MOUNTING/70-White-(Dual-Mount).webp`,
      },
      {
        id: '90',
        label: 'Blue (Dual Mount)',
        code: '90',
        image: `${IMG}/COLOUR & MOUNTING/90-Blue-(Dual-Mount).webp`,
      },
      {
        id: 'E0',
        label: 'Orange (Dual Mount)',
        code: 'E0',
        image: `${IMG}/COLOUR & MOUNTING/E0-Orange-(Dual-Mount).webp`,
      },
    ],
  },

  {
    id: 'switchType',
    title: 'SWITCH TYPE',
    required: true,
    options: [
      {
        id: 'two-pos',
        label: 'Two-Position',
        code: '',
        image: `${IMG}/SWITCH TYPE/switch_type_2pos_spring.webp`,
      },
      {
        id: 'two-pos-lock',
        label: 'Two-Position Latching',
        code: '',
        image: `${IMG}/SWITCH TYPE/switch_type_2pos_latching.webp`,
      },
      {
        id: 'three-pos',
        label: 'Three-Position',
        code: '',
        image: `${IMG}/SWITCH TYPE/switch_type_3pos.webp`,
      },
    ],
  },

  {
    id: 'electricalArrangement',
    title: 'ELECTRICAL ARRANGEMENT',
    required: true,
    options: [
      {
        id: 'single-pole',
        label: 'Single Pole Changeover',
        code: '',
        image: `${IMG}/ELECTRICAL ARRANGEMENT/single_pole_changeover.webp`,
        availableFor: ['two-pos', 'two-pos-lock'],
        dependsOn: 'switchType',
      },
      {
        id: 'double-no',
        label: 'Double Pole Normally Open',
        code: '',
        image: `${IMG}/ELECTRICAL ARRANGEMENT/double_pole_normally_open.webp`,
        availableFor: ['two-pos'],
        dependsOn: 'switchType',
      },
      {
        id: 'double-no-lock',
        label: 'Double Pole Normally Open Latching',
        code: '',
        image: `${IMG}/ELECTRICAL ARRANGEMENT/double_pole_normally_open_latching.webp`,
        availableFor: ['two-pos-lock'],
        dependsOn: 'switchType',
      },
      {
        id: 'double-nc',
        label: 'Double Pole Normally Closed',
        code: '',
        image: `${IMG}/ELECTRICAL ARRANGEMENT/double_pole_normally_closed.webp`,
        availableFor: ['two-pos'],
        dependsOn: 'switchType',
      },
      {
        id: 'double-nc-lock',
        label: 'Double Pole Normally Closed Latching',
        code: '',
        image: `${IMG}/ELECTRICAL ARRANGEMENT/double_pole_normally_closed_latching.webp`,
        availableFor: ['two-pos-lock'],
        dependsOn: 'switchType',
      },

      {
        id: 'three-pos-arr',
        label: 'Three-Position Key Switch Arrangement',
        code: '',
        image: `${IMG}/ELECTRICAL ARRANGEMENT/three_position_key_switch.webp`,
        availableFor: ['three-pos'],
        dependsOn: 'switchType',
      },
    ],
  },

  {
    id: 'label',
    title: 'LABEL',
    required: true,
    options: [
      {
        id: 'SAK',
        label: 'Self-Assemble Label Kit',
        code: '',
        image: `${IMG}/LABEL/Self-Assemble-Label-Kit.webp`,
      },
      {
        id: 'CL',
        label: 'Custom Label',
        code: 'CL',
        image: `${IMG}/LABEL/CL-Custom-Label.webp`,
      },
    ],
  },
]

export const keySwitchesModel: ModelDefinition = {
  id: 'key-switches',
  name: 'StopperSwitches Key Switches',
  slug: 'key-switches',

  steps,

  stepOrder: ['colourMounting', 'switchType', 'electricalArrangement', 'label'],

  productModelSchema: {
    baseCode: 'SS3-',
    partsOrder: ['colourMounting', 'switchType', 'electricalArrangement', 'label'],
    separator: 'none',
    separatorMap: {
      colourMounting: '',
      switchType: '',
      electricalArrangement: '',
      label: '-',
    },
    codeLookup: {
      steps: ['switchType', 'electricalArrangement'],
      map: {
        'two-pos|single-pole': '20',
        'two-pos|double-no': '41',
        'two-pos|double-nc': '42',
        'two-pos-lock|single-pole': '30',
        'two-pos-lock|double-no-lock': '31',
        'two-pos-lock|double-nc-lock': '32',
        'three-pos|three-pos-arr': '53',
      },
    },
  },

  primaryDependencyStep: 'switchType',
}
