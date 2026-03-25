import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { ModelId, ModelDefinition } from '@shared/types'
import { useConfigurationStore } from '@features/configurator/store/configurationStore'

const TEST_MODEL_ID: ModelId = 'stopper-stations'

const TEST_MODEL: ModelDefinition = {
  id: TEST_MODEL_ID,
  name: 'Stopper Stations',
  slug: 'stopper-stations',
  stepOrder: ['colour', 'cover', 'text'],
  steps: [
    {
      id: 'colour',
      title: 'Colour',
      required: true,
      options: [
        { id: 'red', code: '0', label: 'Red' },
        { id: 'blue', code: '4', label: 'Blue' },
      ],
    },
    {
      id: 'cover',
      title: 'Cover',
      required: true,
      options: [
        { id: 'shield', code: '2', label: 'Shield' },
        { id: 'none', code: '0', label: 'None' },
      ],
    },
    {
      id: 'text',
      title: 'Text',
      required: true,
      options: [
        { id: 'ZA', code: 'ZA', label: 'Custom' },
        { id: 'FR', code: 'FR', label: 'Fire' },
      ],
    },
  ],
  productModelSchema: {
    baseCode: 'SS2',
    separator: 'dash',
    partsOrder: ['colour', 'cover', 'text'],
  },
} as ModelDefinition

vi.mock('@entities/product', () => ({
  getModelById: vi.fn((modelId: ModelId) => {
    if (modelId === TEST_MODEL_ID) return TEST_MODEL
    return null
  }),
}))

vi.mock('@shared/types', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/types')>()
  return {
    ...actual,
    createEmptyConfiguration: vi.fn((model: ModelDefinition) => {
      const config: Record<string, null> = {}
      for (const stepId of model.stepOrder) {
        config[stepId] = null
      }
      return config
    }),
  }
})

vi.mock('@features/configurator/lib/filterOptions', () => ({
  getSelectionsToReset: vi.fn(() => []),
}))

vi.mock('@entities/product/customTextConfig', () => ({
  shouldClearCustomText: vi.fn(() => false),
  getCustomTextTrigger: vi.fn(() => null),
}))

function resetStore() {
  useConfigurationStore.setState({
    currentModelId: null,
    config: {},
    customText: null,
    currentStep: null,
  })
}

describe('configurationStore', () => {
  beforeEach(() => {
    resetStore()
    vi.clearAllMocks()
  })

  describe('setModel', () => {
    it('initializes state for valid model', () => {
      useConfigurationStore.getState().setModel(TEST_MODEL_ID)

      const state = useConfigurationStore.getState()
      expect(state.currentModelId).toBe(TEST_MODEL_ID)
      expect(state.config).toEqual({ colour: null, cover: null, text: null })
      expect(state.customText).toBeNull()
      expect(state.currentStep).toBe('colour')
    })

    it('does nothing when same model is already set', () => {
      useConfigurationStore.getState().setModel(TEST_MODEL_ID)
      useConfigurationStore.getState().selectOption('colour', 'red')

      useConfigurationStore.getState().setModel(TEST_MODEL_ID)

      expect(useConfigurationStore.getState().config.colour).toBe('red')
    })

    it('does nothing for unknown model', () => {
      useConfigurationStore.getState().setModel('enviro-armour')

      expect(useConfigurationStore.getState().currentModelId).toBeNull()
    })
  })

  describe('clearModel', () => {
    it('resets all state', () => {
      useConfigurationStore.getState().setModel(TEST_MODEL_ID)
      useConfigurationStore.getState().clearModel()

      const state = useConfigurationStore.getState()
      expect(state.currentModelId).toBeNull()
      expect(state.config).toEqual({})
      expect(state.customText).toBeNull()
      expect(state.currentStep).toBeNull()
    })
  })

  describe('selectOption', () => {
    it('sets option and advances to next step', () => {
      useConfigurationStore.getState().setModel(TEST_MODEL_ID)
      useConfigurationStore.getState().selectOption('colour', 'red')

      const state = useConfigurationStore.getState()
      expect(state.config.colour).toBe('red')
      expect(state.currentStep).toBe('cover')
    })

    it('stays on last step when selecting last option', () => {
      useConfigurationStore.getState().setModel(TEST_MODEL_ID)
      useConfigurationStore.getState().selectOption('colour', 'red')
      useConfigurationStore.getState().selectOption('cover', 'shield')
      useConfigurationStore.getState().selectOption('text', 'FR')

      expect(useConfigurationStore.getState().currentStep).toBe('text')
    })

    it('does nothing when no model is set', () => {
      useConfigurationStore.getState().selectOption('colour', 'red')

      expect(useConfigurationStore.getState().config).toEqual({})
    })

    it('clears custom text when shouldClearCustomText returns true', async () => {
      const { shouldClearCustomText } = await import('@entities/product/customTextConfig')
      vi.mocked(shouldClearCustomText).mockReturnValueOnce(true)

      useConfigurationStore.getState().setModel(TEST_MODEL_ID)
      useConfigurationStore.setState({
        customText: {
          lineCount: 1,
          line1: 'Test',
          line2: '',
          line3: '',
          submitted: true,
        },
      })

      useConfigurationStore.getState().selectOption('text', 'FR')

      expect(useConfigurationStore.getState().customText).toBeNull()
    })

    it('applies cascading resets from getSelectionsToReset', async () => {
      const { getSelectionsToReset } =
        await import('@features/configurator/lib/filterOptions')

      useConfigurationStore.getState().setModel(TEST_MODEL_ID)
      useConfigurationStore.getState().selectOption('colour', 'red')
      useConfigurationStore.getState().selectOption('cover', 'shield')
      useConfigurationStore.getState().selectOption('text', 'FR')

      vi.mocked(getSelectionsToReset).mockReturnValueOnce(['cover', 'text'])
      useConfigurationStore.getState().selectOption('colour', 'blue')

      const state = useConfigurationStore.getState()
      expect(state.config.colour).toBe('blue')
      expect(state.config.cover).toBeNull()
      expect(state.config.text).toBeNull()
    })
  })

  describe('clearSelection', () => {
    it('clears a specific step selection', () => {
      useConfigurationStore.getState().setModel(TEST_MODEL_ID)
      useConfigurationStore.getState().selectOption('colour', 'red')
      useConfigurationStore.getState().clearSelection('colour')

      expect(useConfigurationStore.getState().config.colour).toBeNull()
    })

    it('does nothing when no model is set', () => {
      useConfigurationStore.getState().clearSelection('colour')
      expect(useConfigurationStore.getState().config).toEqual({})
    })
  })

  describe('resetConfiguration', () => {
    it('resets config to empty while keeping model', () => {
      useConfigurationStore.getState().setModel(TEST_MODEL_ID)
      useConfigurationStore.getState().selectOption('colour', 'red')
      useConfigurationStore.getState().selectOption('cover', 'shield')

      useConfigurationStore.getState().resetConfiguration()

      const state = useConfigurationStore.getState()
      expect(state.currentModelId).toBe(TEST_MODEL_ID)
      expect(state.config).toEqual({ colour: null, cover: null, text: null })
      expect(state.customText).toBeNull()
      expect(state.currentStep).toBe('colour')
    })
  })

  describe('setCurrentStep', () => {
    it('sets current step', () => {
      useConfigurationStore.getState().setModel(TEST_MODEL_ID)
      useConfigurationStore.getState().setCurrentStep('cover')

      expect(useConfigurationStore.getState().currentStep).toBe('cover')
    })
  })

  describe('setCustomText', () => {
    it('sets custom text with submitted flag', () => {
      useConfigurationStore
        .getState()
        .setCustomText({ lineCount: 1, line1: 'Hello', line2: '', line3: '' })

      const ct = useConfigurationStore.getState().customText
      expect(ct).not.toBeNull()
      expect(ct!.line1).toBe('Hello')
      expect(ct!.submitted).toBe(true)
    })
  })

  describe('clearCustomText', () => {
    it('clears custom text', () => {
      useConfigurationStore
        .getState()
        .setCustomText({ lineCount: 1, line1: 'Hello', line2: '', line3: '' })
      useConfigurationStore.getState().clearCustomText()

      expect(useConfigurationStore.getState().customText).toBeNull()
    })
  })

  describe('loadConfigFromUrl', () => {
    it('loads configuration from URL state', () => {
      const config = { colour: 'red', cover: 'shield', text: 'FR' }
      useConfigurationStore.getState().loadConfigFromUrl(TEST_MODEL_ID, config, null)

      const state = useConfigurationStore.getState()
      expect(state.currentModelId).toBe(TEST_MODEL_ID)
      expect(state.config.colour).toBe('red')
      expect(state.config.cover).toBe('shield')
      expect(state.config.text).toBe('FR')
      expect(state.currentStep).toBe('text')
    })

    it('loads configuration with custom text', () => {
      const config = { colour: 'red', cover: 'shield', text: 'ZA' }
      const customText = {
        lineCount: 1 as const,
        line1: 'Test',
        line2: '',
        line3: '',
        submitted: true,
      }

      useConfigurationStore
        .getState()
        .loadConfigFromUrl(TEST_MODEL_ID, config, customText)

      const state = useConfigurationStore.getState()
      expect(state.customText).not.toBeNull()
      expect(state.customText!.line1).toBe('Test')
    })

    it('ignores config keys not in stepOrder', () => {
      const config = { colour: 'red', cover: 'shield', text: 'FR', unknown: 'value' }
      useConfigurationStore.getState().loadConfigFromUrl(TEST_MODEL_ID, config, null)

      const state = useConfigurationStore.getState()
      expect(state.config).not.toHaveProperty('unknown')
    })

    it('does nothing for unknown model', () => {
      const config = { colour: 'red' }
      useConfigurationStore.getState().loadConfigFromUrl('enviro-armour', config, null)

      expect(useConfigurationStore.getState().currentModelId).toBeNull()
    })
  })
})
