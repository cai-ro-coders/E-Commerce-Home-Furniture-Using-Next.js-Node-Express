'use client';

/**
 * Coupons module — list.
 *
 * A coupon's usefulness is mostly its usage, so the grid leads with the
 * redemption bar rather than the face value, and the validity flag comes from
 * the server (`is_valid` accounts for the date window as well as the status).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { CouponFormModal } from '@/components/admin/coupons/CouponFormModal';
import { StatsStrip, type StatsStripItem } from '@/components/admin/StatsStrip';
import { ToolbarSelect } from '@/components/admin/ToolbarSelect';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import { formatDate, formatMoney, formatNumber, num } from '@/lib/format';
import { ACTIONS_COLUMN, money, pill, text, type CellAction } from '@/lib/tableHtml';
import type { Coupon } from '@/types';

const STATUS_TONES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  inactive: 'bg-sand-100 text-sand-600 dark:bg-walnut-800 dark:text-sand-400',
  expired: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

export default function CouponsPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  /** `undefined` = closed, `null` = creating, a record = editing. */
  const [editing, setEditing] = useState<Coupon | null | undefined>(undefined);
  const [counts, setCounts] = useState<{
    total: number;
    active: number;
    redemptions: number;
    saved: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.list<Coupon>('/coupons', { pageSize: 200, sortBy: 'id', sortDir: 'desc' });
        if (cancelled) return;
        setCounts({
          total: list.meta.total,
          active: list.data.filter((row) => row.is_valid).length,
          redemptions: list.data.reduce((sum, row) => sum + num(row.used_count), 0),
          saved: 0,
        });
      } catch {
        if (!cancelled) setCounts(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refresh = useCallback(() => setReloadToken((value) => value + 1), []);

  const handleAction = useCallback(
    async (key: string, row: Coupon) => {
      if (key === 'edit') {
        setEditing(row);
        return;
      }

      if (key === 'usages') {
        router.push(`/admin/coupons/${row.id}/usages`);
        return;
      }

      if (key === 'toggle') {
        const next = row.status === 'active' ? 'inactive' : 'active';
        try {
          await api.put(`/coupons/${row.id}`, { status: next });
          toastSuccess(`${row.code} is now ${next}`);
          refresh();
        } catch (error) {
          alertError('Could not change the coupon', describe(error));
        }
        return;
      }

      if (key === 'delete') {
        const confirmed = await confirmAction({
          title: `Delete ${row.code}?`,
          text: 'Redemptions are recorded against the order, so past discounts are unaffected.',
          confirmText: 'Delete coupon',
        });
        if (!confirmed) return;
        try {
          await api.delete(`/coupons/${row.id}`);
          toastSuccess(`${row.code} was deleted`);
          refresh();
        } catch (error) {
          alertError('Could not delete the coupon', describe(error));
        }
      }
    },
    [refresh, router]
  );

  const columns: DataTableColumn<Coupon>[] = useMemo(
    () => [
      {
        data: 'code',
        title: 'Code',
        sortable: true,
        render: (row) =>
          '<div class="flex items-center gap-2">' +
          `<code class="rounded-md bg-[var(--surface-sunken)] px-2 py-1 font-mono text-xs font-semibold tracking-wide text-clay-700 dark:text-clay-400">${text(row.code)}</code>` +
          (row.is_valid
            ? ''
            : '<span class="text-[0.65rem] font-medium uppercase tracking-wide text-rose-600 dark:text-rose-400">not usable</span>') +
          '</div>',
        exportValue: (row) => row.code,
      },
      {
        data: 'type',
        title: 'Discount',
        sortable: true,
        render: (row) =>
          `<span class="text-sm font-medium">${
            row.type === 'percentage' ? `${num(row.value)}%` : formatMoney(row.value, 'PHP')
          }</span>`,
        exportValue: (row) => (row.type === 'percentage' ? `${num(row.value)}%` : num(row.value)),
      },
      {
        data: 'minimum_order',
        title: 'Minimum order',
        sortable: false,
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row) =>
          num(row.minimum_order) > 0
            ? `<span class="tabular-nums">${money(row.minimum_order)}</span>`
            : '<span class="text-muted">—</span>',
        exportValue: (row) => num(row.minimum_order),
      },
      {
        data: 'maximum_discount',
        title: 'Capped at',
        sortable: false,
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row) =>
          row.maximum_discount
            ? `<span class="tabular-nums">${money(row.maximum_discount)}</span>`
            : '<span class="text-muted">—</span>',
        exportValue: (row) => (row.maximum_discount ? num(row.maximum_discount) : ''),
      },
      {
        data: 'used_count',
        title: 'Used',
        sortable: true,
        render: (row) => {
          const percent = num(row.usage_percent);
          const full = row.usage_limit !== null && num(row.usage_limit) > 0;
          const label = full
            ? `${formatNumber(row.used_count)} / ${formatNumber(row.usage_limit)}`
            : `${formatNumber(row.used_count)}`;
          const tone = !full
            ? 'bg-sky-500'
            : percent >= 100
              ? 'bg-rose-500'
              : percent >= 75
                ? 'bg-amber-500'
                : 'bg-clay-500';
          return (
            '<div class="flex min-w-28 flex-col gap-1">' +
            `<span class="text-xs tabular-nums">${label}</span>` +
            '<span class="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-sunken)]">' +
            `<span class="block h-full rounded-full ${tone}" style="width:${full ? Math.min(100, percent) : Math.min(100, num(row.used_count) * 4)}%"></span>` +
            '</span></div>'
          );
        },
        exportValue: (row) => num(row.used_count),
      },
      {
        data: 'end_date',
        title: 'Window',
        sortable: true,
        render: (row) =>
          `<span class="text-xs text-muted">${text(formatDate(row.start_date))} → ${text(formatDate(row.end_date))}</span>`,
        exportValue: (row) => `${row.start_date} .. ${row.end_date}`,
      },
      {
        data: 'status',
        title: 'Status',
        sortable: true,
        render: (row) => {
          const label = row.status === 'expired' ? 'Expired' : row.status === 'active' ? 'Active' : 'Inactive';
          return pill(label, STATUS_TONES[label.toLowerCase()] ?? '');
        },
        exportValue: (row) => row.status,
      },
      {
        data: ACTIONS_COLUMN,
        title: '',
        skipExport: true,
        className: 'text-right',
      },
    ],
    []
  );

  const stats: StatsStripItem[] = counts
    ? [
        { label: 'Coupons', value: formatNumber(counts.total) },
        { label: 'Usable now', value: formatNumber(counts.active), tone: 'success' },
        { label: 'Redemptions', value: formatNumber(counts.redemptions), tone: 'brand' },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Coupons"
        description="Discount codes, their date windows and how much of each has been used."
        actions={
          <Button leftIcon={<Tag className="size-4" />} onClick={() => setEditing(null)}>
            New coupon
          </Button>
        }
      />

      <StatsStrip
        items={stats.length ? stats : Array.from({ length: 3 }, () => ({ label: '—', value: '' }))}
        loading={!counts}
      />

      <DataTable<Coupon>
        id="coupons"
        endpoint="/coupons"
        columns={columns}
        filters={{ status: status || undefined, type: type || undefined }}
        reloadToken={reloadToken}
        exportName="coupons"
        exportTitle="Coupon list"
        searchPlaceholder="Search by code…"
        emptyMessage="No coupons yet."
        actions={(row): CellAction[] => [
          { key: 'edit', label: 'Edit coupon', tone: 'brand' },
          { key: 'usages', label: 'View redemptions', tone: 'neutral' },
          {
            key: 'toggle',
            label: row.status === 'active' ? 'Deactivate coupon' : 'Activate coupon',
            tone: row.status === 'active' ? 'warning' : 'success',
          },
          { key: 'delete', label: 'Delete coupon', tone: 'danger' },
        ]}
        onAction={(key, row) => void handleAction(key, row)}
        toolbar={
          <>
            <ToolbarSelect
              id="filter-coupon-status"
              label="Any status"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'expired', label: 'Expired' },
              ]}
            />
            <ToolbarSelect
              id="filter-coupon-type"
              label="Any type"
              value={type}
              onChange={setType}
              options={[
                { value: 'percentage', label: 'Percentage' },
                { value: 'fixed', label: 'Fixed amount' },
              ]}
            />
          </>
        }
      />

      {editing !== undefined ? (
        <CouponFormModal
          coupon={editing ?? undefined}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
