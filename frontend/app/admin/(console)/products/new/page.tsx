'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { Card, CardBody, PageHeader } from '@/components/ui/Card';
import { ErrorState, PageSpinner } from '@/components/ui/Feedback';
import { api } from '@/lib/api';
import type { ProductFormOptions } from '@/types';

export default function NewProductPage() {
  const [options, setOptions] = useState<ProductFormOptions | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<ProductFormOptions>('/products/form-options')
      .then(setOptions)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Could not load the catalogue')
      );
  }, []);

  if (error) {
    return (
      <Card>
        <CardBody>
          <ErrorState
            title="The form could not load"
            description={error}
            onRetry={() => window.location.reload()}
          />
        </CardBody>
      </Card>
    );
  }

  if (!options) return <PageSpinner label="Loading catalogue options…" />;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New product"
        description="Add an item to the catalogue. Photography and specifications follow on the edit screen."
        actions={
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back to products
          </Link>
        }
      />
      <ProductForm options={options} />
    </div>
  );
}
