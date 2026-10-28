'use client';

/**
 * Dashboard side-panels.
 *
 * Each panel is a card that takes an already-fetched slice of the dashboard
 * payload, so the page owns all loading state and these stay presentational.
 */
import Link from 'next/link';
import { ArrowRight, PackageX, ShoppingBag, TrendingUp, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState, ProgressBar } from '@/components/ui/Feedback';
import { imageUrl } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatMoney, formatNumber, num, orderStatusTag, paymentStatusTag, timeAgo } from '@/lib/format';
import type { BestSeller, LowStockProduct, RecentOrder, TopCustomer } from '@/types';

function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs font-medium text-clay-700 transition-colors hover:text-clay-800 hover:underline dark:text-clay-400 dark:hover:text-clay-300"
    >
      {children}
      <ArrowRight className="size-3" aria-hidden />
    </Link>
  );
}

/* ------------------------------------------------------------ best sellers */

export function BestSellersPanel({
  items,
  currency,
}: {
  items: BestSeller[];
  currency: string;
}) {
  const maxUnits = items.reduce((max, item) => Math.max(max, num(item.units_sold)), 0);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader title="Best sellers" description="By units sold, all time" />
      <CardBody className="flex-1 p-0">
        {items.length === 0 ? (
          <EmptyState title="No sales yet" description="Products will rank here once orders land." />
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {items.map((item, index) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                <span
                  className={cn(
                    'w-4 shrink-0 text-center text-xs font-semibold tabular-nums',
                    index < 3 ? 'text-clay-600 dark:text-clay-400' : 'text-sand-400'
                  )}
                >
                  {index + 1}
                </span>
                <img
                  src={imageUrl(item.image)}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  className="size-9 shrink-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-sunken)] object-cover"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/products/${item.id}`}
                    className="block truncate text-sm font-medium text-sand-800 transition-colors hover:text-clay-700 dark:text-sand-100 dark:hover:text-clay-400"
                  >
                    {item.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-2">
                    <ProgressBar
                      value={num(item.units_sold)}
                      max={maxUnits}
                      className="max-w-24"
                      tone={index < 3 ? 'brand' : 'warning'}
                    />
                    <span className="text-[0.7rem] text-muted">
                      {formatNumber(item.units_sold)} units
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-sand-800 dark:text-sand-100">
                  {formatMoney(item.revenue, currency, { decimals: 0 })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------ recent orders */

export function RecentOrdersPanel({
  items,
  currency,
}: {
  items: RecentOrder[];
  currency: string;
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Recent orders"
        description="The latest activity across the store"
        action={<PanelLink href="/admin/orders">All orders</PanelLink>}
      />
      <CardBody className="flex-1 overflow-x-auto p-0">
        {items.length === 0 ? (
          <EmptyState title="No orders yet" />
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left text-[0.7rem] uppercase tracking-wide text-muted">
                <th className="px-5 py-2.5 font-semibold">Order</th>
                <th className="px-3 py-2.5 font-semibold">Customer</th>
                <th className="px-3 py-2.5 font-semibold">Items</th>
                <th className="px-3 py-2.5 font-semibold">Status</th>
                <th className="px-3 py-2.5 text-right font-semibold">Total</th>
                <th className="px-5 py-2.5 text-right font-semibold">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {items.map((order) => {
                const orderTag = orderStatusTag(order.order_status);
                const payTag = paymentStatusTag(order.payment_status);
                return (
                  <tr key={order.id} className="transition-colors hover:bg-[var(--surface-sunken)]">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-clay-700 hover:underline dark:text-clay-400"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar src={order.customer_avatar} name={order.customer_name} size="sm" />
                        <span className="truncate text-sand-800 dark:text-sand-100">
                          {order.customer_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {order.product_thumb ? (
                          <img
                            src={imageUrl(order.product_thumb)}
                            alt=""
                            width={28}
                            height={28}
                            loading="lazy"
                            className="size-7 rounded-md border border-[var(--border-subtle)] object-cover"
                          />
                        ) : (
                          <span className="flex size-7 items-center justify-center rounded-md bg-[var(--surface-sunken)] text-sand-400">
                            <ShoppingBag className="size-3.5" />
                          </span>
                        )}
                        <span className="text-xs text-muted">
                          {formatNumber(order.item_count)}{' '}
                          {num(order.item_count) === 1 ? 'line' : 'lines'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge className={orderTag.className}>{orderTag.label}</Badge>
                        <Badge className={payTag.className}>{payTag.label}</Badge>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums text-sand-800 dark:text-sand-100">
                      {formatMoney(order.grand_total, currency)}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-muted">
                      {timeAgo(order.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------ top customers */

export function TopCustomersPanel({
  items,
  currency,
}: {
  items: TopCustomer[];
  currency: string;
}) {
  const maxSpent = items.reduce((max, item) => Math.max(max, num(item.total_spent)), 0);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Top customers"
        description="By lifetime spend"
        action={<PanelLink href="/admin/customers">All customers</PanelLink>}
      />
      <CardBody className="flex-1 p-0">
        {items.length === 0 ? (
          <EmptyState title="No customers yet" icon={<Users className="size-5" />} />
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {items.map((customer) => (
              <li key={customer.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar src={customer.avatar} name={customer.full_name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sand-800 dark:text-sand-100">
                    {customer.full_name}
                  </p>
                  <p className="truncate text-xs text-muted">{customer.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <ProgressBar value={num(customer.total_spent)} max={maxSpent} className="max-w-20" />
                    <span className="text-[0.7rem] text-muted">
                      {formatNumber(customer.order_count)} orders
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-sand-800 dark:text-sand-100">
                  {formatMoney(customer.total_spent, currency, { decimals: 0 })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

/* --------------------------------------------------------------- low stock */

export function LowStockPanel({ items }: { items: LowStockProduct[] }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Needs restocking"
        description="At or below the reorder point"
        action={<PanelLink href="/admin/products">Products</PanelLink>}
      />
      <CardBody className="flex-1 p-0">
        {items.length === 0 ? (
          <EmptyState
            title="Stock levels are healthy"
            description="Nothing is sitting at its reorder point."
            icon={<TrendingUp className="size-5" />}
          />
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {items.map((item) => {
              const out = item.stock_quantity <= 0;
              const ratio =
                item.minimum_stock > 0 ? item.stock_quantity / item.minimum_stock : 1;
              return (
                <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                  <img
                    src={imageUrl(item.image)}
                    alt=""
                    width={36}
                    height={36}
                    loading="lazy"
                    className="size-9 shrink-0 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-sunken)] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/products/${item.id}`}
                      className="block truncate text-sm font-medium text-sand-800 hover:text-clay-700 dark:text-sand-100 dark:hover:text-clay-400"
                    >
                      {item.name}
                    </Link>
                    <p className="text-[0.7rem] text-muted">{item.sku}</p>
                  </div>
                  <div className="w-24 shrink-0 text-right">
                    <Badge className={out ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'}>
                      {out ? 'Out of stock' : `${item.stock_quantity} left`}
                    </Badge>
                    <div className="mt-1.5">
                      <ProgressBar
                        value={Math.min(100, ratio * 100)}
                        tone={out ? 'danger' : 'warning'}
                      />
                    </div>
                    <p className="mt-1 text-[0.65rem] text-muted">min {item.minimum_stock}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

/* -------------------------------------------------------------- empty hint */

export function NoSalesYet() {
  return (
    <EmptyState
      title="No sales in this period"
      description="Widen the date range or check back once orders come in."
      icon={<PackageX className="size-5" />}
    />
  );
}
