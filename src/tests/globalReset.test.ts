import { describe, it, expect } from 'vitest'
import {
  buildGLRModelCode,
  parseGLRModelCode,
  isValidGLRCombination,
  getValidGLROptionsForStep,
  VALID_MODEL_CODES,
  GLOBAL_RESET_CONSTRAINTS,
} from '@entities/product/rules/globalResetRules'
import { globalResetModel } from '@entities/product/models/globalReset'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules'
import type { Configuration } from '@shared/types'

// ─────────────────────────────────────────────────────────────
// buildGLRModelCode
// ─────────────────────────────────────────────────────────────

describe('buildGLRModelCode', () => {
  it('builds GLR001ZA-EN correctly', () => {
    expect(
      buildGLRModelCode({ colour: '0', cover: '01', text: 'ZA', language: 'EN' }),
    ).toBe('GLR001ZA-EN')
  })

  it('builds GLR101RM-EN correctly', () => {
    expect(
      buildGLRModelCode({ colour: '1', cover: '01', text: 'RM', language: 'EN' }),
    ).toBe('GLR101RM-EN')
  })

  it('builds GLR401EV-EN correctly', () => {
    expect(
      buildGLRModelCode({ colour: '4', cover: '01', text: 'EV', language: 'EN' }),
    ).toBe('GLR401EV-EN')
  })

  it('cover 01 is two characters — GLR{1}{2}{2}-{2}', () => {
    const code = buildGLRModelCode({
      colour: '2',
      cover: '01',
      text: 'ZA',
      language: 'EN',
    })
    expect(code).toBe('GLR201ZA-EN')
    expect(code?.startsWith('GLR2')).toBe(true)
  })

  it('returns null when any field is missing', () => {
    expect(buildGLRModelCode({ colour: '0', cover: '01', text: 'ZA' })).toBeNull()
    expect(buildGLRModelCode({ colour: '0', cover: '01', language: 'EN' })).toBeNull()
    expect(buildGLRModelCode({ colour: '0', text: 'ZA', language: 'EN' })).toBeNull()
    expect(buildGLRModelCode({ cover: '01', text: 'ZA', language: 'EN' })).toBeNull()
    expect(buildGLRModelCode({})).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// parseGLRModelCode
// ─────────────────────────────────────────────────────────────

describe('parseGLRModelCode', () => {
  it('parses GLR001ZA-EN correctly', () => {
    expect(parseGLRModelCode('GLR001ZA-EN')).toEqual({
      colour: '0',
      cover: '01',
      text: 'ZA',
      language: 'EN',
    })
  })

  it('parses GLR401LD-EN correctly', () => {
    expect(parseGLRModelCode('GLR401LD-EN')).toEqual({
      colour: '4',
      cover: '01',
      text: 'LD',
      language: 'EN',
    })
  })

  it('cover always parses as 01', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseGLRModelCode(code)
      expect(parsed?.cover).toBe('01')
    }
  })

  it('language always parses as EN', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseGLRModelCode(code)
      expect(parsed?.language).toBe('EN')
    }
  })

  it('returns null for invalid format', () => {
    expect(parseGLRModelCode('INVALID')).toBeNull()
    expect(parseGLRModelCode('GLR01ZA-EN')).toBeNull()
    expect(parseGLRModelCode('GLR001ZA')).toBeNull()
    expect(parseGLRModelCode('GLR001Z-EN')).toBeNull()
    expect(parseGLRModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseGLRModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildGLRModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 13 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(13)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(13)
  })

  it('colour distribution: 0→1, 1→3, 2→4, 3→1, 4→4', () => {
    for (const [colour, count] of [
      ['0', 1],
      ['1', 3],
      ['2', 4],
      ['3', 1],
      ['4', 4],
    ] as const) {
      const filtered = VALID_MODEL_CODES.filter(
        (c) => parseGLRModelCode(c)?.colour === colour,
      )
      expect(filtered.length).toBe(count)
    }
  })

  it('ZA text valid for colours 0, 2, 3, 4 — not for 1', () => {
    const zaCodes = VALID_MODEL_CODES.filter((c) => parseGLRModelCode(c)?.text === 'ZA')
    const colours = zaCodes.map((c) => parseGLRModelCode(c)?.colour)
    expect(colours).toContain('0')
    expect(colours).toContain('2')
    expect(colours).toContain('3')
    expect(colours).toContain('4')
    expect(colours).not.toContain('1')
  })

  it('RM text only valid with colour 1', () => {
    const rmCodes = VALID_MODEL_CODES.filter((c) => parseGLRModelCode(c)?.text === 'RM')
    expect(rmCodes).toHaveLength(1)
    expect(parseGLRModelCode(rmCodes[0])?.colour).toBe('1')
  })

  it('EV text only valid with colour 4', () => {
    const evCodes = VALID_MODEL_CODES.filter((c) => parseGLRModelCode(c)?.text === 'EV')
    expect(evCodes).toHaveLength(1)
    expect(parseGLRModelCode(evCodes[0])?.colour).toBe('4')
  })

  it('LD text only valid with colour 4', () => {
    const ldCodes = VALID_MODEL_CODES.filter((c) => parseGLRModelCode(c)?.text === 'LD')
    expect(ldCodes).toHaveLength(1)
    expect(parseGLRModelCode(ldCodes[0])?.colour).toBe('4')
  })

  it('NT and PS texts only valid with colour 2', () => {
    for (const text of ['NT', 'PS']) {
      const textCodes = VALID_MODEL_CODES.filter(
        (c) => parseGLRModelCode(c)?.text === text,
      )
      expect(textCodes).toHaveLength(1)
      expect(parseGLRModelCode(textCodes[0])?.colour).toBe('2')
    }
  })

  it('colour 0 and 3 only support ZA text', () => {
    for (const colour of ['0', '3']) {
      const colourCodes = VALID_MODEL_CODES.filter(
        (c) => parseGLRModelCode(c)?.colour === colour,
      )
      expect(colourCodes).toHaveLength(1)
      expect(parseGLRModelCode(colourCodes[0])?.text).toBe('ZA')
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseGLRModelCode(code)).not.toBeNull()
    }
  })
})

// ─────────────────────────────────────────────────────────────
// isValidGLRCombination
// ─────────────────────────────────────────────────────────────

describe('isValidGLRCombination', () => {
  it('all 13 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseGLRModelCode(code)!
      expect(isValidGLRCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidGLRCombination({})).toEqual({ valid: true })
    expect(isValidGLRCombination({ colour: '0' })).toEqual({ valid: true })
    expect(isValidGLRCombination({ colour: '0', cover: '01', text: 'ZA' })).toEqual({
      valid: true,
    })
  })

  it('rejects ZA text with colour 1 — not in allowlist', () => {
    const result = isValidGLRCombination({
      colour: '1',
      cover: '01',
      text: 'ZA',
      language: 'EN',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toContain('GLR101ZA-EN')
  })

  it('rejects RM text with colour 0', () => {
    const result = isValidGLRCombination({
      colour: '0',
      cover: '01',
      text: 'RM',
      language: 'EN',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects EV text with any colour except 4', () => {
    for (const colour of ['0', '1', '2', '3']) {
      const result = isValidGLRCombination({
        colour,
        cover: '01',
        text: 'EV',
        language: 'EN',
      })
      expect(result.valid).toBe(false)
    }
  })

  it('rejects NT text with any colour except 2', () => {
    for (const colour of ['0', '1', '3', '4']) {
      const result = isValidGLRCombination({
        colour,
        cover: '01',
        text: 'NT',
        language: 'EN',
      })
      expect(result.valid).toBe(false)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// getValidGLROptionsForStep
// ─────────────────────────────────────────────────────────────

describe('getValidGLROptionsForStep', () => {
  it('cover always returns only 01', () => {
    expect(getValidGLROptionsForStep('cover', {})).toEqual(['01'])
    expect(getValidGLROptionsForStep('cover', { colour: '4' })).toEqual(['01'])
  })

  it('language always returns only EN', () => {
    expect(getValidGLROptionsForStep('language', {})).toEqual(['EN'])
    expect(getValidGLROptionsForStep('language', { colour: '2', text: 'ZA' })).toEqual([
      'EN',
    ])
  })

  it('colour 0 only allows ZA text', () => {
    const valid = getValidGLROptionsForStep('text', { colour: '0' })
    expect(valid).toEqual(['ZA'])
  })

  it('colour 1 allows EM, EX, RM but not ZA', () => {
    const valid = getValidGLROptionsForStep('text', { colour: '1' })
    expect(valid).toContain('EM')
    expect(valid).toContain('EX')
    expect(valid).toContain('RM')
    expect(valid).not.toContain('ZA')
  })

  it('colour 2 allows EX, NT, PS, ZA', () => {
    const valid = getValidGLROptionsForStep('text', { colour: '2' })
    expect(valid).toContain('EX')
    expect(valid).toContain('NT')
    expect(valid).toContain('PS')
    expect(valid).toContain('ZA')
  })

  it('colour 3 only allows ZA text', () => {
    const valid = getValidGLROptionsForStep('text', { colour: '3' })
    expect(valid).toEqual(['ZA'])
  })

  it('colour 4 allows EM, EV, LD, ZA', () => {
    const valid = getValidGLROptionsForStep('text', { colour: '4' })
    expect(valid).toContain('EM')
    expect(valid).toContain('EV')
    expect(valid).toContain('LD')
    expect(valid).toContain('ZA')
  })

  it('EV text only valid with colour 4', () => {
    const valid = getValidGLROptionsForStep('colour', { text: 'EV' })
    expect(valid).toEqual(['4'])
  })

  it('LD text only valid with colour 4', () => {
    const valid = getValidGLROptionsForStep('colour', { text: 'LD' })
    expect(valid).toEqual(['4'])
  })

  it('RM text only valid with colour 1', () => {
    const valid = getValidGLROptionsForStep('colour', { text: 'RM' })
    expect(valid).toEqual(['1'])
  })

  it('ZA text valid with colours 0, 2, 3, 4 — not 1', () => {
    const valid = getValidGLROptionsForStep('colour', { text: 'ZA' })
    expect(valid).toContain('0')
    expect(valid).toContain('2')
    expect(valid).toContain('3')
    expect(valid).toContain('4')
    expect(valid).not.toContain('1')
  })
})

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe('GLOBAL_RESET_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(GLOBAL_RESET_CONSTRAINTS)

  it('only colour↔text constraints — cover and language unconstrained', () => {
    expect(GLOBAL_RESET_CONSTRAINTS.constraints).toHaveLength(2)
    const steps = GLOBAL_RESET_CONSTRAINTS.constraints.map((c) => [
      c.sourceStep,
      c.targetStep,
    ])
    expect(steps).toContainEqual(['colour', 'text'])
    expect(steps).toContainEqual(['text', 'colour'])
  })

  it('blocks ZA text when colour is 1', () => {
    expect(engine.checkOptionAvailability('text', 'ZA', { colour: '1' }).available).toBe(
      false,
    )
  })

  it('allows ZA text when colour is 0, 2, 3, 4', () => {
    for (const colour of ['0', '2', '3', '4']) {
      expect(engine.checkOptionAvailability('text', 'ZA', { colour }).available).toBe(
        true,
      )
    }
  })

  it('blocks RM text when colour is not 1', () => {
    for (const colour of ['0', '2', '3', '4']) {
      expect(engine.checkOptionAvailability('text', 'RM', { colour }).available).toBe(
        false,
      )
    }
  })

  it('allows RM text when colour is 1', () => {
    expect(engine.checkOptionAvailability('text', 'RM', { colour: '1' }).available).toBe(
      true,
    )
  })

  it('blocks EV text when colour is not 4', () => {
    for (const colour of ['0', '1', '2', '3']) {
      expect(engine.checkOptionAvailability('text', 'EV', { colour }).available).toBe(
        false,
      )
    }
  })

  it('blocks colour 1 when text is EV, LD, NT, or PS', () => {
    for (const text of ['EV', 'LD', 'NT', 'PS']) {
      expect(engine.checkOptionAvailability('colour', '1', { text }).available).toBe(
        false,
      )
    }
  })

  it('blocks colour 0 when text is EM, EX, RM, NT, PS, EV, or LD', () => {
    for (const text of ['EM', 'EX', 'RM', 'NT', 'PS', 'EV', 'LD']) {
      expect(engine.checkOptionAvailability('colour', '0', { text }).available).toBe(
        false,
      )
    }
  })

  it('constraint engine modelId matches', () => {
    expect(GLOBAL_RESET_CONSTRAINTS.modelId).toBe('global-reset')
  })
})

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe('buildProductModel — globalReset', () => {
  it('builds GLR001ZA-EN correctly', () => {
    const config: Configuration = { colour: '0', cover: '01', text: 'ZA', language: 'EN' }
    const result = buildProductModel(config, globalResetModel)
    expect(result.fullCode).toBe('GLR001ZA-EN')
    expect(result.isComplete).toBe(true)
  })

  it('builds GLR401EV-EN correctly', () => {
    const config: Configuration = { colour: '4', cover: '01', text: 'EV', language: 'EN' }
    const result = buildProductModel(config, globalResetModel)
    expect(result.fullCode).toBe('GLR401EV-EN')
    expect(result.isComplete).toBe(true)
  })

  it('builds GLR201NT-EN correctly', () => {
    const config: Configuration = { colour: '2', cover: '01', text: 'NT', language: 'EN' }
    const result = buildProductModel(config, globalResetModel)
    expect(result.fullCode).toBe('GLR201NT-EN')
    expect(result.isComplete).toBe(true)
  })

  it('baseCode is GLR', () => {
    const config: Configuration = {
      colour: null,
      cover: null,
      text: null,
      language: null,
    }
    const result = buildProductModel(config, globalResetModel)
    expect(result.baseCode).toBe('GLR')
  })

  it('only language uses dash separator', () => {
    const config: Configuration = { colour: '1', cover: '01', text: 'EM', language: 'EN' }
    const result = buildProductModel(config, globalResetModel)
    expect(result.fullCode).toBe('GLR101EM-EN')
    expect(result.fullCode.split('-')).toHaveLength(2)
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = { colour: '2', cover: null, text: null, language: null }
    const result = buildProductModel(config, globalResetModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('cover')
    expect(result.missingSteps).toContain('text')
    expect(result.missingSteps).toContain('language')
  })

  it('all 13 valid codes generated from parsed configurations', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseGLRModelCode(code)!
      const config: Configuration = {
        colour: parsed.colour ?? null,
        cover: parsed.cover ?? null,
        text: parsed.text ?? null,
        language: parsed.language ?? null,
      }
      const result = buildProductModel(config, globalResetModel)
      if (validSet.has(result.fullCode)) matchCount++
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — globalReset
// ─────────────────────────────────────────────────────────────

describe('isConfigurationComplete — globalReset', () => {
  it('returns true when all 4 steps selected', () => {
    const config: Configuration = { colour: '0', cover: '01', text: 'ZA', language: 'EN' }
    expect(isConfigurationComplete(globalResetModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(globalResetModel, {
        colour: '0',
        cover: '01',
        text: 'ZA',
        language: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = { colour: '1', cover: '01', text: null, language: null }
    const missing = getMissingRequiredSteps(globalResetModel, config)
    expect(missing).toContain('text')
    expect(missing).toContain('language')
    expect(missing).not.toContain('colour')
    expect(missing).not.toContain('cover')
  })

  it('getCompletionPercentage for 4-step model', () => {
    expect(
      getCompletionPercentage(globalResetModel, {
        colour: null,
        cover: null,
        text: null,
        language: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(globalResetModel, {
        colour: '0',
        cover: null,
        text: null,
        language: null,
      }),
    ).toBe(25)

    expect(
      getCompletionPercentage(globalResetModel, {
        colour: '0',
        cover: '01',
        text: null,
        language: null,
      }),
    ).toBe(50)

    expect(
      getCompletionPercentage(globalResetModel, {
        colour: '0',
        cover: '01',
        text: 'ZA',
        language: null,
      }),
    ).toBe(75)

    expect(
      getCompletionPercentage(globalResetModel, {
        colour: '0',
        cover: '01',
        text: 'ZA',
        language: 'EN',
      }),
    ).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe('globalResetModel definition', () => {
  it('has correct model id and slug', () => {
    expect(globalResetModel.id).toBe('global-reset')
    expect(globalResetModel.slug).toBe('global-reset')
  })

  it('cover step has only one option — 01', () => {
    const coverStep = globalResetModel.steps.find((s) => s.id === 'cover')!
    expect(coverStep.options).toHaveLength(1)
    expect(coverStep.options[0].id).toBe('01')
  })

  it('language step has only one option — EN', () => {
    const langStep = globalResetModel.steps.find((s) => s.id === 'language')!
    expect(langStep.options).toHaveLength(1)
    expect(langStep.options[0].id).toBe('EN')
  })

  it('text step has 8 enabled options', () => {
    const textStep = globalResetModel.steps.find((s) => s.id === 'text')!
    expect(textStep.options).toHaveLength(8)
  })

  it('text step does not include disabled options AB, PO, ES, XT, HV, PX', () => {
    const textStep = globalResetModel.steps.find((s) => s.id === 'text')!
    const ids = textStep.options.map((o) => o.id)
    for (const disabled of ['AB', 'PO', 'ES', 'XT', 'HV', 'PX']) {
      expect(ids).not.toContain(disabled)
    }
  })

  it('colour step has 5 options — 0 through 4', () => {
    const colourStep = globalResetModel.steps.find((s) => s.id === 'colour')!
    const ids = colourStep.options.map((o) => o.id)
    expect(ids).toEqual(['0', '1', '2', '3', '4'])
  })

  it('baseCode is GLR', () => {
    expect(globalResetModel.productModelSchema.baseCode).toBe('GLR')
  })

  it('all steps are required', () => {
    for (const step of globalResetModel.steps) {
      expect(step.required).toBe(true)
    }
  })

  it('only language uses dash separator', () => {
    const { separatorMap } = globalResetModel.productModelSchema
    expect(separatorMap?.language).toBe('-')
    expect(separatorMap?.colour).toBe('')
    expect(separatorMap?.cover).toBe('')
    expect(separatorMap?.text).toBe('')
  })
})
