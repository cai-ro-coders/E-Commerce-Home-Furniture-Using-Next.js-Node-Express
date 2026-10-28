'use client';

/**
 * Orders module — list.
 *
 * Beyond browsing, the row actions are where the module earns its keep:
 * advancing the status writes to `order_status_history` through the API, and
 * the print action renders a receipt from the live order rather than a PDF the
 * server has to generate.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { StatsStrip, type StatsStripItem } from '@/components/admin/StatsStrip';
import { ToolbarSelect } from '@/components/admin/ToolbarSelect';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Card';
import { printOrderReceipt } from '@/components/admin/orders/OrderReceipt';
import { ApiError, api } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import {
  formatDate,
  formatMoney,
  formatNumber,
  num,
  orderStatusTag,
  paymentStatusTag,
} from '@/lib/format';
import {
  ACTIONS_COLUMN,
  avatarCell,
  money,
  pill,
  productCell,
  text,
} from '@/lib/tableHtml';
import {
  ORDER_STATUSES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUSES,
  type Order,
  type OrderStats,
} from '@/types';

export default function OrdersListPage() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      setStats(await api.get<OrderStats>('/orders/stats'));
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const filters = useMemo(
    () => ({
      status: status || undefined,
      payment_status: paymentStatus || undefined,
      payment_method: paymentMethod || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [status, paymentStatus, paymentMethod, from, to]
  );

  const hasFilters = Boolean(status || paymentStatus || paymentMethod || from || to);

  const handleAction = useCallback(
    async (key: string, row: Order) => {
      if (key === 'print') {
        printReceipt(row.id);
        return;
      }

      if (key === 'delete') {
        const confirmed = await confirmAction({
          title: `Delete ${row.order_number}?`,
          text: 'The order and its items are removed. This cannot be undone.',
          confirmText: 'Delete order',
        });
        if (!confirmed) return;
        try {
          await api.delete(`/orders/${row.id}`);
          toastSuccess(`${row.order_number} was deleted`);
          setReloadToken((value) => value + 1);
          void loadStats();
        } catch (error) {
          alertError('Could not delete the order', describe(error));
        }
        return;
      }

      // One click per forward step; Cancelled and Returned are the exceptions
      // because they change money, so they confirm first.
      if (key === 'cancel' || key === 'return') {
        const label = key === 'cancel' ? 'Cancelled' : 'Returned';
        const confirmed = await confirmAction({
          title: `Mark ${row.order_number} as ${label.toLowerCase()}?`,
          text:
            key === 'cancel'
              ? 'Stock is returned to the shelf and any payment is marked for review.'
              : 'The customer is credited and the units go back into stock.',
          confirmText: `Mark ${label.toLowerCase()}`,
        });
        if (!confirmed) return;
      }

      const nextStatus = NEXT_STATUS[key];
      if (!nextStatus) return;

      try {
        await api.patch(`/orders/${row.id}/status`, { order_status: nextStatus });
        toastSuccess(`${row.order_number} is now ${nextStatus.toLowerCase()}`);
        setReloadToken((value) => value + 1);
        void loadStats();
      } catch (error) {
        alertError('Could not update the order', describe(error));
      }
    },
    [loadStats]
  );

  const columns: DataTableColumn<Order>[] = useMemo(
    () => [
      {
        data: 'order_number',
        title: 'Order',
        sortable: true,
        render: (row) =>
          `<a href="/admin/orders/${row.id}" class="font-semibold text-clay-700 hover:underline dark:text-clay-400">${text(row.order_number)}</a>`,
        exportValue: (row) => row.order_number,
      },
      {
        data: 'customer_name',
        title: 'Customer',
        sortable: true,
        render: (row) =>
          avatarCell({
            avatar: row.customer_avatar,
            name: row.customer_name,
            email: row.customer_email,
          }),
        exportValue: (row) => row.customer_name ?? '',
      },
      {
        data: 'item_count',
        title: 'Items',
        sortable: true,
        className: 'text-center',
        render: (row) =>
          row.product_thumb
            ? productCell({
                image: row.product_thumb,
                name: `${formatNumber(row.item_count)} line${num(row.item_count) === 1 ? '' : 's'}`,
              })
            : `<span class="text-xs text-muted">${formatNumber(row.item_count)} line${num(row.item_count) === 1 ? '' : 's'}</span>`,
        exportValue: (row) => num(row.item_count),
      },
      {
        data: 'payment_method',
        title: 'Method',
        sortable: true,
        render: (row) =>
          `<span class="text-xs">${text(PAYMENT_METHOD_LABELS[row.payment_method] ?? row.payment_method)}</span>`,
        exportValue: (row) => PAYMENT_METHOD_LABELS[row.payment_method] ?? row.payment_method,
      },
      {
        data: 'grand_total',
        title: 'Total',
        sortable: true,
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row) => `<span class="font-semibold">${money(row.grand_total)}</span>`,
        exportValue: (row) => num(row.grand_total),
      },
      {
        data: 'order_status',
        title: 'Fulfilment',
        sortable: true,
        render: (row) => {
          const tag = orderStatusTag(row.order_status);
          return pill(tag.label, tag.className);
        },
        exportValue: (row) => row.order_status,
      },
      {
        data: 'payment_status',
        title: 'Payment',
        sortable: true,
        render: (row) => {
          const tag = paymentStatusTag(row.payment_status);
          return pill(tag.label, tag.className);
        },
        exportValue: (row) => row.payment_status,
      },
      {
        data: 'created_at',
        title: 'Placed',
        sortable: true,
        render: (row) =>
          `<span class="text-xs text-muted">${text(formatDate(row.created_at))}</span>`,
        exportValue: (row) => row.created_at,
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

  const statsItems: StatsStripItem[] = stats
    ? [
        { label: 'Orders', value: formatNumber(stats.total_orders) },
        { label: 'Open', value: formatNumber(stats.open_orders), tone: 'warning' },
        { label: 'Paid', value: formatNumber(stats.paid_orders), tone: 'success' },
        {
          label: 'Awaiting payment',
          value: formatNumber(stats.pending_payment),
          tone: 'warning',
        },
        { label: 'Cancelled', value: formatNumber(stats.cancelled_orders), tone: 'danger' },
        {
          label: 'Revenue',
          value: formatMoney(stats.total_revenue, 'PHP', { decimals: 0 }),
          tone: 'brand',
          hint: `${formatMoney(stats.average_order_value, 'PHP', { decimals: 0 })} average`,
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        description="Every order, its fulfilment state and its payment state."
        actions={
          hasFilters ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="size-3.5" />}
              onClick={() => {
                setStatus('');
                setPaymentStatus('');
                setPaymentMethod('');
                setFrom('');
                setTo('');
              }}
            >
              Clear filters
            </Button>
          ) : null
        }
      />

      <StatsStrip
        items={
          statsItems.length
            ? statsItems
            : Array.from({ length: 6 }, () => ({ label: '—', value: '' }))
        }
        loading={!stats}
      />

      <DataTable<Order>
        id="orders"
        endpoint="/orders"
        columns={columns}
        filters={filters}
        reloadToken={reloadToken}
        exportName="orders"
        exportTitle="Order report"
        searchPlaceholder="Search order number, customer or email…"
        emptyMessage="No orders match these filters."
        actions={(row) => [
          { key: 'view', label: 'Open order', href: `/admin/orders/${row.id}`, tone: 'neutral' },
          { key: 'edit', label: 'Edit order', href: `/admin/orders/${row.id}/edit`, tone: 'brand' },
          ...(NEXT_STATUS.processing && row.order_status === 'Pending'
            ? [{ key: 'process', label: 'Mark as processing', tone: 'info' as const }]
            : []),
          ...(row.order_status === 'Processing'
            ? [{ key: 'ship', label: 'Mark as shipped', tone: 'info' as const }]
            : []),
          ...(row.order_status === 'Shipped'
            ? [{ key: 'deliver', label: 'Mark as delivered', tone: 'success' as const }]
            : []),          ...(row.order_status !== 'Cancelled' && row.order_status !== 'Returned'
            ? [{ key: 'return', label: 'Mark as returned', tone: 'warning' as const }]
            : []),
          ...(row.order_status !== 'Cancelled'
            ? [{ key: 'cancel', label: 'Cancel order', tone: 'danger' as const }]
            : []),
          { key: 'print', label: 'Print receipt', tone: 'neutral' },
          { key: 'delete', label: 'Delete order', tone: 'danger' },
        ]}
        onAction={(key, row) => void handleAction(key, row)}
        toolbar={
          <>
            <ToolbarSelect
              id="filter-order-status"
              label="Any fulfilment"
              value={status}
              onChange={setStatus}
              options={ORDER_STATUSES.map((value) => ({ value, label: value }))}
            />
            <ToolbarSelect
              id="filter-payment-status"
              label="Any payment"
              value={paymentStatus}
              onChange={setPaymentStatus}
              options={PAYMENT_STATUSES.map((value) => ({ value, label: value }))}
            />
            <ToolbarSelect
              id="filter-payment-method"
              label="Any method"
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
            <DateRangeField id="filter-from" label="From" value={from} onChange={setFrom} />
            <DateRangeField id="filter-to" label="To" value={to} onChange={setTo} />
          </>
        }
      />
    </div>
  );
}

/** Row actions that move an order forward, keyed by the action name. */
const NEXT_STATUS: Record<string, string> = {
  process: 'Processing',
  ship: 'Shipped',
  deliver: 'Delivered',
  cancel: 'Cancelled',
  return: 'Returned',
};

/**
 * Print a receipt for one order.
 *
 * The order detail endpoint carries the full line items, which a list row does
 * not, so the receipt is fetched, rendered off-screen, then printed.
 */
async function printReceipt(orderId: number) {
  try {
    printOrderReceipt(await api.get<Order>(`/orders/${orderId}`));
  } catch (error) {
    alertError('Could not build the receipt', describe(error));
  }
}

/** Date input sized to match the toolbar selects, with an inline caption. */
function DateRangeField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <span className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[0.7rem] font-semibold uppercase tracking-wide text-sand-400">
        {label}
      </span>
      <input
        id={id}
        aria-label={`Orders ${label.toLowerCase()} this date`}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 rounded-lg border border-sand-300 bg-white pl-9 pr-2 text-xs text-sand-700 transition-colors hover:bg-sand-50 focus:border-clay-500 focus:outline-none focus:ring-2 focus:ring-clay-500/25 dark:border-walnut-800 dark:bg-walnut-900 dark:text-sand-200 dark:hover:bg-walnut-800"
      />
    </span>
  );
}

function describe(error: unknown): string {
  if (error instanceof ApiError && error.details.length > 0) {
    return error.details.map((detail) => detail.message).join(' ');
  }
  return error instanceof Error ? error.message : 'Unknown error';
}
