import { useState, useMemo, useCallback } from "react";
import type { ConfiguratorMeta, PrimaryTag, FunctionalTag } from "../data/catalog";
import {
  type FilterState,
  createInitialFilterState,
  filterConfigurators,
  computeChipCounts,
} from "../utils/filterProducts";

type ViewMode = "grid" | "list";

const PAGE_SIZE = 8;

function getInitialViewMode(): ViewMode {
  if (typeof window === "undefined") return "grid";
  return window.matchMedia("(min-width: 768px)").matches ? "grid" : "list";
}

export function useFilterState(all: ConfiguratorMeta[]) {
  const [state, setState] = useState<FilterState>(createInitialFilterState);
  const [viewMode, setViewMode] = useState<ViewMode>(getInitialViewMode);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isPaginated, setIsPaginated] = useState(true);

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
    setVisibleCount(PAGE_SIZE);
    setIsPaginated(true);
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
    setVisibleCount(PAGE_SIZE);
    setIsPaginated(true);
  }, []);

  const clearFilters = useCallback(() => {
    setState(createInitialFilterState());
    setVisibleCount(PAGE_SIZE);
    setIsPaginated(true);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  const showAll = useCallback(() => {
    setIsPaginated(false);
  }, []);

  const togglePagination = useCallback(() => {
    setIsPaginated((prev) => {
      if (prev) return false;
      setVisibleCount(PAGE_SIZE);
      return true;
    });
  }, []);

  const hasActiveFilters = state.primary !== "all" || state.functional.size > 0;

  const displayed = isPaginated ? filtered.slice(0, visibleCount) : filtered;
  const hasMore = isPaginated && visibleCount < filtered.length;

  return {
    state,
    filtered,
    displayed,
    chipCounts,
    hasActiveFilters,
    viewMode,
    isPaginated,
    hasMore,
    setPrimary,
    toggleFunctional,
    clearFilters,
    setViewMode,
    loadMore,
    showAll,
    togglePagination,
  };
}