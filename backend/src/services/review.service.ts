import { query } from '../config/database';
import { ApiError } from '../utils/ApiError';
import type { RowDataPacket } from 'mysql2';
import { toCsv } from '../utils/csv';
import {
  countApprovedReviewsForProduct,
  createReview,
  deleteReview,
  findReviewById,
  listApprovedReviewsForProduct,
  listReviews,
  ratingBreakdown,
  reviewStats,
  updateReview,
  userReviewedProduct,
  type ReviewRecord,
} from '../models/review.model';
import { notifyStaff, createNotification } from '../models/notification.model';
import type { ListQuery, ReviewStatus } from '../types';

export interface ReviewFiltersInput extends ListQuery {
  status?: ReviewStatus;
  productId?: number;
  rating?: number;
}

export async function getReviews(filters: ReviewFiltersInput) {
  return listReviews(filters);
}

export async function getReview(id: number) {
  const review = await findReviewById(id);
  if (!review) throw ApiError.notFound('Review not found');
  return review;
}

/** Public storefront endpoint for a product's approved reviews. */
export async function getProductReviews(productId: number, page = 1, pageSize = 10) {
  const [reviews, total, breakdown] = await Promise.all([
    listApprovedReviewsForProduct(productId, pageSize, (page - 1) * pageSize),
    countApprovedReviewsForProduct(productId),
    ratingBreakdown(productId),
  ]);

  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
  return {
    data: reviews,
    meta: {
      page,
      pageSize,
      total,
      totalPages,
      from: total === 0 ? 0 : (page - 1) * pageSize + 1,
      to: total === 0 ? 0 : Math.min(page * pageSize, total),
    },
    breakdown,
  };
}

export async function createNewReview(
  data: { product_id: number; rating: number; title?: string; comment?: string },
  userId: number
) {
  const product = await query<RowDataPacket & { id: number; name: string }>(
    'SELECT id, name FROM products WHERE id = ? LIMIT 1',
    [data.product_id]
  );
  if (product.length === 0) throw ApiError.notFound('Product not found');

  if (await userReviewedProduct(userId, data.product_id)) {
    throw ApiError.conflict('You have already reviewed this product');
  }

  // Only customers who actually bought the product may review it.
  const purchased = await query(
    `SELECT oi.id
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = ? AND o.user_id = ? AND o.order_status = 'Delivered'
      LIMIT 1`,
    [data.product_id, userId]
  );
  if (purchased.length === 0) {
    throw ApiError.forbidden('Only customers who received this product can review it');
  }

  const id = await createReview({
    product_id: data.product_id,
    user_id: userId,
    rating: data.rating,
    title: data.title ?? null,
    comment: data.comment ?? null,
    status: 'pending',
  });

  await notifyStaff({
    title: 'New review awaiting moderation',
    message: `${product[0].name} has a new ${data.rating}★ review.`,
    type: 'info',
    link: '/admin/reviews',
  });

  return findReviewById(id);
}

export async function updateExistingReview(
  id: number,
  data: { rating?: number; title?: string; comment?: string; status?: ReviewStatus }
) {
  const review = await findReviewById(id);
  if (!review) throw ApiError.notFound('Review not found');

  const patch: Partial<ReviewRecord> = {};
  if (data.rating !== undefined) patch.rating = Number(data.rating);
  if (data.title !== undefined) patch.title = data.title === null ? null : String(data.title);
  if (data.comment !== undefined) patch.comment = data.comment === null ? null : String(data.comment);
  if (data.status !== undefined) patch.status = data.status as ReviewRecord['status'];

  await updateReview(id, patch);

  // Tell the author when a moderator acts on their review.
  if (data.status && data.status !== review.status) {
    await createNotification({
      user_id: review.user_id,
      title: 'Review updated',
      message: `Your review of "${review.product_name}" is now ${data.status}.`,
      type: data.status === 'approved' ? 'success' : 'warning',
      link: '/account',
    });
  }

  // Re-read so the response reflects the new status; fall back to the pre-update
  // row if the record vanished between the UPDATE and the re-read.
  const updated = await findReviewById(id);
  return updated ?? review;
}

export async function removeReview(id: number) {
  const review = await findReviewById(id);
  if (!review) throw ApiError.notFound('Review not found');
  await deleteReview(id);
  return true;
}

export async function getReviewStats() {
  return reviewStats();
}

export async function exportReviews(filters: ReviewFiltersInput, format: 'csv' | 'json') {
  const result = await listReviews({ ...filters, page: 1, pageSize: 10000 });

  if (format === 'json') {
    return {
      body: JSON.stringify(result.data, null, 2),
      mimeType: 'application/json',
      filename: `reviews-export-${Date.now()}.json`,
    };
  }

  const csv = toCsv(result.data, [
    { key: 'id', header: 'ID' },
    { key: 'product_name', header: 'Product' },
    { key: 'user_name', header: 'Customer' },
    { key: 'user_email', header: 'Email' },
    { key: 'rating', header: 'Rating' },
    { key: 'title', header: 'Title' },
    { key: 'comment', header: 'Comment' },
    { key: 'status', header: 'Status' },
    { key: 'created_at', header: 'Date' },
  ]);
  return { body: csv, mimeType: 'text/csv; charset=utf-8', filename: `reviews-export-${Date.now()}.csv` };
}
