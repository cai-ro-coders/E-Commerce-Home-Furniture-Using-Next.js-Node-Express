'use client';

/**
 * Small piece of UI state that lives above the storefront pages.
 *
 * The cart drawer and the search overlay are rendered by the header, but they
 * are opened from places further down the page (a product card's add-to-cart,
 * a search button, the header itself). Keeping just those booleans here avoids
 * threading callbacks through every section component.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface StoreUIContextValue {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

const StoreUIContext = createContext<StoreUIContextValue | null>(null);

export function StoreUIProvider({ children }: { children: React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const openCart = useCallback(() => {
    setSearchOpen(false);
    setCartOpen(true);
  }, []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openSearch = useCallback(() => {
    setCartOpen(false);
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Only one overlay is open at a time, so a single lock is enough.
  useEffect(() => {
    if (!cartOpen && !searchOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [cartOpen, searchOpen]);

  const value = useMemo<StoreUIContextValue>(
    () => ({ cartOpen, openCart, closeCart, searchOpen, openSearch, closeSearch }),
    [cartOpen, openCart, closeCart, searchOpen, openSearch, closeSearch]
  );

  return <StoreUIContext.Provider value={value}>{children}</StoreUIContext.Provider>;
}

export function useStoreUI(): StoreUIContextValue {
  const context = useContext(StoreUIContext);
  if (!context) throw new Error('useStoreUI must be used inside <StoreUIProvider>');
  return context;
}
