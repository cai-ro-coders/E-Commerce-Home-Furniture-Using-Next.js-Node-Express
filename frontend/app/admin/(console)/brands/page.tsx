'use client';

/**
 * Brands module.
 *
 * Brands are a flat list with no hierarchy, so the whole module is one grid plus
 * a create/edit modal. The one non-obvious behaviour is deletion: the API
 * refuses to remove a brand that still has products and hands back
 * `{ product_count, allow_force }`, which is turned into an explicit
 * force-delete confirmation rather than a bare error.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FolderPlus } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { BrandFormModal } from '@/components/admin/brands/BrandFormModal';
import { StatsStrip, type StatsStripItem } from '@/components/admin/StatsStrip';
import { ToolbarSelect } from '@/components/admin/ToolbarSelect';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Card';
import { ApiError, api, imageUrl } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import { formatNumber, num, timeAgo, titleCase } from '@/lib/format';
import { ACTIONS_COLUMN, attr, pill, text, type CellAction } from '@/lib/tableHtml';
import type { Brand } from '@/types';

const STATUS_TONES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  inactive: 'bg-sand-100 text-sand-600 dark:bg-walnut-800 dark:text-sand-400',
};

export default function BrandsPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  /** `undefined` = closed, `null` = creating, a record = editing. */
  const [editing, setEditing] = useState<Brand | null | undefined>(undefined);
  const [counts, setCounts] = useState<{
    total: number;
    active: number;
    products: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.list<Brand>('/brands', { pageSize: 200, sortBy: 'name', sortDir: 'asc' });
        if (cancelled) return;
        setCounts({
          total: list.meta.total,
          active: list.data.filter((row) => row.status === 'active').length,
          products: list.data.reduce((total, row) => total + num(row.product_count), 0),
        });
      } catch {
        if (!cancelled) setCounts(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refresh = useCallback(() => setReloadToken((value) => value + 1), []);

  const handleAction = useCallback(
    async (key: string, row: Brand) => {
      if (key === 'edit') {
        setEditing(row);
        return;
      }

      if (key === 'products') {
        router.push(`/admin/products?brand=${row.id}`);
        return;
      }

      if (key !== 'delete') return;

      const confirmed = await confirmAction({
        title: `Delete ${row.name}?`,
        text: 'Products using this brand are only affected if you confirm a forced delete.',
        confirmText: 'Delete brand',
      });
      if (!confirmed) return;

      try {
        await api.delete(`/brands/${row.id}`);
        toastSuccess(`${row.name} was deleted`);
        refresh();
        return;
      } catch (error) {
        // A brand that still has products comes back with a 400 and an
        // `allow_force` flag. Deleting anyway leaves those products brand-less,
        // so it takes a second, explicit confirmation.
        if (error instanceof ApiError && error.meta.allow_force) {
          const products = Number(error.meta.product_count ?? 0);
          const forced = await confirmAction({
            title: `Delete ${row.name} anyway?`,
            text: `${products} product${products === 1 ? '' : 's'} will lose this brand and keep selling unbranded. The brand itself is removed.`,
            confirmText: 'Delete brand anyway',
            danger: true,
          });
          if (!forced) return;
          try {
            await api.delete(`/brands/${row.id}/force`);
            toastSuccess(`${row.name} was deleted; ${products} product${products === 1 ? '' : 's'} are now unbranded`);
            refresh();
          } catch (cause) {
            alertError('Could not force-delete the brand', describe(cause));
          }
          return;
        }
        alertError('Could not delete the brand', describe(error));
      }
    },
    [refresh, router]
  );

  const columns: DataTableColumn<Brand>[] = useMemo(
    () => [
      {
        data: 'name',
        title: 'Brand',
        sortable: true,
        render: (row) =>
          '<div class="flex items-center gap-2.5">' +
          (row.logo
            ? `<img src="${attr(imageUrl(row.logo))}" alt="" loading="lazy" class="size-9 shrink-0 rounded-lg border border-[var(--border-subtle)] bg-white object-contain p-0.5" />`
            : '<span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-clay-100 text-xs font-semibold uppercase text-clay-700 dark:bg-clay-500/20 dark:text-clay-300">'
              + `${text(String(row.name).slice(0, 2))}</span>`) +
          '<div class="flex min-w-0 flex-col">' +
          `<span class="font-medium text-sand-900 dark:text-sand-100">${text(row.name)}</span>` +
          `<span class="truncate text-xs text-muted">${text(row.slug)}</span>` +
          '</div></div>',
        exportValue: (row) => row.name,
      },
      {
        data: 'product_count',
        title: 'Products',
        sortable: true,
        className: 'text-center',
        render: (row) =>
          row.product_count
            ? `<a href="/admin/products?brand=${row.id}" class="font-medium text-clay-700 hover:underline dark:text-clay-400">${formatNumber(row.product_count)}</a>`
            : '<span class="text-muted">0</span>',
        exportValue: (row) => num(row.product_count),
      },
      {
        data: 'description',
        title: 'Description',
        sortable: false,
        render: (row) =>
          row.description
            ? `<span class="line-clamp-1 text-xs text-muted">${text(row.description)}</span>`
            : '<span class="text-muted">—</span>',
        exportValue: (row) => row.description ?? '',
      },
      {
        data: 'status',
        title: 'Status',
        sortable: true,
        render: (row) => pill(titleCase(row.status), STATUS_TONES[row.status] ?? ''),
        exportValue: (row) => row.status,
      },
      {
        data: 'created_at',
        title: 'Created',
        sortable: true,
        render: (row) =>
          `<span class="text-xs text-muted" title="${attr(row.created_at)}">${text(timeAgo(row.created_at))}</span>`,
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

  const stats: StatsStripItem[] = counts
    ? [
        { label: 'Brands', value: formatNumber(counts.total) },
        { label: 'Active', value: formatNumber(counts.active), tone: 'success' },
        {
          label: 'Branded products',
          value: formatNumber(counts.products),
          tone: 'brand',
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Brands"
        description="Makers whose pieces appear in the catalogue. A product may have no brand."
        actions={
          <Button leftIcon={<FolderPlus className="size-4" />} onClick={() => setEditing(null)}>
            New brand
          </Button>
        }
      />

      <StatsStrip
        items={stats.length ? stats : Array.from({ length: 3 }, () => ({ label: '—', value: '' }))}
        loading={!counts}
      />

      <DataTable<Brand>
        id="brands"
        endpoint="/brands"
        columns={columns}
        filters={{ status: status || undefined }}
        reloadToken={reloadToken}
        exportName="brands"
        exportTitle="Brand list"
        searchPlaceholder="Search name or description…"
        emptyMessage="No brands yet."
        actions={(): CellAction[] => [
          { key: 'edit', label: 'Edit brand', tone: 'brand' },
          { key: 'products', label: 'View products', tone: 'neutral' },
          { key: 'delete', label: 'Delete brand', tone: 'danger' },
        ]}
        onAction={(key, row) => void handleAction(key, row)}
        toolbar={
          <ToolbarSelect
            id="filter-brand-status"
            label="Any status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        }
      />

      {editing !== undefined ? (
        <BrandFormModal
          brand={editing ?? undefined}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function describe(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return error instanceof Error ? error.message : 'Unknown error';
}
