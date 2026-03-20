import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Reactive media query hook. Returns true when the query matches.
 * Uses breakpoints from config.ts:
 *   const isMobile = useMediaQuery(`(max-width: ${breakpoints.mobile}px)`);
 */
export function useMediaQuery(query: string): boolean {
  const mql = useMemo(() => window.matchMedia(query), [query]);

  const subscribe = useCallback(
    (callback: () => void) => {
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [mql],
  );

  return useSyncExternalStore(
    subscribe,
    () => mql.matches,
    () => false,
  );
}
