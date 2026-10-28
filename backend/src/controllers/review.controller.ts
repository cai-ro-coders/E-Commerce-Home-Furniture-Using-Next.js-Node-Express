import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok, paginated } from '../utils/ApiResponse';
import { parseListQuery } from '../utils/pagination';
import { ApiError } from '../utils/ApiError';
import {
  createNewReview,
  exportReviews,
  getProductReviews,
  getReview,
  getReviewStats,
  getReviews,
  removeReview,
  updateExistingReview,
  type ReviewFiltersInput,
} from '../services/review.service';
import type { ReviewStatus } from '../types';

function reviewFilters(req: Request): ReviewFiltersInput {
  const list = parseListQuery(req);
  const q = req.query as Record<string, string | undefined>;
  const num = (key: string): number | undefined =>
    q[key] === undefined || q[key] === '' ? undefined : Number(q[key]);

  return {
    ...list,
    status: (q.status as ReviewStatus | undefined) || undefined,
    productId: num('product_id'),
    rating: num('rating'),
  };
}

export const listReviewsHandler = asyncHandler(async (req: Request, res: Response) => {
  return paginated(res, await getReviews(reviewFilters(req)));
});

export const reviewStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await getReviewStats());
});

export const getReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getReview(Number(req.params.id)));
});

export const productReviewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 10)));
  return paginated(res, await getProductReviews(Number(req.params.id), page, pageSize));
});

export const createReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  const record = await createNewReview(req.body, req.user!.id);
  return created(res, { id: record!.id }, 'Thanks for your review — it is awaiting moderation.');
});

export const updateReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  const review = await updateExistingReview(Number(req.params.id), req.body);
  return ok(res, review, 'Review updated');
});

/** Approve/reject is a moderation action, so the status-only route is separate. */
export const moderateReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  const status = (req.body as { status: ReviewStatus }).status;
  const review = await updateExistingReview(Number(req.params.id), { status });
  return ok(res, review, `Review marked as ${review.status}`);
});

export const deleteReviewHandler = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (req.user!.role === 'customer') {
    const review = await getReview(id);
    if (!review || review.user_id !== req.user!.id) {
      throw ApiError.forbidden('You can only delete your own review');
    }
  }
  await removeReview(id);
  return noContent(res);
});

export const exportReviewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const format = req.query.format === 'json' ? 'json' : 'csv';
  const file = await exportReviews(reviewFilters(req), format);
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  return res.send(file.body);
});
