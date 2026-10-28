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
export type FileCategory = 'image' | 'document' | 'contract' | 'invoice' | 'customer' | 'other';

export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
}

export interface JwtAccessPayload {
  sub: number;
  email: string;
  role: UserRole;
  full_name: string;
  type: 'access';
}

export interface JwtRefreshPayload {
  sub: number;
  sid: number;
  type: 'refresh';
}

/** Shape returned by every list endpoint (DataTables server-side compatible). */
export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    from: number;
    to: number;
  };
}

export interface ListQuery {
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  filters: Record<string, string | undefined>;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
  full_name: string;
  type: string;
  iat?: number;
  exp?: number;
}
