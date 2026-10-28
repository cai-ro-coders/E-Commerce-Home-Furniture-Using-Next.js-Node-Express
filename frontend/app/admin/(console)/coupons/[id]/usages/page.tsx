'use client';

/**
 * Coupon redemptions.
 *
 * A coupon's usage list is a DataTable like every other module, so this page is
 * mostly a header that explains the coupon and a grid over `/coupons/:id/usages`.
 */
import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { api } from '@/lib/api';
import { formatDateTime, formatMoney, formatNumber, num } from '@/lib/format';
import { money, text, type CellAction } from '@/lib/tableHtml';
import { BRAND } from '@/lib/nav';
import type { Coupon, CouponUsage } from '@/types';

export default function CouponUsagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setCoupon(await api.get<Coupon>(`/coupons/${id}`));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the coupon');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const columns: DataTableColumn<CouponUsage>[] = [
    {
      data: 'order_number',
      title: 'Order',
      sortable: true,
      render: (row) =>
        row.order_id
          ? `<a href="/admin/orders/${row.order_id}" class="font-semibold text-clay-700 hover:underline dark:text-clay-400">${text(row.order_number ?? '—')}</a>`
          : `<span class="text-xs">${text(row.order_number ?? 'Deleted order')}</span>`,
      exportValue: (row) => row.order_number ?? '',
    },
    {
      data: 'customer_name',
      title: 'Customer',
      sortable: true,
      render: (row) =>
        row.user_id
          ? `<a href="/admin/customers/${row.user_id}" class="text-xs font-medium text-sand-800 hover:text-clay-700 dark:text-sand-100 dark:hover:text-clay-400">${text(row.customer_name ?? 'Unknown')}</a>`
          : `<span class="text-xs text-muted">${text(row.customer_name ?? 'Guest')}</span>`,
      exportValue: (row) => row.customer_name ?? '',
    },
    {
      data: 'customer_email',
      title: 'Email',
      sortable: true,
      render: (row) => `<span class="text-xs text-muted">${text(row.customer_email)}</span>`,
      exportValue: (row) => row.customer_email ?? '',
    },
    {
      data: 'discount_amount',
      title: 'Discount',
      sortable: true,
      className: 'text-right',
      headerClassName: 'text-right',
      render: (row) =>
        `<span class="font-semibold text-emerald-600 dark:text-emerald-400">− ${money(row.discount_amount)}</span>`,
      exportValue: (row) => num(row.discount_amount),
    },
    {
      data: 'created_at',
      title: 'Redeemed',
      sortable: true,
      render: (row) => `<span class="text-xs text-muted">${text(formatDateTime(row.created_at))}</span>`,
      exportValue: (row) => row.created_at,
    },
  ];

  if (loading) return <PageSpinner label="Loading coupon…" />;

  if (error || !coupon) {
    return (
      <Card>
        <CardBody>
          <ErrorState
            title="The coupon could not load"
            description={error ?? undefined}
            onRetry={() => void load()}
          />
        </CardBody>
      </Card>
    );
  }

  const percent = num(coupon.usage_percent);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded-md bg-[var(--surface-sunken)] px-2 py-1 font-mono text-sm font-semibold tracking-wide text-clay-700 dark:text-clay-400">
              {coupon.code}
            </code>
            <Badge
              className={
                coupon.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-sand-100 text-sand-600 dark:bg-walnut-800 dark:text-sand-400'
              }
            >
              {coupon.status === 'active' ? 'Active' : coupon.status === 'expired' ? 'Expired' : 'Inactive'}
            </Badge>
          </div>
          <h1 className="mt-2 font-display text-xl font-semibold text-sand-900 dark:text-sand-50">
            Redemptions
          </h1>
          <p className="mt-1 text-sm text-muted">
            {coupon.type === 'percentage'
              ? `${num(coupon.value)}% off`
              : `${formatMoney(coupon.value, 'PHP')} off`}
            {num(coupon.minimum_order) > 0
              ? ` on orders over ${formatMoney(coupon.minimum_order, 'PHP')}`
              : ''}{' '}
            · {formatNumber(coupon.used_count)} of{' '}
            {coupon.usage_limit ? formatNumber(coupon.usage_limit) : '∞'} used ({percent.toFixed(0)}%)
          </p>
        </div>

        <Link
          href="/admin/coupons"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to coupons
        </Link>
      </div>

      <Card>
        <CardHeader
          title="Who used it"
          description={`Every order this discount was applied to at ${BRAND.name}.`}
        />
        <CardBody className="p-0">
          <DataTable<CouponUsage>
            id={`coupon-usages-${id}`}
            endpoint={`/coupons/${id}/usages`}
            columns={columns}
            exportName={`${coupon.code}-redemptions`}
            exportTitle={`Redemptions for ${coupon.code}`}
            searchPlaceholder="Search order or customer…"
            emptyMessage="This coupon has not been redeemed yet."
            actions={(): CellAction[] => []}
          />
        </CardBody>
      </Card>
    </div>
  );
}
