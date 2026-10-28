'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ChevronLeft,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { requestPasswordReset } from '@/components/admin/users/UserList';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, DetailItem } from '@/components/ui/Card';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { Tabs } from '@/components/ui/Tabs';
import { api } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import { formatDateTime, formatMoney, formatNumber, num, orderStatusTag, timeAgo, titleCase } from '@/lib/format';
import { useAuth } from '@/components/providers/AuthProvider';
import type { UserDetail, UserRole, UserStatus } from '@/types';

const ROLE_TONES: Record<string, string> = {
  admin: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  staff: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  customer: 'bg-sand-100 text-sand-700 dark:bg-walnut-800 dark:text-sand-300',
};

const STATUS_TONES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  inactive: 'bg-sand-100 text-sand-600 dark:bg-walnut-800 dark:text-sand-400',
  blocked: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

type TabKey = 'orders' | 'addresses' | 'signins' | 'activity';

export default function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ as?: string }>;
}) {
  const { id } = use(params);
  const { as } = use(searchParams);
  const router = useRouter();
  const { user: me } = useAuth();
  const asCustomer = as === 'customer';
  // `base` is the browser route (navigation). The API lives under its own
  // prefix without the `/admin` segment.
  const base = asCustomer ? '/admin/customers' : '/admin/users';
  const apiBase = asCustomer ? '/customers' : '/users';

  const [record, setRecord] = useState<UserDetail | null>(null);
  const [tab, setTab] = useState<TabKey>('orders');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRecord(await api.get<UserDetail>(`${apiBase}/${id}`));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the account');
    } finally {
      setLoading(false);
    }
  }, [apiBase, id]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (status: UserStatus) => {
    if (!record) return;
    const confirmed = await confirmAction({
      title: `${status === 'active' ? 'Activate' : titleCase(status)} ${record.full_name}?`,
      text: status === 'active' ? 'They can sign in again immediately.' : 'Their sessions are revoked.',
      confirmText: status === 'active' ? 'Activate' : titleCase(status),
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await api.patch(`/users/${record.id}/status`, { status });
      toastSuccess(`${record.full_name} is now ${status}`);
      await load();
    } catch (cause) {
      alertError('Could not change the status', message(cause));
    } finally {
      setBusy(false);
    }
  };

  const setRole = async (role: UserRole) => {
    if (!record) return;
    const confirmed = await confirmAction({
      title: `Make ${record.full_name} ${role === 'admin' ? 'an administrator' : role}?`,
      text: 'Their permissions change the next time the page is loaded.',
      confirmText: 'Change role',
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await api.patch(`/users/${record.id}/role`, { role });
      toastSuccess(`${record.full_name} is now ${role}`);
      await load();
    } catch (cause) {
      alertError('Could not change the role', message(cause));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!record) return;
    const confirmed = await confirmAction({
      title: `Delete ${record.full_name}?`,
      text: 'Their past orders stay in the books, but the account and its data are removed.',
      confirmText: 'Delete account',
    });
    if (!confirmed) return;
    setBusy(true);
    try {
      await api.delete(`${apiBase}/${record.id}`);
      toastSuccess(`${record.full_name} was deleted`);
      router.push(base);
    } catch (cause) {
      alertError('Could not delete the account', message(cause));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageSpinner label="Loading account…" />;

  if (error || !record) {
    return (
      <Card>
        <CardBody>
          <ErrorState
            title="The account could not load"
            description={error ?? undefined}
            onRetry={() => void load()}
          />
        </CardBody>
      </Card>
    );
  }

  const orders = record.orders ?? [];
  const addresses = record.addresses ?? [];
  const signins = record.login_history ?? [];
  const activities = record.activities ?? [];
  const isSelf = me?.id === record.id;

  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------------------ head */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href={base}
            aria-label={`Back to ${asCustomer ? 'customers' : 'users'}`}
            className="mt-2 rounded-lg p-1.5 text-sand-500 transition-colors hover:bg-sand-100 hover:text-clay-700 dark:hover:bg-walnut-800"
          >
            <ChevronLeft className="size-5" />
          </Link>
          <Avatar src={record.avatar} name={record.full_name} size="xl" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-sand-900 dark:text-sand-50">
                {record.full_name}
              </h1>
              <Badge className={ROLE_TONES[record.role] ?? ''}>{titleCase(record.role)}</Badge>
              <Badge className={STATUS_TONES[record.status] ?? ''}>{titleCase(record.status)}</Badge>
              {isSelf ? (
                <Badge className="bg-clay-100 text-clay-700 dark:bg-clay-500/15 dark:text-clay-300">
                  This is you
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1">
                <Mail className="size-3.5" aria-hidden />
                {record.email}
              </span>
              {record.phone ? (
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3.5" aria-hidden />
                  {record.phone}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="size-3.5" />}
            onClick={() => void load()}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<KeyRound className="size-3.5" />}
            onClick={() => void requestPasswordReset(record)}
          >
            Send reset link
          </Button>
          {!isSelf ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 className="size-3.5" />}
              onClick={() => void remove()}
              disabled={busy}
              className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              Delete
            </Button>
          ) : null}
          <Button
            size="sm"
            leftIcon={<Pencil className="size-3.5" />}
            onClick={() => router.push(`${base}/${record.id}/edit${asCustomer ? '?as=customer' : ''}`)}
          >
            Edit
          </Button>
        </div>
      </div>

      {!isSelf ? (
        <Card>
          <CardBody className="flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <ShieldCheck className="size-3.5" aria-hidden />
              Quick actions
            </span>
            {(['admin', 'staff', 'customer'] as UserRole[])
              .filter((role) => role !== record.role)
              .map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => void setRole(role)}
                >
                  Make {role === 'admin' ? 'admin' : role}
                </Button>
              ))}
            {record.status === 'active' ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => void setStatus('inactive')}
                >
                  Deactivate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => void setStatus('blocked')}
                  className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  Block sign-in
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={() => void setStatus('active')}
                className="text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
              >
                Activate
              </Button>
            )}
          </CardBody>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <Tabs
            tabs={[
              { id: 'orders', label: `Orders (${orders.length})` },
              { id: 'addresses', label: `Addresses (${addresses.length})` },
              { id: 'signins', label: `Sign-ins (${signins.length})` },
              ...(activities.length
                ? [{ id: 'activity', label: `Activity (${activities.length})` }]
                : []),
            ]}
            active={tab}
            onChange={(value) => setTab(value as TabKey)}
          />

          {tab === 'orders' ? (
            <Card>
              <CardHeader title="Recent orders" description="Newest first" />
              <CardBody className="p-0">
                {orders.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-muted">No orders yet.</p>
                ) : (
                  <ul className="divide-y divide-[var(--border-subtle)]">
                    {orders.map((order) => {
                      const tag = orderStatusTag(order.order_status);
                      return (
                        <li key={order.id}>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--surface-sunken)]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-sand-800 dark:text-sand-100">
                                {order.order_number}
                              </p>
                              <p className="text-xs text-muted">
                                {formatDateTime(order.created_at)} ·{' '}
                                {formatNumber(order.item_count)} item
                                {num(order.item_count) === 1 ? '' : 's'}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                              <Badge className={tag.className}>{tag.label}</Badge>
                              <span className="text-sm font-semibold tabular-nums text-sand-800 dark:text-sand-100">
                                {formatMoney(order.grand_total, 'PHP')}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardBody>
            </Card>
          ) : null}

          {tab === 'addresses' ? (
            <Card>
              <CardHeader title="Address book" />
              <CardBody className="p-0">
                {addresses.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-muted">
                    No addresses on file.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--border-subtle)]">
                    {addresses.map((address) => (
                      <li key={address.id} className="flex items-start gap-3 px-5 py-3">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-sand-400" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-sand-800 dark:text-sand-100">
                            {address.full_name}
                            {address.is_default ? (
                              <Badge className="ml-2 bg-clay-100 text-clay-700 dark:bg-clay-500/15 dark:text-clay-300">
                                Default
                              </Badge>
                            ) : null}
                          </p>
                          <address className="mt-0.5 not-italic text-xs leading-relaxed text-muted">
                            {address.address_line_1}
                            {address.address_line_2 ? `, ${address.address_line_2}` : ''}
                            <br />
                            {[address.city, address.province, address.postal_code]
                              .filter(Boolean)
                              .join(', ')}
                            {', '}
                            {address.country}
                          </address>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          ) : null}

          {tab === 'signins' ? (
            <Card>
              <CardHeader title="Sign-in history" description="Successful and failed attempts" />
              <CardBody className="p-0">
                {signins.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-muted">No sign-in attempts.</p>
                ) : (
                  <ul className="divide-y divide-[var(--border-subtle)]">
                    {signins.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-start justify-between gap-3 px-5 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm text-sand-800 dark:text-sand-100">
                            {entry.success ? (
                              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                Signed in
                              </span>
                            ) : (
                              <span className="font-medium text-rose-600 dark:text-rose-400">
                                Failed attempt
                              </span>
                            )}
                            {entry.reason ? (
                              <span className="text-muted"> — {entry.reason}</span>
                            ) : null}
                          </p>
                          <p className="truncate text-xs text-muted">
                            {entry.ip_address ?? 'unknown IP'}
                            {entry.user_agent ? ` · ${entry.user_agent}` : ''}
                          </p>
                        </div>
                        <span
                          className="shrink-0 text-xs text-muted"
                          title={formatDateTime(entry.created_at)}
                        >
                          {timeAgo(entry.created_at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          ) : null}

          {tab === 'activity' ? (
            <Card>
              <CardHeader
                title="Recorded activity"
                action={<Activity className="size-4 text-sand-400" aria-hidden />}
              />
              <CardBody className="p-0">
                {activities.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-muted">
                    Nothing recorded.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--border-subtle)]">
                    {activities.map((entry, index) => (
                      <li key={`${entry.created_at}-${index}`} className="px-5 py-3">
                        <p className="text-sm text-sand-800 dark:text-sand-100">
                          {entry.description ?? entry.action}
                        </p>
                        <p className="text-xs text-muted">
                          {titleCase(entry.action)}
                          {entry.entity ? ` · ${entry.entity}` : ''} · {timeAgo(entry.created_at)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardBody>
            </Card>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Account" />
            <CardBody>
              <dl className="divide-y divide-[var(--border-subtle)]">
                <DetailItem className="py-2.5" label="Role" value={titleCase(record.role)} />
                <DetailItem className="py-2.5" label="Status" value={titleCase(record.status)} />
                <DetailItem
                  className="py-2.5"
                  label="Email verified"
                  value={record.email_verified ? 'Yes' : 'No'}
                />
                <DetailItem
                  className="py-2.5"
                  label="Orders"
                  value={record.order_count !== undefined ? formatNumber(record.order_count) : '—'}
                />
                <DetailItem
                  className="py-2.5"
                  label="Lifetime spend"
                  value={
                    record.total_spent !== undefined
                      ? formatMoney(record.total_spent, 'PHP')
                      : '—'
                  }
                />
                <DetailItem
                  className="py-2.5"
                  label="Reviews"
                  value={record.review_count !== undefined ? formatNumber(record.review_count) : '—'}
                />
                <DetailItem
                  className="py-2.5"
                  label="Last sign-in"
                  value={record.last_login_at ? timeAgo(record.last_login_at) : 'Never'}
                />
                <DetailItem
                  className="py-2.5"
                  label="Last IP"
                  value={record.last_login_ip ?? '—'}
                />
                <DetailItem
                  className="py-2.5"
                  label="Joined"
                  value={record.created_at ? formatDateTime(record.created_at) : '—'}
                />
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
