import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok, paginated } from '../utils/ApiResponse';
import { parseListQuery } from '../utils/pagination';
import { ApiError } from '../utils/ApiError';
import {
  changeCategory,
  createBackup,
  getFile,
  getFileStats,
  getFiles,
  listBackups,
  removeStoredFile,
  storeUpload,
  storeUploads,
} from '../services/file.service';
import type { FileCategory } from '../types';

function pickCategory(value: unknown): FileCategory | undefined {
  const allowed: FileCategory[] = ['image', 'document', 'contract', 'invoice', 'customer', 'other'];
  const found = allowed.find((item) => item === value);
  return found;
}

export const listFilesHandler = asyncHandler(async (req: Request, res: Response) => {
  return paginated(res, await getFiles(parseListQuery(req)));
});

export const fileStatsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await getFileStats());
});

export const getFileHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getFile(Number(req.params.id)));
});

export const uploadFilesHandler = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const single = req.file as Express.Multer.File | undefined;
  if (files.length === 0 && !single) throw ApiError.badRequest('No file was uploaded');

  const category = pickCategory(req.body?.category) ?? 'other';
  const stored = await storeUploads(files.length ? files : [single!], category, req.user!.id);
  return created(res, stored, 'Upload complete');
});

export const uploadSingleHandler = asyncHandler(async (req: Request, res: Response) => {
  const category = pickCategory(req.body?.category) ?? 'image';
  const stored = await storeUpload(req.file as Express.Multer.File, category, req.user!.id);
  return created(res, stored, 'Upload complete');
});

export const moveFileHandler = asyncHandler(async (req: Request, res: Response) => {
  const category = pickCategory((req.body as { category?: string }).category);
  if (!category) throw ApiError.badRequest('Unknown file category');
  return ok(res, await changeCategory(Number(req.params.id), category), 'File moved');
});

export const deleteFileHandler = asyncHandler(async (req: Request, res: Response) => {
  await removeStoredFile(Number(req.params.id));
  return noContent(res);
});

export const backupHandler = asyncHandler(async (_req: Request, res: Response) => {
  return created(res, await createBackup(), 'Database backup created');
});

export const listBackupsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, listBackups());
});
