'use client';

/**
 * Reviews module.
 *
 * Moderation is the point of this screen, so every row carries its status as a
 * colour and the two decisions — approve and reject — sit right in the action
 * menu instead of behind a detail page. The rating breakdown comes from
 * `/reviews/stats`; the average is a MySQL AVG, so it comes back as a string.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StarOff } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { StatsStrip, type StatsStripItem } from '@/components/admin/StatsStrip';
import { ToolbarSelect } from '@/components/admin/ToolbarSelect';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import { formatDateTime, formatNumber, num } from '@/lib/format';
import { ACTIONS_COLUMN, attr, pill, productCell, text, type CellAction } from '@/lib/tableHtml';
import type { Review, ReviewStatus, ReviewStats } from '@/types';

const STATUS_TONES: Record<ReviewStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

const STATUS_LABELS: Record<ReviewStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

/** Five stars, filled up to `rating`. Rendered as text so it can be exported. */
function stars(rating: number): string {
  const full = Math.round(rating);
  return (
    '<span class="inline-flex items-center gap-0.5" title="' +
    attr(`${rating} out of 5`) +
    '">' +
    [1, 2, 3, 4, 5]
      .map(
        (step) =>
          `<span class="${
            step <= full ? 'text-amber-500' : 'text-sand-300 dark:text-walnut-700'
          }" aria-hidden>&#9733;</span>`
      )
      .join('') +
    '</span>'
  );
}

export default function ReviewsPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  /** Id of the row currently being moderated, so the grid can show progress. */
  const [busy, setBusy] = useState<number | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setStats(await api.get<ReviewStats>('/reviews/stats'));
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
    void loadStats();
  }, [loadStats]);

  const moderate = useCallback(
    async (row: Review, next: Extract<ReviewStatus, 'approved' | 'rejected'>) => {
      // One moderation at a time: a second click while a request is in flight
      // would queue a duplicate decision.
      if (busy !== null) return;
      const confirmed = await confirmAction({
        title: `${next === 'approved' ? 'Approve' : 'Reject'} this review?`,
        text:
          next === 'approved'
            ? 'It becomes visible on the product page straight away.'
            : 'It is hidden from the product page. The customer can still be asked to revise it.',
        confirmText: next === 'approved' ? 'Approve' : 'Reject',
      });
      if (!confirmed) return;
      setBusy(row.id);
      try {
        await api.patch(`/reviews/${row.id}/status`, { status: next });
        toastSuccess(`Review ${next}`);
        refresh();
      } catch (error) {
        alertError('Could not moderate the review', describe(error));
      } finally {
        setBusy(null);
      }
    },
    [busy, refresh]
  );

  const remove = useCallback(
    async (row: Review) => {
      if (busy !== null) return;
      const confirmed = await confirmAction({
        title: 'Delete this review?',
        text: 'The review and its rating are removed from the product page for good.',
        confirmText: 'Delete review',
        danger: true,
      });
      if (!confirmed) return;
      setBusy(row.id);
      try {
        await api.delete(`/reviews/${row.id}`);
        toastSuccess('Review deleted');
        refresh();
      } catch (error) {
        alertError('Could not delete the review', describe(error));
      } finally {
        setBusy(null);
      }
    },
    [busy, refresh]
  );

  const columns: DataTableColumn<Review>[] = useMemo(
    () => [
      {
        data: 'product_name',
        title: 'Product',
        sortable: true,
        render: (row) =>
          productCell({
            image: row.product_image ?? null,
            name: row.product_name ?? 'Unknown product',
            meta: row.product_slug ? `/${row.product_slug}` : undefined,
            href: row.product_id ? `/admin/products/${row.product_id}` : undefined,
          }),
        exportValue: (row) => row.product_name ?? '',
      },
      {
        data: 'user_name',
        title: 'Customer',
        sortable: true,
        render: (row) =>
          row.user_id
            ? `<a href="/admin/customers/${row.user_id}" class="text-xs font-medium text-sand-800 hover:text-clay-700 dark:text-sand-100 dark:hover:text-clay-400">${text(row.user_name ?? 'Unknown')}</a>` +
              `<br /><span class="text-[0.7rem] text-muted">${text(row.user_email ?? '')}</span>`
            : `<span class="text-xs text-muted">${text(row.user_name ?? 'Deleted account')}</span>`,
        exportValue: (row) => row.user_name ?? '',
      },
      {
        data: 'rating',
        title: 'Rating',
        sortable: true,
        render: (row) => stars(row.rating) + `<span class="ml-1.5 text-xs tabular-nums text-muted">${row.rating}</span>`,
        exportValue: (row) => row.rating,
      },
      {
        data: 'title',
        title: 'Review',
        sortable: false,
        render: (row) =>
          '<div class="max-w-md">' +
          (row.title
            ? `<p class="truncate text-sm font-medium text-sand-900 dark:text-sand-100">${text(row.title)}</p>`
            : '') +
          (row.comment
            ? `<p class="line-clamp-2 text-xs text-muted">${text(row.comment)}</p>`
            : '<p class="text-xs text-muted">No written comment</p>') +
          '</div>',
        exportValue: (row) => [row.title, row.comment].filter(Boolean).join(' — '),
      },
      {
        data: 'status',
        title: 'Status',
        sortable: true,
        render: (row) => pill(STATUS_LABELS[row.status], STATUS_TONES[row.status]),
        exportValue: (row) => row.status,
      },
      {
        data: 'created_at',
        title: 'Posted',
        sortable: true,
        render: (row) => `<span class="text-xs text-muted">${text(formatDateTime(row.created_at))}</span>`,
        exportValue: (row) => row.created_at,
      },
      {
        data: ACTIONS_COLUMN,
        title: '',
        skipExport: true,
        className: 'text-right',
      },
    ],
    []
  );

  const strip: StatsStripItem[] = stats
    ? [
        { label: 'Reviews', value: formatNumber(stats.total) },
        { label: 'Average rating', value: `${num(stats.average_rating).toFixed(1)} / 5`, tone: 'brand' },
        {
          label: 'Awaiting moderation',
          value: formatNumber(stats.pending),
          tone: num(stats.pending) > 0 ? 'warning' : 'default',
          hint: num(stats.pending) > 0 ? 'needs a decision' : 'nothing waiting',
        },
        { label: 'Approved', value: formatNumber(stats.approved), tone: 'success' },
        { label: 'Rejected', value: formatNumber(stats.rejected), tone: 'danger' },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reviews"
        description="What customers said about the catalogue. Approving a review publishes it on the product page."
        actions={
          <Button
            variant="outline"
            leftIcon={<StarOff className="size-4" />}
            onClick={() => setStatus('pending')}
          >
            Needs a decision
          </Button>
        }
      />

      <StatsStrip
        items={strip.length ? strip : Array.from({ length: 5 }, () => ({ label: '—', value: '' }))}
        loading={!stats}
      />

      <DataTable<Review>
        id="reviews"
        endpoint="/reviews"
        columns={columns}
        filters={{ status: status || undefined, rating: rating || undefined }}
        reloadToken={reloadToken}
        exportName="reviews"
        exportTitle="Review moderation"
        searchPlaceholder="Search product, customer or text…"
        emptyMessage="No reviews match these filters."
        actions={(row): CellAction[] => [
          ...(row.status === 'approved'
            ? [{ key: 'reject', label: 'Reject review', tone: 'warning' as const }]
            : [{ key: 'approve', label: 'Approve review', tone: 'success' as const }]),
          { key: 'product', label: 'Open product', tone: 'neutral' as const },
          { key: 'delete', label: 'Delete review', tone: 'danger' as const },
        ]}
        onAction={(key, row) => {
          if (key === 'approve') void moderate(row, 'approved');
          else if (key === 'reject') void moderate(row, 'rejected');
          else if (key === 'delete') void remove(row);
          else if (key === 'product' && row.product_id) {
            router.push(`/admin/products/${row.product_id}`);
          }
        }}
        toolbar={
          <>
            <ToolbarSelect
              id="filter-review-status"
              label="Any status"
              value={status}
              onChange={setStatus}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
            <ToolbarSelect
              id="filter-review-rating"
              label="Any rating"
              value={rating}
              onChange={setRating}
              options={[1, 2, 3, 4, 5].map((value) => ({
                value: String(value),
                label: `${value} star${value === 1 ? '' : 's'}`,
              }))}
            />
          </>
        }
      />

    </div>
  );
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
