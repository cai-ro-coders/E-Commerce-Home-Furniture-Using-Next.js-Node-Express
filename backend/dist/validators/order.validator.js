"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moneySchema = exports.fileListQuerySchema = exports.updateAddressSchema = exports.addressSchema = exports.confirmPayPalPaymentSchema = exports.confirmStripePaymentSchema = exports.checkoutSchema = exports.reviewListQuerySchema = exports.updateReviewSchema = exports.createReviewSchema = exports.addWishlistSchema = exports.updateCartItemSchema = exports.addCartItemSchema = exports.orderStatusHistorySchema = exports.updateOrderStatusSchema = exports.updateOrderSchema = exports.createOrderSchema = exports.createOrderItemSchema = exports.orderListQuerySchema = void 0;
const zod_1 = require("zod");
const common_validator_1 = require("./common.validator");
Object.defineProperty(exports, "moneySchema", { enumerable: true, get: function () { return common_validator_1.moneySchema; } });
// ------------------------------------------------------------------- orders
exports.orderListQuerySchema = common_validator_1.listQuerySchema.extend({
    status: common_validator_1.orderStatusSchema.optional(),
    payment_status: common_validator_1.paymentStatusSchema.optional(),
    payment_method: common_validator_1.paymentMethodSchema.optional(),
    customer_id: common_validator_1.optionalFlexibleNumber,
    from: zod_1.z.string().max(30).optional(),
    to: zod_1.z.string().max(30).optional(),
    min_total: common_validator_1.optionalFlexibleNumber,
    max_total: common_validator_1.optionalFlexibleNumber,
});
exports.createOrderItemSchema = zod_1.z.object({
    product_id: zod_1.z.coerce.number().int().positive('Select a product'),
    quantity: zod_1.z.coerce.number().int().min(1, 'Quantity must be at least 1').max(999),
});
exports.createOrderSchema = zod_1.z.object({
    user_id: common_validator_1.optionalFlexibleNumber,
    shipping_address_id: common_validator_1.optionalFlexibleNumber,
    items: zod_1.z.array(exports.createOrderItemSchema).min(1, 'Add at least one item to the order'),
    payment_method: common_validator_1.paymentMethodSchema.optional().default('cod'),
    payment_status: common_validator_1.paymentStatusSchema.optional().default('Pending'),
    order_status: common_validator_1.orderStatusSchema.optional().default('Pending'),
    coupon_code: (0, common_validator_1.optionalTrimmedString)(40),
    notes: (0, common_validator_1.optionalTrimmedString)(2000),
    shipping_fee: common_validator_1.optionalFlexibleNumber,
    tax: common_validator_1.optionalFlexibleNumber,
});
exports.updateOrderSchema = zod_1.z.object({
    order_status: common_validator_1.orderStatusSchema.optional(),
    payment_status: common_validator_1.paymentStatusSchema.optional(),
    payment_method: common_validator_1.paymentMethodSchema.optional(),
    shipping_address_id: common_validator_1.optionalFlexibleNumber,
    notes: (0, common_validator_1.optionalTrimmedString)(2000),
    shipping_fee: common_validator_1.optionalFlexibleNumber,
    tax: common_validator_1.optionalFlexibleNumber,
    discount: common_validator_1.optionalFlexibleNumber,
});
exports.updateOrderStatusSchema = zod_1.z.object({
    order_status: common_validator_1.orderStatusSchema,
    payment_status: common_validator_1.paymentStatusSchema.optional(),
    note: (0, common_validator_1.optionalTrimmedString)(255),
});
exports.orderStatusHistorySchema = zod_1.z.object({
    status: common_validator_1.orderStatusSchema,
    note: (0, common_validator_1.optionalTrimmedString)(255),
});
// ---------------------------------------------------------------------- cart
exports.addCartItemSchema = zod_1.z.object({
    product_id: zod_1.z.coerce.number().int().positive('Product is required'),
    quantity: zod_1.z.coerce.number().int().min(1, 'Quantity must be at least 1').max(999).optional().default(1),
});
exports.updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.coerce.number().int().min(1, 'Quantity must be at least 1').max(999),
});
// ------------------------------------------------------------------ wishlist
exports.addWishlistSchema = zod_1.z.object({
    product_id: zod_1.z.coerce.number().int().positive('Product is required'),
});
// ------------------------------------------------------------------- reviews
exports.createReviewSchema = zod_1.z.object({
    product_id: zod_1.z.coerce.number().int().positive('Product is required'),
    rating: zod_1.z.coerce
        .number()
        .int()
        .min(1, 'Rating must be between 1 and 5')
        .max(5, 'Rating must be between 1 and 5'),
    title: (0, common_validator_1.optionalTrimmedString)(160),
    comment: (0, common_validator_1.optionalTrimmedString)(5000),
});
exports.updateReviewSchema = zod_1.z.object({
    rating: zod_1.z.coerce.number().int().min(1).max(5).optional(),
    title: (0, common_validator_1.optionalTrimmedString)(160),
    comment: (0, common_validator_1.optionalTrimmedString)(5000),
    status: zod_1.z.enum(['pending', 'approved', 'rejected']).optional(),
});
exports.reviewListQuerySchema = common_validator_1.listQuerySchema.extend({
    status: zod_1.z.enum(['pending', 'approved', 'rejected']).optional(),
    product_id: common_validator_1.optionalFlexibleNumber,
    rating: common_validator_1.optionalFlexibleNumber,
});
// ------------------------------------------------------------------ checkout
exports.checkoutSchema = zod_1.z.object({
    shipping_address_id: zod_1.z.coerce.number().int().positive('Select a shipping address'),
    payment_method: common_validator_1.paymentMethodSchema.optional().default('cod'),
    coupon_code: (0, common_validator_1.optionalTrimmedString)(40),
    notes: (0, common_validator_1.optionalTrimmedString)(2000),
    items: zod_1.z
        .array(exports.createOrderItemSchema.partial({ product_id: true }).extend({
        product_id: zod_1.z.coerce.number().int().positive(),
    }))
        .optional(),
});
/** Called by the Stripe success page to settle the order. */
exports.confirmStripePaymentSchema = zod_1.z.object({
    session_id: (0, common_validator_1.trimmedString)(5, 255, 'Stripe session id'),
});
/** Called by the PayPal return page with the `token` PayPal appended. */
exports.confirmPayPalPaymentSchema = zod_1.z.object({
    paypal_order_id: (0, common_validator_1.trimmedString)(5, 255, 'PayPal order id'),
});
// ------------------------------------------------------------------ addresses
exports.addressSchema = zod_1.z.object({
    full_name: (0, common_validator_1.trimmedString)(2, 120, 'Full name'),
    phone: (0, common_validator_1.trimmedString)(7, 32, 'Phone number'),
    address_line_1: (0, common_validator_1.trimmedString)(5, 255, 'Address line 1'),
    address_line_2: (0, common_validator_1.optionalTrimmedString)(255),
    city: (0, common_validator_1.trimmedString)(2, 120, 'City'),
    province: (0, common_validator_1.optionalTrimmedString)(120),
    postal_code: (0, common_validator_1.optionalTrimmedString)(20),
    country: zod_1.z.string().trim().max(120).optional().default('Philippines'),
    is_default: common_validator_1.optionalFlexibleBoolean.default(false),
});
exports.updateAddressSchema = exports.addressSchema.partial();
// -------------------------------------------------------------------- files
exports.fileListQuerySchema = common_validator_1.listQuerySchema.extend({
    category: zod_1.z
        .enum(['image', 'document', 'contract', 'invoice', 'customer', 'other'])
        .optional(),
});
//# sourceMappingURL=order.validator.js.map