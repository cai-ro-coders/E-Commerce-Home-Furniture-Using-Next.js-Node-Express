import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { contactHandler } from '../controllers/contact.controller';
import { contactMessageSchema } from '../validators/contact.validator';
import { writeLimiter } from '../middleware/rateLimit';

const router = Router();

/** Public: the storefront contact form. Messages land in the staff inbox. */
router.post('/', writeLimiter, validate(contactMessageSchema), contactHandler);

export default router;
