import { describe, it, expect } from 'vitest'
import {
  buildEUSModelCode,
  parseEUSModelCode,
  isValidEUSCombination,
  getValidEUSOptionsForStep,
  VALID_MODEL_CODES,
  EURO_STOPPER_CONSTRAINTS,
} from '@entities/product/rules/euroStopperRules'
import { euroStopperModel } from '@entities/product/models/euroStopper'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

// ─────────────────────────────────────────────────────────────
// buildEUSModelCode
// ─────────────────────────────────────────────────────────────

describe('buildEUSModelCode', () => {
  it('builds flush no-sounder blue custom — STI-15010CB', () => {
    expect(buildEUSModelCode({ mounting: '0', sounder: '10', colourLabel: 'CB' })).toBe(
      'STI-15010CB',
    )
  })

  it('builds surface 32mm sounder relay green — STI-15C30NG', () => {
    expect(buildEUSModelCode({ mounting: 'C', sounder: '30', colourLabel: 'NG' })).toBe(
      'STI-15C30NG',
    )
  })

  it('builds surface 50mm sounder relay emergency green — STI-15D30EG', () => {
    expect(buildEUSModelCode({ mounting: 'D', sounder: '30', colourLabel: 'EG' })).toBe(
      'STI-15D30EG',
    )
  })

  it('builds flush sounder relay fire red — STI-15030FR', () => {
    expect(buildEUSModelCode({ mounting: '0', sounder: '30', colourLabel: 'FR' })).toBe(
      'STI-15030FR',
    )
  })

  it('returns null when any field is missing', () => {
    expect(buildEUSModelCode({ mounting: '0', sounder: '10' })).toBeNull()
    expect(buildEUSModelCode({ mounting: '0', colourLabel: 'CB' })).toBeNull()
    expect(buildEUSModelCode({ sounder: '10', colourLabel: 'CB' })).toBeNull()
    expect(buildEUSModelCode({})).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// parseEUSModelCode
// ─────────────────────────────────────────────────────────────

describe('parseEUSModelCode', () => {
  it('parses flush mount correctly — mounting=0', () => {
    expect(parseEUSModelCode('STI-15010CB')).toEqual({
      mounting: '0',
      sounder: '10',
      colourLabel: 'CB',
    })
  })

  it('parses surface 32mm correctly — mounting=C', () => {
    expect(parseEUSModelCode('STI-15C20ML')).toEqual({
      mounting: 'C',
      sounder: '20',
      colourLabel: 'ML',
    })
  })

  it('parses surface 50mm correctly — mounting=D', () => {
    expect(parseEUSModelCode('STI-15D30EG')).toEqual({
      mounting: 'D',
      sounder: '30',
      colourLabel: 'EG',
    })
  })

  it('returns null for invalid format', () => {
    expect(parseEUSModelCode('INVALID')).toBeNull()
    expect(parseEUSModelCode('STI-15A10CB')).toBeNull()
    expect(parseEUSModelCode('STI-1510CB')).toBeNull()
    expect(parseEUSModelCode('STI-15010C')).toBeNull()
    expect(parseEUSModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseEUSModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildEUSModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 57 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(57)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(57)
  })

  it('16 flush mount (0), 21 surface 32mm (C), 20 surface 50mm (D)', () => {
    const flush = VALID_MODEL_CODES.filter((c) => parseEUSModelCode(c)?.mounting === '0')
    const c32 = VALID_MODEL_CODES.filter((c) => parseEUSModelCode(c)?.mounting === 'C')
    const d50 = VALID_MODEL_CODES.filter((c) => parseEUSModelCode(c)?.mounting === 'D')
    expect(flush.length).toBe(16)
    expect(c32.length).toBe(21)
    expect(d50.length).toBe(20)
  })

  it('all mounting codes are 0, C, or D only', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseEUSModelCode(code)!
      expect(['0', 'C', 'D']).toContain(parsed.mounting)
    }
  })

  it('all three sounders present for every mounting variant', () => {
    for (const mounting of ['0', 'C', 'D']) {
      for (const sounder of ['10', '20', '30']) {
        const exists = VALID_MODEL_CODES.some((c) => {
          const p = parseEUSModelCode(c)
          return p?.mounting === mounting && p?.sounder === sounder
        })
        expect(exists).toBe(true)
      }
    }
  })

  it('NK appears only with flush mount and sounder=10', () => {
    const nkCodes = VALID_MODEL_CODES.filter((c) => c.endsWith('NK'))
    expect(nkCodes).toHaveLength(1)
    expect(nkCodes[0]).toBe('STI-15010NK')
  })

  it('CK absent from allowlist entirely', () => {
    const ckCodes = VALID_MODEL_CODES.filter((c) => c.endsWith('CK'))
    expect(ckCodes).toHaveLength(0)
  })

  it('EG only appears with sounder=30', () => {
    const egCodes = VALID_MODEL_CODES.filter((c) => c.endsWith('EG'))
    for (const code of egCodes) {
      const parsed = parseEUSModelCode(code)!
      expect(parsed.sounder).toBe('30')
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseEUSModelCode(code)).not.toBeNull()
    }
  })
})

// ─────────────────────────────────────────────────────────────
// isValidEUSCombination
// ─────────────────────────────────────────────────────────────

describe('isValidEUSCombination', () => {
  it('all 57 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseEUSModelCode(code)!
      expect(isValidEUSCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidEUSCombination({})).toEqual({ valid: true })
    expect(isValidEUSCombination({ mounting: '0' })).toEqual({ valid: true })
    expect(isValidEUSCombination({ mounting: '0', sounder: '10' })).toEqual({
      valid: true,
    })
  })

  it('rejects CK colour — not in allowlist', () => {
    const result = isValidEUSCombination({
      mounting: '0',
      sounder: '10',
      colourLabel: 'CK',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.reason).toContain('STI-15010CK')
    }
  })

  it('rejects NK with surface mount — only valid with flush', () => {
    const resultC = isValidEUSCombination({
      mounting: 'C',
      sounder: '10',
      colourLabel: 'NK',
    })
    const resultD = isValidEUSCombination({
      mounting: 'D',
      sounder: '10',
      colourLabel: 'NK',
    })
    expect(resultC.valid).toBe(false)
    expect(resultD.valid).toBe(false)
  })

  it('accepts NK with flush mount and sounder=10', () => {
    expect(
      isValidEUSCombination({ mounting: '0', sounder: '10', colourLabel: 'NK' }),
    ).toEqual({
      valid: true,
    })
  })

  it('rejects EG with sounder=10 or sounder=20', () => {
    expect(
      isValidEUSCombination({ mounting: '0', sounder: '10', colourLabel: 'EG' }).valid,
    ).toBe(false)
    expect(
      isValidEUSCombination({ mounting: 'D', sounder: '20', colourLabel: 'EG' }).valid,
    ).toBe(false)
  })

  it('accepts EG with sounder=30 for valid mountings', () => {
    expect(
      isValidEUSCombination({ mounting: '0', sounder: '30', colourLabel: 'EG' }),
    ).toEqual({
      valid: true,
    })
    expect(
      isValidEUSCombination({ mounting: 'D', sounder: '30', colourLabel: 'EG' }),
    ).toEqual({
      valid: true,
    })
  })

  it('rejects CR colour with flush or 32mm mounting', () => {
    expect(
      isValidEUSCombination({ mounting: '0', sounder: '10', colourLabel: 'CR' }).valid,
    ).toBe(false)
    expect(
      isValidEUSCombination({ mounting: 'C', sounder: '10', colourLabel: 'CR' }).valid,
    ).toBe(false)
  })

  it('accepts CR only with 50mm mounting', () => {
    expect(
      isValidEUSCombination({ mounting: 'D', sounder: '10', colourLabel: 'CR' }),
    ).toEqual({
      valid: true,
    })
  })
})

// ─────────────────────────────────────────────────────────────
// getValidEUSOptionsForStep
// ─────────────────────────────────────────────────────────────

describe('getValidEUSOptionsForStep', () => {
  it('returns all three mountings when nothing selected', () => {
    const valid = getValidEUSOptionsForStep('mounting', {})
    expect(valid).toContain('0')
    expect(valid).toContain('C')
    expect(valid).toContain('D')
  })

  it('EG colourLabel only valid with sounder=30', () => {
    const valid = getValidEUSOptionsForStep('sounder', { colourLabel: 'EG' })
    expect(valid).toEqual(['30'])
  })

  it('sounder=30 does not include CK or CR colourLabels', () => {
    const valid = getValidEUSOptionsForStep('colourLabel', { sounder: '30' })
    expect(valid).not.toContain('CK')
    expect(valid).not.toContain('CR')
  })

  it('sounder=30 includes EG, FR, NG, NR, NY, NB, CG', () => {
    const valid = getValidEUSOptionsForStep('colourLabel', { sounder: '30' })
    for (const colour of ['EG', 'FR', 'NG', 'NR', 'NY', 'NB', 'CG']) {
      expect(valid).toContain(colour)
    }
  })

  it('NK colour only valid with flush mounting', () => {
    const valid = getValidEUSOptionsForStep('mounting', { colourLabel: 'NK' })
    expect(valid).toEqual(['0'])
  })

  it('CR colour only valid with 50mm mounting', () => {
    const valid = getValidEUSOptionsForStep('mounting', { colourLabel: 'CR' })
    expect(valid).toEqual(['D'])
  })

  it('CK never appears as valid colourLabel option', () => {
    const combinations = [
      { mounting: '0' },
      { mounting: 'C' },
      { mounting: 'D' },
      { sounder: '10' },
      { sounder: '20' },
      { sounder: '30' },
      { mounting: '0', sounder: '10' },
    ]
    for (const sel of combinations) {
      const valid = getValidEUSOptionsForStep('colourLabel', sel)
      expect(valid).not.toContain('CK')
    }
  })

  it('mounting and sounder are fully independent — all sounder options available for any mounting', () => {
    for (const mounting of ['0', 'C', 'D']) {
      const valid = getValidEUSOptionsForStep('sounder', { mounting })
      expect(valid).toContain('10')
      expect(valid).toContain('20')
      expect(valid).toContain('30')
    }
  })

  it('NE colour only valid with flush or 32mm mounting', () => {
    const valid = getValidEUSOptionsForStep('mounting', { colourLabel: 'NE' })
    expect(valid).toContain('0')
    expect(valid).toContain('C')
    expect(valid).not.toContain('D')
  })
})

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe('EURO_STOPPER_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(EURO_STOPPER_CONSTRAINTS)

  it('blocks EG colourLabel when sounder=10', () => {
    const result = engine.checkOptionAvailability('colourLabel', 'EG', { sounder: '10' })
    expect(result.available).toBe(false)
  })

  it('allows EG colourLabel when sounder=30', () => {
    const result = engine.checkOptionAvailability('colourLabel', 'EG', { sounder: '30' })
    expect(result.available).toBe(true)
  })

  it('blocks NK colourLabel when mounting=C or D', () => {
    expect(
      engine.checkOptionAvailability('colourLabel', 'NK', { mounting: 'C' }).available,
    ).toBe(false)
    expect(
      engine.checkOptionAvailability('colourLabel', 'NK', { mounting: 'D' }).available,
    ).toBe(false)
  })

  it('allows NK colourLabel when mounting=0', () => {
    const result = engine.checkOptionAvailability('colourLabel', 'NK', { mounting: '0' })
    expect(result.available).toBe(true)
  })

  it('blocks CR colourLabel when mounting=0 or C', () => {
    expect(
      engine.checkOptionAvailability('colourLabel', 'CR', { mounting: '0' }).available,
    ).toBe(false)
    expect(
      engine.checkOptionAvailability('colourLabel', 'CR', { mounting: 'C' }).available,
    ).toBe(false)
  })

  it('allows CR colourLabel when mounting=D', () => {
    const result = engine.checkOptionAvailability('colourLabel', 'CR', { mounting: 'D' })
    expect(result.available).toBe(true)
  })

  it('no mounting↔sounder constraints — mounting does not restrict sounder', () => {
    for (const mounting of ['0', 'C', 'D']) {
      for (const sounder of ['10', '20', '30']) {
        const result = engine.checkOptionAvailability('sounder', sounder, { mounting })
        expect(result.available).toBe(true)
      }
    }
  })

  it('constraint engine modelId matches', () => {
    expect(EURO_STOPPER_CONSTRAINTS.modelId).toBe('euro-stopper')
  })
})

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe('buildProductModel — euroStopper', () => {
  it('builds STI-15010CB correctly — flush, no sounder, blue custom', () => {
    const config: Configuration = { mounting: '0', sounder: '10', colourLabel: 'CB' }
    const result = buildProductModel(config, euroStopperModel)
    expect(result.fullCode).toBe('STI-15010CB')
    expect(result.isComplete).toBe(true)
  })

  it('builds STI-15C30FR correctly — surface 32mm, relay, fire red', () => {
    const config: Configuration = { mounting: 'C', sounder: '30', colourLabel: 'FR' }
    const result = buildProductModel(config, euroStopperModel)
    expect(result.fullCode).toBe('STI-15C30FR')
    expect(result.isComplete).toBe(true)
  })

  it('builds STI-15D30EG correctly — surface 50mm, relay, emergency green', () => {
    const config: Configuration = { mounting: 'D', sounder: '30', colourLabel: 'EG' }
    const result = buildProductModel(config, euroStopperModel)
    expect(result.fullCode).toBe('STI-15D30EG')
    expect(result.isComplete).toBe(true)
  })

  it('no separators used — all codes concatenated directly', () => {
    const config: Configuration = { mounting: 'C', sounder: '20', colourLabel: 'NY' }
    const result = buildProductModel(config, euroStopperModel)
    expect(result.fullCode).toBe('STI-15C20NY')
    expect(result.fullCode).not.toMatch(/STI-15-/)
    expect(result.fullCode).not.toContain('--')
  })

  it('baseCode is STI-15', () => {
    const config: Configuration = { mounting: null, sounder: null, colourLabel: null }
    const result = buildProductModel(config, euroStopperModel)
    expect(result.baseCode).toBe('STI-15')
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = { mounting: '0', sounder: null, colourLabel: null }
    const result = buildProductModel(config, euroStopperModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('sounder')
    expect(result.missingSteps).toContain('colourLabel')
  })

  it('all 57 valid codes generated from parsed configurations', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0

    for (const code of VALID_MODEL_CODES) {
      const parsed = parseEUSModelCode(code)!
      const config: Configuration = {
        mounting: parsed.mounting ?? null,
        sounder: parsed.sounder ?? null,
        colourLabel: parsed.colourLabel ?? null,
      }
      const result = buildProductModel(config, euroStopperModel)
      if (validSet.has(result.fullCode)) matchCount++
    }

    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — euroStopper
// ─────────────────────────────────────────────────────────────

describe('isConfigurationComplete — euroStopper', () => {
  it('returns true when all three steps selected', () => {
    const config: Configuration = { mounting: '0', sounder: '10', colourLabel: 'CB' }
    expect(isConfigurationComplete(euroStopperModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(euroStopperModel, {
        mounting: '0',
        sounder: '10',
        colourLabel: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = { mounting: 'D', sounder: null, colourLabel: null }
    const missing = getMissingRequiredSteps(euroStopperModel, config)
    expect(missing).toContain('sounder')
    expect(missing).toContain('colourLabel')
    expect(missing).not.toContain('mounting')
  })

  it('getCompletionPercentage returns correct percentages', () => {
    expect(
      getCompletionPercentage(euroStopperModel, {
        mounting: null,
        sounder: null,
        colourLabel: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(euroStopperModel, {
        mounting: '0',
        sounder: null,
        colourLabel: null,
      }),
    ).toBe(33)

    expect(
      getCompletionPercentage(euroStopperModel, {
        mounting: '0',
        sounder: '10',
        colourLabel: null,
      }),
    ).toBe(67)

    expect(
      getCompletionPercentage(euroStopperModel, {
        mounting: '0',
        sounder: '10',
        colourLabel: 'CB',
      }),
    ).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe('euroStopperModel definition', () => {
  it('has correct model id and slug', () => {
    expect(euroStopperModel.id).toBe('euro-stopper')
    expect(euroStopperModel.slug).toBe('euro-stopper')
  })

  it('mounting options are 0, C, D', () => {
    const mountingStep = euroStopperModel.steps.find((s) => s.id === 'mounting')!
    const ids = mountingStep.options.map((o) => o.id)
    expect(ids).toEqual(['0', 'C', 'D'])
  })

  it('sounder options are 10, 20, 30', () => {
    const sounderStep = euroStopperModel.steps.find((s) => s.id === 'sounder')!
    const ids = sounderStep.options.map((o) => o.id)
    expect(ids).toEqual(['10', '20', '30'])
  })

  it('colourLabel step has 17 options including CK not in allowlist', () => {
    const colourStep = euroStopperModel.steps.find((s) => s.id === 'colourLabel')!
    expect(colourStep.options).toHaveLength(17)
    const ids = colourStep.options.map((o) => o.id)
    expect(ids).toContain('CK')
  })

  it('baseCode is STI-15', () => {
    expect(euroStopperModel.productModelSchema.baseCode).toBe('STI-15')
  })

  it('all separators are empty — no dashes in schema', () => {
    const { separatorMap } = euroStopperModel.productModelSchema
    expect(separatorMap?.mounting).toBe('')
    expect(separatorMap?.sounder).toBe('')
    expect(separatorMap?.colourLabel).toBe('')
  })

  it('all steps are required', () => {
    for (const step of euroStopperModel.steps) {
      expect(step.required).toBe(true)
    }
  })
})
