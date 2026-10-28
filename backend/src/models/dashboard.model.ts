import { query, queryOne, type SqlParam } from '../config/database';
import type { RowDataPacket } from 'mysql2';
import { ORDER_ITEM_IMAGE_SQL } from './order.model';

export interface DashboardStats {
  total_revenue: string;
  net_earning: string;
  today_orders: number;
  yesterday_orders: number;
  total_orders: number;
  active_products: number;
  total_customers: number;
  new_customers_today: number;
  pending_orders: number;
  low_stock_count: number;
  out_of_stock_count: number;
  average_order_value: string;
  revenue_change_percent: number;
  orders_change_percent: number;
}

interface CountRow extends RowDataPacket {
  value: number;
}

/** "Net earning" = paid, non-voided revenue minus shipping and tax collected. */
export async function dashboardStats(): Promise<DashboardStats> {
  const [revenue] = await query<RowDataPacket & { total: string }>(
    `SELECT COALESCE(SUM(grand_total), 0) AS total
       FROM orders
      WHERE payment_status = 'Paid' AND order_status NOT IN ('Cancelled', 'Returned')
        AND DATE(created_at) = CURDATE()`
  );
  const [yesterday] = await query<RowDataPacket & { total: string }>(
    `SELECT COALESCE(SUM(grand_total), 0) AS total
       FROM orders
      WHERE payment_status = 'Paid' AND order_status NOT IN ('Cancelled', 'Returned')
        AND DATE(created_at) = CURDATE() - INTERVAL 1 DAY`
  );
  const [net] = await query<RowDataPacket & { value: string }>(
    `SELECT COALESCE(SUM(grand_total - shipping_fee - tax), 0) AS value
       FROM orders
      WHERE payment_status = 'Paid' AND order_status NOT IN ('Cancelled', 'Returned')`
  );
  const [allTime] = await query<RowDataPacket & { total: string; avg: string; count: number }>(
    `SELECT COALESCE(SUM(grand_total), 0) AS total,
            COALESCE(ROUND(AVG(grand_total), 2), 0) AS avg,
            COUNT(*) AS count
       FROM orders
      WHERE payment_status = 'Paid' AND order_status NOT IN ('Cancelled', 'Returned')`
  );
  const [counts] = await query<RowDataPacket & Record<string, number>>(
    `SELECT
       (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE())                          AS today_orders,
       (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY)        AS yesterday_orders,
       (SELECT COUNT(*) FROM orders)                                                            AS total_orders,
       (SELECT COUNT(*) FROM products WHERE status = 'active')                                   AS active_products,
       (SELECT COUNT(*) FROM users WHERE role = 'customer')                                      AS total_customers,
       (SELECT COUNT(*) FROM users WHERE role = 'customer' AND DATE(created_at) = CURDATE())    AS new_customers_today,
       (SELECT COUNT(*) FROM orders WHERE order_status IN ('Pending','Processing'))              AS pending_orders,
       (SELECT COUNT(*) FROM products WHERE stock_quantity > 0 AND stock_quantity <= minimum_stock) AS low_stock_count,
       (SELECT COUNT(*) FROM products WHERE stock_quantity = 0)                                  AS out_of_stock_count`
  );

  const todayRevenue = Number(revenue?.total ?? 0);
  const yesterdayRevenue = Number(yesterday?.total ?? 0);

  return {
    total_revenue: String(allTime?.total ?? 0),
    net_earning: String(net?.value ?? 0),
    today_orders: Number(counts?.today_orders ?? 0),
    yesterday_orders: Number(counts?.yesterday_orders ?? 0),
    total_orders: Number(counts?.total_orders ?? 0),
    active_products: Number(counts?.active_products ?? 0),
    total_customers: Number(counts?.total_customers ?? 0),
    new_customers_today: Number(counts?.new_customers_today ?? 0),
    pending_orders: Number(counts?.pending_orders ?? 0),
    low_stock_count: Number(counts?.low_stock_count ?? 0),
    out_of_stock_count: Number(counts?.out_of_stock_count ?? 0),
    average_order_value: String(allTime?.avg ?? 0),
    revenue_change_percent: percentChange(yesterdayRevenue, todayRevenue),
    orders_change_percent: percentChange(
      Number(counts?.yesterday_orders ?? 0),
      Number(counts?.today_orders ?? 0)
    ),
  };
}

function percentChange(previous: number, current: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export interface SalesPoint {
  label: string;
  revenue: number;
  orders: number;
}

/**
 * Revenue grouped by day for the last N days, with zero-filled gaps so the
 * Chart.js line has no holes. Uses a static numbers table (MySQL 5.7 compatible).
 */
export async function salesSeries(days = 14): Promise<SalesPoint[]> {
  const span = Math.min(Math.max(Number(days) || 14, 1), 730);
  return query<RowDataPacket & { label: string; revenue: string; orders: number }>(
    `SELECT DATE_FORMAT(d.date_label, '%b %d') AS label,
             COALESCE(SUM(o.grand_total), 0)     AS revenue,
             COUNT(o.id)                         AS orders
        FROM (
          SELECT DATE_SUB(CURDATE(), INTERVAL n.n DAY) AS date_label, n.n AS seq
          FROM (
            SELECT a.N + b.N * 10 + c.N * 100 AS n
            FROM
              (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
              (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
              (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c
          ) n
          WHERE n.n <= ?
        ) d
        LEFT JOIN orders o
          ON DATE(o.created_at) = d.date_label
         AND o.payment_status = 'Paid'
         AND o.order_status NOT IN ('Cancelled', 'Returned')
       GROUP BY d.date_label, d.seq
       ORDER BY d.seq ASC`,
    [span - 1]
  ).then((rows) =>
    rows.map((row) => ({
      label: row.label,
      revenue: Number(row.revenue),
      orders: Number(row.orders),
    }))
  );
}

export interface OrderStatusBreakdown {
  status: string;
  total: number;
}

export async function ordersByStatus(): Promise<OrderStatusBreakdown[]> {
  return query<RowDataPacket & OrderStatusBreakdown>(
    `SELECT order_status AS status, COUNT(*) AS total
       FROM orders
      GROUP BY order_status
      ORDER BY total DESC`
  );
}

export interface CategorySalesRow extends RowDataPacket {
  name: string;
  revenue: number;
  units: number;
}

/** Revenue by category — feeds the doughnut chart. */
export async function salesByCategory(): Promise<CategorySalesRow[]> {
  return query<CategorySalesRow>(
    `SELECT c.name                        AS name,
            COALESCE(SUM(oi.total), 0)     AS revenue,
            COALESCE(SUM(oi.quantity), 0)  AS units
       FROM order_items oi
       JOIN orders o        ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE o.payment_status = 'Paid' AND o.order_status NOT IN ('Cancelled', 'Returned')
      GROUP BY c.name
      ORDER BY revenue DESC
      LIMIT 8`
  );
}

export interface BestSellingProduct extends RowDataPacket {
  id: number;
  name: string;
  sku: string;
  image: string | null;
  units_sold: number;
  revenue: number;
}

/** Best sellers used by both the dashboard widget and the Products module. */
export async function bestSellingProducts(limit = 5): Promise<BestSellingProduct[]> {
  return query<BestSellingProduct>(
    `SELECT oi.product_id                                   AS id,
            oi.product_name                                  AS name,
            oi.sku                                           AS sku,
            -- Prefer the product's current primary photo; fall back to the
            -- image snapshot stored on the order line.
            COALESCE(
              MAX((SELECT pi.image FROM product_images pi
                    WHERE pi.product_id = oi.product_id
                    ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.id ASC LIMIT 1)),
              MAX(oi.product_image)
            )                                                AS image,
            SUM(oi.quantity)                                 AS units_sold,
            SUM(oi.total)                                    AS revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
      WHERE o.payment_status = 'Paid' AND o.order_status NOT IN ('Cancelled', 'Returned')
      GROUP BY oi.product_id, oi.product_name, oi.sku
      ORDER BY units_sold DESC, revenue DESC
      LIMIT ?`,
    [limit]
  );
}

export interface RecentOrderRow extends RowDataPacket {
  id: number;
  order_number: string;
  customer_name: string | null;
  customer_avatar: string | null;
  order_status: string;
  payment_status: string;
  grand_total: string;
  item_count: number;
  product_thumb: string | null;
  created_at: string;
}

export async function recentOrders(limit = 8): Promise<RecentOrderRow[]> {
  return query<RecentOrderRow>(
    `SELECT o.id, o.order_number, o.order_status, o.payment_status, o.grand_total, o.created_at,
            u.full_name AS customer_name, u.avatar AS customer_avatar,
            (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
            (SELECT ${ORDER_ITEM_IMAGE_SQL} FROM order_items oi WHERE oi.order_id = o.id ORDER BY oi.id ASC LIMIT 1) AS product_thumb
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT ?`,
    [limit]
  );
}

export interface TopCustomerRow extends RowDataPacket {
  id: number;
  full_name: string;
  email: string;
  avatar: string | null;
  total_spent: string;
  order_count: number;
}

export async function topCustomers(limit = 5): Promise<TopCustomerRow[]> {
  return query<TopCustomerRow>(
    `SELECT u.id, u.full_name, u.email, u.avatar,
            COALESCE(SUM(o.grand_total), 0) AS total_spent,
            COUNT(o.id)                    AS order_count
       FROM users u
       JOIN orders o ON o.user_id = u.id
      WHERE o.payment_status = 'Paid' AND o.order_status NOT IN ('Cancelled', 'Returned')
      GROUP BY u.id, u.full_name, u.email, u.avatar
      ORDER BY total_spent DESC
      LIMIT ?`,
    [limit]
  );
}

export interface LowStockRow extends RowDataPacket {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  minimum_stock: number;
  image: string | null;
}

export async function lowStockProducts(limit = 6): Promise<LowStockRow[]> {
  return query<LowStockRow>(
    `SELECT p.id, p.name, p.sku, p.stock_quantity, p.minimum_stock,
            (SELECT pi.image FROM product_images pi WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS image
       FROM products p
      WHERE p.stock_quantity <= p.minimum_stock
      ORDER BY p.stock_quantity ASC, p.name ASC
      LIMIT ?`,
    [limit]
  );
}

export interface CustomerStats extends RowDataPacket {
  total_customers: number;
  active_customers: number;
  new_this_month: number;
  repeat_rate: number;
}

export async function customerStats(): Promise<CustomerStats> {
  const [row] = await query<CustomerStats>(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE role = 'customer')                                        AS total_customers,
       (SELECT COUNT(*) FROM users WHERE role = 'customer' AND status = 'active')                  AS active_customers,
       (SELECT COUNT(*) FROM users WHERE role = 'customer'
          AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01'))                                   AS new_this_month,
       (SELECT ROUND(COALESCE(100 * SUM(CASE WHEN cnt > 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 0), 1)
          FROM (SELECT user_id, COUNT(*) AS cnt FROM orders
                 WHERE user_id IS NOT NULL GROUP BY user_id) AS per_user)                         AS repeat_rate`
  );
  return row ?? ({} as CustomerStats);
}

/** Daily order counts for the FullCalendar / activity heat view. */
export interface DailyActivityRow extends RowDataPacket {
  day: string;
  orders: number;
  revenue: string;
  new_users: number;
}

/** Uses a static numbers table so any lookback window works (MySQL 5.7 compatible). */
export async function dailyActivity(days = 90): Promise<DailyActivityRow[]> {
  const span = Math.min(Math.max(Number(days) || 90, 1), 730);
  return query<DailyActivityRow>(
    `SELECT d.day,
             (SELECT COUNT(*) FROM orders o WHERE DATE(o.created_at) = d.day)           AS orders,
             (SELECT COALESCE(SUM(o.grand_total), 0) FROM orders o
               WHERE DATE(o.created_at) = d.day AND o.payment_status = 'Paid')         AS revenue,
             (SELECT COUNT(*) FROM users u WHERE DATE(u.created_at) = d.day)          AS new_users
        FROM (
          SELECT DATE_SUB(CURDATE(), INTERVAL n.n DAY) AS day
          FROM (
            SELECT a.N + b.N * 10 + c.N * 100 AS n
            FROM
              (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) a,
              (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) b,
              (SELECT 0 AS N UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) c
          ) n
          WHERE n.n <= ?
        ) d
       ORDER BY d.day ASC`,
    [span]
  );
}

export async function countRows(sql: string, params: SqlParam[] = []): Promise<number> {
  const row = await queryOne<CountRow>(sql, params);
  return Number(row?.value ?? 0);
}
