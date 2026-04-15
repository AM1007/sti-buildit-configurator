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
  getOptionsWithAvailability,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

describe('buildUSModelCode', () => {
  it('builds correct code from 3 SKU fields', () => {
    expect(
      buildUSModelCode({ mounting: '0', hoodSounder: '10', colourLabel: 'FR' }),
    ).toBe('STI-13010FR')
  })

  it('builds correct code for hoodSounder 30', () => {
    expect(
      buildUSModelCode({ mounting: '1', hoodSounder: '30', colourLabel: 'FR' }),
    ).toBe('STI-13130FR')
  })

  it('power does not affect SKU', () => {
    expect(
      buildUSModelCode({
        mounting: '0',
        hoodSounder: '20',
        power: 'battery',
        colourLabel: 'FR',
      }),
    ).toBe('STI-13020FR')
    expect(
      buildUSModelCode({
        mounting: '0',
        hoodSounder: '20',
        power: 'dc',
        colourLabel: 'FR',
      }),
    ).toBe('STI-13020FR')
    expect(
      buildUSModelCode({ mounting: '0', hoodSounder: '20', colourLabel: 'FR' }),
    ).toBe('STI-13020FR')
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
    const parsed = parseUSModelCode('STI-13000NC')
    expect(parsed).toEqual({
      mounting: '0',
      hoodSounder: '00',
      power: undefined,
      colourLabel: 'NC',
    })
  })

  it('parses code with hoodSounder 10 as power=undefined', () => {
    const parsed = parseUSModelCode('STI-13010FR')
    expect(parsed).toEqual({
      mounting: '0',
      hoodSounder: '10',
      power: undefined,
      colourLabel: 'FR',
    })
  })

  it('parses flush mount + hoodSounder 20 as battery', () => {
    const parsed = parseUSModelCode('STI-13020FR')
    expect(parsed?.power).toBe('battery')
  })

  it('parses flush mount + hoodSounder 30 as dc', () => {
    const parsed = parseUSModelCode('STI-13030EG')
    expect(parsed?.power).toBe('dc')
  })

  it('parses surface mount + hoodSounder 30 as battery', () => {
    const parsed = parseUSModelCode('STI-13130FR')
    expect(parsed?.power).toBe('battery')
  })

  it('parses frame mount + hoodSounder 30 as battery', () => {
    const parsed = parseUSModelCode('STI-13230FR')
    expect(parsed?.power).toBe('battery')
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

  it('round-trips: build → parse keeps SKU fields', () => {
    const code = buildUSModelCode({
      mounting: '1',
      hoodSounder: '30',
      colourLabel: 'CG',
    })!
    const parsed = parseUSModelCode(code)
    expect(parsed?.mounting).toBe('1')
    expect(parsed?.hoodSounder).toBe('30')
    expect(parsed?.colourLabel).toBe('CG')
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
      isValidUSCombination({ mounting: '1', hoodSounder: '20', colourLabel: 'EG' }),
    ).toEqual({ valid: true })
    expect(
      isValidUSCombination({ mounting: '2', hoodSounder: '30', colourLabel: 'FR' }),
    ).toEqual({ valid: true })
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidUSCombination({ mounting: '0' })).toEqual({ valid: true })
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

  it('hoodSounder=00 only valid with mounting 0 or 1', () => {
    const valid = getValidUSOptionsForStep('mounting', { hoodSounder: '00' })
    expect(valid).toContain('0')
    expect(valid).toContain('1')
    expect(valid).not.toContain('2')
  })

  it('NC colourLabel only valid with hoodSounder=00', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { colourLabel: 'NC' })
    expect(valid).toEqual(['00'])
  })

  it('hoodSounder 30 is available', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { mounting: '1' })
    expect(valid).toContain('30')
  })

  it('power=dc only for flush+30', () => {
    const valid = getValidUSOptionsForStep('power', { mounting: '0', hoodSounder: '30' })
    expect(valid).toEqual(['dc'])
  })

  it('power=battery for surface+30', () => {
    const valid = getValidUSOptionsForStep('power', { mounting: '1', hoodSounder: '30' })
    expect(valid).toEqual(['battery'])
  })

  it('power=battery for any mounting+20', () => {
    expect(
      getValidUSOptionsForStep('power', { mounting: '0', hoodSounder: '20' }),
    ).toEqual(['battery'])
    expect(
      getValidUSOptionsForStep('power', { mounting: '1', hoodSounder: '20' }),
    ).toEqual(['battery'])
    expect(
      getValidUSOptionsForStep('power', { mounting: '2', hoodSounder: '20' }),
    ).toEqual(['battery'])
  })

  it('no power options for hoodSounder 00 or 10', () => {
    expect(getValidUSOptionsForStep('power', { hoodSounder: '00' })).toHaveLength(0)
    expect(getValidUSOptionsForStep('power', { hoodSounder: '10' })).toHaveLength(0)
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

  it('allows hoodSounder=30 when mounting=1', () => {
    const result = engine.checkOptionAvailability('hoodSounder', '30', { mounting: '1' })
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
    expect(
      engine.checkOptionAvailability('power', 'battery', { hoodSounder: '20' }).available,
    ).toBe(true)
  })

  it('allows power=battery when hoodSounder=30', () => {
    expect(
      engine.checkOptionAvailability('power', 'battery', { hoodSounder: '30' }).available,
    ).toBe(true)
  })

  it('allows power=dc when hoodSounder=30', () => {
    expect(
      engine.checkOptionAvailability('power', 'dc', { hoodSounder: '30' }).available,
    ).toBe(true)
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
    expect(visible.map((s) => s.id)).not.toContain('power')
  })

  it('power step is hidden when hoodSounder=10', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '10',
      power: null,
      colourLabel: null,
    }
    const visible = getVisibleSteps(universalStopperModel, config)
    expect(visible.map((s) => s.id)).not.toContain('power')
  })

  it('power step is visible when hoodSounder=20', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '20',
      power: null,
      colourLabel: null,
    }
    const visible = getVisibleSteps(universalStopperModel, config)
    expect(visible.map((s) => s.id)).toContain('power')
  })

  it('power step is visible when hoodSounder=30', () => {
    const config: Configuration = {
      mounting: '1',
      hoodSounder: '30',
      power: null,
      colourLabel: null,
    }
    const visible = getVisibleSteps(universalStopperModel, config)
    expect(visible.map((s) => s.id)).toContain('power')
  })
})

describe('power allowlist 3-way constraints', () => {
  it('flush + hoodSounder=30 allows only dc', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '30',
      power: null,
      colourLabel: null,
    }
    const powerStep = universalStopperModel.steps.find((s) => s.id === 'power')!
    const options = getOptionsWithAvailability(
      powerStep,
      config,
      universalStopperModel.id,
    )
    const available = options.filter(({ availability }) => availability.available)
    expect(available.map(({ option }) => option.id)).toEqual(['dc'])
  })

  it('surface + hoodSounder=30 allows only battery', () => {
    const config: Configuration = {
      mounting: '1',
      hoodSounder: '30',
      power: null,
      colourLabel: null,
    }
    const powerStep = universalStopperModel.steps.find((s) => s.id === 'power')!
    const options = getOptionsWithAvailability(
      powerStep,
      config,
      universalStopperModel.id,
    )
    const available = options.filter(({ availability }) => availability.available)
    expect(available.map(({ option }) => option.id)).toEqual(['battery'])
  })

  it('frame + hoodSounder=30 allows only battery', () => {
    const config: Configuration = {
      mounting: '2',
      hoodSounder: '30',
      power: null,
      colourLabel: null,
    }
    const powerStep = universalStopperModel.steps.find((s) => s.id === 'power')!
    const options = getOptionsWithAvailability(
      powerStep,
      config,
      universalStopperModel.id,
    )
    const available = options.filter(({ availability }) => availability.available)
    expect(available.map(({ option }) => option.id)).toEqual(['battery'])
  })

  it('any mounting + hoodSounder=20 allows only battery', () => {
    for (const mounting of ['0', '1', '2']) {
      const config: Configuration = {
        mounting,
        hoodSounder: '20',
        power: null,
        colourLabel: null,
      }
      const powerStep = universalStopperModel.steps.find((s) => s.id === 'power')!
      const options = getOptionsWithAvailability(
        powerStep,
        config,
        universalStopperModel.id,
      )
      const available = options.filter(({ availability }) => availability.available)
      expect(available.map(({ option }) => option.id)).toEqual(['battery'])
    }
  })
})

describe('buildProductModel — universalStopper', () => {
  it('builds correct SKU ignoring power', () => {
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

  it('builds correct SKU for hoodSounder 30', () => {
    const config: Configuration = {
      mounting: '1',
      hoodSounder: '30',
      power: 'battery',
      colourLabel: 'FR',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13130FR')
    expect(result.isComplete).toBe(true)
  })

  it('builds correct SKU for no label hood', () => {
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

  it('power=battery does not change SKU', () => {
    const withPower: Configuration = {
      mounting: '0',
      hoodSounder: '20',
      power: 'battery',
      colourLabel: 'FR',
    }
    const withoutPower: Configuration = {
      mounting: '0',
      hoodSounder: '20',
      power: null,
      colourLabel: 'FR',
    }
    expect(buildProductModel(withPower, universalStopperModel).fullCode).toBe(
      buildProductModel(withoutPower, universalStopperModel).fullCode,
    )
  })

  it('baseCode is STI-13', () => {
    const config: Configuration = {
      mounting: null,
      hoodSounder: null,
      power: null,
      colourLabel: null,
    }
    expect(buildProductModel(config, universalStopperModel).baseCode).toBe('STI-13')
  })

  it('is complete without power when hoodSounder has no sounder', () => {
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
    const hoodSounders = ['00', '10', '20', '30']
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
        for (const colourLabel of colourLabels) {
          const config: Configuration = {
            mounting,
            hoodSounder,
            power: null,
            colourLabel,
          }
          const result = buildProductModel(config, universalStopperModel)
          if (validSet.has(result.fullCode)) {
            checkedCount++
          }
        }
      }
    }
    expect(checkedCount).toBe(VALID_MODEL_CODES.length)
  })
})

describe('isConfigurationComplete — universalStopper', () => {
  it('returns true without power when hoodSounder has no sounder', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '10',
      power: null,
      colourLabel: 'FR',
    }
    expect(isConfigurationComplete(universalStopperModel, config)).toBe(true)
  })

  it('returns true with power when hoodSounder has sounder', () => {
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

  it('getCompletionPercentage 100% without power when no sounder', () => {
    expect(
      getCompletionPercentage(universalStopperModel, {
        mounting: '0',
        hoodSounder: '10',
        power: null,
        colourLabel: 'FR',
      }),
    ).toBe(100)
  })

  it('getCompletionPercentage 100% with power when sounder selected', () => {
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

  it('partsOrder excludes power', () => {
    expect(universalStopperModel.productModelSchema.partsOrder).toEqual([
      'mounting',
      'hoodSounder',
      'colourLabel',
    ])
  })

  it('has no codeLookup', () => {
    expect(universalStopperModel.productModelSchema.codeLookup).toBeUndefined()
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

  it('hoodSounder has 4 options (00, 10, 20, 30)', () => {
    const hoodStep = universalStopperModel.steps.find((s) => s.id === 'hoodSounder')!
    expect(hoodStep.options.map((o) => o.id)).toEqual(['00', '10', '20', '30'])
  })

  it('power has 2 options with empty code', () => {
    const powerStep = universalStopperModel.steps.find((s) => s.id === 'power')!
    expect(powerStep.options.map((o) => o.id)).toEqual(['battery', 'dc'])
    for (const opt of powerStep.options) {
      expect(opt.code).toBe('')
    }
  })

  it('baseCode is STI-13', () => {
    expect(universalStopperModel.productModelSchema.baseCode).toBe('STI-13')
  })

  it('mounting option codes match SKU segment format', () => {
    const codes = universalStopperModel.steps
      .find((s) => s.id === 'mounting')!
      .options.map((o) => o.code)
    expect(codes).toEqual(['0', '1', '2'])
  })

  it('hoodSounder option codes match SKU segment format', () => {
    const codes = universalStopperModel.steps
      .find((s) => s.id === 'hoodSounder')!
      .options.map((o) => o.code)
    expect(codes).toEqual(['00', '10', '20', '30'])
  })
})
