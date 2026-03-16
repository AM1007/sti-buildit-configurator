import { describe, it, expect } from 'vitest'
import {
  buildWRPModelCode,
  parseWRPModelCode,
  isValidWRPCombination,
  getValidWRPOptionsForStep,
  VALID_MODEL_CODES,
  WATERPROOF_RESET_CALL_POINT_CONSTRAINTS,
} from '@entities/product/rules/waterproofResetCallPointRules'
import { waterproofResetCallPointModel } from '@entities/product/models/waterproofResetCallPoint'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

// ─────────────────────────────────────────────────────────────
// buildWRPModelCode
// ─────────────────────────────────────────────────────────────

describe('buildWRPModelCode', () => {
  it('builds WRP2-R-02 correctly — HF no suffix', () => {
    expect(
      buildWRPModelCode({ colour: 'R', electricalArrangement: '02', label: 'HF' }),
    ).toBe('WRP2-R-02')
  })

  it('builds WRP2-R-11-CL correctly — CL suffix', () => {
    expect(
      buildWRPModelCode({ colour: 'R', electricalArrangement: '11', label: 'CL' }),
    ).toBe('WRP2-R-11-CL')
  })

  it('builds WRP2-G-02 correctly — RM no suffix', () => {
    expect(
      buildWRPModelCode({ colour: 'G', electricalArrangement: '02', label: 'RM' }),
    ).toBe('WRP2-G-02')
  })

  it('builds WRP2-Y-11-CL correctly — SAK colour with CL', () => {
    expect(
      buildWRPModelCode({ colour: 'Y', electricalArrangement: '11', label: 'CL' }),
    ).toBe('WRP2-Y-11-CL')
  })

  it('builds WRP2-O-02 correctly — SAK no suffix', () => {
    expect(
      buildWRPModelCode({ colour: 'O', electricalArrangement: '02', label: 'SAK' }),
    ).toBe('WRP2-O-02')
  })

  it('separator structure: WRP2-{colour}-{ea}', () => {
    const code = buildWRPModelCode({
      colour: 'B',
      electricalArrangement: '11',
      label: 'SAK',
    })
    expect(code).toBe('WRP2-B-11')
    expect(code?.split('-')).toHaveLength(3)
  })

  it('HF, RM, SAK all produce no suffix', () => {
    for (const label of ['HF', 'RM', 'SAK'] as const) {
      const code = buildWRPModelCode({ colour: 'G', electricalArrangement: '02', label })
      expect(code).toBe('WRP2-G-02')
      expect(code).not.toContain(label)
    }
  })

  it('returns null when any field is missing', () => {
    expect(buildWRPModelCode({ colour: 'R', electricalArrangement: '02' })).toBeNull()
    expect(buildWRPModelCode({ colour: 'R', label: 'HF' })).toBeNull()
    expect(buildWRPModelCode({ electricalArrangement: '02', label: 'HF' })).toBeNull()
    expect(buildWRPModelCode({})).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// parseWRPModelCode
// ─────────────────────────────────────────────────────────────

describe('parseWRPModelCode', () => {
  it('parses WRP2-R-02 — label undefined (non-CL)', () => {
    const parsed = parseWRPModelCode('WRP2-R-02')
    expect(parsed).not.toBeNull()
    expect(parsed?.colour).toBe('R')
    expect(parsed?.electricalArrangement).toBe('02')
    expect(parsed?.label).toBeUndefined()
  })

  it('parses WRP2-R-11-CL — label CL', () => {
    expect(parseWRPModelCode('WRP2-R-11-CL')).toEqual({
      colour: 'R',
      electricalArrangement: '11',
      label: 'CL',
    })
  })

  it('parses WRP2-G-02 — label undefined', () => {
    const parsed = parseWRPModelCode('WRP2-G-02')
    expect(parsed?.colour).toBe('G')
    expect(parsed?.label).toBeUndefined()
  })

  it('parses WRP2-O-11-CL correctly', () => {
    expect(parseWRPModelCode('WRP2-O-11-CL')).toEqual({
      colour: 'O',
      electricalArrangement: '11',
      label: 'CL',
    })
  })

  it('label undefined for all non-CL codes — caller must infer from colour', () => {
    const nonCL = VALID_MODEL_CODES.filter((c) => !c.endsWith('-CL'))
    for (const code of nonCL) {
      const parsed = parseWRPModelCode(code)
      expect(parsed?.label).toBeUndefined()
    }
  })

  it('label CL for all -CL codes', () => {
    const clCodes = VALID_MODEL_CODES.filter((c) => c.endsWith('-CL'))
    for (const code of clCodes) {
      expect(parseWRPModelCode(code)?.label).toBe('CL')
    }
  })

  it('returns null for invalid format', () => {
    expect(parseWRPModelCode('INVALID')).toBeNull()
    expect(parseWRPModelCode('WRP2-R-2')).toBeNull()
    expect(parseWRPModelCode('WRP2-R-02-RM')).toBeNull()
    expect(parseWRPModelCode('RP2-R-02')).toBeNull()
    expect(parseWRPModelCode('')).toBeNull()
  })

  it('round-trips for all CL codes — CL codes are lossless', () => {
    const clCodes = VALID_MODEL_CODES.filter((c) => c.endsWith('-CL'))
    for (const code of clCodes) {
      const parsed = parseWRPModelCode(code)!
      const rebuilt = buildWRPModelCode(parsed)
      expect(rebuilt).toBe(code)
    }
  })

  it('non-CL codes round-trip when label supplied explicitly', () => {
    const nonCL = VALID_MODEL_CODES.filter((c) => !c.endsWith('-CL'))
    for (const code of nonCL) {
      const parsed = parseWRPModelCode(code)!
      const colour = parsed.colour!
      const label = colour === 'R' ? 'HF' : colour === 'G' ? 'RM' : 'SAK'
      const rebuilt = buildWRPModelCode({ ...parsed, label })
      expect(rebuilt).toBe(code)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 23 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(23)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(23)
  })

  it('11 CL and 12 non-CL codes', () => {
    expect(VALID_MODEL_CODES.filter((c) => c.endsWith('-CL')).length).toBe(11)
    expect(VALID_MODEL_CODES.filter((c) => !c.endsWith('-CL')).length).toBe(12)
  })

  it('ea=02: 11 codes, ea=11: 12 codes', () => {
    expect(
      VALID_MODEL_CODES.filter(
        (c) => parseWRPModelCode(c)?.electricalArrangement === '02',
      ).length,
    ).toBe(11)
    expect(
      VALID_MODEL_CODES.filter(
        (c) => parseWRPModelCode(c)?.electricalArrangement === '11',
      ).length,
    ).toBe(12)
  })

  it('red (R) has 3 codes: 02, 11, 11-CL — no 02-CL', () => {
    const redCodes = VALID_MODEL_CODES.filter((c) => parseWRPModelCode(c)?.colour === 'R')
    expect(redCodes).toHaveLength(3)
    expect(redCodes).toContain('WRP2-R-02')
    expect(redCodes).toContain('WRP2-R-11')
    expect(redCodes).toContain('WRP2-R-11-CL')
    expect(redCodes).not.toContain('WRP2-R-02-CL')
  })

  it('false positive WRP2-R-02-CL absent from allowlist', () => {
    expect(VALID_MODEL_CODES).not.toContain('WRP2-R-02-CL')
  })

  it('non-red/green colours have symmetric 4-code pattern: 02, 02-CL, 11, 11-CL', () => {
    for (const colour of ['Y', 'W', 'B', 'O']) {
      const colourCodes = VALID_MODEL_CODES.filter(
        (c) => parseWRPModelCode(c)?.colour === colour,
      )
      expect(colourCodes).toHaveLength(4)
      expect(colourCodes).toContain(`WRP2-${colour}-02`)
      expect(colourCodes).toContain(`WRP2-${colour}-02-CL`)
      expect(colourCodes).toContain(`WRP2-${colour}-11`)
      expect(colourCodes).toContain(`WRP2-${colour}-11-CL`)
    }
  })

  it('ea=01 absent — explicitly excluded per source doc', () => {
    expect(VALID_MODEL_CODES.some((c) => c.includes('-01'))).toBe(false)
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseWRPModelCode(code)).not.toBeNull()
    }
  })
})

// ─────────────────────────────────────────────────────────────
// isValidWRPCombination
// ─────────────────────────────────────────────────────────────

describe('isValidWRPCombination', () => {
  it('all 23 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseWRPModelCode(code)!
      const colour = parsed.colour!
      const label =
        parsed.label ?? (colour === 'R' ? 'HF' : colour === 'G' ? 'RM' : 'SAK')
      expect(isValidWRPCombination({ ...parsed, label })).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidWRPCombination({})).toEqual({ valid: true })
    expect(isValidWRPCombination({ colour: 'R' })).toEqual({ valid: true })
    expect(isValidWRPCombination({ colour: 'R', electricalArrangement: '02' })).toEqual({
      valid: true,
    })
  })

  it('rejects false positive WRP2-R-02-CL', () => {
    const result = isValidWRPCombination({
      colour: 'R',
      electricalArrangement: '02',
      label: 'CL',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toContain('WRP2-R-02-CL')
  })

  it('rejects HF label with non-red colour', () => {
    for (const colour of ['G', 'Y', 'W', 'B', 'O']) {
      const result = isValidWRPCombination({
        colour,
        electricalArrangement: '02',
        label: 'HF',
      })
      expect(result.valid).toBe(false)
    }
  })

  it('rejects RM label with non-green colour', () => {
    for (const colour of ['R', 'Y', 'W', 'B', 'O']) {
      const result = isValidWRPCombination({
        colour,
        electricalArrangement: '02',
        label: 'RM',
      })
      expect(result.valid).toBe(false)
    }
  })

  it('rejects SAK label with red or green colour', () => {
    for (const colour of ['R', 'G']) {
      const result = isValidWRPCombination({
        colour,
        electricalArrangement: '02',
        label: 'SAK',
      })
      expect(result.valid).toBe(false)
    }
  })

  it('rejects ea=01 — absent from allowlist', () => {
    const result = isValidWRPCombination({
      colour: 'G',
      electricalArrangement: '01',
      label: 'RM',
    })
    expect(result.valid).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// getValidWRPOptionsForStep
// ─────────────────────────────────────────────────────────────

describe('getValidWRPOptionsForStep', () => {
  it('red colour restricts label to HF and CL only', () => {
    const valid = getValidWRPOptionsForStep('label', { colour: 'R' })
    expect(valid).toContain('HF')
    expect(valid).toContain('CL')
    expect(valid).not.toContain('RM')
    expect(valid).not.toContain('SAK')
  })

  it('green colour restricts label to RM and CL only', () => {
    const valid = getValidWRPOptionsForStep('label', { colour: 'G' })
    expect(valid).toContain('RM')
    expect(valid).toContain('CL')
    expect(valid).not.toContain('HF')
    expect(valid).not.toContain('SAK')
  })

  it('Y, W, B, O colours allow SAK and CL labels only', () => {
    for (const colour of ['Y', 'W', 'B', 'O']) {
      const valid = getValidWRPOptionsForStep('label', { colour })
      expect(valid).toContain('SAK')
      expect(valid).toContain('CL')
      expect(valid).not.toContain('HF')
      expect(valid).not.toContain('RM')
    }
  })

  it('HF label restricts colour to R only', () => {
    const valid = getValidWRPOptionsForStep('colour', { label: 'HF' })
    expect(valid).toEqual(['R'])
  })

  it('RM label restricts colour to G only', () => {
    const valid = getValidWRPOptionsForStep('colour', { label: 'RM' })
    expect(valid).toEqual(['G'])
  })

  it('SAK label restricts colour to Y, W, B, O', () => {
    const valid = getValidWRPOptionsForStep('colour', { label: 'SAK' })
    expect(valid).not.toContain('R')
    expect(valid).not.toContain('G')
    expect(valid).toContain('Y')
    expect(valid).toContain('W')
    expect(valid).toContain('B')
    expect(valid).toContain('O')
  })

  it('ea=01 never appears as valid option', () => {
    for (const sel of [{ colour: 'R' }, { colour: 'G' }, { label: 'CL' }]) {
      const valid = getValidWRPOptionsForStep('electricalArrangement', sel)
      expect(valid).not.toContain('01')
      expect(valid).toContain('02')
      expect(valid).toContain('11')
    }
  })

  it('CL label available for all colours', () => {
    for (const colour of ['R', 'G', 'Y', 'W', 'B', 'O']) {
      const valid = getValidWRPOptionsForStep('label', { colour })
      expect(valid).toContain('CL')
    }
  })
})

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe('WATERPROOF_RESET_CALL_POINT_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(WATERPROOF_RESET_CALL_POINT_CONSTRAINTS)

  it('blocks HF label when colour is not R', () => {
    for (const colour of ['G', 'Y', 'W', 'B', 'O']) {
      expect(engine.checkOptionAvailability('label', 'HF', { colour }).available).toBe(
        false,
      )
    }
  })

  it('allows HF label when colour is R', () => {
    expect(engine.checkOptionAvailability('label', 'HF', { colour: 'R' }).available).toBe(
      true,
    )
  })

  it('blocks RM label when colour is not G', () => {
    for (const colour of ['R', 'Y', 'W', 'B', 'O']) {
      expect(engine.checkOptionAvailability('label', 'RM', { colour }).available).toBe(
        false,
      )
    }
  })

  it('allows RM label when colour is G', () => {
    expect(engine.checkOptionAvailability('label', 'RM', { colour: 'G' }).available).toBe(
      true,
    )
  })

  it('blocks SAK label when colour is R or G', () => {
    for (const colour of ['R', 'G']) {
      expect(engine.checkOptionAvailability('label', 'SAK', { colour }).available).toBe(
        false,
      )
    }
  })

  it('CL label is available for all colours via constraint matrix', () => {
    for (const colour of ['R', 'G', 'Y', 'W', 'B', 'O']) {
      expect(engine.checkOptionAvailability('label', 'CL', { colour }).available).toBe(
        true,
      )
    }
  })

  it('colour and ea are fully independent via matrices', () => {
    for (const colour of ['R', 'G', 'Y', 'W', 'B', 'O']) {
      for (const ea of ['02', '11']) {
        expect(
          engine.checkOptionAvailability('electricalArrangement', ea, { colour })
            .available,
        ).toBe(true)
      }
    }
  })

  it('constraint engine modelId matches', () => {
    expect(WATERPROOF_RESET_CALL_POINT_CONSTRAINTS.modelId).toBe(
      'waterproof-reset-call-point',
    )
  })
})

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe('buildProductModel — waterproofResetCallPoint', () => {
  it('builds WRP2-R-02 correctly — HF label', () => {
    const config: Configuration = {
      colour: 'R',
      electricalArrangement: '02',
      label: 'HF',
    }
    const result = buildProductModel(config, waterproofResetCallPointModel)
    expect(result.fullCode).toBe('WRP2-R-02')
    expect(result.isComplete).toBe(true)
  })

  it('builds WRP2-R-11-CL correctly', () => {
    const config: Configuration = {
      colour: 'R',
      electricalArrangement: '11',
      label: 'CL',
    }
    const result = buildProductModel(config, waterproofResetCallPointModel)
    expect(result.fullCode).toBe('WRP2-R-11-CL')
    expect(result.isComplete).toBe(true)
  })

  it('builds WRP2-G-02 correctly — RM label no suffix', () => {
    const config: Configuration = {
      colour: 'G',
      electricalArrangement: '02',
      label: 'RM',
    }
    const result = buildProductModel(config, waterproofResetCallPointModel)
    expect(result.fullCode).toBe('WRP2-G-02')
    expect(result.isComplete).toBe(true)
  })

  it('builds WRP2-O-11-CL correctly', () => {
    const config: Configuration = {
      colour: 'O',
      electricalArrangement: '11',
      label: 'CL',
    }
    const result = buildProductModel(config, waterproofResetCallPointModel)
    expect(result.fullCode).toBe('WRP2-O-11-CL')
    expect(result.isComplete).toBe(true)
  })

  it('HF, RM, SAK labels have empty code — no suffix in SKU', () => {
    for (const [colour, label] of [
      ['R', 'HF'],
      ['G', 'RM'],
      ['Y', 'SAK'],
    ] as const) {
      const config: Configuration = { colour, electricalArrangement: '02', label }
      const result = buildProductModel(config, waterproofResetCallPointModel)
      expect(result.fullCode).not.toContain(label)
      expect(result.fullCode).not.toMatch(/-$/)
    }
  })

  it('all separators are dashes — WRP2-{colour}-{ea}', () => {
    const config: Configuration = {
      colour: 'B',
      electricalArrangement: '11',
      label: 'SAK',
    }
    const result = buildProductModel(config, waterproofResetCallPointModel)
    expect(result.fullCode).toBe('WRP2-B-11')
    const parts = result.fullCode.split('-')
    expect(parts[0]).toBe('WRP2')
    expect(parts[1]).toBe('B')
    expect(parts[2]).toBe('11')
  })

  it('baseCode is WRP2', () => {
    const config: Configuration = {
      colour: null,
      electricalArrangement: null,
      label: null,
    }
    const result = buildProductModel(config, waterproofResetCallPointModel)
    expect(result.baseCode).toBe('WRP2')
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = {
      colour: 'G',
      electricalArrangement: null,
      label: null,
    }
    const result = buildProductModel(config, waterproofResetCallPointModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('electricalArrangement')
    expect(result.missingSteps).toContain('label')
    expect(result.missingSteps).not.toContain('colour')
  })

  it('all 23 valid codes generated from parsed configurations', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseWRPModelCode(code)!
      const colour = parsed.colour!
      const label =
        parsed.label ?? (colour === 'R' ? 'HF' : colour === 'G' ? 'RM' : 'SAK')
      const config: Configuration = {
        colour,
        electricalArrangement: parsed.electricalArrangement ?? null,
        label,
      }
      const result = buildProductModel(config, waterproofResetCallPointModel)
      if (validSet.has(result.fullCode)) matchCount++
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — waterproofResetCallPoint
// ─────────────────────────────────────────────────────────────

describe('isConfigurationComplete — waterproofResetCallPoint', () => {
  it('returns true when all 3 steps selected', () => {
    const config: Configuration = {
      colour: 'R',
      electricalArrangement: '02',
      label: 'HF',
    }
    expect(isConfigurationComplete(waterproofResetCallPointModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(waterproofResetCallPointModel, {
        colour: 'R',
        electricalArrangement: '02',
        label: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = {
      colour: 'G',
      electricalArrangement: null,
      label: null,
    }
    const missing = getMissingRequiredSteps(waterproofResetCallPointModel, config)
    expect(missing).toContain('electricalArrangement')
    expect(missing).toContain('label')
    expect(missing).not.toContain('colour')
  })

  it('getCompletionPercentage for 3-step model', () => {
    expect(
      getCompletionPercentage(waterproofResetCallPointModel, {
        colour: null,
        electricalArrangement: null,
        label: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(waterproofResetCallPointModel, {
        colour: 'R',
        electricalArrangement: null,
        label: null,
      }),
    ).toBe(33)

    expect(
      getCompletionPercentage(waterproofResetCallPointModel, {
        colour: 'R',
        electricalArrangement: '02',
        label: null,
      }),
    ).toBe(67)

    expect(
      getCompletionPercentage(waterproofResetCallPointModel, {
        colour: 'R',
        electricalArrangement: '02',
        label: 'HF',
      }),
    ).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe('waterproofResetCallPointModel definition', () => {
  it('has correct model id and slug', () => {
    expect(waterproofResetCallPointModel.id).toBe('waterproof-reset-call-point')
    expect(waterproofResetCallPointModel.slug).toBe('waterproof-reset-call-point')
  })

  it('stepOrder has 3 steps', () => {
    expect(waterproofResetCallPointModel.stepOrder).toEqual([
      'colour',
      'electricalArrangement',
      'label',
    ])
  })

  it('electricalArrangement step has 2 options — 02 and 11, no 01', () => {
    const eaStep = waterproofResetCallPointModel.steps.find(
      (s) => s.id === 'electricalArrangement',
    )!
    const ids = eaStep.options.map((o) => o.id)
    expect(ids).toEqual(['02', '11'])
    expect(ids).not.toContain('01')
  })

  it('HF, RM, SAK labels have empty code', () => {
    const labelStep = waterproofResetCallPointModel.steps.find((s) => s.id === 'label')!
    for (const id of ['HF', 'RM', 'SAK']) {
      const opt = labelStep.options.find((o) => o.id === id)!
      expect(opt.code).toBe('')
    }
  })

  it('CL label has code CL', () => {
    const labelStep = waterproofResetCallPointModel.steps.find((s) => s.id === 'label')!
    expect(labelStep.options.find((o) => o.id === 'CL')?.code).toBe('CL')
  })

  it('baseCode is WRP2', () => {
    expect(waterproofResetCallPointModel.productModelSchema.baseCode).toBe('WRP2')
  })

  it('all three steps use dash separator', () => {
    const { separatorMap } = waterproofResetCallPointModel.productModelSchema
    expect(separatorMap?.colour).toBe('-')
    expect(separatorMap?.electricalArrangement).toBe('-')
    expect(separatorMap?.label).toBe('-')
  })

  it('all steps are required', () => {
    for (const step of waterproofResetCallPointModel.steps) {
      expect(step.required).toBe(true)
    }
  })
})
