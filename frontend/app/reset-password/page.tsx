'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { StoreShell } from '@/components/storefront/StoreShell';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { api } from '@/lib/api';
import { alertSuccess } from '@/lib/alerts';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordPageInner />
    </Suspense>
  );
}

function ResetPasswordPageInner() {
  const router = useRouter();
  const token = useSearchParams().get('token');
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordOk =
    form.password.length >= 8 &&
    /[a-z]/.test(form.password) &&
    /[A-Z]/.test(form.password) &&
    /[0-9]/.test(form.password);

  const invalid = !token || !passwordOk || form.password !== form.confirm;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (invalid) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/reset-password', {
        token: String(token),
        password: form.password,
        password_confirmation: form.confirm,
      });
      await alertSuccess('Password updated', 'Sign in with your new password.');
      router.push('/login');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not reset the password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreShell>
      <div className="mx-auto max-w-md py-8">
        <Card>
          <CardHeader
            title="Choose a new password"
            description="The link you followed is one-time use, so it will not work twice."
          />
          <CardBody>
            {!token ? (
              <div className="flex flex-col gap-4">
                <p className="rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                  This link is missing its token. Request a fresh one — the old link may have
                  expired.
                </p>
                <Link href="/forgot-password">
                  <Button variant="outline" className="w-full">
                    Request a new link
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <Field
                  label="New password"
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
                  Set new password
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </StoreShell>
  );
}
