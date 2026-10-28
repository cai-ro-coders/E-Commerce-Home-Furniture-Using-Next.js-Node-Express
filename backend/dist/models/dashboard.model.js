"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardStats = dashboardStats;
exports.salesSeries = salesSeries;
exports.ordersByStatus = ordersByStatus;
exports.salesByCategory = salesByCategory;
exports.bestSellingProducts = bestSellingProducts;
exports.recentOrders = recentOrders;
exports.topCustomers = topCustomers;
exports.lowStockProducts = lowStockProducts;
exports.customerStats = customerStats;
exports.dailyActivity = dailyActivity;
exports.countRows = countRows;
const database_1 = require("../config/database");
const order_model_1 = require("./order.model");
/** "Net earning" = paid, non-voided revenue minus shipping and tax collected. */
async function dashboardStats() {
    const [revenue] = await (0, database_1.query)(`SELECT COALESCE(SUM(grand_total), 0) AS total
       FROM orders
      WHERE payment_status = 'Paid' AND order_status NOT IN ('Cancelled', 'Returned')
        AND DATE(created_at) = CURDATE()`);
    const [yesterday] = await (0, database_1.query)(`SELECT COALESCE(SUM(grand_total), 0) AS total
       FROM orders
      WHERE payment_status = 'Paid' AND order_status NOT IN ('Cancelled', 'Returned')
        AND DATE(created_at) = CURDATE() - INTERVAL 1 DAY`);
    const [net] = await (0, database_1.query)(`SELECT COALESCE(SUM(grand_total - shipping_fee - tax), 0) AS value
       FROM orders
      WHERE payment_status = 'Paid' AND order_status NOT IN ('Cancelled', 'Returned')`);
    const [allTime] = await (0, database_1.query)(`SELECT COALESCE(SUM(grand_total), 0) AS total,
            COALESCE(ROUND(AVG(grand_total), 2), 0) AS avg,
            COUNT(*) AS count
       FROM orders
      WHERE payment_status = 'Paid' AND order_status NOT IN ('Cancelled', 'Returned')`);
    const [counts] = await (0, database_1.query)(`SELECT
       (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE())                          AS today_orders,
       (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE() - INTERVAL 1 DAY)        AS yesterday_orders,
       (SELECT COUNT(*) FROM orders)                                                            AS total_orders,
       (SELECT COUNT(*) FROM products WHERE status = 'active')                                   AS active_products,
       (SELECT COUNT(*) FROM users WHERE role = 'customer')                                      AS total_customers,
       (SELECT COUNT(*) FROM users WHERE role = 'customer' AND DATE(created_at) = CURDATE())    AS new_customers_today,
       (SELECT COUNT(*) FROM orders WHERE order_status IN ('Pending','Processing'))              AS pending_orders,
       (SELECT COUNT(*) FROM products WHERE stock_quantity > 0 AND stock_quantity <= minimum_stock) AS low_stock_count,
       (SELECT COUNT(*) FROM products WHERE stock_quantity = 0)                                  AS out_of_stock_count`);
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
        orders_change_percent: percentChange(Number(counts?.yesterday_orders ?? 0), Number(counts?.today_orders ?? 0)),
    };
}
function percentChange(previous, current) {
    if (previous === 0)
        return current === 0 ? 0 : 100;
    return Math.round(((current - previous) / previous) * 1000) / 10;
}
/**
 * Revenue grouped by day for the last N days, with zero-filled gaps so the
 * Chart.js line has no holes. Uses a static numbers table (MySQL 5.7 compatible).
 */
async function salesSeries(days = 14) {
    const span = Math.min(Math.max(Number(days) || 14, 1), 730);
    return (0, database_1.query)(`SELECT DATE_FORMAT(d.date_label, '%b %d') AS label,
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
       ORDER BY d.seq ASC`, [span - 1]).then((rows) => rows.map((row) => ({
        label: row.label,
        revenue: Number(row.revenue),
        orders: Number(row.orders),
    })));
}
async function ordersByStatus() {
    return (0, database_1.query)(`SELECT order_status AS status, COUNT(*) AS total
       FROM orders
      GROUP BY order_status
      ORDER BY total DESC`);
}
/** Revenue by category — feeds the doughnut chart. */
async function salesByCategory() {
    return (0, database_1.query)(`SELECT c.name                        AS name,
            COALESCE(SUM(oi.total), 0)     AS revenue,
            COALESCE(SUM(oi.quantity), 0)  AS units
       FROM order_items oi
       JOIN orders o        ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
      WHERE o.payment_status = 'Paid' AND o.order_status NOT IN ('Cancelled', 'Returned')
      GROUP BY c.name
      ORDER BY revenue DESC
      LIMIT 8`);
}
/** Best sellers used by both the dashboard widget and the Products module. */
async function bestSellingProducts(limit = 5) {
    return (0, database_1.query)(`SELECT oi.product_id                                   AS id,
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
      LIMIT ?`, [limit]);
}
async function recentOrders(limit = 8) {
    return (0, database_1.query)(`SELECT o.id, o.order_number, o.order_status, o.payment_status, o.grand_total, o.created_at,
            u.full_name AS customer_name, u.avatar AS customer_avatar,
            (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
            (SELECT ${order_model_1.ORDER_ITEM_IMAGE_SQL} FROM order_items oi WHERE oi.order_id = o.id ORDER BY oi.id ASC LIMIT 1) AS product_thumb
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT ?`, [limit]);
}
async function topCustomers(limit = 5) {
    return (0, database_1.query)(`SELECT u.id, u.full_name, u.email, u.avatar,
            COALESCE(SUM(o.grand_total), 0) AS total_spent,
            COUNT(o.id)                    AS order_count
       FROM users u
       JOIN orders o ON o.user_id = u.id
      WHERE o.payment_status = 'Paid' AND o.order_status NOT IN ('Cancelled', 'Returned')
      GROUP BY u.id, u.full_name, u.email, u.avatar
      ORDER BY total_spent DESC
      LIMIT ?`, [limit]);
}
async function lowStockProducts(limit = 6) {
    return (0, database_1.query)(`SELECT p.id, p.name, p.sku, p.stock_quantity, p.minimum_stock,
            (SELECT pi.image FROM product_images pi WHERE pi.product_id = p.id
              ORDER BY pi.is_primary DESC, pi.sort_order ASC LIMIT 1) AS image
       FROM products p
      WHERE p.stock_quantity <= p.minimum_stock
      ORDER BY p.stock_quantity ASC, p.name ASC
      LIMIT ?`, [limit]);
}
async function customerStats() {
    const [row] = await (0, database_1.query)(`SELECT
       (SELECT COUNT(*) FROM users WHERE role = 'customer')                                        AS total_customers,
       (SELECT COUNT(*) FROM users WHERE role = 'customer' AND status = 'active')                  AS active_customers,
       (SELECT COUNT(*) FROM users WHERE role = 'customer'
          AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01'))                                   AS new_this_month,
       (SELECT ROUND(COALESCE(100 * SUM(CASE WHEN cnt > 1 THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 0), 1)
          FROM (SELECT user_id, COUNT(*) AS cnt FROM orders
                 WHERE user_id IS NOT NULL GROUP BY user_id) AS per_user)                         AS repeat_rate`);
    return row ?? {};
}
/** Uses a static numbers table so any lookback window works (MySQL 5.7 compatible). */
async function dailyActivity(days = 90) {
    const span = Math.min(Math.max(Number(days) || 90, 1), 730);
    return (0, database_1.query)(`SELECT d.day,
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
       ORDER BY d.day ASC`, [span]);
}
async function countRows(sql, params = []) {
    const row = await (0, database_1.queryOne)(sql, params);
    return Number(row?.value ?? 0);
}
//# sourceMappingURL=dashboard.model.js.map