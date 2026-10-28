'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StoreShell } from '@/components/storefront/StoreShell';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { api } from '@/lib/api';
import { alertSuccess } from '@/lib/alerts';
import { BRAND } from '@/lib/nav';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordOk =
    form.password.length >= 8 &&
    /[a-z]/.test(form.password) &&
    /[A-Z]/.test(form.password) &&
    /[0-9]/.test(form.password);

  const invalid =
    !form.full_name.trim() ||
    !form.email.trim() ||
    !passwordOk ||
    form.password !== form.confirm;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (invalid) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      await alertSuccess('Account created', `Welcome to ${BRAND.name}.`);
      router.push('/account');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not create the account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreShell>
      <div className="mx-auto max-w-md py-8">
        <Card>
          <CardHeader
            title="Create your account"
            description="Save pieces to a wishlist, check out faster and track your orders."
          />
          <CardBody>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field label="Full name" required>
                <Input
                  value={form.full_name}
                  onChange={(event) => setForm((f) => ({ ...f, full_name: event.target.value }))}
                  required
                  autoComplete="name"
                  placeholder="Maria Clara Reyes"
                />
              </Field>

              <Field label="Email" required>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </Field>

              <Field label="Phone" hint="Optional — for delivery questions.">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value }))}
                  autoComplete="tel"
                  placeholder="+63 917 300 1122"
                />
              </Field>

              <Field
                label="Password"
                required
                hint="At least 8 characters, with upper case, lower case and a number."
                error={form.password && !passwordOk ? 'Too weak — add upper case, lower case and a number.' : undefined}
              >
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((f) => ({ ...f, password: event.target.value }))}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </Field>

              <Field
                label="Repeat password"
                required
                error={form.confirm && form.password !== form.confirm ? 'Passwords do not match' : undefined}
              >
                <Input
                  type="password"
                  value={form.confirm}
                  onChange={(event) => setForm((f) => ({ ...f, confirm: event.target.value }))}
                  required
                  autoComplete="new-password"
                />
              </Field>

              {error ? (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  {error}
                </p>
              ) : null}

              <Button type="submit" loading={loading} disabled={invalid}>
                Create account
              </Button>

              <p className="text-center text-xs text-muted">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-clay-700 hover:underline dark:text-clay-400">
                  Sign in
                </Link>
              </p>
            </form>
          </CardBody>
        </Card>
      </div>
    </StoreShell>
  );
}
