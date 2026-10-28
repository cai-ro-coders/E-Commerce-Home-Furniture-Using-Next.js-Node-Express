import { z } from 'zod';
import {
  emailSchema,
  optionalTrimmedString,
  phoneSchema,
  trimmedString,
} from './common.validator';

/**
 * Public contact form.
 *
 * The message is kept to 500 characters because it is delivered to the staff
 * inbox through the `notifications` table, whose `message` column is capped at
 * that length. The sender details are added by the service.
 */
export const contactMessageSchema = z.object({
  name: trimmedString(2, 120, 'Name'),
  email: emailSchema,
  phone: phoneSchema,
  subject: optionalTrimmedString(160),
  message: trimmedString(10, 500, 'Message'),
});
