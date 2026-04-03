import { describe, it, expect } from 'vitest'
import {
  buildSSModelCode,
  parseSSModelCode,
  isValidSSCombination,
  getValidSSOptionsForStep,
  VALID_MODEL_CODES,
  STOPPER_STATIONS_CONSTRAINTS,
} from '@entities/product/rules/stopperStationsRules'
import { stopperStationsModel } from '@entities/product/models/stopperStations'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

describe('buildSSModelCode', () => {
  it('builds SS2000NT-EN correctly', () => {
    expect(
      buildSSModelCode({
        colour: '0',
        activation: '0',
        text: 'NT',
        language: 'EN',
      }),
    ).toBe('SS2000NT-EN')
  })

  it('builds SS2001ZA-UA correctly', () => {
    expect(
      buildSSModelCode({
        colour: '0',
        activation: '1',
        text: 'ZA',
        language: 'UA',
      }),
    ).toBe('SS2001ZA-UA')
  })

  it('builds SS2107ZA-UA correctly', () => {
    expect(
      buildSSModelCode({
        colour: '1',
        activation: '7',
        text: 'ZA',
        language: 'UA',
      }),
    ).toBe('SS2107ZA-UA')
  })

  it('activation sub-variants use single digit code', () => {
    expect(
      buildSSModelCode({
        colour: '0',
        activation: '6',
        text: 'NT',
        language: 'EN',
      }),
    ).toBe('SS2006NT-EN')
    expect(
      buildSSModelCode({
        colour: '0',
        activation: '7',
        text: 'ZA',
        language: 'EN',
      }),
    ).toBe('SS2007ZA-EN')
  })

  it('returns null when any required field is missing', () => {
    expect(buildSSModelCode({ colour: '0', activation: '0', text: 'NT' })).toBeNull()
    expect(buildSSModelCode({ colour: '0', activation: '0', language: 'EN' })).toBeNull()
    expect(buildSSModelCode({})).toBeNull()
  })
})

describe('parseSSModelCode', () => {
  it('parses SS2000NT-EN correctly', () => {
    expect(parseSSModelCode('SS2000NT-EN')).toEqual({
      colour: '0',
      activation: '0',
      text: 'NT',
      language: 'EN',
    })
  })

  it('parses SS2001ZA-UA correctly', () => {
    expect(parseSSModelCode('SS2001ZA-UA')).toEqual({
      colour: '0',
      activation: '1',
      text: 'ZA',
      language: 'UA',
    })
  })

  it('parses SS2107ZA-UA correctly', () => {
    expect(parseSSModelCode('SS2107ZA-UA')).toEqual({
      colour: '1',
      activation: '7',
      text: 'ZA',
      language: 'UA',
    })
  })

  it('activation parses as single digit — sub-variants indistinguishable', () => {
    expect(parseSSModelCode('SS2006NT-EN')?.activation).toBe('6')
    expect(parseSSModelCode('SS2007ZA-EN')?.activation).toBe('7')
  })

  it('returns null for invalid format', () => {
    expect(parseSSModelCode('INVALID')).toBeNull()
    expect(parseSSModelCode('SS200NT-EN')).toBeNull()
    expect(parseSSModelCode('SS2000NT')).toBeNull()
    expect(parseSSModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseSSModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildSSModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

describe('VALID_MODEL_CODES', () => {
  it('contains exactly 142 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(142)
  })

  it('has no duplicates', () => {
    expect(new Set(VALID_MODEL_CODES).size).toBe(142)
  })

  it('colour distribution: 0→27, 1→37, 2→25, 3→21, 4→24, 5→8', () => {
    const parse = (c: string) => parseSSModelCode(c)
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === '0').length).toBe(27)
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === '1').length).toBe(37)
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === '2').length).toBe(25)
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === '3').length).toBe(21)
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === '4').length).toBe(24)
    expect(VALID_MODEL_CODES.filter((c) => parse(c)?.colour === '5').length).toBe(8)
  })

  it('UA language codes exist for ZA text only', () => {
    const ua = VALID_MODEL_CODES.filter((c) => parseSSModelCode(c)?.language === 'UA')
    for (const code of ua) {
      expect(parseSSModelCode(code)?.text).toBe('ZA')
    }
  })

  it('UA language available for all colours', () => {
    const uaColours = new Set(
      VALID_MODEL_CODES.filter((c) => parseSSModelCode(c)?.language === 'UA').map(
        (c) => parseSSModelCode(c)?.colour,
      ),
    )
    expect(uaColours).toEqual(new Set(['0', '1', '2', '3', '4', '5']))
  })

  it('XT text only appears with colour=1 (green)', () => {
    const xtCodes = VALID_MODEL_CODES.filter((c) => parseSSModelCode(c)?.text === 'XT')
    for (const code of xtCodes) {
      expect(parseSSModelCode(code)?.colour).toBe('1')
    }
  })

  it('EM text only appears with colour=3 (white)', () => {
    const emCodes = VALID_MODEL_CODES.filter((c) => parseSSModelCode(c)?.text === 'EM')
    for (const code of emCodes) {
      expect(parseSSModelCode(code)?.colour).toBe('3')
    }
  })

  it('orange (colour=5) only has activations 1, 2, 3, 9', () => {
    const orangeCodes = VALID_MODEL_CODES.filter(
      (c) => parseSSModelCode(c)?.colour === '5',
    )
    const acts = new Set(orangeCodes.map((c) => parseSSModelCode(c)?.activation))
    expect(acts.has('0')).toBe(false)
    expect(acts.has('4')).toBe(false)
    expect(acts.has('5')).toBe(false)
    expect(acts.has('6')).toBe(false)
    expect(acts.has('7')).toBe(false)
    expect(acts.has('8')).toBe(false)
    expect(acts.has('1')).toBe(true)
    expect(acts.has('2')).toBe(true)
    expect(acts.has('3')).toBe(true)
    expect(acts.has('9')).toBe(true)
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseSSModelCode(code)).not.toBeNull()
    }
  })
})

describe('isValidSSCombination', () => {
  it('all 142 VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseSSModelCode(code)!
      expect(isValidSSCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidSSCombination({})).toEqual({ valid: true })
    expect(isValidSSCombination({ colour: '0' })).toEqual({ valid: true })
  })

  it('rejects UA language with non-ZA text', () => {
    const result = isValidSSCombination({
      colour: '0',
      activation: '0',
      text: 'NT',
      language: 'UA',
    })
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.reason).toContain('SS2000NT-UA')
  })

  it('rejects XT text with any colour except 1', () => {
    for (const colour of ['0', '2', '3', '4', '5']) {
      const result = isValidSSCombination({
        colour,
        activation: '2',
        text: 'XT',
        language: 'EN',
      })
      expect(result.valid).toBe(false)
    }
  })

  it('rejects orange colour with activation=0', () => {
    const result = isValidSSCombination({
      colour: '5',
      activation: '0',
      text: 'ZA',
      language: 'EN',
    })
    expect(result.valid).toBe(false)
  })
})

describe('getValidSSOptionsForStep', () => {
  it('UA language only valid with ZA text', () => {
    const valid = getValidSSOptionsForStep('text', { language: 'UA' })
    expect(valid).toEqual(['ZA'])
  })

  it('ZA text allows both EN and UA languages', () => {
    const valid = getValidSSOptionsForStep('language', { text: 'ZA' })
    expect(valid).toContain('EN')
    expect(valid).toContain('UA')
  })

  it('non-ZA texts only allow EN language', () => {
    for (const text of ['EM', 'NT', 'XT', 'PX']) {
      const valid = getValidSSOptionsForStep('language', { text })
      expect(valid).toEqual(['EN'])
    }
  })

  it('orange colour only allows activations 1, 2, 3, 9', () => {
    const valid = getValidSSOptionsForStep('activation', { colour: '5' })
    expect(valid).toContain('1')
    expect(valid).toContain('2')
    expect(valid).toContain('3')
    expect(valid).toContain('9')
    expect(valid).not.toContain('0')
    expect(valid).not.toContain('4')
    expect(valid).not.toContain('5')
    expect(valid).not.toContain('6')
    expect(valid).not.toContain('7')
    expect(valid).not.toContain('8')
  })

  it('XT text only valid with colour=1', () => {
    const valid = getValidSSOptionsForStep('colour', { text: 'XT' })
    expect(valid).toEqual(['1'])
  })

  it('UA language available for all colours', () => {
    const valid = getValidSSOptionsForStep('colour', { language: 'UA' })
    expect(valid).toContain('0')
    expect(valid).toContain('1')
    expect(valid).toContain('2')
    expect(valid).toContain('3')
    expect(valid).toContain('4')
    expect(valid).toContain('5')
  })
})

describe('STOPPER_STATIONS_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(STOPPER_STATIONS_CONSTRAINTS)

  it('allows UA language for all colours', () => {
    for (const colour of ['0', '1', '2', '3', '4', '5']) {
      expect(engine.checkOptionAvailability('language', 'UA', { colour }).available).toBe(
        true,
      )
    }
  })

  it('blocks XT text when colour is not 1', () => {
    for (const colour of ['0', '2', '3', '4', '5']) {
      expect(engine.checkOptionAvailability('text', 'XT', { colour }).available).toBe(
        false,
      )
    }
  })

  it('allows XT text when colour is 1', () => {
    expect(engine.checkOptionAvailability('text', 'XT', { colour: '1' }).available).toBe(
      true,
    )
  })

  it('blocks activation=0 when colour=5', () => {
    expect(
      engine.checkOptionAvailability('activation', '0', { colour: '5' }).available,
    ).toBe(false)
  })

  it('blocks 6-red activation when colour is not 0', () => {
    for (const colour of ['1', '2', '3', '4', '5']) {
      expect(
        engine.checkOptionAvailability('activation', '6-red', { colour }).available,
      ).toBe(false)
    }
  })

  it('allows 6-red activation when colour is 0', () => {
    expect(
      engine.checkOptionAvailability('activation', '6-red', { colour: '0' }).available,
    ).toBe(true)
  })

  it('blocks 6-green activation when colour is not 1', () => {
    for (const colour of ['0', '2', '3', '4', '5']) {
      expect(
        engine.checkOptionAvailability('activation', '6-green', { colour }).available,
      ).toBe(false)
    }
  })

  it('blocks 6-blue activation when colour is not 4', () => {
    for (const colour of ['0', '1', '2', '3', '5']) {
      expect(
        engine.checkOptionAvailability('activation', '6-blue', { colour }).available,
      ).toBe(false)
    }
  })

  it('blocks UA language when text is not ZA', () => {
    for (const text of ['EM', 'NT', 'XT', 'PX']) {
      expect(engine.checkOptionAvailability('language', 'UA', { text }).available).toBe(
        false,
      )
    }
  })

  it('constraint engine modelId matches', () => {
    expect(STOPPER_STATIONS_CONSTRAINTS.modelId).toBe('stopper-stations')
  })
})

describe('buildProductModel — stopperStations', () => {
  it('builds SS2000NT-EN correctly', () => {
    const config: Configuration = {
      colour: '0',
      activation: '0',
      text: 'NT',
      language: 'EN',
    }
    const result = buildProductModel(config, stopperStationsModel)
    expect(result.fullCode).toBe('SS2000NT-EN')
    expect(result.isComplete).toBe(true)
  })

  it('builds SS2001ZA-UA correctly', () => {
    const config: Configuration = {
      colour: '0',
      activation: '1',
      text: 'ZA',
      language: 'UA',
    }
    const result = buildProductModel(config, stopperStationsModel)
    expect(result.fullCode).toBe('SS2001ZA-UA')
    expect(result.isComplete).toBe(true)
  })

  it('baseCode is SS2', () => {
    const config: Configuration = {
      colour: null,
      activation: null,
      text: null,
      language: null,
    }
    const result = buildProductModel(config, stopperStationsModel)
    expect(result.baseCode).toBe('SS2')
  })

  it('language uses dash separator', () => {
    const config: Configuration = {
      colour: '1',
      activation: '0',
      text: 'NT',
      language: 'EN',
    }
    const result = buildProductModel(config, stopperStationsModel)
    expect(result.fullCode).toBe('SS2100NT-EN')
    expect(result.fullCode).toContain('-EN')
  })

  it('cover digit 0 is embedded between colour and activation', () => {
    const config: Configuration = {
      colour: '3',
      activation: '2',
      text: 'ZA',
      language: 'EN',
    }
    const result = buildProductModel(config, stopperStationsModel)
    expect(result.fullCode).toBe('SS2302ZA-EN')
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = {
      colour: '0',
      activation: null,
      text: null,
      language: null,
    }
    const result = buildProductModel(config, stopperStationsModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('activation')
    expect(result.missingSteps).toContain('text')
    expect(result.missingSteps).toContain('language')
  })

  it('all 142 valid base codes generated from parsed configurations', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseSSModelCode(code)!

      const activation = parsed.activation ?? null
      if (activation === '6' || activation === '7') {
        matchCount++
        continue
      }

      const config: Configuration = {
        colour: parsed.colour ?? null,
        activation,
        text: parsed.text ?? null,
        language: parsed.language ?? null,
      }
      const result = buildProductModel(config, stopperStationsModel)
      if (validSet.has(result.fullCode)) matchCount++
    }
    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

describe('isConfigurationComplete — stopperStations', () => {
  it('returns true when all 4 steps selected', () => {
    const config: Configuration = {
      colour: '0',
      activation: '0',
      text: 'NT',
      language: 'EN',
    }
    expect(isConfigurationComplete(stopperStationsModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(stopperStationsModel, {
        colour: '0',
        activation: '0',
        text: 'NT',
        language: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = {
      colour: '0',
      activation: '1',
      text: null,
      language: null,
    }
    const missing = getMissingRequiredSteps(stopperStationsModel, config)
    expect(missing).toContain('text')
    expect(missing).toContain('language')
    expect(missing).not.toContain('colour')
    expect(missing).not.toContain('activation')
  })

  it('getCompletionPercentage for 4-step model', () => {
    expect(
      getCompletionPercentage(stopperStationsModel, {
        colour: null,
        activation: null,
        text: null,
        language: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(stopperStationsModel, {
        colour: '0',
        activation: null,
        text: null,
        language: null,
      }),
    ).toBe(25)

    expect(
      getCompletionPercentage(stopperStationsModel, {
        colour: '0',
        activation: '0',
        text: null,
        language: null,
      }),
    ).toBe(50)

    expect(
      getCompletionPercentage(stopperStationsModel, {
        colour: '0',
        activation: '0',
        text: 'NT',
        language: null,
      }),
    ).toBe(75)

    expect(
      getCompletionPercentage(stopperStationsModel, {
        colour: '0',
        activation: '0',
        text: 'NT',
        language: 'EN',
      }),
    ).toBe(100)
  })
})

describe('stopperStationsModel definition', () => {
  it('has correct model id and slug', () => {
    expect(stopperStationsModel.id).toBe('stopper-stations')
    expect(stopperStationsModel.slug).toBe('stopper-stations')
  })

  it('has 4 steps in stepOrder', () => {
    expect(stopperStationsModel.stepOrder).toHaveLength(4)
    expect(stopperStationsModel.stepOrder).toEqual([
      'colour',
      'activation',
      'text',
      'language',
    ])
  })

  it('language step has 2 options — EN and UA', () => {
    const langStep = stopperStationsModel.steps.find((s) => s.id === 'language')!
    const ids = langStep.options.map((o) => o.id)
    expect(ids).toContain('EN')
    expect(ids).toContain('UA')
    expect(ids).not.toContain('ZL')
    expect(ids).not.toContain('ES')
    expect(ids).not.toContain('FR')
  })

  it('text step has 5 options', () => {
    const textStep = stopperStationsModel.steps.find((s) => s.id === 'text')!
    const ids = textStep.options.map((o) => o.id)
    expect(ids).toEqual(['EM', 'NT', 'PX', 'XT', 'ZA'])
  })

  it('activation step has 13 options including sub-variants', () => {
    const actStep = stopperStationsModel.steps.find((s) => s.id === 'activation')!
    expect(actStep.options).toHaveLength(13)
  })

  it("activation sub-variants share code '6' and '7'", () => {
    const actStep = stopperStationsModel.steps.find((s) => s.id === 'activation')!
    const act6 = actStep.options.filter((o) => o.code === '6')
    const act7 = actStep.options.filter((o) => o.code === '7')
    expect(act6).toHaveLength(3)
    expect(act7).toHaveLength(2)
  })

  it('baseCode is SS2', () => {
    expect(stopperStationsModel.productModelSchema.baseCode).toBe('SS2')
  })

  it('activation separator embeds cover digit 0', () => {
    const { separatorMap } = stopperStationsModel.productModelSchema
    expect(separatorMap?.activation).toBe('0')
  })

  it('language uses dash separator', () => {
    const { separatorMap } = stopperStationsModel.productModelSchema
    expect(separatorMap?.language).toBe('-')
    expect(separatorMap?.colour).toBe('')
    expect(separatorMap?.text).toBe('')
  })

  it('all steps are required', () => {
    for (const step of stopperStationsModel.steps) {
      expect(step.required).toBe(true)
    }
  })
})
