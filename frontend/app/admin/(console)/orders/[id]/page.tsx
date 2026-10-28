'use client';

/**
 * Order detail.
 *
 * The status timeline is the primary tool here: every transition is a row in
 * `order_status_history` written by the API, so the page never keeps a
 * client-side guess of where an order is. The "advance" control posts a status
 * and then refetches, which keeps the timeline authoritative.
 */
import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Mail,
  Pencil,
  Printer,
  RefreshCw,
  Trash2,
  Truck,
} from 'lucide-react';
import { OrderReceipt, printOrderReceipt } from '@/components/admin/orders/OrderReceipt';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, DetailItem } from '@/components/ui/Card';
import { Field, Select, Textarea } from '@/components/ui/Field';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { api, imageUrl } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import { cn } from '@/lib/cn';
import {
  formatDateTime,
  formatMoney,
  formatNumber,
  num,
  orderStatusTag,
  paymentStatusTag,
  timeAgo,
} from '@/lib/format';
import {
  ORDER_STATUSES,
  PAYMENT_METHOD_LABELS,
  type Order,
  type OrderStatus,
} from '@/types';

const TIMELINE: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setOrder(await api.get<Order>(`/orders/${id}`));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeStatus = async (status: OrderStatus) => {
    if (status === order?.order_status) return;
    const changesMoney = status === 'Cancelled' || status === 'Returned';
    if (changesMoney) {
      const confirmed = await confirmAction({
        title: `Mark this order ${status.toLowerCase()}?`,
        text:
          status === 'Cancelled'
            ? 'Stock returns to the shelf and the payment is flagged for review.'
            : 'The customer is credited and the units go back into stock.',
        confirmText: `Mark ${status.toLowerCase()}`,
      });
      if (!confirmed) return;
    }

    setBusy(true);
    try {
      await api.patch(`/orders/${id}/status`, { order_status: status });
      toastSuccess(`Order marked ${status.toLowerCase()}`);
      await load();
    } catch (cause) {
      alertError('Could not update the order', message(cause));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!order) return;
    const confirmed = await confirmAction({
      title: `Delete ${order.order_number}?`,
      text: 'The order and its line items are removed permanently.',
      confirmText: 'Delete order',
    });
    if (!confirmed) return;
    try {
      await api.delete(`/orders/${order.id}`);
      toastSuccess(`${order.order_number} was deleted`);
      router.push('/admin/orders');
    } catch (cause) {
      alertError('Could not delete the order', message(cause));
    }
  };

  if (loading) return <PageSpinner label="Loading order…" />;

  if (error || !order) {
    return (
      <Card>
        <CardBody>
          <ErrorState
            title="The order could not load"
            description={error ?? undefined}
            onRetry={() => window.location.reload()}
          />
        </CardBody>
      </Card>
    );
  }

  const statusTag = orderStatusTag(order.order_status);
  const payTag = paymentStatusTag(order.payment_status);
  const address = order.shipping_address;
  const items = order.items ?? [];
  const history = order.history ?? [];
  const currentStep = TIMELINE.indexOf(order.order_status);

  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------------------ head */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/orders"
            aria-label="Back to orders"
            className="mt-1 rounded-lg p-1.5 text-sand-500 transition-colors hover:bg-sand-100 hover:text-clay-700 dark:hover:bg-walnut-800"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-sand-900 dark:text-sand-50">
                {order.order_number}
              </h1>
              <Badge className={statusTag.className}>{statusTag.label}</Badge>
              <Badge className={payTag.className}>{payTag.label}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              Placed {formatDateTime(order.created_at)} ·{' '}
              {formatMoney(order.grand_total, 'PHP')} ·{' '}
              {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="size-3.5" />}
            onClick={() => void load()}
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
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="size-3.5" />}
            onClick={() => void remove()}
            className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            Delete
          </Button>
          <Button
            size="sm"
            leftIcon={<Pencil className="size-3.5" />}
            onClick={() => router.push(`/admin/orders/${order.id}/edit`)}
          >
            Edit order
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------- timeline */}
      {order.order_status === 'Cancelled' || order.order_status === 'Returned' ? null : (
        <Card>
          <CardHeader title="Fulfilment" description="The step this order is at" />
          <CardBody>
            <ol className="flex flex-wrap items-center gap-2">
              {TIMELINE.map((step, index) => {
                const done = index <= currentStep;
                const active = index === currentStep;
                return (
                  <li key={step} className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void changeStatus(step)}
                      className={cn(
                        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        active
                          ? 'border-clay-500 bg-clay-50 text-clay-800 dark:bg-clay-500/10 dark:text-clay-300'
                          : done
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                            : 'border-sand-200 text-sand-500 hover:bg-sand-50 dark:border-walnut-800 dark:text-sand-400 dark:hover:bg-walnut-800'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-4 items-center justify-center rounded-full text-[0.6rem] font-bold',
                          done ? 'bg-current/15' : 'bg-sand-200 dark:bg-walnut-700'
                        )}
                      >
                        {index + 1}
                      </span>
                      {step}
                    </button>
                    {index < TIMELINE.length - 1 ? (
                      <span className="text-sand-300 dark:text-walnut-800" aria-hidden>
                        →
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border-subtle)] pt-4">
              <span className="text-xs font-medium text-muted">Other:</span>
              {(['Cancelled', 'Returned'] as OrderStatus[])
                .filter((status) => status !== order.order_status)
                .map((status) => (
                  <Button
                    key={status}
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => void changeStatus(status)}
                    className={
                      status === 'Cancelled'
                        ? 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10'
                        : 'text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10'
                    }
                  >
                    Mark {status.toLowerCase()}
                  </Button>
                ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          {/* ---------------------------------------------------- items */}
          <Card>
            <CardHeader
              title="Items"
              description={`${items.length} line${items.length === 1 ? '' : 's'}`}
            />
            <CardBody className="p-0">
              {items.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted">No line items.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] text-left text-[0.7rem] uppercase tracking-wide text-muted">
                        <th className="px-5 py-2.5 font-semibold">Product</th>
                        <th className="px-3 py-2.5 font-semibold">SKU</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Price</th>
                        <th className="px-3 py-2.5 text-right font-semibold">Qty</th>
                        <th className="px-5 py-2.5 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)]">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-5 py-3">
                            <span className="flex items-center gap-3">
                              {item.product_image ? (
                                <img
                                  src={imageUrl(item.product_image)}
                                  alt=""
                                  width={36}
                                  height={36}
                                  className="size-9 shrink-0 rounded-lg border border-[var(--border-subtle)] object-cover"
                                />
                              ) : null}
                              {item.product_id ? (
                                <Link
                                  href={`/admin/products/${item.product_id}`}
                                  className="font-medium text-sand-800 hover:text-clay-700 dark:text-sand-100 dark:hover:text-clay-400"
                                >
                                  {item.product_name}
                                </Link>
                              ) : (
                                <span className="font-medium text-sand-800 dark:text-sand-100">
                                  {item.product_name}
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-muted">{item.sku}</td>
                          <td className="px-3 py-3 text-right tabular-nums text-sand-700 dark:text-sand-200">
                            {formatMoney(item.price, 'PHP')}
                          </td>
                          <td className="px-3 py-3 text-right tabular-nums text-sand-700 dark:text-sand-200">
                            {formatNumber(item.quantity)}
                          </td>
                          <td className="px-5 py-3 text-right font-semibold tabular-nums text-sand-800 dark:text-sand-100">
                            {formatMoney(item.total, 'PHP')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>

          {/* --------------------------------------------------- receipt */}
          <Card>
            <CardHeader
              title="Receipt"
              description="Exactly what the printer produces."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer className="size-3.5" />}
                  onClick={() => printOrderReceipt(order)}
                >
                  Print
                </Button>
              }
            />
            <CardBody className="bg-white">
              <OrderReceipt order={order} />
            </CardBody>
          </Card>
        </div>

        {/* ----------------------------------------------------- side rail */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Customer" />
            <CardBody className="flex flex-col gap-3">
              {order.customer_name ? (
                <div className="flex items-center gap-3">
                  <Avatar src={order.customer_avatar} name={order.customer_name} />
                  <div className="min-w-0">
                    {order.user_id ? (
                      <Link
                        href={`/admin/customers?search=${encodeURIComponent(order.customer_email ?? '')}`}
                        className="block truncate text-sm font-medium text-sand-800 hover:text-clay-700 dark:text-sand-100 dark:hover:text-clay-400"
                      >
                        {order.customer_name}
                      </Link>
                    ) : (
                      <p className="truncate text-sm font-medium text-sand-800 dark:text-sand-100">
                        {order.customer_name}
                      </p>
                    )}
                    <p className="truncate text-xs text-muted">{order.customer_email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">Guest checkout</p>
              )}

              {order.customer_email ? (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Mail className="size-3.5" />}
                  onClick={() => {
                    window.location.href = `mailto:${order.customer_email}?subject=${encodeURIComponent(
                      `Your order ${order.order_number}`
                    )}`;
                  }}
                >
                  Email the customer
                </Button>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Ship to"
              action={
                <Truck className="size-4 text-sand-400" aria-hidden />
              }
            />
            <CardBody>
              {address ? (
                <address className="not-italic text-sm leading-relaxed text-sand-700 dark:text-sand-200">
                  <span className="block font-medium">{address.full_name}</span>
                  <span className="block">{address.address_line_1}</span>
                  {address.address_line_2 ? (
                    <span className="block">{address.address_line_2}</span>
                  ) : null}
                  <span className="block">
                    {[address.city, address.province, address.postal_code]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                  <span className="block">{address.country}</span>
                  <span className="mt-1 block text-xs text-muted">{address.phone}</span>
                </address>
              ) : (
                <p className="text-sm text-muted">
                  {order.city
                    ? `${order.city}${order.province ? `, ${order.province}` : ''}`
                    : 'No address recorded.'}
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Totals" />
            <CardBody>
              <dl className="flex flex-col gap-2 text-sm">
                <Money label="Subtotal" value={order.subtotal} />
                {num(order.discount) > 0 ? (
                  <Money label="Discount" value={`− ${formatMoney(order.discount, 'PHP')}`} />
                ) : null}
                <Money label="Shipping" value={order.shipping_fee} />
                {num(order.tax) > 0 ? <Money label="Tax" value={order.tax} /> : null}
                <div className="mt-1 flex items-baseline justify-between border-t border-[var(--border-subtle)] pt-2.5">
                  <dt className="font-semibold text-sand-800 dark:text-sand-100">Total</dt>
                  <dd className="font-display text-lg font-semibold tabular-nums text-clay-700 dark:text-clay-400">
                    {formatMoney(order.grand_total, 'PHP')}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Payment" />
            <CardBody>
              <dl className="divide-y divide-[var(--border-subtle)]">
                <DetailItem
                  className="py-2.5"
                  label="Method"
                  value={PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}
                />
                <DetailItem
                  className="py-2.5"
                  label="Status"
                  value={<Badge className={payTag.className}>{payTag.label}</Badge>}
                />
                <DetailItem
                  className="py-2.5"
                  label="Transaction"
                  value={order.payment?.transaction_id ?? '—'}
                />
                <DetailItem
                  className="py-2.5"
                  label="Gateway"
                  value={order.payment?.payment_gateway ?? '—'}
                />
                <DetailItem
                  className="py-2.5"
                  label="Paid at"
                  value={order.payment?.paid_at ? formatDateTime(order.payment.paid_at) : '—'}
                />
              </dl>
              {order.notes ? (
                <p className="mt-3 rounded-lg bg-[var(--surface-sunken)] px-3 py-2 text-xs text-sand-600 dark:text-sand-300">
                  {order.notes}
                </p>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Status history" description={`${history.length} entries`} />
            <CardBody>
              {history.length === 0 ? (
                <p className="text-sm text-muted">Nothing recorded yet.</p>
              ) : (
                <ol className="relative flex flex-col gap-4 border-l border-[var(--border-subtle)] pl-4">
                  {history.map((entry) => {
                    const tag = orderStatusTag(entry.status);
                    return (
                      <li key={entry.id} className="relative">
                        <span
                          className={cn(
                            'absolute -left-[1.3rem] top-1 size-2.5 rounded-full ring-4 ring-[var(--surface-raised)]',
                            entry.status === 'Cancelled' || entry.status === 'Returned'
                              ? 'bg-rose-500'
                              : entry.status === 'Delivered'
                                ? 'bg-emerald-500'
                                : 'bg-clay-500'
                          )}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={tag.className}>{tag.label}</Badge>
                          <span className="text-[0.7rem] text-muted" title={formatDateTime(entry.created_at)}>
                            {timeAgo(entry.created_at)}
                          </span>
                        </div>
                        {entry.note ? (
                          <p className="mt-1 text-xs text-sand-600 dark:text-sand-300">{entry.note}</p>
                        ) : null}
                        {entry.created_by_name ? (
                          <p className="mt-0.5 text-[0.7rem] text-muted">by {entry.created_by_name}</p>
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Add a note to the timeline" />
            <CardBody className="flex flex-col gap-3">
              <NoteForm
                disabled={busy}
                onSubmit={async (status, note) => {
                  setBusy(true);
                  try {
                    await api.post(`/orders/${order.id}/history`, { status, note });
                    toastSuccess('Note added');
                    await load();
                  } catch (cause) {
                    alertError('Could not add the note', message(cause));
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Money({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums text-sand-700 dark:text-sand-200">
        {typeof value === 'string' ? value : formatMoney(value, 'PHP')}
      </dd>
    </div>
  );
}

/** Appends a hand-written entry, which is how a delay gets explained. */
function NoteForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (status: OrderStatus, note: string) => Promise<void>;
  disabled: boolean;
}) {
  const [status, setStatus] = useState<OrderStatus>('Processing');
  const [note, setNote] = useState('');

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!note.trim()) return;
        void onSubmit(status, note.trim());
        setNote('');
      }}
    >
      <Field label="Against status">
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
        >
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Note">
        <Textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={255}
          placeholder="Called the customer; delivery booked for Friday."
        />
      </Field>
      <Button type="submit" size="sm" disabled={disabled || !note.trim()}>
        Add note
      </Button>
    </form>
  );
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
