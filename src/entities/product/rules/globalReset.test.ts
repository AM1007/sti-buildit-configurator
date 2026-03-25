import { describe, it, expect } from 'vitest'
import {
  buildGLRModelCode,
  buildGRModelCode,
  parseGLRModelCode,
  parseGRModelCode,
  isValidGLRCombination,
  isValidGRCombination,
  getValidGLROptionsForStep,
  getValidGROptionsForStep,
  VALID_GLR_CODES,
  VALID_GR_CODES,
  VALID_MODEL_CODES,
  GLOBAL_RESET_CONSTRAINTS,
} from '@entities/product/rules/globalResetRules'
import { globalResetModel } from '@entities/product/models/globalReset'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules'
import type { Configuration } from '@shared/types'

describe('buildGLRModelCode', () => {
  it('builds GLR001ZA-EN correctly', () => {
    expect(buildGLRModelCode({ colour: '001', text: 'ZA', language: 'EN' })).toBe(
      'GLR001ZA-EN',
    )
  })

  it('builds GLR101RM-EN correctly', () => {
    expect(buildGLRModelCode({ colour: '101', text: 'RM', language: 'EN' })).toBe(
      'GLR101RM-EN',
    )
  })

  it('builds GLR201ZA-UA correctly', () => {
    expect(buildGLRModelCode({ colour: '201', text: 'ZA', language: 'UA' })).toBe(
      'GLR201ZA-UA',
    )
  })

  it('returns null when any field is missing', () => {
    expect(buildGLRModelCode({ colour: '001', text: 'ZA' })).toBeNull()
    expect(buildGLRModelCode({ colour: '001', language: 'EN' })).toBeNull()
    expect(buildGLRModelCode({ text: 'ZA', language: 'EN' })).toBeNull()
    expect(buildGLRModelCode({})).toBeNull()
  })
})

describe('buildGRModelCode', () => {
  it('builds GR-RF-22-0 correctly', () => {
    expect(buildGRModelCode({ mounting: 'F', grText: '22-0' })).toBe('GR-RF-22-0')
  })

  it('builds GR-RS-22-0-EN correctly', () => {
    expect(buildGRModelCode({ mounting: 'S', grText: '22-0-EN' })).toBe('GR-RS-22-0-EN')
  })

  it('returns null when any field is missing', () => {
    expect(buildGRModelCode({ mounting: 'F' })).toBeNull()
    expect(buildGRModelCode({ grText: '22-0' })).toBeNull()
    expect(buildGRModelCode({})).toBeNull()
  })
})

describe('parseGLRModelCode', () => {
  it('parses GLR001ZA-EN correctly', () => {
    expect(parseGLRModelCode('GLR001ZA-EN')).toEqual({
      colour: '001',
      text: 'ZA',
      language: 'EN',
    })
  })

  it('parses GLR101RM-EN correctly', () => {
    expect(parseGLRModelCode('GLR101RM-EN')).toEqual({
      colour: '101',
      text: 'RM',
      language: 'EN',
    })
  })

  it('parses GLR401ZA-UA correctly', () => {
    expect(parseGLRModelCode('GLR401ZA-UA')).toEqual({
      colour: '401',
      text: 'ZA',
      language: 'UA',
    })
  })

  it('returns null for invalid format', () => {
    expect(parseGLRModelCode('INVALID')).toBeNull()
    expect(parseGLRModelCode('GLR01ZA-EN')).toBeNull()
    expect(parseGLRModelCode('GLR001ZA')).toBeNull()
    expect(parseGLRModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_GLR_CODES', () => {
    for (const code of VALID_GLR_CODES) {
      const parsed = parseGLRModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildGLRModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

describe('parseGRModelCode', () => {
  it('parses GR-RF-22-0 correctly', () => {
    expect(parseGRModelCode('GR-RF-22-0')).toEqual({ mounting: 'F', grText: '22-0' })
  })

  it('parses GR-RS-22-0-EN correctly', () => {
    expect(parseGRModelCode('GR-RS-22-0-EN')).toEqual({
      mounting: 'S',
      grText: '22-0-EN',
    })
  })

  it('returns null for invalid format', () => {
    expect(parseGRModelCode('INVALID')).toBeNull()
    expect(parseGRModelCode('GLR001ZA-EN')).toBeNull()
    expect(parseGRModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_GR_CODES', () => {
    for (const code of VALID_GR_CODES) {
      const parsed = parseGRModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildGRModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

describe('VALID_GLR_CODES', () => {
  it('contains exactly 13 entries', () => {
    expect(VALID_GLR_CODES.length).toBe(13)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_GLR_CODES).size).toBe(13)
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_GLR_CODES) {
      expect(parseGLRModelCode(code)).not.toBeNull()
    }
  })

  it('colour 001 only supports ZA text', () => {
    const codes = VALID_GLR_CODES.filter((c) => parseGLRModelCode(c)?.colour === '001')
    expect(codes).toHaveLength(2)
    for (const c of codes) {
      expect(parseGLRModelCode(c)?.text).toBe('ZA')
    }
  })

  it('colour 101 supports EM, EX, RM, ZA', () => {
    const codes = VALID_GLR_CODES.filter((c) => parseGLRModelCode(c)?.colour === '101')
    const texts = codes.map((c) => parseGLRModelCode(c)?.text)
    expect(texts).toContain('EM')
    expect(texts).toContain('EX')
    expect(texts).toContain('RM')
    expect(texts).toContain('ZA')
  })

  it('colour 201, 301, 401 only support ZA text', () => {
    for (const colour of ['201', '301', '401']) {
      const codes = VALID_GLR_CODES.filter((c) => parseGLRModelCode(c)?.colour === colour)
      expect(codes).toHaveLength(2)
      for (const c of codes) {
        expect(parseGLRModelCode(c)?.text).toBe('ZA')
      }
    }
  })

  it('ZA text available in both EN and UA languages', () => {
    const zaCodes = VALID_GLR_CODES.filter((c) => parseGLRModelCode(c)?.text === 'ZA')
    const languages = zaCodes.map((c) => parseGLRModelCode(c)?.language)
    expect(languages).toContain('EN')
    expect(languages).toContain('UA')
  })

  it('EM, EX, RM texts only available in EN', () => {
    for (const text of ['EM', 'EX', 'RM']) {
      const codes = VALID_GLR_CODES.filter((c) => parseGLRModelCode(c)?.text === text)
      for (const c of codes) {
        expect(parseGLRModelCode(c)?.language).toBe('EN')
      }
    }
  })
})

describe('VALID_GR_CODES', () => {
  it('contains exactly 4 entries', () => {
    expect(VALID_GR_CODES.length).toBe(4)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_GR_CODES).size).toBe(4)
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_GR_CODES) {
      expect(parseGRModelCode(code)).not.toBeNull()
    }
  })

  it('contains both F and S mounting options', () => {
    const mountings = VALID_GR_CODES.map((c) => parseGRModelCode(c)?.mounting)
    expect(mountings).toContain('F')
    expect(mountings).toContain('S')
  })

  it('contains both 22-0 and 22-0-EN text options', () => {
    const texts = VALID_GR_CODES.map((c) => parseGRModelCode(c)?.grText)
    expect(texts).toContain('22-0')
    expect(texts).toContain('22-0-EN')
  })
})

describe('VALID_MODEL_CODES', () => {
  it('contains 17 entries total (13 GLR + 4 GR)', () => {
    expect(VALID_MODEL_CODES.length).toBe(17)
  })
})

describe('isValidGLRCombination', () => {
  it('all 13 VALID_GLR_CODES pass validation', () => {
    for (const code of VALID_GLR_CODES) {
      const parsed = parseGLRModelCode(code)!
      expect(isValidGLRCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidGLRCombination({})).toEqual({ valid: true })
    expect(isValidGLRCombination({ colour: '001' })).toEqual({ valid: true })
  })

  it('rejects EM text with colour 001', () => {
    const result = isValidGLRCombination({ colour: '001', text: 'EM', language: 'EN' })
    expect(result.valid).toBe(false)
  })

  it('rejects RM text with colour 001', () => {
    const result = isValidGLRCombination({ colour: '001', text: 'RM', language: 'EN' })
    expect(result.valid).toBe(false)
  })

  it('rejects UA language with EM text', () => {
    const result = isValidGLRCombination({ colour: '101', text: 'EM', language: 'UA' })
    expect(result.valid).toBe(false)
  })
})

describe('isValidGRCombination', () => {
  it('all 4 VALID_GR_CODES pass validation', () => {
    for (const code of VALID_GR_CODES) {
      const parsed = parseGRModelCode(code)!
      expect(isValidGRCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidGRCombination({})).toEqual({ valid: true })
    expect(isValidGRCombination({ mounting: 'F' })).toEqual({ valid: true })
  })
})

describe('getValidGLROptionsForStep', () => {
  it('colour 001 only allows ZA text', () => {
    const valid = getValidGLROptionsForStep('text', { colour: '001' })
    expect(valid).toEqual(['ZA'])
  })

  it('colour 101 allows EM, EX, RM, ZA', () => {
    const valid = getValidGLROptionsForStep('text', { colour: '101' })
    expect(valid).toContain('EM')
    expect(valid).toContain('EX')
    expect(valid).toContain('RM')
    expect(valid).toContain('ZA')
  })

  it('colour 201, 301, 401 only allow ZA text', () => {
    for (const colour of ['201', '301', '401']) {
      const valid = getValidGLROptionsForStep('text', { colour })
      expect(valid).toEqual(['ZA'])
    }
  })

  it('ZA text valid with all colours', () => {
    const valid = getValidGLROptionsForStep('colour', { text: 'ZA' })
    expect(valid).toContain('001')
    expect(valid).toContain('101')
    expect(valid).toContain('201')
    expect(valid).toContain('301')
    expect(valid).toContain('401')
  })

  it('RM text only valid with colour 101', () => {
    const valid = getValidGLROptionsForStep('colour', { text: 'RM' })
    expect(valid).toEqual(['101'])
  })

  it('language EN valid with all colours', () => {
    const valid = getValidGLROptionsForStep('language', {})
    expect(valid).toContain('EN')
    expect(valid).toContain('UA')
  })

  it('UA language only valid with ZA text', () => {
    const valid = getValidGLROptionsForStep('language', { text: 'ZA' })
    expect(valid).toContain('UA')
  })

  it('UA language not valid with EM text', () => {
    const valid = getValidGLROptionsForStep('language', { text: 'EM' })
    expect(valid).not.toContain('UA')
  })
})

describe('getValidGROptionsForStep', () => {
  it('both mounting options valid without constraints', () => {
    const valid = getValidGROptionsForStep('mounting', {})
    expect(valid).toContain('F')
    expect(valid).toContain('S')
  })

  it('both grText options valid without constraints', () => {
    const valid = getValidGROptionsForStep('grText', {})
    expect(valid).toContain('22-0')
    expect(valid).toContain('22-0-EN')
  })

  it('F mounting valid with both grText options', () => {
    expect(getValidGROptionsForStep('grText', { mounting: 'F' })).toContain('22-0')
    expect(getValidGROptionsForStep('grText', { mounting: 'F' })).toContain('22-0-EN')
  })
})

describe('GLOBAL_RESET_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(GLOBAL_RESET_CONSTRAINTS)

  it('has 6 constraints', () => {
    expect(GLOBAL_RESET_CONSTRAINTS.constraints).toHaveLength(6)
  })

  it('blocks EM text when colour is 001', () => {
    expect(
      engine.checkOptionAvailability('text', 'EM', { colour: '001' }).available,
    ).toBe(false)
  })

  it('allows EM text when colour is 101', () => {
    expect(
      engine.checkOptionAvailability('text', 'EM', { colour: '101' }).available,
    ).toBe(true)
  })

  it('blocks RM text when colour is not 101', () => {
    for (const colour of ['001', '201', '301', '401']) {
      expect(engine.checkOptionAvailability('text', 'RM', { colour }).available).toBe(
        false,
      )
    }
  })

  it('allows RM text when colour is 101', () => {
    expect(
      engine.checkOptionAvailability('text', 'RM', { colour: '101' }).available,
    ).toBe(true)
  })

  it('blocks UA language when text is EM', () => {
    expect(
      engine.checkOptionAvailability('language', 'UA', { text: 'EM' }).available,
    ).toBe(false)
  })

  it('allows UA language when text is ZA', () => {
    expect(
      engine.checkOptionAvailability('language', 'UA', { text: 'ZA' }).available,
    ).toBe(true)
  })

  it('constraint engine modelId matches', () => {
    expect(GLOBAL_RESET_CONSTRAINTS.modelId).toBe('global-reset')
  })
})

describe('buildProductModel — globalReset GLR series', () => {
  it('builds GLR001ZA-EN correctly', () => {
    const config: Configuration = {
      series: 'GLR',
      colour: '001',
      text: 'ZA',
      language: 'EN',
      mounting: null,
      grText: null,
    }
    const result = buildProductModel(config, globalResetModel)
    expect(result.fullCode).toBe('GLR001ZA-EN')
  })

  it('builds GLR101EM-EN correctly', () => {
    const config: Configuration = {
      series: 'GLR',
      colour: '101',
      text: 'EM',
      language: 'EN',
      mounting: null,
      grText: null,
    }
    const result = buildProductModel(config, globalResetModel)
    expect(result.fullCode).toBe('GLR101EM-EN')
  })

  it('builds GLR401ZA-UA correctly', () => {
    const config: Configuration = {
      series: 'GLR',
      colour: '401',
      text: 'ZA',
      language: 'UA',
      mounting: null,
      grText: null,
    }
    const result = buildProductModel(config, globalResetModel)
    expect(result.fullCode).toBe('GLR401ZA-UA')
  })

  it('builds GLR101RM-EN correctly', () => {
    const config: Configuration = {
      series: 'GLR',
      colour: '101',
      text: 'RM',
      language: 'EN',
      mounting: null,
      grText: null,
    }
    const result = buildProductModel(config, globalResetModel)
    expect(result.fullCode).toBe('GLR101RM-EN')
  })
})

describe('buildProductModel — globalReset GR series', () => {
  it('builds GR-RF-22-0 correctly', () => {
    const config: Configuration = {
      series: 'GR',
      colour: null,
      text: null,
      language: null,
      mounting: 'F',
      grText: '22-0',
    }
    const result = buildProductModel(config, globalResetModel)
    expect(result.fullCode).toBe('GR-RF-22-0')
  })

  it('builds GR-RS-22-0-EN correctly', () => {
    const config: Configuration = {
      series: 'GR',
      colour: null,
      text: null,
      language: null,
      mounting: 'S',
      grText: '22-0-EN',
    }
    const result = buildProductModel(config, globalResetModel)
    expect(result.fullCode).toBe('GR-RS-22-0-EN')
  })
})

describe('isConfigurationComplete — globalReset', () => {
  it('returns true for complete GLR configuration', () => {
    const config: Configuration = {
      series: 'GLR',
      colour: '001',
      text: 'ZA',
      language: 'EN',
      mounting: null,
      grText: null,
    }
    expect(isConfigurationComplete(globalResetModel, config)).toBe(true)
  })

  it('returns true for complete GR configuration', () => {
    const config: Configuration = {
      series: 'GR',
      colour: null,
      text: null,
      language: null,
      mounting: 'F',
      grText: '22-0',
    }
    expect(isConfigurationComplete(globalResetModel, config)).toBe(true)
  })

  it('returns false when series not selected', () => {
    const config: Configuration = {
      series: null,
      colour: null,
      text: null,
      language: null,
      mounting: null,
      grText: null,
    }
    expect(isConfigurationComplete(globalResetModel, config)).toBe(false)
  })

  it('returns false for incomplete GLR configuration', () => {
    const config: Configuration = {
      series: 'GLR',
      colour: '001',
      text: null,
      language: null,
      mounting: null,
      grText: null,
    }
    expect(isConfigurationComplete(globalResetModel, config)).toBe(false)
  })

  it('getMissingRequiredSteps returns missing GLR steps', () => {
    const config: Configuration = {
      series: 'GLR',
      colour: '101',
      text: null,
      language: null,
      mounting: null,
      grText: null,
    }
    const missing = getMissingRequiredSteps(globalResetModel, config)
    expect(missing).toContain('text')
    expect(missing).toContain('language')
    expect(missing).not.toContain('colour')
    expect(missing).not.toContain('mounting')
    expect(missing).not.toContain('grText')
  })

  it('getMissingRequiredSteps returns missing GR steps', () => {
    const config: Configuration = {
      series: 'GR',
      colour: null,
      text: null,
      language: null,
      mounting: 'F',
      grText: null,
    }
    const missing = getMissingRequiredSteps(globalResetModel, config)
    expect(missing).toContain('grText')
    expect(missing).not.toContain('mounting')
    expect(missing).not.toContain('colour')
  })
})

describe('globalResetModel definition', () => {
  it('has correct model id and slug', () => {
    expect(globalResetModel.id).toBe('global-reset')
    expect(globalResetModel.slug).toBe('global-reset')
  })

  it('stepOrder contains all 6 steps', () => {
    expect(globalResetModel.stepOrder).toEqual([
      'series',
      'colour',
      'text',
      'language',
      'mounting',
      'grText',
    ])
  })

  it('series step has GLR and GR options', () => {
    const seriesStep = globalResetModel.steps.find((s) => s.id === 'series')!
    const ids = seriesStep.options.map((o) => o.id)
    expect(ids).toContain('GLR')
    expect(ids).toContain('GR')
  })

  it('colour step has 5 options with three-digit codes', () => {
    const colourStep = globalResetModel.steps.find((s) => s.id === 'colour')!
    const ids = colourStep.options.map((o) => o.id)
    expect(ids).toEqual(['001', '101', '201', '301', '401'])
  })

  it('text step has 4 options', () => {
    const textStep = globalResetModel.steps.find((s) => s.id === 'text')!
    expect(textStep.options).toHaveLength(4)
  })

  it('language step has EN and UA options', () => {
    const langStep = globalResetModel.steps.find((s) => s.id === 'language')!
    const ids = langStep.options.map((o) => o.id)
    expect(ids).toContain('EN')
    expect(ids).toContain('UA')
  })

  it('mounting step has F and S options', () => {
    const mountingStep = globalResetModel.steps.find((s) => s.id === 'mounting')!
    const ids = mountingStep.options.map((o) => o.id)
    expect(ids).toContain('F')
    expect(ids).toContain('S')
  })

  it('grText step has 22-0 and 22-0-EN options', () => {
    const grTextStep = globalResetModel.steps.find((s) => s.id === 'grText')!
    const ids = grTextStep.options.map((o) => o.id)
    expect(ids).toContain('22-0')
    expect(ids).toContain('22-0-EN')
  })

  it('series step is required, others are not', () => {
    const seriesStep = globalResetModel.steps.find((s) => s.id === 'series')!
    expect(seriesStep.required).toBe(true)
    for (const step of globalResetModel.steps.filter((s) => s.id !== 'series')) {
      expect(step.required).toBe(false)
    }
  })

  it('baseCode is empty string', () => {
    expect(globalResetModel.productModelSchema.baseCode).toBe('')
  })

  it('separatorMap has correct values', () => {
    const { separatorMap } = globalResetModel.productModelSchema
    expect(separatorMap?.series).toBe('')
    expect(separatorMap?.colour).toBe('')
    expect(separatorMap?.text).toBe('')
    expect(separatorMap?.language).toBe('-')
    expect(separatorMap?.mounting).toBe('-')
    expect(separatorMap?.grText).toBe('-')
  })
})
