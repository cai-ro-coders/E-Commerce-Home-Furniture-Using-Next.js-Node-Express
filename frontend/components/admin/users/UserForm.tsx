'use client';

/**
 * Create/edit form for an account.
 *
 * One component for both the Users and Customers modules because the fields
 * barely differ — only a customer's record is edited through
 * `PUT /customers/:id`, which refuses `role` and `password`. `variant` decides
 * which endpoint is used and which fields are shown, so the two screens cannot
 * disagree about what an account is.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select } from '@/components/ui/Field';
import { ApiError, api } from '@/lib/api';
import { alertError, alertSuccess } from '@/lib/alerts';
import type { User, UserRole, UserStatus } from '@/types';

export type UserFormVariant = 'admin' | 'customer';

const ROLES: Array<{ value: UserRole; label: string; hint: string }> = [
  {
    value: 'admin',
    label: 'Administrator',
    hint: 'Full access, including users, settings and files.',
  },
  {
    value: 'staff',
    label: 'Staff',
    hint: 'Everything except user management and destructive settings.',
  },
  { value: 'customer', label: 'Customer', hint: 'Storefront only. No dashboard access.' },
];

const STATUSES: Array<{ value: UserStatus; label: string; hint: string }> = [
  { value: 'active', label: 'Active', hint: 'Can sign in.' },
  { value: 'inactive', label: 'Inactive', hint: 'Cannot sign in.' },
  { value: 'blocked', label: 'Blocked', hint: 'Refused sign-in, sessions revoked.' },
];

export function UserForm({
  user,
  variant = 'admin',
}: {
  /** Omit to create. */
  user?: User;
  variant?: UserFormVariant;
}) {
  const router = useRouter();
  const isEdit = Boolean(user);
  // A customer record may not carry role or password changes — the endpoint
  // rejects them, so the form must not offer them.
  const restricted = variant === 'customer' || user?.role === 'customer';

  const [form, setForm] = useState({
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    password: '',
    role: (user?.role ?? 'customer') as UserRole,
    status: (user?.status ?? 'active') as UserStatus,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone ?? '',
      password: '',
      role: user.role,
      status: user.status,
    });
    setErrors({});
  }, [user]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const { [key]: _cleared, ...rest } = current;
      return rest;
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setError(null);

    const payload: Record<string, unknown> = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
    };
    if (form.password) payload.password = form.password;
    if (!restricted) {
      payload.role = form.role;
      payload.status = form.status;
    }

    try {
      if (isEdit && user) {
        const base = variant === 'customer' ? '/customers' : '/users';
        await api.put(`${base}/${user.id}`, payload);
        alertSuccess('Account saved', `${form.full_name.trim()} is up to date.`);
        router.push(variant === 'customer' ? `/admin/customers/${user.id}` : `/admin/users/${user.id}`);
      } else {
        const created = await api.post<User>('/users', payload);
        alertSuccess('Account created', `${created.full_name} can now sign in.`);
        router.push('/admin/users');
      }
    } catch (cause) {
      if (cause instanceof ApiError && cause.details.length > 0) {
        setErrors(cause.fieldErrors);
        alertError('Check the form', Object.values(cause.fieldErrors)[0]);
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not save the account');
      }
    } finally {
      setSaving(false);
    }
  };

  const leave = () => {
    if (isEdit && user) {
      router.push(variant === 'customer' ? `/admin/customers/${user.id}` : `/admin/users/${user.id}`);
    } else {
      router.push('/admin/users');
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={leave} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="submit"
          leftIcon={<Save className="size-4" />}
          loading={saving}
          disabled={!form.full_name.trim() || !form.email.trim() || (!isEdit && !form.password)}
        >
          {isEdit ? 'Save changes' : 'Create account'}
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Card>
            <CardHeader title="Identity" description="How the account is named and reached." />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                required
                error={errors.full_name}
                className="sm:col-span-2"
              >
                <Input
                  value={form.full_name}
                  onChange={(event) => set('full_name', event.target.value)}
                  maxLength={120}
                  required
                  autoComplete="name"
                />
              </Field>

              <Field label="Email" required error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => set('email', event.target.value)}
                  maxLength={190}
                  required
                  autoComplete="email"
                />
              </Field>

              <Field label="Phone" error={errors.phone} hint="Used for delivery questions.">
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => set('phone', event.target.value)}
                  maxLength={32}
                  autoComplete="tel"
                />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Credentials"
              description={
                isEdit
                  ? 'Leave the password blank to keep the current one.'
                  : 'At least 8 characters, with upper case, lower case and a number.'
              }
              action={<KeyRound className="size-4 text-sand-400" aria-hidden />}
            />
            <CardBody>
              <Field
                label={isEdit ? 'New password' : 'Password'}
                required={!isEdit}
                error={errors.password}
                className="sm:max-w-sm"
              >
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => set('password', event.target.value)}
                  minLength={8}
                  maxLength={128}
                  required={!isEdit}
                  autoComplete="new-password"
                  placeholder={isEdit ? 'Unchanged' : ''}
                />
              </Field>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {restricted ? null : (
            <Card>
              <CardHeader title="Access" description="What this account may reach." />
              <CardBody className="flex flex-col gap-4">
                <Field label="Role" error={errors.role}>
                  <Select
                    value={form.role}
                    onChange={(event) => set('role', event.target.value as UserRole)}
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label} — {role.hint}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Status" error={errors.status}>
                  <Select
                    value={form.status}
                    onChange={(event) => set('status', event.target.value as UserStatus)}
                  >
                    {STATUSES.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label} — {status.hint}
                      </option>
                    ))}
                  </Select>
                </Field>
              </CardBody>
            </Card>
          )}

          {isEdit && user ? (
            <Card>
              <CardHeader title="Record" />
              <CardBody className="flex flex-col gap-2 text-sm">
                <p className="text-muted">
                  Last signed in{' '}
                  <span className="text-sand-800 dark:text-sand-100">
                    {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'never'}
                  </span>
                </p>
                <p className="text-muted">
                  Member since{' '}
                  <span className="text-sand-800 dark:text-sand-100">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                  </span>
                </p>
                {user.last_login_ip ? (
                  <p className="text-muted">
                    Last IP{' '}
                    <span className="text-sand-800 dark:text-sand-100">{user.last_login_ip}</span>
                  </p>
                ) : null}
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>
    </form>
  );
}
