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
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

// ─────────────────────────────────────────────────────────────
// buildUSModelCode
// ─────────────────────────────────────────────────────────────

describe('buildUSModelCode', () => {
  it('builds correct code from full selection', () => {
    expect(
      buildUSModelCode({ mounting: '0', hoodSounder: '10', colourLabel: 'FR' }),
    ).toBe('STI-13010FR')
  })

  it('builds correct code for surface mount with sounder', () => {
    expect(
      buildUSModelCode({ mounting: '1', hoodSounder: '20', colourLabel: 'EG' }),
    ).toBe('STI-13120EG')
  })

  it('returns null when any field is missing', () => {
    expect(buildUSModelCode({ mounting: '0', hoodSounder: '10' })).toBeNull()
    expect(buildUSModelCode({ mounting: '0', colourLabel: 'FR' })).toBeNull()
    expect(buildUSModelCode({ hoodSounder: '10', colourLabel: 'FR' })).toBeNull()
    expect(buildUSModelCode({})).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// parseUSModelCode
// ─────────────────────────────────────────────────────────────

describe('parseUSModelCode', () => {
  it('parses valid code correctly', () => {
    expect(parseUSModelCode('STI-13010FR')).toEqual({
      mounting: '0',
      hoodSounder: '10',
      colourLabel: 'FR',
    })
  })

  it('parses all mounting variants', () => {
    expect(parseUSModelCode('STI-13110FR')?.mounting).toBe('1')
    expect(parseUSModelCode('STI-13210FR')?.mounting).toBe('2')
  })

  it('parses all hoodSounder variants', () => {
    expect(parseUSModelCode('STI-13000NC')?.hoodSounder).toBe('00')
    expect(parseUSModelCode('STI-13020FR')?.hoodSounder).toBe('20')
    expect(parseUSModelCode('STI-13030NR')?.hoodSounder).toBe('30')
  })

  it('returns null for invalid format', () => {
    expect(parseUSModelCode('INVALID')).toBeNull()
    expect(parseUSModelCode('STI-13-010-FR')).toBeNull()
    expect(parseUSModelCode('')).toBeNull()
    expect(parseUSModelCode('STI-13010')).toBeNull()
  })

  it('round-trips: build → parse → build', () => {
    const original = { mounting: '1', hoodSounder: '20', colourLabel: 'NB' }
    const code = buildUSModelCode(original)!
    const parsed = parseUSModelCode(code)
    expect(parsed).toEqual(original)
  })
})

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe('VALID_MODEL_CODES', () => {
  it('contains 67 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(67)
  })

  it('has no duplicates', () => {
    const unique = new Set(VALID_MODEL_CODES)
    expect(unique.size).toBe(VALID_MODEL_CODES.length)
  })

  it('all codes match expected format STI-13[0-2][0-3][A-Z]{2}', () => {
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
})

// ─────────────────────────────────────────────────────────────
// isValidUSCombination
// ─────────────────────────────────────────────────────────────

describe('isValidUSCombination', () => {
  it('returns valid for known good combinations', () => {
    expect(
      isValidUSCombination({ mounting: '0', hoodSounder: '10', colourLabel: 'FR' }),
    ).toEqual({
      valid: true,
    })
    expect(
      isValidUSCombination({ mounting: '1', hoodSounder: '20', colourLabel: 'EG' }),
    ).toEqual({
      valid: true,
    })
    expect(
      isValidUSCombination({ mounting: '2', hoodSounder: '30', colourLabel: 'FR' }),
    ).toEqual({
      valid: true,
    })
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

  it('returns invalid for mounting=2 with hoodSounder=00', () => {
    const result = isValidUSCombination({
      mounting: '2',
      hoodSounder: '00',
      colourLabel: 'NC',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.reason).toContain('STI-13200NC')
    }
  })

  it('all VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseUSModelCode(code)!
      expect(isValidUSCombination(parsed)).toEqual({ valid: true })
    }
  })
})

// ─────────────────────────────────────────────────────────────
// getValidUSOptionsForStep
// ─────────────────────────────────────────────────────────────

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

  it('CW colourLabel only valid with mounting=1', () => {
    const valid = getValidUSOptionsForStep('mounting', { colourLabel: 'CW' })
    expect(valid).toEqual(['1'])
  })

  it('CK colourLabel not valid with hoodSounder=20 or 30', () => {
    const valid = getValidUSOptionsForStep('hoodSounder', { colourLabel: 'CK' })
    expect(valid).not.toContain('20')
    expect(valid).not.toContain('30')
    expect(valid).toContain('10')
  })

  it('returns only options that lead to valid final codes', () => {
    const validColours = getValidUSOptionsForStep('colourLabel', {
      mounting: '2',
      hoodSounder: '30',
    })
    expect(validColours).toContain('FR')
    expect(validColours).toContain('CG')
    expect(validColours).not.toContain('NC')
    expect(validColours).not.toContain('NR')
  })
})

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

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

  it('constraint engine modelId matches', () => {
    expect(UNIVERSAL_STOPPER_CONSTRAINTS.modelId).toBe('universal-stopper')
  })
})

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe('buildProductModel — universalStopper', () => {
  it('builds correct SKU for flush mount, label hood, fire alarm red', () => {
    const config: Configuration = {
      mounting: '0',
      hoodSounder: '10',
      colourLabel: 'FR',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13010FR')
    expect(result.isComplete).toBe(true)
  })

  it('builds correct SKU for surface mount with sounder, green exit', () => {
    const config: Configuration = {
      mounting: '1',
      hoodSounder: '20',
      colourLabel: 'EG',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13120EG')
    expect(result.isComplete).toBe(true)
  })

  it('builds correct SKU for surface+frame, sounder+relay, red fire alarm', () => {
    const config: Configuration = {
      mounting: '2',
      hoodSounder: '30',
      colourLabel: 'FR',
    }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.fullCode).toBe('STI-13230FR')
    expect(result.isComplete).toBe(true)
  })

  it('baseCode is STI-13', () => {
    const config: Configuration = { mounting: null, hoodSounder: null, colourLabel: null }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.baseCode).toBe('STI-13')
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = { mounting: '0', hoodSounder: null, colourLabel: null }
    const result = buildProductModel(config, universalStopperModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('hoodSounder')
    expect(result.missingSteps).toContain('colourLabel')
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
          const config: Configuration = { mounting, hoodSounder, colourLabel }
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

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — universalStopper
// ─────────────────────────────────────────────────────────────

describe('isConfigurationComplete — universalStopper', () => {
  it('returns true when all three steps selected', () => {
    const config: Configuration = { mounting: '0', hoodSounder: '10', colourLabel: 'FR' }
    expect(isConfigurationComplete(universalStopperModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(universalStopperModel, {
        mounting: '0',
        hoodSounder: '10',
        colourLabel: null,
      }),
    ).toBe(false)

    expect(
      isConfigurationComplete(universalStopperModel, {
        mounting: null,
        hoodSounder: null,
        colourLabel: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = { mounting: '0', hoodSounder: null, colourLabel: null }
    const missing = getMissingRequiredSteps(universalStopperModel, config)
    expect(missing).toContain('hoodSounder')
    expect(missing).toContain('colourLabel')
    expect(missing).not.toContain('mounting')
  })

  it('getCompletionPercentage returns correct percentages', () => {
    expect(
      getCompletionPercentage(universalStopperModel, {
        mounting: null,
        hoodSounder: null,
        colourLabel: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(universalStopperModel, {
        mounting: '0',
        hoodSounder: null,
        colourLabel: null,
      }),
    ).toBe(33)

    expect(
      getCompletionPercentage(universalStopperModel, {
        mounting: '0',
        hoodSounder: '10',
        colourLabel: null,
      }),
    ).toBe(67)

    expect(
      getCompletionPercentage(universalStopperModel, {
        mounting: '0',
        hoodSounder: '10',
        colourLabel: 'FR',
      }),
    ).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe('universalStopperModel definition', () => {
  it('has correct model id and slug', () => {
    expect(universalStopperModel.id).toBe('universal-stopper')
    expect(universalStopperModel.slug).toBe('universal-stopper')
  })

  it('stepOrder matches steps', () => {
    const stepIds = universalStopperModel.steps.map((s) => s.id)
    for (const stepId of universalStopperModel.stepOrder) {
      expect(stepIds).toContain(stepId)
    }
  })

  it('all steps are required', () => {
    for (const step of universalStopperModel.steps) {
      expect(step.required).toBe(true)
    }
  })

  it('baseCode is STI-13', () => {
    expect(universalStopperModel.productModelSchema.baseCode).toBe('STI-13')
  })

  it('partsOrder matches stepOrder', () => {
    expect(universalStopperModel.productModelSchema.partsOrder).toEqual(
      universalStopperModel.stepOrder,
    )
  })

  it('all option codes match SKU segment format', () => {
    const mountingCodes = universalStopperModel.steps
      .find((s) => s.id === 'mounting')!
      .options.map((o) => o.code)
    expect(mountingCodes).toEqual(['0', '1', '2'])

    const hoodCodes = universalStopperModel.steps
      .find((s) => s.id === 'hoodSounder')!
      .options.map((o) => o.code)
    expect(hoodCodes).toEqual(['00', '10', '20', '30'])
  })
})
