'use client';

import { useEffect, useRef } from 'react';

/** Invoke `handler` when a click lands outside every supplied ref. */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  active = true
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      if (element && !element.contains(event.target as Node)) handler();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [handler, active]);

  return ref;
}
