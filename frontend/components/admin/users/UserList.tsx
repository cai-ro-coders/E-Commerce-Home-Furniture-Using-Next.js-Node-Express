'use client';

/**
 * Shared user list for the Users and Customers modules.
 *
 * The two screens are the same table over the same rows with a different
 * framing: Users is every account (and may change roles), Customers is pinned to
 * `role = 'customer'` and focuses on spend. Passing the framing in keeps the
 * columns, filters and row actions identical instead of forking a second grid.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { StatsStrip, type StatsStripItem } from '@/components/admin/StatsStrip';
import { ToolbarSelect } from '@/components/admin/ToolbarSelect';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ApiError, api } from '@/lib/api';
import { alertError, alertSuccess, confirmAction, toastSuccess } from '@/lib/alerts';
import { formatNumber, num, timeAgo, titleCase } from '@/lib/format';
import { ACTIONS_COLUMN, avatarCell, money, pill, text, type CellAction } from '@/lib/tableHtml';
import type { User, UserRole, UserStatus } from '@/types';

const ROLES: Array<{ value: UserRole; label: string }> = [
  { value: 'admin', label: 'Administrator' },
  { value: 'staff', label: 'Staff' },
  { value: 'customer', label: 'Customer' },
];

const STATUSES: Array<{ value: UserStatus; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blocked', label: 'Blocked' },
];

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

export interface UserListProps {
  /** `admin` shows every account; `customer` pins the role and hides the column. */
  variant: 'admin' | 'customer';
  stats: StatsStripItem[];
  statsLoading: boolean;
  /** Only an admin can change roles, so only the Users module offers it. */
  canChangeRole: boolean;
  /** Re-fetch the stats strip after a mutation. */
  reloadStats: () => Promise<void>;
}

export function UserList({
  variant,
  stats,
  statsLoading,
  canChangeRole,
  reloadStats,
}: UserListProps) {
  const router = useRouter();
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [promoting, setPromoting] = useState<User | null>(null);

  // The parent owns the stats fetch (it knows which endpoint to use), so it also
  // performs the initial load.
  useEffect(() => {
    void reloadStats();
  }, [reloadStats]);

  const filters = useMemo(
    () => ({
      role: variant === 'customer' ? 'customer' : role || undefined,
      status: status || undefined,
    }),
    [variant, role, status]
  );

  const afterMutation = useCallback(() => {
    setReloadToken((value) => value + 1);
    void reloadStats();
  }, [reloadStats]);

  const handleAction = useCallback(
    async (key: string, row: User) => {
      if (key === 'view') {
        router.push(`${variant === 'customer' ? '/admin/customers' : '/admin/users'}/${row.id}`);
        return;
      }

      if (key === 'edit') {
        router.push(`/admin/users/${row.id}/edit`);
        return;
      }

      if (key === 'role') {
        setPromoting(row);
        return;
      }

      if (key === 'activate' || key === 'block' || key === 'deactivate') {
        const next: UserStatus =
          key === 'activate' ? 'active' : key === 'block' ? 'blocked' : 'inactive';
        const confirmed = await confirmAction({
          title: `${next === 'active' ? 'Activate' : next === 'blocked' ? 'Block' : 'Deactivate'} ${row.full_name}?`,
          text:
            next === 'active'
              ? 'They can sign in again immediately.'
              : 'Their active sessions are revoked and sign-in is refused.',
          confirmText: next === 'active' ? 'Activate' : next === 'blocked' ? 'Block' : 'Deactivate',
        });
        if (!confirmed) return;
        try {
          await api.patch(`/users/${row.id}/status`, { status: next });
          toastSuccess(`${row.full_name} is now ${next}`);
          afterMutation();
        } catch (error) {
          alertError('Could not change the status', describe(error));
        }
        return;
      }

      if (key === 'delete') {
        const confirmed = await confirmAction({
          title: `Delete ${row.full_name}?`,
          text: 'Their past orders stay in the books, but the account and its data are removed.',
          confirmText: 'Delete account',
        });
        if (!confirmed) return;
        try {
          // Customers are removed through their own route, which cascades to
          // the cart, wishlist, reviews and addresses in one transaction.
          await api.delete(
            variant === 'customer' ? `/customers/${row.id}` : `/users/${row.id}`
          );
          toastSuccess(`${row.full_name} was deleted`);
          afterMutation();
        } catch (error) {
          alertError('Could not delete the account', describe(error));
        }
      }
    },
    [afterMutation, router, variant]
  );

  const columns: DataTableColumn<User>[] = useMemo(() => {
    const base: DataTableColumn<User>[] = [
      {
        data: 'full_name',
        title: 'Name',
        sortable: true,
        render: (row) =>
          avatarCell({
            avatar: row.avatar,
            name: row.full_name,
            email: row.email,
            href: `${variant === 'customer' ? '/admin/customers' : '/admin/users'}/${row.id}`,
          }),
        exportValue: (row) => row.full_name,
      },
      {
        data: 'email',
        title: 'Email',
        sortable: true,
        render: (row) => `<span class="text-xs">${text(row.email)}</span>`,
        exportValue: (row) => row.email,
      },
    ];

    if (variant === 'admin') {
      base.push({
        data: 'role',
        title: 'Role',
        sortable: true,
        render: (row) => pill(titleCase(row.role), ROLE_TONES[row.role] ?? ''),
        exportValue: (row) => row.role,
      });
    }

    base.push(
      {
        data: 'status',
        title: 'Status',
        sortable: true,
        render: (row) => pill(titleCase(row.status), STATUS_TONES[row.status] ?? ''),
        exportValue: (row) => row.status,
      },
      {
        data: 'order_count',
        title: 'Orders',
        sortable: true,
        className: 'text-center',
        render: (row) =>
          row.order_count === undefined
            ? '<span class="text-muted">—</span>'
            : `<span class="tabular-nums">${formatNumber(row.order_count)}</span>`,
        exportValue: (row) => num(row.order_count),
      },
      {
        data: 'total_spent',
        title: 'Lifetime spend',
        sortable: true,
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row) =>
          row.total_spent === undefined
            ? '<span class="text-muted">—</span>'
            : `<span class="font-semibold">${money(row.total_spent)}</span>`,
        exportValue: (row) => num(row.total_spent),
      },
      {
        data: 'last_login_at',
        title: 'Last seen',
        sortable: true,
        render: (row) =>
          row.last_login_at
            ? `<span class="text-xs text-muted" title="${text(row.last_login_at)}">${text(timeAgo(row.last_login_at))}</span>`
            : '<span class="text-muted">Never</span>',
        exportValue: (row) => row.last_login_at ?? '',
      },
      {
        data: ACTIONS_COLUMN,
        title: '',
        skipExport: true,
        className: 'text-right',
      }
    );

    return base;
  }, [variant]);

  return (
    <>
      <PageHeader
        title={variant === 'admin' ? 'Users' : 'Customers'}
        description={
          variant === 'admin'
            ? 'Every account that can sign in to the store or the dashboard.'
            : 'Shoppers, what they have spent, and when they were last here.'
        }
        actions={
          variant === 'admin' ? (
            <Button
              leftIcon={<UserCheck className="size-4" />}
              onClick={() => router.push('/admin/users/new')}
            >
              New user
            </Button>
          ) : null
        }
      />

      <StatsStrip
        items={
          stats.length ? stats : Array.from({ length: 6 }, () => ({ label: '—', value: '' }))
        }
        loading={statsLoading}
      />

      <DataTable<User>
        id={variant === 'admin' ? 'users' : 'customers'}
        endpoint={variant === 'admin' ? '/users' : '/customers'}
        columns={columns}
        filters={filters}
        reloadToken={reloadToken}
        exportName={variant === 'admin' ? 'users' : 'customers'}
        exportTitle={variant === 'admin' ? 'User directory' : 'Customer list'}
        searchPlaceholder="Search name or email…"
        actions={(row): CellAction[] => [
          { key: 'view', label: 'View details', tone: 'neutral' },
          { key: 'edit', label: 'Edit account', tone: 'brand' },
          ...(canChangeRole
            ? [{ key: 'role', label: 'Change role', tone: 'neutral' } as CellAction]
            : []),
          ...(row.status === 'active'
            ? [
                { key: 'deactivate', label: 'Deactivate', tone: 'warning' } as CellAction,
                { key: 'block', label: 'Block sign-in', tone: 'danger' } as CellAction,
              ]
            : [{ key: 'activate', label: 'Activate', tone: 'success' } as CellAction]),
          { key: 'delete', label: 'Delete account', tone: 'danger' },
        ]}
        onAction={(key, row) => void handleAction(key, row)}
        toolbar={
          <>
            {variant === 'admin' ? (
              <ToolbarSelect
                id="filter-role"
                label="All roles"
                value={role}
                onChange={setRole}
                options={ROLES.map((option) => ({ value: option.value, label: option.label }))}
              />
            ) : null}
            <ToolbarSelect
              id="filter-user-status"
              label="Any status"
              value={status}
              onChange={setStatus}
              options={STATUSES.map((option) => ({ value: option.value, label: option.label }))}
            />
          </>
        }
      />

      {promoting ? (
        <RoleModal
          user={promoting}
          onClose={() => setPromoting(null)}
          onSaved={() => {
            setPromoting(null);
            afterMutation();
          }}
        />
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------------ modals */

function RoleModal({
  user,
  onClose,
  onSaved,
}: {
  user: User;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (role === user.role) {
      onClose();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/users/${user.id}/role`, { role });
      await alertSuccess(
        'Role updated',
        `${user.full_name} is now ${role === 'admin' ? 'an administrator' : role === 'staff' ? 'staff' : 'a customer'}.`
      );
      onSaved();
    } catch (cause) {
      setError(describe(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title="Change role"
      description={`${user.full_name} · ${user.email}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={() => void save()}
            loading={busy}
            leftIcon={<ShieldCheck className="size-4" />}
          >
            Save role
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {ROLES.map((option) => (
          <label
            key={option.value}
            className={
              'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ' +
              (role === option.value
                ? 'border-clay-500 bg-clay-50 dark:bg-clay-500/10'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-sunken)]')
            }
          >
            <input
              type="radio"
              name="role"
              value={option.value}
              checked={role === option.value}
              onChange={() => setRole(option.value)}
              className="mt-1 size-4 border-sand-300 text-clay-600 focus:ring-2 focus:ring-clay-500/30 dark:border-walnut-700 dark:bg-walnut-900"
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-sand-800 dark:text-sand-100">
                {option.label}
              </span>
              <span className="text-xs text-muted">{ROLE_HINTS[option.value]}</span>
            </span>
          </label>
        ))}

        {role === 'customer' && user.role !== 'customer' ? (
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <UserX className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span>
              Demoting to customer removes dashboard access on the next sign-in. The Users module
              is hidden from them.
            </span>
          </p>
        ) : null}

        {error ? <p className="text-xs font-medium text-rose-600">{error}</p> : null}
      </div>
    </Modal>
  );
}

const ROLE_HINTS: Record<UserRole, string> = {
  admin: 'Full access, including users, settings and files.',
  staff: 'Everything except user management and destructive settings.',
  customer: 'Storefront only. No dashboard access.',
};

/** Standalone confirm used by the reset-password action on the detail page. */
export async function requestPasswordReset(user: User): Promise<void> {
  const confirmed = await confirmAction({
    title: `Send a reset link to ${user.email}?`,
    text: 'They receive an email with a one-time link to choose a new password.',
    confirmText: 'Send link',
  });
  if (!confirmed) return;
  try {
    await api.post('/auth/forgot-password', { email: user.email });
    toastSuccess(`Reset link sent to ${user.email}`);
  } catch (error) {
    alertError('Could not send the reset link', describe(error));
  }
}

function describe(error: unknown): string {
  if (error instanceof ApiError && error.details.length > 0) {
    return error.details.map((detail) => detail.message).join(' ');
  }
  return error instanceof Error ? error.message : 'Unknown error';
}
