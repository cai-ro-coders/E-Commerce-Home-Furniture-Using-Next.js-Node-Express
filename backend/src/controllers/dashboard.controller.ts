import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/ApiResponse';
import { getCalendarActivity, getDashboard, getSalesAnalytics } from '../services/dashboard.service';

export const dashboardHandler = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(365, Math.max(7, Number(req.query.days ?? 14)));
  return ok(res, await getDashboard(days));
});

/** Per-day series for the FullCalendar dashboard view. */
export const calendarHandler = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(365, Math.max(7, Number(req.query.days ?? 90)));
  return ok(res, await getCalendarActivity(days));
});

/**
 * Time-series data for the Sales Analytics page. Separate from `/dashboard`
 * so the chart view can request a long window without dragging the whole
 * widget payload along with it.
 */
export const salesAnalyticsHandler = asyncHandler(async (req: Request, res: Response) => {
  const days = Math.min(730, Math.max(7, Number(req.query.days ?? 30)));
  const groupBy = req.query.group_by === 'month' ? 'month' : 'day';
  return ok(res, await getSalesAnalytics(days, groupBy));
});
