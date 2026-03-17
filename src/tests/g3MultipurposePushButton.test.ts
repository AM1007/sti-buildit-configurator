import { describe, it, expect } from 'vitest'
import {
  buildG3ModelCode,
  parseG3ModelCode,
  isValidG3Combination,
  getValidOptionsForStep,
  VALID_MODEL_CODES,
  G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS,
} from '@entities/product/rules/g3MultipurposePushButtonRules'
import { g3MultipurposePushButtonModel } from '@entities/product/models/g3MultipurposePushButton'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

describe('buildG3ModelCode', () => {
  it('builds G3A209ZA-EN correctly', () => {
    expect(
      buildG3ModelCode({
        model: 'A',
        colour: '2',
        cover: '0',
        buttonType: '9',
        text: 'ZA',
        language: 'EN',
      }),
    ).toBe('G3A209ZA-EN')
  })

  it('builds G3A209ZA-UA correctly', () => {
    expect(
      buildG3ModelCode({
        model: 'A',
        colour: '2',
        cover: '0',
        buttonType: '9',
        text: 'ZA',
        language: 'UA',
      }),
    ).toBe('G3A209ZA-UA')
  })

  it('builds G3C325ZA-EN correctly', () => {
    expect(
      buildG3ModelCode({
        model: 'C',
        colour: '3',
        cover: '2',
        buttonType: '5',
        text: 'ZA',
        language: 'EN',
      }),
    ).toBe('G3C325ZA-EN')
  })

  it('builds G3C105RM-EN correctly', () => {
    expect(
      buildG3ModelCode({
        model: 'C',
        colour: '1',
        cover: '0',
        buttonType: '5',
        text: 'RM',
        language: 'EN',
      }),
    ).toBe('G3C105RM-EN')
  })

  it('builds G3C429ZA-UA correctly', () => {
    expect(
      buildG3ModelCode({
        model: 'C',
        colour: '4',
        cover: '2',
        buttonType: '9',
        text: 'ZA',
        language: 'UA',
      }),
    ).toBe('G3C429ZA-UA')
  })

  it('language separator is dash — only separator in the SKU', () => {
    const code = buildG3ModelCode({
      model: 'A',
      colour: '2',
      cover: '0',
      buttonType: '9',
      text: 'ZA',
      language: 'EN',
    })
    expect(code).toContain('-EN')
    expect(code?.indexOf('-')).toBe(code!.length - 3)
  })

  it('returns null when any field is missing', () => {
    expect(
      buildG3ModelCode({
        model: 'A',
        colour: '2',
        cover: '0',
        buttonType: '9',
        text: 'ZA',
      }),
    ).toBeNull()
    expect(
      buildG3ModelCode({
        model: 'A',
        colour: '2',
        cover: '0',
        buttonType: '9',
        language: 'EN',
      }),
    ).toBeNull()
    expect(buildG3ModelCode({})).toBeNull()
  })
})

describe('parseG3ModelCode', () => {
  it('parses G3A209ZA-EN correctly', () => {
    expect(parseG3ModelCode('G3A209ZA-EN')).toEqual({
      model: 'A',
      colour: '2',
      cover: '0',
      buttonType: '9',
      text: 'ZA',
      language: 'EN',
    })
  })

  it('parses G3A209ZA-UA correctly', () => {
    expect(parseG3ModelCode('G3A209ZA-UA')).toEqual({
      model: 'A',
      colour: '2',
      cover: '0',
      buttonType: '9',
      text: 'ZA',
      language: 'UA',
    })
  })

  it('parses G3C325ZA-EN correctly', () => {
    expect(parseG3ModelCode('G3C325ZA-EN')).toEqual({
      model: 'C',
      colour: '3',
      cover: '2',
      buttonType: '5',
      text: 'ZA',
      language: 'EN',
    })
  })

  it('parses G3C105RM-EN correctly', () => {
    expect(parseG3ModelCode('G3C105RM-EN')).toEqual({
      model: 'C',
      colour: '1',
      cover: '0',
      buttonType: '5',
      text: 'RM',
      language: 'EN',
    })
  })

  it('returns null for invalid format', () => {
    expect(parseG3ModelCode('INVALID')).toBeNull()
    expect(parseG3ModelCode('G3A2090ZA-EN')).toBeNull()
    expect(parseG3ModelCode('G3A209ZA')).toBeNull()
    expect(parseG3ModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseG3ModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildG3ModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 33 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(33)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(33)
  })

  it('12 model A codes, 21 model C codes', () => {
    const modelA = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.model === 'A')
    const modelC = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.model === 'C')
    expect(modelA.length).toBe(12)
    expect(modelC.length).toBe(21)
  })

  it('EN and UA codes both present', () => {
    const en = VALID_MODEL_CODES.filter((c) => c.endsWith('-EN'))
    const ua = VALID_MODEL_CODES.filter((c) => c.endsWith('-UA'))
    expect(en.length).toBeGreaterThan(0)
    expect(ua.length).toBeGreaterThan(0)
  })

  it('UA language only appears with ZA text', () => {
    const uaCodes = VALID_MODEL_CODES.filter((c) => c.endsWith('-UA'))
    for (const code of uaCodes) {
      expect(parseG3ModelCode(code)?.text).toBe('ZA')
    }
  })

  it('RM text only appears with model C, colour 1, cover 0, buttonType 5', () => {
    const rmCodes = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.text === 'RM')
    expect(rmCodes.length).toBe(1)
    expect(rmCodes[0]).toBe('G3C105RM-EN')
  })

  it('XT text only appears with green (colour 1)', () => {
    const xtCodes = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.text === 'XT')
    expect(xtCodes.length).toBeGreaterThan(0)
    for (const code of xtCodes) {
      expect(parseG3ModelCode(code)?.colour).toBe('1')
    }
  })

  it('model A never has colour 0 or 1', () => {
    const modelACodes = VALID_MODEL_CODES.filter(
      (c) => parseG3ModelCode(c)?.model === 'A',
    )
    for (const code of modelACodes) {
      const parsed = parseG3ModelCode(code)!
      expect(parsed.colour).not.toBe('0')
      expect(parsed.colour).not.toBe('1')
    }
  })

  it('model A never has buttonType 2 or 5', () => {
    const modelACodes = VALID_MODEL_CODES.filter(
      (c) => parseG3ModelCode(c)?.model === 'A',
    )
    for (const code of modelACodes) {
      const parsed = parseG3ModelCode(code)!
      expect(parsed.buttonType).not.toBe('2')
      expect(parsed.buttonType).not.toBe('5')
    }
  })

  it('AB, HV, EM, LD, PO, PS, EV text codes no longer exist', () => {
    const removedTexts = ['AB', 'HV', 'EM', 'LD', 'PO', 'PS', 'EV']
    for (const text of removedTexts) {
      const found = VALID_MODEL_CODES.filter((c) => parseG3ModelCode(c)?.text === text)
      expect(found.length).toBe(0)
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseG3ModelCode(code)).not.toBeNull()
    }
  })
})

describe('isValidG3Combination', () => {
  it('all 33 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseG3ModelCode(code)!
      expect(isValidG3Combination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidG3Combination({})).toEqual({ valid: true })
    expect(isValidG3Combination({ model: 'A' })).toEqual({ valid: true })
    expect(
      isValidG3Combination({
        model: 'A',
        colour: '2',
        cover: '0',
        buttonType: '9',
        text: 'ZA',
      }),
    ).toEqual({ valid: true })
  })

  it('rejects model A with colour 0 — not in allowlist', () => {
    const result = isValidG3Combination({
      model: 'A',
      colour: '0',
      cover: '0',
      buttonType: '9',
      text: 'ZA',
      language: 'EN',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects UA language with RM text', () => {
    const result = isValidG3Combination({
      model: 'C',
      colour: '1',
      cover: '0',
      buttonType: '5',
      text: 'RM',
      language: 'UA',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects UA language with XT text', () => {
    const result = isValidG3Combination({
      model: 'C',
      colour: '1',
      cover: '0',
      buttonType: '5',
      text: 'XT',
      language: 'UA',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects previously valid EM text — removed from allowlist', () => {
    const result = isValidG3Combination({
      model: 'A',
      colour: '3',
      cover: '0',
      buttonType: '9',
      text: 'EM',
      language: 'EN',
    })
    expect(result.valid).toBe(false)
  })
})

describe('getValidOptionsForStep — g3MultipurposePushButton', () => {
  it('returns both models when nothing selected', () => {
    const valid = getValidOptionsForStep('model', {})
    expect(valid).toContain('A')
    expect(valid).toContain('C')
  })

  it('language returns EN and UA when nothing selected', () => {
    const valid = getValidOptionsForStep('language', {})
    expect(valid).toContain('EN')
    expect(valid).toContain('UA')
  })

  it('language returns only UA when text is ZA — via allowlist', () => {
    const valid = getValidOptionsForStep('language', { text: 'ZA' })
    expect(valid).toContain('EN')
    expect(valid).toContain('UA')
  })

  it('language returns only EN when text is RM', () => {
    const valid = getValidOptionsForStep('language', { text: 'RM' })
    expect(valid).toEqual(['EN'])
  })

  it('language returns only EN when text is XT', () => {
    const valid = getValidOptionsForStep('language', { text: 'XT' })
    expect(valid).toEqual(['EN'])
  })

  it('text options for colour 0 contain only ZA', () => {
    const valid = getValidOptionsForStep('text', { colour: '0' })
    expect(valid).toContain('ZA')
    expect(valid).not.toContain('AB')
    expect(valid).not.toContain('PS')
  })

  it('text options for colour 1 contain RM, XT and ZA', () => {
    const valid = getValidOptionsForStep('text', { colour: '1' })
    expect(valid).toContain('RM')
    expect(valid).toContain('XT')
    expect(valid).toContain('ZA')
  })

  it('model A only returns colour 2, 3, 4', () => {
    const valid = getValidOptionsForStep('colour', { model: 'A' })
    expect(valid).toContain('2')
    expect(valid).toContain('3')
    expect(valid).toContain('4')
    expect(valid).not.toContain('0')
    expect(valid).not.toContain('1')
  })
})

describe('constraint engine — g3MultipurposePushButton', () => {
  const engine = createConstraintEngine(G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS)

  it('blocks colour 0 for model A', () => {
    expect(engine.checkOptionAvailability('colour', '0', { model: 'A' }).available).toBe(
      false,
    )
  })

  it('allows colour 0 for model C', () => {
    expect(engine.checkOptionAvailability('colour', '0', { model: 'C' }).available).toBe(
      true,
    )
  })

  it('blocks UA language when text is RM', () => {
    expect(
      engine.checkOptionAvailability('language', 'UA', { text: 'RM' }).available,
    ).toBe(false)
  })

  it('blocks UA language when text is XT', () => {
    expect(
      engine.checkOptionAvailability('language', 'UA', { text: 'XT' }).available,
    ).toBe(false)
  })

  it('allows UA language when text is ZA', () => {
    expect(
      engine.checkOptionAvailability('language', 'UA', { text: 'ZA' }).available,
    ).toBe(true)
  })

  it('constraint engine modelId matches', () => {
    expect(G3_MULTIPURPOSE_PUSH_BUTTON_CONSTRAINTS.modelId).toBe(
      'g3-multipurpose-push-button',
    )
  })
})

describe('buildProductModel — g3MultipurposePushButton', () => {
  it('builds G3A209ZA-EN correctly', () => {
    const config: Configuration = {
      model: 'A',
      colour: '2',
      cover: '0',
      buttonType: '9',
      text: 'ZA',
      language: 'EN',
    }
    const result = buildProductModel(config, g3MultipurposePushButtonModel)
    expect(result.fullCode).toBe('G3A209ZA-EN')
    expect(result.isComplete).toBe(true)
  })

  it('builds G3A209ZA-UA correctly', () => {
    const config: Configuration = {
      model: 'A',
      colour: '2',
      cover: '0',
      buttonType: '9',
      text: 'ZA',
      language: 'UA',
    }
    const result = buildProductModel(config, g3MultipurposePushButtonModel)
    expect(result.fullCode).toBe('G3A209ZA-UA')
    expect(result.isComplete).toBe(true)
  })

  it('builds G3C105RM-EN correctly', () => {
    const config: Configuration = {
      model: 'C',
      colour: '1',
      cover: '0',
      buttonType: '5',
      text: 'RM',
      language: 'EN',
    }
    const result = buildProductModel(config, g3MultipurposePushButtonModel)
    expect(result.fullCode).toBe('G3C105RM-EN')
    expect(result.isComplete).toBe(true)
  })

  it('builds G3C325ZA-UA correctly', () => {
    const config: Configuration = {
      model: 'C',
      colour: '3',
      cover: '2',
      buttonType: '5',
      text: 'ZA',
      language: 'UA',
    }
    const result = buildProductModel(config, g3MultipurposePushButtonModel)
    expect(result.fullCode).toBe('G3C325ZA-UA')
    expect(result.isComplete).toBe(true)
  })

  it('builds G3C429ZA-UA correctly', () => {
    const config: Configuration = {
      model: 'C',
      colour: '4',
      cover: '2',
      buttonType: '9',
      text: 'ZA',
      language: 'UA',
    }
    const result = buildProductModel(config, g3MultipurposePushButtonModel)
    expect(result.fullCode).toBe('G3C429ZA-UA')
    expect(result.isComplete).toBe(true)
  })

  it('language separator is only dash in SKU', () => {
    const config: Configuration = {
      model: 'C',
      colour: '3',
      cover: '2',
      buttonType: '5',
      text: 'ZA',
      language: 'EN',
    }
    const result = buildProductModel(config, g3MultipurposePushButtonModel)
    expect(result.fullCode).toBe('G3C325ZA-EN')
    expect(result.fullCode.split('-')).toHaveLength(2)
  })

  it('baseCode is G3', () => {
    const config: Configuration = {
      model: null,
      colour: null,
      cover: null,
      buttonType: null,
      text: null,
      language: null,
    }
    const result = buildProductModel(config, g3MultipurposePushButtonModel)
    expect(result.baseCode).toBe('G3')
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = {
      model: 'A',
      colour: '2',
      cover: '0',
      buttonType: null,
      text: null,
      language: null,
    }
    const result = buildProductModel(config, g3MultipurposePushButtonModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('buttonType')
    expect(result.missingSteps).toContain('text')
    expect(result.missingSteps).toContain('language')
  })

  it('all 33 valid codes generated from parsed configurations', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseG3ModelCode(code)!
      const config: Configuration = {
        model: parsed.model ?? null,
        colour: parsed.colour ?? null,
        cover: parsed.cover ?? null,
        buttonType: parsed.buttonType ?? null,
        text: parsed.text ?? null,
        language: parsed.language ?? null,
      }
      const result = buildProductModel(config, g3MultipurposePushButtonModel)
      if (validSet.has(result.fullCode)) matchCount++
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

describe('isConfigurationComplete — g3MultipurposePushButton', () => {
  it('returns true when all 6 steps selected', () => {
    const config: Configuration = {
      model: 'A',
      colour: '2',
      cover: '0',
      buttonType: '9',
      text: 'ZA',
      language: 'EN',
    }
    expect(isConfigurationComplete(g3MultipurposePushButtonModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(g3MultipurposePushButtonModel, {
        model: 'A',
        colour: '2',
        cover: '0',
        buttonType: '9',
        text: 'ZA',
        language: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = {
      model: 'C',
      colour: '4',
      cover: '2',
      buttonType: null,
      text: null,
      language: null,
    }
    const missing = getMissingRequiredSteps(g3MultipurposePushButtonModel, config)
    expect(missing).toContain('buttonType')
    expect(missing).toContain('text')
    expect(missing).toContain('language')
    expect(missing).not.toContain('model')
    expect(missing).not.toContain('colour')
    expect(missing).not.toContain('cover')
  })

  it('getCompletionPercentage for 6-step model', () => {
    expect(
      getCompletionPercentage(g3MultipurposePushButtonModel, {
        model: null,
        colour: null,
        cover: null,
        buttonType: null,
        text: null,
        language: null,
      }),
    ).toBe(0)
    expect(
      getCompletionPercentage(g3MultipurposePushButtonModel, {
        model: 'A',
        colour: null,
        cover: null,
        buttonType: null,
        text: null,
        language: null,
      }),
    ).toBe(17)
    expect(
      getCompletionPercentage(g3MultipurposePushButtonModel, {
        model: 'A',
        colour: '2',
        cover: '0',
        buttonType: '9',
        text: null,
        language: null,
      }),
    ).toBe(67)
    expect(
      getCompletionPercentage(g3MultipurposePushButtonModel, {
        model: 'A',
        colour: '2',
        cover: '0',
        buttonType: '9',
        text: 'ZA',
        language: 'EN',
      }),
    ).toBe(100)
  })
})

describe('g3MultipurposePushButtonModel definition', () => {
  it('has correct model id and slug', () => {
    expect(g3MultipurposePushButtonModel.id).toBe('g3-multipurpose-push-button')
    expect(g3MultipurposePushButtonModel.slug).toBe('g3-multipurpose-push-button')
  })

  it('has 6 steps in stepOrder', () => {
    expect(g3MultipurposePushButtonModel.stepOrder).toHaveLength(6)
    expect(g3MultipurposePushButtonModel.stepOrder).toEqual([
      'model',
      'colour',
      'cover',
      'buttonType',
      'text',
      'language',
    ])
  })

  it('all steps are required', () => {
    for (const step of g3MultipurposePushButtonModel.steps) {
      expect(step.required).toBe(true)
    }
  })

  it('language step has 2 options — EN and UA', () => {
    const langStep = g3MultipurposePushButtonModel.steps.find((s) => s.id === 'language')!
    expect(langStep.options).toHaveLength(2)
    const ids = langStep.options.map((o) => o.id)
    expect(ids).toContain('EN')
    expect(ids).toContain('UA')
  })

  it('text step contains EX, XT, ZA, RM and does not contain removed options', () => {
    const textStep = g3MultipurposePushButtonModel.steps.find((s) => s.id === 'text')!
    const ids = textStep.options.map((o) => o.id)
    expect(ids).toContain('EX')
    expect(ids).toContain('XT')
    expect(ids).toContain('ZA')
    expect(ids).toContain('RM')
    for (const removed of ['AB', 'EM', 'EV', 'HV', 'LD', 'PO', 'PS']) {
      expect(ids).not.toContain(removed)
    }
  })

  it('colour step does not include disabled option 5 (Orange)', () => {
    const colourStep = g3MultipurposePushButtonModel.steps.find((s) => s.id === 'colour')!
    const ids = colourStep.options.map((o) => o.id)
    expect(ids).not.toContain('5')
  })

  it('baseCode is G3', () => {
    expect(g3MultipurposePushButtonModel.productModelSchema.baseCode).toBe('G3')
  })

  it('only language uses dash separator', () => {
    const { separatorMap } = g3MultipurposePushButtonModel.productModelSchema
    expect(separatorMap?.language).toBe('-')
    expect(separatorMap?.model).toBe('')
    expect(separatorMap?.colour).toBe('')
    expect(separatorMap?.cover).toBe('')
    expect(separatorMap?.buttonType).toBe('')
    expect(separatorMap?.text).toBe('')
  })
})
