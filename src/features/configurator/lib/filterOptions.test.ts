import { describe, it, expect } from 'vitest'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
  getVisibleSteps,
  getOptionsWithAvailability,
} from '@features/configurator/lib/filterOptions'
import type { ModelDefinition, Configuration } from '@shared/types'

function createOption(id: string, code?: string) {
  return { id, code: code ?? id, label: id }
}

const twoStepModel: ModelDefinition = {
  id: 'test-two-step',
  slug: 'test-two-step',
  stepOrder: ['colour', 'size'],
  steps: [
    {
      id: 'colour',
      required: true,
      options: [createOption('red'), createOption('blue')],
    },
    {
      id: 'size',
      required: true,
      options: [createOption('small'), createOption('large')],
    },
  ],
  productModelSchema: {
    baseCode: 'TEST',
    separator: 'dash',
    partsOrder: ['colour', 'size'],
  },
} as unknown as ModelDefinition

const threeStepModel: ModelDefinition = {
  id: 'test-three-step',
  slug: 'test-three-step',
  stepOrder: ['colour', 'size', 'mounting'],
  steps: [
    {
      id: 'colour',
      required: true,
      options: [createOption('red'), createOption('blue')],
    },
    {
      id: 'size',
      required: true,
      options: [createOption('small'), createOption('large')],
    },
    {
      id: 'mounting',
      required: true,
      options: [createOption('flush'), createOption('surface')],
    },
  ],
  productModelSchema: {
    baseCode: 'TEST',
    separator: 'dash',
    partsOrder: ['colour', 'size', 'mounting'],
  },
} as unknown as ModelDefinition

const modelWithEmptyOptionsStep: ModelDefinition = {
  id: 'test-empty-options',
  slug: 'test-empty-options',
  stepOrder: ['colour', 'hidden'],
  steps: [
    { id: 'colour', required: true, options: [createOption('red')] },
    { id: 'hidden', required: true, options: [] },
  ],
  productModelSchema: {
    baseCode: 'TEST',
    separator: 'dash',
    partsOrder: ['colour', 'hidden'],
  },
} as unknown as ModelDefinition

describe('getVisibleSteps', () => {
  it('returns all steps when all have available options', () => {
    const config: Configuration = { colour: null, size: null }
    const visible = getVisibleSteps(twoStepModel, config)
    expect(visible.map((s) => s.id)).toEqual(['colour', 'size'])
  })

  it('excludes steps with no options', () => {
    const config: Configuration = { colour: null, hidden: null }
    const visible = getVisibleSteps(modelWithEmptyOptionsStep, config)
    expect(visible.map((s) => s.id)).toEqual(['colour'])
    expect(visible.find((s) => s.id === 'hidden')).toBeUndefined()
  })

  it('respects stepOrder', () => {
    const config: Configuration = { colour: null, size: null, mounting: null }
    const visible = getVisibleSteps(threeStepModel, config)
    expect(visible.map((s) => s.id)).toEqual(['colour', 'size', 'mounting'])
  })
})

describe('getOptionsWithAvailability', () => {
  it('marks all options available for unknown model (no constraints)', () => {
    const step = twoStepModel.steps[0]
    const config: Configuration = { colour: null, size: null }
    const result = getOptionsWithAvailability(step, config, twoStepModel.id)
    expect(result).toHaveLength(2)
    expect(result.every(({ availability }) => availability.available)).toBe(true)
  })

  it('returns empty array for step with no options', () => {
    const step = modelWithEmptyOptionsStep.steps[1]
    const config: Configuration = { colour: null, hidden: null }
    const result = getOptionsWithAvailability(step, config, modelWithEmptyOptionsStep.id)
    expect(result).toHaveLength(0)
  })
})

describe('isConfigurationComplete', () => {
  it('returns true when all visible steps have selections', () => {
    const config: Configuration = { colour: 'red', size: 'small' }
    expect(isConfigurationComplete(twoStepModel, config)).toBe(true)
  })

  it('returns false when a visible step has no selection', () => {
    const config: Configuration = { colour: 'red', size: null }
    expect(isConfigurationComplete(twoStepModel, config)).toBe(false)
  })

  it('returns false when no steps have selections', () => {
    const config: Configuration = { colour: null, size: null }
    expect(isConfigurationComplete(twoStepModel, config)).toBe(false)
  })

  it('returns true when hidden step (empty options) is not selected', () => {
    const config: Configuration = { colour: 'red', hidden: null }
    expect(isConfigurationComplete(modelWithEmptyOptionsStep, config)).toBe(true)
  })

  it('handles empty config object', () => {
    const config: Configuration = {}
    expect(isConfigurationComplete(twoStepModel, config)).toBe(false)
  })
})

describe('getMissingRequiredSteps', () => {
  it('returns empty array when all visible steps are filled', () => {
    const config: Configuration = { colour: 'red', size: 'small' }
    expect(getMissingRequiredSteps(twoStepModel, config)).toHaveLength(0)
  })

  it('returns only visible unfilled steps', () => {
    const config: Configuration = { colour: null, size: 'small' }
    const missing = getMissingRequiredSteps(twoStepModel, config)
    expect(missing).toEqual(['colour'])
  })

  it('returns all visible steps when nothing is filled', () => {
    const config: Configuration = { colour: null, size: null, mounting: null }
    const missing = getMissingRequiredSteps(threeStepModel, config)
    expect(missing).toEqual(['colour', 'size', 'mounting'])
  })

  it('does not include hidden step (empty options) in missing', () => {
    const config: Configuration = { colour: null, hidden: null }
    const missing = getMissingRequiredSteps(modelWithEmptyOptionsStep, config)
    expect(missing).toEqual(['colour'])
    expect(missing).not.toContain('hidden')
  })
})

describe('getCompletionPercentage', () => {
  it('returns 100 when all visible steps are filled', () => {
    const config: Configuration = { colour: 'red', size: 'small' }
    expect(getCompletionPercentage(twoStepModel, config)).toBe(100)
  })

  it('returns 50 when half of visible steps are filled', () => {
    const config: Configuration = { colour: 'red', size: null }
    expect(getCompletionPercentage(twoStepModel, config)).toBe(50)
  })

  it('returns 0 when no visible steps are filled', () => {
    const config: Configuration = { colour: null, size: null }
    expect(getCompletionPercentage(twoStepModel, config)).toBe(0)
  })

  it('returns 33 when 1 of 3 visible steps is filled', () => {
    const config: Configuration = { colour: 'red', size: null, mounting: null }
    expect(getCompletionPercentage(threeStepModel, config)).toBe(33)
  })

  it('returns 67 when 2 of 3 visible steps are filled', () => {
    const config: Configuration = { colour: 'red', size: 'small', mounting: null }
    expect(getCompletionPercentage(threeStepModel, config)).toBe(67)
  })

  it('returns 100 when only visible step is filled and hidden step exists', () => {
    const config: Configuration = { colour: 'red', hidden: null }
    expect(getCompletionPercentage(modelWithEmptyOptionsStep, config)).toBe(100)
  })

  it('returns 0 for model where all steps have empty options', () => {
    const emptyModel: ModelDefinition = {
      id: 'test-all-empty',
      slug: 'test-all-empty',
      stepOrder: ['a'],
      steps: [{ id: 'a', required: true, options: [] }],
      productModelSchema: { baseCode: 'T', separator: 'none', partsOrder: ['a'] },
    } as unknown as ModelDefinition
    const config: Configuration = { a: null }
    expect(getCompletionPercentage(emptyModel, config)).toBe(0)
  })
})
