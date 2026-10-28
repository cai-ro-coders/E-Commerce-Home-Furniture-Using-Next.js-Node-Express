import type { OrderStatus, PaymentStatus, ReviewStatus } from '@/types';

/* ------------------------------------------------------------------ money */

/** Format a decimal-string amount as currency. Values arrive as strings from MySQL. */
export function formatMoney(
  value: string | number | null | undefined,
  currency = 'PHP',
  options: { compact?: boolean; decimals?: number } = {}
): string {
  const amount = typeof value === 'string' ? Number(value) : (value ?? 0);
  if (!Number.isFinite(amount)) return '—';

  if (options.compact && Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: options.decimals ?? 2,
    maximumFractionDigits: options.decimals ?? 2,
  }).format(amount);
}

/** A bare number with thousands separators, for counts. */
export function formatNumber(value: string | number | null | undefined): string {
  const amount = typeof value === 'string' ? Number(value) : (value ?? 0);
  if (!Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-PH').format(amount);
}

/**
 * Coerce an aggregate to a real number.
 *
 * MySQL returns `SUM()`/`AVG()` as strings, so anything that feeds a chart or a
 * calculation has to be converted first. Unparseable values become `0` so a
 * missing metric renders as zero rather than `NaN`.
 */
export function num(value: string | number | null | undefined): number {
  const parsed = typeof value === 'string' ? Number(value) : (value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Add a list of `Numeric`s. */
export function sum(values: Array<string | number | null | undefined>): number {
  return values.reduce<number>((total, value) => total + num(value), 0);
}

export function formatPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '—';
  return `${value >= 0 ? '' : ''}${value.toFixed(decimals)}%`;
}

/* ------------------------------------------------------------------ dates */

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  // MySQL DATETIME strings are not ISO-8601; make them explicit local time so
  // Safari and Node agree on the result.
  const normalised =
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
      ? value.replace(' ', 'T')
      : value;
  const date = new Date(normalised);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return '—';
  return date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

/** "3 minutes ago" / "in 2 days". Falls back to an absolute date beyond a month. */
export function timeAgo(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return '—';

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const absolute = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (absolute < 60) return rtf.format(-seconds, 'second');
  if (absolute < 3600) return rtf.format(-Math.round(seconds / 60), 'minute');
  if (absolute < 86400) return rtf.format(-Math.round(seconds / 3600), 'hour');
  if (absolute < 2592000) return rtf.format(-Math.round(seconds / 86400), 'day');
  return formatDate(date);
}

/** `2026-09-29` for `<input type="date">` values and API filters. */
export function toDateInput(value: string | number | Date | null | undefined): string {
  const date = toDate(value);
  if (!date) return '';
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Inclusive ISO range for the `from`/`to` list filters. */
export function dateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: toDateInput(from), to: toDateInput(to) };
}

/* -------------------------------------------------------------- files/show */

export function formatBytes(bytes: number | null | undefined, decimals = 1): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(index === 0 ? 0 : decimals)} ${units[index]}`;
}

export function initials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function truncate(value: string | null | undefined, length = 60): string {
  if (!value) return '—';
  return value.length <= length ? value : `${value.slice(0, length - 1)}…`;
}

export function titleCase(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/* -------------------------------------------------------------- tag styles */

export interface TagStyle {
  label: string;
  className: string;
}

const NEUTRAL = 'bg-sand-100 text-sand-700 dark:bg-walnut-800 dark:text-sand-300';
const GREEN =
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300';
const AMBER = 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300';
const BLUE = 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300';
const VIOLET = 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300';
const ROSE = 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300';

export function orderStatusTag(status: OrderStatus | string): TagStyle {
  switch (status) {
    case 'Pending':
      return { label: 'Pending', className: AMBER };
    case 'Processing':
      return { label: 'Processing', className: BLUE };
    case 'Shipped':
      return { label: 'Shipped', className: VIOLET };
    case 'Delivered':
      return { label: 'Delivered', className: GREEN };
    case 'Cancelled':
      return { label: 'Cancelled', className: ROSE };
    case 'Returned':
      return { label: 'Returned', className: NEUTRAL };
    default:
      return { label: titleCase(String(status)), className: NEUTRAL };
  }
}

export function paymentStatusTag(status: PaymentStatus | string): TagStyle {
  switch (status) {
    case 'Paid':
      return { label: 'Paid', className: GREEN };
    case 'Pending':
      return { label: 'Pending', className: AMBER };
    case 'Failed':
      return { label: 'Failed', className: ROSE };
    case 'Refunded':
      return { label: 'Refunded', className: NEUTRAL };
    default:
      return { label: titleCase(String(status)), className: NEUTRAL };
  }
}

export function reviewStatusTag(status: ReviewStatus | string): TagStyle {
  switch (status) {
    case 'approved':
      return { label: 'Approved', className: GREEN };
    case 'pending':
      return { label: 'Pending', className: AMBER };
    case 'rejected':
      return { label: 'Rejected', className: ROSE };
    default:
      return { label: titleCase(String(status)), className: NEUTRAL };
  }
}

export function userStatusTag(status: string): TagStyle {
  switch (status) {
    case 'active':
      return { label: 'Active', className: GREEN };
    case 'inactive':
      return { label: 'Inactive', className: NEUTRAL };
    case 'blocked':
      return { label: 'Blocked', className: ROSE };
    default:
      return { label: titleCase(status), className: NEUTRAL };
  }
}

export function productStatusTag(status: string): TagStyle {
  switch (status) {
    case 'active':
      return { label: 'Active', className: GREEN };
    case 'draft':
      return { label: 'Draft', className: AMBER };
    case 'archived':
      return { label: 'Archived', className: NEUTRAL };
    default:
      return { label: titleCase(status), className: NEUTRAL };
  }
}

export function roleTag(role: string): TagStyle {
  switch (role) {
    case 'admin':
      return { label: 'Admin', className: VIOLET };
    case 'staff':
      return { label: 'Staff', className: BLUE };
    default:
      return { label: 'Customer', className: NEUTRAL };
  }
}

/** Last-4 masking for card-like identifiers in the UI. */
export function maskTail(value: string | null | undefined, keep = 4): string {
  if (!value) return '—';
  if (value.length <= keep) return value;
  return `${'•'.repeat(Math.min(value.length - keep, 12))}${value.slice(-keep)}`;
}

/** Discount badge text: "−10%" or "−₱500.00". */
export function discountLabel(
  price: string | number,
  salePrice: string | number | null | undefined,
  type: 'amount' | 'percent' = 'percent'
): string | null {
  const original = Number(price);
  const sale = Number(salePrice);
  if (!Number.isFinite(sale) || sale <= 0 || sale >= original) return null;
  if (type === 'percent') return `−${Math.round(((original - sale) / original) * 100)}%`;
  return `−${formatMoney(original - sale)}`;
}
