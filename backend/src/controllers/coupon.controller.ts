import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok, paginated } from '../utils/ApiResponse';
import { parseListQuery } from '../utils/pagination';
import { ApiError } from '../utils/ApiError';
import {
  checkCoupon,
  createNewCoupon,
  exportCoupons,
  getCoupon,
  getCouponUsages,
  getCoupons,
  removeCoupon,
  updateExistingCoupon,
} from '../services/coupon.service';

export const listCouponsHandler = asyncHandler(async (req: Request, res: Response) => {
  return paginated(res, await getCoupons(parseListQuery(req)));
});

export const getCouponHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getCoupon(Number(req.params.id)));
});

/** Redemption history for the coupon detail drawer. */
export const couponUsagesHandler = asyncHandler(async (req: Request, res: Response) => {
  return paginated(res, await getCouponUsages(Number(req.params.id), parseListQuery(req)));
});

export const createCouponHandler = asyncHandler(async (req: Request, res: Response) => {
  const record = await createNewCoupon(req.body);
  return created(res, { id: record!.id }, 'Coupon created successfully');
});

export const updateCouponHandler = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await updateExistingCoupon(Number(req.params.id), req.body);
  return ok(res, coupon, 'Coupon updated successfully');
});

export const deleteCouponHandler = asyncHandler(async (req: Request, res: Response) => {
  await removeCoupon(Number(req.params.id));
  return noContent(res);
});

/**
 * Validate a code against the caller's cart total. Signed in because the
 * usage limit is per-user, so an anonymous check would be misleading.
 */
export const validateCouponHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as { code: string; cart_total: number };
  if (typeof body.cart_total !== 'number' || body.cart_total < 0) {
    throw ApiError.badRequest('A cart total is required to validate a coupon');
  }
  const result = await checkCoupon(body.code, body.cart_total, req.user?.id ?? null);
  return ok(res, result, 'Coupon is valid');
});

export const exportCouponsHandler = asyncHandler(async (req: Request, res: Response) => {
  const format = req.query.format === 'json' ? 'json' : 'csv';
  const file = await exportCoupons(parseListQuery(req), format);
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  return res.send(file.body);
});
