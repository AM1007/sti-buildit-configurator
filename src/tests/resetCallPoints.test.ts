import { describe, it, expect } from 'vitest'
import {
  buildRPModelCode,
  parseRPModelCode,
  isValidRPCombination,
  getValidRPOptionsForStep,
  VALID_MODEL_CODES,
  RESET_CALL_POINTS_CONSTRAINTS,
} from '@entities/product/rules/resetCallPointsRules'
import { resetCallPointsModel } from '@entities/product/models/resetCallPoints'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

// ─────────────────────────────────────────────────────────────
// buildRPModelCode
// ─────────────────────────────────────────────────────────────

describe('buildRPModelCode', () => {
  it('builds red HF — no suffix', () => {
    expect(
      buildRPModelCode({
        colour: 'R',
        mounting: 'D2',
        electricalArrangement: '02',
        label: 'HF',
      }),
    ).toBe('RP-RD2-02')
  })

  it('builds green RM — no suffix', () => {
    expect(
      buildRPModelCode({
        colour: 'G',
        mounting: 'D2',
        electricalArrangement: '11',
        label: 'RM',
      }),
    ).toBe('RP-GD2-11')
  })

  it('builds yellow SAK — no suffix', () => {
    expect(
      buildRPModelCode({
        colour: 'Y',
        mounting: 'F2',
        electricalArrangement: '02',
        label: 'SAK',
      }),
    ).toBe('RP-YF2-02')
  })

  it('builds green CL — appends -CL', () => {
    expect(
      buildRPModelCode({
        colour: 'G',
        mounting: 'D2',
        electricalArrangement: '02',
        label: 'CL',
      }),
    ).toBe('RP-GD2-02-CL')
  })

  it('builds orange CL correctly', () => {
    expect(
      buildRPModelCode({
        colour: 'O',
        mounting: 'F2',
        electricalArrangement: '02',
        label: 'CL',
      }),
    ).toBe('RP-OF2-02-CL')
  })

  it('separator structure: RP-{colour}{mounting}-{ea}', () => {
    const code = buildRPModelCode({
      colour: 'B',
      mounting: 'S2',
      electricalArrangement: '11',
      label: 'SAK',
    })
    expect(code).toBe('RP-BS2-11')
    expect(code?.startsWith('RP-')).toBe(true)
    expect(code?.split('-')).toHaveLength(3)
  })

  it('returns null when any field is missing', () => {
    expect(
      buildRPModelCode({ colour: 'R', mounting: 'D2', electricalArrangement: '02' }),
    ).toBeNull()
    expect(buildRPModelCode({ colour: 'R', mounting: 'D2', label: 'HF' })).toBeNull()
    expect(buildRPModelCode({})).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// parseRPModelCode
// ─────────────────────────────────────────────────────────────

describe('parseRPModelCode', () => {
  it('parses RP-RD2-02 — red derives label HF', () => {
    expect(parseRPModelCode('RP-RD2-02')).toEqual({
      colour: 'R',
      mounting: 'D2',
      electricalArrangement: '02',
      label: 'HF',
    })
  })

  it('parses RP-GS2-11 — green derives label RM', () => {
    expect(parseRPModelCode('RP-GS2-11')).toEqual({
      colour: 'G',
      mounting: 'S2',
      electricalArrangement: '11',
      label: 'RM',
    })
  })

  it('parses RP-YD2-02 — yellow derives label SAK', () => {
    expect(parseRPModelCode('RP-YD2-02')).toEqual({
      colour: 'Y',
      mounting: 'D2',
      electricalArrangement: '02',
      label: 'SAK',
    })
  })

  it('parses RP-GD2-02-CL — CL suffix overrides colour-derived label', () => {
    expect(parseRPModelCode('RP-GD2-02-CL')).toEqual({
      colour: 'G',
      mounting: 'D2',
      electricalArrangement: '02',
      label: 'CL',
    })
  })

  it('parses RP-BS2-11-CL correctly', () => {
    expect(parseRPModelCode('RP-BS2-11-CL')).toEqual({
      colour: 'B',
      mounting: 'S2',
      electricalArrangement: '11',
      label: 'CL',
    })
  })

  it('label derivation from colour: R→HF, G→RM, Y/W/B/O→SAK', () => {
    expect(parseRPModelCode('RP-RS2-02')?.label).toBe('HF')
    expect(parseRPModelCode('RP-GF2-11')?.label).toBe('RM')
    for (const colour of ['Y', 'W', 'B', 'O']) {
      const code = `RP-${colour}D2-02`
      expect(parseRPModelCode(code)?.label).toBe('SAK')
    }
  })

  it('returns null for invalid format', () => {
    expect(parseRPModelCode('INVALID')).toBeNull()
    expect(parseRPModelCode('RP-RD2')).toBeNull()
    expect(parseRPModelCode('RP-AD2-02')).toBeNull()
    expect(parseRPModelCode('RP-RD2-001')).toBeNull()
    expect(parseRPModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseRPModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildRPModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 50 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(50)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(50)
  })

  it('19 CL and 31 non-CL codes', () => {
    const cl = VALID_MODEL_CODES.filter((c) => c.endsWith('-CL'))
    expect(cl.length).toBe(19)
    expect(VALID_MODEL_CODES.length - cl.length).toBe(31)
  })

  it('ea=02: 26 codes, ea=11: 24 codes', () => {
    expect(
      VALID_MODEL_CODES.filter((c) => parseRPModelCode(c)?.electricalArrangement === '02')
        .length,
    ).toBe(26)
    expect(
      VALID_MODEL_CODES.filter((c) => parseRPModelCode(c)?.electricalArrangement === '11')
        .length,
    ).toBe(24)
  })

  it('ea=01 and ea=05 absent — blocked globally', () => {
    expect(
      VALID_MODEL_CODES.some((c) => parseRPModelCode(c)?.electricalArrangement === '01'),
    ).toBe(false)
    expect(
      VALID_MODEL_CODES.some((c) => parseRPModelCode(c)?.electricalArrangement === '05'),
    ).toBe(false)
  })

  it('red (R) only has D2 and S2 mounting — no F2', () => {
    const redCodes = VALID_MODEL_CODES.filter((c) => parseRPModelCode(c)?.colour === 'R')
    expect(redCodes).toHaveLength(3)
    for (const code of redCodes) {
      expect(parseRPModelCode(code)?.mounting).not.toBe('F2')
    }
  })

  it('red codes never have CL label', () => {
    const redCodes = VALID_MODEL_CODES.filter((c) => parseRPModelCode(c)?.colour === 'R')
    for (const code of redCodes) {
      expect(parseRPModelCode(code)?.label).not.toBe('CL')
    }
  })

  it('HF label only with red, RM label only with green', () => {
    const hfCodes = VALID_MODEL_CODES.filter((c) => parseRPModelCode(c)?.label === 'HF')
    const rmCodes = VALID_MODEL_CODES.filter((c) => parseRPModelCode(c)?.label === 'RM')
    for (const code of hfCodes) {
      expect(parseRPModelCode(code)?.colour).toBe('R')
    }
    for (const code of rmCodes) {
      expect(parseRPModelCode(code)?.colour).toBe('G')
    }
  })

  it('SAK label only with Y, W, B, O colours', () => {
    const sakCodes = VALID_MODEL_CODES.filter((c) => parseRPModelCode(c)?.label === 'SAK')
    for (const code of sakCodes) {
      expect(['Y', 'W', 'B', 'O']).toContain(parseRPModelCode(code)?.colour)
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseRPModelCode(code)).not.toBeNull()
    }
  })
})

// ─────────────────────────────────────────────────────────────
// isValidRPCombination
// ─────────────────────────────────────────────────────────────

describe('isValidRPCombination', () => {
  it('all 50 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseRPModelCode(code)!
      expect(isValidRPCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidRPCombination({})).toEqual({ valid: true })
    expect(isValidRPCombination({ colour: 'R' })).toEqual({ valid: true })
    expect(
      isValidRPCombination({ colour: 'R', mounting: 'D2', electricalArrangement: '02' }),
    ).toEqual({ valid: true })
  })

  it('rejects red with F2 mounting — not in allowlist', () => {
    const result = isValidRPCombination({
      colour: 'R',
      mounting: 'F2',
      electricalArrangement: '02',
      label: 'HF',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toContain('RP-RF2-02')
  })

  it('rejects red with CL label', () => {
    const result = isValidRPCombination({
      colour: 'R',
      mounting: 'D2',
      electricalArrangement: '02',
      label: 'CL',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects ea=01 — globally blocked', () => {
    const result = isValidRPCombination({
      colour: 'G',
      mounting: 'D2',
      electricalArrangement: '01',
      label: 'RM',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects ea=05 — globally blocked', () => {
    const result = isValidRPCombination({
      colour: 'Y',
      mounting: 'S2',
      electricalArrangement: '05',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects HF label with non-red colour', () => {
    for (const colour of ['G', 'Y', 'W', 'B', 'O']) {
      const result = isValidRPCombination({
        colour,
        mounting: 'D2',
        electricalArrangement: '02',
        label: 'HF',
      })
      expect(result.valid).toBe(false)
    }
  })

  it('rejects RM label with non-green colour', () => {
    for (const colour of ['R', 'Y', 'W', 'B', 'O']) {
      const result = isValidRPCombination({
        colour,
        mounting: 'D2',
        electricalArrangement: '02',
        label: 'RM',
      })
      expect(result.valid).toBe(false)
    }
  })
})

// ─────────────────────────────────────────────────────────────
// getValidRPOptionsForStep
// ─────────────────────────────────────────────────────────────

describe('getValidRPOptionsForStep', () => {
  it('red colour restricts mounting to D2 and S2 only', () => {
    const valid = getValidRPOptionsForStep('mounting', { colour: 'R' })
    expect(valid).toContain('D2')
    expect(valid).toContain('S2')
    expect(valid).not.toContain('F2')
  })

  it('F2 mounting excludes red colour', () => {
    const valid = getValidRPOptionsForStep('colour', { mounting: 'F2' })
    expect(valid).not.toContain('R')
    expect(valid).toContain('G')
    expect(valid).toContain('Y')
    expect(valid).toContain('W')
    expect(valid).toContain('B')
    expect(valid).toContain('O')
  })

  it('HF label restricts colour to R only', () => {
    const valid = getValidRPOptionsForStep('colour', { label: 'HF' })
    expect(valid).toEqual(['R'])
  })

  it('RM label restricts colour to G only', () => {
    const valid = getValidRPOptionsForStep('colour', { label: 'RM' })
    expect(valid).toEqual(['G'])
  })

  it('red colour restricts label to HF only', () => {
    const valid = getValidRPOptionsForStep('label', { colour: 'R' })
    expect(valid).toEqual(['HF'])
  })

  it('green colour allows RM and CL labels', () => {
    const valid = getValidRPOptionsForStep('label', { colour: 'G' })
    expect(valid).toContain('RM')
    expect(valid).toContain('CL')
    expect(valid).not.toContain('HF')
    expect(valid).not.toContain('SAK')
  })

  it('ea=01 and 05 never appear as valid options', () => {
    for (const sel of [{ colour: 'G' }, { mounting: 'D2' }, { label: 'SAK' }]) {
      const valid = getValidRPOptionsForStep('electricalArrangement', sel)
      expect(valid).not.toContain('01')
      expect(valid).not.toContain('05')
      expect(valid).toContain('02')
      expect(valid).toContain('11')
    }
  })
})

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe('RESET_CALL_POINTS_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(RESET_CALL_POINTS_CONSTRAINTS)

  it('blocks F2 mounting when colour is R', () => {
    expect(
      engine.checkOptionAvailability('mounting', 'F2', { colour: 'R' }).available,
    ).toBe(false)
  })

  it('allows D2 and S2 mounting when colour is R', () => {
    expect(
      engine.checkOptionAvailability('mounting', 'D2', { colour: 'R' }).available,
    ).toBe(true)
    expect(
      engine.checkOptionAvailability('mounting', 'S2', { colour: 'R' }).available,
    ).toBe(true)
  })

  it('blocks R colour when mounting is F2', () => {
    expect(
      engine.checkOptionAvailability('colour', 'R', { mounting: 'F2' }).available,
    ).toBe(false)
  })

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

  it('blocks SAK label when colour is R or G', () => {
    expect(
      engine.checkOptionAvailability('label', 'SAK', { colour: 'R' }).available,
    ).toBe(false)
    expect(
      engine.checkOptionAvailability('label', 'SAK', { colour: 'G' }).available,
    ).toBe(false)
  })

  it('blocks HF label when mounting is F2', () => {
    expect(
      engine.checkOptionAvailability('label', 'HF', { mounting: 'F2' }).available,
    ).toBe(false)
  })

  it('constraint engine modelId matches', () => {
    expect(RESET_CALL_POINTS_CONSTRAINTS.modelId).toBe('reset-call-points')
  })
})

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe('buildProductModel — resetCallPoints', () => {
  it('builds RP-RD2-02 correctly — red HF no suffix', () => {
    const config: Configuration = {
      colour: 'R',
      mounting: 'D2',
      electricalArrangement: '02',
      label: 'HF',
    }
    const result = buildProductModel(config, resetCallPointsModel)
    expect(result.fullCode).toBe('RP-RD2-02')
    expect(result.isComplete).toBe(true)
  })

  it('builds RP-GD2-02-CL correctly — green CL', () => {
    const config: Configuration = {
      colour: 'G',
      mounting: 'D2',
      electricalArrangement: '02',
      label: 'CL',
    }
    const result = buildProductModel(config, resetCallPointsModel)
    expect(result.fullCode).toBe('RP-GD2-02-CL')
    expect(result.isComplete).toBe(true)
  })

  it('builds RP-YF2-11-CL correctly', () => {
    const config: Configuration = {
      colour: 'Y',
      mounting: 'F2',
      electricalArrangement: '11',
      label: 'CL',
    }
    const result = buildProductModel(config, resetCallPointsModel)
    expect(result.fullCode).toBe('RP-YF2-11-CL')
    expect(result.isComplete).toBe(true)
  })

  it('HF, RM, SAK labels have empty code — no suffix', () => {
    for (const [colour, label] of [
      ['R', 'HF'],
      ['G', 'RM'],
      ['Y', 'SAK'],
    ] as const) {
      const config: Configuration = {
        colour,
        mounting: 'D2',
        electricalArrangement: '02',
        label,
      }
      const result = buildProductModel(config, resetCallPointsModel)
      expect(result.fullCode).not.toContain(label)
      expect(result.fullCode).not.toMatch(/-$/)
    }
  })

  it('baseCode is RP', () => {
    const config: Configuration = {
      colour: null,
      mounting: null,
      electricalArrangement: null,
      label: null,
    }
    const result = buildProductModel(config, resetCallPointsModel)
    expect(result.baseCode).toBe('RP')
  })

  it('separator structure: RP-{colour}{mounting}-{ea}', () => {
    const config: Configuration = {
      colour: 'B',
      mounting: 'S2',
      electricalArrangement: '11',
      label: 'SAK',
    }
    const result = buildProductModel(config, resetCallPointsModel)
    expect(result.fullCode).toBe('RP-BS2-11')
    const parts = result.fullCode.split('-')
    expect(parts[0]).toBe('RP')
    expect(parts[1]).toBe('BS2')
    expect(parts[2]).toBe('11')
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = {
      colour: 'G',
      mounting: null,
      electricalArrangement: null,
      label: null,
    }
    const result = buildProductModel(config, resetCallPointsModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('mounting')
    expect(result.missingSteps).toContain('electricalArrangement')
    expect(result.missingSteps).toContain('label')
  })

  it('all 50 valid codes generated from parsed configurations', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseRPModelCode(code)!
      const config: Configuration = {
        colour: parsed.colour ?? null,
        mounting: parsed.mounting ?? null,
        electricalArrangement: parsed.electricalArrangement ?? null,
        label: parsed.label ?? null,
      }
      const result = buildProductModel(config, resetCallPointsModel)
      if (validSet.has(result.fullCode)) matchCount++
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — resetCallPoints
// ─────────────────────────────────────────────────────────────

describe('isConfigurationComplete — resetCallPoints', () => {
  it('returns true when all 4 steps selected', () => {
    const config: Configuration = {
      colour: 'R',
      mounting: 'D2',
      electricalArrangement: '02',
      label: 'HF',
    }
    expect(isConfigurationComplete(resetCallPointsModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(resetCallPointsModel, {
        colour: 'R',
        mounting: 'D2',
        electricalArrangement: '02',
        label: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = {
      colour: 'G',
      mounting: 'D2',
      electricalArrangement: null,
      label: null,
    }
    const missing = getMissingRequiredSteps(resetCallPointsModel, config)
    expect(missing).toContain('electricalArrangement')
    expect(missing).toContain('label')
    expect(missing).not.toContain('colour')
    expect(missing).not.toContain('mounting')
  })

  it('getCompletionPercentage for 4-step model', () => {
    expect(
      getCompletionPercentage(resetCallPointsModel, {
        colour: null,
        mounting: null,
        electricalArrangement: null,
        label: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(resetCallPointsModel, {
        colour: 'R',
        mounting: null,
        electricalArrangement: null,
        label: null,
      }),
    ).toBe(25)

    expect(
      getCompletionPercentage(resetCallPointsModel, {
        colour: 'R',
        mounting: 'D2',
        electricalArrangement: '02',
        label: null,
      }),
    ).toBe(75)

    expect(
      getCompletionPercentage(resetCallPointsModel, {
        colour: 'R',
        mounting: 'D2',
        electricalArrangement: '02',
        label: 'HF',
      }),
    ).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

describe('resetCallPointsModel definition', () => {
  it('has correct model id and slug', () => {
    expect(resetCallPointsModel.id).toBe('reset-call-points')
    expect(resetCallPointsModel.slug).toBe('reset-call-points')
  })

  it('electricalArrangement step has 4 options including blocked 01 and 05', () => {
    const eaStep = resetCallPointsModel.steps.find(
      (s) => s.id === 'electricalArrangement',
    )!
    expect(eaStep.options).toHaveLength(4)
    const ids = eaStep.options.map((o) => o.id)
    expect(ids).toContain('01')
    expect(ids).toContain('05')
    expect(ids).toContain('02')
    expect(ids).toContain('11')
  })

  it('HF, RM, SAK labels have empty code', () => {
    const labelStep = resetCallPointsModel.steps.find((s) => s.id === 'label')!
    for (const id of ['HF', 'RM', 'SAK']) {
      const opt = labelStep.options.find((o) => o.id === id)!
      expect(opt.code).toBe('')
    }
  })

  it('CL label has code CL', () => {
    const labelStep = resetCallPointsModel.steps.find((s) => s.id === 'label')!
    const cl = labelStep.options.find((o) => o.id === 'CL')!
    expect(cl.code).toBe('CL')
  })

  it('baseCode is RP', () => {
    expect(resetCallPointsModel.productModelSchema.baseCode).toBe('RP')
  })

  it('separator structure: colour=dash, mounting=none, ea=dash, label=dash', () => {
    const { separatorMap } = resetCallPointsModel.productModelSchema
    expect(separatorMap?.colour).toBe('-')
    expect(separatorMap?.mounting).toBe('')
    expect(separatorMap?.electricalArrangement).toBe('-')
    expect(separatorMap?.label).toBe('-')
  })

  it('all steps are required', () => {
    for (const step of resetCallPointsModel.steps) {
      expect(step.required).toBe(true)
    }
  })
})
