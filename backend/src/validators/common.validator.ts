import { z } from 'zod';

/** Strip unknown keys so a caller can never set `role`, `id`, or `created_at` by accident. */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'Invalid id' }),
});

/** `/:productId` routes (wishlist) — the param is not named `id`. */
export const productIdParamSchema = z.object({
  productId: z.coerce.number().int().positive({ message: 'Invalid product id' }),
});

/** `/items/:itemId` routes (cart lines). */
export const itemIdParamSchema = z.object({
  itemId: z.coerce.number().int().positive({ message: 'Invalid cart item' }),
});

/** `/:id/images/:imageId` routes. */
export const productImageParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'Invalid product id' }),
  imageId: z.coerce.number().int().positive({ message: 'Invalid image id' }),
});

export const optionalIdParamSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
});

/** Shared list/search query fragment used by every paginated endpoint. */
export const listQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .min(1)
      .max(200)
      .optional()
      .default(10),
    search: z.string().max(190).optional().default(''),
    sortBy: z.string().max(60).optional(),
    sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
    // DataTables server-side fields
    draw: z.coerce.number().int().optional(),
    start: z.coerce.number().int().nonnegative().optional(),
    length: z.coerce.number().int().nonnegative().optional(),
    'search[value]': z.string().max(190).optional(),
    'order[0][dir]': z.enum(['asc', 'desc']).optional(),
  })
  // Column filters are per-resource (`role`, `status`, `category_id`, …) and
  // each list schema extends this with its own allow-list. Anything left over
  // is preserved so `parseListQuery` can still see it — a plain `z.object`
  // would strip them and every filter would silently be ignored.
  .catchall(z.union([z.string(), z.number(), z.boolean(), z.undefined()]));

/** `key=value` pairs for the "Create / Edit settings" forms. */
export const upsertSettingSchema = z.object({
  key: z
    .string()
    .min(1, 'Key is required')
    .max(120)
    .regex(/^[a-z0-9_]+$/i, 'Key may only contain letters, numbers and underscores'),
  group: z.string().max(60).optional().default('general'),
  value: z.string().max(5000).optional().default(''),
});

export const idBodySchema = z.object({
  id: z.coerce.number().int().positive(),
});

/** Accepts either JSON or multipart form-data (where numbers arrive as strings). */
export const flexibleNumber = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.number().finite()
);

export const flexibleBoolean = z.preprocess((value) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return value;
}, z.boolean());

export const optionalFlexibleNumber = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  z.coerce.number().finite().optional()
);

export const optionalFlexibleBoolean = z.preprocess((value) => {
  if (value === undefined || value === '' || value === null) return undefined;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  return value;
}, z.boolean().optional());

/** Trim + collapse whitespace; reject values that are only whitespace. */
export const trimmedString = (min: number, max: number, label: string) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);

export const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value === '' ? undefined : value));

export const imagePathSchema = z
  .string()
  .trim()
  .max(255)
  .optional()
  .transform((value) => (value === '' ? undefined : value))
  .refine(
    (value) =>
      value === undefined ||
      value.startsWith('/uploads/') ||
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('/'),
    'Image must be an uploaded path or an absolute URL'
  );

/** A currency amount: non-negative, at most 2 decimal places, sane ceiling. */
export const moneySchema = z.coerce
  .number()
  .min(0, 'Amount cannot be negative')
  .max(99_999_999.99, 'Amount is too large')
  .refine((value) => Math.round(value * 100) === value * 100, {
    message: 'Amount may have at most 2 decimal places',
  });

export const optionalMoneySchema = z.preprocess(
  (value) => (value === '' || value === null ? undefined : value),
  moneySchema.optional()
);

export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .max(190)
  .email('Enter a valid email address');

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s()]{7,32}$/, 'Enter a valid phone number')
  .optional()
  .or(z.literal('').transform(() => undefined));

export const orderStatusSchema = z.enum([
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Returned',
]);

export const paymentStatusSchema = z.enum(['Pending', 'Paid', 'Failed', 'Refunded']);

export const paymentMethodSchema = z.enum(['cod', 'bank_transfer', 'stripe', 'paypal']);
