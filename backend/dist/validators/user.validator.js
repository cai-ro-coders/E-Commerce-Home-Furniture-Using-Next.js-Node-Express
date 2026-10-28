"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerSchema = exports.userListQuerySchema = exports.changeUserStatusSchema = exports.changeUserRoleSchema = exports.updateUserSchema = exports.createUserSchema = exports.userStatuses = exports.userRoles = void 0;
const zod_1 = require("zod");
const common_validator_1 = require("./common.validator");
exports.userRoles = ['admin', 'customer', 'staff'];
exports.userStatuses = ['active', 'inactive', 'blocked'];
exports.createUserSchema = zod_1.z.object({
    full_name: zod_1.z.string().trim().min(2, 'Full name is required').max(120),
    email: zod_1.z
        .string()
        .trim()
        .toLowerCase()
        .max(190)
        .email('Enter a valid email address'),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(128)
        .refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value), { message: 'Password must include upper case, lower case and a number' }),
    phone: zod_1.z.string().trim().max(32).optional(),
    role: zod_1.z.enum(exports.userRoles).optional().default('customer'),
    status: zod_1.z.enum(exports.userStatuses).optional().default('active'),
    avatar: zod_1.z.string().trim().max(255).optional(),
});
exports.updateUserSchema = exports.createUserSchema
    .partial()
    .extend({
    // Blank password on the edit form means "leave the existing hash alone".
    password: zod_1.z.string().min(8).max(128).optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
});
exports.changeUserRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(exports.userRoles),
});
exports.changeUserStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(exports.userStatuses),
});
exports.userListQuerySchema = common_validator_1.listQuerySchema.extend({
    role: zod_1.z.enum(exports.userRoles).optional(),
    status: zod_1.z.enum(exports.userStatuses).optional(),
});
/**
 * The Customers module's edit form. Deliberately excludes `role` and `password`:
 * promotion and credential changes belong to the Users module.
 */
exports.updateCustomerSchema = zod_1.z
    .object({
    full_name: zod_1.z.string().trim().min(2, 'Full name is required').max(120).optional(),
    email: zod_1.z.string().trim().toLowerCase().max(190).email('Enter a valid email address').optional(),
    phone: zod_1.z.string().trim().max(32).optional(),
    avatar: zod_1.z.string().trim().max(255).optional(),
    status: zod_1.z.enum(exports.userStatuses).optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
});
//# sourceMappingURL=user.validator.js.map