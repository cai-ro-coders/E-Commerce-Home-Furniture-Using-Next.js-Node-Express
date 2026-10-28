'use client';

import { useState } from 'react';
import Link from 'next/link';
import { StoreShell } from '@/components/storefront/StoreShell';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { api } from '@/lib/api';
import { alertSuccess } from '@/lib/alerts';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      // Always report success: the endpoint must not reveal whether an
      // address exists, so the screen cannot either.
      setSent(true);
      await alertSuccess('Check your inbox');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send the reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreShell>
      <div className="mx-auto max-w-md py-8">
        <Card>
          <CardHeader
            title="Reset your password"
            description="We will email you a one-time link. It expires after 30 minutes."
          />
          <CardBody>
            {sent ? (
              <div className="flex flex-col gap-4">
                <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                  If an account exists for <strong>{email.trim()}</strong>, a reset link is on its
                  way. Check your spam folder if it does not arrive in a few minutes.
                </p>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to sign in
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <Field label="Email" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </Field>

                {error ? (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                    {error}
                  </p>
                ) : null}

                <Button type="submit" loading={loading} disabled={!email.trim()}>
                  Send reset link
                </Button>

                <p className="text-center text-xs text-muted">
                  Remembered it?{' '}
                  <Link href="/login" className="font-medium text-clay-700 hover:underline dark:text-clay-400">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </StoreShell>
  );
}
