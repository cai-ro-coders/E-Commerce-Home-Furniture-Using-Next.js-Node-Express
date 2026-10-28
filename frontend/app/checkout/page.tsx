'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Lock, MapPin, Tag } from 'lucide-react';
import { StoreShell } from '@/components/storefront/StoreShell';
import { useAuth } from '@/components/providers/AuthProvider';
import { useStore } from '@/components/providers/StoreProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, Textarea } from '@/components/ui/Field';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { ApiError, api } from '@/lib/api';
import { alertError, alertSuccess } from '@/lib/alerts';
import { formatMoney, num } from '@/lib/format';
import type { Address, Order } from '@/types';

const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on delivery', hint: 'Pay the crew when it arrives.' },
  { value: 'bank_transfer', label: 'Bank transfer', hint: 'BPI or BDO — details follow your confirmation.' },
  { value: 'stripe', label: 'Card (Stripe)', hint: 'You will be redirected to Stripe to enter your card.' },
  { value: 'paypal', label: 'PayPal', hint: 'Redirected to PayPal to approve.' },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, cartLoading, applyCoupon, removeCoupon, couponCode } = useStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [notes, setNotes] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelledPayment, setCancelledPayment] = useState<'stripe' | 'paypal' | null>(null);
  const cancelledHandled = useRef(false);

  // Stripe and PayPal send the customer back here when they close the payment
  // page. A cancelled PayPal order is released so its reserved stock returns to
  // the catalogue; the basket itself was never cleared.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider =
      params.get('stripe') === 'cancelled'
        ? 'stripe'
        : params.get('paypal') === 'cancelled'
          ? 'paypal'
          : null;
    setCancelledPayment(provider);

    if (provider !== 'paypal' || !user || cancelledHandled.current) return;
    const orderId = Number(params.get('order'));
    if (!Number.isInteger(orderId) || orderId <= 0) return;

    cancelledHandled.current = true;
    void api.post(`/orders/${orderId}/paypal/cancel`, {}).catch(() => {
      // The pending order will expire on PayPal's side; the notice below is
      // still enough for the customer to retry.
    });
  }, [user]);

  const loadAddresses = useCallback(async () => {
    try {
      const result = await api.get<Address[]>('/auth/addresses');
      setAddresses(result);
      setAddressId((current) => {
        if (current) return current;
        const fallback = result.find((address) => address.is_default) ?? result[0];
        return fallback?.id ?? null;
      });
    } catch {
      setAddresses([]);
    }
  }, []);

  useEffect(() => {
    if (user) void loadAddresses();
  }, [user, loadAddresses]);

  if (authLoading || cartLoading) {
    return (
      <StoreShell>
        <PageSpinner label="Preparing checkout…" />
      </StoreShell>
    );
  }

  // Checkout is signed-in only; the API would 401 a guest anyway.
  if (!user) {
    return (
      <StoreShell>
        <Card>
          <CardBody>
            <ErrorState
              title="Sign in to check out"
              description="Your cart and your addresses live on your account."
              onRetry={() => router.push('/login?next=/checkout')}
            />
          </CardBody>
        </Card>
      </StoreShell>
    );
  }

  const items = cart?.items ?? [];
  const totals = cart?.totals;
  const coupon = cart?.coupon ?? null;

  if (!cartLoading && items.length === 0) {
    return (
      <StoreShell>
        <Card>
          <CardBody>
            <ErrorState
              title="Your cart is empty"
              description="Add something before checking out."
              onRetry={() => router.push('/products')}
            />
          </CardBody>
        </Card>
      </StoreShell>
    );
  }

  const place = async () => {
    if (!addressId) {
      alertError('Choose a shipping address', 'Add one below if your address book is empty.');
      return;
    }
    setPlacing(true);
    setError(null);
    setCancelledPayment(null);
    try {
      const order = await api.post<Order>('/orders/checkout', {
        shipping_address_id: addressId,
        payment_method: paymentMethod,
        coupon_code: couponCode ?? undefined,
        notes: notes.trim() || undefined,
      });

      // Gateway payments hand the customer to the provider's hosted page. Keep
      // the button in its loading state while the browser navigates away.
      if (paymentMethod === 'stripe') {
        if (!order.stripe?.checkout_url) {
          throw new Error('Stripe did not return a checkout page. Please try again.');
        }
        window.location.href = order.stripe.checkout_url;
        return;
      }

      if (paymentMethod === 'paypal') {
        if (!order.paypal?.approval_url) {
          throw new Error('PayPal did not return an approval page. Please try again.');
        }
        window.location.href = order.paypal.approval_url;
        return;
      }

      await alertSuccess('Order placed', `${order.order_number} is confirmed.`);
      router.push(`/account?tab=orders&placed=${order.id}`);
    } catch (cause) {
      if (cause instanceof ApiError && cause.details.length > 0) {
        setError(Object.values(cause.fieldErrors)[0]);
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not place the order');
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <StoreShell>
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to cart
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold text-sand-900 dark:text-sand-50">
            Checkout
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* -------------------------------------------------- address */}
            <Card>
              <CardHeader
                title="Where should it go?"
                action={<MapPin className="size-4 text-sand-400" aria-hidden />}
              />
              <CardBody className="flex flex-col gap-3">
                {addresses.length === 0 ? (
                  <div className="rounded-xl bg-[var(--surface-sunken)] p-4 text-sm">
                    <p className="font-medium text-sand-800 dark:text-sand-100">
                      No addresses on your account yet.
                    </p>
                    <p className="mt-1 text-muted">
                      Add one in your account settings, then come back.
                    </p>
                    <Link
                      href="/account?tab=addresses"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-clay-700 hover:underline dark:text-clay-400"
                    >
                      Go to addresses
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                ) : (
                  addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => setAddressId(address.id)}
                      aria-pressed={addressId === address.id}
                      className={
                        'flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ' +
                        (addressId === address.id
                          ? 'border-clay-500 bg-clay-50 dark:bg-clay-500/10'
                          : 'border-[var(--border-subtle)] hover:border-sand-300 dark:hover:border-walnut-700')
                      }
                    >
                      <span
                        className={
                          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 ' +
                          (addressId === address.id
                            ? 'border-clay-600 bg-clay-600'
                            : 'border-sand-300 dark:border-walnut-700')
                        }
                        aria-hidden
                      >
                        {addressId === address.id ? (
                          <span className="size-1.5 rounded-full bg-white" />
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-sand-900 dark:text-sand-50">
                          {address.full_name}
                          {address.is_default ? (
                            <span className="rounded-md bg-clay-100 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-clay-700 dark:bg-clay-500/15 dark:text-clay-300">
                              Default
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                          {address.address_line_1}
                          {address.address_line_2 ? `, ${address.address_line_2}` : ''}
                          <br />
                          {[address.city, address.province, address.postal_code]
                            .filter(Boolean)
                            .join(', ')}
                          {', '}
                          {address.country}
                          <br />
                          {address.phone}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </CardBody>
            </Card>

            {/* -------------------------------------------------- payment */}
            <Card>
              <CardHeader title="How would you like to pay?" />
              <CardBody className="flex flex-col gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={
                      'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ' +
                      (paymentMethod === method.value
                        ? 'border-clay-500 bg-clay-50 dark:bg-clay-500/10'
                        : 'border-[var(--border-subtle)] hover:border-sand-300 dark:hover:border-walnut-700')
                    }
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                      className="mt-1 size-4 accent-clay-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-sand-900 dark:text-sand-50">
                        {method.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">{method.hint}</span>
                    </span>
                  </label>
                ))}

                {cancelledPayment ? (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                    Your {cancelledPayment === 'stripe' ? 'card' : 'PayPal'} payment was cancelled.
                    Your basket is still here — choose a payment method and try again.
                  </p>
                ) : null}
              </CardBody>
            </Card>

            {/* ---------------------------------------------------- notes */}
            <Card>
              <CardHeader title="Delivery notes" description="Optional — gate codes, floor, timing." />
              <CardBody>
                <Field label="Notes for the courier">
                  <Textarea
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    maxLength={2000}
                    placeholder="Leave with the guard if I am not home."
                  />
                </Field>
              </CardBody>
            </Card>
          </div>

          {/* --------------------------------------------------- summary */}
          <div>
            <Card className="lg:sticky lg:top-24">
              <CardHeader title="Your order" />
              <CardBody className="flex flex-col gap-4">
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-sand-700 dark:text-sand-200">
                        {item.quantity} × {item.product_name}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums">
                        {formatMoney(item.line_total, 'PHP')}
                      </span>
                    </li>
                  ))}
                </ul>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (couponInput.trim()) void applyCoupon(couponInput);
                  }}
                  className="flex gap-2"
                >
                  <label className="flex flex-1 flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-sand-600 dark:text-sand-400">
                      Coupon
                    </span>
                    <input
                      value={couponInput}
                      onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                      placeholder="WELCOME10"
                      className="h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 font-mono text-sm uppercase focus:border-clay-500 focus:outline-none focus:ring-2 focus:ring-clay-500/25"
                    />
                  </label>
                  <Button type="submit" variant="outline" className="mt-auto h-10" disabled={!couponInput.trim()}>
                    <Tag className="size-4" />
                  </Button>
                </form>

                {couponCode ? (
                  <p className="flex items-center justify-between gap-2 rounded-lg bg-[var(--surface-sunken)] px-3 py-2 text-xs">
                    <span className="font-medium text-sand-700 dark:text-sand-200">{couponCode}</span>
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
                      {formatMoney(totals?.subtotal ?? '0', 'PHP')}
                    </dd>
                  </div>
                  {totals && num(totals.discount) > 0 ? (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <dt>Discount</dt>
                      <dd className="font-medium tabular-nums">− {formatMoney(totals.discount, 'PHP')}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <dt className="text-muted">Shipping</dt>
                    <dd className="font-medium tabular-nums">
                      {totals?.free_shipping ? 'Free' : formatMoney(totals?.shipping_fee ?? '0', 'PHP')}
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
                      {formatMoney(totals?.total ?? '0', 'PHP')}
                    </dd>
                  </div>
                </dl>

                {error ? (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                    {error}
                  </p>
                ) : null}

                <Button
                  className="w-full"
                  loading={placing}
                  disabled={!addressId}
                  onClick={() => void place()}
                >
                  <Lock className="size-4" aria-hidden />
                  {paymentMethod === 'stripe'
                    ? 'Pay with card'
                    : paymentMethod === 'paypal'
                      ? 'Continue to PayPal'
                      : 'Place order'}
                </Button>

                <p className="text-center text-[0.7rem] leading-relaxed text-muted">
                  By placing this order you agree to our terms. Nothing is charged until
                  {paymentMethod === 'cod' ? ' delivery.' : ' the payment is confirmed.'}
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
