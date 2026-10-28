import type { Request, Response } from 'express';
import { created } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { submitContactMessage, type ContactMessageInput } from '../services/contact.service';

/** Public contact form — no account required. */
export const contactHandler = asyncHandler(async (req: Request, res: Response) => {
  await submitContactMessage(req.body as ContactMessageInput);
  return created(res, { received: true }, 'Thanks — your message is with the studio.');
});
