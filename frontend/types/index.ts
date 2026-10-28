/**
 * Shared API types.
 *
 * These mirror `backend/src/types/index.ts` plus the row shapes the REST API
 * returns. Keep the two in step: the backend is the source of truth, and a
 * mismatch here surfaces as a compile error at the call site rather than a
 * runtime `undefined`.
 */

export type UserRole = 'admin' | 'customer' | 'staff';
export type UserStatus = 'active' | 'inactive' | 'blocked';
export type ProductStatus = 'active' | 'draft' | 'archived';
export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'stripe' | 'paypal';
export type CouponType = 'percentage' | 'fixed';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type InventoryType = 'stock_in' | 'stock_out' | 'adjustment' | 'return';
export type FileCategory =
  | 'image'
  | 'document'
  | 'contract'
  | 'invoice'
  | 'customer'
  | 'other';

export const ORDER_STATUSES: OrderStatus[] = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Returned',
];

export const PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Paid', 'Failed', 'Refunded'];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: 'Cash on delivery',
  bank_transfer: 'Bank transfer',
  stripe: 'Stripe',
  paypal: 'PayPal',
};

/**
 * MySQL returns `SUM()`/`AVG()` results as strings, while `COUNT()` arrives as a
 * number. Anything aggregated server-side is therefore typed loosely; render it
 * through `num()` in `lib/format.ts` rather than trusting the JSON type.
 */
export type Numeric = string | number;

/** The envelope every endpoint returns. */
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  /**
   * Either field-level validation messages, or a handler's own payload such as
   * the brand-delete 400's `{ product_count, allow_force }`.
   */
  error?: {
    code: string;
    details?: Array<{ field: string; message: string }> | Record<string, unknown>;
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

/* ------------------------------------------------------------------ auth */

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone: string | null;
  avatar: string | null;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** `GET /api/auth/account` — the profile, address book and recent sign-ins. */
export interface AccountPayload {
  user: AuthUser;
  addresses: Address[];
  login_history: LoginHistoryEntry[];
  wishlist_count: number;
}

export interface LoginHistoryEntry {
  id: number;
  /** 1 when the attempt succeeded, 0 when it failed. */
  success: number;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface SessionRecord {
  id: number;
  user_id: number;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  revoked_at: string | null;
  user_name?: string;
  user_email?: string;
  is_current?: number;
}

/* ------------------------------------------------------------- catalogue */

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  status: 'active' | 'inactive';
  product_count?: number;
  parent_name?: string | null;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  status: 'active' | 'inactive';
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image: string;
  is_primary: number | boolean;
  sort_order: number;
}

export interface ProductSpecification {
  id: number;
  product_id: number;
  attribute_name: string;
  attribute_value: string;
}

export interface Product {
  id: number;
  category_id: number;
  brand_id: number | null;
  sku: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: string;
  sale_price: string | null;
  cost_price: string | null;
  weight: string | null;
  dimensions: string | null;
  stock_quantity: number;
  minimum_stock: number;
  featured: number | boolean;
  status: ProductStatus;
  /** Joined at read time. */
  category_name?: string;
  brand_name?: string | null;
  primary_image?: string | null;
  image_count?: number;
  review_count?: number;
  /** MySQL `AVG()` — arrives as a string, e.g. `"4.20"`. */
  avg_rating?: Numeric | null;
  in_wishlist?: boolean | number;
  on_sale?: boolean;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  inventory?: InventoryLog[];
  /** Only present on the storefront detail endpoint. */
  reviews?: Array<{
    id: number;
    rating: number;
    title: string | null;
    comment: string | null;
    created_at: string;
    user_name: string | null;
    user_avatar: string | null;
  }>;
  review_meta?: PaginationMeta;
  related?: Product[];
  created_at: string;
  updated_at: string;
}

export interface ProductStats {
  total_products: number;
  active_listings: Numeric;
  draft_products: Numeric;
  archived_products: Numeric;
  out_of_stock: Numeric;
  low_stock: Numeric;
  inventory_units: Numeric;
  inventory_value: Numeric;
  featured_products: Numeric;
}

/** `GET /api/products/form-options` — the pickers on the product form. */
export interface ProductFormOptions {
  categories: Array<{
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    status: string;
    product_count: number;
  }>;
  brands: Array<{
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    status: string;
  }>;
}

export interface InventoryLog {
  id: number;
  product_id: number;
  type: InventoryType;
  /** Signed: positive for stock in, negative for stock out. */
  quantity: number;
  reference: string | null;
  remarks: string | null;
  created_by: number | null;
  created_at: string;
  product_name?: string;
  sku?: string;
  user_name?: string;
}

/* ----------------------------------------------------------------- orders */

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_image: string | null;
  sku: string;
  quantity: number;
  price: string;
  total: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: number;
  user_id: number | null;
  order_number: string;
  subtotal: string;
  discount: string;
  shipping_fee: string;
  tax: string;
  grand_total: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  shipping_address_id: number | null;
  notes: string | null;
  /** Joined at read time. */
  customer_name?: string;
  customer_email?: string;
  customer_avatar?: string | null;
  city?: string | null;
  province?: string | null;
  item_count?: Numeric;
  product_thumb?: string | null;
  items?: OrderItem[];
  history?: OrderStatusHistoryEntry[];
  payment?: Payment | null;
  shipping_address?: Address | null;
  /** Present on a checkout response when the customer must be sent to Stripe. */
  stripe?: StripeCheckout | null;
  /** Present on a checkout response when the customer must approve with PayPal. */
  paypal?: PayPalCheckout | null;
  currency?: string;
  created_at: string;
  updated_at: string;
}

/** Redirect payload returned by `/orders/checkout` for card payments. */
export interface StripeCheckout {
  session_id: string;
  checkout_url: string | null;
}

/** Redirect payload returned by `/orders/checkout` for PayPal payments. */
export interface PayPalCheckout {
  paypal_order_id: string;
  approval_url: string;
}

export interface Payment {
  id: number;
  order_id: number;
  transaction_id: string | null;
  payment_gateway: string | null;
  amount: string;
  currency: string;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistoryEntry {
  id: number;
  order_id: number;
  status: OrderStatus;
  note: string | null;
  created_by: number | null;
  created_by_name?: string | null;
  created_at: string;
}

export interface OrderStats {
  total_orders: number;
  open_orders: Numeric;
  paid_orders: Numeric;
  total_revenue: Numeric;
  average_order_value: Numeric;
  pending_payment: Numeric;
  cancelled_orders: Numeric;
  net_revenue: Numeric;
}

/* -------------------------------------------------------------- addresses */

export interface Address {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  province: string | null;
  postal_code: string | null;
  country: string;
  is_default: number | boolean;
  created_at: string;
  updated_at: string;
}

/* ----------------------------------------------------- cart and wishlist */

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price: string;
  product_name: string;
  slug: string;
  sku: string;
  stock_quantity: number;
  product_status: ProductStatus;
  product_image: string | null;
  line_total: string;
}

/** The always-present part of a cart read (`GET /api/cart`). */
export interface CartSummary {
  item_count: number;
  subtotal: string;
  total: string;
}

export interface CartTotals {
  subtotal: string;
  discount: string;
  shipping_fee: string;
  tax: string;
  total: string;
  free_shipping: boolean;
  free_shipping_threshold: string;
  currency: string;
}

export interface CartCoupon {
  valid: boolean;
  reason?: string;
  discount: number;
  type: CouponType;
  value: number;
  description: string;
}

/**
 * A cart as returned by `GET /api/cart`.
 *
 * `totals` is only populated by `GET /api/cart/summary`, which is the endpoint
 * that knows the tax rate, shipping fee and any applied coupon.
 */
export interface Cart {
  items: CartItem[];
  summary: CartSummary;
  coupon?: CartCoupon | null;
  totals?: CartTotals;
}

export interface WishlistItem extends Product {
  /** The wishlist row's own id (the product id lives on `id`). */
  wishlist_id: number;
  primary_image: string | null;
  avg_rating: Numeric | null;
  review_count: number;
}

export interface Wishlist {
  items: WishlistItem[];
  currency: string;
  removed?: boolean;
}

/* ----------------------------------------------------------------- users */

export interface User extends AuthUser {
  email_verified: number | boolean;
  order_count?: number;
  total_spent?: Numeric;
  address_count?: number;
  review_count?: number;
}

export interface UserStats {
  total: number;
  admins: number;
  staff: number;
  customers: number;
  active: number;
  inactive: number;
  blocked: number;
  new_this_month: number;
}

/** A recent order in an account's order summary. */
export interface CustomerOrderSummary {
  id: number;
  order_number: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  grand_total: string;
  created_at: string;
  item_count: Numeric;
}

/**
 * `GET /api/users/:id` and `GET /api/customers/:id`.
 *
 * The record is spread into the response, so the user fields sit alongside
 * these collections.
 */
export interface UserDetail extends User {
  addresses?: Address[];
  orders?: CustomerOrderSummary[];
  login_history?: LoginHistoryEntry[];
  /** `GET /api/users/:id` only — the customer route omits it. */
  activities?: Array<{
    action: string;
    entity: string | null;
    description: string | null;
    ip_address: string | null;
    created_at: string;
  }>;
}

/** `GET /api/customers/stats`. */
export interface CustomerStats {
  total: number;
  active: number;
  blocked: number;
  new_this_month: number;
  lifetime_value: Numeric;
}

/** The customer roll-up embedded in the dashboard payload. */
export interface DashboardCustomerStats {
  total_customers: number;
  active_customers: number;
  new_this_month: number;
  repeat_rate: Numeric;
}

export interface ActivityEntry {
  id: number;
  user_id: number;
  action: string;
  entity: string | null;
  entity_id: number | null;
  description: string | null;
  ip_address: string | null;
  created_at: string;
  full_name?: string | null;
  email?: string | null;
  avatar?: string | null;
}

/* --------------------------------------------------------------- coupons */

export interface Coupon {
  id: number;
  code: string;
  type: CouponType;
  value: Numeric;
  minimum_order: Numeric;
  maximum_discount: string | null;
  usage_limit: number | null;
  used_count: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at: string;
  /** Derived by the list endpoint: `used_count / usage_limit`, as a percentage. */
  usage_percent?: Numeric;
  /** Derived by the list endpoint: currently inside the date window and active. */
  is_valid?: number | boolean;
}

export interface CouponUsage {
  id: number;
  coupon_id: number;
  user_id: number | null;
  order_id: number | null;
  discount_amount: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  order_number: string | null;
}

/* --------------------------------------------------------------- reviews */

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  status: ReviewStatus;
  product_name?: string;
  product_slug?: string;
  product_image?: string | null;
  user_name?: string;
  user_email?: string;
  user_avatar?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewStats {
  total: number;
  pending: Numeric;
  approved: Numeric;
  rejected: Numeric;
  average_rating: Numeric;
}

/* -------------------------------------------------------------- settings */

export interface Setting {
  id: number;
  key: string;
  group: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

/** `GET /api/settings/grouped` — the settings screen's shape. */
export interface GroupedSettings {
  grouped: Record<string, Setting[]>;
  groups: Array<{ group: string; total: number }>;
}

/** `GET /api/settings/public` — the storefront's narrow slice. */
export interface PublicSettings {
  site_name: string;
  site_logo: string;
  support_email: string;
  support_phone: string;
  currency: string;
  tax_rate: string;
  shipping_fee: string;
  address: string;
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
}

/* ----------------------------------------------------------------- files */

export interface StoredFile {
  id: number;
  name: string;
  original_name: string;
  /** Server path, e.g. `/uploads/files/warranty.pdf`. */
  path: string;
  mime_type: string;
  size: number;
  category: FileCategory;
  uploaded_by: number | null;
  created_at: string;
  updated_at: string;
  uploader_name?: string | null;
}

/** `GET /api/files/backups` — a SQL dump written by `POST /files/backups`. */
export interface BackupFile {
  filename: string;
  /** Bytes. */
  size: number;
  size_human: string;
  created_at: string;
}

export interface FileStats {
  total_files: number;
  /** Bytes. */
  total_size: Numeric;
  images: Numeric;
  documents: Numeric;
  contracts: Numeric;
  invoices: Numeric;
  customer_files: Numeric;
}

/* --------------------------------------------------------- notifications */

export interface Notification {
  id: number;
  /** `null` when addressed to the whole staff group. */
  user_id: number | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link: string | null;
  read_at: string | null;
  created_at: string;
  /** Only present on the staff inbox. */
  recipient?: string | null;
}

/** `GET /api/notifications` — the bell menu's shape. */
export interface NotificationFeed {
  items: Notification[];
  unread_count: number;
}

/* -------------------------------------------------------------- dashboard */

export interface DashboardStats {
  total_revenue: Numeric;
  net_earning: Numeric;
  today_orders: number;
  yesterday_orders: number;
  total_orders: number;
  active_products: number;
  total_customers: number;
  new_customers_today: number;
  pending_orders: number;
  low_stock_count: number;
  out_of_stock_count: number;
  average_order_value: Numeric;
  /** Revenue this calendar month vs. last, as a percentage. */
  revenue_change_percent: number;
  orders_change_percent: number;
}

/** One point on a sales line/bar chart. */
export interface SalesPoint {
  label: string;
  revenue: Numeric;
  orders: number;
}

export interface OrderStatusBreakdown {
  status: OrderStatus | string;
  total: number;
}

export interface CategorySales {
  name: string;
  revenue: Numeric;
  units: Numeric;
}

export interface BestSeller {
  id: number;
  name: string;
  sku: string;
  image: string | null;
  units_sold: Numeric;
  revenue: Numeric;
}

export interface RecentOrder {
  id: number;
  order_number: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  grand_total: string;
  created_at: string;
  customer_name: string;
  customer_avatar: string | null;
  item_count: Numeric;
  product_thumb: string | null;
}

export interface TopCustomer {
  id: number;
  full_name: string;
  email: string;
  avatar: string | null;
  total_spent: Numeric;
  order_count: number;
}

export interface LowStockProduct {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  minimum_stock: number;
  image: string | null;
}

/** `GET /api/dashboard` — one payload powers the whole dashboard. */
export interface DashboardPayload {
  stats: DashboardStats;
  product_stats: ProductStats;
  order_stats: OrderStats;
  customer_stats: DashboardCustomerStats;
  review_stats: ReviewStats;
  file_stats: FileStats;
  sales_series: SalesPoint[];
  orders_by_status: OrderStatusBreakdown[];
  sales_by_category: CategorySales[];
  best_sellers: BestSeller[];
  recent_orders: RecentOrder[];
  top_customers: TopCustomer[];
  low_stock: LowStockProduct[];
  currency: string;
  site_name: string;
}

/** `GET /api/dashboard/sales-analytics` — the analytics screen's payload. */
export interface SalesAnalytics {
  group_by: 'day' | 'month';
  days: number;
  currency: string;
  series: Array<SalesPoint & { cumulative_revenue: Numeric }>;
  summary: {
    total_revenue: Numeric;
    total_orders: number;
    average_order_value: Numeric;
    best_day: SalesPoint | null;
  };
  orders_by_status: OrderStatusBreakdown[];
  sales_by_category: CategorySales[];
  best_sellers: BestSeller[];
  top_customers: TopCustomer[];
}

export interface CalendarEvent {
  date: string;
  orders: number;
  revenue: Numeric;
  new_users: number;
  title: string;
}

/** `GET /api/coupons/:id/usages`. */
export interface CouponUsagePage {
  data: CouponUsage[];
  meta: PaginationMeta;
}

/* --------------------------------------------------------------- helpers */

/** Every list endpoint accepts the same query knobs. */
export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  [filter: string]: string | number | boolean | undefined;
}
