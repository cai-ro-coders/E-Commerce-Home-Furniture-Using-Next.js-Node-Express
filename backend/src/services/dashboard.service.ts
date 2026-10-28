import {
  bestSellingProducts,
  customerStats,
  dailyActivity,
  lowStockProducts,
  ordersByStatus,
  recentOrders,
  salesByCategory,
  salesSeries,
  topCustomers,
} from '../models/dashboard.model';
import { productStats } from '../models/product.model';
import { orderStats } from '../models/order.model';
import { reviewStats } from '../models/review.model';
import { fileStats } from '../models/file.model';
import { settingsMap } from '../models/setting.model';
import { dashboardStats } from '../models/dashboard.model';
import type { SalesPoint } from '../models/dashboard.model';

export interface DashboardPayload {
  stats: Awaited<ReturnType<typeof dashboardStats>>;
  product_stats: Awaited<ReturnType<typeof productStats>>;
  order_stats: Awaited<ReturnType<typeof orderStats>>;
  customer_stats: Awaited<ReturnType<typeof customerStats>>;
  review_stats: Awaited<ReturnType<typeof reviewStats>>;
  file_stats: Awaited<ReturnType<typeof fileStats>>;
  sales_series: Awaited<ReturnType<typeof salesSeries>>;
  orders_by_status: Awaited<ReturnType<typeof ordersByStatus>>;
  sales_by_category: Awaited<ReturnType<typeof salesByCategory>>;
  best_sellers: Awaited<ReturnType<typeof bestSellingProducts>>;
  recent_orders: Awaited<ReturnType<typeof recentOrders>>;
  top_customers: Awaited<ReturnType<typeof topCustomers>>;
  low_stock: Awaited<ReturnType<typeof lowStockProducts>>;
  currency: string;
  site_name: string;
}

/**
 * One request powers the entire dashboard. Issuing the ~13 queries in parallel
 * keeps time-to-first-paint close to the slowest single query rather than their
 * sum.
 */
export async function getDashboard(days = 14): Promise<DashboardPayload> {
  const [
    stats,
    productStatsRow,
    orderStatsRow,
    customerStatsRow,
    reviewStatsRow,
    fileStatsRow,
    sales,
    statusBreakdown,
    categorySales,
    bestSellers,
    recent,
    top,
    lowStock,
    settings,
  ] = await Promise.all([
    dashboardStats(),
    productStats(),
    orderStats(),
    customerStats(),
    reviewStats(),
    fileStats(),
    salesSeries(days),
    ordersByStatus(),
    salesByCategory(),
    bestSellingProducts(6),
    recentOrders(8),
    topCustomers(5),
    lowStockProducts(6),
    settingsMap(),
  ]);

  return {
    stats,
    product_stats: productStatsRow,
    order_stats: orderStatsRow,
    customer_stats: customerStatsRow,
    review_stats: reviewStatsRow,
    file_stats: fileStatsRow,
    sales_series: sales,
    orders_by_status: statusBreakdown,
    sales_by_category: categorySales,
    best_sellers: bestSellers,
    recent_orders: recent,
    top_customers: top,
    low_stock: lowStock,
    currency: settings.currency ?? 'PHP',
    site_name: settings.site_name ?? 'Lumera Home',
  };
}

/** Calendar events for the FullCalendar view. */
export async function getCalendarActivity(days = 90) {
  const rows = await dailyActivity(days);
  return rows.map((row) => ({
    date: row.day,
    orders: row.orders,
    revenue: row.revenue,
    new_users: row.new_users,
    title:
      row.orders > 0
        ? `${row.orders} order${row.orders === 1 ? '' : 's'} · ${row.revenue}`
        : row.new_users > 0
          ? `${row.new_users} new customer${row.new_users === 1 ? '' : 's'}`
          : 'No activity',
  }));
}

/**
 * Everything the Sales Analytics page charts: a revenue/orders time series
 * (day or month buckets), the category and status breakdowns, and the top
 * movers — fetched in parallel so the page is one round-trip.
 */
export async function getSalesAnalytics(days = 30, groupBy: 'day' | 'month' = 'day') {
  const [series, status, categories, products, customers, settings] = await Promise.all([
    salesSeries(days),
    ordersByStatus(),
    salesByCategory(),
    bestSellingProducts(10),
    topCustomers(10),
    settingsMap(),
  ]);

  // Cumulative revenue makes the growth area under the line chart readable.
  let running = 0;
  const cumulative = series.map((point) => {
    running += point.revenue;
    return { ...point, cumulative_revenue: Math.round(running * 100) / 100 };
  });

  const totalRevenue = series.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = series.reduce((sum, point) => sum + point.orders, 0);

  return {
    group_by: groupBy,
    days,
    currency: settings.currency ?? 'PHP',
    series: cumulative,
    summary: {
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_orders: totalOrders,
      average_order_value:
        totalOrders === 0 ? 0 : Math.round((totalRevenue / totalOrders) * 100) / 100,
      best_day: series.reduce<SalesPoint | null>(
        (best, point) => (!best || point.revenue > best.revenue ? point : best),
        null
      ),
    },
    orders_by_status: status,
    sales_by_category: categories,
    best_sellers: products,
    top_customers: customers,
  };
}

export { dashboardStats, productStats, orderStats, customerStats, reviewStats, fileStats };
