import { describe, it, expect } from 'vitest'
import {
  isConfigurationComplete,
  getMissingRequiredSteps,
  getCompletionPercentage,
} from '@features/configurator/lib/filterOptions'
import type { ModelDefinition, Configuration } from '@shared/types'

const mockModel: ModelDefinition = {
  id: 'test-model',
  slug: 'test-model',
  stepOrder: ['colour', 'size', 'mounting'],
  steps: [
    { id: 'colour', required: true, options: [] },
    { id: 'size', required: true, options: [] },
    { id: 'mounting', required: false, options: [] },
  ],
  productModelSchema: {
    baseCode: 'TEST',
    separator: 'dash',
    partsOrder: ['colour', 'size', 'mounting'],
  },
} as unknown as ModelDefinition

describe('isConfigurationComplete', () => {
  it('returns true when all required steps are filled', () => {
    const config: Configuration = {
      colour: 'red',
      size: 'small',
      mounting: null,
    }
    expect(isConfigurationComplete(mockModel, config)).toBe(true)
  })

  it('returns false when a required step is missing', () => {
    const config: Configuration = {
      colour: 'red',
      size: null,
      mounting: null,
    }
    expect(isConfigurationComplete(mockModel, config)).toBe(false)
  })

  it('returns true when optional step is not filled', () => {
    const config: Configuration = {
      colour: 'red',
      size: 'small',
      mounting: null,
    }
    expect(isConfigurationComplete(mockModel, config)).toBe(true)
  })
})

describe('getMissingRequiredSteps', () => {
  it('returns empty array when configuration is complete', () => {
    const config: Configuration = {
      colour: 'red',
      size: 'small',
      mounting: null,
    }
    expect(getMissingRequiredSteps(mockModel, config)).toHaveLength(0)
  })

  it('returns only missing required steps', () => {
    const config: Configuration = {
      colour: null,
      size: 'small',
      mounting: null,
    }
    const missing = getMissingRequiredSteps(mockModel, config)
    expect(missing).toContain('colour')
    expect(missing).not.toContain('size')
    expect(missing).not.toContain('mounting')
  })
})

describe('getCompletionPercentage', () => {
  it('returns 100 when all required steps are filled', () => {
    const config: Configuration = {
      colour: 'red',
      size: 'small',
      mounting: null,
    }
    expect(getCompletionPercentage(mockModel, config)).toBe(100)
  })

  it('returns 50 when half of required steps are filled', () => {
    const config: Configuration = {
      colour: 'red',
      size: null,
      mounting: null,
    }
    expect(getCompletionPercentage(mockModel, config)).toBe(50)
  })

  it('returns 0 when no required steps are filled', () => {
    const config: Configuration = {
      colour: null,
      size: null,
      mounting: null,
    }
    expect(getCompletionPercentage(mockModel, config)).toBe(0)
  })
})
