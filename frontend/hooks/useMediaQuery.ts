'use client';

import { useEffect, useState } from 'react';

/** Subscribe to a CSS media query. Returns `false` during SSR. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Tailwind's `lg` breakpoint — the sidebar collapses below it. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
