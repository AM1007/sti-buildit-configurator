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

// ─────────────────────────────────────────────────────────────
// buildCPSModelCode
// ─────────────────────────────────────────────────────────────

describe('buildCPSModelCode', () => {
  it('builds flush red fire alarm — no suffixes', () => {
    expect(buildCPSModelCode({ mounting: '0', colour: 'R', label: 'FIRE' })).toBe(
      'STI-6930',
    )
  })

  it('builds surface red fire alarm — no colour suffix', () => {
    expect(buildCPSModelCode({ mounting: '1', colour: 'R', label: 'FIRE' })).toBe(
      'STI-6931',
    )
  })

  it('builds surface red custom label', () => {
    expect(buildCPSModelCode({ mounting: '1', colour: 'R', label: 'CL' })).toBe(
      'STI-6931-CL',
    )
  })

  it('builds flush green plain', () => {
    expect(buildCPSModelCode({ mounting: '0', colour: 'G', label: 'PLAIN' })).toBe(
      'STI-6930-G-PLAIN',
    )
  })

  it('builds surface yellow custom label', () => {
    expect(buildCPSModelCode({ mounting: '1', colour: 'Y', label: 'CL' })).toBe(
      'STI-6931-Y-CL',
    )
  })

  it('builds surface blue plain', () => {
    expect(buildCPSModelCode({ mounting: '1', colour: 'B', label: 'PLAIN' })).toBe(
      'STI-6931-B-PLAIN',
    )
  })

  it('builds surface orange emergency operate — no label suffix', () => {
    expect(
      buildCPSModelCode({ mounting: '1', colour: 'E', label: 'EMERGENCY_OPERATE' }),
    ).toBe('STI-6931-E')
  })

  it('returns null when any field is missing', () => {
    expect(buildCPSModelCode({ mounting: '0', colour: 'R' })).toBeNull()
    expect(buildCPSModelCode({ mounting: '0', label: 'FIRE' })).toBeNull()
    expect(buildCPSModelCode({ colour: 'R', label: 'FIRE' })).toBeNull()
    expect(buildCPSModelCode({})).toBeNull()
  })
})

// ─────────────────────────────────────────────────────────────
// parseCPSModelCode
// ─────────────────────────────────────────────────────────────

describe('parseCPSModelCode', () => {
  it('parses flush red fire — no suffixes', () => {
    expect(parseCPSModelCode('STI-6930')).toEqual({
      mounting: '0',
      colour: 'R',
      label: 'FIRE',
    })
  })

  it('parses surface red custom label', () => {
    expect(parseCPSModelCode('STI-6931-CL')).toEqual({
      mounting: '1',
      colour: 'R',
      label: 'CL',
    })
  })

  it('parses flush green plain', () => {
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

  it('parses surface orange — standard label maps to EMERGENCY_OPERATE', () => {
    expect(parseCPSModelCode('STI-6931-E')).toEqual({
      mounting: '1',
      colour: 'E',
      label: 'EMERGENCY_OPERATE',
    })
  })

  it('parses green standard label — maps to EMERGENCY_DOOR', () => {
    expect(parseCPSModelCode('STI-6930-G')).toEqual({
      mounting: '0',
      colour: 'G',
      label: 'EMERGENCY_DOOR',
    })
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

// ─────────────────────────────────────────────────────────────
// VALID_MODEL_CODES integrity
// ─────────────────────────────────────────────────────────────

describe('VALID_MODEL_CODES', () => {
  it('contains 26 entries', () => {
    expect(VALID_MODEL_CODES.length).toBe(26)
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

  it('10 flush mount codes', () => {
    const flush = VALID_MODEL_CODES.filter((c) => c.startsWith('STI-6930'))
    expect(flush.length).toBe(10)
  })

  it('16 surface mount codes', () => {
    const surface = VALID_MODEL_CODES.filter((c) => c.startsWith('STI-6931'))
    expect(surface.length).toBe(16)
  })

  it('all codes parse successfully', () => {
    for (const code of VALID_MODEL_CODES) {
      expect(parseCPSModelCode(code)).not.toBeNull()
    }
  })
})

// ─────────────────────────────────────────────────────────────
// isValidCPSCombination
// ─────────────────────────────────────────────────────────────

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

  it('rejects flush red custom label — not in allowlist', () => {
    const result = isValidCPSCombination({ mounting: '0', colour: 'R', label: 'CL' })
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.reason).toContain('STI-6930-CL')
    }
  })

  it('rejects flush yellow plain — not in allowlist', () => {
    const result = isValidCPSCombination({ mounting: '0', colour: 'Y', label: 'PLAIN' })
    expect(result.valid).toBe(false)
  })

  it('rejects flush blue custom label — not in allowlist', () => {
    const result = isValidCPSCombination({ mounting: '0', colour: 'B', label: 'CL' })
    expect(result.valid).toBe(false)
  })

  it('rejects flush blue plain — not in allowlist', () => {
    const result = isValidCPSCombination({ mounting: '0', colour: 'B', label: 'PLAIN' })
    expect(result.valid).toBe(false)
  })

  it('rejects flush orange custom label — not in allowlist', () => {
    const result = isValidCPSCombination({ mounting: '0', colour: 'E', label: 'CL' })
    expect(result.valid).toBe(false)
  })

  it('rejects flush orange plain — not in allowlist', () => {
    const result = isValidCPSCombination({ mounting: '0', colour: 'E', label: 'PLAIN' })
    expect(result.valid).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────────
// getValidCPSOptionsForStep
// ─────────────────────────────────────────────────────────────

describe('getValidCPSOptionsForStep', () => {
  it('returns all mounting options when nothing selected', () => {
    const valid = getValidCPSOptionsForStep('mounting', {})
    expect(valid).toContain('0')
    expect(valid).toContain('1')
  })

  it('FIRE label only valid with red colour', () => {
    const valid = getValidCPSOptionsForStep('colour', { label: 'FIRE' })
    expect(valid).toEqual(['R'])
  })

  it('EMERGENCY_DOOR label only valid with green colour', () => {
    const valid = getValidCPSOptionsForStep('colour', { label: 'EMERGENCY_DOOR' })
    expect(valid).toEqual(['G'])
  })

  it('EMERGENCY_OPERATE label valid with Y W B E but not R G', () => {
    const valid = getValidCPSOptionsForStep('colour', { label: 'EMERGENCY_OPERATE' })
    expect(valid).toContain('Y')
    expect(valid).toContain('W')
    expect(valid).toContain('B')
    expect(valid).toContain('E')
    expect(valid).not.toContain('R')
    expect(valid).not.toContain('G')
  })

  it('CL label not available for flush green', () => {
    const valid = getValidCPSOptionsForStep('label', { mounting: '0', colour: 'G' })
    expect(valid).not.toContain('CL')
    expect(valid).toContain('EMERGENCY_DOOR')
    expect(valid).toContain('PLAIN')
  })

  it('surface mount enables more label options for blue than flush', () => {
    const validSurface = getValidCPSOptionsForStep('label', {
      mounting: '1',
      colour: 'B',
    })
    const validFlush = getValidCPSOptionsForStep('label', { mounting: '0', colour: 'B' })
    expect(validSurface).toContain('CL')
    expect(validSurface).toContain('PLAIN')
    expect(validFlush).not.toContain('CL')
    expect(validFlush).not.toContain('PLAIN')
  })

  it('white colour has no CL option in either mounting', () => {
    const validFlush = getValidCPSOptionsForStep('label', { mounting: '0', colour: 'W' })
    const validSurface = getValidCPSOptionsForStep('label', {
      mounting: '1',
      colour: 'W',
    })
    expect(validFlush).not.toContain('CL')
    expect(validSurface).not.toContain('CL')
  })
})

// ─────────────────────────────────────────────────────────────
// Constraint engine integration
// ─────────────────────────────────────────────────────────────

describe('CALL_POINT_STOPPER_CONSTRAINTS + constraintEngine', () => {
  const engine = createConstraintEngine(CALL_POINT_STOPPER_CONSTRAINTS)

  it('FIRE label blocks all non-red colours', () => {
    for (const colour of ['G', 'Y', 'W', 'B', 'E']) {
      const result = engine.checkOptionAvailability('colour', colour, { label: 'FIRE' })
      expect(result.available).toBe(false)
    }
  })

  it('FIRE label allows red colour', () => {
    const result = engine.checkOptionAvailability('colour', 'R', { label: 'FIRE' })
    expect(result.available).toBe(true)
  })

  it('EMERGENCY_DOOR label blocks red colour', () => {
    const result = engine.checkOptionAvailability('colour', 'R', {
      label: 'EMERGENCY_DOOR',
    })
    expect(result.available).toBe(false)
  })

  it('green colour blocks FIRE and CL labels', () => {
    expect(
      engine.checkOptionAvailability('label', 'FIRE', { colour: 'G' }).available,
    ).toBe(false)
    expect(engine.checkOptionAvailability('label', 'CL', { colour: 'G' }).available).toBe(
      false,
    )
  })

  it('green colour allows EMERGENCY_DOOR and PLAIN labels', () => {
    expect(
      engine.checkOptionAvailability('label', 'EMERGENCY_DOOR', { colour: 'G' })
        .available,
    ).toBe(true)
    expect(
      engine.checkOptionAvailability('label', 'PLAIN', { colour: 'G' }).available,
    ).toBe(true)
  })

  it('constraint engine modelId matches', () => {
    expect(CALL_POINT_STOPPER_CONSTRAINTS.modelId).toBe('call-point-stopper')
  })
})

// ─────────────────────────────────────────────────────────────
// buildProductModel integration
// ─────────────────────────────────────────────────────────────

describe('buildProductModel — callPointStopper', () => {
  it('flush red fire — no suffixes → STI-6930', () => {
    const config: Configuration = { mounting: '0', colour: 'R', label: 'FIRE' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6930')
    expect(result.isComplete).toBe(true)
  })

  it('surface red plain → STI-6931-PLAIN', () => {
    const config: Configuration = { mounting: '1', colour: 'R', label: 'PLAIN' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6931-PLAIN')
    expect(result.isComplete).toBe(true)
  })

  it('flush green plain → STI-6930-G-PLAIN', () => {
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

  it('surface orange emergency operate → STI-6931-E', () => {
    const config: Configuration = {
      mounting: '1',
      colour: 'E',
      label: 'EMERGENCY_OPERATE',
    }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6931-E')
    expect(result.isComplete).toBe(true)
  })

  it('red colour has empty code — separator skipped', () => {
    const config: Configuration = { mounting: '0', colour: 'R', label: 'PLAIN' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6930-PLAIN')
    expect(result.fullCode).not.toContain('--')
  })

  it('standard label options have empty code — separator skipped', () => {
    const config: Configuration = { mounting: '0', colour: 'G', label: 'EMERGENCY_DOOR' }
    const result = buildProductModel(config, callPointStopperModel)
    expect(result.fullCode).toBe('STI-6930-G')
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

// ─────────────────────────────────────────────────────────────
// filterOptions completeness — callPointStopper
// ─────────────────────────────────────────────────────────────

describe('isConfigurationComplete — callPointStopper', () => {
  it('returns true when all three steps selected', () => {
    const config: Configuration = { mounting: '0', colour: 'R', label: 'FIRE' }
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
        label: 'FIRE',
      }),
    ).toBe(100)
  })
})

// ─────────────────────────────────────────────────────────────
// Model definition integrity
// ─────────────────────────────────────────────────────────────

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

  it('red colour has empty code — SKU suffix handled at rules level', () => {
    const colourStep = callPointStopperModel.steps.find((s) => s.id === 'colour')!
    const red = colourStep.options.find((o) => o.id === 'R')!
    expect(red.code).toBe('')
  })

  it('standard label options have empty codes', () => {
    const labelStep = callPointStopperModel.steps.find((s) => s.id === 'label')!
    const fire = labelStep.options.find((o) => o.id === 'FIRE')!
    const emergencyDoor = labelStep.options.find((o) => o.id === 'EMERGENCY_DOOR')!
    const emergencyOperate = labelStep.options.find((o) => o.id === 'EMERGENCY_OPERATE')!
    expect(fire.code).toBe('')
    expect(emergencyDoor.code).toBe('')
    expect(emergencyOperate.code).toBe('')
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
