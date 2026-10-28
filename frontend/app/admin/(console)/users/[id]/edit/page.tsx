'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { UserForm, type UserFormVariant } from '@/components/admin/users/UserForm';
import { Card, CardBody, PageHeader } from '@/components/ui/Card';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { api } from '@/lib/api';
import type { User } from '@/types';

export default function EditUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ as?: string }>;
}) {
  const { id } = use(params);
  const { as } = use(searchParams);
  const variant: UserFormVariant = as === 'customer' ? 'customer' : 'admin';

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // A customer may be a staff member, so the customer route 404s for a
        // promoted account. Fall back to the user route rather than showing an
        // error the operator cannot act on.
        const endpoint = variant === 'customer' ? `/customers/${id}` : `/users/${id}`;
        const record = await api
          .get<User>(endpoint)
          .catch(() => api.get<User>(`/users/${id}`));
        if (!cancelled) setUser(record);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Could not load the account');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, variant]);

  if (loading) return <PageSpinner label="Loading account…" />;

  if (error || !user) {
    return (
      <Card>
        <CardBody>
          <ErrorState
            title="The account could not load"
            description={error ?? undefined}
            onRetry={() => window.location.reload()}
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${user.full_name}`}
        description={
          variant === 'customer'
            ? 'Shopper details. Role and password changes live in the Users module.'
            : 'Account details, role and sign-in status.'
        }
        actions={
          <Link
            href={variant === 'customer' ? `/admin/customers/${user.id}` : `/admin/users/${user.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back to account
          </Link>
        }
      />
      <UserForm user={user} variant={variant} />
    </div>
  );
}
