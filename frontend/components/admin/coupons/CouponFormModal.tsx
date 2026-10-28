'use client';

/**
 * Create/edit form for a coupon, rendered inside the list page's modal.
 *
 * The value field is the trap in this form: a percentage and a fixed amount
 * share one column, so the input switches type and step with the type, and the
 * maximum-discount cap only makes sense for a percentage. The window is a pair
 * of dates because the API takes `start_date`/`end_date` and rejects an end
 * before the start.
 */
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { ApiError, api } from '@/lib/api';
import { alertSuccess } from '@/lib/alerts';
import { formatMoney, num } from '@/lib/format';
import type { Coupon, CouponType } from '@/types';

/** `YYYY-MM-DD` — the shape an `<input type="date">` and the API both want. */
function toDateInput(value: string): string {
  return value ? value.slice(0, 10) : '';
}

/**
 * Default window for a new coupon: today through a month out.
 *
 * Computed at module scope rather than in the component because reading the
 * clock is impure and React's compiler rules reject it mid-render. A page that
 * stayed open across midnight would offer yesterday's date; the operator can
 * always change it.
 */
const DEFAULT_START = new Date().toISOString().slice(0, 10);
const DEFAULT_END = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

export function CouponFormModal({
  coupon,
  onClose,
  onSaved,
}: {
  /** Omit to create. */
  coupon?: Coupon;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(coupon);

  const [form, setForm] = useState({
    code: coupon?.code ?? '',
    type: (coupon?.type ?? 'percentage') as CouponType,
    value: coupon ? String(num(coupon.value)) : '',
    minimum_order: coupon ? String(num(coupon.minimum_order)) : '0',
    maximum_discount: coupon?.maximum_discount ? String(num(coupon.maximum_discount)) : '',
    usage_limit: coupon?.usage_limit !== null && coupon?.usage_limit !== undefined
      ? String(coupon.usage_limit)
      : '',
    start_date: coupon ? toDateInput(coupon.start_date) : DEFAULT_START,
    end_date: coupon ? toDateInput(coupon.end_date) : DEFAULT_END,
    status: coupon?.status ?? ('active' as 'active' | 'inactive' | 'expired'),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!coupon) return;
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: String(num(coupon.value)),
      minimum_order: String(num(coupon.minimum_order)),
      maximum_discount: coupon.maximum_discount ? String(num(coupon.maximum_discount)) : '',
      usage_limit:
        coupon.usage_limit !== null && coupon.usage_limit !== undefined
          ? String(coupon.usage_limit)
          : '',
      start_date: toDateInput(coupon.start_date),
      end_date: toDateInput(coupon.end_date),
      status: coupon.status,
    });
    setErrors({});
  }, [coupon]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const { [key]: _cleared, ...rest } = current;
      return rest;
    });
  };

  const isPercentage = form.type === 'percentage';
  const value = num(form.value);

  /** What a shopper actually pays, worked out for the preview line. */
  const preview = useMemo(() => {
    const basket = 8000;
    const discount = isPercentage
      ? Math.min(
          (basket * value) / 100,
          form.maximum_discount ? num(form.maximum_discount) : Number.POSITIVE_INFINITY
        )
      : value;
    return {
      basket,
      discount,
      total: Math.max(0, basket - discount),
    };
  }, [isPercentage, value, form.maximum_discount]);

  const invalid =
    !form.code.trim() ||
    value <= 0 ||
    (isPercentage && value > 100) ||
    !form.start_date ||
    !form.end_date ||
    form.end_date < form.start_date;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (invalid) return;
    setSaving(true);
    setErrors({});
    setError(null);

    const payload: Record<string, unknown> = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value,
      minimum_order: num(form.minimum_order),
      start_date: form.start_date,
      end_date: form.end_date,
      status: form.status,
    };
    if (form.maximum_discount) payload.maximum_discount = num(form.maximum_discount);
    if (form.usage_limit) payload.usage_limit = Number(form.usage_limit);

    try {
      if (isEdit && coupon) {
        await api.put(`/coupons/${coupon.id}`, payload);
        await alertSuccess('Coupon saved', `${payload.code} is up to date.`);
      } else {
        await api.post('/coupons', payload);
        await alertSuccess('Coupon created', `${payload.code} is ready to use.`);
      }
      onSaved();
    } catch (cause) {
      if (cause instanceof ApiError && cause.details.length > 0) {
        setErrors(cause.fieldErrors);
        setError(Object.values(cause.fieldErrors)[0]);
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not save the coupon');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      locked={saving}
      size="lg"
      title={isEdit ? `Edit ${coupon!.code}` : 'New coupon'}
      description="Codes are matched case-insensitively at checkout."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="coupon-form" loading={saving} disabled={invalid}>
            {isEdit ? 'Save coupon' : 'Create coupon'}
          </Button>
        </>
      }
    >
      <form id="coupon-form" onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Code"
            required
            error={errors.code}
            hint="Letters, numbers, dashes and underscores."
          >
            <Input
              value={form.code}
              onChange={(event) => set('code', event.target.value.toUpperCase())}
              maxLength={40}
              required
              placeholder="WELCOME10"
              className="font-mono uppercase tracking-wide"
            />
          </Field>

          <Field label="Type" required error={errors.type}>
            <Select
              value={form.type}
              onChange={(event) => set('type', event.target.value as CouponType)}
            >
              <option value="percentage">Percentage off the subtotal</option>
              <option value="fixed">Fixed amount off the subtotal</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field
            label={isPercentage ? 'Percent off' : 'Amount off'}
            required
            error={errors.value}
          >
            <Input
              type="number"
              min={0}
              step={isPercentage ? '1' : '0.01'}
              max={isPercentage ? 100 : undefined}
              inputMode="decimal"
              value={form.value}
              onChange={(event) => set('value', event.target.value)}
              required
              placeholder={isPercentage ? '10' : '500'}
            />
          </Field>

          <Field label="Minimum order" error={errors.minimum_order}>
            <Input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={form.minimum_order}
              onChange={(event) => set('minimum_order', event.target.value)}
            />
          </Field>

          <Field
            label="Cap the discount at"
            error={errors.maximum_discount}
            hint={isPercentage ? 'Optional ceiling.' : 'A fixed amount needs no cap.'}
          >
            <Input
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              value={form.maximum_discount}
              onChange={(event) => set('maximum_discount', event.target.value)}
              disabled={!isPercentage}
              placeholder="No cap"
            />
          </Field>
        </div>

        {/* Worked example, so an operator can sanity-check a percentage. */}
        <dl className="grid grid-cols-3 gap-3 rounded-xl bg-[var(--surface-sunken)] px-4 py-3 text-sm">
          <div>
            <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
              Example basket
            </dt>
            <dd className="font-semibold tabular-nums text-sand-800 dark:text-sand-100">
              {formatMoney(preview.basket, 'PHP')}
            </dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
              Discount
            </dt>
            <dd className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              − {formatMoney(preview.discount, 'PHP')}
            </dd>
          </div>
          <div>
            <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
              Pays
            </dt>
            <dd className="font-semibold tabular-nums text-clay-700 dark:text-clay-400">
              {formatMoney(preview.total, 'PHP')}
            </dd>
          </div>
        </dl>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Starts" required error={errors.start_date}>
            <Input
              type="date"
              value={form.start_date}
              onChange={(event) => set('start_date', event.target.value)}
              required
            />
          </Field>

          <Field label="Ends" required error={errors.end_date}>
            <Input
              type="date"
              value={form.end_date}
              min={form.start_date}
              onChange={(event) => set('end_date', event.target.value)}
              required
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Usage limit"
            error={errors.usage_limit}
            hint="Blank means unlimited redemptions."
          >
            <Input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={form.usage_limit}
              onChange={(event) => set('usage_limit', event.target.value)}
              placeholder="Unlimited"
            />
          </Field>

          <Field label="Status" error={errors.status}>
            <Select
              value={form.status}
              onChange={(event) =>
                set('status', event.target.value as 'active' | 'inactive' | 'expired')
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive — not offered at checkout</option>
              <option value="expired">Expired</option>
            </Select>
          </Field>
        </div>

        {form.end_date < form.start_date ? (
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            The end date is before the start date, so the coupon can never be used.
          </p>
        ) : null}

        {error && Object.keys(errors).length === 0 ? (
          <p className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
