import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok, paginated } from '../utils/ApiResponse';
import { parseListQuery } from '../utils/pagination';
import {
  createNewCategory,
  exportCategories,
  getCategories,
  getCategory,
  getCategoryTree,
  removeCategory,
  updateExistingCategory,
} from '../services/category.service';

export const listCategoriesHandler = asyncHandler(async (req: Request, res: Response) => {
  return paginated(res, await getCategories(parseListQuery(req)));
});

export const categoryTreeHandler = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await getCategoryTree());
});

export const getCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getCategory(Number(req.params.id)));
});

export const createCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const record = await createNewCategory(req.body);
  return created(res, { id: record!.id }, 'Category created successfully');
});

export const updateCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const category = await updateExistingCategory(Number(req.params.id), req.body);
  return ok(res, category, 'Category updated successfully');
});

export const deleteCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  await removeCategory(Number(req.params.id));
  return noContent(res);
});

export const exportCategoriesHandler = asyncHandler(async (req: Request, res: Response) => {
  const format = req.query.format === 'json' ? 'json' : 'csv';
  const file = await exportCategories(parseListQuery(req), format);
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  return res.send(file.body);
});
