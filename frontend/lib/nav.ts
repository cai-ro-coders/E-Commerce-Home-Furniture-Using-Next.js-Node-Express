import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  FolderOpen,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Star,
  Store,
  Tags,
  TicketPercent,
  TreePine,
  UserCheck,
  Users,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Show a live count badge (populated by the shell). */
  badge?: 'orders_pending' | 'reviews_pending' | 'notifications_unread';
  /** Only render for these roles; omitted means everyone with admin access. */
  roles?: Array<'admin' | 'staff'>;
  /** Exact match only, for the dashboard index route. */
  exact?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** The 12 admin modules, grouped for the sidebar. */
export const ADMIN_NAV: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
      {
        label: 'Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
        badge: 'orders_pending',
      },
      { label: 'Reviews', href: '/admin/reviews', icon: Star, badge: 'reviews_pending' },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: TreePine },
      { label: 'Brands', href: '/admin/brands', icon: Tags },
      { label: 'Coupons', href: '/admin/coupons', icon: TicketPercent },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Customers', href: '/admin/customers', icon: UserCheck },
      { label: 'Users', href: '/admin/users', icon: Users, roles: ['admin'] },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Notifications', href: '/admin/notifications', icon: Bell, badge: 'notifications_unread' },
      { label: 'File Manager', href: '/admin/files', icon: FolderOpen },
    ],
  },
  {
    title: 'System',
    items: [{ label: 'Settings', href: '/admin/settings', icon: Settings, roles: ['admin'] }],
  },
];

export interface StoreLink {
  label: string;
  href: string;
}

export const STOREFRONT_NAV: StoreLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/products' },
  { label: 'Categories', href: '/categories' },
];

/** Brand mark used in the sidebar and the storefront header. */
export const BRAND = {
  name: 'Lumera Home',
  tagline: 'Considered furniture, built to last',
  short: 'Lumera',
  icon: Store,
};

/** Map a route path to a human title, for the topbar breadcrumb. */
export const ROUTE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/reviews': 'Reviews',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/brands': 'Brands',
  '/admin/coupons': 'Coupons',
  '/admin/customers': 'Customers',
  '/admin/users': 'Users',
  '/admin/notifications': 'Notifications',
  '/admin/files': 'File Manager',
  '/admin/settings': 'Settings',
};
