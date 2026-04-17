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
  it('builds correct code for prozory', () => {
    expect(
      buildUSModelCode({ mounting: '0', hoodSounder: 'prozory', colourLabel: 'NC' }),
    ).toBe('STI-13000NC')
  })

  it('builds correct code for color', () => {
    expect(
      buildUSModelCode({ mounting: '0', hoodSounder: 'color', colourLabel: 'FR' }),
    ).toBe('STI-13010FR')
  })

  it('builds correct code for sounder_battery', () => {
    expect(
      buildUSModelCode({
        mounting: '1',
        hoodSounder: 'sounder_battery',
        colourLabel: 'EG',
      }),
    ).toBe('STI-13120EG')
  })

  it('builds correct code for sounder_dc', () => {
    expect(
      buildUSModelCode({ mounting: '0', hoodSounder: 'sounder_dc', colourLabel: 'EG' }),
    ).toBe('STI-13030EG')
  })

  it('builds correct code for sounder_relay_battery', () => {
    expect(
      buildUSModelCode({
        mounting: '1',
        hoodSounder: 'sounder_relay_battery',
        colourLabel: 'FR',
      }),
    ).toBe('STI-13130FR')
  })

  it('sounder_dc and sounder_relay_battery both produce SKU segment 30', () => {
    const dc = buildUSModelCode({
      mounting: '0',
      hoodSounder: 'sounder_dc',
      colourLabel: 'CR',
    })
    const relay = buildUSModelCode({
      mounting: '1',
      hoodSounder: 'sounder_relay_battery',
      colourLabel: 'CR',
    })
    expect(dc).toBe('STI-13030CR')
    expect(relay).toBe('STI-13130CR')
    expect(dc!.slice(6, 8)).toBe('30')
    expect(relay!.slice(6, 8)).toBe('30')
  })

  it('returns null when required fields are missing', () => {
    expect(buildUSModelCode({ mounting: '0', hoodSounder: 'color' })).toBeNull()
    expect(buildUSModelCode({ mounting: '0', colourLabel: 'FR' })).toBeNull()
    expect(buildUSModelCode({ hoodSounder: 'color', colourLabel: 'FR' })).toBeNull()
    expect(buildUSModelCode({})).toBeNull()
  })

  it('returns null for unknown hoodSounder id', () => {
    expect(
      buildUSModelCode({ mounting: '0', hoodSounder: 'unknown', colourLabel: 'FR' }),
    ).toBeNull()
  })
})

describe('parseUSModelCode', () => {
  it('parses STI-13000NC as prozory', () => {
    expect(parseUSModelCode('STI-13000NC')).toEqual({
      mounting: '0',
      hoodSounder: 'prozory',
      colourLabel: 'NC',
    })
  })

  it('parses STI-13010FR as color', () => {
    expect(parseUSModelCode('STI-13010FR')).toEqual({
      mounting: '0',
      hoodSounder: 'color',
      colourLabel: 'FR',
    })
  })

  it('parses STI-13020FR as sounder_battery', () => {
    expect(parseUSModelCode('STI-13020FR')).toEqual({
      mounting: '0',
      hoodSounder: 'sounder_battery',
      colourLabel: 'FR',
    })
  })

  it('parses STI-13030EG as sounder_dc (flush + segment 30)', () => {
    expect(parseUSModelCode('STI-13030EG')).toEqual({
      mounting: '0',
      hoodSounder: 'sounder_dc',
      colourLabel: 'EG',
    })
  })

  it('parses STI-13130FR as sounder_relay_battery (surface + segment 30)', () => {
    expect(parseUSModelCode('STI-13130FR')).toEqual({
      mounting: '1',
      hoodSounder: 'sounder_relay_battery',
      colourLabel: 'FR',
    })
  })

  it('parses STI-13230FR as sounder_relay_battery (frame + segment 30)', () => {
    expect(parseUSModelCode('STI-13230FR')).toEqual({
      mounting: '2',
      hoodSounder: 'sounder_relay_battery',
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

  it('round-trips all VALID_MODEL_CODES: parse → build = original', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseUSModelCode(code)!
      const rebuilt = buildUSModelCode(parsed)
      expect(rebuilt).toBe(code)
    }
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

  it('contains expected codes from product list', () => {
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
      isValidUSCombination({ mounting: '0', hoodSounder: 'color', colourLabel: 'FR' }),
    ).toEqual({ valid: true })
    expect(
      isValidUSCombination({
        mounting: '1',
        hoodSounder: 'sounder_battery',
        colourLabel: 'EG',
      }),
    ).toEqual({ valid: true })
    expect(
      isValidUSCombination({
        mounting: '2',
        hoodSounder: 'sounder_relay_battery',
        colourLabel: 'FR',
      }),
    ).toEqual({ valid: true })
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidUSCombination({ mounting: '0' })).toEqual({ valid: true })
    expect(isValidUSCombination({})).toEqual({ valid: true })
  })

  it('returns invalid for non-existent combination', () => {
    const result = isValidUSCombination({
      mounting: '2',
      hoodSounder: 'prozory',
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

  it('prozory only valid with mounting 0 or 1', () => {
    const valid = getValidUSOptionsForStep('mounting', { hoodSounder: 'prozory' })
    expect(valid).toContain('0')
    expect(valid).toContain('1')
    expect(valid).not.toContain('2')
  })

  it('NC colourLabel only valid with prozory', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { colourLabel: 'NC' })
    expect(valid).toEqual(['prozory'])
  })

  it('sounder_relay_battery available for mounting 1', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { mounting: '1' })
    expect(valid).toContain('sounder_relay_battery')
  })

  it('sounder_relay_battery not available for mounting 0', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { mounting: '0' })
    expect(valid).not.toContain('sounder_relay_battery')
  })

  it('sounder_dc only available for mounting 0', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { mounting: '0' })
    expect(valid).toContain('sounder_dc')

    expect(getValidUSOptionsForStep('hoodSounder', { mounting: '1' })).not.toContain(
      'sounder_dc',
    )
    expect(getValidUSOptionsForStep('hoodSounder', { mounting: '2' })).not.toContain(
      'sounder_dc',
    )
  })

  it('mounting=0 has 4 hoodSounder options', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { mounting: '0' })
    expect(valid.sort()).toEqual(['color', 'prozory', 'sounder_battery', 'sounder_dc'])
  })

  it('mounting=1 has 4 hoodSounder options', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { mounting: '1' })
    expect(valid.sort()).toEqual([
      'color',
      'prozory',
      'sounder_battery',
      'sounder_relay_battery',
    ])
  })

  it('mounting=2 has 3 hoodSounder options', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { mounting: '2' })
    expect(valid.sort()).toEqual(['color', 'sounder_battery', 'sounder_relay_battery'])
  })

  it('all 5 hoodSounder options when nothing selected', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', {})
    expect(valid.sort()).toEqual([
      'color',
      'prozory',
      'sounder_battery',
      'sounder_dc',
      'sounder_relay_battery',
    ])
  })

  it('sounder_dc restricts colourLabel to 5 options', () => {
    const valid = getValidUSOptionsForStep('colourLabel', { hoodSounder: 'sounder_dc' })
    expect(valid.sort()).toEqual(['CG', 'CR', 'EG', 'NG', 'NR'])
  })

  it('sounder_dc restricts mounting to only 0', () => {
    const valid = getValidUSOptionsForStep('mounting', { hoodSounder: 'sounder_dc' })
    expect(valid).toEqual(['0'])
  })
})

describe('UNIVERSAL_STOPPER_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(UNIVERSAL_STOPPER_CONSTRAINTS)

  it('blocks prozory when mounting=2', () => {
    const result = engine.checkOptionAvailability('hoodSounder', 'prozory', {
      mounting: '2',
    })
    expect(result.available).toBe(false)
  })

  it('allows prozory when mounting=0', () => {
    const result = engine.checkOptionAvailability('hoodSounder', 'prozory', {
      mounting: '0',
    })
    expect(result.available).toBe(true)
  })

  it('allows sounder_relay_battery when mounting=1', () => {
    const result = engine.checkOptionAvailability(
      'hoodSounder',
      'sounder_relay_battery',
      { mounting: '1' },
    )
    expect(result.available).toBe(true)
  })

  it('blocks sounder_relay_battery when mounting=0', () => {
    const result = engine.checkOptionAvailability(
      'hoodSounder',
      'sounder_relay_battery',
      { mounting: '0' },
    )
    expect(result.available).toBe(false)
  })

  it('blocks sounder_dc when mounting=1', () => {
    const result = engine.checkOptionAvailability('hoodSounder', 'sounder_dc', {
      mounting: '1',
    })
    expect(result.available).toBe(false)
  })

  it('allows sounder_dc when mounting=0', () => {
    const result = engine.checkOptionAvailability('hoodSounder', 'sounder_dc', {
      mounting: '0',
    })
    expect(result.available).toBe(true)
  })

  it('blocks NC colourLabel when hoodSounder=color', () => {
    const result = engine.checkOptionAvailability('colourLabel', 'NC', {
      hoodSounder: 'color',
    })
    expect(result.available).toBe(false)
  })

  it('allows NC colourLabel when hoodSounder=prozory', () => {
    const result = engine.checkOptionAvailability('colourLabel', 'NC', {
      hoodSounder: 'prozory',
    })
    expect(result.available).toBe(true)
  })

  it('constraint engine modelId matches', () => {
    expect(UNIVERSAL_STOPPER_CONSTRAINTS.modelId).toBe('universal-stopper')
  })
})

describe('buildProductModel — universalStopper', () => {
  it('builds correct SKU for color option', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: 'color',
      colourLabel: 'FR',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13010FR')
    expect(result.isComplete).toBe(true)
  })

  it('builds correct SKU for sounder_relay_battery', () => {
    const config: Configuration = {
      mounting: '1',
      hoodSounder: 'sounder_relay_battery',
      colourLabel: 'FR',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13130FR')
    expect(result.isComplete).toBe(true)
  })

  it('builds correct SKU for sounder_dc', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: 'sounder_dc',
      colourLabel: 'EG',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13030EG')
    expect(result.isComplete).toBe(true)
  })

  it('builds correct SKU for prozory', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: 'prozory',
      colourLabel: 'NC',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13000NC')
    expect(result.isComplete).toBe(true)
  })

  it('builds correct SKU for sounder_battery', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: 'sounder_battery',
      colourLabel: 'FR',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13020FR')
    expect(result.isComplete).toBe(true)
  })

  it('builds correct SKU for frame mount + sounder_relay_battery', () => {
    const config: Configuration = {
      mounting: '2',
      hoodSounder: 'sounder_relay_battery',
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
      colourLabel: null,
    }
    expect(buildProductModel(config, universalStopperModel).baseCode).toBe('STI-13')
  })

  it('bijection: all 72 VALID_MODEL_CODES are generated from parsed configurations', () => {
    const generated = new Set<string>()
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseUSModelCode(code)!
      const config: Configuration = {
        mounting: parsed.mounting!,
        hoodSounder: parsed.hoodSounder!,
        colourLabel: parsed.colourLabel!,
      }
      const result = buildProductModel(config, universalStopperModel)
      generated.add(result.fullCode)
    }
    expect(generated.size).toBe(72)
    for (const code of VALID_MODEL_CODES) {
      expect(generated.has(code)).toBe(true)
    }
  })
})

describe('isConfigurationComplete — universalStopper', () => {
  it('returns true when all 3 steps selected', () => {
    expect(
      isConfigurationComplete(universalStopperModel, {
        mounting: '0',
        hoodSounder: 'color',
        colourLabel: 'FR',
      }),
    ).toBe(true)
  })

  it('returns true for sounder_dc combination', () => {
    expect(
      isConfigurationComplete(universalStopperModel, {
        mounting: '0',
        hoodSounder: 'sounder_dc',
        colourLabel: 'EG',
      }),
    ).toBe(true)
  })

  it('returns false when colourLabel is missing', () => {
    expect(
      isConfigurationComplete(universalStopperModel, {
        mounting: '0',
        hoodSounder: 'color',
        colourLabel: null,
      }),
    ).toBe(false)
  })

  it('returns false when all steps are empty', () => {
    expect(
      isConfigurationComplete(universalStopperModel, {
        mounting: null,
        hoodSounder: null,
        colourLabel: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps lists unselected steps', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: null,
      colourLabel: null,
    }
    const missing = getMissingRequiredSteps(universalStopperModel, config)
    expect(missing).toContain('hoodSounder')
    expect(missing).toContain('colourLabel')
    expect(missing).not.toContain('mounting')
  })

  it('getCompletionPercentage 100% when all 3 steps selected', () => {
    expect(
      getCompletionPercentage(universalStopperModel, {
        mounting: '0',
        hoodSounder: 'color',
        colourLabel: 'FR',
      }),
    ).toBe(100)
  })

  it('getCompletionPercentage 33% when 1 of 3 steps selected', () => {
    expect(
      getCompletionPercentage(universalStopperModel, {
        mounting: '0',
        hoodSounder: null,
        colourLabel: null,
      }),
    ).toBeCloseTo(33, 0)
  })
})

describe('universalStopperModel definition', () => {
  it('has correct model id and slug', () => {
    expect(universalStopperModel.id).toBe('universal-stopper')
    expect(universalStopperModel.slug).toBe('universal-stopper')
  })

  it('has 3 steps in stepOrder', () => {
    expect(universalStopperModel.stepOrder).toEqual([
      'mounting',
      'hoodSounder',
      'colourLabel',
    ])
  })

  it('partsOrder matches stepOrder', () => {
    expect(universalStopperModel.productModelSchema.partsOrder).toEqual([
      'mounting',
      'hoodSounder',
      'colourLabel',
    ])
  })

  it('has no codeLookup', () => {
    expect(universalStopperModel.productModelSchema.codeLookup).toBeUndefined()
  })

  it('all steps are required', () => {
    for (const step of universalStopperModel.steps) {
      expect(step.required).toBe(true)
    }
  })

  it('hoodSounder has 5 options', () => {
    const hoodStep = universalStopperModel.steps.find((s) => s.id === 'hoodSounder')!
    expect(hoodStep.options.map((o) => o.id)).toEqual([
      'prozory',
      'color',
      'sounder_battery',
      'sounder_dc',
      'sounder_relay_battery',
    ])
  })

  it('hoodSounder option codes: sounder_dc and sounder_relay_battery both map to 30', () => {
    const hoodStep = universalStopperModel.steps.find((s) => s.id === 'hoodSounder')!
    const dcOpt = hoodStep.options.find((o) => o.id === 'sounder_dc')!
    const relayOpt = hoodStep.options.find((o) => o.id === 'sounder_relay_battery')!
    expect(dcOpt.code).toBe('30')
    expect(relayOpt.code).toBe('30')
  })

  it('no power step exists', () => {
    const powerStep = universalStopperModel.steps.find((s) => s.id === 'power')
    expect(powerStep).toBeUndefined()
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
})

describe('symmetric filtering', () => {
  it('selecting sounder_dc first restricts mounting to 0 only', () => {
    const mountings = getValidUSOptionsForStep('mounting', { hoodSounder: 'sounder_dc' })
    expect(mountings).toEqual(['0'])
  })

  it('selecting sounder_dc first restricts colourLabel to 5 options', () => {
    const labels = getValidUSOptionsForStep('colourLabel', { hoodSounder: 'sounder_dc' })
    expect(labels.sort()).toEqual(['CG', 'CR', 'EG', 'NG', 'NR'])
  })

  it('selecting sounder_relay_battery restricts mounting to 1 and 2', () => {
    const mountings = getValidUSOptionsForStep('mounting', {
      hoodSounder: 'sounder_relay_battery',
    })
    expect(mountings.sort()).toEqual(['1', '2'])
  })

  it('selecting CK restricts hoodSounder to color only', () => {
    const hoods = getValidUSOptionsForStep('hoodSounder', { colourLabel: 'CK' })
    expect(hoods).toEqual(['color'])
  })

  it('selecting NC restricts hoodSounder to prozory only', () => {
    const hoods = getValidUSOptionsForStep('hoodSounder', { colourLabel: 'NC' })
    expect(hoods).toEqual(['prozory'])
  })

  it('selecting mounting=2 + sounder_relay_battery restricts colourLabel', () => {
    const labels = getValidUSOptionsForStep('colourLabel', {
      mounting: '2',
      hoodSounder: 'sounder_relay_battery',
    })
    expect(labels.sort()).toEqual(['CB', 'CG', 'FR', 'NB'])
  })

  it('selecting FR restricts hoodSounder (no prozory, no sounder_dc)', () => {
    const hoods = getValidUSOptionsForStep('hoodSounder', { colourLabel: 'FR' })
    expect(hoods).not.toContain('prozory')
    expect(hoods).not.toContain('sounder_dc')
    expect(hoods).toContain('color')
    expect(hoods).toContain('sounder_battery')
    expect(hoods).toContain('sounder_relay_battery')
  })
})

describe('getVisibleSteps — universalStopper', () => {
  it('always shows 3 steps', () => {
    const config: Configuration = {
      mounting: null,
      hoodSounder: null,
      colourLabel: null,
    }
    const visible = getVisibleSteps(universalStopperModel, config)
    expect(visible.map((s) => s.id)).toEqual(['mounting', 'hoodSounder', 'colourLabel'])
  })

  it('no power step in visible steps', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: 'sounder_battery',
      colourLabel: null,
    }
    const visible = getVisibleSteps(universalStopperModel, config)
    expect(visible.map((s) => s.id)).not.toContain('power')
  })
})
