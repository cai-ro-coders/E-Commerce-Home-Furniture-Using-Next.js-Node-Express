'use client';

/**
 * Customer order detail and tracking.
 *
 * The link from the account page ("Track and manage your orders") lands here.
 * The page is deliberately read-only: customers can watch the status the shop
 * sets, but every transition is still an admin action on
 * `/admin/orders/[id]`. The timeline uses `order.history`, which the API writes
 * on every status change, so no progress is guessed in the browser.
 */
import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Printer,
  RefreshCw,
  Truck,
  XCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { StoreShell } from '@/components/storefront/StoreShell';
import { useAuth } from '@/components/providers/AuthProvider';
import { printOrderReceipt } from '@/components/admin/orders/OrderReceipt';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { api, imageUrl } from '@/lib/api';
import { cn } from '@/lib/cn';
import {
  formatDateTime,
  formatMoney,
  num,
  orderStatusTag,
  paymentStatusTag,
} from '@/lib/format';
import {
  PAYMENT_METHOD_LABELS,
  type Order,
  type OrderStatus,
} from '@/types';

interface TrackingStep {
  status: OrderStatus;
  label: string;
  description: string;
  icon: LucideIcon;
}

const TRACKING_STEPS: TrackingStep[] = [
  {
    status: 'Pending',
    label: 'Placed',
    description: 'We have received your order and are confirming stock and payment.',
    icon: Clock,
  },
  {
    status: 'Processing',
    label: 'Preparing',
    description: 'Your pieces are being checked, packed and prepared for dispatch.',
    icon: Package,
  },
  {
    status: 'Shipped',
    label: 'On the way',
    description: 'Your order has left the studio and is on its way to you.',
    icon: Truck,
  },
  {
    status: 'Delivered',
    label: 'Delivered',
    description: 'Delivered — we hope it settles into your home beautifully.',
    icon: CheckCircle2,
  },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (quiet = false) => {
      if (quiet) setRefreshing(true);
      else setLoading(true);
      try {
        setOrder(await api.get<Order>(`/orders/${id}`));
        setError(null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not load this order');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  // Orders are private; send signed-out visitors through the login page and
  // bring them straight back once they are in.
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);
    }
  }, [authLoading, user, router, id]);

  if (authLoading || (!user && !error)) {
    return (
      <StoreShell>
        <PageSpinner label="Loading your order…" />
      </StoreShell>
    );
  }

  if (loading) {
    return (
      <StoreShell>
        <PageSpinner label="Loading your order…" />
      </StoreShell>
    );
  }

  if (error || !order) {
    return (
      <StoreShell>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
          <BackLink />
          <Card>
            <CardBody>
              <ErrorState
                title="We could not load this order"
                description={error ?? 'The order may have been removed, or it belongs to another account.'}
                onRetry={() => void load()}
              />
            </CardBody>
          </Card>
        </div>
      </StoreShell>
    );
  }

  const statusTag = orderStatusTag(order.order_status);
  const payTag = paymentStatusTag(order.payment_status);
  const items = order.items ?? [];
  const history = order.history ?? [];
  const address = order.shipping_address;
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <StoreShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-4">
          <BackLink />

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold text-sand-900 dark:text-sand-50">
                  Order {order.order_number}
                </h1>
                <Badge className={statusTag.className}>{statusTag.label}</Badge>
                <Badge className={payTag.className}>{payTag.label}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                Placed {formatDateTime(order.created_at)} · {itemCount} item
                {itemCount === 1 ? '' : 's'} · {formatMoney(order.grand_total, 'PHP')}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="size-3.5" />}
                loading={refreshing}
                onClick={() => void load(true)}
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Printer className="size-3.5" />}
                onClick={() => printOrderReceipt(order)}
              >
                Print receipt
              </Button>
            </div>
          </div>
        </div>

        <TrackingCard order={order} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <Card>
              <CardHeader
                title="Items"
                description={`${itemCount} item${itemCount === 1 ? '' : 's'} in this order`}
              />
              <CardBody className="p-0">
                {items.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-muted">
                    No line items were recorded for this order.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--border-subtle)]">
                    {items.map((item) => (
                      <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                        <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-sunken)]">
                          {item.product_image ? (
                            <img
                              src={imageUrl(item.product_image)}
                              alt={item.product_name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="flex size-full items-center justify-center font-display text-lg font-bold text-sand-300 dark:text-walnut-700">
                              {item.product_name.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-medium text-sand-900 dark:text-sand-50">
                            {item.product_name}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">SKU {item.sku}</p>
                          <p className="mt-1 text-xs text-muted">
                            {item.quantity} × {formatMoney(item.price, 'PHP')}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-semibold tabular-nums text-sand-900 dark:text-sand-50">
                          {formatMoney(item.total, 'PHP')}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Order updates"
                description="Every status change on this order, newest last"
              />
              <CardBody>
                {history.length === 0 ? (
                  <p className="text-sm text-muted">
                    No updates yet. We will record each step here as your order moves along.
                  </p>
                ) : (
                  <ol className="flex flex-col">
                    {history.map((entry, index) => {
                      const tag = orderStatusTag(entry.status);
                      const last = index === history.length - 1;
                      return (
                        <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
                          {!last ? (
                            <span
                              aria-hidden
                              className="absolute left-[7px] top-4 h-full w-px bg-[var(--border-subtle)]"
                            />
                          ) : null}
                          <span
                            className={cn(
                              'relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2',
                              last
                                ? 'border-clay-600 bg-clay-600'
                                : 'border-sand-300 bg-[var(--surface-raised)] dark:border-walnut-700'
                            )}
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={tag.className}>{tag.label}</Badge>
                              <span className="text-xs text-muted">
                                {formatDateTime(entry.created_at)}
                              </span>
                            </div>
                            {entry.note ? (
                              <p className="mt-1 text-sm text-sand-700 dark:text-sand-200">
                                {entry.note}
                              </p>
                            ) : null}
                            {entry.created_by_name ? (
                              <p className="mt-0.5 text-xs text-muted">
                                Updated by {entry.created_by_name}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader title="Order summary" />
              <CardBody>
                <dl className="flex flex-col gap-2 text-sm">
                  <SummaryLine label="Subtotal" value={formatMoney(order.subtotal, 'PHP')} />
                  {num(order.discount) > 0 ? (
                    <SummaryLine
                      label="Discount"
                      value={`− ${formatMoney(order.discount, 'PHP')}`}
                      tone="discount"
                    />
                  ) : null}
                  <SummaryLine label="Shipping" value={formatMoney(order.shipping_fee, 'PHP')} />
                  {num(order.tax) > 0 ? (
                    <SummaryLine label="Tax" value={formatMoney(order.tax, 'PHP')} />
                  ) : null}
                  <div className="mt-1 flex items-baseline justify-between border-t border-[var(--border-subtle)] pt-3">
                    <dt className="font-semibold text-sand-900 dark:text-sand-50">Total</dt>
                    <dd className="font-display text-lg font-semibold tabular-nums text-sand-900 dark:text-sand-50">
                      {formatMoney(order.grand_total, 'PHP')}
                    </dd>
                  </div>
                </dl>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Shipping address" />
              <CardBody>
                {address ? (
                  <address className="flex gap-3 not-italic">
                    <MapPin
                      className="mt-0.5 size-4 shrink-0 text-clay-600 dark:text-clay-400"
                      aria-hidden
                    />
                    <div className="text-sm leading-relaxed text-sand-700 dark:text-sand-200">
                      <p className="font-medium text-sand-900 dark:text-sand-50">
                        {address.full_name}
                      </p>
                      <p>{address.address_line_1}</p>
                      {address.address_line_2 ? <p>{address.address_line_2}</p> : null}
                      <p>
                        {[address.city, address.province, address.postal_code]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p>{address.country}</p>
                      <p className="mt-2 text-xs text-muted">{address.phone}</p>
                    </div>
                  </address>
                ) : (
                  <p className="text-sm text-muted">
                    No shipping address was saved for this order.
                  </p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Payment" />
              <CardBody>
                <dl className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-sm text-muted">Method</dt>
                    <dd className="flex items-center gap-2 text-sm font-medium text-sand-900 dark:text-sand-50">
                      <CreditCard className="size-4 text-clay-600 dark:text-clay-400" aria-hidden />
                      {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-sm text-muted">Status</dt>
                    <dd>
                      <Badge className={payTag.className}>{payTag.label}</Badge>
                    </dd>
                  </div>
                  {order.payment?.transaction_id ? (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-sm text-muted">Reference</dt>
                      <dd className="font-mono text-xs text-sand-700 dark:text-sand-200">
                        {order.payment.transaction_id}
                      </dd>
                    </div>
                  ) : null}
                  {order.payment?.paid_at ? (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-sm text-muted">Paid</dt>
                      <dd className="text-sm text-sand-700 dark:text-sand-200">
                        {formatDateTime(order.payment.paid_at)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </CardBody>
            </Card>

            {order.notes ? (
              <Card>
                <CardHeader title="Order notes" />
                <CardBody>
                  <p className="text-sm leading-relaxed text-sand-700 dark:text-sand-200">
                    {order.notes}
                  </p>
                </CardBody>
              </Card>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] px-5 py-4">
          <p className="text-sm text-muted">
            Need to change something? Keep your order number handy — {order.order_number}.
          </p>
          <Link href="/account?tab=orders">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="size-3.5" />}>
              Back to my orders
            </Button>
          </Link>
        </div>
      </div>
    </StoreShell>
  );
}

/* ---------------------------------------------------------------- pieces */

function BackLink() {
  return (
    <Link
      href="/account?tab=orders"
      className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300 dark:hover:text-clay-400"
    >
      <ArrowLeft className="size-4" aria-hidden />
      My orders
    </Link>
  );
}

function SummaryLine({
  label,
  value,
  tone = 'default',
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: 'default' | 'discount';
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd
        className={cn(
          'tabular-nums',
          tone === 'discount'
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-sand-800 dark:text-sand-200'
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function TrackingCard({ order }: { order: Order }) {
  const currentIndex = TRACKING_STEPS.findIndex((step) => step.status === order.order_status);
  const closed = order.order_status === 'Cancelled' || order.order_status === 'Returned';
  const activeStep = currentIndex >= 0 ? TRACKING_STEPS[currentIndex] : null;
  const tag = orderStatusTag(order.order_status);
  const progress =
    currentIndex > 0 ? (currentIndex / (TRACKING_STEPS.length - 1)) * 100 : 0;

  return (
    <Card>
      <CardHeader
        title="Track your order"
        description={
          closed
            ? 'This order is no longer moving through fulfilment.'
            : 'Follow your order from our studio to your door.'
        }
        action={<Badge className={tag.className}>{tag.label}</Badge>}
      />
      <CardBody>
        {closed ? (
          <div className="flex items-start gap-3 rounded-xl bg-rose-50 px-4 py-3 dark:bg-rose-500/10">
            <XCircle className="mt-0.5 size-5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-sand-900 dark:text-sand-50">
                This order was {order.order_status.toLowerCase()}.
              </p>
              <p className="mt-0.5 text-sm text-muted">
                The updates below show everything that happened to it. If you have questions,
                contact the studio with your order number.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-x-[12.5%] top-4 h-0.5 -translate-y-1/2 bg-[var(--border-subtle)]"
              >
                <div
                  className="h-full bg-clay-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <ol className="relative flex items-start">
                {TRACKING_STEPS.map((step, index) => {
                  const reached = currentIndex >= 0 && index <= currentIndex;
                  const active = index === currentIndex;
                  const Icon = step.icon;
                  return (
                    <li
                      key={step.status}
                      className="relative z-10 flex flex-1 flex-col items-center text-center"
                    >
                      <span
                        className={cn(
                          'flex size-8 items-center justify-center rounded-full border-2 transition-colors',
                          reached
                            ? 'border-clay-600 bg-clay-600 text-white'
                            : 'border-sand-300 bg-[var(--surface-raised)] text-sand-400 dark:border-walnut-700 dark:text-sand-500',
                          active && 'ring-4 ring-clay-100 dark:ring-clay-500/20'
                        )}
                      >
                        {reached ? (
                          <Check className="size-4" strokeWidth={3} aria-hidden />
                        ) : (
                          <Icon className="size-4" aria-hidden />
                        )}
                      </span>
                      <span
                        className={cn(
                          'mt-2 text-xs font-medium',
                          reached ? 'text-sand-900 dark:text-sand-50' : 'text-muted'
                        )}
                      >
                        {step.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {activeStep ? <TrackingHint step={activeStep} /> : null}
          </>
        )}
      </CardBody>
    </Card>
  );
}

function TrackingHint({ step }: { step: TrackingStep }) {
  const Icon = step.icon;
  return (
    <p className="mt-5 flex items-start gap-2 rounded-xl bg-[var(--surface-sunken)] px-4 py-3 text-sm text-muted">
      <Icon className="mt-0.5 size-4 shrink-0 text-clay-600 dark:text-clay-400" aria-hidden />
      {step.description}
    </p>
  );
}
