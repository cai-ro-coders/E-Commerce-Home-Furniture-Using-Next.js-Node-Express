'use client';

import { useCallback, useState } from 'react';
import { UserList } from '@/components/admin/users/UserList';
import { api } from '@/lib/api';
import { formatMoney, formatNumber } from '@/lib/format';
import type { CustomerStats } from '@/types';

export default function CustomersPage() {
  const [stats, setStats] = useState<CustomerStats | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setStats(await api.get<CustomerStats>('/customers/stats'));
    } catch {
      setStats(null);
    }
  }, []);

  return (
    <UserList
      variant="customer"
      canChangeRole={false}
      reloadStats={loadStats}
      statsLoading={!stats}
      stats={stats ? [
        { label: 'Shoppers', value: formatNumber(stats.total) },
        { label: 'Active', value: formatNumber(stats.active), tone: 'success' },
        { label: 'Blocked', value: formatNumber(stats.blocked), tone: 'danger' },
        { label: 'New this month', value: formatNumber(stats.new_this_month), tone: 'brand' },
        {
          label: 'Lifetime value',
          value: formatMoney(stats.lifetime_value, 'PHP', { decimals: 0 }),
        },
      ] : []}
    />
  );
}
