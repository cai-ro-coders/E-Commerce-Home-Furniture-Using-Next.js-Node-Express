'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { StoreShell } from '@/components/storefront/StoreShell';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { alertSuccess } from '@/lib/alerts';
import { BRAND } from '@/lib/nav';

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  // Goes through the provider so `user` is set before the redirect; /account
  // guards on it and would otherwise bounce the new customer back here.
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const destination = next && next.startsWith('/') ? next : '/account';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form.email.trim(), form.password, form.remember);
      await alertSuccess('Welcome back');
      router.push(destination);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StoreShell>
      <div className="mx-auto max-w-md py-8">
        <Card>
          <CardHeader
            title="Sign in"
            description={`Welcome back to ${BRAND.name}.`}
          />
          <CardBody>
            <form onSubmit={submit} className="flex flex-col gap-4">
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

              <Field label="Password" required>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((f) => ({ ...f, password: event.target.value }))}
                  required
                  autoComplete="current-password"
                />
              </Field>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(event) => setForm((f) => ({ ...f, remember: event.target.checked }))}
                  className="size-4 accent-clay-600"
                />
                <span className="text-sand-700 dark:text-sand-200">Keep me signed in for 30 days</span>
              </label>

              {error ? (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  {error}
                </p>
              ) : null}

              <Button type="submit" loading={loading}>
                Sign in
              </Button>

              <div className="flex items-center justify-between text-xs">
                <Link href="/forgot-password" className="font-medium text-sand-500 hover:text-clay-700">
                  Forgot your password?
                </Link>
                <Link href="/register" className="font-medium text-clay-700 hover:underline dark:text-clay-400">
                  Create an account
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </StoreShell>
  );
}
