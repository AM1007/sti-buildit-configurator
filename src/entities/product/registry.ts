import type { ModelId, ModelDefinition } from '@shared/types'
import type { ConfiguratorMeta } from './catalog/types'

import { MODEL_REGISTRY } from '@entities/product/models'
import { allConfigurators } from './catalog'

export interface ProductEntry {
  id: ModelId
  meta: ConfiguratorMeta
  model: ModelDefinition
}

const productEntries: ProductEntry[] = allConfigurators
  .filter((meta) => meta.id in MODEL_REGISTRY)
  .map((meta) => ({
    id: meta.id as ModelId,
    meta,
    model: MODEL_REGISTRY[meta.id as ModelId],
  }))

export const PRODUCT_REGISTRY: ReadonlyMap<ModelId, ProductEntry> = new Map(
  productEntries.map((entry) => [entry.id, entry]),
)

export function getProduct(modelId: ModelId): ProductEntry | undefined {
  return PRODUCT_REGISTRY.get(modelId)
}

export function getProductBySlug(slug: string): ProductEntry | undefined {
  for (const entry of PRODUCT_REGISTRY.values()) {
    if (entry.meta.slug === slug) return entry
  }
  return undefined
}

export function getAllProducts(): ProductEntry[] {
  return productEntries
}

export function getImplementedProducts(): ProductEntry[] {
  return productEntries.filter((entry) => entry.meta.isImplemented)
}
