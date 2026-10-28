'use client';

import { useCallback, useState } from 'react';
import { UserList, type UserListProps } from '@/components/admin/users/UserList';
import { api } from '@/lib/api';
import { formatNumber } from '@/lib/format';
import { useAuth } from '@/components/providers/AuthProvider';
import type { UserStats } from '@/types';

export default function UsersPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setStats(await api.get<UserStats>('/users/stats'));
    } catch {
      setStats(null);
    }
  }, []);

  // Only an admin can change roles, so the action is offered conditionally
  // rather than relying on the API to reject it.
  const props: Omit<UserListProps, 'stats' | 'statsLoading'> = {
    variant: 'admin',
    canChangeRole: user?.role === 'admin',
    reloadStats: loadStats,
  };

  return (
    <UserList
      {...props}
      statsLoading={!stats}
      stats={stats ? [
        { label: 'Accounts', value: formatNumber(stats.total) },
        { label: 'Admins', value: formatNumber(stats.admins), tone: 'brand' },
        { label: 'Staff', value: formatNumber(stats.staff) },
        { label: 'Customers', value: formatNumber(stats.customers) },
        { label: 'Active', value: formatNumber(stats.active), tone: 'success' },
        { label: 'Blocked', value: formatNumber(stats.blocked), tone: 'danger' },
        { label: 'New this month', value: formatNumber(stats.new_this_month) },
      ] : []}
    />
  );
}
