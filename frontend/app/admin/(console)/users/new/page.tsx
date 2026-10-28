'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { UserForm } from '@/components/admin/users/UserForm';
import { PageHeader } from '@/components/ui/Card';

export default function NewUserPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New account"
        description="Create a staff or customer account. They can sign in as soon as you save."
        actions={
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-sand-600 transition-colors hover:text-clay-700 dark:text-sand-300"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back to users
          </Link>
        }
      />
      <UserForm />
    </div>
  );
}
