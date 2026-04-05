import { describe, it, expect } from 'vitest'
import {
  buildCPSModelCode,
  parseCPSModelCode,
  isValidCPSCombination,
  getValidCPSOptionsForStep,
  VALID_MODEL_CODES,
  CALL_POINT_STOPPER_CONSTRAINTS,
} from '@entities/product/rules/callPointStopperRules'
import { callPointStopperModel } from '@entities/product/models/callPointStopper'
import { buildProductModel } from '@entities/product/buildProductModel'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import { createConstraintEngine } from '@entities/product/rules/constraintEngine'
import type { Configuration } from '@shared/types'

describe('buildCPSModelCode', () => {
  it('builds flush red CL', () => {
    expect(buildCPSModelCode({ mounting: '0', colour: 'R', label: 'CL' })).toBe(
      'STI-6930-CL',
    )
  })

  it('builds flush red PLAIN', () => {
    expect(buildCPSModelCode({ mounting: '0', colour: 'R', label: 'PLAIN' })).toBe(
      'STI-6930-PLAIN',
    )
  })

  it('builds surface red CL', () => {
    expect(buildCPSModelCode({ mounting: '1', colour: 'R', label: 'CL' })).toBe(
      'STI-6931-CL',
    )
  })

  it('builds flush green PLAIN', () => {
    expect(buildCPSModelCode({ mounting: '0', colour: 'G', label: 'PLAIN' })).toBe(
      'STI-6930-G-PLAIN',
    )
  })

  it('builds surface yellow CL', () => {
    expect(buildCPSModelCode({ mounting: '1', colour: 'Y', label: 'CL' })).toBe(
      'STI-6931-Y-CL',
    )
  })

  it('builds surface blue PLAIN', () => {
    expect(buildCPSModelCode({ mounting: '1', colour: 'B', label: 'PLAIN' })).toBe(
      'STI-6931-B-PLAIN',
    )
  })

  it('builds flush orange CL', () => {
    expect(buildCPSModelCode({ mounting: '0', colour: 'E', label: 'CL' })).toBe(
      'STI-6930-E-CL',
    )
  })

  it('builds surface white PLAIN', () => {
    expect(buildCPSModelCode({ mounting: '1', colour: 'W', label: 'PLAIN' })).toBe(
      'STI-6931-W-PLAIN',
    )
  })

  it('returns null when any field is missing', () => {
    expect(buildCPSModelCode({ mounting: '0', colour: 'R' })).toBeNull()
    expect(buildCPSModelCode({ mounting: '0', label: 'CL' })).toBeNull()
    expect(buildCPSModelCode({ colour: 'R', label: 'CL' })).toBeNull()
    expect(buildCPSModelCode({})).toBeNull()
  })

  it('returns null for unknown label', () => {
    expect(buildCPSModelCode({ mounting: '0', colour: 'R', label: 'FIRE' })).toBeNull()
  })
})

describe('parseCPSModelCode', () => {
  it('parses flush red CL', () => {
    expect(parseCPSModelCode('STI-6930-CL')).toEqual({
      mounting: '0',
      colour: 'R',
      label: 'CL',
    })
  })

  it('parses flush red PLAIN', () => {
    expect(parseCPSModelCode('STI-6930-PLAIN')).toEqual({
      mounting: '0',
      colour: 'R',
      label: 'PLAIN',
    })
  })

  it('parses surface red CL', () => {
    expect(parseCPSModelCode('STI-6931-CL')).toEqual({
      mounting: '1',
      colour: 'R',
      label: 'CL',
    })
  })

  it('parses flush green PLAIN', () => {
    expect(parseCPSModelCode('STI-6930-G-PLAIN')).toEqual({
      mounting: '0',
      colour: 'G',
      label: 'PLAIN',
    })
  })

  it('parses surface yellow CL', () => {
    expect(parseCPSModelCode('STI-6931-Y-CL')).toEqual({
      mounting: '1',
      colour: 'Y',
      label: 'CL',
    })
  })

  it('parses surface orange PLAIN', () => {
    expect(parseCPSModelCode('STI-6931-E-PLAIN')).toEqual({
      mounting: '1',
      colour: 'E',
      label: 'PLAIN',
    })
  })

  it('parses flush white CL', () => {
    expect(parseCPSModelCode('STI-6930-W-CL')).toEqual({
      mounting: '0',
      colour: 'W',
      label: 'CL',
    })
  })

  it('returns null for codes without label suffix', () => {
    expect(parseCPSModelCode('STI-6930')).toBeNull()
    expect(parseCPSModelCode('STI-6931')).toBeNull()
    expect(parseCPSModelCode('STI-6930-G')).toBeNull()
    expect(parseCPSModelCode('STI-6931-E')).toBeNull()
  })

  it('returns null for invalid format', () => {
    expect(parseCPSModelCode('INVALID')).toBeNull()
    expect(parseCPSModelCode('STI-693')).toBeNull()
    expect(parseCPSModelCode('STI-6932')).toBeNull()
    expect(parseCPSModelCode('')).toBeNull()
  })

  it('round-trips for all VALID_MODEL_CODES', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseCPSModelCode(code)
      expect(parsed).not.toBeNull()
      const rebuilt = buildCPSModelCode(parsed!)
      expect(rebuilt).toBe(code)
    }
  })
})

describe('VALID_MODEL_CODES', () => {
  it('contains 24 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(24)
  })

  it('has no duplicates', () => {
    const unique = new Set(VALID_MODEL_CODES)
    expect(unique.size).toBe(VALID_MODEL_CODES.length)
  })

  it('all codes start with STI-693', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(code.startsWith('STI-693')).toBe(true)
    }
  })

  it('12 flush mount codes', () => {
    const flush = VALID_MODEL_CODES.filter((c) => c.startsWith('STI-6930'))
    expect(flush.length).toBe(12)
  })

  it('12 surface mount codes', () => {
    const surface = VALID_MODEL_CODES.filter((c) => c.startsWith('STI-6931'))
    expect(surface.length).toBe(12)
  })

  it('all codes end with -CL or -PLAIN', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(code.endsWith('-CL') || code.endsWith('-PLAIN')).toBe(true)
    }
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseCPSModelCode(code)).not.toBeNull()
    }
  })
})

describe('isValidCPSCombination', () => {
  it('all VALID_MODEL_CODES pass validation', () => {
    for (const code of VALID_MODEL_CODES) {
      const parsed = parseCPSModelCode(code)!
      expect(isValidCPSCombination(parsed)).toEqual({ valid: true })
    }
  })

  it('returns valid for incomplete selection', () => {
    expect(isValidCPSCombination({})).toEqual({ valid: true })
    expect(isValidCPSCombination({ mounting: '0' })).toEqual({ valid: true })
    expect(isValidCPSCombination({ mounting: '0', colour: 'R' })).toEqual({ valid: true })
  })

  it('every colour + mounting + CL is valid', () => {
    for (const colour of ['R', 'G', 'Y', 'W', 'B', 'E']) {
      for (const mounting of ['0', '1']) {
        const result = isValidCPSCombination({ mounting, colour, label: 'CL' })
        expect(result.valid).toBe(true)
      }
    }
  })

  it('every colour + mounting + PLAIN is valid', () => {
    for (const colour of ['R', 'G', 'Y', 'W', 'B', 'E']) {
      for (const mounting of ['0', '1']) {
        const result = isValidCPSCombination({ mounting, colour, label: 'PLAIN' })
        expect(result.valid).toBe(true)
      }
    }
  })
})

describe('getValidCPSOptionsForStep', () => {
  it('returns all mounting options when nothing selected', () => {
    const valid = getValidCPSOptionsForStep('mounting', {})
    expect(valid).toContain('0')
    expect(valid).toContain('1')
  })

  it('CL label valid with all colours', () => {
    const valid = getValidCPSOptionsForStep('colour', { label: 'CL' })
    expect(valid).toContain('R')
    expect(valid).toContain('G')
    expect(valid).toContain('Y')
    expect(valid).toContain('W')
    expect(valid).toContain('B')
    expect(valid).toContain('E')
  })

  it('PLAIN label valid with all colours', () => {
    const valid = getValidCPSOptionsForStep('colour', { label: 'PLAIN' })
    expect(valid).toContain('R')
    expect(valid).toContain('G')
    expect(valid).toContain('Y')
    expect(valid).toContain('W')
    expect(valid).toContain('B')
    expect(valid).toContain('E')
  })

  it('every colour returns CL and PLAIN as valid labels', () => {
    for (const colour of ['R', 'G', 'Y', 'W', 'B', 'E']) {
      const valid = getValidCPSOptionsForStep('label', { colour })
      expect(valid).toContain('CL')
      expect(valid).toContain('PLAIN')
      expect(valid.length).toBe(2)
    }
  })

  it('flush mount returns CL and PLAIN for any colour', () => {
    for (const colour of ['R', 'G', 'Y', 'W', 'B', 'E']) {
      const valid = getValidCPSOptionsForStep('label', { mounting: '0', colour })
      expect(valid).toContain('CL')
      expect(valid).toContain('PLAIN')
    }
  })
})

describe('CALL_POINT_STOPPER_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(CALL_POINT_STOPPER_CONSTRAINTS)

  it('CL label allows all colours', () => {
    for (const colour of ['R', 'G', 'Y', 'W', 'B', 'E']) {
      const result = engine.checkOptionAvailability('colour', colour, { label: 'CL' })
      expect(result.available).toBe(true)
    }
  })

  it('PLAIN label allows all colours', () => {
    for (const colour of ['R', 'G', 'Y', 'W', 'B', 'E']) {
      const result = engine.checkOptionAvailability('colour', colour, { label: 'PLAIN' })
      expect(result.available).toBe(true)
    }
  })

  it('every colour allows CL and PLAIN labels', () => {
    for (const colour of ['R', 'G', 'Y', 'W', 'B', 'E']) {
      expect(engine.checkOptionAvailability('label', 'CL', { colour }).available).toBe(
        true,
      )
      expect(engine.checkOptionAvailability('label', 'PLAIN', { colour }).available).toBe(
        true,
      )
    }
  })

  it('constraint engine modelId matches', () => {
    expect(CALL_POINT_STOPPER_CONSTRAINTS.modelId).toBe('call-point-stopper')
  })
})

describe('buildProductModel — callPointStopper', () => {
  it('flush red CL → STI-6930-CL', () => {
    const config: Configuration = { mounting: '0', colour: 'R', label: 'CL' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6930-CL')
    expect(result.isComplete).toBe(true)
  })

  it('flush red PLAIN → STI-6930-PLAIN', () => {
    const config: Configuration = { mounting: '0', colour: 'R', label: 'PLAIN' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6930-PLAIN')
    expect(result.isComplete).toBe(true)
  })

  it('surface red CL → STI-6931-CL', () => {
    const config: Configuration = { mounting: '1', colour: 'R', label: 'CL' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6931-CL')
    expect(result.isComplete).toBe(true)
  })

  it('surface red PLAIN → STI-6931-PLAIN', () => {
    const config: Configuration = { mounting: '1', colour: 'R', label: 'PLAIN' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6931-PLAIN')
    expect(result.isComplete).toBe(true)
  })

  it('flush green CL → STI-6930-G-CL', () => {
    const config: Configuration = { mounting: '0', colour: 'G', label: 'CL' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6930-G-CL')
    expect(result.isComplete).toBe(true)
  })

  it('flush green PLAIN → STI-6930-G-PLAIN', () => {
    const config: Configuration = { mounting: '0', colour: 'G', label: 'PLAIN' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6930-G-PLAIN')
    expect(result.isComplete).toBe(true)
  })

  it('surface yellow CL → STI-6931-Y-CL', () => {
    const config: Configuration = { mounting: '1', colour: 'Y', label: 'CL' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6931-Y-CL')
    expect(result.isComplete).toBe(true)
  })

  it('surface orange PLAIN → STI-6931-E-PLAIN', () => {
    const config: Configuration = { mounting: '1', colour: 'E', label: 'PLAIN' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6931-E-PLAIN')
    expect(result.isComplete).toBe(true)
  })

  it('flush white CL → STI-6930-W-CL', () => {
    const config: Configuration = { mounting: '0', colour: 'W', label: 'CL' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6930-W-CL')
    expect(result.isComplete).toBe(true)
  })

  it('surface blue CL → STI-6931-B-CL', () => {
    const config: Configuration = { mounting: '1', colour: 'B', label: 'CL' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6931-B-CL')
    expect(result.isComplete).toBe(true)
  })

  it('red colour has empty code — no double dash', () => {
    const config: Configuration = { mounting: '0', colour: 'R', label: 'PLAIN' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6930-PLAIN')
    expect(result.fullCode).not.toContain('--')
  })

  it('baseCode is STI-693', () => {
    const config: Configuration = { mounting: null, colour: null, label: null }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.baseCode).toBe('STI-693')
  })

  it('marks incomplete when steps missing', () => {
    const config: Configuration = { mounting: '0', colour: null, label: null }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.isComplete).toBe(false)
    expect(result.missingSteps).toContain('colour')
    expect(result.missingSteps).toContain('label')
  })

  it('generated SKUs for all valid combinations match VALID_MODEL_CODES', () => {
    const validSet = new Set(VALID_MODEL_CODES)
    let matchCount = 0

    for (const code of VALID_MODEL_CODES) {
      const parsed = parseCPSModelCode(code)
      if (!parsed) continue

      const config: Configuration = {
        mounting: parsed.mounting ?? null,
        colour: parsed.colour ?? null,
        label: parsed.label ?? null,
      }

      const result = buildProductModel(config, callPointStopperModel)
      if (validSet.has(result.fullCode)) {
        matchCount++
      }
    }

    expect(matchCount).toBe(VALID_MODEL_CODES.length)
  })
})

describe('isConfigurationComplete — callPointStopper', () => {
  it('returns true when all three steps selected', () => {
    const config: Configuration = { mounting: '0', colour: 'R', label: 'CL' }
    expect(isConfigurationComplete(callPointStopperModel, config)).toBe(true)
  })

  it('returns false when any step missing', () => {
    expect(
      isConfigurationComplete(callPointStopperModel, {
        mounting: '0',
        colour: 'R',
        label: null,
      }),
    ).toBe(false)

    expect(
      isConfigurationComplete(callPointStopperModel, {
        mounting: null,
        colour: null,
        label: null,
      }),
    ).toBe(false)
  })

  it('getMissingRequiredSteps returns correct missing steps', () => {
    const config: Configuration = { mounting: '1', colour: null, label: null }
    const missing = getMissingRequiredSteps(callPointStopperModel, config)
    expect(missing).toContain('colour')
    expect(missing).toContain('label')
    expect(missing).not.toContain('mounting')
  })

  it('getCompletionPercentage returns correct percentages', () => {
    expect(
      getCompletionPercentage(callPointStopperModel, {
        mounting: null,
        colour: null,
        label: null,
      }),
    ).toBe(0)

    expect(
      getCompletionPercentage(callPointStopperModel, {
        mounting: '0',
        colour: null,
        label: null,
      }),
    ).toBe(33)

    expect(
      getCompletionPercentage(callPointStopperModel, {
        mounting: '0',
        colour: 'R',
        label: null,
      }),
    ).toBe(67)

    expect(
      getCompletionPercentage(callPointStopperModel, {
        mounting: '0',
        colour: 'R',
        label: 'CL',
      }),
    ).toBe(100)
  })
})

describe('callPointStopperModel definition', () => {
  it('has correct model id and slug', () => {
    expect(callPointStopperModel.id).toBe('call-point-stopper')
    expect(callPointStopperModel.slug).toBe('call-point-stopper')
  })

  it('stepOrder matches steps', () => {
    const stepIds = callPointStopperModel.steps.map((s) => s.id)
    for (const stepId of callPointStopperModel.stepOrder) {
      expect(stepIds).toContain(stepId)
    }
  })

  it('all steps are required', () => {
    for (const step of callPointStopperModel.steps) {
      expect(step.required).toBe(true)
    }
  })

  it('red colour has empty code', () => {
    const colourStep = callPointStopperModel.steps.find((s) => s.id === 'colour')!
    const red = colourStep.options.find((o) => o.id === 'R')!
    expect(red.code).toBe('')
  })

  it('label step has exactly 2 options — CL and PLAIN', () => {
    const labelStep = callPointStopperModel.steps.find((s) => s.id === 'label')!
    const ids = labelStep.options.map((o) => o.id)
    expect(ids).toEqual(['CL', 'PLAIN'])
  })

  it('CL label has code CL', () => {
    const labelStep = callPointStopperModel.steps.find((s) => s.id === 'label')!
    expect(labelStep.options.find((o) => o.id === 'CL')?.code).toBe('CL')
  })

  it('PLAIN label has code PLAIN', () => {
    const labelStep = callPointStopperModel.steps.find((s) => s.id === 'label')!
    expect(labelStep.options.find((o) => o.id === 'PLAIN')?.code).toBe('PLAIN')
  })

  it('baseCode is STI-693', () => {
    expect(callPointStopperModel.productModelSchema.baseCode).toBe('STI-693')
  })

  it('separatorMap uses dash for colour and label but not mounting', () => {
    const { separatorMap } = callPointStopperModel.productModelSchema
    expect(separatorMap?.mounting).toBe('')
    expect(separatorMap?.colour).toBe('-')
    expect(separatorMap?.label).toBe('-')
  })
})
