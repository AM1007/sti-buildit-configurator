import type { ConfiguratorMeta, PrimaryTag, FunctionalTag } from "../data/catalog";

export const PRIMARY_TAGS = [
  "push-button",
  "call-point",
  "protective-cover",
  "enclosure",
] as const satisfies readonly PrimaryTag[];

export const FUNCTIONAL_TAGS = [
  "weather-rated",
  "sounder",
  "reset-device",
  "fire-alarm",
  "key-operated",
] as const satisfies readonly FunctionalTag[];

export interface FilterState {
  primary: PrimaryTag | "all";
  functional: Set<FunctionalTag>;
}

export function createInitialFilterState(): FilterState {
  return {
    primary: "all",
    functional: new Set(),
  };
}

function matchesPrimary(
  product: ConfiguratorMeta,
  primary: PrimaryTag | "all"
): boolean {
  if (primary === "all") return true;
  return product.tags.includes(primary);
}

function matchesFunctional(
  product: ConfiguratorMeta,
  functional: Set<FunctionalTag>
): boolean {
  for (const tag of functional) {
    if (!product.tags.includes(tag)) return false;
  }
  return true;
}

export function filterConfigurators(
  all: ConfiguratorMeta[],
  state: FilterState
): ConfiguratorMeta[] {
  return all.filter(
    (product) =>
      matchesPrimary(product, state.primary) &&
      matchesFunctional(product, state.functional)
  );
}

export function computeChipCounts(
  all: ConfiguratorMeta[],
  state: FilterState
): Record<FunctionalTag, number> {
  const primaryFiltered = all.filter((product) =>
    matchesPrimary(product, state.primary)
  );

  const counts = {} as Record<FunctionalTag, number>;

  for (const tag of FUNCTIONAL_TAGS) {
    const testFunctional = new Set(state.functional);
    testFunctional.add(tag);

    counts[tag] = primaryFiltered.filter((product) =>
      matchesFunctional(product, testFunctional)
    ).length;
  }

  return counts;
}