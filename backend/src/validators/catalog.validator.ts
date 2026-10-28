import { z } from 'zod';
import {
  imagePathSchema,
  listQuerySchema,
  moneySchema,
  optionalFlexibleNumber,
  optionalTrimmedString,
  trimmedString,
} from './common.validator';

// ---------------------------------------------------------------- categories
export const createCategorySchema = z.object({
  name: trimmedString(2, 120, 'Category name'),
  parent_id: optionalFlexibleNumber,
  slug: optionalTrimmedString(140),
  image: imagePathSchema,
  description: optionalTrimmedString(2000),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateCategorySchema = createCategorySchema.partial();

export const categoryListQuerySchema = listQuerySchema.extend({
  status: z.enum(['active', 'inactive']).optional(),
  parent_id: optionalFlexibleNumber,
});

// -------------------------------------------------------------------- brands
export const createBrandSchema = z.object({
  name: trimmedString(2, 120, 'Brand name'),
  slug: optionalTrimmedString(140),
  logo: imagePathSchema,
  description: optionalTrimmedString(2000),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateBrandSchema = createBrandSchema.partial();

export const brandListQuerySchema = listQuerySchema.extend({
  status: z.enum(['active', 'inactive']).optional(),
});

// ------------------------------------------------------------------- coupons
// The base object is kept separate from the refined schemas below so that
// `updateCouponSchema` can call `.partial()` on it (ZodEffects has no `.partial`).
const couponBase = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'Coupon code is required')
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, 'Code may only contain letters, numbers, dashes and underscores')
    .transform((value) => value.toUpperCase()),
  type: z.enum(['percentage', 'fixed']),
  value: moneySchema,
  minimum_order: moneySchema.optional().default(0),
  maximum_discount: optionalFlexibleNumber,
  usage_limit: optionalFlexibleNumber,
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  status: z.enum(['active', 'inactive', 'expired']).optional().default('active'),
});

/** Cross-field rules that only make sense once every value is present. */
function refineCoupon(
  data: { type?: string; value?: number; start_date?: Date; end_date?: Date },
  ctx: z.RefinementCtx
): void {
  if (data.type === 'percentage' && data.value !== undefined && data.value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['value'],
      message: 'A percentage coupon cannot exceed 100',
    });
  }
  if (data.start_date && data.end_date && data.end_date < data.start_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['end_date'],
      message: 'End date must be after the start date',
    });
  }
}

export const createCouponSchema = couponBase.superRefine(refineCoupon);

export const updateCouponSchema = couponBase.partial().superRefine(refineCoupon);

export const couponListQuerySchema = listQuerySchema.extend({
  status: z.enum(['active', 'inactive', 'expired']).optional(),
  type: z.enum(['percentage', 'fixed']).optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().trim().min(3).max(40).transform((value) => value.toUpperCase()),
  cart_total: z.coerce.number().min(0),
});

// ------------------------------------------------------------------ settings
export const settingListQuerySchema = listQuerySchema.extend({
  group: z.string().max(60).optional(),
});

export const updateSettingValueSchema = z.object({
  value: z.string().max(5000).optional().default(''),
  group: z.string().max(60).optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
