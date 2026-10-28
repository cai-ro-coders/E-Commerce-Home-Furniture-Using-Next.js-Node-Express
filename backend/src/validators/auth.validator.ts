import { z } from 'zod';
import { checkPasswordStrength } from '../utils/password';
import { emailSchema, optionalFlexibleBoolean, trimmedString } from './common.validator';

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .refine((value) => checkPasswordStrength(value).valid, {
    message:
      'Password must include an uppercase letter, a lowercase letter, and a number',
  });

export const registerSchema = z.object({
  full_name: trimmedString(2, 120, 'Full name'),
  email: emailSchema,
  password: passwordSchema,
  phone: z.string().trim().max(32).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
  // "Remember me" extends the refresh-token lifetime from 7 days to 30 days.
  remember_me: optionalFlexibleBoolean.default(false),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(10, 'Reset token is required'),
  password: passwordSchema,
  password_confirmation: z.string().optional(),
}).refine(
  (data) => !data.password_confirmation || data.password === data.password_confirmation,
  { message: 'Password confirmation does not match', path: ['password_confirmation'] }
);

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  password: passwordSchema,
  password_confirmation: z.string().optional(),
}).refine(
  (data) => !data.password_confirmation || data.password === data.password_confirmation,
  { message: 'Password confirmation does not match', path: ['password_confirmation'] }
);

export const updateProfileSchema = z.object({
  full_name: trimmedString(2, 120, 'Full name').optional(),
  phone: z.string().trim().max(32).optional(),
  avatar: z.string().trim().max(255).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
