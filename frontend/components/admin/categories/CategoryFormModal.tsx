'use client';

/**
 * Create/edit form for a category, rendered inside the list page's modal.
 *
 * The parent picker is the interesting part: categories nest with a self
 * foreign key, so a category cannot be moved under itself or under one of its
 * own descendants. The API rejects that too, but offering an invalid option is
 * worse than a 422, so the tree is flattened and the subtree is pruned here.
 */
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { ApiError, api, imageUrl } from '@/lib/api';
import { alertSuccess } from '@/lib/alerts';
import type { Category } from '@/types';

export interface CategoryTreeOption {
  id: number;
  name: string;
  parent_id: number | null;
  /** 0 for a top-level category; used only for the picker's indentation. */
  depth: number;
}

export function CategoryFormModal({
  category,
  tree,
  onClose,
  onSaved,
}: {
  /** Omit to create. */
  category?: Category;
  tree: CategoryTreeOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(category);

  const [form, setForm] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    parent_id: category?.parent_id ? String(category.parent_id) : '',
    image: category?.image ?? '',
    description: category?.description ?? '',
    status: category?.status ?? ('active' as 'active' | 'inactive'),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!category) return;
    setForm({
      name: category.name,
      slug: category.slug,
      parent_id: category.parent_id ? String(category.parent_id) : '',
      image: category.image ?? '',
      description: category.description ?? '',
      status: category.status,
    });
    setErrors({});
  }, [category]);

  /** Ids of the category and everything beneath it — never a valid parent. */
  const forbidden = useMemo(() => {
    if (!category) return new Set<number>();
    const blocked = new Set<number>([category.id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const node of tree) {
        if (node.parent_id && blocked.has(node.parent_id) && !blocked.has(node.id)) {
          blocked.add(node.id);
          grew = true;
        }
      }
    }
    return blocked;
  }, [category, tree]);

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
      parent_id: form.parent_id ? Number(form.parent_id) : null,
    };
    if (form.slug.trim()) payload.slug = form.slug.trim();
    if (form.image.trim()) payload.image = form.image.trim();
    if (form.description.trim()) payload.description = form.description.trim();

    try {
      if (isEdit && category) {
        await api.put(`/categories/${category.id}`, payload);
        await alertSuccess('Category saved', `${form.name.trim()} is up to date.`);
      } else {
        await api.post('/categories', payload);
        await alertSuccess('Category created', `${form.name.trim()} is now in the catalogue.`);
      }
      onSaved();
    } catch (cause) {
      if (cause instanceof ApiError && cause.details.length > 0) {
        setErrors(cause.fieldErrors);
        setError(Object.values(cause.fieldErrors)[0]);
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not save the category');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      locked={saving}
      title={isEdit ? `Edit ${category!.name}` : 'New category'}
      description={
        isEdit
          ? 'Renaming or re-filing a category does not touch the products inside it.'
          : 'Top-level categories hold sub-categories, and products hang off either.'
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" loading={saving} disabled={!form.name.trim()}>
            {isEdit ? 'Save category' : 'Create category'}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" required error={errors.name}>
            <Input
              value={form.name}
              onChange={(event) => set('name', event.target.value)}
              maxLength={120}
              required
              placeholder="Sofas"
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
              placeholder="sofas"
            />
          </Field>

          <Field
            label="Parent"
            error={errors.parent_id}
            hint="A top-level category has no parent."
          >
            <Select
              value={form.parent_id}
              onChange={(event) => set('parent_id', event.target.value)}
            >
              <option value="">None — top level</option>
              {tree
                .filter((node) => !forbidden.has(node.id))
                .map((node) => (
                  <option key={node.id} value={node.id}>
                    {`${'— '.repeat(node.depth)}${node.name}`}
                  </option>
                ))}
            </Select>
          </Field>

          <Field label="Status" error={errors.status}>
            <Select
              value={form.status}
              onChange={(event) =>
                set('status', event.target.value as 'active' | 'inactive')
              }
            >
              <option value="active">Active — listed in the storefront</option>
              <option value="inactive">Inactive — hidden</option>
            </Select>
          </Field>
        </div>

        <Field
          label="Image path"
          error={errors.image}
          hint="A path under /uploads, e.g. /uploads/categories/sofas.svg"
        >
          <Input
            value={form.image}
            onChange={(event) => set('image', event.target.value)}
            maxLength={255}
            placeholder="/uploads/categories/sofas.svg"
          />
        </Field>

        {form.image.trim() ? (
          <img
            src={imageUrl(form.image.trim())}
            alt=""
            className="h-32 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-sunken)] object-cover"
          />
        ) : null}

        <Field label="Description" error={errors.description}>
          <Textarea
            rows={3}
            value={form.description}
            onChange={(event) => set('description', event.target.value)}
            maxLength={2000}
            placeholder="Deep, low-seated seating for living rooms."
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
