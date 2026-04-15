import { describe, it, expect } from 'vitest'
import {
  buildUSModelCode,
  parseUSModelCode,
  isValidUSCombination,
  getValidUSOptionsForStep,
  VALID_MODEL_CODES,
  UNIVERSAL_STOPPER_CONSTRAINTS,
} from '@entities/product/rules/universalStopperRules'
import { universalStopperModel } from '@entities/product/models/universalStopper'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
  getVisibleSteps,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

describe('buildUSModelCode', () => {
  it('builds correct code for flush mount, label hood, no sounder', () => {
    expect(
      buildUSModelCode({ mounting: '0', hoodSounder: '10', colourLabel: 'FR' }),
    ).toBe('STI-13010FR')
  })

  it('builds correct code for no label hood (no power needed)', () => {
    expect(
      buildUSModelCode({ mounting: '0', hoodSounder: '00', colourLabel: 'NC' }),
    ).toBe('STI-13000NC')
  })

  it('builds correct code for surface mount with sounder battery', () => {
    expect(
      buildUSModelCode({
        mounting: '1',
        hoodSounder: '20',
        power: 'battery',
        colourLabel: 'EG',
      }),
    ).toBe('STI-13120EG')
  })

  it('builds correct code for sounder with dc power (resolves to 30)', () => {
    expect(
      buildUSModelCode({
        mounting: '2',
        hoodSounder: '20',
        power: 'dc',
        colourLabel: 'FR',
      }),
    ).toBe('STI-13230FR')
  })

  it('returns null when hoodSounder=20 but power is missing', () => {
    expect(
      buildUSModelCode({ mounting: '0', hoodSounder: '20', colourLabel: 'FR' }),
    ).toBeNull()
  })

  it('returns null when required fields are missing', () => {
    expect(buildUSModelCode({ mounting: '0', hoodSounder: '10' })).toBeNull()
    expect(buildUSModelCode({ mounting: '0', colourLabel: 'FR' })).toBeNull()
    expect(buildUSModelCode({ hoodSounder: '10', colourLabel: 'FR' })).toBeNull()
    expect(buildUSModelCode({})).toBeNull()
  })
})

describe('parseUSModelCode', () => {
  it('parses code with hoodSounder 00 as power=undefined', () => {
    expect(parseUSModelCode('STI-13000NC')).toEqual({
      mounting: '0',
      hoodSounder: '00',
      power: undefined,
      colourLabel: 'NC',
    })
  })

  it('parses code with hoodSounder 10 as power=undefined', () => {
    expect(parseUSModelCode('STI-13010FR')).toEqual({
      mounting: '0',
      hoodSounder: '10',
      power: undefined,
      colourLabel: 'FR',
    })
  })

  it('parses code with hoodSounder 20 as power=battery', () => {
    expect(parseUSModelCode('STI-13120EG')).toEqual({
      mounting: '1',
      hoodSounder: '20',
      power: 'battery',
      colourLabel: 'EG',
    })
  })

  it('parses code with hoodSounder 30 as hoodSounder=20 power=dc', () => {
    expect(parseUSModelCode('STI-13230FR')).toEqual({
      mounting: '2',
      hoodSounder: '20',
      power: 'dc',
      colourLabel: 'FR',
    })
  })

  it('parses all mounting variants', () => {
    expect(parseUSModelCode('STI-13010FR')?.mounting).toBe('0')
    expect(parseUSModelCode('STI-13110CR')?.mounting).toBe('1')
    expect(parseUSModelCode('STI-13210FR')?.mounting).toBe('2')
  })

  it('returns null for invalid format', () => {
    expect(parseUSModelCode('INVALID')).toBeNull()
    expect(parseUSModelCode('STI-13-010-FR')).toBeNull()
    expect(parseUSModelCode('')).toBeNull()
    expect(parseUSModelCode('STI-13010')).toBeNull()
  })

  it('round-trips battery power: build → parse → build', () => {
    const original = {
      mounting: '1',
      hoodSounder: '20',
      power: 'battery',
      colourLabel: 'NB',
    }
    const code = buildUSModelCode(original)!
    const parsed = parseUSModelCode(code)
    expect(parsed).toEqual(original)
  })

  it('round-trips dc power: build → parse → build', () => {
    const original = { mounting: '1', hoodSounder: '20', power: 'dc', colourLabel: 'CG' }
    const code = buildUSModelCode(original)!
    expect(code).toBe('STI-13130CG')
    const parsed = parseUSModelCode(code)
    expect(parsed).toEqual(original)
  })

  it('round-trips no-sounder: build → parse → build', () => {
    const original = { mounting: '0', hoodSounder: '10', colourLabel: 'FR' }
    const code = buildUSModelCode(original)!
    const parsed = parseUSModelCode(code)
    expect(parsed).toEqual({ ...original, power: undefined })
  })
})

describe('VALID_MODEL_CODES', () => {
  it('contains 72 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(72)
  })

  it('has no duplicates', () => {
    const unique = new Set(VALID_MODEL_CODES)
    expect(unique.size).toBe(VALID_MODEL_CODES.length)
  })

  it('all codes match expected format STI-13[0-2][0-3][0-9][A-Z]{2}', () => {
    const pattern = /^STI-13[012](00|10|20|30)[A-Z]{2}$/
    for (const code of VALID_MODEL_CODES) {
      expect(code).toMatch(pattern)
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseUSModelCode(code)).not.toBeNull()
    }
  })

  it('contains newly added codes from updated product list', () => {
    const set = new Set(VALID_MODEL_CODES)
    expect(set.has('STI-13010CW')).toBe(true)
    expect(set.has('STI-13020CG')).toBe(true)
    expect(set.has('STI-13030CR')).toBe(true)
    expect(set.has('STI-13130CR')).toBe(true)
    expect(set.has('STI-13210CG')).toBe(true)
    expect(set.has('STI-13210CW')).toBe(true)
    expect(set.has('STI-13230CB')).toBe(true)
  })

  it('does not contain removed codes', () => {
    const set = new Set(VALID_MODEL_CODES)
    expect(set.has('STI-13110EG')).toBe(false)
    expect(set.has('STI-13110FR')).toBe(false)
  })
})

describe('isValidUSCombination', () => {
  it('returns valid for known good combinations', () => {
    expect(
      isValidUSCombination({ mounting: '0', hoodSounder: '10', colourLabel: 'FR' }),
    ).toEqual({ valid: true })
    expect(
      isValidUSCombination({
        mounting: '1',
        hoodSounder: '20',
        power: 'battery',
        colourLabel: 'EG',
      }),
    ).toEqual({ valid: true })
    expect(
      isValidUSCombination({
        mounting: '2',
        hoodSounder: '20',
        power: 'dc',
        colourLabel: 'FR',
      }),
    ).toEqual({ valid: true })
  })

  it('returns valid for incomplete selection (user still picking)', () => {
    expect(isValidUSCombination({ mounting: '0' })).toEqual({ valid: true })
    expect(isValidUSCombination({ mounting: '0', hoodSounder: '10' })).toEqual({
      valid: true,
    })
    expect(isValidUSCombination({})).toEqual({ valid: true })
  })

  it('returns invalid for non-existent combination', () => {
    const result = isValidUSCombination({
      mounting: '2',
      hoodSounder: '00',
      colourLabel: 'NC',
    })
    expect(result.valid).toBe(false)
  })

  it('all VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseUSModelCode(code)!
      expect(isValidUSCombination(parsed)).toEqual({ valid: true })
    }
  })
})

describe('getValidUSOptionsForStep', () => {
  it('returns all mounting options when nothing selected', () => {
    const valid = getValidUSOptionsForStep('mounting', {})
    expect(valid).toContain('0')
    expect(valid).toContain('1')
    expect(valid).toContain('2')
  })

  it('hoodSounder=00 only valid with mounting 0 or 1, not 2', () => {
    const validFor0 = getValidUSOptionsForStep('mounting', { hoodSounder: '00' })
    expect(validFor0).toContain('0')
    expect(validFor0).toContain('1')
    expect(validFor0).not.toContain('2')
  })

  it('NC colourLabel only valid with hoodSounder=00', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { colourLabel: 'NC' })
    expect(valid).toEqual(['00'])
  })

  it('power options for hoodSounder=20 are battery and dc', () => {
    const valid = getValidUSOptionsForStep('power', { hoodSounder: '20' })
    expect(valid).toContain('battery')
    expect(valid).toContain('dc')
  })

  it('no power options for hoodSounder=00', () => {
    const valid = getValidUSOptionsForStep('power', { hoodSounder: '00' })
    expect(valid).toHaveLength(0)
  })

  it('no power options for hoodSounder=10', () => {
    const valid = getValidUSOptionsForStep('power', { hoodSounder: '10' })
    expect(valid).toHaveLength(0)
  })

  it('hoodSounder options for power=battery is only 20', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { power: 'battery' })
    expect(valid).toEqual(['20'])
  })

  it('returns only options that lead to valid final codes', () => {
    const validColours = getValidUSOptionsForStep('colourLabel', {
      mounting: '2',
      hoodSounder: '20',
      power: 'dc',
    })
    expect(validColours).toContain('FR')
    expect(validColours).toContain('CG')
    expect(validColours).not.toContain('NC')
    expect(validColours).not.toContain('NR')
  })
})

describe('UNIVERSAL_STOPPER_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(UNIVERSAL_STOPPER_CONSTRAINTS)

  it('blocks hoodSounder=00 when mounting=2', () => {
    const result = engine.checkOptionAvailability('hoodSounder', '00', { mounting: '2' })
    expect(result.available).toBe(false)
  })

  it('allows hoodSounder=00 when mounting=0', () => {
    const result = engine.checkOptionAvailability('hoodSounder', '00', { mounting: '0' })
    expect(result.available).toBe(true)
  })

  it('blocks NC colourLabel when hoodSounder=10', () => {
    const result = engine.checkOptionAvailability('colourLabel', 'NC', {
      hoodSounder: '10',
    })
    expect(result.available).toBe(false)
  })

  it('allows NC colourLabel when hoodSounder=00', () => {
    const result = engine.checkOptionAvailability('colourLabel', 'NC', {
      hoodSounder: '00',
    })
    expect(result.available).toBe(true)
  })

  it('blocks all power options when hoodSounder=00', () => {
    expect(
      engine.checkOptionAvailability('power', 'battery', { hoodSounder: '00' }).available,
    ).toBe(false)
    expect(
      engine.checkOptionAvailability('power', 'dc', { hoodSounder: '00' }).available,
    ).toBe(false)
  })

  it('blocks all power options when hoodSounder=10', () => {
    expect(
      engine.checkOptionAvailability('power', 'battery', { hoodSounder: '10' }).available,
    ).toBe(false)
    expect(
      engine.checkOptionAvailability('power', 'dc', { hoodSounder: '10' }).available,
    ).toBe(false)
  })

  it('allows power=battery when hoodSounder=20', () => {
    const result = engine.checkOptionAvailability('power', 'battery', {
      hoodSounder: '20',
    })
    expect(result.available).toBe(true)
  })

  it('allows power=dc when hoodSounder=20', () => {
    const result = engine.checkOptionAvailability('power', 'dc', { hoodSounder: '20' })
    expect(result.available).toBe(true)
  })

  it('constraint engine modelId matches', () => {
    expect(UNIVERSAL_STOPPER_CONSTRAINTS.modelId).toBe('universal-stopper')
  })
})

describe('power step visibility', () => {
  it('power step is hidden when hoodSounder=00', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '00',
      power: null,
      colourLabel: null,
    }
    const visible = getVisibleSteps(universalStopperModel, config)
    const visibleIds = visible.map((s) => s.id)
    expect(visibleIds).not.toContain('power')
  })

  it('power step is hidden when hoodSounder=10', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '10',
      power: null,
      colourLabel: null,
    }
    const visible = getVisibleSteps(universalStopperModel, config)
    const visibleIds = visible.map((s) => s.id)
    expect(visibleIds).not.toContain('power')
  })

  it('power step is visible when hoodSounder=20', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '20',
      power: null,
      colourLabel: null,
    }
    const visible = getVisibleSteps(universalStopperModel, config)
    const visibleIds = visible.map((s) => s.id)
    expect(visibleIds).toContain('power')
  })
})

describe('buildProductModel — universalStopper', () => {
  it('builds correct SKU for flush mount, label hood, no sounder (no power)', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '10',
      power: null,
      colourLabel: 'FR',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13010FR')
    expect(result.isComplete).toBe(true)
  })

  it('builds correct SKU for no label hood (no power)', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '00',
      power: null,
      colourLabel: 'NC',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13000NC')
    expect(result.isComplete).toBe(true)
  })

  it('builds correct SKU for sounder with battery', () => {
    const config: Configuration = {
      mounting: '1',
      hoodSounder: '20',
      power: 'battery',
      colourLabel: 'EG',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13120EG')
    expect(result.isComplete).toBe(true)
  })

  it('builds correct SKU for sounder dc (code 30)', () => {
    const config: Configuration = {
      mounting: '2',
      hoodSounder: '20',
      power: 'dc',
      colourLabel: 'FR',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13230FR')
    expect(result.isComplete).toBe(true)
  })

  it('baseCode is STI-13', () => {
    const config: Configuration = {
      mounting: null,
      hoodSounder: null,
      power: null,
      colourLabel: null,
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.baseCode).toBe('STI-13')
  })

  it('is complete without power when hoodSounder is not 20', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '00',
      power: null,
      colourLabel: 'NC',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.isComplete).toBe(true)
    expect(result.missingSteps).toHaveLength(0)
  })

  it('generated SKUs for all valid combinations exist in VALID_MODEL_CODES', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    const mountings = ['0', '1', '2']
    const hoodSounders = ['00', '10', '20']
    const powers = [null, 'battery', 'dc']
    const colourLabels = [
      'FR',
      'NR',
      'EG',
      'NG',
      'NC',
      'CK',
      'NB',
      'CB',
      'NW',
      'CW',
      'NY',
      'CY',
      'CR',
      'CG',
    ]

    let checkedCount = 0
    for (const mounting of mountings) {
      for (const hoodSounder of hoodSounders) {
        for (const power of powers) {
          for (const colourLabel of colourLabels) {
            const config: Configuration = { mounting, hoodSounder, power, colourLabel }
            const result = buildProductModel(config, universalStopperModel)
            if (validSet.has(result.fullCode)) {
              checkedCount++
            }
          }
        }
      }
    }
    expect(checkedCount).toBe(VALID_MODEL_CODES.length)
  })
})

describe('isConfigurationComplete — universalStopper', () => {
  it('returns true when all required steps selected (no sounder, no power)', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '10',
      power: null,
      colourLabel: 'FR',
    }
    expect(isConfigurationComplete(universalStopperModel, config)).toBe(true)
  })

  it('returns true when sounder selected with power', () => {
    const config: Configuration = {
      mounting: '1',
      hoodSounder: '20',
      power: 'battery',
      colourLabel: 'EG',
    }
    expect(isConfigurationComplete(universalStopperModel, config)).toBe(true)
  })

  it('returns false when colourLabel is missing', () => {
    expect(
      isConfigurationComplete(universalStopperModel, {
        mounting: '0',
        hoodSounder: '10',
        power: null,
        colourLabel: null,
      }),
    ).toBe(false)
  })

  it('returns false when all steps are empty', () => {
    expect(
      isConfigurationComplete(universalStopperModel, {
        mounting: null,
        hoodSounder: null,
        power: null,
        colourLabel: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps does not include power', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: null,
      power: null,
      colourLabel: null,
    }
    const missing = getMissingRequiredSteps(universalStopperModel, config)
    expect(missing).toContain('hoodSounder')
    expect(missing).toContain('colourLabel')
    expect(missing).not.toContain('mounting')
    expect(missing).not.toContain('power')
  })

  it('getCompletionPercentage 100% without power when hoodSounder=10', () => {
    expect(
      getCompletionPercentage(universalStopperModel, {
        mounting: '0',
        hoodSounder: '10',
        power: null,
        colourLabel: 'FR',
      }),
    ).toBe(100)
  })

  it('getCompletionPercentage 100% with power when hoodSounder=20', () => {
    expect(
      getCompletionPercentage(universalStopperModel, {
        mounting: '0',
        hoodSounder: '20',
        power: 'battery',
        colourLabel: 'FR',
      }),
    ).toBe(100)
  })
})

describe('universalStopperModel definition', () => {
  it('has correct model id and slug', () => {
    expect(universalStopperModel.id).toBe('universal-stopper')
    expect(universalStopperModel.slug).toBe('universal-stopper')
  })

  it('has 4 steps in stepOrder', () => {
    expect(universalStopperModel.stepOrder).toEqual([
      'mounting',
      'hoodSounder',
      'power',
      'colourLabel',
    ])
  })

  it('stepOrder matches steps', () => {
    const stepIds = universalStopperModel.steps.map((s) => s.id)
    for (const stepId of universalStopperModel.stepOrder) {
      expect(stepIds).toContain(stepId)
    }
  })

  it('power step is not required', () => {
    const powerStep = universalStopperModel.steps.find((s) => s.id === 'power')!
    expect(powerStep.required).toBe(false)
  })

  it('other steps are required', () => {
    for (const step of universalStopperModel.steps) {
      if (step.id === 'power') continue
      expect(step.required).toBe(true)
    }
  })

  it('baseCode is STI-13', () => {
    expect(universalStopperModel.productModelSchema.baseCode).toBe('STI-13')
  })

  it('has codeLookup for hoodSounder and power', () => {
    const { codeLookup } = universalStopperModel.productModelSchema
    expect(codeLookup).toBeDefined()
    expect(codeLookup!.steps).toEqual(['hoodSounder', 'power'])
    expect(Object.keys(codeLookup!.map)).toHaveLength(4)
    expect(codeLookup!.map['00|']).toBe('00')
    expect(codeLookup!.map['10|']).toBe('10')
    expect(codeLookup!.map['20|battery']).toBe('20')
    expect(codeLookup!.map['20|dc']).toBe('30')
  })

  it('hoodSounder has 3 options (00, 10, 20)', () => {
    const hoodStep = universalStopperModel.steps.find((s) => s.id === 'hoodSounder')!
    const ids = hoodStep.options.map((o) => o.id)
    expect(ids).toEqual(['00', '10', '20'])
  })

  it('power has 2 options (battery, dc)', () => {
    const powerStep = universalStopperModel.steps.find((s) => s.id === 'power')!
    const ids = powerStep.options.map((o) => o.id)
    expect(ids).toEqual(['battery', 'dc'])
  })

  it('mounting option codes match SKU segment format', () => {
    const mountingCodes = universalStopperModel.steps
      .find((s) => s.id === 'mounting')!
      .options.map((o) => o.code)
    expect(mountingCodes).toEqual(['0', '1', '2'])
  })
})
