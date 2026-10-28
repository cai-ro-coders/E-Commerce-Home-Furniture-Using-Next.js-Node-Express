'use client';

/**
 * Create/edit form for a brand, rendered inside the list page's modal.
 *
 * A brand has a name, a logo and a blurb — nothing hierarchical — so this is the
 * same shape as the category form minus the parent picker.
 */
import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { ApiError, api, imageUrl } from '@/lib/api';
import { alertSuccess } from '@/lib/alerts';
import type { Brand } from '@/types';

export function BrandFormModal({
  brand,
  onClose,
  onSaved,
}: {
  /** Omit to create. */
  brand?: Brand;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(brand);

  const [form, setForm] = useState({
    name: brand?.name ?? '',
    slug: brand?.slug ?? '',
    logo: brand?.logo ?? '',
    description: brand?.description ?? '',
    status: brand?.status ?? ('active' as 'active' | 'inactive'),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!brand) return;
    setForm({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo ?? '',
      description: brand.description ?? '',
      status: brand.status,
    });
    setErrors({});
  }, [brand]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const { [key]: _cleared, ...rest } = current;
      return rest;
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    setError(null);

    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      status: form.status,
    };
    if (form.slug.trim()) payload.slug = form.slug.trim();
    if (form.logo.trim()) payload.logo = form.logo.trim();
    if (form.description.trim()) payload.description = form.description.trim();

    try {
      if (isEdit && brand) {
        await api.put(`/brands/${brand.id}`, payload);
        await alertSuccess('Brand saved', `${form.name.trim()} is up to date.`);
      } else {
        await api.post('/brands', payload);
        await alertSuccess('Brand created', `${form.name.trim()} is now available on products.`);
      }
      onSaved();
    } catch (cause) {
      if (cause instanceof ApiError && cause.details.length > 0) {
        setErrors(cause.fieldErrors);
        setError(Object.values(cause.fieldErrors)[0]);
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not save the brand');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      locked={saving}
      title={isEdit ? `Edit ${brand!.name}` : 'New brand'}
      description={
        isEdit
          ? 'The logo appears wherever the brand is shown.'
          : 'Brands are optional on a product, but they drive the storefront filter.'
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="brand-form" loading={saving} disabled={!form.name.trim()}>
            {isEdit ? 'Save brand' : 'Create brand'}
          </Button>
        </>
      }
    >
      <form id="brand-form" onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" required error={errors.name}>
            <Input
              value={form.name}
              onChange={(event) => set('name', event.target.value)}
              maxLength={120}
              required
              placeholder="Nordic Timber Co."
            />
          </Field>

          <Field
            label="Slug"
            error={errors.slug}
            hint={isEdit ? 'Leave blank to keep the current URL.' : 'Generated from the name.'}
          >
            <Input
              value={form.slug}
              onChange={(event) => set('slug', event.target.value)}
              maxLength={140}
              placeholder="nordic-timber"
            />
          </Field>
        </div>

        <Field label="Status" error={errors.status}>
          <Select
            value={form.status}
            onChange={(event) => set('status', event.target.value as 'active' | 'inactive')}
          >
            <option value="active">Active — available in the brand filter</option>
            <option value="inactive">Inactive — hidden</option>
          </Select>
        </Field>

        <Field
          label="Logo path"
          error={errors.logo}
          hint="A path under /uploads, e.g. /uploads/brands/nordic.svg"
        >
          <Input
            value={form.logo}
            onChange={(event) => set('logo', event.target.value)}
            maxLength={255}
            placeholder="/uploads/brands/nordic.svg"
          />
        </Field>

        {form.logo.trim() ? (
          <img
            src={imageUrl(form.logo.trim())}
            alt=""
            className="h-20 w-full rounded-xl border border-[var(--border-subtle)] bg-white object-contain p-3"
          />
        ) : null}

        <Field label="Description" error={errors.description}>
          <Textarea
            rows={3}
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            maxLength={2000}
            placeholder="Small-batch solid wood furniture from Jutland."
          />
        </Field>

        {error && Object.keys(errors).length === 0 ? (
          <p className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
