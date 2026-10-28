'use client';

/**
 * Create/edit form for a product.
 *
 * One component serves both routes: `product` absent means create. The only
 * structural difference is photography — the gallery needs a product id to
 * upload against, so the new-product page drops straight into the edit screen
 * once the record exists.
 */
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Save, Tags } from 'lucide-react';
import { ProductGallery } from '@/components/admin/products/ProductGallery';
import {
  SpecificationsEditor,
  type SpecificationDraft,
} from '@/components/admin/products/SpecificationsEditor';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/Field';
import { PageSpinner } from '@/components/ui/Feedback';
import { ApiError, api } from '@/lib/api';
import { alertError, alertSuccess, confirmAction } from '@/lib/alerts';
import { formatMoney, num } from '@/lib/format';
import type { Product, ProductFormOptions, ProductImage, ProductSpecification } from '@/types';

interface ProductFormProps {
  /** Omit to create. */
  product?: Product;
  options: ProductFormOptions;
  /** Injected by the edit route so it can be swapped for a server fetch later. */
  images?: ProductImage[];
  specifications?: ProductSpecification[];
}

interface FormState {
  name: string;
  sku: string;
  category_id: string;
  brand_id: string;
  price: string;
  sale_price: string;
  cost_price: string;
  weight: string;
  dimensions: string;
  stock_quantity: string;
  minimum_stock: string;
  short_description: string;
  description: string;
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
}

function initialState(product?: Product): FormState {
  return {
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    category_id: product ? String(product.category_id) : '',
    brand_id: product?.brand_id ? String(product.brand_id) : '',
    price: product ? String(num(product.price)) : '',
    sale_price: product?.sale_price ? String(num(product.sale_price)) : '',
    cost_price: product?.cost_price ? String(num(product.cost_price)) : '',
    weight: product?.weight ? String(num(product.weight)) : '',
    dimensions: product?.dimensions ?? '',
    stock_quantity: product ? String(product.stock_quantity) : '0',
    minimum_stock: product ? String(product.minimum_stock) : '5',
    short_description: product?.short_description ?? '',
    description: product?.description ?? '',
    status: product?.status ?? 'active',
    featured: Boolean(product?.featured),
  };
}

export function ProductForm({ product, options, images, specifications }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [form, setForm] = useState<FormState>(() => initialState(product));
  const [gallery, setGallery] = useState<ProductImage[]>(images ?? []);
  const [specs, setSpecs] = useState<SpecificationDraft[]>(
    (specifications ?? []).map((spec) => ({
      attribute_name: spec.attribute_name,
      attribute_value: spec.attribute_value,
    }))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Deep links land straight on the form, so re-seed when the record changes.
  useEffect(() => {
    setForm(initialState(product));
    setErrors({});
  }, [product]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const { [key]: _removed, ...rest } = current;
      return rest;
    });
  };

  const categoryOptions = useMemo(
    () => options.categories.map((category) => ({ value: category.id, label: category.name })),
    [options.categories]
  );
  const brandOptions = useMemo(
    () => options.brands.map((brand) => ({ value: brand.id, label: brand.name })),
    [options.brands]
  );

  const price = num(form.price);
  const salePrice = form.sale_price ? num(form.sale_price) : null;
  const margin = price > 0 && salePrice !== null ? ((price - salePrice) / price) * 100 : null;
  const marginOnCost = price > 0 && form.cost_price
    ? ((price - num(form.cost_price)) / num(form.cost_price)) * 100
    : null;

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      category_id: Number(form.category_id),
      price,
      short_description: form.short_description.trim() || undefined,
      description: form.description.trim() || undefined,
      status: form.status,
      featured: form.featured,
    };

    // `sku` is generated server-side when omitted, so only send an edited one.
    if (form.sku.trim()) payload.sku = form.sku.trim();
    if (form.brand_id) payload.brand_id = Number(form.brand_id);
    if (form.sale_price) payload.sale_price = salePrice;
    if (form.cost_price) payload.cost_price = num(form.cost_price);
    if (form.weight) payload.weight = num(form.weight);
    if (form.dimensions.trim()) payload.dimensions = form.dimensions.trim();

    if (!isEdit) {
      payload.stock_quantity = Number(form.stock_quantity) || 0;
      payload.minimum_stock = Number(form.minimum_stock) || 0;
    }

    return payload;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      if (isEdit && product) {
        const updated = await api.put<Product>(`/products/${product.id}`, buildPayload());

        // Specifications are a separate replace-all endpoint, so a failure here
        // must not discard the product change that already succeeded.
        const clean = specs.filter(
          (spec) => spec.attribute_name.trim() && spec.attribute_value.trim()
        );
        if (clean.length !== specs.length) setSpecs(clean);
        if (clean.length > 0) {
          await api.put(`/products/${product.id}/specifications`, { specifications: clean });
        }

        alertSuccess('Product saved', `${updated.name} is up to date.`);
        router.push(`/admin/products/${product.id}`);
      } else {
        const created = await api.post<Product>('/products', buildPayload());
        // Photographs need a product to hang off, so continue on the edit screen.
        router.push(`/admin/products/${created.id}/edit?created=1`);
      }
    } catch (error) {
      if (error instanceof ApiError && error.details.length > 0) {
        setErrors(error.fieldErrors);
        alertError('Check the form', Object.values(error.fieldErrors)[0]);
      } else {
        alertError('Could not save the product', message(error));
      }
    } finally {
      setSaving(false);
    }
  };

  const leave = async () => {
    if (isEdit) {
      router.push(`/admin/products/${product!.id}`);
      return;
    }
    const confirmed = await confirmAction({
      title: 'Discard this product?',
      text: 'Nothing has been saved yet.',
      confirmText: 'Discard',
    });
    if (confirmed) router.push('/admin/products');
  };

  if (!options.categories.length) {
    return (
      <PageSpinner label="Loading catalogue options…" />
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => void leave()} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="submit"
          leftIcon={<Save className="size-4" />}
          loading={saving}
          disabled={!form.name.trim() || !form.category_id || price <= 0}
        >
          {isEdit ? 'Save changes' : 'Create product'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          {/* ------------------------------------------------- identity */}
          <Card>
            <CardHeader title="Identity" description="What the product is called and how it is filed." />
            <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Name"
                required
                error={errors.name}
                className="sm:col-span-2"
                hint="Shown in the storefront grid and on the product page."
              >
                <Input
                  value={form.name}
                  onChange={(event) => set('name', event.target.value)}
                  placeholder="Walnut Credenza, 4 Drawer"
                  required
                  maxLength={200}
                />
              </Field>

              <Field
                label="SKU"
                error={errors.sku}
                hint={isEdit ? 'Leave blank to keep the current code.' : 'Auto-generated when left blank.'}
              >
                <Input
                  value={form.sku}
                  onChange={(event) => set('sku', event.target.value)}
                  placeholder="LUM-SOF-004"
                  maxLength={64}
                />
              </Field>

              <Field label="Category" required error={errors.category_id}>
                <Select
                  value={form.category_id}
                  onChange={(event) => set('category_id', event.target.value)}
                  required
                >
                  <option value="">Select a category…</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Brand" error={errors.brand_id} className="sm:col-span-2">
                <Select
                  value={form.brand_id}
                  onChange={(event) => set('brand_id', event.target.value)}
                >
                  <option value="">No brand</option>
                  {brandOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </CardBody>
          </Card>

          {/* ------------------------------------------------- description */}
          <Card>
            <CardHeader
              title="Description"
              description="The copy a shopper reads before deciding."
              action={
                <span className="text-[0.7rem] text-muted">
                  {form.description.length} / 20000
                </span>
              }
            />
            <CardBody className="flex flex-col gap-4">
              <Field
                label="Short description"
                error={errors.short_description}
                hint="One sentence, used in cards and search results."
              >
                <Textarea
                  rows={2}
                  value={form.short_description}
                  onChange={(event) => set('short_description', event.target.value)}
                  maxLength={500}
                  placeholder="A low-slung credenza in solid walnut with soft-close drawers."
                />
              </Field>
              <Field label="Full description" error={errors.description}>
                <Textarea
                  rows={8}
                  value={form.description}
                  onChange={(event) => set('description', event.target.value)}
                  maxLength={20000}
                  placeholder="Materials, joinery, finish, care instructions…"
                />
              </Field>
            </CardBody>
          </Card>

          {/* ------------------------------------------------- photography */}
          {product ? (
            <Card>
              <CardHeader
                title="Photography"
                description="The first image is the cover used in the storefront grid."
              />
              <CardBody>
                <ProductGallery
                  productId={product.id}
                  images={gallery}
                  onChange={setGallery}
                />
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardHeader
                title="Photography"
                description="Added on the next screen"
              />
              <CardBody>
                <p className="rounded-lg border border-dashed border-sand-300 px-4 py-6 text-center text-xs text-muted dark:border-walnut-800">
                  Save the product first, then upload its photos on the edit screen.
                </p>
              </CardBody>
            </Card>
          )}

          {/* ------------------------------------------------ specifications */}
          {product ? (
            <Card>
              <CardHeader
                title="Specifications"
                description="Material, dimensions, finish — the table under the product title."
                action={
                  <Tags className="size-4 text-sand-400" aria-hidden />
                }
              />
              <CardBody>
                <SpecificationsEditor value={specs} onChange={setSpecs} disabled={saving} />
              </CardBody>
            </Card>
          ) : null}
        </div>

        {/* -------------------------------------------------- side column */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Pricing" />
            <CardBody className="flex flex-col gap-4">
              <Field label="Regular price" required error={errors.price}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(event) => set('price', event.target.value)}
                  placeholder="0.00"
                  required
                />
              </Field>
              <Field
                label="Sale price"
                error={errors.sale_price}
                hint={price > 0 && salePrice !== null ? `Saves ${formatMoney(price - salePrice, 'PHP')}` : 'Must be below the regular price.'}
              >
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={form.sale_price}
                  onChange={(event) => set('sale_price', event.target.value)}
                  placeholder="No discount"
                />
              </Field>
              <Field
                label="Cost price"
                error={errors.cost_price}
                hint="Used for the dashboard's net earning and inventory value."
              >
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={form.cost_price}
                  onChange={(event) => set('cost_price', event.target.value)}
                  placeholder="0.00"
                />
              </Field>

              {margin !== null || marginOnCost !== null ? (
                <dl className="grid grid-cols-2 gap-3 rounded-lg bg-[var(--surface-sunken)] px-3 py-2.5">
                  {margin !== null ? (
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-wide text-muted">Discount</dt>
                      <dd className="text-sm font-semibold tabular-nums text-sand-900 dark:text-sand-50">
                        {margin.toFixed(0)}%
                      </dd>
                    </div>
                  ) : null}
                  {marginOnCost !== null ? (
                    <div>
                      <dt className="text-[0.65rem] uppercase tracking-wide text-muted">
                        Margin on cost
                      </dt>
                      <dd className="text-sm font-semibold tabular-nums text-sand-900 dark:text-sand-50">
                        {marginOnCost.toFixed(0)}%
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : null}
            </CardBody>
          </Card>

          {isEdit ? null : (
            <Card>
              <CardHeader title="Opening stock" />
              <CardBody className="flex flex-col gap-4">
                <Field
                  label="Units on hand"
                  error={errors.stock_quantity}
                  hint="Logged as a stock-in adjustment."
                >
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={form.stock_quantity}
                    onChange={(event) => set('stock_quantity', event.target.value)}
                  />
                </Field>
                <Field
                  label="Reorder point"
                  error={errors.minimum_stock}
                  hint="Below this, the product shows as low stock."
                >
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={form.minimum_stock}
                    onChange={(event) => set('minimum_stock', event.target.value)}
                  />
                </Field>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Physical" />
            <CardBody className="flex flex-col gap-4">
              <Field label="Dimensions" error={errors.dimensions} hint="e.g. 180 × 45 × 75 cm">
                <Input
                  value={form.dimensions}
                  onChange={(event) => set('dimensions', event.target.value)}
                  maxLength={120}
                />
              </Field>
              <Field label="Weight (kg)" error={errors.weight}>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={form.weight}
                  onChange={(event) => set('weight', event.target.value)}
                />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Visibility" />
            <CardBody className="flex flex-col gap-4">
              <Field label="Status" error={errors.status}>
                <Select
                  value={form.status}
                  onChange={(event) => set('status', event.target.value as FormState['status'])}
                >
                  <option value="active">Active — listed in the storefront</option>
                  <option value="draft">Draft — hidden, still editable</option>
                  <option value="archived">Archived — retired</option>
                </Select>
              </Field>
              <Checkbox
                label="Featured product"
                description="Promoted in the storefront hero and feature rail."
                checked={form.featured}
                onChange={(event) => set('featured', event.target.checked)}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </form>
  );
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
