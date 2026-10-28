'use client';

/**
 * Slide-over cart.
 *
 * It stays mounted so both the opening and closing transitions can run; the
 * wrapper is made inert with `invisible` when closed. Quantity edits go through
 * the shared store, so the line totals and the header badge stay in sync.
 */
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useStore } from '@/components/providers/StoreProvider';
import { useStoreUI } from '@/components/providers/StoreUIProvider';
import { imageUrl } from '@/lib/api';
import { formatMoney, num } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { CartItem } from '@/types';

export function CartDrawer() {
  const { cartOpen, closeCart } = useStoreUI();
  const { user } = useAuth();
  const { cart, cartLoading, updateQuantity, removeItem } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!cartOpen) return;
    const timer = window.setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [cartOpen, closeCart]);

  const items = cart?.items ?? [];
  const totals = cart?.totals;
  const subtotal = num(totals?.subtotal ?? cart?.summary.subtotal ?? 0);
  const threshold = num(totals?.free_shipping_threshold ?? 25000);
  const remaining = Math.max(0, threshold - subtotal);
  const progress = threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 100;

  const changeQuantity = (item: CartItem, delta: number) => {
    const next = item.quantity + delta;
    if (next < 1) {
      void removeItem(item.id);
      return;
    }
    void updateQuantity(item.id, next);
  };

  return (
    <div
      className={cn('fixed inset-0 z-[85]', cartOpen ? 'visible' : 'invisible')}
      aria-hidden={!cartOpen}
    >
      <div
        className={cn(
          'absolute inset-0 bg-walnut-950/50 backdrop-blur-[2px] transition-opacity duration-500',
          cartOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeCart}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your shopping bag"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-[28rem] flex-col bg-sand-50 shadow-[-30px_0_80px_-30px_rgba(22,19,15,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-sand-200 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-clay-700">
              Lumera Home
            </p>
            <h2 className="mt-1 font-display text-2xl text-walnut-950">
              Your bag{' '}
              <span className="text-base text-sand-400">
                ({cart?.summary.item_count ?? 0})
              </span>
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close cart"
            onClick={closeCart}
            className="flex size-9 items-center justify-center rounded-full border border-sand-200 text-sand-600 transition-colors hover:border-walnut-900 hover:text-walnut-900"
          >
            <X className="size-4" />
          </button>
        </div>

        {!user ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-sand-100 text-sand-500">
              <ShoppingBag className="size-7" />
            </span>
            <h3 className="mt-5 font-display text-xl text-walnut-950">Sign in to start a bag</h3>
            <p className="mt-2 text-sm leading-relaxed text-sand-500">
              Save your favourites and keep your bag across visits.
            </p>
            <Link
              href="/login"
              onClick={closeCart}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-walnut-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-clay-700"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={closeCart}
              className="mt-3 text-xs font-semibold text-clay-700 underline decoration-sand-300 underline-offset-4"
            >
              Create an account
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-sand-100 text-sand-500">
              <ShoppingBag className="size-7" />
            </span>
            <h3 className="mt-5 font-display text-xl text-walnut-950">
              {cartLoading ? 'Opening your bag…' : 'Your bag is waiting'}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-sand-500">
              The good chairs are over here. Add a piece and it will appear in this drawer.
            </p>
            <Link
              href="/products"
              onClick={closeCart}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-walnut-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-clay-700"
            >
              Browse the collection
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-sand-200 px-5 py-4 sm:px-6">
              <p className="flex items-center gap-2 text-[0.7rem] text-sand-600">
                <Truck className="size-3.5 text-clay-700" />
                {remaining > 0 ? (
                  <>
                    Add <span className="font-semibold text-walnut-950">{formatMoney(remaining, 'PHP', { decimals: 0 })}</span> for
                    complimentary delivery.
                  </>
                ) : (
                  <span className="font-semibold text-emerald-700">Complimentary delivery unlocked.</span>
                )}
              </p>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-sand-200">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    progress >= 100 ? 'bg-emerald-600' : 'bg-clay-600'
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-sand-200 overflow-y-auto px-5 sm:px-6">
              {items.map((item) => {
                const overStock = item.quantity > item.stock_quantity;
                return (
                  <li key={item.id} className="flex gap-4 py-5">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-sand-100"
                    >
                      {item.product_image ? (
                        <img
                          src={imageUrl(item.product_image)}
                          alt={item.product_name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="flex size-full items-center justify-center font-display text-xl text-sand-400">
                          {item.product_name.charAt(0)}
                        </span>
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="line-clamp-2 text-sm font-medium leading-snug text-walnut-950 transition-colors hover:text-clay-700"
                        >
                          {item.product_name}
                        </Link>
                        <button
                          type="button"
                          aria-label={`Remove ${item.product_name}`}
                          onClick={() => void removeItem(item.id)}
                          className="shrink-0 rounded-full p-1 text-sand-400 transition-colors hover:text-rose-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-sand-400">
                        {item.sku}
                      </p>
                      {overStock ? (
                        <p className="mt-1 text-[0.65rem] font-medium text-amber-700">
                          Only {item.stock_quantity} available
                        </p>
                      ) : null}

                      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                        <div className="flex h-8 items-center rounded-full border border-sand-200">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${item.product_name}`}
                            onClick={() => changeQuantity(item, -1)}
                            className="flex size-8 items-center justify-center rounded-l-full text-sand-500 transition-colors hover:bg-sand-100"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${item.product_name}`}
                            onClick={() => changeQuantity(item, 1)}
                            className="flex size-8 items-center justify-center rounded-r-full text-sand-500 transition-colors hover:bg-sand-100"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-walnut-950">
                          {formatMoney(item.line_total, 'PHP', { decimals: 0 })}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-sand-200 px-5 py-5 sm:px-6">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-sand-500">Subtotal</dt>
                  <dd className="font-semibold tabular-nums text-walnut-950">
                    {formatMoney(totals?.subtotal ?? cart?.summary.subtotal ?? '0', 'PHP', { decimals: 0 })}
                  </dd>
                </div>
                {totals && num(totals.discount) > 0 ? (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Coupon</dt>
                    <dd className="font-semibold tabular-nums">
                      − {formatMoney(totals.discount, 'PHP', { decimals: 0 })}
                    </dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-sand-500">Delivery</dt>
                  <dd className="font-medium">
                    {totals?.free_shipping ? 'Complimentary' : formatMoney(totals?.shipping_fee ?? 0, 'PHP', { decimals: 0 })}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-sand-200 pt-3 text-base">
                  <dt className="font-display text-lg text-walnut-950">Total</dt>
                  <dd className="font-display text-lg font-semibold tabular-nums text-walnut-950">
                    {formatMoney(totals?.total ?? cart?.summary.total ?? '0', 'PHP', { decimals: 0 })}
                  </dd>
                </div>
              </dl>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-walnut-950 text-sm font-semibold text-white transition-colors hover:bg-clay-700"
              >
                Proceed to checkout
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-2 block py-1 text-center text-xs font-medium text-sand-500 transition-colors hover:text-walnut-950"
              >
                View full bag and apply a coupon
              </Link>
              <p className="mt-1 text-center text-[0.65rem] text-sand-400">
                Taxes calculated at checkout · 30-day returns
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
