"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesAnalyticsHandler = exports.calendarHandler = exports.dashboardHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const dashboard_service_1 = require("../services/dashboard.service");
exports.dashboardHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const days = Math.min(365, Math.max(7, Number(req.query.days ?? 14)));
    return (0, ApiResponse_1.ok)(res, await (0, dashboard_service_1.getDashboard)(days));
});
/** Per-day series for the FullCalendar dashboard view. */
exports.calendarHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const days = Math.min(365, Math.max(7, Number(req.query.days ?? 90)));
    return (0, ApiResponse_1.ok)(res, await (0, dashboard_service_1.getCalendarActivity)(days));
});
/**
 * Time-series data for the Sales Analytics page. Separate from `/dashboard`
 * so the chart view can request a long window without dragging the whole
 * widget payload along with it.
 */
exports.salesAnalyticsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const days = Math.min(730, Math.max(7, Number(req.query.days ?? 30)));
    const groupBy = req.query.group_by === 'month' ? 'month' : 'day';
    return (0, ApiResponse_1.ok)(res, await (0, dashboard_service_1.getSalesAnalytics)(days, groupBy));
});
//# sourceMappingURL=dashboard.controller.js.map