'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bell,
  CreditCard,
  Heart,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
  User,
} from 'lucide-react';
import { StoreShell } from '@/components/storefront/StoreShell';
import { useAuth } from '@/components/providers/AuthProvider';
import { useStore } from '@/components/providers/StoreProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, DetailItem } from '@/components/ui/Card';
import { Field, Input, Modal } from '@/components/ui';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { Tabs } from '@/components/ui/Tabs';
import { ApiError, api } from '@/lib/api';
import { alertError, alertSuccess, confirmAction } from '@/lib/alerts';
import { formatDateTime, formatMoney, orderStatusTag, paymentStatusTag, timeAgo } from '@/lib/format';
import type { Address, Order } from '@/types';

type MainTabKey = 'dashboard' | 'orders' | 'notifications' | 'cart' | 'wishlist' | 'settings';
type DashboardTabKey = 'overview' | 'myorder';
type SettingsTabKey = 'profile' | 'billing' | 'security';

export default function AccountPage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading your account…" />}>
      <AccountPageInner />
    </Suspense>
  );
}

function AccountPageInner() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { wishlist, cart } = useStore();
  const raw = useSearchParams();
  const tab = (raw.get('tab') as MainTabKey) || 'dashboard';
  const dashboardView = (raw.get('view') as DashboardTabKey) || 'overview';
  const settingsView = (raw.get('setting') as SettingsTabKey) || 'profile';

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [editing, setEditing] = useState<Address | null | undefined>(undefined);
  const [signingOut, setSigningOut] = useState(false);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const result = await api.list<Order>('/orders', { pageSize: 50, sortBy: 'id', sortDir: 'desc' });
      setOrders(result.data);
      setOrdersTotal(result.meta.total);
    } catch {
      setOrders([]);
      setOrdersTotal(0);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const loadAddresses = useCallback(async () => {
    setAddressesLoading(true);
    try {
      setAddresses(await api.get<Address[]>('/auth/addresses'));
    } catch {
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadOrders();
    void loadAddresses();
  }, [user, loadOrders, loadAddresses]);

  if (authLoading) {
    return (
      <StoreShell>
        <PageSpinner label="Loading your account…" />
      </StoreShell>
    );
  }

  if (!user) {
    return (
      <StoreShell>
        <Card>
          <CardBody>
            <ErrorState
              title="Sign in to see your account"
              description="Your orders, addresses and wishlist live here."
              onRetry={() => router.push('/login?next=/account')}
            />
          </CardBody>
        </Card>
      </StoreShell>
    );
  }

  const signOut = async () => {
    setSigningOut(true);
    await logout();
    await alertSuccess('Signed out');
    router.push('/');
  };

  const pendingOrders = orders.filter((order) => order.order_status === 'Pending').length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.grand_total || 0), 0);
  const cartItems = cart?.items?.length ?? 0;

  const goTab = (value: MainTabKey, extras: Record<string, string> = {}) => {
    const params = new URLSearchParams({ tab: value, ...extras });
    router.push(`/account?${params.toString()}`);
  };

  return (
    <StoreShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Avatar src={user.avatar} name={user.full_name} size="lg" />
            <div>
              <h1 className="font-display text-2xl font-semibold text-sand-900 dark:text-sand-50">
                My Account
              </h1>
              <p className="text-sm text-muted">
                Welcome back, {user.full_name} ({user.email})
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<LogOut className="size-3.5" />}
            loading={signingOut}
            onClick={() => void signOut()}
          >
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="flex flex-col gap-2">
            <Card>
              <CardBody className="p-2">
                <nav className="flex flex-col">
                  <button
                    onClick={() => goTab('dashboard')}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      tab === 'dashboard' ? 'bg-sand-100 text-walnut-950 dark:bg-walnut-800 dark:text-sand-50' : 'text-sand-700 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-walnut-800'
                    }`}
                  >
                    <LayoutDashboard className="size-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={() => goTab('orders')}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      tab === 'orders' ? 'bg-sand-100 text-walnut-950 dark:bg-walnut-800 dark:text-sand-50' : 'text-sand-700 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-walnut-800'
                    }`}
                  >
                    <Package className="size-4" />
                    My Order
                  </button>
                  <button
                    onClick={() => goTab('notifications')}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      tab === 'notifications' ? 'bg-sand-100 text-walnut-950 dark:bg-walnut-800 dark:text-sand-50' : 'text-sand-700 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-walnut-800'
                    }`}
                  >
                    <Bell className="size-4" />
                    Notifications
                  </button>
                  <button
                    onClick={() => goTab('cart')}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      tab === 'cart' ? 'bg-sand-100 text-walnut-950 dark:bg-walnut-800 dark:text-sand-50' : 'text-sand-700 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-walnut-800'
                    }`}
                  >
                    <ShoppingCart className="size-4" />
                    My Cart
                  </button>
                  <button
                    onClick={() => goTab('wishlist')}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      tab === 'wishlist' ? 'bg-sand-100 text-walnut-950 dark:bg-walnut-800 dark:text-sand-50' : 'text-sand-700 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-walnut-800'
                    }`}
                  >
                    <Heart className="size-4" />
                    Wishlist
                  </button>
                  <div className="my-2 h-px bg-[var(--border-subtle)]" />
                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted">Settings</p>
                  <button
                    onClick={() => goTab('settings', { setting: 'profile' })}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      tab === 'settings' && settingsView === 'profile' ? 'bg-sand-100 text-walnut-950 dark:bg-walnut-800 dark:text-sand-50' : 'text-sand-700 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-walnut-800'
                    }`}
                  >
                    <User className="size-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => goTab('settings', { setting: 'billing' })}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      tab === 'settings' && settingsView === 'billing' ? 'bg-sand-100 text-walnut-950 dark:bg-walnut-800 dark:text-sand-50' : 'text-sand-700 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-walnut-800'
                    }`}
                  >
                    <CreditCard className="size-4" />
                    Billing Address
                  </button>
                  <button
                    onClick={() => goTab('settings', { setting: 'security' })}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      tab === 'settings' && settingsView === 'security' ? 'bg-sand-100 text-walnut-950 dark:bg-walnut-800 dark:text-sand-50' : 'text-sand-700 hover:bg-sand-100 dark:text-sand-200 dark:hover:bg-walnut-800'
                    }`}
                  >
                    <KeyRound className="size-4" />
                    Security
                  </button>
                  <button
                    onClick={() => void signOut()}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </nav>
              </CardBody>
            </Card>
          </aside>

          <div className="flex flex-col gap-6">
            {tab === 'dashboard' ? (
              <>
                {dashboardView === 'overview' ? (
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-lg font-semibold text-sand-900 dark:text-sand-50">Overview</h2>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => goTab('dashboard', { view: 'myorder' })}>
                          My Orders
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardBody className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted">Total Orders</p>
                            <p className="mt-1 text-2xl font-semibold">{ordersTotal}</p>
                          </div>
                          <Package className="size-8 text-clay-600" />
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted">Pending Orders</p>
                            <p className="mt-1 text-2xl font-semibold">{pendingOrders}</p>
                          </div>
                          <Package className="size-8 text-amber-600" />
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted">Wishlist Items</p>
                            <p className="mt-1 text-2xl font-semibold">{wishlist.length}</p>
                          </div>
                          <Heart className="size-8 text-rose-500" />
                        </CardBody>
                      </Card>
                      <Card>
                        <CardBody className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted">Total Spent</p>
                            <p className="mt-1 text-lg font-semibold">{formatMoney(totalSpent, 'PHP')}</p>
                          </div>
                          <CreditCard className="size-8 text-emerald-600" />
                        </CardBody>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader title="Recent Orders" description="Your latest orders" />
                      <CardBody className="p-0">
                        {ordersLoading ? (
                          <p className="px-5 py-8 text-center text-sm text-muted">Loading…</p>
                        ) : orders.length === 0 ? (
                          <p className="px-5 py-8 text-center text-sm text-muted">No orders yet</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-[var(--surface-sunken)]">
                                <tr>
                                  <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Order</th>
                                  <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Date</th>
                                  <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                                  <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Payment</th>
                                  <th className="px-5 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--border-subtle)]">
                                {orders.slice(0, 5).map((order) => {
                                  const status = orderStatusTag(order.order_status);
                                  const payment = paymentStatusTag(order.payment_status);
                                  return (
                                    <tr key={order.id}>
                                      <td className="px-5 py-3 font-mono text-xs">{order.order_number}</td>
                                      <td className="px-5 py-3 text-muted">{formatDateTime(order.created_at)}</td>
                                      <td className="px-5 py-3"><Badge className={status.className}>{status.label}</Badge></td>
                                      <td className="px-5 py-3"><Badge className={payment.className}>{payment.label}</Badge></td>
                                      <td className="px-5 py-3 text-right font-semibold">{formatMoney(order.grand_total, 'PHP')}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-sand-900 dark:text-sand-50">My Orders</h2>
                      <Button size="sm" variant="outline" onClick={() => goTab('dashboard', { view: 'overview' })}>
                        Back to Overview
                      </Button>
                    </div>
                    <Card>
                      <CardHeader title="My Orders" description="Track and manage your orders" />
                      <CardBody className="p-0">
                        {ordersLoading ? (
                          <p className="px-5 py-8 text-center text-sm text-muted">Loading…</p>
                        ) : orders.length === 0 ? (
                          <p className="px-5 py-8 text-center text-sm text-muted">No orders yet</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-[var(--surface-sunken)]">
                                <tr>
                                  <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Order Number</th>
                                  <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Date</th>
                                  <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Items</th>
                                  <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                                  <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Payment</th>
                                  <th className="px-5 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted">Total</th>
                                  <th className="px-5 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--border-subtle)]">
                                {orders.map((order) => {
                                  const status = orderStatusTag(order.order_status);
                                  const payment = paymentStatusTag(order.payment_status);
                                  return (
                                    <tr key={order.id}>
                                      <td className="px-5 py-3 font-mono text-xs">{order.order_number}</td>
                                      <td className="px-5 py-3 text-muted">{formatDateTime(order.created_at)}</td>
                                      <td className="px-5 py-3">{order.item_count ?? 0}</td>
                                      <td className="px-5 py-3"><Badge className={status.className}>{status.label}</Badge></td>
                                      <td className="px-5 py-3"><Badge className={payment.className}>{payment.label}</Badge></td>
                                      <td className="px-5 py-3 text-right font-semibold">{formatMoney(order.grand_total, 'PHP')}</td>
                                      <td className="px-5 py-3 text-right"><Link href={`/orders/${order.id}`} className="text-xs font-medium text-clay-700 hover:underline">Track / View</Link></td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </div>
                )}
              </>
            ) : null}

            {tab === 'orders' ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-sand-900 dark:text-sand-50">My Order</h2>
                <Card>
                  <CardHeader title="My Orders" description="Track and manage your orders" />
                  <CardBody className="p-0">
                    {ordersLoading ? (
                      <p className="px-5 py-8 text-center text-sm text-muted">Loading…</p>
                    ) : orders.length === 0 ? (
                      <div className="px-5 py-10 text-center">
                        <Package className="mx-auto size-8 text-sand-300 dark:text-walnut-700" aria-hidden />
                        <p className="mt-3 text-sm font-medium text-sand-800 dark:text-sand-100">No orders yet</p>
                        <Link href="/products" className="mt-4 inline-block">
                          <Button variant="outline" size="sm">Start shopping</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-[var(--surface-sunken)]">
                            <tr>
                              <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Order Number</th>
                              <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Date</th>
                              <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Items</th>
                              <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                              <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Payment</th>
                              <th className="px-5 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted">Total</th>
                              <th className="px-5 py-2 text-right text-xs font-semibold uppercase tracking-wide text-muted">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-subtle)]">
                            {orders.map((order) => {
                              const status = orderStatusTag(order.order_status);
                              const payment = paymentStatusTag(order.payment_status);
                              return (
                                <tr key={order.id}>
                                  <td className="px-5 py-3 font-mono text-xs">{order.order_number}</td>
                                  <td className="px-5 py-3 text-muted">{formatDateTime(order.created_at)}</td>
                                  <td className="px-5 py-3">{order.item_count ?? 0}</td>
                                  <td className="px-5 py-3"><Badge className={status.className}>{status.label}</Badge></td>
                                  <td className="px-5 py-3"><Badge className={payment.className}>{payment.label}</Badge></td>
                                  <td className="px-5 py-3 text-right font-semibold">{formatMoney(order.grand_total, 'PHP')}</td>
                                  <td className="px-5 py-3 text-right"><Link href={`/orders/${order.id}`} className="text-xs font-medium text-clay-700 hover:underline">Track and manage your orders</Link></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </div>
            ) : null}

            {tab === 'notifications' ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-sand-900 dark:text-sand-50">Notifications</h2>
                <Card>
                  <CardHeader title="Notifications" description="Updates about your orders and account" />
                  <CardBody>
                    <p className="text-sm text-muted">No new notifications.</p>
                  </CardBody>
                </Card>
              </div>
            ) : null}

            {tab === 'cart' ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-sand-900 dark:text-sand-50">My Cart</h2>
                <Card>
                  <CardHeader title="My Cart" description="Review items in your cart" />
                  <CardBody>
                    <p className="text-sm text-muted">You have {cartItems} item{cartItems === 1 ? '' : 's'} in your cart.</p>
                    <Link href="/cart" className="mt-3 inline-block">
                      <Button size="sm">View Cart</Button>
                    </Link>
                  </CardBody>
                </Card>
              </div>
            ) : null}

            {tab === 'wishlist' ? (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-sand-900 dark:text-sand-50">Wishlist</h2>
                <Card>
                  <CardHeader title="Wishlist" description="Saved products" />
                  <CardBody>
                    <p className="text-sm text-muted">You have {wishlist.length} saved item{wishlist.length === 1 ? '' : 's'}.</p>
                    <Link href="/wishlist" className="mt-3 inline-block">
                      <Button size="sm">View Wishlist</Button>
                    </Link>
                  </CardBody>
                </Card>
              </div>
            ) : null}

            {tab === 'settings' ? (
              <div className="flex flex-col gap-6">
                <h2 className="text-lg font-semibold text-sand-900 dark:text-sand-50">Settings</h2>
                <Tabs
                  tabs={[
                    { id: 'profile', label: 'Profile' },
                    { id: 'billing', label: 'Billing Address' },
                    { id: 'security', label: 'Security' },
                  ]}
                  active={settingsView}
                  onChange={(value) => goTab('settings', { setting: value })}
                />

                {settingsView === 'profile' ? (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                      <CardHeader title="Profile" description="How we address you and reach you." />
                      <CardBody>
                        <dl className="divide-y divide-[var(--border-subtle)]">
                          <DetailItem className="py-3" label="Full name" value={user.full_name} />
                          <DetailItem className="py-3" label="Email" value={user.email} />
                          <DetailItem className="py-3" label="Phone" value={user.phone ?? '—'} />
                          <DetailItem className="py-3" label="Member since" value={user.created_at ? formatDateTime(user.created_at) : '—'} />
                          <DetailItem className="py-3" label="Last sign-in" value={user.last_login_at ? timeAgo(user.last_login_at) : 'Never'} />
                        </dl>
                      </CardBody>
                    </Card>
                  </div>
                ) : null}

                {settingsView === 'billing' ? (
                  <Card>
                    <CardHeader
                      title="Billing Address"
                      description="Where deliveries can go."
                      action={
                        <Button size="sm" leftIcon={<Plus className="size-3.5" />} onClick={() => setEditing(null)}>
                          Add address
                        </Button>
                      }
                    />
                    <CardBody className="p-0">
                      {addressesLoading ? (
                        <p className="px-5 py-10 text-center text-sm text-muted">Loading…</p>
                      ) : addresses.length === 0 ? (
                        <div className="px-5 py-10 text-center">
                          <MapPin className="mx-auto size-8 text-sand-300 dark:text-walnut-700" aria-hidden />
                          <p className="mt-3 text-sm font-medium text-sand-800 dark:text-sand-100">No addresses yet</p>
                          <p className="mt-1 text-xs text-muted">Add one now and checkout will be a single tap.</p>
                        </div>
                      ) : (
                        <ul className="divide-y divide-[var(--border-subtle)]">
                          {addresses.map((address) => (
                            <li key={address.id} className="flex items-start justify-between gap-3 px-5 py-4">
                              <div className="min-w-0">
                                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-sand-900 dark:text-sand-50">
                                  {address.full_name}
                                  {address.is_default ? (
                                    <Badge className="bg-clay-100 text-clay-700 dark:bg-clay-500/15 dark:text-clay-300">Default</Badge>
                                  ) : null}
                                </p>
                                <address className="mt-1 text-xs not-italic leading-relaxed text-muted">
                                  {address.address_line_1}
                                  {address.address_line_2 ? `, ${address.address_line_2}` : ''}
                                  <br />
                                  {[address.city, address.province, address.postal_code].filter(Boolean).join(', ')}{', '}{address.country}
                                  <br />
                                  {address.phone}
                                </address>
                              </div>
                              <div className="flex shrink-0 gap-1">
                                <button type="button" aria-label={`Edit address for ${address.full_name}`} onClick={() => setEditing(address)} className="rounded-lg p-2 text-sand-500 transition-colors hover:bg-[var(--surface-sunken)] hover:text-clay-700">
                                  <Pencil className="size-4" />
                                </button>
                                <button type="button" aria-label={`Delete address for ${address.full_name}`} onClick={() => void removeAddress(address.id, loadAddresses)} className="rounded-lg p-2 text-sand-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardBody>
                  </Card>
                ) : null}

                {settingsView === 'security' ? (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader title="Change password" description="You will stay signed in on this device." />
                      <CardBody>
                        <ChangePasswordForm />
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader title="Sign-in history" description="The last few times this account was used." />
                      <CardBody className="p-0">
                        <LoginHistory />
                      </CardBody>
                    </Card>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {editing !== undefined ? (
          <AddressModal
            address={editing ?? undefined}
            onClose={() => setEditing(undefined)}
            onSaved={() => {
              setEditing(undefined);
              void loadAddresses();
            }}
          />
        ) : null}
      </div>
    </StoreShell>
  );
}

function ChangePasswordForm() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const invalid =
    form.next.length < 8 || form.next !== form.confirm || !/[a-z]/.test(form.next) || !/[A-Z]/.test(form.next) || !/[0-9]/.test(form.next);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (invalid) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/auth/change-password', {
        current_password: form.current,
        new_password: form.next,
      });
      await alertSuccess('Password changed');
      setForm({ current: '', next: '', confirm: '' });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not change the password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Field label="Current password" required>
        <Input
          type="password"
          value={form.current}
          onChange={(event) => setForm((f) => ({ ...f, current: event.target.value }))}
          required
          autoComplete="current-password"
        />
      </Field>
      <Field
        label="New password"
        required
        hint="At least 8 characters, with upper case, lower case and a number."
      >
        <Input
          type="password"
          value={form.next}
          onChange={(event) => setForm((f) => ({ ...f, next: event.target.value }))}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Repeat new password" required error={form.confirm && form.next !== form.confirm ? 'Passwords do not match' : undefined}>
        <Input
          type="password"
          value={form.confirm}
          onChange={(event) => setForm((f) => ({ ...f, confirm: event.target.value }))}
          required
          autoComplete="new-password"
        />
      </Field>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      ) : null}

      <Button type="submit" loading={saving} disabled={invalid} leftIcon={<KeyRound className="size-4" />}>
        Change password
      </Button>
    </form>
  );
}

function LoginHistory() {
  const [entries, setEntries] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setEntries(await api.get<Array<Record<string, unknown>>>('/auth/login-history'));
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="px-5 py-8 text-center text-sm text-muted">Loading…</p>;

  if (entries.length === 0) {
    return <p className="px-5 py-8 text-center text-sm text-muted">No sign-in history.</p>;
  }

  return (
    <ul className="divide-y divide-[var(--border-subtle)]">
      {entries.map((entry, index) => (
        <li key={index} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
          <div className="min-w-0">
            <p className="text-sand-800 dark:text-sand-100">
              {entry.success ? 'Signed in' : 'Failed attempt'}
              {entry.reason ? <span className="text-muted"> — {String(entry.reason)}</span> : null}
            </p>
            <p className="truncate text-xs text-muted">
              {entry.ip_address ? String(entry.ip_address) : 'unknown IP'}
              {entry.user_agent ? ` · ${String(entry.user_agent).slice(0, 40)}…` : ''}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted">{timeAgo(String(entry.created_at))}</span>
        </li>
      ))}
    </ul>
  );
}

function AddressModal({
  address,
  onClose,
  onSaved,
}: {
  address?: Address;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(address);
  const [form, setForm] = useState({
    full_name: address?.full_name ?? '',
    phone: address?.phone ?? '',
    address_line_1: address?.address_line_1 ?? '',
    address_line_2: address?.address_line_2 ?? '',
    city: address?.city ?? '',
    province: address?.province ?? '',
    postal_code: address?.postal_code ?? '',
    country: address?.country ?? 'Philippines',
    is_default: Boolean(address?.is_default),
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit && address) {
        await api.put(`/auth/addresses/${address.id}`, form);
      } else {
        await api.post('/auth/addresses', form);
      }
      await alertSuccess(isEdit ? 'Address saved' : 'Address added');
      onSaved();
    } catch (cause) {
      if (cause instanceof ApiError && cause.details.length > 0) {
        setError(Object.values(cause.fieldErrors)[0]);
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not save the address');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      locked={saving}
      title={isEdit ? 'Edit address' : 'New address'}
      description="Used at checkout and on the delivery note."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="address-form" loading={saving}>
            {isEdit ? 'Save address' : 'Add address'}
          </Button>
        </>
      }
    >
      <form id="address-form" onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name" required>
            <Input value={form.full_name} onChange={(event) => set('full_name', event.target.value)} required maxLength={120} />
          </Field>
          <Field label="Phone" required>
            <Input value={form.phone} onChange={(event) => set('phone', event.target.value)} required maxLength={32} />
          </Field>
        </div>

        <Field label="Address line 1" required>
          <Input value={form.address_line_1} onChange={(event) => set('address_line_1', event.target.value)} required maxLength={190} />
        </Field>

        <Field label="Address line 2" hint="Optional — unit, floor, landmark.">
          <Input value={form.address_line_2} onChange={(event) => set('address_line_2', event.target.value)} maxLength={190} />
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="City" required>
            <Input value={form.city} onChange={(event) => set('city', event.target.value)} required maxLength={120} />
          </Field>
          <Field label="Province">
            <Input value={form.province} onChange={(event) => set('province', event.target.value)} maxLength={120} />
          </Field>
          <Field label="Postal code">
            <Input value={form.postal_code} onChange={(event) => set('postal_code', event.target.value)} maxLength={20} />
          </Field>
        </div>

        <Field label="Country" required>
          <Input value={form.country} onChange={(event) => set('country', event.target.value)} required maxLength={120} />
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={form.is_default}
            onChange={(event) => set('is_default', event.target.checked)}
            className="size-4 accent-clay-600"
          />
          <span className="text-sand-700 dark:text-sand-200">Make this my default address</span>
        </label>

        {error ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

async function removeAddress(id: number, onDone: () => void) {
  const confirmed = await confirmAction({
    title: 'Delete this address?',
    text: 'Orders already placed keep the address they were sent to.',
    confirmText: 'Delete address',
    danger: true,
  });
  if (!confirmed) return;
  try {
    await api.delete(`/auth/addresses/${id}`);
    await alertSuccess('Address deleted');
    onDone();
  } catch (error) {
    alertError('Could not delete the address', error instanceof Error ? error.message : 'Unknown error');
  }
}
