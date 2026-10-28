'use client';

/**
 * Order edit.
 *
 * Deliberately narrow: the line items are immutable (a change is a new order),
 * and the money is recalculated by the API rather than in the browser. This form
 * only moves what an operator can legitimately correct — status, payment,
 * shipping cost, tax, discount and notes.
 */
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ChevronLeft, Save } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { ApiError, api } from '@/lib/api';
import { alertError, alertSuccess } from '@/lib/alerts';
import { formatMoney, num, orderStatusTag, paymentStatusTag } from '@/lib/format';
import {
  ORDER_STATUSES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUSES,
  type Order,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from '@/types';

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [form, setForm] = useState({
    order_status: 'Pending' as OrderStatus,
    payment_status: 'Pending' as PaymentStatus,
    payment_method: 'cod' as PaymentMethod,
    shipping_fee: '',
    tax: '',
    discount: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const record = await api.get<Order>(`/orders/${id}`);
      setOrder(record);
      setForm({
        order_status: record.order_status,
        payment_status: record.payment_status,
        payment_method: record.payment_method,
        shipping_fee: String(num(record.shipping_fee)),
        tax: String(num(record.tax)),
        discount: String(num(record.discount)),
        notes: record.notes ?? '',
      });
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

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const { [key]: _removed, ...rest } = current;
      return rest;
    });
  };

  // What the order will total once the figures below are applied.
  const projected = useMemo(() => {
    const subtotal = num(order?.subtotal);
    const shipping = num(form.shipping_fee);
    const taxAmount = num(form.tax);
    const discount = num(form.discount);
    return Math.max(0, subtotal - discount + shipping + taxAmount);
  }, [order?.subtotal, form.shipping_fee, form.tax, form.discount]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      await api.put(`/orders/${id}`, {
        order_status: form.order_status,
        payment_status: form.payment_status,
        payment_method: form.payment_method,
        shipping_fee: num(form.shipping_fee),
        tax: num(form.tax),
        discount: num(form.discount),
        notes: form.notes.trim() || undefined,
      });
      alertSuccess('Order saved', `${order?.order_number} is up to date.`);
      router.push(`/admin/orders/${id}`);
    } catch (cause) {
      if (cause instanceof ApiError && cause.details.length > 0) {
        setErrors(cause.fieldErrors);
        alertError('Check the form', Object.values(cause.fieldErrors)[0]);
      } else {
        alertError('Could not save the order', cause instanceof Error ? cause.message : 'Unknown error');
      }
    } finally {
      setSaving(false);
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

  const statusTag = orderStatusTag(form.order_status);
  const payTag = paymentStatusTag(form.payment_status);
  const changed = num(projected) !== num(order.grand_total);

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <PageHeaderLike
        title={`Edit ${order.order_number}`}
        description="Line items are fixed once an order exists. Correct the state, the money or the note."
        backHref={`/admin/orders/${order.id}`}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card>
            <CardHeader title="State" description="Fulfilment and payment." />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Fulfilment status" required error={errors.order_status}>
                <Select
                  value={form.order_status}
                  onChange={(event) => set('order_status', event.target.value as OrderStatus)}
                >
                  {ORDER_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Payment status" required error={errors.payment_status}>
                <Select
                  value={form.payment_status}
                  onChange={(event) => set('payment_status', event.target.value as PaymentStatus)}
                >
                  {PAYMENT_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Payment method" error={errors.payment_method} className="sm:col-span-2">
                <Select
                  value={form.payment_method}
                  onChange={(event) => set('payment_method', event.target.value as PaymentMethod)}
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                <span className="text-xs text-muted">Will become:</span>
                <Badge className={statusTag.className}>{statusTag.label}</Badge>
                <Badge className={payTag.className}>{payTag.label}</Badge>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Notes"
              description="Shown on the receipt and to the customer."
            />
            <CardBody>
              <Field label="Note" error={errors.notes}>
                <Textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) => set('notes', event.target.value)}
                  maxLength={2000}
                  placeholder="Deliver before Friday; customer will be home after 4pm."
                />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Line items"
              description="Fixed. To change what was sold, cancel and place a new order."
            />
            <CardBody className="p-0">
              <ul className="divide-y divide-[var(--border-subtle)]">
                {(order.items ?? []).map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-sand-800 dark:text-sand-100">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-muted">
                        {item.sku} · {item.quantity} × {formatMoney(item.price, 'PHP')}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-sand-800 dark:text-sand-100">
                      {formatMoney(item.total, 'PHP')}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Amounts" description="Override the recorded figures." />
            <CardBody className="flex flex-col gap-4">
              <Field label="Subtotal" hint="From the line items. Not editable.">
                <Input value={formatMoney(order.subtotal, 'PHP')} disabled readOnly />
              </Field>
              <Field label="Discount" error={errors.discount}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={form.discount}
                  onChange={(event) => set('discount', event.target.value)}
                />
              </Field>
              <Field label="Shipping" error={errors.shipping_fee}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={form.shipping_fee}
                  onChange={(event) => set('shipping_fee', event.target.value)}
                />
              </Field>
              <Field label="Tax" error={errors.tax}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={form.tax}
                  onChange={(event) => set('tax', event.target.value)}
                />
              </Field>

              <div className="flex items-baseline justify-between rounded-lg bg-[var(--surface-sunken)] px-3 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  New total
                </span>
                <span className="font-display text-lg font-semibold tabular-nums text-clay-700 dark:text-clay-400">
                  {formatMoney(projected, 'PHP')}
                </span>
              </div>

              {changed ? (
                <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span>
                    This differs from the recorded {formatMoney(order.grand_total, 'PHP')}. The
                    change is applied on save.
                  </span>
                </p>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Customer" />
            <CardBody className="flex items-center gap-3">
              <Avatar src={order.customer_avatar} name={order.customer_name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-sand-800 dark:text-sand-100">
                  {order.customer_name ?? 'Guest customer'}
                </p>
                <p className="truncate text-xs text-muted">{order.customer_email ?? '—'}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push(`/admin/orders/${order.id}`)}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" leftIcon={<Save className="size-4" />} loading={saving}>
          Save order
        </Button>
      </div>
    </form>
  );
}

function PageHeaderLike({
  title,
  description,
  backHref,
}: {
  title: string;
  description: string;
  backHref: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-xl font-semibold text-sand-900 dark:text-sand-50">
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <Link
        href={backHref}
        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to order
      </Link>
    </div>
  );
}
