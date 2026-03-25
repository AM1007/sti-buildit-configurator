import { describe, it, expect } from 'vitest'
import {
  buildKSModelCode,
  parseKSModelCode,
  isValidKSCombination,
  getValidKSOptionsForStep,
  VALID_MODEL_CODES,
  KEY_SWITCHES_CONSTRAINTS,
} from '@entities/product/rules/keySwitchesRules'
import { keySwitchesModel } from '@entities/product/models/keySwitches'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

// ─────────────────────────────────────────────────────────────
// buildKSModelCode
// ─────────────────────────────────────────────────────────────

describe('buildKSModelCode', () => {
  it('builds SAK label — no suffix', () => {
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: '2',
        electricalArrangement: '0',
        label: 'SAK',
      }),
    ).toBe('SS3-1020')
  })

  it('builds CL label — appends -CL', () => {
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: '2',
        electricalArrangement: '0',
        label: 'CL',
      }),
    ).toBe('SS3-1020-CL')
  })

  it('builds orange housing correctly — E0 colourMounting', () => {
    expect(
      buildKSModelCode({
        colourMounting: 'E0',
        switchType: '5',
        electricalArrangement: '3',
        label: 'SAK',
      }),
    ).toBe('SS3-E053')
    expect(
      buildKSModelCode({
        colourMounting: 'E0',
        switchType: '5',
        electricalArrangement: '3',
        label: 'CL',
      }),
    ).toBe('SS3-E053-CL')
  })

  it('builds SS3-1053 correctly', () => {
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: '5',
        electricalArrangement: '3',
        label: 'SAK',
      }),
    ).toBe('SS3-1053')
  })

  it('returns null when any field is missing', () => {
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: '2',
        electricalArrangement: '0',
      }),
    ).toBeNull()
    expect(
      buildKSModelCode({ colourMounting: '10', switchType: '2', label: 'SAK' }),
    ).toBeNull()
    expect(buildKSModelCode({})).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// parseKSModelCode
// ─────────────────────────────────────────────────────────────

describe('parseKSModelCode', () => {
  it('parses SS3-1020 correctly', () => {
    expect(parseKSModelCode('SS3-1020')).toEqual({
      colourMounting: '10',
      switchType: '2',
      electricalArrangement: '0',
      label: 'SAK',
    })
  })

  it('parses SS3-1020-CL correctly', () => {
    expect(parseKSModelCode('SS3-1020-CL')).toEqual({
      colourMounting: '10',
      switchType: '2',
      electricalArrangement: '0',
      label: 'CL',
    })
  })

  it('parses E0 colourMounting correctly', () => {
    expect(parseKSModelCode('SS3-E053')).toEqual({
      colourMounting: 'E0',
      switchType: '5',
      electricalArrangement: '3',
      label: 'SAK',
    })
  })

  it('parses SS3-1042 correctly', () => {
    expect(parseKSModelCode('SS3-1042')).toEqual({
      colourMounting: '10',
      switchType: '4',
      electricalArrangement: '2',
      label: 'SAK',
    })
  })

  it('returns null for invalid format', () => {
    expect(parseKSModelCode('INVALID')).toBeNull()
    expect(parseKSModelCode('SS3-102')).toBeNull()
    expect(parseKSModelCode('SS3-10200')).toBeNull()
    expect(parseKSModelCode('SS3-GG20')).toBeNull()
    expect(parseKSModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseKSModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildKSModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 49 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(49)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(49)
  })

  it('switchType distribution: 2→11, 3→17, 4→14, 5→7', () => {
    const parse = (c: string) => parseKSModelCode(c)
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.switchType === '2').length).toBe(11)
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.switchType === '3').length).toBe(17)
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.switchType === '4').length).toBe(14)
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.switchType === '5').length).toBe(7)
  })

  it('17 CL and 32 SAK codes', () => {
    expect(VALID_MODEL_CODES.filter((c) => c.endsWith('-CL')).length).toBe(17)
    expect(VALID_MODEL_CODES.filter((c) => !c.endsWith('-CL')).length).toBe(32)
  })

  it('switchType=2 always forces electricalArrangement=0', () => {
    const st2 = VALID_MODEL_CODES.filter((c) => parseKSModelCode(c)?.switchType === '2')
    for (const code of st2) {
      expect(parseKSModelCode(code)?.electricalArrangement).toBe('0')
    }
  })

  it('switchType=5 always forces electricalArrangement=3', () => {
    const st5 = VALID_MODEL_CODES.filter((c) => parseKSModelCode(c)?.switchType === '5')
    for (const code of st5) {
      expect(parseKSModelCode(code)?.electricalArrangement).toBe('3')
    }
  })

  it('E0 (orange) never has switchType=4', () => {
    const e0 = VALID_MODEL_CODES.filter(
      (c) => parseKSModelCode(c)?.colourMounting === 'E0',
    )
    for (const code of e0) {
      expect(parseKSModelCode(code)?.switchType).not.toBe('4')
    }
  })

  it('colourMounting=30 and 90 never have electricalArrangement=3', () => {
    for (const cm of ['30', '90']) {
      const codes = VALID_MODEL_CODES.filter(
        (c) => parseKSModelCode(c)?.colourMounting === cm,
      )
      for (const code of codes) {
        expect(parseKSModelCode(code)?.electricalArrangement).not.toBe('3')
      }
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseKSModelCode(code)).not.toBeNull()
    }
  })
})

// ─────────────────────────────────────────────────────────────
// isValidKSCombination
// ─────────────────────────────────────────────────────────────

describe('isValidKSCombination', () => {
  it('all 49 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseKSModelCode(code)!
      expect(isValidKSCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidKSCombination({})).toEqual({ valid: true })
    expect(isValidKSCombination({ colourMounting: '10' })).toEqual({ valid: true })
    expect(
      isValidKSCombination({
        colourMounting: '10',
        switchType: '2',
        electricalArrangement: '0',
      }),
    ).toEqual({ valid: true })
  })

  it('rejects E0 with switchType=4 — not in allowlist', () => {
    const result = isValidKSCombination({
      colourMounting: 'E0',
      switchType: '4',
      electricalArrangement: '1',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toContain('SS3-E041')
  })

  it('rejects switchType=2 with electricalArrangement=1 — st=2 only ea=0', () => {
    const result = isValidKSCombination({
      colourMounting: '10',
      switchType: '2',
      electricalArrangement: '1',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects switchType=5 with electricalArrangement=0 — st=5 only ea=3', () => {
    const result = isValidKSCombination({
      colourMounting: '10',
      switchType: '5',
      electricalArrangement: '0',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects colourMounting=30 with electricalArrangement=3', () => {
    const result = isValidKSCombination({
      colourMounting: '30',
      switchType: '5',
      electricalArrangement: '3',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects colourMounting=90 with electricalArrangement=3', () => {
    const result = isValidKSCombination({
      colourMounting: '90',
      switchType: '5',
      electricalArrangement: '3',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// getValidKSOptionsForStep
// ─────────────────────────────────────────────────────────────

describe('getValidKSOptionsForStep', () => {
  it('switchType=2 forces electricalArrangement=0', () => {
    const valid = getValidKSOptionsForStep('electricalArrangement', { switchType: '2' })
    expect(valid).toEqual(['0'])
  })

  it('switchType=5 forces electricalArrangement=3', () => {
    const valid = getValidKSOptionsForStep('electricalArrangement', { switchType: '5' })
    expect(valid).toEqual(['3'])
  })

  it('electricalArrangement=3 forces switchType=5', () => {
    const valid = getValidKSOptionsForStep('switchType', { electricalArrangement: '3' })
    expect(valid).toEqual(['5'])
  })

  it('electricalArrangement=0 allows switchType 2 and 3 only', () => {
    const valid = getValidKSOptionsForStep('switchType', { electricalArrangement: '0' })
    expect(valid).toContain('2')
    expect(valid).toContain('3')
    expect(valid).not.toContain('4')
    expect(valid).not.toContain('5')
  })

  it('E0 does not allow switchType=4', () => {
    const valid = getValidKSOptionsForStep('switchType', { colourMounting: 'E0' })
    expect(valid).not.toContain('4')
    expect(valid).toContain('2')
    expect(valid).toContain('3')
    expect(valid).toContain('5')
  })

  it('colourMounting=30 and 90 do not allow electricalArrangement=3', () => {
    for (const cm of ['30', '90']) {
      const valid = getValidKSOptionsForStep('electricalArrangement', {
        colourMounting: cm,
      })
      expect(valid).not.toContain('3')
    }
  })

  it('both label options available for all colourMounting values', () => {
    for (const cm of ['10', '30', '50', '70', '90', 'E0']) {
      const valid = getValidKSOptionsForStep('label', { colourMounting: cm })
      expect(valid).toContain('CL')
      expect(valid).toContain('SAK')
    }
  })

  it('label not constrained by switchType or electricalArrangement alone', () => {
    for (const st of ['2', '3', '4', '5']) {
      const valid = getValidKSOptionsForStep('label', { switchType: st })
      expect(valid).toContain('CL')
      expect(valid).toContain('SAK')
    }
  })
})

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe('KEY_SWITCHES_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(KEY_SWITCHES_CONSTRAINTS)

  it('blocks switchType=4 when colourMounting=E0', () => {
    expect(
      engine.checkOptionAvailability('switchType', '4', { colourMounting: 'E0' })
        .available,
    ).toBe(false)
  })

  it('allows switchType=2, 3, 5 when colourMounting=E0', () => {
    for (const st of ['2', '3', '5']) {
      expect(
        engine.checkOptionAvailability('switchType', st, { colourMounting: 'E0' })
          .available,
      ).toBe(true)
    }
  })

  it('blocks switchType=4 when colourMounting=30 or 90', () => {
    for (const cm of ['30', '90']) {
      expect(
        engine.checkOptionAvailability('switchType', '4', { colourMounting: cm })
          .available,
      ).toBe(false)
    }
  })

  it('blocks electricalArrangement=1 and 2 when switchType=2', () => {
    for (const ea of ['1', '2']) {
      expect(
        engine.checkOptionAvailability('electricalArrangement', ea, { switchType: '2' })
          .available,
      ).toBe(false)
    }
  })

  it('allows electricalArrangement=0 when switchType=2', () => {
    expect(
      engine.checkOptionAvailability('electricalArrangement', '0', { switchType: '2' })
        .available,
    ).toBe(true)
  })

  it('blocks electricalArrangement=0 when switchType=5', () => {
    expect(
      engine.checkOptionAvailability('electricalArrangement', '0', { switchType: '5' })
        .available,
    ).toBe(false)
  })

  it('allows electricalArrangement=3 only when switchType=5', () => {
    expect(
      engine.checkOptionAvailability('electricalArrangement', '3', { switchType: '5' })
        .available,
    ).toBe(true)
    for (const st of ['2', '3', '4']) {
      expect(
        engine.checkOptionAvailability('electricalArrangement', '3', { switchType: st })
          .available,
      ).toBe(false)
    }
  })

  it('blocks electricalArrangement=3 when colourMounting=30 or 90', () => {
    for (const cm of ['30', '90']) {
      expect(
        engine.checkOptionAvailability('electricalArrangement', '3', {
          colourMounting: cm,
        }).available,
      ).toBe(false)
    }
  })

  it('label not included in constraint matrices — 6 constraints total', () => {
    expect(KEY_SWITCHES_CONSTRAINTS.constraints).toHaveLength(6)
    const steps = KEY_SWITCHES_CONSTRAINTS.constraints.flatMap((c) => [
      c.sourceStep,
      c.targetStep,
    ])
    expect(steps).not.toContain('label')
  })

  it('constraint engine modelId matches', () => {
    expect(KEY_SWITCHES_CONSTRAINTS.modelId).toBe('key-switches')
  })
})

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe('buildProductModel — keySwitches', () => {
  it('builds SS3-1020 correctly', () => {
    const config: Configuration = {
      colourMounting: '10',
      switchType: '2',
      electricalArrangement: '0',
      label: 'SAK',
    }
    const result = buildProductModel(config, keySwitchesModel)
    expect(result.fullCode).toBe('SS3-1020')
    expect(result.isComplete).toBe(true)
  })

  it('builds SS3-1020-CL correctly', () => {
    const config: Configuration = {
      colourMounting: '10',
      switchType: '2',
      electricalArrangement: '0',
      label: 'CL',
    }
    const result = buildProductModel(config, keySwitchesModel)
    expect(result.fullCode).toBe('SS3-1020-CL')
    expect(result.isComplete).toBe(true)
  })

  it('builds SS3-E053-CL correctly', () => {
    const config: Configuration = {
      colourMounting: 'E0',
      switchType: '5',
      electricalArrangement: '3',
      label: 'CL',
    }
    const result = buildProductModel(config, keySwitchesModel)
    expect(result.fullCode).toBe('SS3-E053-CL')
    expect(result.isComplete).toBe(true)
  })

  it('SAK label has empty code — no suffix', () => {
    const config: Configuration = {
      colourMounting: '30',
      switchType: '3',
      electricalArrangement: '0',
      label: 'SAK',
    }
    const result = buildProductModel(config, keySwitchesModel)
    expect(result.fullCode).toBe('SS3-3030')
    expect(result.fullCode).not.toMatch(/-$/)
    expect(result.fullCode).not.toContain('SAK')
  })

  it('baseCode is SS3-', () => {
    const config: Configuration = {
      colourMounting: null,
      switchType: null,
      electricalArrangement: null,
      label: null,
    }
    const result = buildProductModel(config, keySwitchesModel)
    expect(result.baseCode).toBe('SS3-')
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = {
      colourMounting: '10',
      switchType: null,
      electricalArrangement: null,
      label: null,
    }
    const result = buildProductModel(config, keySwitchesModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('switchType')
    expect(result.missingSteps).toContain('electricalArrangement')
    expect(result.missingSteps).toContain('label')
  })

  it('all 49 valid codes generated from parsed configurations', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseKSModelCode(code)!
      const config: Configuration = {
        colourMounting: parsed.colourMounting ?? null,
        switchType: parsed.switchType ?? null,
        electricalArrangement: parsed.electricalArrangement ?? null,
        label: parsed.label ?? null,
      }
      const result = buildProductModel(config, keySwitchesModel)
      if (validSet.has(result.fullCode)) matchCount++
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — keySwitches
// ─────────────────────────────────────────────────────────────

describe('isConfigurationComplete — keySwitches', () => {
  it('returns true when all 4 steps selected', () => {
    const config: Configuration = {
      colourMounting: '10',
      switchType: '2',
      electricalArrangement: '0',
      label: 'SAK',
    }
    expect(isConfigurationComplete(keySwitchesModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(keySwitchesModel, {
        colourMounting: '10',
        switchType: '2',
        electricalArrangement: '0',
        label: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = {
      colourMounting: 'E0',
      switchType: null,
      electricalArrangement: null,
      label: null,
    }
    const missing = getMissingRequiredSteps(keySwitchesModel, config)
    expect(missing).toContain('switchType')
    expect(missing).toContain('electricalArrangement')
    expect(missing).toContain('label')
    expect(missing).not.toContain('colourMounting')
  })

  it('getCompletionPercentage for 4-step model', () => {
    expect(
      getCompletionPercentage(keySwitchesModel, {
        colourMounting: null,
        switchType: null,
        electricalArrangement: null,
        label: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(keySwitchesModel, {
        colourMounting: '10',
        switchType: null,
        electricalArrangement: null,
        label: null,
      }),
    ).toBe(25)

    expect(
      getCompletionPercentage(keySwitchesModel, {
        colourMounting: '10',
        switchType: '2',
        electricalArrangement: '0',
        label: null,
      }),
    ).toBe(75)

    expect(
      getCompletionPercentage(keySwitchesModel, {
        colourMounting: '10',
        switchType: '2',
        electricalArrangement: '0',
        label: 'SAK',
      }),
    ).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe('keySwitchesModel definition', () => {
  it('has correct model id and slug', () => {
    expect(keySwitchesModel.id).toBe('key-switches')
    expect(keySwitchesModel.slug).toBe('key-switches')
  })

  it('stepOrder has 4 steps', () => {
    expect(keySwitchesModel.stepOrder).toEqual([
      'colourMounting',
      'switchType',
      'electricalArrangement',
      'label',
    ])
  })

  it('all steps are required', () => {
    for (const step of keySwitchesModel.steps) {
      expect(step.required).toBe(true)
    }
  })

  it('SAK label has empty code', () => {
    const labelStep = keySwitchesModel.steps.find((s) => s.id === 'label')!
    const sak = labelStep.options.find((o) => o.id === 'SAK')!
    expect(sak.code).toBe('')
  })

  it('electricalArrangement options have availableFor field referencing switchType', () => {
    const eaStep = keySwitchesModel.steps.find((s) => s.id === 'electricalArrangement')!
    for (const option of eaStep.options) {
      expect(option.availableFor).toBeDefined()
      expect(Array.isArray(option.availableFor)).toBe(true)
    }
  })

  it('ea=0 available for switchTypes 2 and 3 only', () => {
    const eaStep = keySwitchesModel.steps.find((s) => s.id === 'electricalArrangement')!
    const ea0 = eaStep.options.find((o) => o.id === '0')!
    expect(ea0.availableFor).toEqual(['2', '3'])
  })

  it('ea=3 available for switchType 5 only', () => {
    const eaStep = keySwitchesModel.steps.find((s) => s.id === 'electricalArrangement')!
    const ea3 = eaStep.options.find((o) => o.id === '3')!
    expect(ea3.availableFor).toEqual(['5'])
  })

  it('baseCode is SS3-', () => {
    expect(keySwitchesModel.productModelSchema.baseCode).toBe('SS3-')
  })

  it('only label uses dash separator', () => {
    const { separatorMap } = keySwitchesModel.productModelSchema
    expect(separatorMap?.label).toBe('-')
    expect(separatorMap?.colourMounting).toBe('')
    expect(separatorMap?.switchType).toBe('')
    expect(separatorMap?.electricalArrangement).toBe('')
  })
})
