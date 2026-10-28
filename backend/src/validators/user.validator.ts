import { z } from 'zod';
import { listQuerySchema } from './common.validator';

export const userRoles = ['admin', 'customer', 'staff'] as const;
export const userStatuses = ['active', 'inactive', 'blocked'] as const;

export const createUserSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required').max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(190)
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .refine(
      (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value),
      { message: 'Password must include upper case, lower case and a number' }
    ),
  phone: z.string().trim().max(32).optional(),
  role: z.enum(userRoles).optional().default('customer'),
  status: z.enum(userStatuses).optional().default('active'),
  avatar: z.string().trim().max(255).optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .extend({
    // Blank password on the edit form means "leave the existing hash alone".
    password: z.string().min(8).max(128).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

export const changeUserRoleSchema = z.object({
  role: z.enum(userRoles),
});

export const changeUserStatusSchema = z.object({
  status: z.enum(userStatuses),
});

export const userListQuerySchema = listQuerySchema.extend({
  role: z.enum(userRoles).optional(),
  status: z.enum(userStatuses).optional(),
});

/**
 * The Customers module's edit form. Deliberately excludes `role` and `password`:
 * promotion and credential changes belong to the Users module.
 */
export const updateCustomerSchema = z
  .object({
    full_name: z.string().trim().min(2, 'Full name is required').max(120).optional(),
    email: z.string().trim().toLowerCase().max(190).email('Enter a valid email address').optional(),
    phone: z.string().trim().max(32).optional(),
    avatar: z.string().trim().max(255).optional(),
    status: z.enum(userStatuses).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
