import { z } from 'zod';
import {
  listQuerySchema,
  moneySchema,
  optionalFlexibleBoolean,
  optionalFlexibleNumber,
  optionalTrimmedString,
  orderStatusSchema,
  paymentMethodSchema,
  paymentStatusSchema,
  trimmedString,
} from './common.validator';

// ------------------------------------------------------------------- orders
export const orderListQuerySchema = listQuerySchema.extend({
  status: orderStatusSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  payment_method: paymentMethodSchema.optional(),
  customer_id: optionalFlexibleNumber,
  from: z.string().max(30).optional(),
  to: z.string().max(30).optional(),
  min_total: optionalFlexibleNumber,
  max_total: optionalFlexibleNumber,
});

export const createOrderItemSchema = z.object({
  product_id: z.coerce.number().int().positive('Select a product'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(999),
});

export const createOrderSchema = z.object({
  user_id: optionalFlexibleNumber,
  shipping_address_id: optionalFlexibleNumber,
  items: z.array(createOrderItemSchema).min(1, 'Add at least one item to the order'),
  payment_method: paymentMethodSchema.optional().default('cod'),
  payment_status: paymentStatusSchema.optional().default('Pending'),
  order_status: orderStatusSchema.optional().default('Pending'),
  coupon_code: optionalTrimmedString(40),
  notes: optionalTrimmedString(2000),
  shipping_fee: optionalFlexibleNumber,
  tax: optionalFlexibleNumber,
});

export const updateOrderSchema = z.object({
  order_status: orderStatusSchema.optional(),
  payment_status: paymentStatusSchema.optional(),
  payment_method: paymentMethodSchema.optional(),
  shipping_address_id: optionalFlexibleNumber,
  notes: optionalTrimmedString(2000),
  shipping_fee: optionalFlexibleNumber,
  tax: optionalFlexibleNumber,
  discount: optionalFlexibleNumber,
});

export const updateOrderStatusSchema = z.object({
  order_status: orderStatusSchema,
  payment_status: paymentStatusSchema.optional(),
  note: optionalTrimmedString(255),
});

export const orderStatusHistorySchema = z.object({
  status: orderStatusSchema,
  note: optionalTrimmedString(255),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;

// ---------------------------------------------------------------------- cart
export const addCartItemSchema = z.object({
  product_id: z.coerce.number().int().positive('Product is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(999).optional().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(999),
});

// ------------------------------------------------------------------ wishlist
export const addWishlistSchema = z.object({
  product_id: z.coerce.number().int().positive('Product is required'),
});

// ------------------------------------------------------------------- reviews
export const createReviewSchema = z.object({
  product_id: z.coerce.number().int().positive('Product is required'),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  title: optionalTrimmedString(160),
  comment: optionalTrimmedString(5000),
});

export const updateReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  title: optionalTrimmedString(160),
  comment: optionalTrimmedString(5000),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export const reviewListQuerySchema = listQuerySchema.extend({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  product_id: optionalFlexibleNumber,
  rating: optionalFlexibleNumber,
});

// ------------------------------------------------------------------ checkout
export const checkoutSchema = z.object({
  shipping_address_id: z.coerce.number().int().positive('Select a shipping address'),
  payment_method: paymentMethodSchema.optional().default('cod'),
  coupon_code: optionalTrimmedString(40),
  notes: optionalTrimmedString(2000),
  items: z
    .array(createOrderItemSchema.partial({ product_id: true }).extend({
      product_id: z.coerce.number().int().positive(),
    }))
    .optional(),
});

/** Called by the Stripe success page to settle the order. */
export const confirmStripePaymentSchema = z.object({
  session_id: trimmedString(5, 255, 'Stripe session id'),
});

/** Called by the PayPal return page with the `token` PayPal appended. */
export const confirmPayPalPaymentSchema = z.object({
  paypal_order_id: trimmedString(5, 255, 'PayPal order id'),
});

// ------------------------------------------------------------------ addresses
export const addressSchema = z.object({
  full_name: trimmedString(2, 120, 'Full name'),
  phone: trimmedString(7, 32, 'Phone number'),
  address_line_1: trimmedString(5, 255, 'Address line 1'),
  address_line_2: optionalTrimmedString(255),
  city: trimmedString(2, 120, 'City'),
  province: optionalTrimmedString(120),
  postal_code: optionalTrimmedString(20),
  country: z.string().trim().max(120).optional().default('Philippines'),
  is_default: optionalFlexibleBoolean.default(false),
});

export const updateAddressSchema = addressSchema.partial();

// -------------------------------------------------------------------- files
export const fileListQuerySchema = listQuerySchema.extend({
  category: z
    .enum(['image', 'document', 'contract', 'invoice', 'customer', 'other'])
    .optional(),
});

export { moneySchema };
