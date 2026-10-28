'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import type { AuthUser, UserRole } from '@/types';

interface MeResponse {
  user: AuthUser;
  cart: { count?: number; item_count?: number } | number;
  notifications: { count?: number; unread?: number } | number;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** `true` until the initial `/auth/me` probe settles. */
  loading: boolean;
  cartCount: number;
  notificationCount: number;
  isAuthenticated: boolean;
  isStaff: boolean;
  isAdmin: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  /** Re-read `/auth/me` after a profile change. */
  refresh: () => Promise<void>;
  setCartCount: (count: number) => void;
  setNotificationCount: (count: number) => void;
}

export interface RegisterInput {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** The badge endpoints and `/auth/me` disagree on their wrapper shape. */
function countOf(value: MeResponse['cart']): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    return Number(value.count ?? value.item_count ?? 0);
  }
  return 0;
}

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const router = useRouter();
  const probed = useRef(false);

  const loadMe = useCallback(async () => {
    try {
      const me = await api.get<MeResponse>('/auth/me');
      setUser(me.user);
      setCartCount(countOf(me.cart));
      setNotificationCount(countOf(me.notifications));
    } catch (error) {
      // 401 simply means "signed out"; anything else is worth surfacing.
      if (!(error instanceof ApiError) || error.status !== 401) {
        console.warn('Could not load the current user', error);
      }
      setUser(null);
      setCartCount(0);
      setNotificationCount(0);
    }
  }, []);

  useEffect(() => {
    if (probed.current) return;
    probed.current = true;
    void loadMe().finally(() => setLoading(false));
  }, [loadMe]);

  const login = useCallback(
    async (email: string, password: string, remember = false) => {
      const result = await api.post<{ user: AuthUser }>('/auth/login', {
        email,
        password,
        remember_me: remember,
      });
      setUser(result.user);
      // Cart/notification badges are per-account; fetch them fresh on sign-in.
      void loadMe();
      return result.user;
    },
    [loadMe]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const result = await api.post<{ user: AuthUser }>('/auth/register', input);
      if (result?.user) setUser(result.user);
      void loadMe();
      return result.user;
    },
    [loadMe]
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setCartCount(0);
      setNotificationCount(0);
      router.push('/login');
    }
  }, [router]);

  const refresh = useCallback(async () => {
    await loadMe();
  }, [loadMe]);

  const hasRole = useCallback(
    (...roles: UserRole[]) => Boolean(user && roles.includes(user.role)),
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      cartCount,
      notificationCount,
      isAuthenticated: Boolean(user),
      isStaff: user?.role === 'staff' || user?.role === 'admin',
      isAdmin: user?.role === 'admin',
      hasRole,
      login,
      register,
      logout,
      refresh,
      setCartCount,
      setNotificationCount,
    }),
    [user, loading, cartCount, notificationCount, hasRole, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

/**
 * Client-side route guard.
 *
 * This is convenience, not security — the API enforces every permission. It
 * exists so a signed-out visitor is redirected instead of seeing an empty
 * shell, and so a customer never lands on an admin screen.
 */
export function useRequireAuth(options: { roles?: UserRole[]; redirectTo?: string } = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // `roles` is usually an inline array literal, so depend on its contents
  // rather than its identity — otherwise the effect would re-run every render.
  const rolesKey = options.roles?.join(',') ?? '';
  const redirectTo = options.redirectTo ?? '/admin';

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = typeof window !== 'undefined' ? window.location.pathname : '/';
      // The console has its own sign-in screen; everything else uses /login.
      const base = next.startsWith('/admin') ? '/admin/login' : '/login';
      router.replace(`${base}?next=${encodeURIComponent(next)}`);
      return;
    }
    const allowed = rolesKey ? (rolesKey.split(',') as UserRole[]) : null;
    if (allowed && !allowed.includes(user.role)) {
      router.replace(redirectTo);
    }
  }, [user, loading, router, rolesKey, redirectTo]);

  return { user, loading };
}
