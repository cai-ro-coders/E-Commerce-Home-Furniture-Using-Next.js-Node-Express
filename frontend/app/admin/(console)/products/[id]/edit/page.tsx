'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { Card, CardBody, PageHeader } from '@/components/ui/Card';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { api } from '@/lib/api';
import { alertSuccess } from '@/lib/alerts';
import type { Product, ProductFormOptions, ProductImage, ProductSpecification } from '@/types';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const search = useSearchParams();
  const wasCreated = search.get('created') === '1';

  const [product, setProduct] = useState<Product | null>(null);
  const [options, setOptions] = useState<ProductFormOptions | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [specs, setSpecs] = useState<ProductSpecification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wasCreated) {
      void alertSuccess(
        'Product created',
        'Add photos and specifications, then publish when it is ready.'
      );
      // Drop the flag so a refresh does not greet the user twice.
      router.replace(`/admin/products/${id}/edit`);
    }
  }, [wasCreated, id, router]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [record, formOptions, gallery, specifications] = await Promise.all([
          api.get<Product>(`/products/${id}`),
          api.get<ProductFormOptions>('/products/form-options'),
          api.get<ProductImage[]>(`/products/${id}/images`),
          api.get<ProductSpecification[]>(`/products/${id}/specifications`),
        ]);
        if (cancelled) return;
        setProduct(record);
        setOptions(formOptions);
        setImages(gallery);
        setSpecs(specifications);
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'Could not load the product');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <PageSpinner label="Loading product…" />;

  if (error || !product || !options) {
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={product.name}
        description={`Editing SKU ${product.sku}. Changes go live as soon as you save.`}
        actions={
          <Link
            href={`/admin/products/${product.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back to product
          </Link>
        }
      />
      <ProductForm
        product={product}
        options={options}
        images={images}
        specifications={specs}
      />
    </div>
  );
}
