/**
 * HTML cell builders for DataTables.
 *
 * DataTables' server-side mode renders each row itself, so a cell renderer
 * returns a **string of HTML** rather than React elements. That makes escaping
 * a security boundary rather than a nicety: everything from the database must
 * go through `esc()` before it is interpolated.
 *
 * These helpers exist so no call site has to remember that, and so cells keep a
 * consistent look with the React components in `components/ui`.
 */
import { formatBytes, formatDate, formatDateTime, formatMoney, formatNumber, titleCase } from './format';
import { imageUrl } from './api';

/* --------------------------------------------------------------- escaping */

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escape text for an HTML **text** position. */
export function esc(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

/** Escape text for an HTML **attribute** position. */
export function attr(value: unknown): string {
  return esc(value);
}

/** Only allow URLs we generate ourselves, or absolute http(s). */
function safeUrl(url: string): string {
  const value = String(url ?? '');
  if (/^(https?:)?\/\//i.test(value)) return value;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  return '#';
}

/* ------------------------------------------------------------------ cells */

export function money(value: unknown, currency = 'PHP'): string {
  return esc(formatMoney(value as string | number | null, currency));
}

export function number(value: unknown): string {
  return esc(formatNumber(value as string | number | null));
}

export function date(value: unknown): string {
  return esc(formatDate(value as string | null));
}

export function dateTime(value: unknown): string {
  return esc(formatDateTime(value as string | null));
}

export function bytes(value: unknown): string {
  return esc(formatBytes(Number(value ?? 0)));
}

export function text(value: unknown): string {
  return esc(value);
}

/** `null` shows as an em dash rather than a blank cell. */
export function orDash(value: unknown): string {
  if (value === null || value === undefined || value === '') return '<span class="text-muted">—</span>';
  return esc(value);
}

export function truncate(value: unknown, length = 60, title?: string): string {
  const raw = value === null || value === undefined ? '' : String(value);
  if (!raw) return '<span class="text-muted">—</span>';
  const shown = raw.length <= length ? raw : `${raw.slice(0, length - 1)}…`;
  return `<span title="${attr(title ?? raw)}">${esc(shown)}</span>`;
}

/** Title-cased enum with underscores turned into spaces. */
export function enumLabel(value: unknown): string {
  if (value === null || value === undefined || value === '') return '<span class="text-muted">—</span>';
  return esc(titleCase(String(value)));
}

export function yesNo(value: unknown): string {
  const truthy = value === true || value === 1 || value === '1';
  return truthy
    ? '<span class="text-emerald-600 dark:text-emerald-400">Yes</span>'
    : '<span class="text-muted">No</span>';
}

/** A coloured pill; `className` comes from the tag helpers in `lib/format`. */
export function pill(label: string, className: string): string {
  return (
    `<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}">` +
    `<span class="size-1.5 rounded-full bg-current opacity-70"></span>${esc(label)}</span>`
  );
}

/** Product thumbnail + name + optional secondary line. */
export function productCell(options: {
  image?: string | null;
  name: unknown;
  meta?: unknown;
  href?: string;
  size?: 'sm' | 'md';
}): string {
  const size = options.size === 'sm' ? 'size-9' : 'size-11';
  const name = esc(options.name ?? '—');
  const label = options.href
    ? `<a href="${attr(safeUrl(options.href))}" class="font-medium text-sand-900 hover:text-clay-700 dark:text-sand-100 dark:hover:text-clay-400">${name}</a>`
    : `<span class="font-medium text-sand-900 dark:text-sand-100">${name}</span>`;
  return (
    '<div class="flex items-center gap-3">' +
    `<img src="${attr(imageUrl(options.image))}" alt="" loading="lazy" class="${size} shrink-0 rounded-lg border border-[var(--border-subtle)] object-cover" />` +
    '<div class="flex min-w-0 flex-col">' +
    label +
    (options.meta ? `<span class="text-xs text-muted">${esc(options.meta)}</span>` : '') +
    '</div></div>'
  );
}

export function avatarCell(options: {
  avatar?: string | null;
  name: unknown;
  email?: unknown;
  href?: string;
  initials?: string;
}): string {
  const fallback = options.initials ?? '';
  const image = options.avatar
    ? `<img src="${attr(imageUrl(options.avatar))}" alt="" loading="lazy" class="size-9 shrink-0 rounded-full object-cover" />`
    : `<span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-clay-100 text-xs font-semibold uppercase text-clay-700 dark:bg-clay-500/20 dark:text-clay-300">${esc(fallback)}</span>`;
  const name = esc(options.name ?? '—');
  const label = options.href
    ? `<a href="${attr(safeUrl(options.href))}" class="font-medium text-sand-900 hover:text-clay-700 dark:text-sand-100 dark:hover:text-clay-400">${name}</a>`
    : `<span class="font-medium text-sand-900 dark:text-sand-100">${name}</span>`;
  return (
    '<div class="flex items-center gap-3">' +
    image +
    '<div class="flex min-w-0 flex-col">' +
    label +
    (options.email ? `<span class="truncate text-xs text-muted">${esc(options.email)}</span>` : '') +
    '</div></div>'
  );
}

/** Star row. `rating` may be fractional. */
export function stars(rating: unknown, count?: number): string {
  const value = Number(rating ?? 0);
  const full = Math.round(value);
  const star = (filled: boolean) =>
    `<span class="${filled ? 'text-amber-400' : 'text-sand-300 dark:text-walnut-800'}">★</span>`;
  const row = Array.from({ length: 5 }, (_, index) => star(index < full)).join('');
  return (
    `<span class="inline-flex items-center gap-1 whitespace-nowrap">` +
    `<span class="text-sm leading-none tracking-tight">${row}</span>` +
    `<span class="text-xs font-medium text-sand-700 dark:text-sand-300">${value > 0 ? esc(value.toFixed(1)) : '—'}</span>` +
    (typeof count === 'number' ? `<span class="text-xs text-muted">(${esc(count)})</span>` : '') +
    '</span>'
  );
}

export function linkCell(label: unknown, href: string): string {
  return `<a href="${attr(safeUrl(href))}" class="font-medium text-clay-700 hover:underline dark:text-clay-400">${esc(label ?? '—')}</a>`;
}

export function badgeCell(label: unknown, className = 'bg-sand-100 text-sand-700 dark:bg-walnut-800 dark:text-sand-300'): string {
  return `<span class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${className}">${esc(label ?? '—')}</span>`;
}

/** A thin stock bar, used by the products and inventory tables. */
export function stockCell(quantity: unknown, minimum: unknown): string {
  const current = Number(quantity ?? 0);
  const floor = Number(minimum ?? 0);
  const tone =
    current <= 0
      ? 'bg-rose-500'
      : current <= floor
        ? 'bg-amber-500'
        : 'bg-emerald-500';
  const ceiling = Math.max(floor * 3, current, 1);
  const width = Math.min(100, Math.round((current / ceiling) * 100));
  return (
    '<div class="flex flex-col gap-1 min-w-24">' +
    `<div class="flex items-center justify-between gap-2 text-xs"><span class="font-semibold text-sand-800 dark:text-sand-200">${esc(current)}</span><span class="text-muted">min ${esc(floor)}</span></div>` +
    `<div class="h-1.5 w-full overflow-hidden rounded-full bg-[var(--surface-sunken)]"><div class="h-full rounded-full ${tone}" style="width:${width}%"></div></div>` +
    '</div>'
  );
}

/* --------------------------------------------------------------- actions */

export interface CellAction {
  /** Identifies the action in `onAction`; also used for the built-in ones. */
  key: string;
  label: string;
  tone?: ActionTone;
  /** Render as a link to this href instead of a button. */
  href?: string;
  disabled?: boolean;
}

export type ActionTone = 'neutral' | 'brand' | 'success' | 'info' | 'warning' | 'danger';

/** Path data for the row-action icons, keyed by the action name. */
const ACTION_ICONS: Record<string, string> = {
  view: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  delete: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>',
  print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
  duplicate: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  // Order lifecycle: a clipboard, a box on a van, a hand-off, and a refund.
  process: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9z"/><path d="M9 12h6M9 16h4"/>',
  ship: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
  deliver: '<path d="m3 8 9 5 9-5"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  cancel: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  refund: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
  restore: '<path d="M3 12a9 9 0 1 1 3 6.7"/><path d="M3 20v-5h5"/>',
  // Moderation and directory actions.
  approve: '<path d="M20 6 9 17l-5-5"/>',
  reject: '<path d="M18 6 6 18M6 6l12 12"/>',
  block: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6 18.4 18.4"/>',
  verify: '<path d="M12 3 4 6v6c0 4.4 3.4 8.4 8 9 4.6-.6 8-4.6 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  backup: '<path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  download: '<path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M4 19h16"/>',
  upload: '<path d="M12 15V3"/><path d="m8 7 4-4 4 4"/><path d="M4 21h16"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.2-5.4-2.9-5.4 2.9 1-6.2L3.2 9.5l6.1-.9z"/>',
};

/**
 * Row action buttons.
 *
 * Custom actions carry `data-row-action` + `data-row-id` so a single delegated
 * listener on the table can dispatch them; `href` actions are plain anchors and
 * need no JavaScript. Icons come from one lookup keyed by the action name, so
 * there is a single icon set for the whole app and no inline SVG at the call sites.
 */
export function actionButtons(actions: CellAction[], rowId: number | string): string {
  const tones: Record<ActionTone, string> = {
    neutral:
      'text-sand-500 hover:bg-sand-100 hover:text-sand-800 dark:hover:bg-walnut-800 dark:hover:text-sand-200',
    brand: 'text-clay-600 hover:bg-clay-50 dark:hover:bg-clay-500/10',
    success: 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
    info: 'text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-500/10',
    warning: 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10',
    danger:
      'text-sand-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400',
  };

  const button = (action: CellAction): string => {
    const tone = tones[action.tone ?? 'neutral'];
    const glyph = (() => {
      const paths = ACTION_ICONS[action.key];
      if (!paths) return '';
      return (
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        `stroke-linecap="round" stroke-linejoin="round" class="size-4">${paths}</svg>`
      );
    })();
    const className =
      `inline-flex size-8 items-center justify-center rounded-lg transition-colors ${tone}` +
      (action.disabled ? ' pointer-events-none opacity-40' : '');

    if (action.href) {
      return `<a href="${attr(safeUrl(action.href))}" title="${attr(action.label)}" aria-label="${attr(action.label)}" class="${className}">${glyph}</a>`;
    }

    return (
      `<button type="button" title="${attr(action.label)}" aria-label="${attr(action.label)}" ` +
      `data-row-action="${attr(action.key)}" data-row-id="${attr(rowId)}" class="${className}">${glyph}</button>`
    );
  };

  return `<div class="flex items-center justify-end gap-0.5">${actions.map(button).join('')}</div>`;
}

/** Placeholder used as the `data` key for action columns. */
export const ACTIONS_COLUMN = '__actions';

/** Shared "empty" cell markup so rendering a missing value is consistent. */
export function emptyCell(): string {
  return '<span class="text-muted">—</span>';
}
