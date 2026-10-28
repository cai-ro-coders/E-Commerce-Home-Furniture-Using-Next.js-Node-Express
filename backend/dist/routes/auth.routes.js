"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_validator_1 = require("../validators/auth.validator");
const user_controller_1 = require("../controllers/user.controller");
const order_validator_1 = require("../validators/order.validator");
const common_validator_1 = require("../validators/common.validator");
const router = (0, express_1.Router)();
// Public: registration and sign-in are rate limited to slow credential stuffing.
router.post('/register', rateLimit_1.authLimiter, (0, asyncHandler_1.validate)(auth_validator_1.registerSchema), auth_controller_1.registerHandler);
router.post('/login', rateLimit_1.authLimiter, (0, asyncHandler_1.validate)(auth_validator_1.loginSchema), auth_controller_1.loginHandler);
router.post('/forgot-password', rateLimit_1.authLimiter, (0, asyncHandler_1.validate)(auth_validator_1.forgotPasswordSchema), auth_controller_1.forgotPasswordHandler);
router.post('/reset-password', rateLimit_1.authLimiter, (0, asyncHandler_1.validate)(auth_validator_1.resetPasswordSchema), auth_controller_1.resetPasswordHandler);
// The refresh token is itself the credential, so it is rate limited as well.
router.post('/refresh', rateLimit_1.authLimiter, auth_controller_1.refreshHandler);
router.post('/logout', auth_1.optionalAuth, auth_controller_1.logoutHandler);
router.get('/me', auth_1.authenticate, auth_controller_1.meHandler);
// Everything below requires a valid access token.
router.use(auth_1.authenticate);
router.post('/change-password', rateLimit_1.authLimiter, (0, asyncHandler_1.validate)(auth_validator_1.changePasswordSchema), auth_controller_1.changePasswordHandler);
router.patch('/profile', (0, asyncHandler_1.validate)(auth_validator_1.updateProfileSchema), auth_controller_1.updateProfileHandler);
// The account page: profile, addresses, recent sign-ins and wishlist count in
// one round-trip.
router.get('/account', auth_controller_1.accountHandler);
// Device management. Revoking a session is how "sign out this device" and
// "sign out everywhere else" are implemented without waiting for a JWT expiry.
router.get('/login-history', auth_controller_1.loginHistoryHandler);
router.get('/sessions', (0, asyncHandler_1.validate)(common_validator_1.listQuerySchema, 'query'), auth_controller_1.listSessionsHandler);
router.delete('/sessions/others', auth_controller_1.revokeOtherSessionsHandler);
router.delete('/sessions/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), auth_controller_1.revokeSessionHandler);
// The customer's own address book, used by the checkout page.
router.get('/addresses', user_controller_1.listAddressesHandler);
router.post('/addresses', (0, asyncHandler_1.validate)(order_validator_1.addressSchema), user_controller_1.createAddressHandler);
router.put('/addresses/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), (0, asyncHandler_1.validate)(order_validator_1.updateAddressSchema), user_controller_1.updateAddressHandler);
router.delete('/addresses/:id', (0, asyncHandler_1.validate)(common_validator_1.idParamSchema, 'params'), user_controller_1.deleteAddressHandler);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map