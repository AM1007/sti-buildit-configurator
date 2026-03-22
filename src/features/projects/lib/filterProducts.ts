import type { ConfiguratorMeta, PrimaryTag } from '@entities/product'

export const PRIMARY_TAGS = [
  'push-button',
  'call-point',
  'protective-cover',
  'enclosure',
] as const satisfies readonly PrimaryTag[]

export interface FilterState {
  primary: PrimaryTag | 'all'
}

export function createInitialFilterState(): FilterState {
  return {
    primary: 'all',
  }
}

function matchesPrimary(product: ConfiguratorMeta, primary: PrimaryTag | 'all'): boolean {
  if (primary === 'all') return true
  return product.tags.includes(primary)
}

export function filterConfigurators(
  all: ConfiguratorMeta[],
  state: FilterState,
): ConfiguratorMeta[] {
  return all.filter((product) => matchesPrimary(product, state.primary))
}
