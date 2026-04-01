import { describe, it, expect } from 'vitest'
import {
  buildKSModelCode,
  parseKSModelCode,
  isValidKSCombination,
  getValidKSOptionsForStep,
  VALID_MODEL_CODES,
  KEY_SWITCHES_CONSTRAINTS,
} from '@entities/product/rules/keySwitchesRules'
import { keySwitchesModel } from '@entities/product/models/keySwitches'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

describe('buildKSModelCode', () => {
  it('builds SAK label — no suffix', () => {
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'single-pole',
        label: 'SAK',
      }),
    ).toBe('SS3-1020')
  })

  it('builds CL label — appends -CL', () => {
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'single-pole',
        label: 'CL',
      }),
    ).toBe('SS3-1020-CL')
  })

  it('builds orange housing correctly — E0 colourMounting', () => {
    expect(
      buildKSModelCode({
        colourMounting: 'E0',
        switchType: 'three-pos',
        electricalArrangement: 'three-pos-arr',
        label: 'SAK',
      }),
    ).toBe('SS3-E053')
    expect(
      buildKSModelCode({
        colourMounting: 'E0',
        switchType: 'three-pos',
        electricalArrangement: 'three-pos-arr',
        label: 'CL',
      }),
    ).toBe('SS3-E053-CL')
  })

  it('builds two-pos + double-no → 41 fragment', () => {
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'double-no',
        label: 'SAK',
      }),
    ).toBe('SS3-1041')
  })

  it('builds two-pos + double-nc → 42 fragment', () => {
    expect(
      buildKSModelCode({
        colourMounting: '50',
        switchType: 'two-pos',
        electricalArrangement: 'double-nc',
        label: 'CL',
      }),
    ).toBe('SS3-5042-CL')
  })

  it('builds two-pos-lock + single-pole → 30 fragment', () => {
    expect(
      buildKSModelCode({
        colourMounting: '30',
        switchType: 'two-pos-lock',
        electricalArrangement: 'single-pole',
        label: 'SAK',
      }),
    ).toBe('SS3-3030')
  })

  it('builds two-pos-lock + double-no-lock → 31 fragment', () => {
    expect(
      buildKSModelCode({
        colourMounting: '50',
        switchType: 'two-pos-lock',
        electricalArrangement: 'double-no-lock',
        label: 'CL',
      }),
    ).toBe('SS3-5031-CL')
  })

  it('builds two-pos-lock + double-nc-lock → 32 fragment', () => {
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: 'two-pos-lock',
        electricalArrangement: 'double-nc-lock',
        label: 'SAK',
      }),
    ).toBe('SS3-1032')
  })

  it('returns null when any field is missing', () => {
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'single-pole',
      }),
    ).toBeNull()
    expect(
      buildKSModelCode({ colourMounting: '10', switchType: 'two-pos', label: 'SAK' }),
    ).toBeNull()
    expect(buildKSModelCode({})).toBeNull()
  })

  it('returns null for invalid switchType+EA combination', () => {
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'double-no-lock',
        label: 'SAK',
      }),
    ).toBeNull()
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: 'two-pos-lock',
        electricalArrangement: 'double-no',
        label: 'SAK',
      }),
    ).toBeNull()
    expect(
      buildKSModelCode({
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'three-pos-arr',
        label: 'SAK',
      }),
    ).toBeNull()
  })
})

describe('parseKSModelCode', () => {
  it('parses SS3-1020 — two-pos + single-pole', () => {
    expect(parseKSModelCode('SS3-1020')).toEqual({
      colourMounting: '10',
      switchType: 'two-pos',
      electricalArrangement: 'single-pole',
      label: 'SAK',
    })
  })

  it('parses SS3-1020-CL correctly', () => {
    expect(parseKSModelCode('SS3-1020-CL')).toEqual({
      colourMounting: '10',
      switchType: 'two-pos',
      electricalArrangement: 'single-pole',
      label: 'CL',
    })
  })

  it('parses SS3-1041 — two-pos + double-no', () => {
    expect(parseKSModelCode('SS3-1041')).toEqual({
      colourMounting: '10',
      switchType: 'two-pos',
      electricalArrangement: 'double-no',
      label: 'SAK',
    })
  })

  it('parses SS3-1042 — two-pos + double-nc', () => {
    expect(parseKSModelCode('SS3-1042')).toEqual({
      colourMounting: '10',
      switchType: 'two-pos',
      electricalArrangement: 'double-nc',
      label: 'SAK',
    })
  })

  it('parses SS3-1030 — two-pos-lock + single-pole', () => {
    expect(parseKSModelCode('SS3-1030')).toEqual({
      colourMounting: '10',
      switchType: 'two-pos-lock',
      electricalArrangement: 'single-pole',
      label: 'SAK',
    })
  })

  it('parses SS3-1031-CL — two-pos-lock + double-no-lock', () => {
    expect(parseKSModelCode('SS3-1031-CL')).toEqual({
      colourMounting: '10',
      switchType: 'two-pos-lock',
      electricalArrangement: 'double-no-lock',
      label: 'CL',
    })
  })

  it('parses SS3-1032 — two-pos-lock + double-nc-lock', () => {
    expect(parseKSModelCode('SS3-1032')).toEqual({
      colourMounting: '10',
      switchType: 'two-pos-lock',
      electricalArrangement: 'double-nc-lock',
      label: 'SAK',
    })
  })

  it('parses SS3-E053 — three-pos + three-pos-arr', () => {
    expect(parseKSModelCode('SS3-E053')).toEqual({
      colourMounting: 'E0',
      switchType: 'three-pos',
      electricalArrangement: 'three-pos-arr',
      label: 'SAK',
    })
  })

  it('returns null for invalid format', () => {
    expect(parseKSModelCode('INVALID')).toBeNull()
    expect(parseKSModelCode('SS3-102')).toBeNull()
    expect(parseKSModelCode('SS3-10200')).toBeNull()
    expect(parseKSModelCode('SS3-GG20')).toBeNull()
    expect(parseKSModelCode('')).toBeNull()
  })

  it('returns null for unknown fragment', () => {
    expect(parseKSModelCode('SS3-1099')).toBeNull()
    expect(parseKSModelCode('SS3-1011')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseKSModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildKSModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 68 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(68)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(68)
  })

  it('switchType distribution: two-pos→22, two-pos-lock→28, three-pos→18', () => {
    const parse = (c: string) => parseKSModelCode(c)
    expect(
      VALID_MODEL_CODES.filter((c) => parse(c)?.switchType === 'two-pos').length,
    ).toBe(22)
    expect(
      VALID_MODEL_CODES.filter((c) => parse(c)?.switchType === 'two-pos-lock').length,
    ).toBe(28)
    expect(
      VALID_MODEL_CODES.filter((c) => parse(c)?.switchType === 'three-pos').length,
    ).toBe(18)
  })

  it('every non-CL model has a CL counterpart', () => {
    const nonCL = VALID_MODEL_CODES.filter((c) => !c.endsWith('-CL'))
    for (const code of nonCL) {
      expect(VALID_MODEL_CODES).toContain(`${code}-CL`)
    }
  })

  it('34 CL and 34 SAK codes', () => {
    expect(VALID_MODEL_CODES.filter((c) => c.endsWith('-CL')).length).toBe(34)
    expect(VALID_MODEL_CODES.filter((c) => !c.endsWith('-CL')).length).toBe(34)
  })

  it('double-no only appears with two-pos, double-no-lock only with two-pos-lock', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseKSModelCode(code)!
      if (parsed.electricalArrangement === 'double-no') {
        expect(parsed.switchType).toBe('two-pos')
      }
      if (parsed.electricalArrangement === 'double-no-lock') {
        expect(parsed.switchType).toBe('two-pos-lock')
      }
    }
  })

  it('double-nc only appears with two-pos, double-nc-lock only with two-pos-lock', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseKSModelCode(code)!
      if (parsed.electricalArrangement === 'double-nc') {
        expect(parsed.switchType).toBe('two-pos')
      }
      if (parsed.electricalArrangement === 'double-nc-lock') {
        expect(parsed.switchType).toBe('two-pos-lock')
      }
    }
  })

  it('three-pos always has three-pos-arr', () => {
    const codes = VALID_MODEL_CODES.filter(
      (c) => parseKSModelCode(c)?.switchType === 'three-pos',
    )
    for (const code of codes) {
      expect(parseKSModelCode(code)?.electricalArrangement).toBe('three-pos-arr')
    }
  })

  it('E0 never has double-no or double-no-lock', () => {
    const e0 = VALID_MODEL_CODES.filter(
      (c) => parseKSModelCode(c)?.colourMounting === 'E0',
    )
    for (const code of e0) {
      const ea = parseKSModelCode(code)?.electricalArrangement
      expect(ea).not.toBe('double-no')
      expect(ea).not.toBe('double-no-lock')
    }
  })

  it('colourMounting=30 and 90 never have three-pos-arr', () => {
    for (const cm of ['30', '90']) {
      const codes = VALID_MODEL_CODES.filter(
        (c) => parseKSModelCode(c)?.colourMounting === cm,
      )
      for (const code of codes) {
        expect(parseKSModelCode(code)?.electricalArrangement).not.toBe('three-pos-arr')
      }
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseKSModelCode(code)).not.toBeNull()
    }
  })
})

describe('isValidKSCombination', () => {
  it('all 68 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseKSModelCode(code)!
      expect(isValidKSCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidKSCombination({})).toEqual({ valid: true })
    expect(isValidKSCombination({ colourMounting: '10' })).toEqual({ valid: true })
    expect(
      isValidKSCombination({
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'single-pole',
      }),
    ).toEqual({ valid: true })
  })

  it('rejects E0 with two-pos + double-no', () => {
    const result = isValidKSCombination({
      colourMounting: 'E0',
      switchType: 'two-pos',
      electricalArrangement: 'double-no',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects invalid cross: two-pos + double-no-lock', () => {
    const result = isValidKSCombination({
      colourMounting: '10',
      switchType: 'two-pos',
      electricalArrangement: 'double-no-lock',
      label: 'SAK',
    })
    expect(result.valid).toBe(true)
  })

  it('rejects colourMounting=30 with three-pos', () => {
    const result = isValidKSCombination({
      colourMounting: '30',
      switchType: 'three-pos',
      electricalArrangement: 'three-pos-arr',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })

  it('rejects colourMounting=90 with three-pos', () => {
    const result = isValidKSCombination({
      colourMounting: '90',
      switchType: 'three-pos',
      electricalArrangement: 'three-pos-arr',
      label: 'SAK',
    })
    expect(result.valid).toBe(false)
  })
})

describe('getValidKSOptionsForStep', () => {
  it('two-pos allows single-pole, double-no, double-nc only', () => {
    const valid = getValidKSOptionsForStep('electricalArrangement', {
      switchType: 'two-pos',
    })
    expect(valid).toContain('single-pole')
    expect(valid).toContain('double-no')
    expect(valid).toContain('double-nc')
    expect(valid).not.toContain('double-no-lock')
    expect(valid).not.toContain('double-nc-lock')
    expect(valid).not.toContain('three-pos-arr')
  })

  it('two-pos-lock allows single-pole, double-no-lock, double-nc-lock only', () => {
    const valid = getValidKSOptionsForStep('electricalArrangement', {
      switchType: 'two-pos-lock',
    })
    expect(valid).toContain('single-pole')
    expect(valid).toContain('double-no-lock')
    expect(valid).toContain('double-nc-lock')
    expect(valid).not.toContain('double-no')
    expect(valid).not.toContain('double-nc')
    expect(valid).not.toContain('three-pos-arr')
  })

  it('three-pos forces three-pos-arr', () => {
    const valid = getValidKSOptionsForStep('electricalArrangement', {
      switchType: 'three-pos',
    })
    expect(valid).toEqual(['three-pos-arr'])
  })

  it('three-pos-arr forces three-pos', () => {
    const valid = getValidKSOptionsForStep('switchType', {
      electricalArrangement: 'three-pos-arr',
    })
    expect(valid).toEqual(['three-pos'])
  })

  it('double-no forces two-pos', () => {
    const valid = getValidKSOptionsForStep('switchType', {
      electricalArrangement: 'double-no',
    })
    expect(valid).toEqual(['two-pos'])
  })

  it('double-no-lock forces two-pos-lock', () => {
    const valid = getValidKSOptionsForStep('switchType', {
      electricalArrangement: 'double-no-lock',
    })
    expect(valid).toEqual(['two-pos-lock'])
  })

  it('single-pole allows two-pos and two-pos-lock', () => {
    const valid = getValidKSOptionsForStep('switchType', {
      electricalArrangement: 'single-pole',
    })
    expect(valid).toContain('two-pos')
    expect(valid).toContain('two-pos-lock')
    expect(valid).not.toContain('three-pos')
  })

  it('E0 does not allow double-no or double-no-lock in EA', () => {
    const valid = getValidKSOptionsForStep('electricalArrangement', {
      colourMounting: 'E0',
    })
    expect(valid).not.toContain('double-no')
    expect(valid).not.toContain('double-no-lock')
    expect(valid).toContain('single-pole')
    expect(valid).toContain('double-nc-lock')
    expect(valid).toContain('three-pos-arr')
  })

  it('colourMounting=30 and 90 do not allow three-pos-arr', () => {
    for (const cm of ['30', '90']) {
      const valid = getValidKSOptionsForStep('electricalArrangement', {
        colourMounting: cm,
      })
      expect(valid).not.toContain('three-pos-arr')
    }
  })

  it('both label options available for all colourMounting values', () => {
    for (const cm of ['10', '30', '50', '70', '90', 'E0']) {
      const valid = getValidKSOptionsForStep('label', { colourMounting: cm })
      expect(valid).toContain('CL')
      expect(valid).toContain('SAK')
    }
  })

  it('label not constrained by switchType or electricalArrangement alone', () => {
    for (const st of ['two-pos', 'two-pos-lock', 'three-pos']) {
      const valid = getValidKSOptionsForStep('label', { switchType: st })
      expect(valid).toContain('CL')
      expect(valid).toContain('SAK')
    }
  })
})

describe('KEY_SWITCHES_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(KEY_SWITCHES_CONSTRAINTS)

  it('blocks three-pos when colourMounting=30 or 90', () => {
    for (const cm of ['30', '90']) {
      expect(
        engine.checkOptionAvailability('switchType', 'three-pos', { colourMounting: cm })
          .available,
      ).toBe(false)
    }
  })

  it('allows all three switchTypes when colourMounting=10', () => {
    for (const st of ['two-pos', 'two-pos-lock', 'three-pos']) {
      expect(
        engine.checkOptionAvailability('switchType', st, { colourMounting: '10' })
          .available,
      ).toBe(true)
    }
  })

  it('two-pos blocks double-no-lock and double-nc-lock', () => {
    for (const ea of ['double-no-lock', 'double-nc-lock']) {
      expect(
        engine.checkOptionAvailability('electricalArrangement', ea, {
          switchType: 'two-pos',
        }).available,
      ).toBe(false)
    }
  })

  it('two-pos allows single-pole, double-no, double-nc', () => {
    for (const ea of ['single-pole', 'double-no', 'double-nc']) {
      expect(
        engine.checkOptionAvailability('electricalArrangement', ea, {
          switchType: 'two-pos',
        }).available,
      ).toBe(true)
    }
  })

  it('two-pos-lock blocks double-no and double-nc', () => {
    for (const ea of ['double-no', 'double-nc']) {
      expect(
        engine.checkOptionAvailability('electricalArrangement', ea, {
          switchType: 'two-pos-lock',
        }).available,
      ).toBe(false)
    }
  })

  it('two-pos-lock allows single-pole, double-no-lock, double-nc-lock', () => {
    for (const ea of ['single-pole', 'double-no-lock', 'double-nc-lock']) {
      expect(
        engine.checkOptionAvailability('electricalArrangement', ea, {
          switchType: 'two-pos-lock',
        }).available,
      ).toBe(true)
    }
  })

  it('three-pos allows only three-pos-arr', () => {
    expect(
      engine.checkOptionAvailability('electricalArrangement', 'three-pos-arr', {
        switchType: 'three-pos',
      }).available,
    ).toBe(true)
    for (const ea of [
      'single-pole',
      'double-no',
      'double-no-lock',
      'double-nc',
      'double-nc-lock',
    ]) {
      expect(
        engine.checkOptionAvailability('electricalArrangement', ea, {
          switchType: 'three-pos',
        }).available,
      ).toBe(false)
    }
  })

  it('three-pos-arr blocks for two-pos and two-pos-lock', () => {
    for (const st of ['two-pos', 'two-pos-lock']) {
      expect(
        engine.checkOptionAvailability('electricalArrangement', 'three-pos-arr', {
          switchType: st,
        }).available,
      ).toBe(false)
    }
  })

  it('blocks three-pos-arr when colourMounting=30 or 90', () => {
    for (const cm of ['30', '90']) {
      expect(
        engine.checkOptionAvailability('electricalArrangement', 'three-pos-arr', {
          colourMounting: cm,
        }).available,
      ).toBe(false)
    }
  })

  it('label not included in constraint matrices — 6 constraints total', () => {
    expect(KEY_SWITCHES_CONSTRAINTS.constraints).toHaveLength(6)
    const steps = KEY_SWITCHES_CONSTRAINTS.constraints.flatMap((c) => [
      c.sourceStep,
      c.targetStep,
    ])
    expect(steps).not.toContain('label')
  })

  it('constraint engine modelId matches', () => {
    expect(KEY_SWITCHES_CONSTRAINTS.modelId).toBe('key-switches')
  })
})

describe('buildProductModel — keySwitches', () => {
  it('builds SS3-1020 — two-pos + single-pole', () => {
    const config: Configuration = {
      colourMounting: '10',
      switchType: 'two-pos',
      electricalArrangement: 'single-pole',
      label: 'SAK',
    }
    const result = buildProductModel(config, keySwitchesModel)
    expect(result.fullCode).toBe('SS3-1020')
    expect(result.isComplete).toBe(true)
  })

  it('builds SS3-1020-CL correctly', () => {
    const config: Configuration = {
      colourMounting: '10',
      switchType: 'two-pos',
      electricalArrangement: 'single-pole',
      label: 'CL',
    }
    const result = buildProductModel(config, keySwitchesModel)
    expect(result.fullCode).toBe('SS3-1020-CL')
    expect(result.isComplete).toBe(true)
  })

  it('builds SS3-1041 — two-pos + double-no', () => {
    const result = buildProductModel(
      {
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'double-no',
        label: 'SAK',
      },
      keySwitchesModel,
    )
    expect(result.fullCode).toBe('SS3-1041')
  })

  it('builds SS3-5031-CL — two-pos-lock + double-no-lock', () => {
    const result = buildProductModel(
      {
        colourMounting: '50',
        switchType: 'two-pos-lock',
        electricalArrangement: 'double-no-lock',
        label: 'CL',
      },
      keySwitchesModel,
    )
    expect(result.fullCode).toBe('SS3-5031-CL')
  })

  it('builds SS3-1032 — two-pos-lock + double-nc-lock', () => {
    const result = buildProductModel(
      {
        colourMounting: '10',
        switchType: 'two-pos-lock',
        electricalArrangement: 'double-nc-lock',
        label: 'SAK',
      },
      keySwitchesModel,
    )
    expect(result.fullCode).toBe('SS3-1032')
  })

  it('builds SS3-E053-CL — three-pos', () => {
    const result = buildProductModel(
      {
        colourMounting: 'E0',
        switchType: 'three-pos',
        electricalArrangement: 'three-pos-arr',
        label: 'CL',
      },
      keySwitchesModel,
    )
    expect(result.fullCode).toBe('SS3-E053-CL')
  })

  it('SAK label has empty code — no suffix', () => {
    const result = buildProductModel(
      {
        colourMounting: '30',
        switchType: 'two-pos-lock',
        electricalArrangement: 'single-pole',
        label: 'SAK',
      },
      keySwitchesModel,
    )
    expect(result.fullCode).toBe('SS3-3030')
    expect(result.fullCode).not.toMatch(/-$/)
    expect(result.fullCode).not.toContain('SAK')
  })

  it('baseCode is SS3-', () => {
    const result = buildProductModel(
      {
        colourMounting: null,
        switchType: null,
        electricalArrangement: null,
        label: null,
      },
      keySwitchesModel,
    )
    expect(result.baseCode).toBe('SS3-')
  })

  it('partial config: only colourMounting shows SS3-10', () => {
    const result = buildProductModel(
      {
        colourMounting: '10',
        switchType: null,
        electricalArrangement: null,
        label: null,
      },
      keySwitchesModel,
    )
    expect(result.fullCode).toBe('SS3-10')
    expect(result.isComplete).toBe(false)
  })

  it('partial config: colourMounting + switchType still shows SS3-10', () => {
    const result = buildProductModel(
      {
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: null,
        label: null,
      },
      keySwitchesModel,
    )
    expect(result.fullCode).toBe('SS3-10')
    expect(result.isComplete).toBe(false)
  })

  it('partial config: colourMounting + switchType + EA shows full fragment', () => {
    const result = buildProductModel(
      {
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'single-pole',
        label: null,
      },
      keySwitchesModel,
    )
    expect(result.fullCode).toBe('SS3-1020')
    expect(result.isComplete).toBe(false)
  })

  it('marks incomplete when steps missing', () => {
    const result = buildProductModel(
      {
        colourMounting: '10',
        switchType: null,
        electricalArrangement: null,
        label: null,
      },
      keySwitchesModel,
    )
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('switchType')
    expect(result.missingSteps).toContain('electricalArrangement')
    expect(result.missingSteps).toContain('label')
  })

  it('all 68 valid codes generated from parsed configurations', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseKSModelCode(code)!
      const config: Configuration = {
        colourMounting: parsed.colourMounting ?? null,
        switchType: parsed.switchType ?? null,
        electricalArrangement: parsed.electricalArrangement ?? null,
        label: parsed.label ?? null,
      }
      const result = buildProductModel(config, keySwitchesModel)
      if (validSet.has(result.fullCode)) matchCount++
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

describe('isConfigurationComplete — keySwitches', () => {
  it('returns true when all 4 steps selected', () => {
    expect(
      isConfigurationComplete(keySwitchesModel, {
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'single-pole',
        label: 'SAK',
      }),
    ).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(keySwitchesModel, {
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'single-pole',
        label: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const missing = getMissingRequiredSteps(keySwitchesModel, {
      colourMounting: 'E0',
      switchType: null,
      electricalArrangement: null,
      label: null,
    })
    expect(missing).toContain('switchType')
    expect(missing).toContain('electricalArrangement')
    expect(missing).toContain('label')
    expect(missing).not.toContain('colourMounting')
  })

  it('getCompletionPercentage for 4-step model', () => {
    expect(
      getCompletionPercentage(keySwitchesModel, {
        colourMounting: null,
        switchType: null,
        electricalArrangement: null,
        label: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(keySwitchesModel, {
        colourMounting: '10',
        switchType: null,
        electricalArrangement: null,
        label: null,
      }),
    ).toBe(25)

    expect(
      getCompletionPercentage(keySwitchesModel, {
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'single-pole',
        label: null,
      }),
    ).toBe(75)

    expect(
      getCompletionPercentage(keySwitchesModel, {
        colourMounting: '10',
        switchType: 'two-pos',
        electricalArrangement: 'single-pole',
        label: 'SAK',
      }),
    ).toBe(100)
  })
})

describe('keySwitchesModel definition', () => {
  it('has correct model id and slug', () => {
    expect(keySwitchesModel.id).toBe('key-switches')
    expect(keySwitchesModel.slug).toBe('key-switches')
  })

  it('stepOrder has 4 steps', () => {
    expect(keySwitchesModel.stepOrder).toEqual([
      'colourMounting',
      'switchType',
      'electricalArrangement',
      'label',
    ])
  })

  it('all steps are required', () => {
    for (const step of keySwitchesModel.steps) {
      expect(step.required).toBe(true)
    }
  })

  it('switchType has 3 options', () => {
    const stStep = keySwitchesModel.steps.find((s) => s.id === 'switchType')!
    expect(stStep.options).toHaveLength(3)
    const ids = stStep.options.map((o) => o.id)
    expect(ids).toEqual(['two-pos', 'two-pos-lock', 'three-pos'])
  })

  it('electricalArrangement has 6 options', () => {
    const eaStep = keySwitchesModel.steps.find((s) => s.id === 'electricalArrangement')!
    expect(eaStep.options).toHaveLength(6)
    const ids = eaStep.options.map((o) => o.id)
    expect(ids).toEqual([
      'single-pole',
      'double-no',
      'double-no-lock',
      'double-nc',
      'double-nc-lock',
      'three-pos-arr',
    ])
  })

  it('switchType and EA options have empty code', () => {
    const stStep = keySwitchesModel.steps.find((s) => s.id === 'switchType')!
    for (const opt of stStep.options) {
      expect(opt.code).toBe('')
    }
    const eaStep = keySwitchesModel.steps.find((s) => s.id === 'electricalArrangement')!
    for (const opt of eaStep.options) {
      expect(opt.code).toBe('')
    }
  })

  it('no option labels contain # index prefix', () => {
    for (const step of keySwitchesModel.steps) {
      for (const opt of step.options) {
        expect(opt.label).not.toMatch(/^#/)
      }
    }
  })

  it('double-no available only for two-pos', () => {
    const eaStep = keySwitchesModel.steps.find((s) => s.id === 'electricalArrangement')!
    const opt = eaStep.options.find((o) => o.id === 'double-no')!
    expect(opt.availableFor).toEqual(['two-pos'])
  })

  it('double-no-lock available only for two-pos-lock', () => {
    const eaStep = keySwitchesModel.steps.find((s) => s.id === 'electricalArrangement')!
    const opt = eaStep.options.find((o) => o.id === 'double-no-lock')!
    expect(opt.availableFor).toEqual(['two-pos-lock'])
  })

  it('single-pole available for two-pos and two-pos-lock', () => {
    const eaStep = keySwitchesModel.steps.find((s) => s.id === 'electricalArrangement')!
    const opt = eaStep.options.find((o) => o.id === 'single-pole')!
    expect(opt.availableFor).toEqual(['two-pos', 'two-pos-lock'])
  })

  it('three-pos-arr available for three-pos only', () => {
    const eaStep = keySwitchesModel.steps.find((s) => s.id === 'electricalArrangement')!
    const opt = eaStep.options.find((o) => o.id === 'three-pos-arr')!
    expect(opt.availableFor).toEqual(['three-pos'])
  })

  it('codeLookup is defined with 7 entries', () => {
    const { codeLookup } = keySwitchesModel.productModelSchema
    expect(codeLookup).toBeDefined()
    expect(codeLookup!.steps).toEqual(['switchType', 'electricalArrangement'])
    expect(Object.keys(codeLookup!.map)).toHaveLength(7)
  })

  it('baseCode is SS3-', () => {
    expect(keySwitchesModel.productModelSchema.baseCode).toBe('SS3-')
  })

  it('only label uses dash separator', () => {
    const { separatorMap } = keySwitchesModel.productModelSchema
    expect(separatorMap?.label).toBe('-')
    expect(separatorMap?.colourMounting).toBe('')
    expect(separatorMap?.switchType).toBe('')
    expect(separatorMap?.electricalArrangement).toBe('')
  })
})
