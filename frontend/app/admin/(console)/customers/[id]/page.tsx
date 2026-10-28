'use client';

/**
 * Customer detail.
 *
 * A thin wrapper over the account page: the Customers module reads the same
 * record from `GET /api/customers/:id`, which 404s for a non-customer. Rather
 * than duplicate the layout, this reuses it with the customer framing so links
 * and actions keep pointing at the right module.
 */
import { use } from 'react';
import UserDetailPage from '@/app/admin/(console)/users/[id]/page';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <UserDetailPage params={Promise.resolve({ id })} searchParams={Promise.resolve({ as: 'customer' })} />;
}
