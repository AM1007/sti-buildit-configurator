import { describe, it, expect } from 'vitest'
import {
  getCustomTextConfig,
  getCustomTextVariant,
  getCustomTextTrigger,
  supportsCustomText,
  isCustomTextOptionSelected,
  isNonReturnableLanguageSelected,
  shouldShowCustomTextForm,
  hasSubmittedCustomText,
  shouldClearCustomText,
  isConfigurationReadyForActions,
  getMaxLength,
  validateCustomText,
} from '@entities/product/customTextConfig'
import type { ModelDefinition, Configuration, CustomTextData } from '@shared/types'

function makeCustomText(overrides?: Partial<CustomTextData>): CustomTextData {
  return {
    lineCount: 1 as 1 | 2 | 3,
    line1: 'Test',
    line2: '',
    line3: '',
    submitted: true,
    ...overrides,
  }
}

function makeModel(
  id: string,
  steps: { id: string; required: boolean }[],
): ModelDefinition {
  return {
    id,
    slug: id,
    stepOrder: steps.map((s) => s.id),
    steps: steps.map((s) => ({
      id: s.id,
      required: s.required,
      options: [{ id: 'opt1', code: 'O1', label: 'Option 1' }],
    })),
    productModelSchema: {
      baseCode: 'TEST',
      separator: 'dash',
      partsOrder: steps.map((s) => s.id),
    },
  } as unknown as ModelDefinition
}

describe('getCustomTextConfig', () => {
  it('returns config for known model', () => {
    const config = getCustomTextConfig('g3-multipurpose-push-button')
    expect(config).not.toBeNull()
    expect(config!.stepId).toBe('text')
    expect(config!.optionId).toBe('ZA')
    expect(config!.variant).toBe('multiline-three-line')
  })

  it('returns null for unknown model', () => {
    expect(getCustomTextConfig('nonexistent-model' as never)).toBeNull()
  })

  it('returns config for each known product with custom text', () => {
    const knownModels = [
      'g3-multipurpose-push-button',
      'stopper-stations',
      'indoor-push-buttons',
      'key-switches',
      'waterproof-push-buttons',
      'reset-call-points',
      'waterproof-reset-call-point',
      'universal-stopper',
      'low-profile-universal-stopper',
      'global-reset',
      'enviro-stopper',
      'call-point-stopper',
      'euro-stopper',
    ]
    for (const modelId of knownModels) {
      const config = getCustomTextConfig(modelId as never)
      expect(config, `Expected config for ${modelId}`).not.toBeNull()
      expect(config!.stepId).toBeTruthy()
      expect(config!.optionId).toBeTruthy()
      expect(config!.variant).toBeTruthy()
      expect(config!.maxLines).toBeGreaterThanOrEqual(2)
      expect(config!.maxLines).toBeLessThanOrEqual(3)
    }
  })

  it('stopper-stations has maxLines 3', () => {
    const config = getCustomTextConfig('stopper-stations')
    expect(config!.maxLines).toBe(3)
  })

  it('call-point-stopper has maxLines 2', () => {
    const config = getCustomTextConfig('call-point-stopper')
    expect(config!.maxLines).toBe(2)
  })
})

describe('getCustomTextVariant', () => {
  it('returns variant for known model', () => {
    expect(getCustomTextVariant('indoor-push-buttons')).toBe('singleline')
  })

  it('returns null for unknown model', () => {
    expect(getCustomTextVariant('nonexistent' as never)).toBeNull()
  })
})

describe('getCustomTextTrigger', () => {
  it('returns stepId and optionId for known model', () => {
    const trigger = getCustomTextTrigger('stopper-stations')
    expect(trigger).toEqual({ stepId: 'text', optionId: 'ZA' })
  })

  it('returns null for unknown model', () => {
    expect(getCustomTextTrigger('nonexistent' as never)).toBeNull()
  })
})

describe('supportsCustomText', () => {
  it('returns true for model with custom text config', () => {
    expect(supportsCustomText('g3-multipurpose-push-button')).toBe(true)
  })

  it('returns false for model without custom text config', () => {
    expect(supportsCustomText('nonexistent' as never)).toBe(false)
  })
})

describe('isCustomTextOptionSelected', () => {
  it('returns true when trigger option is selected (standard model)', () => {
    const config: Configuration = { text: 'ZA' }
    expect(isCustomTextOptionSelected('g3-multipurpose-push-button', config)).toBe(true)
  })

  it('returns false when different option is selected', () => {
    const config: Configuration = { text: 'FR' }
    expect(isCustomTextOptionSelected('g3-multipurpose-push-button', config)).toBe(false)
  })

  it('returns false when step has no selection', () => {
    const config: Configuration = { text: null }
    expect(isCustomTextOptionSelected('g3-multipurpose-push-button', config)).toBe(false)
  })

  it('returns true for stopper-like model when option starts with C (not NC)', () => {
    const config: Configuration = { colourLabel: 'CR' }
    expect(isCustomTextOptionSelected('universal-stopper', config)).toBe(true)
  })

  it('returns false for stopper-like model when option is NC', () => {
    const config: Configuration = { colourLabel: 'NC' }
    expect(isCustomTextOptionSelected('universal-stopper', config)).toBe(false)
  })

  it('returns true for euro-stopper with C-prefixed option', () => {
    const config: Configuration = { colourLabel: 'CB' }
    expect(isCustomTextOptionSelected('euro-stopper', config)).toBe(true)
  })

  it('returns false for unsupported model', () => {
    const config: Configuration = { text: 'ZA' }
    expect(isCustomTextOptionSelected('nonexistent' as never, config)).toBe(false)
  })
})

describe('isNonReturnableLanguageSelected', () => {
  it('returns true for stopper-stations with ZL language', () => {
    const config: Configuration = { language: 'ZL' }
    expect(isNonReturnableLanguageSelected('stopper-stations', config)).toBe(true)
  })

  it('returns false for stopper-stations with other language', () => {
    const config: Configuration = { language: 'EN' }
    expect(isNonReturnableLanguageSelected('stopper-stations', config)).toBe(false)
  })

  it('returns false for non-stopper-stations model', () => {
    const config: Configuration = { language: 'ZL' }
    expect(isNonReturnableLanguageSelected('g3-multipurpose-push-button', config)).toBe(
      false,
    )
  })
})

describe('shouldClearCustomText', () => {
  it('returns true when switching away from trigger option', () => {
    expect(shouldClearCustomText('g3-multipurpose-push-button', 'text', 'ZA', 'FR')).toBe(
      true,
    )
  })

  it('returns false when switching to trigger option', () => {
    expect(shouldClearCustomText('g3-multipurpose-push-button', 'text', 'FR', 'ZA')).toBe(
      false,
    )
  })

  it('returns false when changing a different step', () => {
    expect(
      shouldClearCustomText('g3-multipurpose-push-button', 'colour', 'red', 'blue'),
    ).toBe(false)
  })

  it('returns false for unsupported model', () => {
    expect(shouldClearCustomText('nonexistent' as never, 'text', 'ZA', 'FR')).toBe(false)
  })
})

describe('hasSubmittedCustomText', () => {
  it('returns true when custom text option selected and text submitted', () => {
    const config: Configuration = { text: 'ZA' }
    const ct = makeCustomText({ submitted: true })
    expect(hasSubmittedCustomText('g3-multipurpose-push-button', config, ct)).toBe(true)
  })

  it('returns false when custom text not submitted', () => {
    const config: Configuration = { text: 'ZA' }
    const ct = makeCustomText({ submitted: false })
    expect(hasSubmittedCustomText('g3-multipurpose-push-button', config, ct)).toBe(false)
  })

  it('returns false when custom text option not selected', () => {
    const config: Configuration = { text: 'FR' }
    const ct = makeCustomText({ submitted: true })
    expect(hasSubmittedCustomText('g3-multipurpose-push-button', config, ct)).toBe(false)
  })

  it('returns false when customText is null', () => {
    const config: Configuration = { text: 'ZA' }
    expect(hasSubmittedCustomText('g3-multipurpose-push-button', config, null)).toBe(
      false,
    )
  })
})

describe('isConfigurationReadyForActions', () => {
  it('returns true when model does not support custom text', () => {
    const config: Configuration = {}
    expect(isConfigurationReadyForActions('nonexistent' as never, config, null)).toBe(
      true,
    )
  })

  it('returns true when custom text option is not selected', () => {
    const config: Configuration = { text: 'FR' }
    expect(
      isConfigurationReadyForActions('g3-multipurpose-push-button', config, null),
    ).toBe(true)
  })

  it('returns false when custom text option selected but not submitted', () => {
    const config: Configuration = { text: 'ZA' }
    expect(
      isConfigurationReadyForActions('g3-multipurpose-push-button', config, null),
    ).toBe(false)
  })

  it('returns true when custom text option selected and submitted', () => {
    const config: Configuration = { text: 'ZA' }
    const ct = makeCustomText({ submitted: true })
    expect(
      isConfigurationReadyForActions('g3-multipurpose-push-button', config, ct),
    ).toBe(true)
  })
})

describe('shouldShowCustomTextForm', () => {
  const model = makeModel('g3-multipurpose-push-button', [
    { id: 'model', required: true },
    { id: 'colour', required: true },
    { id: 'cover', required: true },
    { id: 'buttonType', required: true },
    { id: 'text', required: true },
    { id: 'language', required: true },
  ])

  const completeConfig: Configuration = {
    model: 'A',
    colour: '0',
    cover: '0',
    buttonType: '9',
    text: 'ZA',
    language: 'EN',
  }

  it('returns true when all conditions met', () => {
    expect(shouldShowCustomTextForm(model, completeConfig, null, true)).toBe(true)
  })

  it('returns false when model does not support custom text', () => {
    const unsupported = makeModel('no-custom-text' as never, [
      { id: 'a', required: true },
    ])
    expect(shouldShowCustomTextForm(unsupported, { a: 'x' }, null, true)).toBe(false)
  })

  it('returns false when custom text option not selected', () => {
    const config = { ...completeConfig, text: 'FR' }
    expect(shouldShowCustomTextForm(model, config, null, true)).toBe(false)
  })

  it('returns false when configuration is incomplete', () => {
    expect(shouldShowCustomTextForm(model, completeConfig, null, false)).toBe(false)
  })

  it('returns false when custom text already submitted', () => {
    const ct = makeCustomText({ submitted: true })
    expect(shouldShowCustomTextForm(model, completeConfig, ct, true)).toBe(false)
  })
})

describe('getMaxLength', () => {
  it('returns numeric maxLength for model with number config', () => {
    expect(getMaxLength('g3-multipurpose-push-button', 1)).toBe(13)
    expect(getMaxLength('g3-multipurpose-push-button', 2)).toBe(13)
  })

  it('returns oneLine/twoLines for model with object config', () => {
    expect(getMaxLength('stopper-stations', 1)).toBe(13)
    expect(getMaxLength('stopper-stations', 2)).toBe(20)
  })

  it('returns threeLines for stopper-stations with 3 lines', () => {
    expect(getMaxLength('stopper-stations', 3)).toBe(20)
  })

  it('falls back to twoLines when threeLines not defined', () => {
    expect(getMaxLength('call-point-stopper', 3)).toBe(30)
  })

  it('returns default 20 for unsupported model', () => {
    expect(getMaxLength('nonexistent' as never, 1)).toBe(20)
  })
})

describe('validateCustomText', () => {
  it('returns valid for correct singleline input', () => {
    const data = { lineCount: 1 as const, line1: 'Test', line2: '', line3: '' }
    const result = validateCustomText(data, 'indoor-push-buttons')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('returns invalid when line1 is empty', () => {
    const data = { lineCount: 1 as const, line1: '   ', line2: '', line3: '' }
    const result = validateCustomText(data, 'indoor-push-buttons')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('returns invalid when line1 exceeds maxLength', () => {
    const data = { lineCount: 1 as const, line1: 'A'.repeat(21), line2: '', line3: '' }
    const result = validateCustomText(data, 'indoor-push-buttons')
    expect(result.valid).toBe(false)
  })

  it('returns invalid for unsupported model', () => {
    const data = { lineCount: 1 as const, line1: 'Test', line2: '', line3: '' }
    const result = validateCustomText(data, 'nonexistent' as never)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Custom text not supported for this model')
  })

  it('validates multiline-three-line variant', () => {
    const data = { lineCount: 3 as const, line1: 'Line1', line2: 'Line2', line3: 'Line3' }
    const result = validateCustomText(data, 'g3-multipurpose-push-button')
    expect(result.valid).toBe(true)
  })

  it('rejects multiline-three-line when line exceeds max', () => {
    const data = { lineCount: 3 as const, line1: 'A'.repeat(14), line2: '', line3: '' }
    const result = validateCustomText(data, 'g3-multipurpose-push-button')
    expect(result.valid).toBe(false)
  })

  it('validates multiline-selectable with 1 line', () => {
    const data = { lineCount: 1 as const, line1: 'Short', line2: '', line3: '' }
    const result = validateCustomText(data, 'stopper-stations')
    expect(result.valid).toBe(true)
  })

  it('validates multiline-selectable with 2 lines', () => {
    const data = { lineCount: 2 as const, line1: 'Line1', line2: 'Line2', line3: '' }
    const result = validateCustomText(data, 'stopper-stations')
    expect(result.valid).toBe(true)
  })

  it('rejects multiline-selectable when line exceeds 2-line max', () => {
    const data = { lineCount: 2 as const, line1: 'A'.repeat(21), line2: '', line3: '' }
    const result = validateCustomText(data, 'stopper-stations')
    expect(result.valid).toBe(false)
  })

  it('validates multiline-selectable with 3 lines for stopper-stations', () => {
    const data = { lineCount: 3 as const, line1: 'Line1', line2: 'Line2', line3: 'Line3' }
    const result = validateCustomText(data, 'stopper-stations')
    expect(result.valid).toBe(true)
  })

  it('rejects multiline-selectable 3 lines when line3 exceeds max', () => {
    const data = {
      lineCount: 3 as const,
      line1: 'OK',
      line2: 'OK',
      line3: 'A'.repeat(21),
    }
    const result = validateCustomText(data, 'stopper-stations')
    expect(result.valid).toBe(false)
  })

  it('uses threeLines maxLength for 3-line stopper-stations', () => {
    const data = {
      lineCount: 3 as const,
      line1: 'A'.repeat(20),
      line2: 'B'.repeat(20),
      line3: 'C'.repeat(20),
    }
    const result = validateCustomText(data, 'stopper-stations')
    expect(result.valid).toBe(true)
  })

  it('rejects 3-line stopper-stations when exceeding threeLines maxLength', () => {
    const data = { lineCount: 3 as const, line1: 'A'.repeat(21), line2: 'B', line3: 'C' }
    const result = validateCustomText(data, 'stopper-stations')
    expect(result.valid).toBe(false)
  })
})
