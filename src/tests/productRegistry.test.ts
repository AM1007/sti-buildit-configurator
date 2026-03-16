import { describe, it, expect } from 'vitest'
import {
  getProduct,
  getProductBySlug,
  getAllProducts,
  getImplementedProducts,
  PRODUCT_REGISTRY,
} from '@entities/product/registry'

describe('PRODUCT_REGISTRY', () => {
  it('contains entries for all implemented products', () => {
    expect(PRODUCT_REGISTRY.size).toBeGreaterThan(0)
  })

  it('each entry has meta, model, and id', () => {
    for (const entry of PRODUCT_REGISTRY.values()) {
      expect(entry.id).toBeDefined()
      expect(entry.meta).toBeDefined()
      expect(entry.model).toBeDefined()
      expect(entry.meta.id).toBe(entry.id)
      expect(entry.model.id).toBe(entry.id)
    }
  })
})

describe('getProduct', () => {
  it('returns entry for known model id', () => {
    const entry = getProduct('universal-stopper')
    expect(entry).toBeDefined()
    expect(entry?.id).toBe('universal-stopper')
  })

  it('returns undefined for unknown model id', () => {
    const entry = getProduct('non-existent' as never)
    expect(entry).toBeUndefined()
  })
})

describe('getProductBySlug', () => {
  it('returns entry for known slug', () => {
    const entry = getProductBySlug('universal-stopper')
    expect(entry).toBeDefined()
    expect(entry?.meta.slug).toBe('universal-stopper')
  })

  it('returns undefined for unknown slug', () => {
    const entry = getProductBySlug('non-existent')
    expect(entry).toBeUndefined()
  })

  it('meta and model ids match for slug lookup', () => {
    const entry = getProductBySlug('call-point-stopper')
    expect(entry?.meta.id).toBe(entry?.model.id)
  })
})

describe('getAllProducts', () => {
  it('returns all registered products', () => {
    const all = getAllProducts()
    expect(all.length).toBe(PRODUCT_REGISTRY.size)
  })
})

describe('getImplementedProducts', () => {
  it('returns only implemented products', () => {
    const implemented = getImplementedProducts()
    for (const entry of implemented) {
      expect(entry.meta.isImplemented).toBe(true)
    }
  })

  it('is a subset of getAllProducts', () => {
    const all = getAllProducts()
    const implemented = getImplementedProducts()
    expect(implemented.length).toBeLessThanOrEqual(all.length)
  })
})
