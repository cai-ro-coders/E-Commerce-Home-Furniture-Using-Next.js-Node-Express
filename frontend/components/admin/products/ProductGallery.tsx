'use client';

/**
 * Product photography.
 *
 * Uploading is a two-step affair on the server: files are POSTed to
 * `/products/:id/images` as multipart, which stores them and creates the
 * `product_images` rows in one go, and the response carries the refreshed list.
 * Setting the cover and deleting a shot are separate, cheaper endpoints.
 */
import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/Feedback';
import { api, imageUrl } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import { cn } from '@/lib/cn';
import type { ProductImage } from '@/types';

interface ProductGalleryProps {
  productId: number;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export function ProductGallery({ productId, images, onChange }: ProductGalleryProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((file) => form.append('image', file));
      // With no images yet, the first upload is the cover.
      if (images.length === 0) form.append('is_primary', 'true');

      // The endpoint answers with the refreshed gallery, so no refetch is needed.
      const updated = await api.upload<ProductImage[]>(`/products/${productId}/images`, form);
      onChange(updated);
      toastSuccess(`${files.length} image${files.length === 1 ? '' : 's'} uploaded`);
    } catch (error) {
      alertError(
        'Upload failed',
        error instanceof Error ? error.message : 'The images could not be saved.'
      );
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const makePrimary = async (image: ProductImage) => {
    setBusy(true);
    try {
      onChange(await api.patch<ProductImage[]>(`/products/${productId}/images/${image.id}/primary`));
      toastSuccess('Cover image updated');
    } catch (error) {
      alertError('Could not update the cover', message(error));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (image: ProductImage) => {
    const confirmed = await confirmAction({
      title: 'Remove this image?',
      text: 'The file is unlinked from the product.',
      confirmText: 'Remove',
    });
    if (!confirmed) return;

    setBusy(true);
    try {
      const remaining = await api.delete<ProductImage[]>(`/products/${productId}/images/${image.id}`);
      onChange(Array.isArray(remaining) ? remaining : images.filter((item) => item.id !== image.id));
      toastSuccess('Image removed');
    } catch (error) {
      alertError('Could not remove the image', message(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload(event.dataTransfer.files);
        }}
        className={cn(
          'rounded-xl border-2 border-dashed p-5 text-center transition-colors',
          dragging
            ? 'border-clay-500 bg-clay-50 dark:bg-clay-950/40'
            : 'border-sand-300 dark:border-walnut-800'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => void upload(event.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          {busy ? (
            <Loader2 className="size-6 animate-spin text-clay-600" aria-hidden />
          ) : (
            <ImagePlus className="size-6 text-sand-400" aria-hidden />
          )}
          <p className="text-sm font-medium text-sand-700 dark:text-sand-200">
            {busy ? 'Uploading…' : 'Drop images here, or browse'}
          </p>
          <p className="text-xs text-muted">PNG, JPG, WebP or SVG. The first one becomes the cover.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            Choose files
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <EmptyState
          title="No photography yet"
          description="Products with a cover image convert noticeably better in the storefront grid."
          className="py-8"
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <li
              key={image.id}
              className={cn(
                'group relative overflow-hidden rounded-xl border bg-[var(--surface-sunken)]',
                image.is_primary
                  ? 'border-clay-500 ring-1 ring-clay-500/40'
                  : 'border-[var(--border-subtle)]'
              )}
            >
              {/* Uploaded images are SVG placeholders; see `next.config.ts`. */}
              <img
                src={imageUrl(image.image)}
                alt=""
                className="aspect-square w-full object-cover"
              />
              {image.is_primary ? (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-clay-600 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                  <Star className="size-3" aria-hidden />
                  Cover
                </span>
              ) : null}
              <div className="flex items-center justify-between gap-1 border-t border-[var(--border-subtle)] bg-[var(--surface-raised)] px-2 py-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy || Boolean(image.is_primary)}
                  onClick={() => void makePrimary(image)}
                >
                  Make cover
                </Button>
                <button
                  type="button"
                  disabled={busy}
                  aria-label="Remove image"
                  onClick={() => void remove(image)}
                  className="rounded p-1 text-sand-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:hover:bg-rose-500/10"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
