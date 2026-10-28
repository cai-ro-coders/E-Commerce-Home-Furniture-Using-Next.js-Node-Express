import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok, paginated } from '../utils/ApiResponse';
import { parseListQuery } from '../utils/pagination';
import {
  createNewBrand,
  exportBrands,
  forceRemoveBrand,
  getAllBrands,
  getBrand,
  getBrands,
  removeBrand,
  updateExistingBrand,
} from '../services/brand.service';

export const listBrandsHandler = asyncHandler(async (req: Request, res: Response) => {
  return paginated(res, await getBrands(parseListQuery(req)));
});

export const allBrandsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await getAllBrands());
});

export const getBrandHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getBrand(Number(req.params.id)));
});

export const createBrandHandler = asyncHandler(async (req: Request, res: Response) => {
  const record = await createNewBrand(req.body);
  return created(res, { id: record!.id }, 'Brand created successfully');
});

export const updateBrandHandler = asyncHandler(async (req: Request, res: Response) => {
  const brand = await updateExistingBrand(Number(req.params.id), req.body);
  return ok(res, brand, 'Brand updated successfully');
});

export const deleteBrandHandler = asyncHandler(async (req: Request, res: Response) => {
  await removeBrand(Number(req.params.id));
  return noContent(res);
});

/** Last resort when a brand still has products attached after reassignment. */
export const forceDeleteBrandHandler = asyncHandler(async (req: Request, res: Response) => {
  await forceRemoveBrand(Number(req.params.id));
  return noContent(res);
});

export const exportBrandsHandler = asyncHandler(async (req: Request, res: Response) => {
  const format = req.query.format === 'json' ? 'json' : 'csv';
  const file = await exportBrands(parseListQuery(req), format);
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  return res.send(file.body);
});
