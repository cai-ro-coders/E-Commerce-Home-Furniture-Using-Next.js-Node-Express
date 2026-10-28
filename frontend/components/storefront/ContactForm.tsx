'use client';

/**
 * Storefront contact form.
 *
 * Messages are delivered to the staff notification inbox by `POST /api/contact`
 * — there is no outbound mailer in this project yet. Validation is duplicated
 * on the client for fast feedback, but the API remains the authority and its
 * `fieldErrors` are mapped straight onto the inputs.
 */
import { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { ApiError, api } from '@/lib/api';

const MESSAGE_LIMIT = 500;

const SUBJECTS = [
  { value: 'General enquiry', label: 'General enquiry' },
  { value: 'Order or delivery', label: 'Order or delivery' },
  { value: 'Product question', label: 'Product question' },
  { value: 'Trade & interior design', label: 'Trade & interior design' },
  { value: 'Repair & care', label: 'Repair & care' },
  { value: 'Press', label: 'Press' },
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const EMPTY: FormState = {
  name: '',
  email: '',
  phone: '',
  subject: SUBJECTS[0].value,
  message: '',
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Please tell us your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (form.phone.trim() && !/^[0-9+\-\s()]{7,32}$/.test(form.phone.trim())) {
      next.phone = 'Enter a valid phone number.';
    }
    const message = form.message.trim();
    if (message.length < 10) {
      next.message = 'Please add a little more detail (at least 10 characters).';
    } else if (message.length > MESSAGE_LIMIT) {
      next.message = `Please keep it under ${MESSAGE_LIMIT} characters.`;
    }
    return next;
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await api.post('/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject,
        message: form.message.trim(),
      });
      setForm(EMPTY);
      setErrors({});
      setSent(true);
    } catch (caught) {
      if (caught instanceof ApiError) {
        const fieldErrors = caught.fieldErrors;
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
        } else {
          setError(caught.message);
        }
      } else {
        setError('We could not send that just now. Please try again or email us directly.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div
        className="flex flex-col items-start rounded-[1.6rem] border border-sand-200 bg-white p-7 sm:p-10"
        role="status"
        aria-live="polite"
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">
          <CheckCircle2 className="size-5" aria-hidden />
        </span>
        <h2 className="mt-5 font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight tracking-[-0.02em] text-walnut-950">
          Thank you — your message is with the studio.
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-walnut-950/60">
          We read every enquiry ourselves and usually reply within one working day. If it is
          urgent, call the showroom on{' '}
          <a href="tel:+63285550142" className="font-medium text-clay-700 hover:underline">
            +63 2 8555 0142
          </a>
          .
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-7 h-11 rounded-full px-5 text-xs"
          onClick={() => setSent(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-[1.6rem] border border-sand-200 bg-white p-6 sm:p-8 lg:p-10"
    >
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-clay-700">
        Write to the studio
      </p>
      <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight tracking-[-0.02em] text-walnut-950">
        A question, a room, a repair.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-walnut-950/55">
        Tell us what you are working on. A person from the studio — not a bot — will reply.
      </p>

      {error ? (
        <p
          className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required htmlFor="contact-name" error={errors.name}>
          <Input
            id="contact-name"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Camille Reyes"
            autoComplete="name"
            className="h-12 rounded-xl"
            required
          />
        </Field>

        <Field label="Email" required htmlFor="contact-email" error={errors.email}>
          <Input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="h-12 rounded-xl"
            required
          />
        </Field>

        <Field
          label="Phone"
          hint="Optional — only if you would rather we call."
          htmlFor="contact-phone"
          error={errors.phone}
        >
          <Input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="+63 917 000 0000"
            autoComplete="tel"
            className="h-12 rounded-xl"
          />
        </Field>

        <Field label="What is it about?" htmlFor="contact-subject" error={errors.subject}>
          <Select
            id="contact-subject"
            value={form.subject}
            onChange={(event) => update('subject', event.target.value)}
            options={SUBJECTS}
            className="h-12 rounded-xl"
          />
        </Field>

        <Field
          label="Message"
          required
          htmlFor="contact-message"
          error={errors.message}
          className="sm:col-span-2"
          hint={`${form.message.length}/${MESSAGE_LIMIT} characters`}
        >
          <Textarea
            id="contact-message"
            rows={5}
            value={form.message}
            onChange={(event) => update('message', event.target.value)}
            maxLength={MESSAGE_LIMIT}
            placeholder="The piece, the room, the deadline — whatever matters."
            className="rounded-xl"
            required
          />
        </Field>
      </div>

      <div className="mt-7 flex flex-col gap-4 border-t border-sand-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-[0.65rem] leading-relaxed text-sand-500">
          We use your details only to answer this enquiry. No lists, no forwarding.
        </p>
        <Button
          type="submit"
          loading={submitting}
          className="h-12 shrink-0 rounded-full px-7 text-sm"
          rightIcon={<Send className="size-4" aria-hidden />}
        >
          {submitting ? 'Sending…' : 'Send message'}
        </Button>
      </div>
    </form>
  );
}
