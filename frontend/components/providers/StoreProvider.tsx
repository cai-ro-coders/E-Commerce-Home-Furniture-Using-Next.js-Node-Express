'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthProvider';
import { api } from '@/lib/api';
import { toastError, toastSuccess } from '@/lib/alerts';
import type { Cart, CartCoupon, Wishlist, WishlistItem } from '@/types';

interface StoreContextValue {
  cart: Cart | null;
  cartLoading: boolean;
  /** The coupon code currently applied to the basket, if any. */
  couponCode: string | null;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number, name?: string) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<CartCoupon | null>;
  removeCoupon: () => void;

  wishlist: WishlistItem[];
  wishlistLoading: boolean;
  refreshWishlist: () => Promise<void>;
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<boolean | null>;
}

const StoreContext = createContext<StoreContextValue | null>(null);
const COUPON_KEY = 'lumera.coupon';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user, setCartCount } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const loadedFor = useRef<number | null>(null);

  // Re-read the coupon from storage once, so a refresh keeps the discount.
  useEffect(() => {
    const stored = localStorage.getItem(COUPON_KEY);
    if (stored) setCouponCode(stored);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      setCartCount(0);
      return;
    }
    setCartLoading(true);
    try {
      // The summary endpoint is the only one that knows tax, shipping and the
      // applied coupon, so always read it rather than the bare `/cart`.
      const query = couponCode ? `?coupon=${encodeURIComponent(couponCode)}` : '';
      const result = await api.get<Cart>(`/cart/summary${query}`);
      setCart(result);
      setCartCount(result.summary.item_count);
    } catch {
      // A failure here should not break the page; the badge just stays stale.
    } finally {
      setCartLoading(false);
    }
  }, [user, couponCode, setCartCount]);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setWishlistLoading(true);
    try {
      const result = await api.get<Wishlist>('/wishlist');
      setWishlist(result.items);
    } catch {
      // Non-fatal: the heart icons simply render unfilled.
    } finally {
      setWishlistLoading(false);
    }
  }, [user]);

  // Load once per signed-in user, and reset when they sign out.
  useEffect(() => {
    if (!user) {
      loadedFor.current = null;
      setCart(null);
      setWishlist([]);
      return;
    }
    if (loadedFor.current === user.id) return;
    loadedFor.current = user.id;
    void refreshCart();
    void refreshWishlist();
  }, [user, refreshCart, refreshWishlist]);

  const addToCart = useCallback(
    async (productId: number, quantity = 1, name?: string) => {
      try {
        const result = await api.post<Cart>('/cart/items', {
          product_id: productId,
          quantity,
        });
        setCart(result);
        setCartCount(result.summary.item_count);
        // Re-price with the existing coupon still applied.
        if (couponCode) void refreshCart();
        toastSuccess(name ? `${name} added to your cart` : 'Added to your cart');
        return true;
      } catch (error) {
        toastError(error instanceof Error ? error.message : 'Could not add to cart');
        return false;
      }
    },
    [couponCode, refreshCart, setCartCount]
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      try {
        const result = await api.put<Cart>(`/cart/items/${itemId}`, { quantity });
        setCart(result);
        setCartCount(result.summary.item_count);
        if (couponCode) void refreshCart();
      } catch (error) {
        toastError(error instanceof Error ? error.message : 'Could not update the quantity');
      }
    },
    [couponCode, refreshCart, setCartCount]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      try {
        const result = await api.delete<Cart>(`/cart/items/${itemId}`);
        setCart(result);
        setCartCount(result.summary.item_count);
        if (couponCode) void refreshCart();
        toastSuccess('Item removed');
      } catch (error) {
        toastError(error instanceof Error ? error.message : 'Could not remove the item');
      }
    },
    [couponCode, refreshCart, setCartCount]
  );

  const clearCart = useCallback(async () => {
    if (!user) return;
    await api.delete('/cart');
    setCart({ items: [], summary: { item_count: 0, subtotal: '0', total: '0' } });
    setCartCount(0);
  }, [user, setCartCount]);

  const applyCoupon = useCallback(
    async (code: string) => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed) return null;
      try {
        const result = await api.get<Cart>(`/cart/summary?coupon=${encodeURIComponent(trimmed)}`);
        setCart(result);
        if (result.coupon?.valid) {
          setCouponCode(trimmed);
          localStorage.setItem(COUPON_KEY, trimmed);
          toastSuccess(result.coupon.description || 'Coupon applied');
        }
        return result.coupon ?? null;
      } catch (error) {
        toastError(error instanceof Error ? error.message : 'Could not apply that coupon');
        return null;
      }
    },
    []
  );

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    localStorage.removeItem(COUPON_KEY);
    void refreshCart();
  }, [refreshCart]);

  const isWishlisted = useCallback(
    // A wishlist row's `id` is the product id (`p.*` is selected).
    (productId: number) => wishlist.some((item) => item.id === productId),
    [wishlist]
  );

  const toggleWishlist = useCallback(
    async (productId: number) => {
      if (!user) {
        toastError('Sign in to save items to your wishlist');
        return null;
      }
      const present = wishlist.some((item) => item.id === productId);
      try {
        if (present) {
          await api.delete(`/wishlist/${productId}`);
          setWishlist((items) => items.filter((item) => item.id !== productId));
          return false;
        }
        await api.post('/wishlist', { product_id: productId });
        await refreshWishlist();
        toastSuccess('Saved to your wishlist');
        return true;
      } catch (error) {
        toastError(error instanceof Error ? error.message : 'Could not update your wishlist');
        return null;
      }
    },
    [user, wishlist, refreshWishlist]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      cartLoading,
      couponCode,
      refreshCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      wishlist,
      wishlistLoading,
      refreshWishlist,
      isWishlisted,
      toggleWishlist,
    }),
    [
      cart,
      cartLoading,
      couponCode,
      refreshCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      applyCoupon,
      removeCoupon,
      wishlist,
      wishlistLoading,
      refreshWishlist,
      isWishlisted,
      toggleWishlist,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside <StoreProvider>');
  return context;
}
