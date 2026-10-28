"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryAdjustmentSchema = exports.productImageSchema = exports.productSpecificationsSchema = exports.specificationSchema = exports.productListQuerySchema = exports.updateProductSchema = exports.createProductSchema = exports.productStatuses = void 0;
const zod_1 = require("zod");
const common_validator_1 = require("./common.validator");
exports.productStatuses = ['active', 'draft', 'archived'];
const productBase = {
    name: (0, common_validator_1.trimmedString)(3, 200, 'Product name'),
    category_id: zod_1.z.coerce.number().int().positive('Select a category'),
    brand_id: common_validator_1.optionalFlexibleNumber,
    sku: zod_1.z
        .string()
        .trim()
        .min(3, 'SKU is required')
        .max(64)
        .regex(/^[A-Za-z0-9._-]+$/, 'SKU may only contain letters, numbers, dots, dashes and underscores')
        .optional(),
    short_description: (0, common_validator_1.optionalTrimmedString)(500),
    description: (0, common_validator_1.optionalTrimmedString)(20000),
    price: common_validator_1.moneySchema,
    sale_price: common_validator_1.optionalFlexibleNumber,
    cost_price: common_validator_1.optionalFlexibleNumber,
    weight: common_validator_1.optionalFlexibleNumber,
    dimensions: (0, common_validator_1.optionalTrimmedString)(120),
    stock_quantity: zod_1.z.coerce.number().int().min(0, 'Stock cannot be negative').optional().default(0),
    minimum_stock: zod_1.z.coerce.number().int().min(0).optional().default(5),
    featured: common_validator_1.optionalFlexibleBoolean.default(false),
    status: zod_1.z.enum(exports.productStatuses).optional().default('active'),
    image: common_validator_1.imagePathSchema,
};
exports.createProductSchema = zod_1.z
    .object(productBase)
    .superRefine((data, ctx) => {
    if (data.sale_price !== undefined && data.sale_price >= data.price) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['sale_price'],
            message: 'Sale price must be lower than the regular price',
        });
    }
    if (data.cost_price !== undefined && data.price > 0 && data.cost_price > data.price) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['cost_price'],
            message: 'Cost price is usually below the selling price',
        });
    }
});
exports.updateProductSchema = zod_1.z.object(productBase).partial();
exports.productListQuerySchema = common_validator_1.listQuerySchema.extend({
    // Flexible helpers so an empty query param (`?category_id=`) is treated as
    // "no filter" rather than coerced to 0, and `?featured=false` really is false.
    category_id: common_validator_1.optionalFlexibleNumber,
    brand_id: common_validator_1.optionalFlexibleNumber,
    status: zod_1.z.enum(exports.productStatuses).optional(),
    featured: common_validator_1.optionalFlexibleBoolean,
    min_price: common_validator_1.optionalFlexibleNumber,
    max_price: common_validator_1.optionalFlexibleNumber,
    low_stock: common_validator_1.optionalFlexibleBoolean,
    out_of_stock: common_validator_1.optionalFlexibleBoolean,
});
exports.specificationSchema = zod_1.z.object({
    attribute_name: (0, common_validator_1.trimmedString)(2, 120, 'Attribute name'),
    attribute_value: (0, common_validator_1.trimmedString)(1, 255, 'Attribute value'),
});
exports.productSpecificationsSchema = zod_1.z.object({
    specifications: zod_1.z.array(exports.specificationSchema).max(60).default([]),
});
exports.productImageSchema = zod_1.z.object({
    image: zod_1.z.string().trim().min(1, 'Image path is required').max(255),
    is_primary: common_validator_1.optionalFlexibleBoolean.default(false),
    sort_order: zod_1.z.coerce.number().int().min(0).optional().default(0),
});
exports.inventoryAdjustmentSchema = zod_1.z.object({
    type: zod_1.z.enum(['stock_in', 'stock_out', 'adjustment', 'return']),
    quantity: zod_1.z.coerce
        .number()
        .int()
        .refine((value) => value !== 0, 'Quantity cannot be zero'),
    reference: (0, common_validator_1.optionalTrimmedString)(64),
    remarks: (0, common_validator_1.optionalTrimmedString)(255),
});
//# sourceMappingURL=product.validator.js.map