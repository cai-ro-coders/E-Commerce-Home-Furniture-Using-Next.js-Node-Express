import { ApiError } from '../utils/ApiError';
import { toCsv } from '../utils/csv';
import {
  codeExists,
  createCoupon,
  deleteCoupon,
  evaluateCoupon,
  findCouponByCode,
  findCouponById,
  listCouponUsages,
  listCoupons,
  updateCoupon,
  type CouponPatch,
} from '../models/coupon.model';
import type { ListQuery } from '../types';

export async function getCoupons(list: ListQuery) {
  return listCoupons(list);
}

export async function getCoupon(id: number) {
  const coupon = await findCouponById(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return coupon;
}

/** Redemption history for one coupon, newest first — the detail drawer's tab. */
export async function getCouponUsages(id: number, list: ListQuery) {
  const coupon = await findCouponById(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return listCouponUsages(id, list);
}

export async function createNewCoupon(data: Record<string, unknown>) {
  const code = String(data.code).toUpperCase();
  if (await codeExists(code)) throw ApiError.conflict('A coupon with that code already exists');

  const id = await createCoupon({
    code,
    type: data.type as 'percentage' | 'fixed',
    value: Number(data.value),
    minimum_order: Number(data.minimum_order ?? 0),
    maximum_discount:
      data.maximum_discount === undefined || data.maximum_discount === null
        ? null
        : Number(data.maximum_discount),
    usage_limit: data.usage_limit === undefined || data.usage_limit === null ? null : Number(data.usage_limit),
    start_date: toMysqlDateTime(data.start_date),
    end_date: toMysqlDateTime(data.end_date),
    status: (data.status as 'active' | 'inactive' | 'expired') ?? 'active',
  });
  return findCouponById(id);
}

export async function updateExistingCoupon(id: number, data: Record<string, unknown>) {
  const existing = await findCouponById(id);
  if (!existing) throw ApiError.notFound('Coupon not found');

  if (data.code) {
    const code = String(data.code).toUpperCase();
    if (code !== existing.code && (await codeExists(code, id))) {
      throw ApiError.conflict('A coupon with that code already exists');
    }
    data.code = code;
  }

  const patch: CouponPatch = {};
  if (data.code !== undefined) patch.code = data.code as string;
  if (data.type !== undefined) patch.type = data.type as 'percentage' | 'fixed';
  if (data.value !== undefined) patch.value = Number(data.value);
  if (data.minimum_order !== undefined) patch.minimum_order = Number(data.minimum_order);
  if (data.maximum_discount !== undefined) {
    patch.maximum_discount = data.maximum_discount === null ? null : Number(data.maximum_discount);
  }
  if (data.usage_limit !== undefined) {
    patch.usage_limit = data.usage_limit === null ? null : Number(data.usage_limit);
  }
  if (data.start_date !== undefined) patch.start_date = toMysqlDateTime(data.start_date);
  if (data.end_date !== undefined) patch.end_date = toMysqlDateTime(data.end_date);
  if (data.status !== undefined) patch.status = data.status as 'active' | 'inactive' | 'expired';

  // Validate the merged window rather than the partial patch.
  const start = patch.start_date
    ? new Date(patch.start_date.replace(' ', 'T'))
    : new Date(existing.start_date.replace(' ', 'T'));
  const end = patch.end_date
    ? new Date(patch.end_date.replace(' ', 'T'))
    : new Date(existing.end_date.replace(' ', 'T'));
  if (end < start) throw ApiError.badRequest('End date must be after the start date');

  await updateCoupon(id, patch);
  return findCouponById(id);
}

export async function removeCoupon(id: number) {
  const coupon = await findCouponById(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  await deleteCoupon(id);
  return true;
}

/** Public: validate a coupon against the caller's cart total. */
export async function checkCoupon(code: string, cartTotal: number, userId: number | null) {
  return evaluateCoupon(code, cartTotal, userId);
}

export async function exportCoupons(list: ListQuery, format: 'csv' | 'json') {
  const result = await listCoupons({ ...list, page: 1, pageSize: 10000 });

  if (format === 'json') {
    return {
      body: JSON.stringify(result.data, null, 2),
      mimeType: 'application/json',
      filename: `coupons-export-${Date.now()}.json`,
    };
  }

  const csv = toCsv(result.data, [
    { key: 'id', header: 'ID' },
    { key: 'code', header: 'Code' },
    { key: 'type', header: 'Type' },
    { key: 'value', header: 'Value' },
    { key: 'minimum_order', header: 'Min Order' },
    { key: 'maximum_discount', header: 'Max Discount' },
    { key: 'usage_limit', header: 'Usage Limit' },
    { key: 'used_count', header: 'Used' },
    { key: 'start_date', header: 'Start Date' },
    { key: 'end_date', header: 'End Date' },
    { key: 'status', header: 'Status' },
  ]);
  return { body: csv, mimeType: 'text/csv; charset=utf-8', filename: `coupons-export-${Date.now()}.csv` };
}

/** Normalise whatever the client sent (ISO string, Date) into MySQL DATETIME. */
function toMysqlDateTime(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 19).replace('T', ' ');
  }
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) throw ApiError.badRequest('Invalid date');
  return parsed.toISOString().slice(0, 19).replace('T', ' ');
}

export { findCouponByCode };
