import type { ModelId, Configuration } from '@shared/types'
import type { ModelConstraints } from './rules/types'

export type AllowlistFn = (stepId: string, config: Configuration) => Set<string> | null

interface ProductConstraintEntry {
  constraints: ModelConstraints | null
  allowlistFn: AllowlistFn | null
}

const registry = new Map<ModelId, ProductConstraintEntry>()

export function registerProductConstraints(
  modelId: ModelId,
  constraints: ModelConstraints | null,
  allowlistFn: AllowlistFn | null,
): void {
  registry.set(modelId, { constraints, allowlistFn })
}

export function getModelConstraints(modelId: ModelId): ModelConstraints | null {
  return registry.get(modelId)?.constraints ?? null
}

export function getAllowlistFn(modelId: ModelId): AllowlistFn | null {
  return registry.get(modelId)?.allowlistFn ?? null
}

export function configKeys(
  config: Configuration,
  keys: string[],
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const k of keys) {
    const v = config[k as keyof Configuration]
    out[k] = v ?? undefined
  }
  return out
}

export function buildAllowlistSet(
  stepId: string,
  config: Configuration,
  keys: string[],
  getValid: (stepId: string, others: Record<string, string | undefined>) => string[],
): Set<string> | null {
  const selection = configKeys(config, keys)
  const others: Record<string, string | undefined> = {}
  for (const k of keys) {
    if (k !== stepId) others[k] = selection[k]
  }
  return new Set(getValid(stepId, others))
}
