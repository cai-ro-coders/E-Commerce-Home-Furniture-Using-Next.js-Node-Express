'use client';

/**
 * Payment return page for Stripe and PayPal.
 *
 * Stripe redirects here with `?order=<id>&session_id=cs_...`; PayPal appends
 * its `token` to `?order=<id>&provider=paypal`. Either way the backend verifies
 * the payment with the provider before marking the order paid, so a forged link
 * cannot confirm an unpaid order. Once settled, the cart is refreshed so the
 * header badge drops back to zero.
 */
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { StoreShell } from '@/components/storefront/StoreShell';
import { useStore } from '@/components/providers/StoreProvider';
import { LinkButton } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/format';
import type { Order } from '@/types';

export default function CheckoutSuccessPage() {
  return (
    <StoreShell>
      <Suspense fallback={<PageSpinner label="Confirming your payment…" />}>
        <PaymentReturn />
      </Suspense>
    </StoreShell>
  );
}

function PaymentReturn() {
  const params = useSearchParams();
  const { refreshCart } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const orderId = params.get('order');
  const sessionId = params.get('session_id');
  const paypalOrderId = params.get('token');
  const isPayPal = params.get('provider') === 'paypal';

  useEffect(() => {
    let cancelled = false;

    async function confirm() {
      const reference = isPayPal ? paypalOrderId : sessionId;
      if (!orderId || !reference) {
        if (!cancelled) {
          setError('This page is missing its payment reference. Check your orders to see the status.');
          setChecking(false);
        }
        return;
      }

      try {
        const result = isPayPal
          ? await api.post<Order>(`/orders/${orderId}/paypal/confirm`, {
              paypal_order_id: paypalOrderId,
            })
          : await api.post<Order>(`/orders/${orderId}/stripe/confirm`, {
              session_id: sessionId,
            });
        if (cancelled) return;
        setOrder(result);
        await refreshCart();
      } catch (cause) {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : 'Could not confirm the payment');
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void confirm();
    return () => {
      cancelled = true;
    };
  }, [orderId, sessionId, paypalOrderId, isPayPal, refreshCart]);

  if (checking) {
    return <PageSpinner label="Confirming your payment…" />;
  }

  if (error || !order) {
    return (
      <Card>
        <CardBody>
          <ErrorState
            title="We could not confirm your payment"
            description={error ?? 'The order could not be loaded.'}
          />
          <div className="flex flex-wrap justify-center gap-3 pb-6">
            <LinkButton href="/account?tab=orders" variant="outline">
              View my orders
            </LinkButton>
            <LinkButton href="/checkout">Back to checkout</LinkButton>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Card>
        <CardBody className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <CheckCircle2 className="size-7" aria-hidden />
          </span>

          <div className="flex flex-col gap-1">
            <h1 className="font-display text-2xl font-semibold text-sand-900 dark:text-sand-50">
              Payment received
            </h1>
            <p className="text-sm text-muted">
              Thank you — order{' '}
              <span className="font-semibold text-sand-800 dark:text-sand-100">
                {order.order_number}
              </span>{' '}
              is confirmed.
            </p>
          </div>

          <dl className="mt-2 flex w-full max-w-xs flex-col gap-2 border-t border-[var(--border-subtle)] pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Amount paid</dt>
              <dd className="font-semibold tabular-nums">
                {formatMoney(order.grand_total, order.currency ?? 'PHP')}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Payment</dt>
              <dd className="font-medium">{order.payment_status}</dd>
            </div>
          </dl>

          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <LinkButton href={`/account?tab=orders&placed=${order.id}`}>
              View my order
            </LinkButton>
            <LinkButton href="/products" variant="outline">
              Continue shopping
            </LinkButton>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
