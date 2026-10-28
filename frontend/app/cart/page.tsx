'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShoppingCart, Tag, Trash2 } from 'lucide-react';
import { StoreShell } from '@/components/storefront/StoreShell';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState, PageSpinner } from '@/components/ui/Feedback';
import { useStore } from '@/components/providers/StoreProvider';
import { imageUrl } from '@/lib/api';
import { formatMoney, num } from '@/lib/format';

export default function CartPage() {
  const { cart, cartLoading, updateQuantity, removeItem, clearCart, applyCoupon, removeCoupon, couponCode } =
    useStore();

  if (cartLoading && !cart) {
    return (
      <StoreShell>
        <PageSpinner label="Loading your cart…" />
      </StoreShell>
    );
  }

  const items = cart?.items ?? [];
  const totals = cart?.totals;
  const coupon = cart?.coupon ?? null;

  return (
    <StoreShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-sand-900 dark:text-sand-50">
              Your cart
            </h1>
            <p className="mt-1 text-sm text-muted">
              {items.length === 0
                ? 'Nothing in it yet.'
                : `${items.length} item${items.length === 1 ? '' : 's'} · ${formatMoney(
                    totals?.subtotal ?? cart?.summary.subtotal ?? '0',
                    'PHP'
                  )}`}
            </p>
          </div>
          {items.length > 0 ? (
            <Button variant="ghost" size="sm" leftIcon={<Trash2 className="size-3.5" />} onClick={() => void clearCart()}>
              Empty cart
            </Button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <Card>
            <CardBody>
              <EmptyState
                title="Your cart is empty"
                description="Browse the collection and add something you will still love in ten years."
                icon={<ShoppingCart className="size-8 text-sand-300 dark:text-walnut-700" />}
                action={
                  <Link href="/products">
                    <Button>Browse furniture</Button>
                  </Link>
                }
              />
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
              {items.map((item) => {
                const out = item.stock_quantity <= 0;
                const over = item.quantity > item.stock_quantity;
                return (
                  <Card key={item.id}>
                    <CardBody className="flex items-center gap-4 p-4">
                      <Link
                        href={`/products/${item.slug}`}
                        className="size-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-sunken)]"
                      >
                        {item.product_image ? (
                          <img
                            src={imageUrl(item.product_image)}
                            alt={item.product_name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center font-display text-xl font-bold text-sand-300 dark:text-walnut-700">
                            {item.product_name.charAt(0)}
                          </span>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${item.slug}`}
                          className="line-clamp-2 text-sm font-medium text-sand-900 hover:text-clay-700 dark:text-sand-50"
                        >
                          {item.product_name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted">SKU {item.sku}</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums text-sand-900 dark:text-sand-50">
                          {formatMoney(item.price, 'PHP')}
                        </p>

                        {out ? (
                          <p className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                            Out of stock — remove it to check out.
                          </p>
                        ) : over ? (
                          <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            Only {item.stock_quantity} available.
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center rounded-full border border-[var(--border-subtle)]">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => void updateQuantity(item.id, item.quantity - 1)}
                            className="flex size-8 items-center justify-center rounded-l-full text-sand-500 transition-colors hover:bg-[var(--surface-sunken)]"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => void updateQuantity(item.id, item.quantity + 1)}
                            className="flex size-8 items-center justify-center rounded-r-full text-sand-500 transition-colors hover:bg-[var(--surface-sunken)]"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-bold tabular-nums text-sand-900 dark:text-sand-50">
                          {formatMoney(item.line_total, 'PHP')}
                        </span>

                        <button
                          type="button"
                          onClick={() => void removeItem(item.id)}
                          className="text-xs font-medium text-sand-500 transition-colors hover:text-rose-600"
                        >
                          Remove
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col gap-4">
              <Card className="lg:sticky lg:top-24">
                <CardHeader title="Order summary" />
                <CardBody className="flex flex-col gap-3">
                  <CouponField onApply={(code) => void applyCoupon(code)} />

                  {couponCode ? (
                    <p className="flex items-center justify-between gap-2 rounded-lg bg-[var(--surface-sunken)] px-3 py-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 font-medium text-sand-700 dark:text-sand-200">
                        <Tag className="size-3.5 text-clay-600 dark:text-clay-400" aria-hidden />
                        {couponCode}
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="font-medium text-sand-500 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    </p>
                  ) : null}

                  {coupon && !coupon.valid && coupon.reason ? (
                    <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                      {coupon.reason}
                    </p>
                  ) : null}

                  <dl className="flex flex-col gap-2 border-t border-[var(--border-subtle)] pt-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted">Subtotal</dt>
                      <dd className="font-medium tabular-nums">
                        {formatMoney(totals?.subtotal ?? cart?.summary.subtotal ?? '0', 'PHP')}
                      </dd>
                    </div>

                    {totals && num(totals.discount) > 0 ? (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                        <dt>Coupon discount</dt>
                        <dd className="font-medium tabular-nums">− {formatMoney(totals.discount, 'PHP')}</dd>
                      </div>
                    ) : null}

                    <div className="flex justify-between">
                      <dt className="text-muted">Shipping</dt>
                      <dd className="font-medium tabular-nums">
                        {totals?.free_shipping
                          ? 'Free'
                          : formatMoney(totals?.shipping_fee ?? '0', 'PHP')}
                      </dd>
                    </div>

                    {totals && num(totals.tax) > 0 ? (
                      <div className="flex justify-between">
                        <dt className="text-muted">Tax</dt>
                        <dd className="font-medium tabular-nums">{formatMoney(totals.tax, 'PHP')}</dd>
                      </div>
                    ) : null}

                    <div className="flex justify-between border-t border-[var(--border-subtle)] pt-3 text-base font-bold">
                      <dt>Total</dt>
                      <dd className="tabular-nums text-clay-700 dark:text-clay-400">
                        {formatMoney(totals?.total ?? cart?.summary.total ?? '0', 'PHP')}
                      </dd>
                    </div>
                  </dl>

                  {totals && !totals.free_shipping ? (
                    <p className="rounded-lg bg-clay-50 px-3 py-2 text-xs text-clay-800 dark:bg-clay-500/10 dark:text-clay-300">
                      Add {formatMoney(num(totals.free_shipping_threshold) - num(totals.subtotal), 'PHP')}{' '}
                      more for free delivery.
                    </p>
                  ) : null}

                  <Link href="/checkout" className="mt-1">
                    <Button className="w-full" leftIcon={<ArrowRight className="size-4" />}>
                      Proceed to checkout
                    </Button>
                  </Link>

                  <Link
                    href="/products"
                    className="text-center text-xs font-medium text-sand-500 hover:text-clay-700"
                  >
                    Continue shopping
                  </Link>
                </CardBody>
              </Card>
            </div>
          </div>
        )}
      </div>
    </StoreShell>
  );
}

/** Coupon entry. Kept inline so the input and the button share a row. */
function CouponField({ onApply }: { onApply: (code: string) => void }) {
  const [code, setCode] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (code.trim()) onApply(code);
      }}
      className="flex items-end gap-2"
    >
      <label className="flex flex-1 flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-sand-600 dark:text-sand-400">
          Coupon code
        </span>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="WELCOME10"
          className="h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 font-mono text-sm uppercase focus:border-clay-500 focus:outline-none focus:ring-2 focus:ring-clay-500/25"
        />
      </label>
      <Button type="submit" variant="outline" className="h-10" disabled={!code.trim()}>
        Apply
      </Button>
    </form>
  );
}
