import { z } from 'zod';
import {
  imagePathSchema,
  listQuerySchema,
  moneySchema,
  optionalFlexibleBoolean,
  optionalFlexibleNumber,
  optionalTrimmedString,
  trimmedString,
} from './common.validator';

export const productStatuses = ['active', 'draft', 'archived'] as const;

const productBase = {
  name: trimmedString(3, 200, 'Product name'),
  category_id: z.coerce.number().int().positive('Select a category'),
  brand_id: optionalFlexibleNumber,
  sku: z
    .string()
    .trim()
    .min(3, 'SKU is required')
    .max(64)
    .regex(/^[A-Za-z0-9._-]+$/, 'SKU may only contain letters, numbers, dots, dashes and underscores')
    .optional(),
  short_description: optionalTrimmedString(500),
  description: optionalTrimmedString(20000),
  price: moneySchema,
  sale_price: optionalFlexibleNumber,
  cost_price: optionalFlexibleNumber,
  weight: optionalFlexibleNumber,
  dimensions: optionalTrimmedString(120),
  stock_quantity: z.coerce.number().int().min(0, 'Stock cannot be negative').optional().default(0),
  minimum_stock: z.coerce.number().int().min(0).optional().default(5),
  featured: optionalFlexibleBoolean.default(false),
  status: z.enum(productStatuses).optional().default('active'),
  image: imagePathSchema,
};

export const createProductSchema = z
  .object(productBase)
  .superRefine((data, ctx) => {
    if (data.sale_price !== undefined && data.sale_price >= data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sale_price'],
        message: 'Sale price must be lower than the regular price',
      });
    }
    if (data.cost_price !== undefined && data.price > 0 && data.cost_price > data.price) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cost_price'],
        message: 'Cost price is usually below the selling price',
      });
    }
  });

export const updateProductSchema = z.object(productBase).partial();

export const productListQuerySchema = listQuerySchema.extend({
  // Flexible helpers so an empty query param (`?category_id=`) is treated as
  // "no filter" rather than coerced to 0, and `?featured=false` really is false.
  category_id: optionalFlexibleNumber,
  brand_id: optionalFlexibleNumber,
  status: z.enum(productStatuses).optional(),
  featured: optionalFlexibleBoolean,
  min_price: optionalFlexibleNumber,
  max_price: optionalFlexibleNumber,
  low_stock: optionalFlexibleBoolean,
  out_of_stock: optionalFlexibleBoolean,
});

export const specificationSchema = z.object({
  attribute_name: trimmedString(2, 120, 'Attribute name'),
  attribute_value: trimmedString(1, 255, 'Attribute value'),
});

export const productSpecificationsSchema = z.object({
  specifications: z.array(specificationSchema).max(60).default([]),
});

export const productImageSchema = z.object({
  image: z.string().trim().min(1, 'Image path is required').max(255),
  is_primary: optionalFlexibleBoolean.default(false),
  sort_order: z.coerce.number().int().min(0).optional().default(0),
});

export const inventoryAdjustmentSchema = z.object({
  type: z.enum(['stock_in', 'stock_out', 'adjustment', 'return']),
  quantity: z.coerce
    .number()
    .int()
    .refine((value) => value !== 0, 'Quantity cannot be zero'),
  reference: optionalTrimmedString(64),
  remarks: optionalTrimmedString(255),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
