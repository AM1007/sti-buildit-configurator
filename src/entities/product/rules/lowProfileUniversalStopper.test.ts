import { describe, it, expect } from 'vitest'
import {
  buildLPUSModelCode,
  parseLPUSModelCode,
  isValidLPUSCombination,
  getValidLPUSOptionsForStep,
  VALID_MODEL_CODES,
  LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS,
} from '@entities/product/rules/lowProfileUniversalStopperRules'
import { lowProfileUniversalStopperModel } from '@entities/product/models/lowProfileUniversalStopper'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

describe('buildLPUSModelCode', () => {
  it('builds STI-14000NC correctly', () => {
    expect(
      buildLPUSModelCode({ mounting: '0', hoodSounder: '00', colourLabel: 'NC' }),
    ).toBe('STI-14000NC')
  })

  it('builds STI-14110FR correctly', () => {
    expect(
      buildLPUSModelCode({ mounting: '1', hoodSounder: '10', colourLabel: 'FR' }),
    ).toBe('STI-14110FR')
  })

  it('builds STI-14220CY correctly', () => {
    expect(
      buildLPUSModelCode({ mounting: '2', hoodSounder: '20', colourLabel: 'CY' }),
    ).toBe('STI-14220CY')
  })

  it('builds STI-14010CY correctly', () => {
    expect(
      buildLPUSModelCode({ mounting: '0', hoodSounder: '10', colourLabel: 'CY' }),
    ).toBe('STI-14010CY')
  })

  it('returns null when any field is missing', () => {
    expect(buildLPUSModelCode({ mounting: '0', hoodSounder: '00' })).toBeNull()
    expect(buildLPUSModelCode({ mounting: '0', colourLabel: 'NC' })).toBeNull()
    expect(buildLPUSModelCode({ hoodSounder: '00', colourLabel: 'NC' })).toBeNull()
    expect(buildLPUSModelCode({})).toBeNull()
  })
})

describe('parseLPUSModelCode', () => {
  it('parses STI-14000NC correctly', () => {
    expect(parseLPUSModelCode('STI-14000NC')).toEqual({
      mounting: '0',
      hoodSounder: '00',
      colourLabel: 'NC',
    })
  })

  it('parses STI-14220CY correctly', () => {
    expect(parseLPUSModelCode('STI-14220CY')).toEqual({
      mounting: '2',
      hoodSounder: '20',
      colourLabel: 'CY',
    })
  })

  it('returns null for invalid format', () => {
    expect(parseLPUSModelCode('INVALID')).toBeNull()
    expect(parseLPUSModelCode('STI-13000NC')).toBeNull()
    expect(parseLPUSModelCode('STI-14000N')).toBeNull()
    expect(parseLPUSModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseLPUSModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildLPUSModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 14 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(14)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(14)
  })

  it('6 flush (0), 7 surface dual (1), 1 surface+frame (2)', () => {
    expect(
      VALID_MODEL_CODES.filter((c) => parseLPUSModelCode(c)?.mounting === '0').length,
    ).toBe(6)
    expect(
      VALID_MODEL_CODES.filter((c) => parseLPUSModelCode(c)?.mounting === '1').length,
    ).toBe(7)
    expect(
      VALID_MODEL_CODES.filter((c) => parseLPUSModelCode(c)?.mounting === '2').length,
    ).toBe(1)
  })

  it('mounting=2 only has hoodSounder=20, never 00 or 10', () => {
    const m2 = VALID_MODEL_CODES.filter((c) => parseLPUSModelCode(c)?.mounting === '2')
    for (const code of m2) {
      expect(parseLPUSModelCode(code)?.hoodSounder).toBe('20')
    }
  })

  it('does not contain NW or CW colourLabel', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseLPUSModelCode(code)
      expect(parsed?.colourLabel).not.toBe('NW')
      expect(parsed?.colourLabel).not.toBe('CW')
    }
  })

  it('NC colourLabel only with hoodSounder=00', () => {
    const ncCodes = VALID_MODEL_CODES.filter(
      (c) => parseLPUSModelCode(c)?.colourLabel === 'NC',
    )
    for (const code of ncCodes) {
      expect(parseLPUSModelCode(code)?.hoodSounder).toBe('00')
    }
  })

  it('contains STI-14010CY', () => {
    const set = new Set(VALID_MODEL_CODES)
    expect(set.has('STI-14010CY')).toBe(true)
  })

  it('does not contain STI-14200CW or STI-14200NW', () => {
    const set = new Set(VALID_MODEL_CODES)
    expect(set.has('STI-14200CW')).toBe(false)
    expect(set.has('STI-14200NW')).toBe(false)
  })

  it('false positive STI-14010FR not in allowlist', () => {
    expect(VALID_MODEL_CODES).not.toContain('STI-14010FR')
  })

  it('false positive STI-14120CY not in allowlist', () => {
    expect(VALID_MODEL_CODES).not.toContain('STI-14120CY')
  })

  it('all codes start with STI-14', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(code.startsWith('STI-14')).toBe(true)
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseLPUSModelCode(code)).not.toBeNull()
    }
  })
})

describe('isValidLPUSCombination', () => {
  it('all 14 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseLPUSModelCode(code)!
      expect(isValidLPUSCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidLPUSCombination({})).toEqual({ valid: true })
    expect(isValidLPUSCombination({ mounting: '0' })).toEqual({ valid: true })
    expect(isValidLPUSCombination({ mounting: '0', hoodSounder: '00' })).toEqual({
      valid: true,
    })
  })

  it('rejects false positive STI-14010FR', () => {
    const result = isValidLPUSCombination({
      mounting: '0',
      hoodSounder: '10',
      colourLabel: 'FR',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toContain('STI-14010FR')
  })

  it('rejects false positive STI-14120CY', () => {
    const result = isValidLPUSCombination({
      mounting: '1',
      hoodSounder: '20',
      colourLabel: 'CY',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toContain('STI-14120CY')
  })

  it('rejects mounting=2 with hoodSounder=10', () => {
    const result = isValidLPUSCombination({
      mounting: '2',
      hoodSounder: '10',
      colourLabel: 'EG',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects NW with any mounting', () => {
    for (const mounting of ['0', '1', '2']) {
      const result = isValidLPUSCombination({
        mounting,
        hoodSounder: '00',
        colourLabel: 'NW',
      })
      expect(result.valid).toBe(false)
    }
  })

  it('rejects CW with any mounting', () => {
    for (const mounting of ['0', '1', '2']) {
      const result = isValidLPUSCombination({
        mounting,
        hoodSounder: '00',
        colourLabel: 'CW',
      })
      expect(result.valid).toBe(false)
    }
  })
})

describe('getValidLPUSOptionsForStep', () => {
  it('returns all three mountings when nothing selected', () => {
    const valid = getValidLPUSOptionsForStep('mounting', {})
    expect(valid).toContain('0')
    expect(valid).toContain('1')
    expect(valid).toContain('2')
  })

  it('mounting=2 does not allow hoodSounder=10', () => {
    const valid = getValidLPUSOptionsForStep('hoodSounder', { mounting: '2' })
    expect(valid).not.toContain('10')
  })

  it('mounting=2 only allows hoodSounder=20', () => {
    const valid = getValidLPUSOptionsForStep('hoodSounder', { mounting: '2' })
    expect(valid).toEqual(['20'])
  })

  it('hoodSounder=00 allows only NC colourLabel', () => {
    const valid = getValidLPUSOptionsForStep('colourLabel', { hoodSounder: '00' })
    expect(valid).toEqual(['NC'])
  })

  it('NC colourLabel only valid with hoodSounder=00', () => {
    const valid = getValidLPUSOptionsForStep('hoodSounder', { colourLabel: 'NC' })
    expect(valid).toEqual(['00'])
  })

  it('CY colourLabel valid with all mountings', () => {
    const valid = getValidLPUSOptionsForStep('mounting', { colourLabel: 'CY' })
    expect(valid.sort()).toEqual(['0', '1', '2'])
  })

  it('NY colourLabel not valid with mounting=2', () => {
    const valid = getValidLPUSOptionsForStep('mounting', { colourLabel: 'NY' })
    expect(valid).not.toContain('2')
    expect(valid).toContain('0')
    expect(valid).toContain('1')
  })

  it('mounting=2 allows only CY colourLabel', () => {
    const valid = getValidLPUSOptionsForStep('colourLabel', { mounting: '2' })
    expect(valid).toEqual(['CY'])
  })

  it('mounting=0 allows CY', () => {
    const valid = getValidLPUSOptionsForStep('colourLabel', { mounting: '0' })
    expect(valid).toContain('CY')
  })

  it('hoodSounder=20 only allows FR, EG, CY', () => {
    const valid = getValidLPUSOptionsForStep('colourLabel', { hoodSounder: '20' })
    expect(valid).toContain('FR')
    expect(valid).toContain('EG')
    expect(valid).toContain('CY')
    expect(valid).not.toContain('NC')
    expect(valid).not.toContain('NW')
    expect(valid).not.toContain('NY')
  })

  it('NW and CW are never valid options for colourLabel', () => {
    for (const mounting of ['0', '1', '2']) {
      const valid = getValidLPUSOptionsForStep('colourLabel', { mounting })
      expect(valid).not.toContain('NW')
      expect(valid).not.toContain('CW')
    }
  })
})

describe('LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS)

  it('blocks hoodSounder=10 when mounting=2', () => {
    expect(
      engine.checkOptionAvailability('hoodSounder', '10', { mounting: '2' }).available,
    ).toBe(false)
  })

  it('blocks hoodSounder=00 when mounting=2', () => {
    expect(
      engine.checkOptionAvailability('hoodSounder', '00', { mounting: '2' }).available,
    ).toBe(false)
  })

  it('allows hoodSounder=20 when mounting=2', () => {
    expect(
      engine.checkOptionAvailability('hoodSounder', '20', { mounting: '2' }).available,
    ).toBe(true)
  })

  it('blocks NC colourLabel when hoodSounder=10 or 20', () => {
    for (const hs of ['10', '20']) {
      expect(
        engine.checkOptionAvailability('colourLabel', 'NC', { hoodSounder: hs })
          .available,
      ).toBe(false)
    }
  })

  it('allows NC colourLabel when hoodSounder=00', () => {
    expect(
      engine.checkOptionAvailability('colourLabel', 'NC', { hoodSounder: '00' })
        .available,
    ).toBe(true)
  })

  it('blocks NW colourLabel for all mountings', () => {
    for (const mounting of ['0', '1', '2']) {
      expect(
        engine.checkOptionAvailability('colourLabel', 'NW', { mounting }).available,
      ).toBe(false)
    }
  })

  it('blocks CW colourLabel for all mountings', () => {
    for (const mounting of ['0', '1', '2']) {
      expect(
        engine.checkOptionAvailability('colourLabel', 'CW', { mounting }).available,
      ).toBe(false)
    }
  })

  it('blocks FR and EG colourLabels when hoodSounder=00', () => {
    for (const cl of ['FR', 'EG']) {
      expect(
        engine.checkOptionAvailability('colourLabel', cl, { hoodSounder: '00' })
          .available,
      ).toBe(false)
    }
  })

  it('constraint engine modelId matches', () => {
    expect(LOW_PROFILE_UNIVERSAL_STOPPER_CONSTRAINTS.modelId).toBe(
      'low-profile-universal-stopper',
    )
  })
})

describe('buildProductModel — lowProfileUniversalStopper', () => {
  it('builds STI-14000NC correctly', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '00',
      colourLabel: 'NC',
    }
    const result = buildProductModel(config, lowProfileUniversalStopperModel)
    expect(result.fullCode).toBe('STI-14000NC')
    expect(result.isComplete).toBe(true)
  })

  it('builds STI-14110FR correctly', () => {
    const config: Configuration = {
      mounting: '1',
      hoodSounder: '10',
      colourLabel: 'FR',
    }
    const result = buildProductModel(config, lowProfileUniversalStopperModel)
    expect(result.fullCode).toBe('STI-14110FR')
    expect(result.isComplete).toBe(true)
  })

  it('builds STI-14220CY correctly', () => {
    const config: Configuration = {
      mounting: '2',
      hoodSounder: '20',
      colourLabel: 'CY',
    }
    const result = buildProductModel(config, lowProfileUniversalStopperModel)
    expect(result.fullCode).toBe('STI-14220CY')
    expect(result.isComplete).toBe(true)
  })

  it('builds STI-14010CY correctly', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '10',
      colourLabel: 'CY',
    }
    const result = buildProductModel(config, lowProfileUniversalStopperModel)
    expect(result.fullCode).toBe('STI-14010CY')
    expect(result.isComplete).toBe(true)
  })

  it('baseCode is STI-14', () => {
    const config: Configuration = {
      mounting: null,
      hoodSounder: null,
      colourLabel: null,
    }
    expect(buildProductModel(config, lowProfileUniversalStopperModel).baseCode).toBe(
      'STI-14',
    )
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: null,
      colourLabel: null,
    }
    const result = buildProductModel(config, lowProfileUniversalStopperModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('hoodSounder')
    expect(result.missingSteps).toContain('colourLabel')
  })

  it('bijection: all 14 valid codes generated from parsed configurations', () => {
    const generated = new Set<string>()
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseLPUSModelCode(code)!
      const config: Configuration = {
        mounting: parsed.mounting!,
        hoodSounder: parsed.hoodSounder!,
        colourLabel: parsed.colourLabel!,
      }
      const result = buildProductModel(config, lowProfileUniversalStopperModel)
      generated.add(result.fullCode)
    }
    expect(generated.size).toBe(14)
    for (const code of VALID_MODEL_CODES) {
      expect(generated.has(code)).toBe(true)
    }
  })
})

describe('isConfigurationComplete — lowProfileUniversalStopper', () => {
  it('returns true when all 3 steps selected', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '00',
      colourLabel: 'NC',
    }
    expect(isConfigurationComplete(lowProfileUniversalStopperModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(lowProfileUniversalStopperModel, {
        mounting: '0',
        hoodSounder: '00',
        colourLabel: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = {
      mounting: '1',
      hoodSounder: null,
      colourLabel: null,
    }
    const missing = getMissingRequiredSteps(lowProfileUniversalStopperModel, config)
    expect(missing).toContain('hoodSounder')
    expect(missing).toContain('colourLabel')
    expect(missing).not.toContain('mounting')
  })

  it('getCompletionPercentage for 3-step model', () => {
    expect(
      getCompletionPercentage(lowProfileUniversalStopperModel, {
        mounting: '0',
        hoodSounder: '00',
        colourLabel: 'NC',
      }),
    ).toBe(100)

    expect(
      getCompletionPercentage(lowProfileUniversalStopperModel, {
        mounting: null,
        hoodSounder: null,
        colourLabel: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(lowProfileUniversalStopperModel, {
        mounting: '0',
        hoodSounder: null,
        colourLabel: null,
      }),
    ).toBeCloseTo(33, 0)
  })
})

describe('lowProfileUniversalStopperModel definition', () => {
  it('has correct model id and slug', () => {
    expect(lowProfileUniversalStopperModel.id).toBe('low-profile-universal-stopper')
    expect(lowProfileUniversalStopperModel.slug).toBe('low-profile-universal-stopper')
  })

  it('has 3 steps in stepOrder (no cover)', () => {
    expect(lowProfileUniversalStopperModel.stepOrder).toEqual([
      'mounting',
      'hoodSounder',
      'colourLabel',
    ])
  })

  it('no cover step exists', () => {
    const coverStep = lowProfileUniversalStopperModel.steps.find((s) => s.id === 'cover')
    expect(coverStep).toBeUndefined()
  })

  it('hoodSounder step has 3 options — 00, 10, 20', () => {
    const hsStep = lowProfileUniversalStopperModel.steps.find(
      (s) => s.id === 'hoodSounder',
    )!
    const ids = hsStep.options.map((o) => o.id)
    expect(ids).toEqual(['00', '10', '20'])
  })

  it('colourLabel step has 5 options', () => {
    const clStep = lowProfileUniversalStopperModel.steps.find(
      (s) => s.id === 'colourLabel',
    )!
    expect(clStep.options).toHaveLength(5)
  })

  it('colourLabel step does not contain NW or CW', () => {
    const clStep = lowProfileUniversalStopperModel.steps.find(
      (s) => s.id === 'colourLabel',
    )!
    const ids = clStep.options.map((o) => o.id)
    expect(ids).not.toContain('NW')
    expect(ids).not.toContain('CW')
  })

  it('baseCode is STI-14', () => {
    expect(lowProfileUniversalStopperModel.productModelSchema.baseCode).toBe('STI-14')
  })

  it('partsOrder matches stepOrder', () => {
    expect(lowProfileUniversalStopperModel.productModelSchema.partsOrder).toEqual([
      'mounting',
      'hoodSounder',
      'colourLabel',
    ])
  })

  it('all steps are required', () => {
    for (const step of lowProfileUniversalStopperModel.steps) {
      expect(step.required).toBe(true)
    }
  })

  it('has primaryDependencyStep colourLabel', () => {
    expect(lowProfileUniversalStopperModel.primaryDependencyStep).toBe('colourLabel')
  })
})
