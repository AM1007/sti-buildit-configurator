import { useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function getSnapshot(query: string): boolean {
  return window.matchMedia(query).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(query),
    () => getServerSnapshot()
  );
}

export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)");
}

export function useIsTablet(): boolean {
  const aboveMobile = useMediaQuery("(min-width: 768px)");
  const belowDesktop = !useMediaQuery("(min-width: 1024px)");
  return aboveMobile && belowDesktop;
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}