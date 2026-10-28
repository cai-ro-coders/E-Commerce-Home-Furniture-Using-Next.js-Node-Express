'use client';

/**
 * Admin dashboard.
 *
 * One request feeds the whole screen: `GET /dashboard` returns the headline
 * counters, the daily series, the breakdowns and the four ranked lists, so the
 * page never has to fan out into a dozen endpoints or stitch partial states
 * together. The two side-loads (analytics, calendar) are independent and fail
 * quietly so a slow one cannot blank the screen.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Banknote,
  CalendarDays,
  ClipboardList,
  Coins,
  LayoutGrid,
  Package,
  RefreshCw,
  ShoppingCart,
  Star,
  Truck,
  Users,
  Wallet,
} from 'lucide-react';
import {
  BestSellersPanel,
  LowStockPanel,
  NoSalesYet,
  RecentOrdersPanel,
  TopCustomersPanel,
} from '@/components/admin/DashboardPanels';
import { DashboardCalendar } from '@/components/admin/DashboardCalendar';
import {
  CategoryBarChart,
  CHART_COLORS,
  SalesBarChart,
  SalesLineChart,
  StatusDoughnut,
} from '@/components/admin/Charts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/Card';
import { EmptyState, ErrorState, StatsSkeleton } from '@/components/ui/Feedback';
import { StatCard } from '@/components/ui/StatCard';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatBytes, formatMoney, formatNumber, num } from '@/lib/format';
import type { CalendarEvent, DashboardPayload, SalesAnalytics } from '@/types';

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 14, label: '14 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
] as const;

/** Order-status colours, kept in step with the doughnut's slice order. */
const STATUS_COLORS: Record<string, string> = {
  Delivered: CHART_COLORS.emerald,
  Pending: CHART_COLORS.amber,
  Processing: CHART_COLORS.sky,
  Shipped: CHART_COLORS.violet,
  Cancelled: CHART_COLORS.rose,
  Returned: CHART_COLORS.sand,
};

export default function AdminDashboardPage() {
  const [days, setDays] = useState<number>(14);
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [calendar, setCalendar] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (window_days: number, initial: boolean) => {
      if (initial) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        setPayload(await api.get<DashboardPayload>('/dashboard', { days: window_days }));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not load the dashboard');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }

      // Side-loads: useful extras, but their absence must not fail the page.
      const [analyticsResult, calendarResult] = await Promise.allSettled([
        api.get<SalesAnalytics>('/dashboard/sales-analytics', { days: window_days }),
        api.get<CalendarEvent[]>('/dashboard/calendar', { days: window_days }),
      ]);
      if (analyticsResult.status === 'fulfilled') setAnalytics(analyticsResult.value);
      if (calendarResult.status === 'fulfilled') setCalendar(calendarResult.value ?? []);
    },
    []
  );

  useEffect(() => {
    void load(days, payload === null);
    // `payload` is only read to decide between the first paint and a refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, load]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard" description="Loading the latest trading picture…" />
        <StatsSkeleton count={6} />
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Dashboard" />
        <Card>
          <ErrorState
            title="The dashboard could not load"
            description={error ?? undefined}
            onRetry={() => void load(days, true)}
          />
        </Card>
      </div>
    );
  }

  const { stats, product_stats, order_stats, customer_stats, review_stats, file_stats } = payload;
  const currency = payload.currency || 'PHP';

  const seriesLabels = payload.sales_series.map((point) => point.label);
  const seriesRevenue = payload.sales_series.map((point) => point.revenue);
  const periodRevenue = payload.sales_series.reduce((total, point) => total + num(point.revenue), 0);
  const periodOrders = payload.sales_series.reduce((total, point) => total + point.orders, 0);
  const bestDay = payload.sales_series.reduce(
    (best, point) => (num(point.revenue) > num(best?.revenue ?? 0) ? point : best),
    payload.sales_series[0]
  );

  const statusLabels = payload.orders_by_status.map((row) => row.status);
  const statusValues = payload.orders_by_status.map((row) => row.total);
  const statusColors = statusLabels.map((status) => STATUS_COLORS[status] ?? CHART_COLORS.sand);

  const analyticsLabels = analytics?.series.map((point) => point.label) ?? [];
  const hasSales = periodOrders > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`Trading picture for the last ${days} days, refreshed on every visit.`}
        actions={
          <>
            <div
              role="group"
              aria-label="Date range"
              className="inline-flex overflow-hidden rounded-lg border border-[var(--border-subtle)]"
            >
              {RANGES.map((range) => (
                <button
                  key={range.days}
                  type="button"
                  onClick={() => setDays(range.days)}
                  aria-pressed={days === range.days}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium transition-colors',
                    days === range.days
                      ? 'bg-clay-600 text-white'
                      : 'text-sand-600 hover:bg-[var(--surface-sunken)] dark:text-sand-300'
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />}
              onClick={() => void load(days, false)}
              loading={refreshing}
            >
              Refresh
            </Button>
          </>
        }
      />

      {/* ------------------------------------------------------- headline */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Total revenue"
          value={formatMoney(stats.total_revenue, currency, { decimals: 0 })}
          icon={<Banknote className="size-4" />}
          tone="brand"
          trend={stats.revenue_change_percent}
          trendLabel="this month vs last"
        />
        <StatCard
          label="Net earning"
          value={formatMoney(stats.net_earning, currency, { decimals: 0 })}
          icon={<Coins className="size-4" />}
          tone="success"
          hint={`${formatMoney(
            num(stats.total_revenue) - num(stats.net_earning),
            currency,
            { decimals: 0 }
          )} of adjustments and fees`}
        />
        <StatCard
          label="Orders today"
          value={formatNumber(stats.today_orders)}
          icon={<ShoppingCart className="size-4" />}
          tone="info"
          trend={stats.orders_change_percent}
          trendLabel={`vs ${formatNumber(stats.yesterday_orders)} yesterday`}
        />
        <StatCard
          label="Total orders"
          value={formatNumber(stats.total_orders)}
          icon={<ClipboardList className="size-4" />}
          tone="neutral"
          hint={`${formatNumber(num(order_stats.open_orders))} still open`}
        />
        <StatCard
          label="Active products"
          value={formatNumber(product_stats.active_listings)}
          icon={<Package className="size-4" />}
          tone="warning"
          hint={`${formatNumber(product_stats.low_stock)} low · ${formatNumber(product_stats.out_of_stock)} out`}
        />
        <StatCard
          label="Average order"
          value={formatMoney(stats.average_order_value, currency, { decimals: 0 })}
          icon={<Wallet className="size-4" />}
          tone="brand"
          hint={`${formatNumber(stats.total_customers)} customers`}
        />
      </section>

      {/* ----------------------------------------------- sales + statuses */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={`Sales over the last ${days} days`}
            description={
              hasSales
                ? `${formatMoney(periodRevenue, currency, { decimals: 0 })} from ${formatNumber(periodOrders)} orders`
                : 'No orders in this window'
            }
            action={
              hasSales && bestDay ? (
                <Badge variant="success" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  Best day {bestDay.label} · {formatMoney(bestDay.revenue, currency, { decimals: 0 })}
                </Badge>
              ) : null
            }
          />
          <CardBody>
            {hasSales ? (
              <SalesLineChart
                labels={seriesLabels}
                currency={currency}
                series={[{ label: 'Revenue', values: seriesRevenue }]}
                height={300}
              />
            ) : (
              <NoSalesYet />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Orders by status" description="Every order ever placed" />
          <CardBody>
            {statusValues.length > 0 ? (
              <StatusDoughnut
                labels={statusLabels}
                values={statusValues}
                colors={statusColors}
                height={300}
              />
            ) : (
              <EmptyState title="No orders yet" />
            )}
          </CardBody>
        </Card>
      </section>

      {/* ------------------------------------------------- sales analytics */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Sales analytics"
            description="Cumulative revenue across the window"
          />
          <CardBody className="flex flex-col gap-4">
            {analytics && analyticsLabels.length > 0 ? (
              <>
                <dl className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-[var(--surface-sunken)] px-3 py-2.5">
                    <dt className="text-[0.65rem] uppercase tracking-wide text-muted">Revenue</dt>
                    <dd className="text-sm font-semibold tabular-nums text-sand-900 dark:text-sand-50">
                      {formatMoney(analytics.summary.total_revenue, currency, { decimals: 0 })}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-[var(--surface-sunken)] px-3 py-2.5">
                    <dt className="text-[0.65rem] uppercase tracking-wide text-muted">Orders</dt>
                    <dd className="text-sm font-semibold tabular-nums text-sand-900 dark:text-sand-50">
                      {formatNumber(analytics.summary.total_orders)}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-[var(--surface-sunken)] px-3 py-2.5">
                    <dt className="text-[0.65rem] uppercase tracking-wide text-muted">Avg order</dt>
                    <dd className="text-sm font-semibold tabular-nums text-sand-900 dark:text-sand-50">
                      {formatMoney(analytics.summary.average_order_value, currency, { decimals: 0 })}
                    </dd>
                  </div>
                </dl>
                <SalesBarChart
                  labels={analyticsLabels}
                  values={analytics.series.map((point) => point.cumulative_revenue)}
                  label="Cumulative revenue"
                  currency={currency}
                  color={CHART_COLORS.sky}
                  height={260}
                />
              </>
            ) : (
              <NoSalesYet />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Revenue by category" description="Where the money is coming from" />
          <CardBody>
            {payload.sales_by_category.length > 0 ? (
              <CategoryBarChart
                labels={payload.sales_by_category.map((row) => row.name)}
                values={payload.sales_by_category.map((row) => row.revenue)}
                currency={currency}
                height={320}
              />
            ) : (
              <NoSalesYet />
            )}
          </CardBody>
        </Card>
      </section>

      {/* ----------------------------------------------- orders + rankings */}
      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-3">
        <div className="2xl:col-span-2">
          <RecentOrdersPanel items={payload.recent_orders} currency={currency} />
        </div>
        <BestSellersPanel items={payload.best_sellers} currency={currency} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <LowStockPanel items={payload.low_stock} />
        <TopCustomersPanel items={payload.top_customers} currency={currency} />
      </section>

      {/* --------------------------------------------------- pulse tiles */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
              <Users className="size-4" />
            </span>
            <div>
              <p className="text-[0.7rem] uppercase tracking-wide text-muted">Customers</p>
              <p className="font-display text-lg font-semibold text-sand-900 dark:text-sand-50">
                {formatNumber(customer_stats.total_customers)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            {formatNumber(customer_stats.active_customers)} active ·{' '}
            {formatNumber(customer_stats.new_this_month)} joined this month ·{' '}
            {num(customer_stats.repeat_rate).toFixed(0)}% repeat
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              <Star className="size-4" />
            </span>
            <div>
              <p className="text-[0.7rem] uppercase tracking-wide text-muted">Reviews</p>
              <p className="font-display text-lg font-semibold text-sand-900 dark:text-sand-50">
                {formatNumber(review_stats.total)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            {num(review_stats.average_rating).toFixed(2)} average ·{' '}
            {formatNumber(review_stats.pending)} awaiting moderation
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <LayoutGrid className="size-4" />
            </span>
            <div>
              <p className="text-[0.7rem] uppercase tracking-wide text-muted">Inventory</p>
              <p className="font-display text-lg font-semibold text-sand-900 dark:text-sand-50">
                {formatNumber(product_stats.inventory_units)} units
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            {formatMoney(product_stats.inventory_value, currency, { decimals: 0 })} at cost ·{' '}
            {formatNumber(product_stats.featured_products)} featured
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              <Truck className="size-4" />
            </span>
            <div>
              <p className="text-[0.7rem] uppercase tracking-wide text-muted">Files</p>
              <p className="font-display text-lg font-semibold text-sand-900 dark:text-sand-50">
                {formatNumber(file_stats.total_files)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            {formatBytes(num(file_stats.total_size))} stored ·{' '}
            {formatNumber(file_stats.documents)} documents
          </p>
        </Card>
      </section>

      {/* ------------------------------------------------- activity calendar */}
      <Card>
        <CardHeader
          title="Order calendar"
          description="Daily order counts, revenue and signups"
          action={
            <Badge className="bg-sand-100 text-sand-700 dark:bg-walnut-800 dark:text-sand-300">
              <CalendarDays className="mr-1 size-3" aria-hidden />
              {formatNumber(stats.pending_orders)} pending
            </Badge>
          }
        />
        <CardBody>
          <DashboardCalendar
            events={calendar}
            currency={currency}
            loading={calendar.length === 0}
          />
        </CardBody>
      </Card>
    </div>
  );
}
