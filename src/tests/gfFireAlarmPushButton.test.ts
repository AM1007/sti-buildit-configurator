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

// ─────────────────────────────────────────────────────────────
// buildGFModelCode
// ─────────────────────────────────────────────────────────────

describe('buildGFModelCode', () => {
  it('builds all 6 valid SKUs correctly', () => {
    expect(buildGFModelCode({ model: 'A', cover: '0', text: 'FR', language: 'EN' })).toBe(
      'GFA0FR-EN',
    )
    expect(buildGFModelCode({ model: 'A', cover: '0', text: 'HF', language: 'EN' })).toBe(
      'GFA0HF-EN',
    )
    expect(buildGFModelCode({ model: 'A', cover: '2', text: 'FR', language: 'EN' })).toBe(
      'GFA2FR-EN',
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
  })

  it('language separator is only dash in SKU', () => {
    const code = buildGFModelCode({ model: 'A', cover: '0', text: 'FR', language: 'EN' })
    expect(code?.split('-')).toHaveLength(2)
    expect(code).toContain('-EN')
  })

  it('returns null when any field is missing', () => {
    expect(buildGFModelCode({ model: 'A', cover: '0', text: 'FR' })).toBeNull()
    expect(buildGFModelCode({ model: 'A', cover: '0', language: 'EN' })).toBeNull()
    expect(buildGFModelCode({ model: 'A', text: 'FR', language: 'EN' })).toBeNull()
    expect(buildGFModelCode({ cover: '0', text: 'FR', language: 'EN' })).toBeNull()
    expect(buildGFModelCode({})).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// parseGFModelCode
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 6 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(6)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(6)
  })

  it('3 model A and 3 model C codes', () => {
    const modelA = VALID_MODEL_CODES.filter((c) => parseGFModelCode(c)?.model === 'A')
    const modelC = VALID_MODEL_CODES.filter((c) => parseGFModelCode(c)?.model === 'C')
    expect(modelA.length).toBe(3)
    expect(modelC.length).toBe(3)
  })

  it('all codes end with -EN', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(code.endsWith('-EN')).toBe(true)
    }
  })

  it('HF text only appears with cover 0', () => {
    const hfCodes = VALID_MODEL_CODES.filter((c) => parseGFModelCode(c)?.text === 'HF')
    expect(hfCodes.length).toBe(2)
    for (const code of hfCodes) {
      expect(parseGFModelCode(code)?.cover).toBe('0')
    }
  })

  it('cover 2 only appears with FR text', () => {
    const cover2Codes = VALID_MODEL_CODES.filter(
      (c) => parseGFModelCode(c)?.cover === '2',
    )
    expect(cover2Codes.length).toBe(2)
    for (const code of cover2Codes) {
      expect(parseGFModelCode(code)?.text).toBe('FR')
    }
  })

  it('model is independent of cover and text — symmetric distribution', () => {
    for (const model of ['A', 'C']) {
      const fr0 = VALID_MODEL_CODES.some((c) => {
        const p = parseGFModelCode(c)
        return p?.model === model && p.cover === '0' && p.text === 'FR'
      })
      const hf0 = VALID_MODEL_CODES.some((c) => {
        const p = parseGFModelCode(c)
        return p?.model === model && p.cover === '0' && p.text === 'HF'
      })
      const fr2 = VALID_MODEL_CODES.some((c) => {
        const p = parseGFModelCode(c)
        return p?.model === model && p.cover === '2' && p.text === 'FR'
      })
      expect(fr0).toBe(true)
      expect(hf0).toBe(true)
      expect(fr2).toBe(true)
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseGFModelCode(code)).not.toBeNull()
    }
  })
})

// ─────────────────────────────────────────────────────────────
// isValidGFCombination
// ─────────────────────────────────────────────────────────────

describe('isValidGFCombination', () => {
  it('all 6 VALID_MODEL_CODES pass validation', () => {
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
})

// ─────────────────────────────────────────────────────────────
// getValidGFOptionsForStep
// ─────────────────────────────────────────────────────────────

describe('getValidGFOptionsForStep', () => {
  it('returns both models when nothing selected', () => {
    const valid = getValidGFOptionsForStep('model', {})
    expect(valid).toContain('A')
    expect(valid).toContain('C')
  })

  it('language always returns only EN', () => {
    expect(getValidGFOptionsForStep('language', {})).toEqual(['EN'])
  })

  it('cover 2 restricts text to FR only', () => {
    const valid = getValidGFOptionsForStep('text', { cover: '2' })
    expect(valid).toEqual(['FR'])
  })

  it('cover 0 allows both FR and HF texts', () => {
    const valid = getValidGFOptionsForStep('text', { cover: '0' })
    expect(valid).toContain('FR')
    expect(valid).toContain('HF')
  })

  it('HF text restricts cover to 0 only', () => {
    const valid = getValidGFOptionsForStep('cover', { text: 'HF' })
    expect(valid).toEqual(['0'])
  })

  it('FR text allows both covers', () => {
    const valid = getValidGFOptionsForStep('cover', { text: 'FR' })
    expect(valid).toContain('0')
    expect(valid).toContain('2')
  })

  it('model does not restrict cover or text — model A and C symmetric', () => {
    for (const model of ['A', 'C']) {
      const coverValid = getValidGFOptionsForStep('cover', { model })
      const textValid = getValidGFOptionsForStep('text', { model })
      expect(coverValid).toContain('0')
      expect(coverValid).toContain('2')
      expect(textValid).toContain('FR')
      expect(textValid).toContain('HF')
    }
  })
})

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe('GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS)

  it('blocks HF text when cover is 2', () => {
    expect(engine.checkOptionAvailability('text', 'HF', { cover: '2' }).available).toBe(
      false,
    )
  })

  it('allows FR text when cover is 2', () => {
    expect(engine.checkOptionAvailability('text', 'FR', { cover: '2' }).available).toBe(
      true,
    )
  })

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

  it('model does not restrict cover', () => {
    for (const model of ['A', 'C']) {
      expect(engine.checkOptionAvailability('cover', '0', { model }).available).toBe(true)
      expect(engine.checkOptionAvailability('cover', '2', { model }).available).toBe(true)
    }
  })

  it('model does not restrict text', () => {
    for (const model of ['A', 'C']) {
      expect(engine.checkOptionAvailability('text', 'FR', { model }).available).toBe(true)
      expect(engine.checkOptionAvailability('text', 'HF', { model }).available).toBe(true)
    }
  })

  it('language always EN — no restriction from any step', () => {
    expect(
      engine.checkOptionAvailability('language', 'EN', { model: 'A' }).available,
    ).toBe(true)
    expect(
      engine.checkOptionAvailability('language', 'EN', { cover: '2' }).available,
    ).toBe(true)
    expect(
      engine.checkOptionAvailability('language', 'EN', { text: 'HF' }).available,
    ).toBe(true)
  })

  it('constraint engine modelId matches', () => {
    expect(GF_FIRE_ALARM_PUSH_BUTTON_CONSTRAINTS.modelId).toBe(
      'gf-fire-alarm-push-button',
    )
  })
})

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

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

  it('all 6 valid codes generated from parsed configurations', () => {
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

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — gfFireAlarmPushButton
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

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

  it('language step has only one option — EN', () => {
    const langStep = gfFireAlarmPushButtonModel.steps.find((s) => s.id === 'language')!
    expect(langStep.options).toHaveLength(1)
    expect(langStep.options[0].id).toBe('EN')
  })

  it('text step has exactly 2 options — FR and HF', () => {
    const textStep = gfFireAlarmPushButtonModel.steps.find((s) => s.id === 'text')!
    const ids = textStep.options.map((o) => o.id)
    expect(ids).toEqual(['FR', 'HF'])
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
