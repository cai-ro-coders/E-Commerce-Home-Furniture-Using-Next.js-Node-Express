"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingValueSchema = exports.settingListQuerySchema = exports.validateCouponSchema = exports.couponListQuerySchema = exports.updateCouponSchema = exports.createCouponSchema = exports.brandListQuerySchema = exports.updateBrandSchema = exports.createBrandSchema = exports.categoryListQuerySchema = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
const common_validator_1 = require("./common.validator");
// ---------------------------------------------------------------- categories
exports.createCategorySchema = zod_1.z.object({
    name: (0, common_validator_1.trimmedString)(2, 120, 'Category name'),
    parent_id: common_validator_1.optionalFlexibleNumber,
    slug: (0, common_validator_1.optionalTrimmedString)(140),
    image: common_validator_1.imagePathSchema,
    description: (0, common_validator_1.optionalTrimmedString)(2000),
    status: zod_1.z.enum(['active', 'inactive']).optional().default('active'),
});
exports.updateCategorySchema = exports.createCategorySchema.partial();
exports.categoryListQuerySchema = common_validator_1.listQuerySchema.extend({
    status: zod_1.z.enum(['active', 'inactive']).optional(),
    parent_id: common_validator_1.optionalFlexibleNumber,
});
// -------------------------------------------------------------------- brands
exports.createBrandSchema = zod_1.z.object({
    name: (0, common_validator_1.trimmedString)(2, 120, 'Brand name'),
    slug: (0, common_validator_1.optionalTrimmedString)(140),
    logo: common_validator_1.imagePathSchema,
    description: (0, common_validator_1.optionalTrimmedString)(2000),
    status: zod_1.z.enum(['active', 'inactive']).optional().default('active'),
});
exports.updateBrandSchema = exports.createBrandSchema.partial();
exports.brandListQuerySchema = common_validator_1.listQuerySchema.extend({
    status: zod_1.z.enum(['active', 'inactive']).optional(),
});
// ------------------------------------------------------------------- coupons
// The base object is kept separate from the refined schemas below so that
// `updateCouponSchema` can call `.partial()` on it (ZodEffects has no `.partial`).
const couponBase = zod_1.z.object({
    code: zod_1.z
        .string()
        .trim()
        .min(3, 'Coupon code is required')
        .max(40)
        .regex(/^[A-Za-z0-9_-]+$/, 'Code may only contain letters, numbers, dashes and underscores')
        .transform((value) => value.toUpperCase()),
    type: zod_1.z.enum(['percentage', 'fixed']),
    value: common_validator_1.moneySchema,
    minimum_order: common_validator_1.moneySchema.optional().default(0),
    maximum_discount: common_validator_1.optionalFlexibleNumber,
    usage_limit: common_validator_1.optionalFlexibleNumber,
    start_date: zod_1.z.coerce.date(),
    end_date: zod_1.z.coerce.date(),
    status: zod_1.z.enum(['active', 'inactive', 'expired']).optional().default('active'),
});
/** Cross-field rules that only make sense once every value is present. */
function refineCoupon(data, ctx) {
    if (data.type === 'percentage' && data.value !== undefined && data.value > 100) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['value'],
            message: 'A percentage coupon cannot exceed 100',
        });
    }
    if (data.start_date && data.end_date && data.end_date < data.start_date) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['end_date'],
            message: 'End date must be after the start date',
        });
    }
}
exports.createCouponSchema = couponBase.superRefine(refineCoupon);
exports.updateCouponSchema = couponBase.partial().superRefine(refineCoupon);
exports.couponListQuerySchema = common_validator_1.listQuerySchema.extend({
    status: zod_1.z.enum(['active', 'inactive', 'expired']).optional(),
    type: zod_1.z.enum(['percentage', 'fixed']).optional(),
});
exports.validateCouponSchema = zod_1.z.object({
    code: zod_1.z.string().trim().min(3).max(40).transform((value) => value.toUpperCase()),
    cart_total: zod_1.z.coerce.number().min(0),
});
// ------------------------------------------------------------------ settings
exports.settingListQuerySchema = common_validator_1.listQuerySchema.extend({
    group: zod_1.z.string().max(60).optional(),
});
exports.updateSettingValueSchema = zod_1.z.object({
    value: zod_1.z.string().max(5000).optional().default(''),
    group: zod_1.z.string().max(60).optional(),
});
//# sourceMappingURL=catalog.validator.js.map