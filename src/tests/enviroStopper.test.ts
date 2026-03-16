import { describe, it, expect } from 'vitest'
import {
  buildESModelCode,
  parseESModelCode,
  isValidESCombination,
  getValidESOptionsForStep,
  VALID_MODEL_CODES,
  ENVIRO_STOPPER_CONSTRAINTS,
} from '@entities/product/rules/enviroStopperRules'
import { enviroStopperModel } from '@entities/product/models/enviroStopper'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

// ─────────────────────────────────────────────────────────────
// buildESModelCode
// ─────────────────────────────────────────────────────────────

describe('buildESModelCode', () => {
  it('builds dome sealed no-hood clear — STI-13600NC', () => {
    expect(
      buildESModelCode({
        cover: '13',
        mounting: '6',
        hoodSounder: '00',
        colourLabel: 'NC',
      }),
    ).toBe('STI-13600NC')
  })

  it('builds dome sealed label hood fire red — STI-13610FR', () => {
    expect(
      buildESModelCode({
        cover: '13',
        mounting: '6',
        hoodSounder: '10',
        colourLabel: 'FR',
      }),
    ).toBe('STI-13610FR')
  })

  it('builds low-profile open sounder relay green — STI-14730EG', () => {
    expect(
      buildESModelCode({
        cover: '14',
        mounting: '7',
        hoodSounder: '30',
        colourLabel: 'EG',
      }),
    ).toBe('STI-14730EG')
  })

  it('builds dome open label hood red no label — STI-13710NR', () => {
    expect(
      buildESModelCode({
        cover: '13',
        mounting: '7',
        hoodSounder: '10',
        colourLabel: 'NR',
      }),
    ).toBe('STI-13710NR')
  })

  it('returns null when any field is missing', () => {
    expect(buildESModelCode({ cover: '13', mounting: '6', hoodSounder: '00' })).toBeNull()
    expect(buildESModelCode({ cover: '13', mounting: '6', colourLabel: 'NC' })).toBeNull()
    expect(
      buildESModelCode({ cover: '13', hoodSounder: '00', colourLabel: 'NC' }),
    ).toBeNull()
    expect(
      buildESModelCode({ mounting: '6', hoodSounder: '00', colourLabel: 'NC' }),
    ).toBeNull()
    expect(buildESModelCode({})).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// parseESModelCode
// ─────────────────────────────────────────────────────────────

describe('parseESModelCode', () => {
  it('parses STI-13600NC correctly', () => {
    expect(parseESModelCode('STI-13600NC')).toEqual({
      cover: '13',
      mounting: '6',
      hoodSounder: '00',
      colourLabel: 'NC',
    })
  })

  it('parses STI-14730EG correctly', () => {
    expect(parseESModelCode('STI-14730EG')).toEqual({
      cover: '14',
      mounting: '7',
      hoodSounder: '30',
      colourLabel: 'EG',
    })
  })

  it('parses STI-13710NR correctly — corrected assumption', () => {
    expect(parseESModelCode('STI-13710NR')).toEqual({
      cover: '13',
      mounting: '7',
      hoodSounder: '10',
      colourLabel: 'NR',
    })
  })

  it('returns null for invalid format', () => {
    expect(parseESModelCode('INVALID')).toBeNull()
    expect(parseESModelCode('STI-136NC')).toBeNull()
    expect(parseESModelCode('STI-13600N')).toBeNull()
    expect(parseESModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseESModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildESModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 44 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(44)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(44)
  })

  it('all codes match STI-{2d}{1d}{2d}{2A} format', () => {
    const pattern = /^STI-\d{2}\d\d{2}[A-Z]{2}$/
    for (const code of VALID_MODEL_CODES) {
      expect(code).toMatch(pattern)
    }
  })

  it('dome cover (13) codes: 35 entries', () => {
    const dome = VALID_MODEL_CODES.filter((c) => parseESModelCode(c)?.cover === '13')
    expect(dome.length).toBe(35)
  })

  it('low-profile cover (14) codes: 9 entries', () => {
    const low = VALID_MODEL_CODES.filter((c) => parseESModelCode(c)?.cover === '14')
    expect(low.length).toBe(9)
  })

  it('NK and CK colour labels absent from allowlist', () => {
    const hasNK = VALID_MODEL_CODES.some((c) => c.endsWith('NK'))
    const hasCK = VALID_MODEL_CODES.some((c) => c.endsWith('CK'))
    expect(hasNK).toBe(false)
    expect(hasCK).toBe(false)
  })

  it('NR colour label only appears with dome open mounting (STI-137xxNR)', () => {
    const nrCodes = VALID_MODEL_CODES.filter((c) => c.endsWith('NR'))
    for (const code of nrCodes) {
      const parsed = parseESModelCode(code)!
      expect(parsed.cover).toBe('13')
      expect(parsed.mounting).toBe('7')
    }
  })

  it('low-profile cover has no sounder 9V (hoodSounder=20)', () => {
    const lowProfileWithSounder20 = VALID_MODEL_CODES.filter((c) => {
      const parsed = parseESModelCode(c)
      return parsed?.cover === '14' && parsed?.hoodSounder === '20'
    })
    expect(lowProfileWithSounder20.length).toBe(0)
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseESModelCode(code)).not.toBeNull()
    }
  })
})

// ─────────────────────────────────────────────────────────────
// isValidESCombination
// ─────────────────────────────────────────────────────────────

describe('isValidESCombination', () => {
  it('all 44 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseESModelCode(code)!
      expect(isValidESCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidESCombination({})).toEqual({ valid: true })
    expect(isValidESCombination({ cover: '13' })).toEqual({ valid: true })
    expect(isValidESCombination({ cover: '14', mounting: '6' })).toEqual({ valid: true })
  })

  it('rejects low-profile cover with sounder 9V — not in allowlist', () => {
    const result = isValidESCombination({
      cover: '14',
      mounting: '6',
      hoodSounder: '20',
      colourLabel: 'FR',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.reason).toContain('STI-14620FR')
    }
  })

  it('rejects NR colour label with sealed mounting (6)', () => {
    const result = isValidESCombination({
      cover: '13',
      mounting: '6',
      hoodSounder: '10',
      colourLabel: 'NR',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects NK colour label — never in allowlist', () => {
    const result = isValidESCombination({
      cover: '13',
      mounting: '6',
      hoodSounder: '10',
      colourLabel: 'NK',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects CK colour label — never in allowlist', () => {
    const result = isValidESCombination({
      cover: '13',
      mounting: '7',
      hoodSounder: '10',
      colourLabel: 'CK',
    })
    expect(result.valid).toBe(false)
  })

  it('accepts STI-13710NR — corrected from MD duplicate', () => {
    const result = isValidESCombination({
      cover: '13',
      mounting: '7',
      hoodSounder: '10',
      colourLabel: 'NR',
    })
    expect(result).toEqual({ valid: true })
  })
})

// ─────────────────────────────────────────────────────────────
// getValidESOptionsForStep
// ─────────────────────────────────────────────────────────────

describe('getValidESOptionsForStep', () => {
  it('returns both covers when nothing selected', () => {
    const valid = getValidESOptionsForStep('cover', {})
    expect(valid).toContain('13')
    expect(valid).toContain('14')
  })

  it('cover 14 does not allow hoodSounder=20', () => {
    const valid = getValidESOptionsForStep('hoodSounder', { cover: '14' })
    expect(valid).not.toContain('20')
    expect(valid).toContain('00')
    expect(valid).toContain('10')
    expect(valid).toContain('30')
  })

  it('cover 13 allows all hoodSounder options', () => {
    const valid = getValidESOptionsForStep('hoodSounder', { cover: '13' })
    expect(valid).toContain('00')
    expect(valid).toContain('10')
    expect(valid).toContain('20')
    expect(valid).toContain('30')
  })

  it('hoodSounder=00 only allows NC colourLabel', () => {
    const valid = getValidESOptionsForStep('colourLabel', { hoodSounder: '00' })
    expect(valid).toEqual(['NC'])
  })

  it('NC colourLabel only allows hoodSounder=00', () => {
    const valid = getValidESOptionsForStep('hoodSounder', { colourLabel: 'NC' })
    expect(valid).toEqual(['00'])
  })

  it('NR colourLabel only valid with mounting=7', () => {
    const valid = getValidESOptionsForStep('mounting', { colourLabel: 'NR' })
    expect(valid).toEqual(['7'])
  })

  it('hoodSounder=30 only allows FR and EG colourLabels', () => {
    const valid = getValidESOptionsForStep('colourLabel', { hoodSounder: '30' })
    expect(valid).toContain('FR')
    expect(valid).toContain('EG')
    expect(valid).not.toContain('CR')
    expect(valid).not.toContain('NC')
    expect(valid).not.toContain('NR')
    expect(valid).not.toContain('NK')
  })

  it('NK and CK never appear as valid options for any combination', () => {
    const combinations = [
      { cover: '13' },
      { cover: '14' },
      { mounting: '6' },
      { mounting: '7' },
      { hoodSounder: '10' },
      { hoodSounder: '20' },
    ]
    for (const selection of combinations) {
      const valid = getValidESOptionsForStep('colourLabel', selection)
      expect(valid).not.toContain('NK')
      expect(valid).not.toContain('CK')
    }
  })

  it('cover 14 has fewer colourLabel options than cover 13', () => {
    const cover13 = getValidESOptionsForStep('colourLabel', { cover: '13' })
    const cover14 = getValidESOptionsForStep('colourLabel', { cover: '14' })
    expect(cover14.length).toBeLessThan(cover13.length)
  })
})

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe('ENVIRO_STOPPER_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(ENVIRO_STOPPER_CONSTRAINTS)

  it('blocks hoodSounder=20 when cover=14', () => {
    const result = engine.checkOptionAvailability('hoodSounder', '20', { cover: '14' })
    expect(result.available).toBe(false)
  })

  it('allows hoodSounder=20 when cover=13', () => {
    const result = engine.checkOptionAvailability('hoodSounder', '20', { cover: '13' })
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

  it('blocks NR colourLabel when mounting=6', () => {
    const result = engine.checkOptionAvailability('colourLabel', 'NR', { mounting: '6' })
    expect(result.available).toBe(false)
  })

  it('allows NR colourLabel when mounting=7', () => {
    const result = engine.checkOptionAvailability('colourLabel', 'NR', { mounting: '7' })
    expect(result.available).toBe(true)
  })

  it('blocks CR and CB colourLabels when cover=14', () => {
    for (const colour of ['CR', 'CB']) {
      const result = engine.checkOptionAvailability('colourLabel', colour, {
        cover: '14',
      })
      expect(result.available).toBe(false)
    }
  })

  it('hoodSounder=30 only allows FR and EG via constraint matrix', () => {
    const allColours = [
      'FR',
      'EG',
      'CR',
      'CG',
      'CY',
      'CW',
      'CB',
      'NC',
      'NR',
      'NG',
      'NY',
      'NW',
      'NB',
    ]
    for (const colour of allColours) {
      const result = engine.checkOptionAvailability('colourLabel', colour, {
        hoodSounder: '30',
      })
      if (colour === 'FR' || colour === 'EG') {
        expect(result.available).toBe(true)
      } else {
        expect(result.available).toBe(false)
      }
    }
  })

  it('constraint engine modelId matches', () => {
    expect(ENVIRO_STOPPER_CONSTRAINTS.modelId).toBe('enviro-stopper')
  })
})

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe('buildProductModel — enviroStopper', () => {
  it('builds STI-13600NC correctly', () => {
    const config: Configuration = {
      cover: '13',
      mounting: '6',
      hoodSounder: '00',
      colourLabel: 'NC',
    }
    const result = buildProductModel(config, enviroStopperModel)
    expect(result.fullCode).toBe('STI-13600NC')
    expect(result.isComplete).toBe(true)
  })

  it('builds STI-14730EG correctly', () => {
    const config: Configuration = {
      cover: '14',
      mounting: '7',
      hoodSounder: '30',
      colourLabel: 'EG',
    }
    const result = buildProductModel(config, enviroStopperModel)
    expect(result.fullCode).toBe('STI-14730EG')
    expect(result.isComplete).toBe(true)
  })

  it('cover separator is dash, others have none', () => {
    const config: Configuration = {
      cover: '13',
      mounting: '6',
      hoodSounder: '10',
      colourLabel: 'FR',
    }
    const result = buildProductModel(config, enviroStopperModel)
    expect(result.fullCode).toBe('STI-13610FR')
    expect(result.fullCode).toContain('-13')
    expect(result.fullCode).not.toContain('-6')
    expect(result.fullCode).not.toContain('-10')
    expect(result.fullCode).not.toContain('-FR')
  })

  it('baseCode is STI', () => {
    const config: Configuration = {
      cover: null,
      mounting: null,
      hoodSounder: null,
      colourLabel: null,
    }
    const result = buildProductModel(config, enviroStopperModel)
    expect(result.baseCode).toBe('STI')
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = {
      cover: '13',
      mounting: '6',
      hoodSounder: null,
      colourLabel: null,
    }
    const result = buildProductModel(config, enviroStopperModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('hoodSounder')
    expect(result.missingSteps).toContain('colourLabel')
  })

  it('all 44 valid codes generated from parsed configurations', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0

    for (const code of VALID_MODEL_CODES) {
      const parsed = parseESModelCode(code)!
      const config: Configuration = {
        cover: parsed.cover ?? null,
        mounting: parsed.mounting ?? null,
        hoodSounder: parsed.hoodSounder ?? null,
        colourLabel: parsed.colourLabel ?? null,
      }
      const result = buildProductModel(config, enviroStopperModel)
      if (validSet.has(result.fullCode)) matchCount++
    }

    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — enviroStopper
// ─────────────────────────────────────────────────────────────

describe('isConfigurationComplete — enviroStopper', () => {
  it('returns true when all four steps selected', () => {
    const config: Configuration = {
      cover: '13',
      mounting: '6',
      hoodSounder: '00',
      colourLabel: 'NC',
    }
    expect(isConfigurationComplete(enviroStopperModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(enviroStopperModel, {
        cover: '13',
        mounting: '6',
        hoodSounder: '00',
        colourLabel: null,
      }),
    ).toBe(false)

    expect(
      isConfigurationComplete(enviroStopperModel, {
        cover: null,
        mounting: null,
        hoodSounder: null,
        colourLabel: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = {
      cover: '13',
      mounting: '6',
      hoodSounder: null,
      colourLabel: null,
    }
    const missing = getMissingRequiredSteps(enviroStopperModel, config)
    expect(missing).toContain('hoodSounder')
    expect(missing).toContain('colourLabel')
    expect(missing).not.toContain('cover')
    expect(missing).not.toContain('mounting')
  })

  it('getCompletionPercentage returns correct percentages for 4-step model', () => {
    expect(
      getCompletionPercentage(enviroStopperModel, {
        cover: null,
        mounting: null,
        hoodSounder: null,
        colourLabel: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(enviroStopperModel, {
        cover: '13',
        mounting: null,
        hoodSounder: null,
        colourLabel: null,
      }),
    ).toBe(25)

    expect(
      getCompletionPercentage(enviroStopperModel, {
        cover: '13',
        mounting: '6',
        hoodSounder: null,
        colourLabel: null,
      }),
    ).toBe(50)

    expect(
      getCompletionPercentage(enviroStopperModel, {
        cover: '13',
        mounting: '6',
        hoodSounder: '10',
        colourLabel: null,
      }),
    ).toBe(75)

    expect(
      getCompletionPercentage(enviroStopperModel, {
        cover: '13',
        mounting: '6',
        hoodSounder: '00',
        colourLabel: 'NC',
      }),
    ).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe('enviroStopperModel definition', () => {
  it('has correct model id and slug', () => {
    expect(enviroStopperModel.id).toBe('enviro-stopper')
    expect(enviroStopperModel.slug).toBe('enviro-stopper')
  })

  it('has 4 steps in stepOrder', () => {
    expect(enviroStopperModel.stepOrder).toHaveLength(4)
    expect(enviroStopperModel.stepOrder).toEqual([
      'cover',
      'mounting',
      'hoodSounder',
      'colourLabel',
    ])
  })

  it('all steps are required', () => {
    for (const step of enviroStopperModel.steps) {
      expect(step.required).toBe(true)
    }
  })

  it('baseCode is STI', () => {
    expect(enviroStopperModel.productModelSchema.baseCode).toBe('STI')
  })

  it('separatorMap: cover uses dash, others have none', () => {
    const { separatorMap } = enviroStopperModel.productModelSchema
    expect(separatorMap?.cover).toBe('-')
    expect(separatorMap?.mounting).toBe('')
    expect(separatorMap?.hoodSounder).toBe('')
    expect(separatorMap?.colourLabel).toBe('')
  })

  it('model definition includes NK and CK options not in allowlist', () => {
    const colourStep = enviroStopperModel.steps.find((s) => s.id === 'colourLabel')!
    const ids = colourStep.options.map((o) => o.id)
    expect(ids).toContain('NK')
    expect(ids).toContain('CK')
  })

  it('colourLabel step has 15 options in definition', () => {
    const colourStep = enviroStopperModel.steps.find((s) => s.id === 'colourLabel')!
    expect(colourStep.options).toHaveLength(15)
  })
})
