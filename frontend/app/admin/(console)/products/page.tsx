'use client';

/**
 * Products module — list.
 *
 * The stats strip and the filter pickers are React-owned; sorting, searching
 * and paging all happen in MySQL through `DataTable`. Category and brand
 * options come from `/products/form-options` so the pickers can never drift from
 * what the API will accept.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { StatsStrip, type StatsStripItem } from '@/components/admin/StatsStrip';
import { ToolbarSelect } from '@/components/admin/ToolbarSelect';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Card';
import { ApiError, api } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import { formatMoney, formatNumber, productStatusTag } from '@/lib/format';
import {
  ACTIONS_COLUMN,
  money,
  pill,
  productCell,
  stockCell,
  text,
  yesNo,
} from '@/lib/tableHtml';
import type { Product, ProductFormOptions, ProductStats } from '@/types';

type StatusFilter = '' | 'active' | 'draft' | 'archived';

export default function ProductsListPage() {
  const router = useRouter();

  const [stats, setStats] = useState<ProductStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [options, setOptions] = useState<ProductFormOptions | null>(null);

  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [stockView, setStockView] = useState<'' | 'low' | 'out'>('');
  const [featured, setFeatured] = useState<'' | 'true' | 'false'>('');
  const [reloadToken, setReloadToken] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      setStats(await api.get<ProductStats>('/products/stats'));
      setStatsError(null);
    } catch (error) {
      setStatsError(error instanceof Error ? error.message : 'Could not load product totals');
    }
  }, []);

  useEffect(() => {
    void loadStats();
    api
      .get<ProductFormOptions>('/products/form-options')
      .then(setOptions)
      .catch(() => setOptions(null));
  }, [loadStats]);

  const filters = useMemo(
    () => ({
      category_id: categoryId || undefined,
      brand_id: brandId || undefined,
      status: status || undefined,
      low_stock: stockView === 'low' ? 'true' : undefined,
      out_of_stock: stockView === 'out' ? 'true' : undefined,
      featured: featured || undefined,
    }),
    [categoryId, brandId, status, stockView, featured]
  );

  const clearFilters = () => {
    setCategoryId('');
    setBrandId('');
    setStatus('');
    setStockView('');
    setFeatured('');
  };

  const hasFilters = Boolean(categoryId || brandId || status || stockView || featured);

  const handleAction = useCallback(
    async (key: string, row: Product) => {
      if (key === 'delete') {
        const confirmed = await confirmAction({
          title: `Delete ${row.name}?`,
          text: 'The product is removed from the catalogue. Past orders keep their record of it.',
          confirmText: 'Delete product',
        });
        if (!confirmed) return;
        try {
          await api.delete(`/products/${row.id}`);
          toastSuccess(`${row.name} was deleted`);
          setReloadToken((value) => value + 1);
          void loadStats();
        } catch (error) {
          alertError('Could not delete the product', describe(error));
        }
        return;
      }

      if (key === 'duplicate') {
        try {
          const created = await api.post<Product>('/products', {
            name: `${row.name} (copy)`,
            category_id: row.category_id,
            brand_id: row.brand_id ?? undefined,
            price: row.price,
            cost_price: row.cost_price ?? undefined,
            short_description: row.short_description ?? undefined,
            description: row.description ?? undefined,
            stock_quantity: 0,
            minimum_stock: row.minimum_stock,
            status: 'draft',
          });
          toastSuccess('Draft copy created');
          router.push(`/admin/products/${created.id}/edit`);
        } catch (error) {
          alertError('Could not copy the product', describe(error));
        }
      }
    },
    [loadStats, router]
  );

  const columns: DataTableColumn<Product>[] = useMemo(
    () => [
      {
        data: 'name',
        title: 'Product',
        sortable: true,
        render: (row) =>
          productCell({
            image: row.primary_image,
            name: row.name,
            meta: row.sku,
            href: `/admin/products/${row.id}`,
          }),
        exportValue: (row) => row.name,
      },
      {
        data: 'category_name',
        title: 'Category',
        sortable: true,
        render: (row) => text(row.category_name),
        exportValue: (row) => row.category_name ?? '',
      },
      {
        data: 'brand_name',
        title: 'Brand',
        sortable: true,
        render: (row) => text(row.brand_name),
        exportValue: (row) => row.brand_name ?? '',
      },
      {
        data: 'price',
        title: 'Price',
        sortable: true,
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row) => {
          const onSale = row.sale_price && Number(row.sale_price) < Number(row.price);
          if (!onSale) return `<span class="font-medium">${money(row.price)}</span>`;
          return (
            `<span class="flex flex-col items-end leading-tight">` +
            `<span class="font-semibold text-clay-700 dark:text-clay-400">${money(row.sale_price)}</span>` +
            `<span class="text-[0.7rem] text-muted line-through">${money(row.price)}</span>` +
            `</span>`
          );
        },
        exportValue: (row) => row.price,
      },
      {
        data: 'stock_quantity',
        title: 'Stock',
        sortable: true,
        render: (row) => stockCell(row.stock_quantity, row.minimum_stock),
        exportValue: (row) => row.stock_quantity,
      },
      {
        data: 'featured',
        title: 'Featured',
        sortable: true,
        className: 'text-center',
        render: (row) => yesNo(row.featured),
        exportValue: (row) => (row.featured ? 'Yes' : 'No'),
      },
      {
        data: 'status',
        title: 'Status',
        sortable: true,
        render: (row) => {
          const tag = productStatusTag(row.status);
          return pill(tag.label, tag.className);
        },
        exportValue: (row) => row.status,
      },
      {
        data: 'created_at',
        title: 'Added',
        sortable: true,
        render: (row) => text(new Date(row.created_at.replace(' ', 'T')).toLocaleDateString('en-PH')),
        exportValue: (row) => row.created_at,
      },
      {
        data: ACTIONS_COLUMN,
        title: '',
        skipExport: true,
        className: 'text-right',
        render: undefined,
      },
    ],
    []
  );

  const statsItems: StatsStripItem[] = stats
    ? [
        { label: 'Products', value: formatNumber(stats.total_products) },
        {
          label: 'Active',
          value: formatNumber(stats.active_listings),
          tone: 'success',
        },
        { label: 'Draft', value: formatNumber(stats.draft_products), tone: 'warning' },
        {
          label: 'Low stock',
          value: formatNumber(stats.low_stock),
          tone: 'warning',
          hint: `min level reached`,
        },
        {
          label: 'Out of stock',
          value: formatNumber(stats.out_of_stock),
          tone: 'danger',
        },
        {
          label: 'Stock value',
          value: formatMoney(stats.inventory_value, 'PHP', { decimals: 0 }),
          tone: 'brand',
          hint: `${formatNumber(stats.inventory_units)} units`,
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        description="The catalogue, its pricing, stock levels and photography."
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={() => router.push('/admin/products/new')}>
            New product
          </Button>
        }
      />

      {statsError ? (
        <p className="rounded-lg bg-rose-50 px-4 py-2.5 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {statsError}
        </p>
      ) : null}

      <StatsStrip
        items={
          statsItems.length
            ? statsItems
            : Array.from({ length: 6 }, () => ({ label: '—', value: '' }))
        }
        loading={!stats}
      />

      {hasFilters ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>Filtered view.</span>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sand-300 px-2.5 py-1 font-medium text-sand-700 transition-colors hover:bg-sand-100 dark:border-walnut-800 dark:text-sand-200 dark:hover:bg-walnut-800"
          >
            <RotateCcw className="size-3" aria-hidden />
            Clear filters
          </button>
        </div>
      ) : null}

      <DataTable<Product>
        id="products"
        endpoint="/products"
        columns={columns}
        filters={filters}
        reloadToken={reloadToken}
        actions={(row) => [
          { key: 'view', label: 'View product', href: `/admin/products/${row.id}`, tone: 'neutral' },
          { key: 'edit', label: 'Edit product', href: `/admin/products/${row.id}/edit`, tone: 'brand' },
          { key: 'duplicate', label: 'Duplicate', tone: 'neutral' },
          { key: 'delete', label: 'Delete product', tone: 'danger' },
        ]}
        onAction={(key, row) => void handleAction(key, row)}
        exportName="products"
        exportTitle="Product catalogue"
        searchPlaceholder="Search name, SKU or description…"
        toolbar={
          <>
            <ToolbarSelect
              id="filter-category"
              label="All categories"
              value={categoryId}
              onChange={setCategoryId}
              options={(options?.categories ?? []).map((category) => ({
                value: category.id,
                label: category.name,
              }))}
            />
            <ToolbarSelect
              id="filter-brand"
              label="All brands"
              value={brandId}
              onChange={setBrandId}
              options={(options?.brands ?? []).map((brand) => ({
                value: brand.id,
                label: brand.name,
              }))}
            />
            <ToolbarSelect
              id="filter-status"
              label="Any status"
              value={status}
              onChange={(value) => setStatus(value as StatusFilter)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
            <ToolbarSelect
              id="filter-stock"
              label="Any stock"
              value={stockView}
              onChange={(value) => setStockView(value as '' | 'low' | 'out')}
              options={[
                { value: 'low', label: 'Low stock' },
                { value: 'out', label: 'Out of stock' },
              ]}
            />
            <ToolbarSelect
              id="filter-featured"
              label="Any visibility"
              value={featured}
              onChange={(value) => setFeatured(value as '' | 'true' | 'false')}
              options={[
                { value: 'true', label: 'Featured only' },
                { value: 'false', label: 'Not featured' },
              ]}
            />
          </>
        }
      />

      <p className="text-xs text-muted">
        The export menu produces CSV, Excel, PDF and JSON for every product matching the
        current search and filters, not just the page on screen.
      </p>
    </div>
  );
}

/** Field-level messages from a 422, flattened to one sentence. */
function describe(error: unknown): string {
  if (error instanceof ApiError && error.details.length > 0) {
    return error.details.map((detail) => detail.message).join(' ');
  }
  return error instanceof Error ? error.message : 'Unknown error';
}
