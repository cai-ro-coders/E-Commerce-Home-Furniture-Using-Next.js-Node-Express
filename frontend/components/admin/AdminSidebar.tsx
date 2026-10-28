'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Store, X } from 'lucide-react';
import { ADMIN_NAV, BRAND } from '@/lib/nav';
import { cn } from '@/lib/cn';
import { useAuth } from '@/components/providers/AuthProvider';

/** Live badge counts, fetched once by the shell and shared with the nav. */
export interface AdminCounts {
  orders_pending: number;
  reviews_pending: number;
  notifications_unread: number;
}

interface AdminSidebarProps {
  counts: AdminCounts;
  /** Mobile drawer state. Ignored from `lg` up, where the rail is permanent. */
  open: boolean;
  onClose: () => void;
}

/** The 12 admin modules, grouped, with role filtering and live badges. */
export function AdminSidebar({ counts, open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Scrim: only exists while the drawer is open on a small screen. */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          'fixed inset-0 z-30 bg-walnut-950/50 backdrop-blur-[1px] transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--surface-raised)] transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Admin navigation"
      >
        {/* ------------------------------------------------------- brand */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
            <span className="flex size-9 items-center justify-center rounded-xl bg-clay-600 text-white shadow-sm">
              <Store className="size-5" aria-hidden />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-base font-semibold text-sand-900 dark:text-sand-50">
                {BRAND.short}
              </span>
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted">
                Admin
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-1.5 text-sand-500 hover:bg-sand-100 lg:hidden dark:hover:bg-walnut-800"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* --------------------------------------------------------- nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {ADMIN_NAV.map((section) => {
            const items = section.items.filter(
              (item) => !item.roles || (user ? hasRole(...item.roles) : false)
            );
            if (items.length === 0) return null;

            return (
              <div key={section.title} className="mb-5 last:mb-0">
                <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-sand-400 dark:text-sand-500">
                  {section.title}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {items.map((item) => {
                    const active = isActive(item.href, item.exact);
                    const badge = item.badge ? counts[item.badge] : 0;
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            active
                              ? 'bg-clay-600 text-white shadow-sm'
                              : 'text-sand-700 hover:bg-sand-100 hover:text-sand-900 dark:text-sand-300 dark:hover:bg-walnut-800 dark:hover:text-sand-50'
                          )}
                        >
                          <Icon
                            className={cn(
                              'size-4 shrink-0',
                              active ? 'text-white' : 'text-sand-400 group-hover:text-clay-600'
                            )}
                            aria-hidden
                          />
                          <span className="flex-1 truncate">{item.label}</span>
                          {badge > 0 ? (
                            <span
                              className={cn(
                                'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold',
                                active
                                  ? 'bg-white/25 text-white'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                              )}
                            >
                              {badge > 99 ? '99+' : badge}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* ------------------------------------------------------ footer */}
        <div className="shrink-0 border-t border-[var(--border-subtle)] p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sand-700 transition-colors hover:bg-sand-100 dark:text-sand-300 dark:hover:bg-walnut-800"
          >
            <Store className="size-4 text-sand-400" aria-hidden />
            View storefront
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sand-700 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-sand-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
