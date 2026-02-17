import { useState, useMemo, useCallback } from "react";
import type { ConfiguratorMeta, PrimaryTag, FunctionalTag } from "../data/catalog";
import {
  type FilterState,
  createInitialFilterState,
  filterConfigurators,
  computeChipCounts,
} from "../utils/filterProducts";

export function useFilterState(all: ConfiguratorMeta[]) {
  const [state, setState] = useState<FilterState>(createInitialFilterState);

  const filtered = useMemo(
    () => filterConfigurators(all, state),
    [all, state]
  );

  const chipCounts = useMemo(
    () => computeChipCounts(all, state),
    [all, state]
  );

  const setPrimary = useCallback((tag: PrimaryTag | "all") => {
    setState((prev) => ({ ...prev, primary: tag }));
  }, []);

  const toggleFunctional = useCallback((tag: FunctionalTag) => {
    setState((prev) => {
      const next = new Set(prev.functional);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return { ...prev, functional: next };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setState(createInitialFilterState());
  }, []);

  const hasActiveFilters = state.primary !== "all" || state.functional.size > 0;

  return {
    state,
    filtered,
    chipCounts,
    hasActiveFilters,
    setPrimary,
    toggleFunctional,
    clearFilters,
  };
}