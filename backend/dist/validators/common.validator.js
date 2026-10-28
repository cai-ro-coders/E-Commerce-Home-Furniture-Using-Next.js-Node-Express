"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentMethodSchema = exports.paymentStatusSchema = exports.orderStatusSchema = exports.phoneSchema = exports.emailSchema = exports.optionalMoneySchema = exports.moneySchema = exports.imagePathSchema = exports.optionalTrimmedString = exports.trimmedString = exports.optionalFlexibleBoolean = exports.optionalFlexibleNumber = exports.flexibleBoolean = exports.flexibleNumber = exports.idBodySchema = exports.upsertSettingSchema = exports.listQuerySchema = exports.optionalIdParamSchema = exports.productImageParamSchema = exports.itemIdParamSchema = exports.productIdParamSchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
/** Strip unknown keys so a caller can never set `role`, `id`, or `created_at` by accident. */
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive({ message: 'Invalid id' }),
});
/** `/:productId` routes (wishlist) — the param is not named `id`. */
exports.productIdParamSchema = zod_1.z.object({
    productId: zod_1.z.coerce.number().int().positive({ message: 'Invalid product id' }),
});
/** `/items/:itemId` routes (cart lines). */
exports.itemIdParamSchema = zod_1.z.object({
    itemId: zod_1.z.coerce.number().int().positive({ message: 'Invalid cart item' }),
});
/** `/:id/images/:imageId` routes. */
exports.productImageParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive({ message: 'Invalid product id' }),
    imageId: zod_1.z.coerce.number().int().positive({ message: 'Invalid image id' }),
});
exports.optionalIdParamSchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive().optional(),
});
/** Shared list/search query fragment used by every paginated endpoint. */
exports.listQuerySchema = zod_1.z
    .object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    pageSize: zod_1.z.coerce
        .number()
        .int()
        .min(1)
        .max(200)
        .optional()
        .default(10),
    search: zod_1.z.string().max(190).optional().default(''),
    sortBy: zod_1.z.string().max(60).optional(),
    sortDir: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
    // DataTables server-side fields
    draw: zod_1.z.coerce.number().int().optional(),
    start: zod_1.z.coerce.number().int().nonnegative().optional(),
    length: zod_1.z.coerce.number().int().nonnegative().optional(),
    'search[value]': zod_1.z.string().max(190).optional(),
    'order[0][dir]': zod_1.z.enum(['asc', 'desc']).optional(),
})
    // Column filters are per-resource (`role`, `status`, `category_id`, …) and
    // each list schema extends this with its own allow-list. Anything left over
    // is preserved so `parseListQuery` can still see it — a plain `z.object`
    // would strip them and every filter would silently be ignored.
    .catchall(zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.undefined()]));
/** `key=value` pairs for the "Create / Edit settings" forms. */
exports.upsertSettingSchema = zod_1.z.object({
    key: zod_1.z
        .string()
        .min(1, 'Key is required')
        .max(120)
        .regex(/^[a-z0-9_]+$/i, 'Key may only contain letters, numbers and underscores'),
    group: zod_1.z.string().max(60).optional().default('general'),
    value: zod_1.z.string().max(5000).optional().default(''),
});
exports.idBodySchema = zod_1.z.object({
    id: zod_1.z.coerce.number().int().positive(),
});
/** Accepts either JSON or multipart form-data (where numbers arrive as strings). */
exports.flexibleNumber = zod_1.z.preprocess((value) => (value === '' || value === null ? undefined : value), zod_1.z.coerce.number().finite());
exports.flexibleBoolean = zod_1.z.preprocess((value) => {
    if (typeof value === 'boolean')
        return value;
    if (value === 'true' || value === '1' || value === 1)
        return true;
    if (value === 'false' || value === '0' || value === 0)
        return false;
    return value;
}, zod_1.z.boolean());
exports.optionalFlexibleNumber = zod_1.z.preprocess((value) => (value === '' || value === null ? undefined : value), zod_1.z.coerce.number().finite().optional());
exports.optionalFlexibleBoolean = zod_1.z.preprocess((value) => {
    if (value === undefined || value === '' || value === null)
        return undefined;
    if (value === 'true' || value === '1' || value === 1)
        return true;
    if (value === 'false' || value === '0' || value === 0)
        return false;
    return value;
}, zod_1.z.boolean().optional());
/** Trim + collapse whitespace; reject values that are only whitespace. */
const trimmedString = (min, max, label) => zod_1.z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);
exports.trimmedString = trimmedString;
const optionalTrimmedString = (max) => zod_1.z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === '' ? undefined : value));
exports.optionalTrimmedString = optionalTrimmedString;
exports.imagePathSchema = zod_1.z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((value) => (value === '' ? undefined : value))
    .refine((value) => value === undefined ||
    value.startsWith('/uploads/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/'), 'Image must be an uploaded path or an absolute URL');
/** A currency amount: non-negative, at most 2 decimal places, sane ceiling. */
exports.moneySchema = zod_1.z.coerce
    .number()
    .min(0, 'Amount cannot be negative')
    .max(99_999_999.99, 'Amount is too large')
    .refine((value) => Math.round(value * 100) === value * 100, {
    message: 'Amount may have at most 2 decimal places',
});
exports.optionalMoneySchema = zod_1.z.preprocess((value) => (value === '' || value === null ? undefined : value), exports.moneySchema.optional());
exports.emailSchema = zod_1.z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .max(190)
    .email('Enter a valid email address');
exports.phoneSchema = zod_1.z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,32}$/, 'Enter a valid phone number')
    .optional()
    .or(zod_1.z.literal('').transform(() => undefined));
exports.orderStatusSchema = zod_1.z.enum([
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
    'Returned',
]);
exports.paymentStatusSchema = zod_1.z.enum(['Pending', 'Paid', 'Failed', 'Refunded']);
exports.paymentMethodSchema = zod_1.z.enum(['cod', 'bank_transfer', 'stripe', 'paypal']);
//# sourceMappingURL=common.validator.js.map