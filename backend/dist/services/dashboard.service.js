"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileStats = exports.reviewStats = exports.customerStats = exports.orderStats = exports.productStats = exports.dashboardStats = void 0;
exports.getDashboard = getDashboard;
exports.getCalendarActivity = getCalendarActivity;
exports.getSalesAnalytics = getSalesAnalytics;
const dashboard_model_1 = require("../models/dashboard.model");
Object.defineProperty(exports, "customerStats", { enumerable: true, get: function () { return dashboard_model_1.customerStats; } });
const product_model_1 = require("../models/product.model");
Object.defineProperty(exports, "productStats", { enumerable: true, get: function () { return product_model_1.productStats; } });
const order_model_1 = require("../models/order.model");
Object.defineProperty(exports, "orderStats", { enumerable: true, get: function () { return order_model_1.orderStats; } });
const review_model_1 = require("../models/review.model");
Object.defineProperty(exports, "reviewStats", { enumerable: true, get: function () { return review_model_1.reviewStats; } });
const file_model_1 = require("../models/file.model");
Object.defineProperty(exports, "fileStats", { enumerable: true, get: function () { return file_model_1.fileStats; } });
const setting_model_1 = require("../models/setting.model");
const dashboard_model_2 = require("../models/dashboard.model");
Object.defineProperty(exports, "dashboardStats", { enumerable: true, get: function () { return dashboard_model_2.dashboardStats; } });
/**
 * One request powers the entire dashboard. Issuing the ~13 queries in parallel
 * keeps time-to-first-paint close to the slowest single query rather than their
 * sum.
 */
async function getDashboard(days = 14) {
    const [stats, productStatsRow, orderStatsRow, customerStatsRow, reviewStatsRow, fileStatsRow, sales, statusBreakdown, categorySales, bestSellers, recent, top, lowStock, settings,] = await Promise.all([
        (0, dashboard_model_2.dashboardStats)(),
        (0, product_model_1.productStats)(),
        (0, order_model_1.orderStats)(),
        (0, dashboard_model_1.customerStats)(),
        (0, review_model_1.reviewStats)(),
        (0, file_model_1.fileStats)(),
        (0, dashboard_model_1.salesSeries)(days),
        (0, dashboard_model_1.ordersByStatus)(),
        (0, dashboard_model_1.salesByCategory)(),
        (0, dashboard_model_1.bestSellingProducts)(6),
        (0, dashboard_model_1.recentOrders)(8),
        (0, dashboard_model_1.topCustomers)(5),
        (0, dashboard_model_1.lowStockProducts)(6),
        (0, setting_model_1.settingsMap)(),
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
async function getCalendarActivity(days = 90) {
    const rows = await (0, dashboard_model_1.dailyActivity)(days);
    return rows.map((row) => ({
        date: row.day,
        orders: row.orders,
        revenue: row.revenue,
        new_users: row.new_users,
        title: row.orders > 0
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
async function getSalesAnalytics(days = 30, groupBy = 'day') {
    const [series, status, categories, products, customers, settings] = await Promise.all([
        (0, dashboard_model_1.salesSeries)(days),
        (0, dashboard_model_1.ordersByStatus)(),
        (0, dashboard_model_1.salesByCategory)(),
        (0, dashboard_model_1.bestSellingProducts)(10),
        (0, dashboard_model_1.topCustomers)(10),
        (0, setting_model_1.settingsMap)(),
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
            average_order_value: totalOrders === 0 ? 0 : Math.round((totalRevenue / totalOrders) * 100) / 100,
            best_day: series.reduce((best, point) => (!best || point.revenue > best.revenue ? point : best), null),
        },
        orders_by_status: status,
        sales_by_category: categories,
        best_sellers: products,
        top_customers: customers,
    };
}
//# sourceMappingURL=dashboard.service.js.map