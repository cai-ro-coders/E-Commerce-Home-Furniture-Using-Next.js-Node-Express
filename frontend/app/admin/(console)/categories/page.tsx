'use client';

/**
 * Categories module.
 *
 * The grid is flat — the list endpoint returns a paginated set with
 * `parent_name`, so it can be sorted, searched and paged by DataTables — while
 * the parent picker reads the nested `/categories/tree` response. Both are
 * fetched: the tree is small and only the form needs it.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FolderPlus, Layers } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import {
  CategoryFormModal,
  type CategoryTreeOption,
} from '@/components/admin/categories/CategoryFormModal';
import { StatsStrip, type StatsStripItem } from '@/components/admin/StatsStrip';
import { ToolbarSelect } from '@/components/admin/ToolbarSelect';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Card';
import { ApiError, api, imageUrl } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import { formatNumber, timeAgo, titleCase } from '@/lib/format';
import { ACTIONS_COLUMN, attr, pill, text, type CellAction } from '@/lib/tableHtml';
import type { Category } from '@/types';

const STATUS_TONES: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  inactive: 'bg-sand-100 text-sand-600 dark:bg-walnut-800 dark:text-sand-400',
};

export default function CategoriesPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  /** `undefined` = closed, `null` = creating, a record = editing. */
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);
  const [counts, setCounts] = useState<{ total: number; active: number; topLevel: number } | null>(
    null
  );
  const [tree, setTree] = useState<CategoryTreeOption[]>([]);

  /** Flatten the nested tree into a select-friendly list that keeps depth. */
  const loadTree = useCallback(async () => {
    try {
      const nested = await api.get<Category[]>('/categories/tree');
      const flat: CategoryTreeOption[] = [];
      const walk = (nodes: Category[], depth: number) => {
        for (const node of nodes) {
          flat.push({ id: node.id, name: node.name, parent_id: node.parent_id, depth });
          if (node.children?.length) walk(node.children, depth + 1);
        }
      };
      walk(nested, 0);
      setTree(flat);
    } catch {
      setTree([]);
    }
  }, []);

  useEffect(() => {
    void loadTree();
  }, [loadTree]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.list<Category>('/categories', {
          pageSize: 200,
          sortBy: 'name',
          sortDir: 'asc',
        });
        if (cancelled) return;
        setCounts({
          total: list.meta.total,
          active: list.data.filter((row) => row.status === 'active').length,
          topLevel: list.data.filter((row) => !row.parent_id).length,
        });
      } catch {
        if (!cancelled) setCounts(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const handleAction = useCallback(
    async (key: string, row: Category) => {
      if (key === 'edit') {
        setEditing(row);
        return;
      }

      if (key === 'products') {
        router.push(`/admin/products?category=${row.id}`);
        return;
      }

      if (key === 'delete') {
        const confirmed = await confirmAction({
          title: `Delete ${row.name}?`,
          text: 'A category can only go once it has no sub-categories and no products.',
          confirmText: 'Delete category',
        });
        if (!confirmed) return;
        try {
          await api.delete(`/categories/${row.id}`);
          toastSuccess(`${row.name} was deleted`);
          setReloadToken((value) => value + 1);
          void loadTree();
        } catch (error) {
          // The API explains exactly what is in the way; surface that verbatim
          // rather than a generic failure.
          alertError('Could not delete the category', describe(error));
        }
      }
    },
    [loadTree, router]
  );

  const columns: DataTableColumn<Category>[] = useMemo(
    () => [
      {
        data: 'name',
        title: 'Category',
        sortable: true,
        render: (row) =>
          '<div class="flex items-center gap-2.5">' +
          (row.parent_id
            ? '<span class="text-sand-300 dark:text-walnut-700" aria-hidden>&#8627;</span>'
            : '') +
          (row.image
            ? `<img src="${attr(imageUrl(row.image))}" alt="" loading="lazy" class="size-9 shrink-0 rounded-lg border border-[var(--border-subtle)] object-cover" />`
            : '') +
          '<div class="flex min-w-0 flex-col">' +
          `<span class="font-medium text-sand-900 dark:text-sand-100">${text(row.name)}</span>` +
          `<span class="truncate text-xs text-muted">${text(row.slug)}</span>` +
          '</div></div>',
        exportValue: (row) => row.name,
      },
      {
        data: 'parent_name',
        title: 'Parent',
        sortable: false,
        render: (row) =>
          row.parent_name
            ? `<span class="text-xs">${text(row.parent_name)}</span>`
            : '<span class="text-muted">Top level</span>',
        exportValue: (row) => row.parent_name ?? '',
      },
      {
        data: 'product_count',
        title: 'Products',
        sortable: true,
        className: 'text-center',
        render: (row) =>
          row.product_count
            ? `<a href="/admin/products?category=${row.id}" class="font-medium text-clay-700 hover:underline dark:text-clay-400">${formatNumber(row.product_count)}</a>`
            : '<span class="text-muted">0</span>',
        exportValue: (row) => row.product_count ?? 0,
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
        { label: 'Categories', value: formatNumber(counts.total) },
        { label: 'Active', value: formatNumber(counts.active), tone: 'success' },
        { label: 'Top level', value: formatNumber(counts.topLevel) },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description="How the catalogue is filed. Categories nest, and products hang off either."
        actions={
          <>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300"
            >
              <Layers className="size-4" aria-hidden />
              Browse products
            </Link>
            <Button leftIcon={<FolderPlus className="size-4" />} onClick={() => setEditing(null)}>
              New category
            </Button>
          </>
        }
      />

      <StatsStrip
        items={stats.length ? stats : Array.from({ length: 3 }, () => ({ label: '—', value: '' }))}
        loading={!counts}
      />

      <DataTable<Category>
        id="categories"
        endpoint="/categories"
        columns={columns}
        filters={{ status: status || undefined }}
        reloadToken={reloadToken}
        exportName="categories"
        exportTitle="Category list"
        searchPlaceholder="Search name or slug…"
        emptyMessage="No categories yet."
        actions={(): CellAction[] => [
          { key: 'edit', label: 'Edit category', tone: 'brand' },
          { key: 'products', label: 'View products', tone: 'neutral' },
          { key: 'delete', label: 'Delete category', tone: 'danger' },
        ]}
        onAction={(key, row) => void handleAction(key, row)}
        toolbar={
          <ToolbarSelect
            id="filter-category-status"
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
        <CategoryFormModal
          category={editing ?? undefined}
          tree={tree}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            setReloadToken((value) => value + 1);
            void loadTree();
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
