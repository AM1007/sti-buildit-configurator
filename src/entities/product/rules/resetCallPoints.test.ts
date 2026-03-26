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

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 57 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(57)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(57)
  })

  it('26 CL and 31 non-CL codes', () => {
    const cl = VALID_MODEL_CODES.filter((c) => c.endsWith('-CL'))
    expect(cl.length).toBe(26)
    expect(VALID_MODEL_CODES.length - cl.length).toBe(31)
  })

  it('ea=02: 30 codes, ea=11: 27 codes', () => {
    expect(
      VALID_MODEL_CODES.filter((c) => parseRPModelCode(c)?.electricalArrangement === '02')
        .length,
    ).toBe(30)
    expect(
      VALID_MODEL_CODES.filter((c) => parseRPModelCode(c)?.electricalArrangement === '11')
        .length,
    ).toBe(27)
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

describe('isValidRPCombination', () => {
  it('valid for all codes in VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseRPModelCode(code)!
      const result = isValidRPCombination(parsed)
      expect(result.valid).toBe(true)
    }
  })

  it('invalid for HF + non-red', () => {
    const result = isValidRPCombination({
      colour: 'G',
      mounting: 'D2',
      electricalArrangement: '02',
      label: 'HF',
    })
    expect(result.valid).toBe(false)
  })

  it('invalid for RM + non-green', () => {
    const result = isValidRPCombination({
      colour: 'Y',
      mounting: 'D2',
      electricalArrangement: '02',
      label: 'RM',
    })
    expect(result.valid).toBe(false)
  })

  it('invalid for SAK + red', () => {
    const result = isValidRPCombination({
      colour: 'R',
      mounting: 'D2',
      electricalArrangement: '02',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })

  it('invalid for SAK + green', () => {
    const result = isValidRPCombination({
      colour: 'G',
      mounting: 'D2',
      electricalArrangement: '02',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })

  it('valid when incomplete — returns valid:true', () => {
    expect(
      isValidRPCombination({ colour: 'R', mounting: 'D2', electricalArrangement: '02' }),
    ).toEqual({ valid: true })
  })
})

describe('getValidRPOptionsForStep', () => {
  it('colour step — no constraints → all 6', () => {
    expect(getValidRPOptionsForStep('colour', {}).sort()).toEqual([
      'B',
      'G',
      'O',
      'R',
      'W',
      'Y',
    ])
  })

  it('mounting for red — D2, S2 only', () => {
    expect(getValidRPOptionsForStep('mounting', { colour: 'R' }).sort()).toEqual([
      'D2',
      'S2',
    ])
  })

  it('mounting for green — D2, F2, S2', () => {
    expect(getValidRPOptionsForStep('mounting', { colour: 'G' }).sort()).toEqual([
      'D2',
      'F2',
      'S2',
    ])
  })

  it('label for red — HF only', () => {
    expect(getValidRPOptionsForStep('label', { colour: 'R' })).toEqual(['HF'])
  })

  it('label for green — RM, CL', () => {
    expect(getValidRPOptionsForStep('label', { colour: 'G' }).sort()).toEqual([
      'CL',
      'RM',
    ])
  })

  it('label for yellow — SAK, CL', () => {
    expect(getValidRPOptionsForStep('label', { colour: 'Y' }).sort()).toEqual([
      'CL',
      'SAK',
    ])
  })

  it('ea options — always 02, 11', () => {
    expect(
      getValidRPOptionsForStep('electricalArrangement', { colour: 'R' }).sort(),
    ).toEqual(['02', '11'])
  })

  it('colour for HF label — R only', () => {
    expect(getValidRPOptionsForStep('colour', { label: 'HF' })).toEqual(['R'])
  })

  it('colour for RM label — G only', () => {
    expect(getValidRPOptionsForStep('colour', { label: 'RM' })).toEqual(['G'])
  })

  it('colour for SAK label — Y, W, B, O', () => {
    expect(getValidRPOptionsForStep('colour', { label: 'SAK' }).sort()).toEqual([
      'B',
      'O',
      'W',
      'Y',
    ])
  })

  it('colour for CL label — G, Y, W, B, O', () => {
    expect(getValidRPOptionsForStep('colour', { label: 'CL' }).sort()).toEqual([
      'B',
      'G',
      'O',
      'W',
      'Y',
    ])
  })
})

describe('constraint engine — resetCallPoints', () => {
  const engine = createConstraintEngine(RESET_CALL_POINTS_CONSTRAINTS)

  it('allows RP-RD2-02 combination', () => {
    const result = engine.checkOptionAvailability('label', 'HF', {
      colour: 'R',
      mounting: 'D2',
      electricalArrangement: '02',
    })
    expect(result.available).toBe(true)
  })

  it('blocks HF for green', () => {
    const result = engine.checkOptionAvailability('label', 'HF', {
      colour: 'G',
    })
    expect(result.available).toBe(false)
  })

  it('blocks RM for red', () => {
    const result = engine.checkOptionAvailability('label', 'RM', {
      colour: 'R',
    })
    expect(result.available).toBe(false)
  })

  it('blocks F2 mounting for red', () => {
    const result = engine.checkOptionAvailability('mounting', 'F2', {
      colour: 'R',
    })
    expect(result.available).toBe(false)
  })

  it('allows F2 for green', () => {
    const result = engine.checkOptionAvailability('mounting', 'F2', {
      colour: 'G',
    })
    expect(result.available).toBe(true)
  })

  it('blocks HF for F2 mounting', () => {
    const result = engine.checkOptionAvailability('label', 'HF', {
      mounting: 'F2',
    })
    expect(result.available).toBe(false)
  })

  it('constraint engine modelId matches', () => {
    expect(RESET_CALL_POINTS_CONSTRAINTS.modelId).toBe('reset-call-points')
  })
})

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

  it('all 57 valid codes generated from parsed configurations', () => {
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
