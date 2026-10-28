'use client';

/**
 * Product detail (read-only view of the record plus live inventory controls).
 *
 * Stock is never edited directly: every change goes through `/products/:id/stock`
 * as a typed movement, which is what keeps `inventory_logs` a complete audit
 * trail. The adjust panel is therefore always present rather than a modal.
 */
import { use, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  Clock,
  Eye,
  Package,
  Pencil,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { ProductGallery } from '@/components/admin/products/ProductGallery';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, DetailItem } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { Tabs } from '@/components/ui/Tabs';
import { api, imageUrl } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import { cn } from '@/lib/cn';
import {
  formatDateTime,
  formatMoney,
  formatNumber,
  num,
  productStatusTag,
  timeAgo,
} from '@/lib/format';
import type { InventoryLog, Product, ProductImage, ProductSpecification } from '@/types';

type TabKey = 'overview' | 'specifications' | 'inventory';

const MOVEMENT_TYPES = [
  { value: 'stock_in', label: 'Stock in — received from supplier' },
  { value: 'stock_out', label: 'Stock out — damaged, lost or written off' },
  { value: 'adjustment', label: 'Adjustment — correct a miscount' },
  { value: 'return', label: 'Return — customer returned a unit' },
] as const;

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [specs, setSpecs] = useState<ProductSpecification[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [tab, setTab] = useState<TabKey>('overview');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [record, gallery, specifications, history] = await Promise.all([
        api.get<Product>(`/products/${id}`),
        api.get<ProductImage[]>(`/products/${id}/images`),
        api.get<ProductSpecification[]>(`/products/${id}/specifications`),
        api.list<InventoryLog>(`/products/inventory-logs`, {
          product_id: id,
          pageSize: 50,
        }),
      ]);
      setProduct(record);
      setImages(gallery);
      setSpecs(specifications);
      setLogs(history.data);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load the product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async () => {
    if (!product) return;
    const confirmed = await confirmAction({
      title: `Delete ${product.name}?`,
      text: 'The product leaves the catalogue. Past orders keep their record of it.',
      confirmText: 'Delete product',
    });
    if (!confirmed) return;
    try {
      await api.delete(`/products/${product.id}`);
      toastSuccess(`${product.name} was deleted`);
      router.push('/admin/products');
    } catch (cause) {
      alertError('Could not delete the product', message(cause));
    }
  };

  if (loading) return <PageSpinner label="Loading product…" />;

  if (error || !product) {
    return (
      <Card>
        <CardBody>
          <ErrorState
            title="The product could not load"
            description={error ?? undefined}
            onRetry={() => window.location.reload()}
          />
        </CardBody>
      </Card>
    );
  }

  const statusTag = productStatusTag(product.status);
  const onSale = Boolean(product.sale_price) && num(product.sale_price) < num(product.price);
  const price = onSale ? num(product.sale_price) : num(product.price);
  const lowStock = product.stock_quantity <= 0;
  const margin = num(product.cost_price) > 0
    ? ((num(product.price) - num(product.cost_price)) / num(product.cost_price)) * 100
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------------------ head */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/admin/products"
            aria-label="Back to products"
            className="mt-1 rounded-lg p-1.5 text-sand-500 transition-colors hover:bg-sand-100 hover:text-clay-700 dark:hover:bg-walnut-800"
          >
            <ChevronLeft className="size-5" />
          </Link>          <img
            src={imageUrl(images[0]?.image ?? product.primary_image)}
            alt=""
            width={72}
            height={72}
            className="size-18 shrink-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] object-cover"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-sand-900 dark:text-sand-50">
                {product.name}
              </h1>
              <Badge className={statusTag.className}>{statusTag.label}</Badge>
              {product.featured ? (
                <Badge className="bg-clay-100 text-clay-700 dark:bg-clay-500/15 dark:text-clay-300">
                  Featured
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted">
              SKU {product.sku} · {product.category_name}
              {product.brand_name ? ` · ${product.brand_name}` : ''}
            </p>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="font-display text-2xl font-semibold text-clay-700 dark:text-clay-400">
                {formatMoney(price, 'PHP')}
              </span>
              {onSale ? (
                <span className="text-sm text-muted line-through">
                  {formatMoney(product.price, 'PHP')}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye className="size-3.5" />}
            onClick={() => window.open(`/products/${product.slug}`, '_blank', 'noopener')}
          >
            View in store
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Trash2 className="size-3.5" />}
            onClick={() => void remove()}
            className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            Delete
          </Button>
          <Button
            size="sm"
            leftIcon={<Pencil className="size-3.5" />}
            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
          >
            Edit product
          </Button>
        </div>
      </div>

      {/* --------------------------------------------------------- tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'specifications', label: `Specifications (${specs.length})` },
          { id: 'inventory', label: `Inventory (${logs.length})` },
        ]}
        active={tab}
        onChange={(value) => setTab(value as TabKey)}
      />

      {tab === 'overview' ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="flex flex-col gap-6 xl:col-span-2">
            <Card>
              <CardHeader
                title="Photography"
                description={`${images.length} image${images.length === 1 ? '' : 's'} · the first is the cover`}
              />
              <CardBody>
                <ProductGallery productId={product.id} images={images} onChange={setImages} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Description" />
              <CardBody className="flex flex-col gap-4">
                {product.short_description ? (
                  <p className="text-sm leading-relaxed text-sand-700 dark:text-sand-200">
                    {product.short_description}
                  </p>
                ) : null}
                {product.description ? (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-sand-600 dark:text-sand-300">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted">No description written yet.</p>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader title="Stock" />
              <CardBody className="flex flex-col gap-4">
                <div className="flex items-baseline gap-2">
                  <span
                    className={cn(
                      'font-display text-3xl font-semibold tabular-nums',
                      lowStock ? 'text-rose-600 dark:text-rose-400' : 'text-sand-900 dark:text-sand-50'
                    )}
                  >
                    {formatNumber(product.stock_quantity)}
                  </span>
                  <span className="text-sm text-muted">units on hand</span>
                </div>
                <p className="text-xs text-muted">
                  Reorder point is {formatNumber(product.minimum_stock)} units.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<SlidersHorizontal className="size-3.5" />}
                  onClick={() => setTab('inventory')}
                >
                  Record a movement
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Details" />
              <CardBody className="p-0">
                <dl className="divide-y divide-[var(--border-subtle)] px-5">
                  <DetailItem
                    className="py-3"
                    label="Regular price"
                    value={formatMoney(product.price, 'PHP')}
                  />
                  {product.sale_price ? (
                    <DetailItem
                      className="py-3"
                      label="Sale price"
                      value={formatMoney(product.sale_price, 'PHP')}
                    />
                  ) : null}
                  {product.cost_price ? (
                    <DetailItem
                      className="py-3"
                      label="Cost price"
                      value={`${formatMoney(product.cost_price, 'PHP')}${
                        margin !== null ? ` · ${margin.toFixed(0)}% margin` : ''
                      }`}
                    />
                  ) : null}
                  <DetailItem className="py-3" label="Category" value={product.category_name ?? '—'} />
                  <DetailItem className="py-3" label="Brand" value={product.brand_name ?? 'No brand'} />
                  <DetailItem className="py-3" label="Dimensions" value={product.dimensions ?? '—'} />
                  <DetailItem
                    className="py-3"
                    label="Weight"
                    value={product.weight ? `${num(product.weight)} kg` : '—'}
                  />
                  <DetailItem
                    className="py-3"
                    label="Rating"
                    value={
                      product.avg_rating
                        ? `${num(product.avg_rating).toFixed(2)} / 5 · ${formatNumber(product.review_count ?? 0)} reviews`
                        : 'No reviews yet'
                    }
                  />
                  <DetailItem className="py-3" label="Created" value={formatDateTime(product.created_at)} />
                  <DetailItem className="py-3" label="Last updated" value={timeAgo(product.updated_at)} />
                </dl>
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === 'specifications' ? (
        <Card>
          <CardHeader
            title="Specifications"
            description="Replaced wholesale on save, so a removed row is really removed."
            action={
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Pencil className="size-3.5" />}
                onClick={() => router.push(`/admin/products/${product.id}/edit`)}
              >
                Edit
              </Button>
            }
          />
          <CardBody>
            {specs.length === 0 ? (
              <p className="rounded-lg border border-dashed border-sand-300 px-4 py-8 text-center text-sm text-muted dark:border-walnut-800">
                No specifications recorded.
              </p>
            ) : (
              <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-2">
                {specs.map((spec) => (
                  <div key={spec.id} className="bg-[var(--surface-raised)] px-4 py-3">
                    <dt className="text-[0.65rem] font-semibold uppercase tracking-wide text-muted">
                      {spec.attribute_name}
                    </dt>
                    <dd className="mt-0.5 text-sm text-sand-800 dark:text-sand-100">
                      {spec.attribute_value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </CardBody>
        </Card>
      ) : null}

      {tab === 'inventory' ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <StockAdjuster
            product={product}
            onRecorded={async () => {
              await load();
              toastSuccess('Stock updated');
            }}
          />
          <div className="xl:col-span-2">
            <Card>
              <CardHeader
                title="Movement history"
                description="Newest first"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<RefreshCw className="size-3.5" />}
                    onClick={() => void load()}
                  >
                    Refresh
                  </Button>
                }
              />
              <CardBody className="p-0">
                {logs.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-muted">
                    No movements recorded for this product.
                  </p>
                ) : (
                  <ul className="divide-y divide-[var(--border-subtle)]">
                    {logs.map((log) => {
                      const positive = log.quantity > 0;
                      return (
                        <li key={log.id} className="flex items-start gap-3 px-5 py-3">
                          <span
                            className={cn(
                              'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full',
                              positive
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                            )}
                          >
                            {positive ? (
                              <ArrowUpRight className="size-3.5" />
                            ) : (
                              <ArrowDownRight className="size-3.5" />
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-sand-800 dark:text-sand-100">
                              {MOVEMENT_TYPES.find((option) => option.value === log.type)?.label ??
                                log.type}
                            </p>
                            {log.remarks ? (
                              <p className="text-xs text-muted">{log.remarks}</p>
                            ) : null}
                            {log.reference ? (
                              <p className="text-[0.7rem] text-muted">Ref {log.reference}</p>
                            ) : null}
                          </div>
                          <div className="shrink-0 text-right">
                            <span
                              className={cn(
                                'text-sm font-semibold tabular-nums',
                                positive
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              )}
                            >
                              {positive ? '+' : ''}
                              {formatNumber(log.quantity)}
                            </span>
                            <p className="flex items-center justify-end gap-1 text-[0.7rem] text-muted">
                              <Clock className="size-3" aria-hidden />
                              {timeAgo(log.created_at)}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------- stock adjuster */

function StockAdjuster({
  product,
  onRecorded,
}: {
  product: Product;
  onRecorded: () => Promise<void>;
}) {
  const [type, setType] = useState<string>('stock_in');
  const [quantity, setQuantity] = useState('');
  const [reference, setReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signed = useMemo(() => {
    const value = Number(quantity) || 0;
    return type === 'stock_out' ? -Math.abs(value) : value;
  }, [type, quantity]);

  const projected = product.stock_quantity + signed;
  const invalid = !quantity || Number(quantity) === 0 || projected < 0;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (invalid) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/products/${product.id}/stock`, {
        type,
        quantity: signed,
        reference: reference.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      setQuantity('');
      setReference('');
      setRemarks('');
      await onRecorded();
    } catch (cause) {
      setError(message(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Record a movement"
        description="Every change is written to the inventory log."
      />
      <CardBody>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Movement" required>
            <Select value={type} onChange={(event) => setType(event.target.value)}>
              {MOVEMENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Quantity"
            required
            error={error}
            hint={
              quantity
                ? `${product.stock_quantity} on hand → ${projected} after this movement`
                : 'A negative adjustment for a miscount; positive for a delivery.'
            }
          >
            <Input
              type="number"
              step={1}
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="e.g. 12"
            />
          </Field>

          <Field label="Reference" hint="Purchase order, delivery note or ticket number.">
            <Input
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              maxLength={64}
              placeholder="PO-2291"
            />
          </Field>

          <Field label="Remarks">
            <Textarea
              rows={2}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              maxLength={255}
              placeholder="Why is this happening?"
            />
          </Field>

          {invalid && quantity ? (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
              That would leave the product at {projected} units.
            </p>
          ) : null}

          <Button type="submit" disabled={invalid} loading={busy} leftIcon={<Package className="size-4" />}>
            Record movement
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
