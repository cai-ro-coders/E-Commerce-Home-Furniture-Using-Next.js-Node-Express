'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { alertSuccess } from '@/lib/alerts';
import { BRAND } from '@/lib/nav';

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginPageInner />
    </Suspense>
  );
}

function AdminLoginPageInner() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  // Goes through the provider so `user` is set before the redirect; the console
  // guard would otherwise bounce the freshly signed-in admin back to this page.
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const destination = next && next.startsWith('/admin') ? next : '/admin/dashboard';

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
    <div className="flex min-h-screen items-center justify-center bg-[var(--surface-sunken)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-clay-600 text-white">
            <ShieldCheck className="size-7" />
          </span>
          <h1 className="font-display text-2xl font-semibold text-sand-900 dark:text-sand-50">
            Admin Console
          </h1>
          <p className="mt-1 text-sm text-muted">
            Sign in to manage {BRAND.name}
          </p>
        </div>

        <Card>
          <CardHeader title="Staff sign in" description="Enter your admin credentials" />
          <CardBody>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field label="Email" required>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
                  required
                  autoComplete="email"
                  placeholder="admin@lumerahome.com"
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
                Sign in to console
              </Button>

              <div className="text-center text-xs">
                <Link href="/login" className="font-medium text-clay-700 hover:underline dark:text-clay-400">
                  Customer sign in
                </Link>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
