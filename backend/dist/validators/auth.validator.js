"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.changePasswordSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = exports.passwordSchema = void 0;
const zod_1 = require("zod");
const password_1 = require("../utils/password");
const common_validator_1 = require("./common.validator");
exports.passwordSchema = zod_1.z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .refine((value) => (0, password_1.checkPasswordStrength)(value).valid, {
    message: 'Password must include an uppercase letter, a lowercase letter, and a number',
});
exports.registerSchema = zod_1.z.object({
    full_name: (0, common_validator_1.trimmedString)(2, 120, 'Full name'),
    email: common_validator_1.emailSchema,
    password: exports.passwordSchema,
    phone: zod_1.z.string().trim().max(32).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: common_validator_1.emailSchema,
    password: zod_1.z.string().min(1, 'Password is required').max(128),
    // "Remember me" extends the refresh-token lifetime from 7 days to 30 days.
    remember_me: common_validator_1.optionalFlexibleBoolean.default(false),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: common_validator_1.emailSchema,
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().trim().min(10, 'Reset token is required'),
    password: exports.passwordSchema,
    password_confirmation: zod_1.z.string().optional(),
}).refine((data) => !data.password_confirmation || data.password === data.password_confirmation, { message: 'Password confirmation does not match', path: ['password_confirmation'] });
exports.changePasswordSchema = zod_1.z.object({
    current_password: zod_1.z.string().min(1, 'Current password is required'),
    password: exports.passwordSchema,
    password_confirmation: zod_1.z.string().optional(),
}).refine((data) => !data.password_confirmation || data.password === data.password_confirmation, { message: 'Password confirmation does not match', path: ['password_confirmation'] });
exports.updateProfileSchema = zod_1.z.object({
    full_name: (0, common_validator_1.trimmedString)(2, 120, 'Full name').optional(),
    phone: zod_1.z.string().trim().max(32).optional(),
    avatar: zod_1.z.string().trim().max(255).optional(),
});
//# sourceMappingURL=auth.validator.js.map