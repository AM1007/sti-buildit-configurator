import type { ModelDefinition, Configuration } from '@shared/types'

const MODEL_PREFIX: Record<string, string> = {
  'stopper-ii': 'STI-',
}

export function getCodeHint(
  model: ModelDefinition,
  stepId: string,
  optionId: string,
  config: Configuration,
): string | null {
  const lookup = model.productModelSchema.codeLookup
  if (!lookup) return null

  const lookupSteps = lookup.steps
  if (!lookupSteps.includes(stepId)) return null

  const testConfig: Configuration = { ...config, [stepId]: optionId }

  const candidates: string[] = []

  for (const [key, code] of Object.entries(lookup.map)) {
    const parts = key.split('|')
    let matches = true

    for (let i = 0; i < lookupSteps.length; i++) {
      const stepValue = testConfig[lookupSteps[i]]
      if (stepValue && stepValue !== parts[i]) {
        matches = false
        break
      }
    }

    if (matches) {
      candidates.push(code)
    }
  }

  if (candidates.length === 0) return null

  const prefix = MODEL_PREFIX[model.id] ?? ''

  if (candidates.length === 1) {
    const code = candidates[0]
    return prefix ? code.replace(prefix, '') : code
  }

  const commonPrefix = findCommonPrefix(candidates)
  const stripped = prefix ? commonPrefix.replace(prefix, '') : commonPrefix

  if (stripped.length < 2) return null

  return stripped
}

function findCommonPrefix(strings: string[]): string {
  if (strings.length === 0) return ''
  let prefix = strings[0]
  for (let i = 1; i < strings.length; i++) {
    while (!strings[i].startsWith(prefix)) {
      prefix = prefix.slice(0, -1)
      if (prefix === '') return ''
    }
  }
  return prefix
}
