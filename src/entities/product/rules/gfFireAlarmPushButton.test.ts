import { describe, it, expect } from 'vitest'
import {
  buildGFModelCode,
  parseGFModelCode,
  isValidGFCombination,
  getValidGFOptionsForStep,
  VALID_MODEL_CODES,
  GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS,
} from '@entities/product/rules/gfFireAlarmPushButtonRules'
import { gfFireAlarmPushButtonModel } from '@entities/product/models/gfFireAlarmPushButton'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

describe('buildGFModelCode', () => {
  it('builds all 10 valid SKUs correctly', () => {
    expect(buildGFModelCode({ model: 'A', cover: '0', text: 'FR', language: 'EN' })).toBe(
      'GFA0FR-EN',
    )
    expect(buildGFModelCode({ model: 'A', cover: '0', text: 'HF', language: 'EN' })).toBe(
      'GFA0HF-EN',
    )
    expect(buildGFModelCode({ model: 'A', cover: '2', text: 'FR', language: 'EN' })).toBe(
      'GFA2FR-EN',
    )
    expect(buildGFModelCode({ model: 'A', cover: '0', text: 'PA', language: 'UA' })).toBe(
      'GFA0PA-UA',
    )
    expect(buildGFModelCode({ model: 'A', cover: '2', text: 'PA', language: 'UA' })).toBe(
      'GFA2PA-UA',
    )
    expect(buildGFModelCode({ model: 'C', cover: '0', text: 'FR', language: 'EN' })).toBe(
      'GFC0FR-EN',
    )
    expect(buildGFModelCode({ model: 'C', cover: '0', text: 'HF', language: 'EN' })).toBe(
      'GFC0HF-EN',
    )
    expect(buildGFModelCode({ model: 'C', cover: '2', text: 'FR', language: 'EN' })).toBe(
      'GFC2FR-EN',
    )
    expect(buildGFModelCode({ model: 'C', cover: '0', text: 'PA', language: 'UA' })).toBe(
      'GFC0PA-UA',
    )
    expect(buildGFModelCode({ model: 'C', cover: '2', text: 'PA', language: 'UA' })).toBe(
      'GFC2PA-UA',
    )
  })

  it('language separator is only dash in SKU', () => {
    const code = buildGFModelCode({ model: 'A', cover: '0', text: 'FR', language: 'EN' })
    expect(code?.split('-')).toHaveLength(2)
    expect(code).toContain('-EN')
  })

  it('UA language produces correct suffix', () => {
    const code = buildGFModelCode({ model: 'A', cover: '0', text: 'PA', language: 'UA' })
    expect(code?.split('-')).toHaveLength(2)
    expect(code).toContain('-UA')
  })

  it('returns null when any field is missing', () => {
    expect(buildGFModelCode({ model: 'A', cover: '0', text: 'FR' })).toBeNull()
    expect(buildGFModelCode({ model: 'A', cover: '0', language: 'EN' })).toBeNull()
    expect(buildGFModelCode({ model: 'A', text: 'FR', language: 'EN' })).toBeNull()
    expect(buildGFModelCode({ cover: '0', text: 'FR', language: 'EN' })).toBeNull()
    expect(buildGFModelCode({})).toBeNull()
  })
})

describe('parseGFModelCode', () => {
  it('parses GFA0FR-EN correctly', () => {
    expect(parseGFModelCode('GFA0FR-EN')).toEqual({
      model: 'A',
      cover: '0',
      text: 'FR',
      language: 'EN',
    })
  })

  it('parses GFC2FR-EN correctly', () => {
    expect(parseGFModelCode('GFC2FR-EN')).toEqual({
      model: 'C',
      cover: '2',
      text: 'FR',
      language: 'EN',
    })
  })

  it('parses GFA0HF-EN correctly', () => {
    expect(parseGFModelCode('GFA0HF-EN')).toEqual({
      model: 'A',
      cover: '0',
      text: 'HF',
      language: 'EN',
    })
  })

  it('parses GFA0PA-UA correctly', () => {
    expect(parseGFModelCode('GFA0PA-UA')).toEqual({
      model: 'A',
      cover: '0',
      text: 'PA',
      language: 'UA',
    })
  })

  it('parses GFC2PA-UA correctly', () => {
    expect(parseGFModelCode('GFC2PA-UA')).toEqual({
      model: 'C',
      cover: '2',
      text: 'PA',
      language: 'UA',
    })
  })

  it('returns null for invalid format', () => {
    expect(parseGFModelCode('INVALID')).toBeNull()
    expect(parseGFModelCode('GFX0FR-EN')).toBeNull()
    expect(parseGFModelCode('GFA0FR')).toBeNull()
    expect(parseGFModelCode('GFA0F-EN')).toBeNull()
    expect(parseGFModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseGFModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildGFModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 10 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(10)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(10)
  })

  it('5 model A and 5 model C codes', () => {
    const modelA = VALID_MODEL_CODES.filter((c) => parseGFModelCode(c)?.model === 'A')
    const modelC = VALID_MODEL_CODES.filter((c) => parseGFModelCode(c)?.model === 'C')
    expect(modelA.length).toBe(5)
    expect(modelC.length).toBe(5)
  })

  it('6 codes end with -EN, 4 codes end with -UA', () => {
    const en = VALID_MODEL_CODES.filter((c) => c.endsWith('-EN'))
    const ua = VALID_MODEL_CODES.filter((c) => c.endsWith('-UA'))
    expect(en.length).toBe(6)
    expect(ua.length).toBe(4)
  })

  it('PA text only appears with UA language', () => {
    const paCodes = VALID_MODEL_CODES.filter((c) => parseGFModelCode(c)?.text === 'PA')
    expect(paCodes.length).toBe(4)
    for (const code of paCodes) {
      expect(parseGFModelCode(code)?.language).toBe('UA')
    }
  })

  it('FR and HF text only appear with EN language', () => {
    const frHfCodes = VALID_MODEL_CODES.filter((c) => {
      const t = parseGFModelCode(c)?.text
      return t === 'FR' || t === 'HF'
    })
    for (const code of frHfCodes) {
      expect(parseGFModelCode(code)?.language).toBe('EN')
    }
  })

  it('HF text only appears with cover 0', () => {
    const hfCodes = VALID_MODEL_CODES.filter((c) => parseGFModelCode(c)?.text === 'HF')
    expect(hfCodes.length).toBe(2)
    for (const code of hfCodes) {
      expect(parseGFModelCode(code)?.cover).toBe('0')
    }
  })

  it('cover 2 only appears with FR or PA text', () => {
    const cover2Codes = VALID_MODEL_CODES.filter(
      (c) => parseGFModelCode(c)?.cover === '2',
    )
    expect(cover2Codes.length).toBe(4)
    for (const code of cover2Codes) {
      const text = parseGFModelCode(code)?.text
      expect(['FR', 'PA']).toContain(text)
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseGFModelCode(code)).not.toBeNull()
    }
  })
})

describe('isValidGFCombination', () => {
  it('all 10 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseGFModelCode(code)!
      expect(isValidGFCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidGFCombination({})).toEqual({ valid: true })
    expect(isValidGFCombination({ model: 'A' })).toEqual({ valid: true })
    expect(isValidGFCombination({ model: 'A', cover: '0', text: 'FR' })).toEqual({
      valid: true,
    })
  })

  it('rejects HF text with cover 2 — not in allowlist', () => {
    const result = isValidGFCombination({
      model: 'A',
      cover: '2',
      text: 'HF',
      language: 'EN',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toContain('GFA2HF-EN')
  })

  it('rejects HF text with cover 2 for model C as well', () => {
    const result = isValidGFCombination({
      model: 'C',
      cover: '2',
      text: 'HF',
      language: 'EN',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects PA text with EN language', () => {
    const result = isValidGFCombination({
      model: 'A',
      cover: '0',
      text: 'PA',
      language: 'EN',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects FR text with UA language', () => {
    const result = isValidGFCombination({
      model: 'A',
      cover: '0',
      text: 'FR',
      language: 'UA',
    })
    expect(result.valid).toBe(false)
  })
})

describe('getValidGFOptionsForStep', () => {
  it('returns both models when nothing selected', () => {
    const valid = getValidGFOptionsForStep('model', {})
    expect(valid).toContain('A')
    expect(valid).toContain('C')
  })

  it('language returns EN and UA when nothing selected', () => {
    const valid = getValidGFOptionsForStep('language', {})
    expect(valid).toContain('EN')
    expect(valid).toContain('UA')
  })

  it('language returns only UA when text is PA', () => {
    const valid = getValidGFOptionsForStep('language', { text: 'PA' })
    expect(valid).toEqual(['UA'])
  })

  it('language returns only EN when text is FR', () => {
    const valid = getValidGFOptionsForStep('language', { text: 'FR' })
    expect(valid).toEqual(['EN'])
  })

  it('text returns only PA when language is UA', () => {
    const valid = getValidGFOptionsForStep('text', { language: 'UA' })
    expect(valid).toEqual(['PA'])
  })

  it('text returns FR and HF when language is EN', () => {
    const valid = getValidGFOptionsForStep('text', { language: 'EN' })
    expect(valid).toContain('FR')
    expect(valid).toContain('HF')
    expect(valid).not.toContain('PA')
  })

  it('cover excludes 2 when text is HF', () => {
    const valid = getValidGFOptionsForStep('cover', { text: 'HF' })
    expect(valid).not.toContain('2')
    expect(valid).toContain('0')
  })
})

describe('constraint engine — gfFireAlarmPushButton', () => {
  const engine = createConstraintEngine(GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS)

  it('blocks cover 2 when text is HF', () => {
    expect(engine.checkOptionAvailability('cover', '2', { text: 'HF' }).available).toBe(
      false,
    )
  })

  it('allows cover 0 when text is HF', () => {
    expect(engine.checkOptionAvailability('cover', '0', { text: 'HF' }).available).toBe(
      true,
    )
  })

  it('blocks UA language when text is FR', () => {
    expect(
      engine.checkOptionAvailability('language', 'UA', { text: 'FR' }).available,
    ).toBe(false)
  })

  it('blocks EN language when text is PA', () => {
    expect(
      engine.checkOptionAvailability('language', 'EN', { text: 'PA' }).available,
    ).toBe(false)
  })

  it('allows UA language when text is PA', () => {
    expect(
      engine.checkOptionAvailability('language', 'UA', { text: 'PA' }).available,
    ).toBe(true)
  })

  it('model does not restrict cover', () => {
    for (const model of ['A', 'C']) {
      expect(engine.checkOptionAvailability('cover', '0', { model }).available).toBe(true)
      expect(engine.checkOptionAvailability('cover', '2', { model }).available).toBe(true)
    }
  })

  it('constraint engine modelId matches', () => {
    expect(GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS.modelId).toBe(
      'gf-fire-alarm-push-button',
    )
  })
})

describe('buildProductModel — gfFireAlarmPushButton', () => {
  it('builds GFA0FR-EN correctly', () => {
    const config: Configuration = { model: 'A', cover: '0', text: 'FR', language: 'EN' }
    const result = buildProductModel(config, gfFireAlarmPushButtonModel)
    expect(result.fullCode).toBe('GFA0FR-EN')
    expect(result.isComplete).toBe(true)
  })

  it('builds GFC2FR-EN correctly', () => {
    const config: Configuration = { model: 'C', cover: '2', text: 'FR', language: 'EN' }
    const result = buildProductModel(config, gfFireAlarmPushButtonModel)
    expect(result.fullCode).toBe('GFC2FR-EN')
    expect(result.isComplete).toBe(true)
  })

  it('builds GFC0HF-EN correctly', () => {
    const config: Configuration = { model: 'C', cover: '0', text: 'HF', language: 'EN' }
    const result = buildProductModel(config, gfFireAlarmPushButtonModel)
    expect(result.fullCode).toBe('GFC0HF-EN')
    expect(result.isComplete).toBe(true)
  })

  it('builds GFA0PA-UA correctly', () => {
    const config: Configuration = { model: 'A', cover: '0', text: 'PA', language: 'UA' }
    const result = buildProductModel(config, gfFireAlarmPushButtonModel)
    expect(result.fullCode).toBe('GFA0PA-UA')
    expect(result.isComplete).toBe(true)
  })

  it('builds GFC2PA-UA correctly', () => {
    const config: Configuration = { model: 'C', cover: '2', text: 'PA', language: 'UA' }
    const result = buildProductModel(config, gfFireAlarmPushButtonModel)
    expect(result.fullCode).toBe('GFC2PA-UA')
    expect(result.isComplete).toBe(true)
  })

  it('baseCode is GF', () => {
    const config: Configuration = { model: null, cover: null, text: null, language: null }
    const result = buildProductModel(config, gfFireAlarmPushButtonModel)
    expect(result.baseCode).toBe('GF')
  })

  it('only language uses dash separator', () => {
    const config: Configuration = { model: 'A', cover: '0', text: 'FR', language: 'EN' }
    const result = buildProductModel(config, gfFireAlarmPushButtonModel)
    expect(result.fullCode.split('-')).toHaveLength(2)
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = { model: 'A', cover: null, text: null, language: null }
    const result = buildProductModel(config, gfFireAlarmPushButtonModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('cover')
    expect(result.missingSteps).toContain('text')
    expect(result.missingSteps).toContain('language')
  })

  it('all 10 valid codes generated from parsed configurations', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseGFModelCode(code)!
      const config: Configuration = {
        model: parsed.model ?? null,
        cover: parsed.cover ?? null,
        text: parsed.text ?? null,
        language: parsed.language ?? null,
      }
      const result = buildProductModel(config, gfFireAlarmPushButtonModel)
      if (validSet.has(result.fullCode)) matchCount++
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

describe('isConfigurationComplete — gfFireAlarmPushButton', () => {
  it('returns true when all 4 steps selected', () => {
    const config: Configuration = { model: 'A', cover: '0', text: 'FR', language: 'EN' }
    expect(isConfigurationComplete(gfFireAlarmPushButtonModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(gfFireAlarmPushButtonModel, {
        model: 'A',
        cover: '0',
        text: 'FR',
        language: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = { model: 'C', cover: null, text: null, language: null }
    const missing = getMissingRequiredSteps(gfFireAlarmPushButtonModel, config)
    expect(missing).toContain('cover')
    expect(missing).toContain('text')
    expect(missing).toContain('language')
    expect(missing).not.toContain('model')
  })

  it('getCompletionPercentage for 4-step model', () => {
    expect(
      getCompletionPercentage(gfFireAlarmPushButtonModel, {
        model: null,
        cover: null,
        text: null,
        language: null,
      }),
    ).toBe(0)
    expect(
      getCompletionPercentage(gfFireAlarmPushButtonModel, {
        model: 'A',
        cover: null,
        text: null,
        language: null,
      }),
    ).toBe(25)
    expect(
      getCompletionPercentage(gfFireAlarmPushButtonModel, {
        model: 'A',
        cover: '0',
        text: null,
        language: null,
      }),
    ).toBe(50)
    expect(
      getCompletionPercentage(gfFireAlarmPushButtonModel, {
        model: 'A',
        cover: '0',
        text: 'FR',
        language: null,
      }),
    ).toBe(75)
    expect(
      getCompletionPercentage(gfFireAlarmPushButtonModel, {
        model: 'A',
        cover: '0',
        text: 'FR',
        language: 'EN',
      }),
    ).toBe(100)
  })
})

describe('gfFireAlarmPushButtonModel definition', () => {
  it('has correct model id and slug', () => {
    expect(gfFireAlarmPushButtonModel.id).toBe('gf-fire-alarm-push-button')
    expect(gfFireAlarmPushButtonModel.slug).toBe('gf-fire-alarm-push-button')
  })

  it('stepOrder has 4 steps', () => {
    expect(gfFireAlarmPushButtonModel.stepOrder).toEqual([
      'model',
      'cover',
      'text',
      'language',
    ])
  })

  it('all steps are required', () => {
    for (const step of gfFireAlarmPushButtonModel.steps) {
      expect(step.required).toBe(true)
    }
  })

  it('language step has 2 options — EN and UA', () => {
    const langStep = gfFireAlarmPushButtonModel.steps.find((s) => s.id === 'language')!
    expect(langStep.options).toHaveLength(2)
    const ids = langStep.options.map((o) => o.id)
    expect(ids).toContain('EN')
    expect(ids).toContain('UA')
  })

  it('text step has exactly 3 options — FR, HF and PA', () => {
    const textStep = gfFireAlarmPushButtonModel.steps.find((s) => s.id === 'text')!
    const ids = textStep.options.map((o) => o.id)
    expect(ids).toEqual(['FR', 'HF', 'PA'])
  })

  it('baseCode is GF', () => {
    expect(gfFireAlarmPushButtonModel.productModelSchema.baseCode).toBe('GF')
  })

  it('only language uses dash separator', () => {
    const { separatorMap } = gfFireAlarmPushButtonModel.productModelSchema
    expect(separatorMap?.language).toBe('-')
    expect(separatorMap?.model).toBe('')
    expect(separatorMap?.cover).toBe('')
    expect(separatorMap?.text).toBe('')
  })
})
