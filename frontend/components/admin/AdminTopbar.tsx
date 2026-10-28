'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  ExternalLink,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown } from '@/components/ui/Dropdown';
import { Spinner } from '@/components/ui/Feedback';
import { useClickOutside } from '@/hooks/useClickOutside';
import { api } from '@/lib/api';
import { ROUTE_TITLES } from '@/lib/nav';
import { cn } from '@/lib/cn';
import { timeAgo } from '@/lib/format';
import { toastError } from '@/lib/alerts';
import type { Notification, NotificationFeed } from '@/types';
import type { AdminCounts } from './AdminSidebar';

interface AdminTopbarProps {
  counts: AdminCounts;
  onCountsChange: (counts: Partial<AdminCounts>) => void;
  onMenuClick: () => void;
}

/** Longest matching route prefix, so `/admin/orders/12` still says "Orders". */
function titleFor(pathname: string): string {
  const matches = Object.keys(ROUTE_TITLES)
    .filter((route) => pathname === route || pathname.startsWith(`${route}/`))
    .sort((a, b) => b.length - a.length);
  return matches[0] ? ROUTE_TITLES[matches[0]] : 'Admin';
}

export function AdminTopbar({ counts, onCountsChange, onMenuClick }: AdminTopbarProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [bellOpen, setBellOpen] = useState(false);
  const [feed, setFeed] = useState<Notification[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);

  const bellRef = useClickOutside<HTMLDivElement>(() => setBellOpen(false), bellOpen);
  const title = useMemo(() => titleFor(pathname), [pathname]);

  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const result = await api.get<NotificationFeed>('/notifications', { limit: 8 });
      setFeed(result.items ?? []);
      onCountsChange({ notifications_unread: result.unread_count ?? 0 });
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Could not load notifications');
    } finally {
      setFeedLoading(false);
    }
  }, [onCountsChange]);

  useEffect(() => {
    if (!bellOpen) return;
    void loadFeed();
  }, [bellOpen, loadFeed]);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setFeed((items) => items.map((item) => ({ ...item, read_at: item.read_at ?? new Date().toISOString() })));
      onCountsChange({ notifications_unread: 0 });
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Could not update notifications');
    }
  }, [onCountsChange]);

  const markOneRead = useCallback(
    async (notification: Notification) => {
      if (notification.read_at) return;
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        setFeed((items) =>
          items.map((item) =>
            item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item
          )
        );
        onCountsChange({ notifications_unread: Math.max(0, counts.notifications_unread - 1) });
      } catch {
        // Marking a notification read is best-effort; the link still navigates.
      }
    },
    [counts.notifications_unread, onCountsChange]
  );

  const cycleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light');
  };

  const ThemeIcon = theme === 'system' ? Monitor : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)]/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-sand-600 transition-colors hover:bg-sand-100 lg:hidden dark:text-sand-300 dark:hover:bg-walnut-800"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex min-w-0 flex-col">
        <h1 className="truncate font-display text-lg font-semibold leading-tight text-sand-900 dark:text-sand-50">
          {title}
        </h1>
        <p className="hidden text-xs text-muted sm:block">
          {isAdmin ? 'Administrator' : 'Staff'} console
        </p>
      </div>

      <div className="flex-1" />

      <Link
        href="/admin/products"
        className="hidden items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-xs font-medium text-sand-600 transition-colors hover:bg-sand-100 md:inline-flex dark:text-sand-300 dark:hover:bg-walnut-800"
      >
        <Search className="size-3.5" aria-hidden />
        Find a product
      </Link>

      <button
        type="button"
        onClick={cycleTheme}
        aria-label={`Theme: ${theme}`}
        title={`Theme: ${theme}`}
        className="rounded-lg p-2 text-sand-600 transition-colors hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-walnut-800"
      >
        <ThemeIcon className="size-5" />
      </button>

      {/* ------------------------------------------------------- bell */}
      <div className="relative" ref={bellRef}>
        <button
          type="button"
          onClick={() => setBellOpen((open) => !open)}
          aria-label="Notifications"
          aria-expanded={bellOpen}
          className="relative rounded-lg p-2 text-sand-600 transition-colors hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-walnut-800"
        >
          <Bell className="size-5" />
          {counts.notifications_unread > 0 ? (
            <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.6rem] font-bold text-white">
              {counts.notifications_unread > 9 ? '9+' : counts.notifications_unread}
            </span>
          ) : null}
        </button>

        {bellOpen ? (
          <div className="animate-fade-in absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-raised)] shadow-lg sm:w-96">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
              <span className="text-sm font-semibold text-sand-900 dark:text-sand-50">
                Notifications
              </span>
              <button
                type="button"
                onClick={() => void markAllRead()}
                disabled={counts.notifications_unread === 0}
                className="inline-flex items-center gap-1 text-xs font-medium text-clay-700 transition-opacity hover:underline disabled:opacity-40 dark:text-clay-400"
              >
                <CheckCheck className="size-3.5" aria-hidden />
                Mark all read
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {feedLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Spinner />
                </div>
              ) : feed.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted">You are all caught up.</p>
              ) : (
                <ul className="divide-y divide-[var(--border-subtle)]">
                  {feed.map((item) => {
                    const body = (
                      <div className="flex gap-3">
                        <span
                          className={cn(
                            'mt-1.5 size-2 shrink-0 rounded-full',
                            item.read_at
                              ? 'bg-sand-300 dark:bg-walnut-800'
                              : item.type === 'error'
                                ? 'bg-rose-500'
                                : item.type === 'warning'
                                  ? 'bg-amber-500'
                                  : item.type === 'success'
                                    ? 'bg-emerald-500'
                                    : 'bg-sky-500'
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-sand-900 dark:text-sand-100">
                            {item.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{item.message}</p>
                          <p className="mt-1 text-[0.7rem] text-sand-400">{timeAgo(item.created_at)}</p>
                        </div>
                      </div>
                    );

                    return (
                      <li key={item.id}>
                        <Link
                          href={item.link ?? '/admin/notifications'}
                          onClick={() => {
                            void markOneRead(item);
                            setBellOpen(false);
                          }}
                          className="block px-4 py-3 transition-colors hover:bg-sand-50 dark:hover:bg-walnut-800/60"
                        >
                          {body}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <Link
              href="/admin/notifications"
              onClick={() => setBellOpen(false)}
              className="flex items-center justify-center gap-1.5 border-t border-[var(--border-subtle)] px-4 py-2.5 text-xs font-medium text-clay-700 hover:bg-sand-50 dark:text-clay-400 dark:hover:bg-walnut-800/60"
            >
              Open notification centre
              <ExternalLink className="size-3" aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>

      {/* ------------------------------------------------- user menu */}
      <Dropdown
        align="right"
        trigger={
          <span className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-sand-100 dark:hover:bg-walnut-800">
            <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="max-w-32 truncate text-xs font-semibold text-sand-900 dark:text-sand-100">
                {user?.full_name ?? 'Account'}
              </span>
              <span className="text-[0.65rem] uppercase tracking-wide text-muted">
                {user?.role ?? 'guest'}
              </span>
            </span>
          </span>
        }
        items={[
          { label: 'My account', href: '/account', icon: <UserRound className="size-4" /> },
          { label: 'Storefront', href: '/', icon: <ExternalLink className="size-4" /> },
          {
            label: 'Sign out',
            danger: true,
            divider: true,
            icon: <ExternalLink className="size-4" />,
            onClick: () => void logout(),
          },
        ]}
      />
    </header>
  );
}
