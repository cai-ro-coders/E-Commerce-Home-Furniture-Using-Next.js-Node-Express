import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { authenticate, optionalAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';
import {
  accountHandler,
  changePasswordHandler,
  forgotPasswordHandler,
  listSessionsHandler,
  loginHandler,
  loginHistoryHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  registerHandler,
  resetPasswordHandler,
  revokeOtherSessionsHandler,
  revokeSessionHandler,
  updateProfileHandler,
} from '../controllers/auth.controller';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator';
import {
  createAddressHandler,
  deleteAddressHandler,
  listAddressesHandler,
  updateAddressHandler,
} from '../controllers/user.controller';
import { addressSchema, updateAddressSchema } from '../validators/order.validator';
import { idParamSchema, listQuerySchema } from '../validators/common.validator';

const router = Router();

// Public: registration and sign-in are rate limited to slow credential stuffing.
router.post('/register', authLimiter, validate(registerSchema), registerHandler);
router.post('/login', authLimiter, validate(loginSchema), loginHandler);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPasswordHandler);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPasswordHandler);

// The refresh token is itself the credential, so it is rate limited as well.
router.post('/refresh', authLimiter, refreshHandler);
router.post('/logout', optionalAuth, logoutHandler);

router.get('/me', authenticate, meHandler);

// Everything below requires a valid access token.
router.use(authenticate);

router.post('/change-password', authLimiter, validate(changePasswordSchema), changePasswordHandler);
router.patch('/profile', validate(updateProfileSchema), updateProfileHandler);

// The account page: profile, addresses, recent sign-ins and wishlist count in
// one round-trip.
router.get('/account', accountHandler);

// Device management. Revoking a session is how "sign out this device" and
// "sign out everywhere else" are implemented without waiting for a JWT expiry.
router.get('/login-history', loginHistoryHandler);
router.get('/sessions', validate(listQuerySchema, 'query'), listSessionsHandler);
router.delete('/sessions/others', revokeOtherSessionsHandler);
router.delete('/sessions/:id', validate(idParamSchema, 'params'), revokeSessionHandler);

// The customer's own address book, used by the checkout page.
router.get('/addresses', listAddressesHandler);
router.post('/addresses', validate(addressSchema), createAddressHandler);
router.put('/addresses/:id', validate(idParamSchema, 'params'), validate(updateAddressSchema), updateAddressHandler);
router.delete('/addresses/:id', validate(idParamSchema, 'params'), deleteAddressHandler);

export default router;
