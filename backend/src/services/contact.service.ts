import { notifyStaff } from '../models/notification.model';

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

/**
 * Deliver a storefront contact message to the back office.
 *
 * There is no outbound mailer configured, so the message is written to the
 * staff notification inbox. The sender line is kept intact and only the body is
 * trimmed when it would exceed the column limit.
 */
export async function submitContactMessage(data: ContactMessageInput) {
  const subject = data.subject?.trim() || 'General enquiry';
  const sender = `${data.name} <${data.email}>${data.phone ? ` · ${data.phone}` : ''}`;
  const room = Math.max(0, 500 - sender.length - 1);
  const body =
    data.message.length > room
      ? `${data.message.slice(0, Math.max(0, room - 1)).trimEnd()}…`
      : data.message;

  await notifyStaff({
    title: `New enquiry: ${subject}`.slice(0, 160),
    message: `${sender}\n${body}`.slice(0, 500),
    type: 'info',
    link: '/admin/notifications',
  });

  return { received: true };
}
