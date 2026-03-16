import { describe, it, expect } from 'vitest'
import {
  buildIPBModelCode,
  parseIPBModelCode,
  isValidIPBCombination,
  getValidIPBOptionsForStep,
  VALID_MODEL_CODES,
  INDOOR_PUSH_BUTTONS_CONSTRAINTS,
} from '@entities/product/rules/indoorPushButtonsRules'
import { indoorPushButtonsModel } from '@entities/product/models/indoorPushButtons'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

// ─────────────────────────────────────────────────────────────
// buildIPBModelCode
// ─────────────────────────────────────────────────────────────

describe('buildIPBModelCode', () => {
  it('builds SAK label code — no suffix', () => {
    expect(
      buildIPBModelCode({
        colour: '1',
        buttonColour: 'R',
        pushButtonType: '1',
        electricalArrangements: '4',
        label: 'SAK',
      }),
    ).toBe('SS3-1R14')
  })

  it('builds CL label code — appends -CL', () => {
    expect(
      buildIPBModelCode({
        colour: '1',
        buttonColour: 'R',
        pushButtonType: '1',
        electricalArrangements: '4',
        label: 'CL',
      }),
    ).toBe('SS3-1R14-CL')
  })

  it('builds pneumatic code correctly', () => {
    expect(
      buildIPBModelCode({
        colour: '3',
        buttonColour: 'G',
        pushButtonType: '6',
        electricalArrangements: '0',
        label: 'SAK',
      }),
    ).toBe('SS3-3G60')
  })

  it('builds orange housing orange button correctly', () => {
    expect(
      buildIPBModelCode({
        colour: 'E',
        buttonColour: 'E',
        pushButtonType: '0',
        electricalArrangements: '4',
        label: 'SAK',
      }),
    ).toBe('SS3-EE04')
  })

  it('returns null when any field is missing', () => {
    expect(
      buildIPBModelCode({
        colour: '1',
        buttonColour: 'R',
        pushButtonType: '1',
        electricalArrangements: '4',
      }),
    ).toBeNull()
    expect(
      buildIPBModelCode({
        colour: '1',
        buttonColour: 'R',
        pushButtonType: '1',
        label: 'SAK',
      }),
    ).toBeNull()
    expect(buildIPBModelCode({})).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// parseIPBModelCode
// ─────────────────────────────────────────────────────────────

describe('parseIPBModelCode', () => {
  it('parses SAK code — no -CL suffix', () => {
    expect(parseIPBModelCode('SS3-1R14')).toEqual({
      colour: '1',
      buttonColour: 'R',
      pushButtonType: '1',
      electricalArrangements: '4',
      label: 'SAK',
    })
  })

  it('parses CL code — with -CL suffix', () => {
    expect(parseIPBModelCode('SS3-1R14-CL')).toEqual({
      colour: '1',
      buttonColour: 'R',
      pushButtonType: '1',
      electricalArrangements: '4',
      label: 'CL',
    })
  })

  it('parses pneumatic code correctly', () => {
    expect(parseIPBModelCode('SS3-3G60')).toEqual({
      colour: '3',
      buttonColour: 'G',
      pushButtonType: '6',
      electricalArrangements: '0',
      label: 'SAK',
    })
  })

  it('parses orange housing correctly', () => {
    expect(parseIPBModelCode('SS3-EE04')).toEqual({
      colour: 'E',
      buttonColour: 'E',
      pushButtonType: '0',
      electricalArrangements: '4',
      label: 'SAK',
    })
  })

  it('returns null for invalid format', () => {
    expect(parseIPBModelCode('INVALID')).toBeNull()
    expect(parseIPBModelCode('SS3-1R1')).toBeNull()
    expect(parseIPBModelCode('SS3-1R144')).toBeNull()
    expect(parseIPBModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseIPBModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildIPBModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 59 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(59)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(59)
  })

  it('pushButtonType distribution: 0→24, 1→26, 6→9', () => {
    const parse = (c: string) => parseIPBModelCode(c)
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.pushButtonType === '0').length).toBe(
      24,
    )
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.pushButtonType === '1').length).toBe(
      26,
    )
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.pushButtonType === '6').length).toBe(
      9,
    )
  })

  it('27 CL and 32 SAK codes', () => {
    const cl = VALID_MODEL_CODES.filter((c) => c.endsWith('-CL'))
    const sak = VALID_MODEL_CODES.filter((c) => !c.endsWith('-CL'))
    expect(cl.length).toBe(27)
    expect(sak.length).toBe(32)
  })

  it('pneumatic (pbt=6) always has electricalArrangements=0', () => {
    const pbt6 = VALID_MODEL_CODES.filter(
      (c) => parseIPBModelCode(c)?.pushButtonType === '6',
    )
    for (const code of pbt6) {
      expect(parseIPBModelCode(code)?.electricalArrangements).toBe('0')
    }
  })

  it('key-to-reset (pbt=0) and momentary (pbt=1) always have electricalArrangements=4', () => {
    for (const pbt of ['0', '1']) {
      const codes = VALID_MODEL_CODES.filter(
        (c) => parseIPBModelCode(c)?.pushButtonType === pbt,
      )
      for (const code of codes) {
        expect(parseIPBModelCode(code)?.electricalArrangements).toBe('4')
      }
    }
  })

  it('colour 1 (red housing) and E (orange) never have pbt=6', () => {
    for (const colour of ['1', 'E']) {
      const codes = VALID_MODEL_CODES.filter(
        (c) => parseIPBModelCode(c)?.colour === colour,
      )
      for (const code of codes) {
        expect(parseIPBModelCode(code)?.pushButtonType).not.toBe('6')
      }
    }
  })

  it('colour 1 and E never have electricalArrangements=0', () => {
    for (const colour of ['1', 'E']) {
      const codes = VALID_MODEL_CODES.filter(
        (c) => parseIPBModelCode(c)?.colour === colour,
      )
      for (const code of codes) {
        expect(parseIPBModelCode(code)?.electricalArrangements).not.toBe('0')
      }
    }
  })

  it('orange housing only allows orange button', () => {
    const eCodes = VALID_MODEL_CODES.filter((c) => parseIPBModelCode(c)?.colour === 'E')
    for (const code of eCodes) {
      expect(parseIPBModelCode(code)?.buttonColour).toBe('E')
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseIPBModelCode(code)).not.toBeNull()
    }
  })
})

// ─────────────────────────────────────────────────────────────
// isValidIPBCombination
// ─────────────────────────────────────────────────────────────

describe('isValidIPBCombination', () => {
  it('all 59 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseIPBModelCode(code)!
      expect(isValidIPBCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidIPBCombination({})).toEqual({ valid: true })
    expect(isValidIPBCombination({ colour: '1' })).toEqual({ valid: true })
  })

  it('rejects pbt=6 with colour=1 — not in allowlist', () => {
    const result = isValidIPBCombination({
      colour: '1',
      buttonColour: 'R',
      pushButtonType: '6',
      electricalArrangements: '0',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toContain('SS3-1R60')
  })

  it('rejects pbt=6 with colour=E — not in allowlist', () => {
    const result = isValidIPBCombination({
      colour: 'E',
      buttonColour: 'E',
      pushButtonType: '6',
      electricalArrangements: '0',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects pbt=1 with electricalArrangements=0 — pbt=1 only with ea=4', () => {
    const result = isValidIPBCombination({
      colour: '3',
      buttonColour: 'G',
      pushButtonType: '1',
      electricalArrangements: '0',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects pbt=6 with electricalArrangements=4 — pneumatic only with ea=0', () => {
    const result = isValidIPBCombination({
      colour: '3',
      buttonColour: 'G',
      pushButtonType: '6',
      electricalArrangements: '4',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects colour=1 with buttonColour=G — not in allowlist', () => {
    const result = isValidIPBCombination({
      colour: '1',
      buttonColour: 'G',
      pushButtonType: '1',
      electricalArrangements: '4',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// getValidIPBOptionsForStep
// ─────────────────────────────────────────────────────────────

describe('getValidIPBOptionsForStep', () => {
  it('colour=E only allows buttonColour=E', () => {
    const valid = getValidIPBOptionsForStep('buttonColour', { colour: 'E' })
    expect(valid).toEqual(['E'])
  })

  it('colour=1 only allows buttonColour R or W', () => {
    const valid = getValidIPBOptionsForStep('buttonColour', { colour: '1' })
    expect(valid).toContain('R')
    expect(valid).toContain('W')
    expect(valid).not.toContain('G')
    expect(valid).not.toContain('B')
    expect(valid).not.toContain('Y')
    expect(valid).not.toContain('E')
  })

  it('pbt=6 (pneumatic) forces electricalArrangements=0', () => {
    const valid = getValidIPBOptionsForStep('electricalArrangements', {
      pushButtonType: '6',
    })
    expect(valid).toEqual(['0'])
  })

  it('pbt=0 and pbt=1 force electricalArrangements=4', () => {
    for (const pbt of ['0', '1']) {
      const valid = getValidIPBOptionsForStep('electricalArrangements', {
        pushButtonType: pbt,
      })
      expect(valid).toEqual(['4'])
    }
  })

  it('electricalArrangements=0 only allows pbt=6', () => {
    const valid = getValidIPBOptionsForStep('pushButtonType', {
      electricalArrangements: '0',
    })
    expect(valid).toEqual(['6'])
  })

  it('electricalArrangements=0 excludes colours 1 and E', () => {
    const valid = getValidIPBOptionsForStep('colour', { electricalArrangements: '0' })
    expect(valid).not.toContain('1')
    expect(valid).not.toContain('E')
    expect(valid).toContain('3')
    expect(valid).toContain('5')
    expect(valid).toContain('7')
    expect(valid).toContain('9')
  })

  it('both label options always available regardless of other steps', () => {
    const combinations = [
      { colour: '1' },
      { colour: 'E' },
      { pushButtonType: '6' },
      { pushButtonType: '0' },
      { electricalArrangements: '0' },
    ]
    for (const sel of combinations) {
      const valid = getValidIPBOptionsForStep('label', sel)
      expect(valid).toContain('CL')
      expect(valid).toContain('SAK')
    }
  })

  it('buttonColour=B and E not available with pbt=6 or ea=0', () => {
    const pbt6Valid = getValidIPBOptionsForStep('buttonColour', { pushButtonType: '6' })
    expect(pbt6Valid).not.toContain('B')
    expect(pbt6Valid).not.toContain('E')

    const ea0Valid = getValidIPBOptionsForStep('buttonColour', {
      electricalArrangements: '0',
    })
    expect(ea0Valid).not.toContain('B')
    expect(ea0Valid).not.toContain('E')
  })
})

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe('INDOOR_PUSH_BUTTONS_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(INDOOR_PUSH_BUTTONS_CONSTRAINTS)

  it('blocks pbt=6 when colour=1', () => {
    expect(
      engine.checkOptionAvailability('pushButtonType', '6', { colour: '1' }).available,
    ).toBe(false)
  })

  it('blocks pbt=6 when colour=E', () => {
    expect(
      engine.checkOptionAvailability('pushButtonType', '6', { colour: 'E' }).available,
    ).toBe(false)
  })

  it('allows pbt=6 when colour=3, 5, 7, or 9', () => {
    for (const colour of ['3', '5', '7', '9']) {
      expect(
        engine.checkOptionAvailability('pushButtonType', '6', { colour }).available,
      ).toBe(true)
    }
  })

  it('blocks ea=0 when pbt=0 or pbt=1', () => {
    for (const pbt of ['0', '1']) {
      expect(
        engine.checkOptionAvailability('electricalArrangements', '0', {
          pushButtonType: pbt,
        }).available,
      ).toBe(false)
    }
  })

  it('blocks ea=4 when pbt=6', () => {
    expect(
      engine.checkOptionAvailability('electricalArrangements', '4', {
        pushButtonType: '6',
      }).available,
    ).toBe(false)
  })

  it('blocks ea=0 when colour=1 or E', () => {
    for (const colour of ['1', 'E']) {
      expect(
        engine.checkOptionAvailability('electricalArrangements', '0', { colour })
          .available,
      ).toBe(false)
    }
  })

  it('blocks buttonColour=G when colour=1', () => {
    expect(
      engine.checkOptionAvailability('buttonColour', 'G', { colour: '1' }).available,
    ).toBe(false)
  })

  it('blocks buttonColour=E when colour is not E', () => {
    for (const colour of ['1', '3', '5', '7', '9']) {
      expect(
        engine.checkOptionAvailability('buttonColour', 'E', { colour }).available,
      ).toBe(false)
    }
  })

  it('constraint engine modelId matches', () => {
    expect(INDOOR_PUSH_BUTTONS_CONSTRAINTS.modelId).toBe('indoor-push-buttons')
  })
})

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe('buildProductModel — indoorPushButtons', () => {
  it('builds SS3-1R14 correctly — SAK label, no suffix', () => {
    const config: Configuration = {
      colour: '1',
      buttonColour: 'R',
      pushButtonType: '1',
      electricalArrangements: '4',
      label: 'SAK',
    }
    const result = buildProductModel(config, indoorPushButtonsModel)
    expect(result.fullCode).toBe('SS3-1R14')
    expect(result.isComplete).toBe(true)
  })

  it('builds SS3-1R14-CL correctly — CL label with dash separator', () => {
    const config: Configuration = {
      colour: '1',
      buttonColour: 'R',
      pushButtonType: '1',
      electricalArrangements: '4',
      label: 'CL',
    }
    const result = buildProductModel(config, indoorPushButtonsModel)
    expect(result.fullCode).toBe('SS3-1R14-CL')
    expect(result.isComplete).toBe(true)
  })

  it('builds SS3-3G60 correctly — pneumatic', () => {
    const config: Configuration = {
      colour: '3',
      buttonColour: 'G',
      pushButtonType: '6',
      electricalArrangements: '0',
      label: 'SAK',
    }
    const result = buildProductModel(config, indoorPushButtonsModel)
    expect(result.fullCode).toBe('SS3-3G60')
    expect(result.isComplete).toBe(true)
  })

  it('builds SS3-9R60-CL correctly', () => {
    const config: Configuration = {
      colour: '9',
      buttonColour: 'R',
      pushButtonType: '6',
      electricalArrangements: '0',
      label: 'CL',
    }
    const result = buildProductModel(config, indoorPushButtonsModel)
    expect(result.fullCode).toBe('SS3-9R60-CL')
    expect(result.isComplete).toBe(true)
  })

  it('SAK label has empty code — no suffix, no extra dash', () => {
    const config: Configuration = {
      colour: '7',
      buttonColour: 'W',
      pushButtonType: '0',
      electricalArrangements: '4',
      label: 'SAK',
    }
    const result = buildProductModel(config, indoorPushButtonsModel)
    expect(result.fullCode).toBe('SS3-7W04')
    expect(result.fullCode).not.toContain('SAK')
    expect(result.fullCode).not.toMatch(/-$/)
  })

  it('baseCode is SS3-', () => {
    const config: Configuration = {
      colour: null,
      buttonColour: null,
      pushButtonType: null,
      electricalArrangements: null,
      label: null,
    }
    const result = buildProductModel(config, indoorPushButtonsModel)
    expect(result.baseCode).toBe('SS3-')
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = {
      colour: '1',
      buttonColour: 'R',
      pushButtonType: null,
      electricalArrangements: null,
      label: null,
    }
    const result = buildProductModel(config, indoorPushButtonsModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('pushButtonType')
    expect(result.missingSteps).toContain('electricalArrangements')
    expect(result.missingSteps).toContain('label')
  })

  it('all 59 valid codes generated from parsed configurations', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseIPBModelCode(code)!
      const config: Configuration = {
        colour: parsed.colour ?? null,
        buttonColour: parsed.buttonColour ?? null,
        pushButtonType: parsed.pushButtonType ?? null,
        electricalArrangements: parsed.electricalArrangements ?? null,
        label: parsed.label ?? null,
      }
      const result = buildProductModel(config, indoorPushButtonsModel)
      if (validSet.has(result.fullCode)) matchCount++
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — indoorPushButtons
// ─────────────────────────────────────────────────────────────

describe('isConfigurationComplete — indoorPushButtons', () => {
  it('returns true when all 5 steps selected', () => {
    const config: Configuration = {
      colour: '1',
      buttonColour: 'R',
      pushButtonType: '1',
      electricalArrangements: '4',
      label: 'SAK',
    }
    expect(isConfigurationComplete(indoorPushButtonsModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(indoorPushButtonsModel, {
        colour: '1',
        buttonColour: 'R',
        pushButtonType: '1',
        electricalArrangements: '4',
        label: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = {
      colour: '3',
      buttonColour: 'G',
      pushButtonType: null,
      electricalArrangements: null,
      label: null,
    }
    const missing = getMissingRequiredSteps(indoorPushButtonsModel, config)
    expect(missing).toContain('pushButtonType')
    expect(missing).toContain('electricalArrangements')
    expect(missing).toContain('label')
    expect(missing).not.toContain('colour')
    expect(missing).not.toContain('buttonColour')
  })

  it('getCompletionPercentage for 5-step model', () => {
    expect(
      getCompletionPercentage(indoorPushButtonsModel, {
        colour: null,
        buttonColour: null,
        pushButtonType: null,
        electricalArrangements: null,
        label: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(indoorPushButtonsModel, {
        colour: '1',
        buttonColour: null,
        pushButtonType: null,
        electricalArrangements: null,
        label: null,
      }),
    ).toBe(20)

    expect(
      getCompletionPercentage(indoorPushButtonsModel, {
        colour: '1',
        buttonColour: 'R',
        pushButtonType: '1',
        electricalArrangements: null,
        label: null,
      }),
    ).toBe(60)

    expect(
      getCompletionPercentage(indoorPushButtonsModel, {
        colour: '1',
        buttonColour: 'R',
        pushButtonType: '1',
        electricalArrangements: '4',
        label: 'SAK',
      }),
    ).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe('indoorPushButtonsModel definition', () => {
  it('has correct model id and slug', () => {
    expect(indoorPushButtonsModel.id).toBe('indoor-push-buttons')
    expect(indoorPushButtonsModel.slug).toBe('indoor-push-buttons')
  })

  it('has 5 steps in stepOrder', () => {
    expect(indoorPushButtonsModel.stepOrder).toEqual([
      'colour',
      'buttonColour',
      'pushButtonType',
      'electricalArrangements',
      'label',
    ])
  })

  it('all steps are required', () => {
    for (const step of indoorPushButtonsModel.steps) {
      expect(step.required).toBe(true)
    }
  })

  it('SAK label has empty code — buildProductModel skips separator', () => {
    const labelStep = indoorPushButtonsModel.steps.find((s) => s.id === 'label')!
    const sak = labelStep.options.find((o) => o.id === 'SAK')!
    expect(sak.code).toBe('')
  })

  it('CL label has code CL', () => {
    const labelStep = indoorPushButtonsModel.steps.find((s) => s.id === 'label')!
    const cl = labelStep.options.find((o) => o.id === 'CL')!
    expect(cl.code).toBe('CL')
  })

  it('label separator is dash, others have none', () => {
    const { separatorMap } = indoorPushButtonsModel.productModelSchema
    expect(separatorMap?.label).toBe('-')
    expect(separatorMap?.colour).toBe('')
    expect(separatorMap?.buttonColour).toBe('')
    expect(separatorMap?.pushButtonType).toBe('')
    expect(separatorMap?.electricalArrangements).toBe('')
  })

  it('baseCode is SS3-', () => {
    expect(indoorPushButtonsModel.productModelSchema.baseCode).toBe('SS3-')
  })
})
