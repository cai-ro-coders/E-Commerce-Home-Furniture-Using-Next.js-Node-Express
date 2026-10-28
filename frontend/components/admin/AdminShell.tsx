'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRequireAuth } from '@/components/providers/AuthProvider';
import { PageSpinner } from '@/components/ui/Feedback';
import { api } from '@/lib/api';
import { num } from '@/lib/format';
import type { OrderStats, ReviewStats } from '@/types';
import { AdminSidebar, type AdminCounts } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

const EMPTY_COUNTS: AdminCounts = {
  orders_pending: 0,
  reviews_pending: 0,
  notifications_unread: 0,
};

/**
 * Chrome for the admin console.
 *
 * The guard here is UX only — every admin endpoint re-checks the role
 * server-side. Its job is to keep a signed-out visitor or a customer from
 * staring at an empty shell.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth({ roles: ['admin', 'staff'], redirectTo: '/' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState<AdminCounts>(EMPTY_COUNTS);

  const loadCounts = useCallback(async () => {
    try {
      // Three cheap endpoints beat re-querying the whole dashboard payload.
      const [notifications, orders, reviews] = await Promise.all([
        api.get<{ unread_count: number }>('/notifications/unread-count'),
        api.get<OrderStats>('/orders/stats'),
        api.get<ReviewStats>('/reviews/stats'),
      ]);
      setCounts({
        notifications_unread: Number(notifications.unread_count ?? 0),
        orders_pending: num(orders.open_orders),
        reviews_pending: num(reviews.pending),
      });
    } catch {
      // Badges are decoration: a failure here must not break the console.
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadCounts();
  }, [user, loadCounts]);

  const handleCountsChange = useCallback((patch: Partial<AdminCounts>) => {
    setCounts((current) => ({ ...current, ...patch }));
  }, []);

  if (loading) return <PageSpinner label="Preparing the console…" />;

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    // The redirect in `useRequireAuth` is already in flight.
    return <PageSpinner label="Redirecting…" />;
  }

  return (
    <div className="min-h-screen bg-[var(--surface-sunken)]">
      <AdminSidebar
        counts={counts}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <AdminTopbar
          counts={counts}
          onCountsChange={handleCountsChange}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
