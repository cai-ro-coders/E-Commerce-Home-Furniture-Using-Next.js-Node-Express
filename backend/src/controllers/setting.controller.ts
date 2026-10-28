import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { created, noContent, ok, paginated } from '../utils/ApiResponse';
import { parseListQuery } from '../utils/pagination';
import {
  createNewSetting,
  exportSettings,
  getGroupedSettings,
  getPublicSettings,
  getSetting,
  getSettings,
  removeSetting,
  saveSettingUpdates,
  updateExistingSetting,
} from '../services/setting.service';

export const listSettingsHandler = asyncHandler(async (req: Request, res: Response) => {
  return paginated(res, await getSettings(parseListQuery(req)));
});

export const groupedSettingsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await getGroupedSettings());
});

export const publicSettingsHandler = asyncHandler(async (_req: Request, res: Response) => {
  return ok(res, await getPublicSettings());
});

export const getSettingHandler = asyncHandler(async (req: Request, res: Response) => {
  return ok(res, await getSetting(Number(req.params.id)));
});

export const createSettingHandler = asyncHandler(async (req: Request, res: Response) => {
  const record = await createNewSetting(req.body);
  return created(res, { id: record!.id }, 'Setting saved');
});

/**
 * Bulk save from the admin Settings form.
 *
 * The settings page renders one group at a time and posts what changed, so it
 * sends the compact `{ key: value }` shape. The Settings CRUD table posts
 * explicit `[{ id, value }]` rows. Both are accepted here rather than forcing
 * the two screens to agree on a wire format they have no reason to share.
 */
export const bulkUpdateSettingsHandler = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as unknown;

  // The grouped form posts the map itself (`{ stripe_secret_key: 'sk_…' }`),
  // while older/other callers wrap it in `{ settings: … }`. Accept both, plus
  // the CRUD table's explicit `[{ id, value }]` rows.
  const payload = (
    body && typeof body === 'object' && !Array.isArray(body) && 'settings' in body
      ? (body as { settings: unknown }).settings
      : body
  ) as Array<{ id?: number; key?: string; value: unknown }> | Record<string, unknown> | undefined;

  const updates: Array<{ id?: number; key?: string; value: string }> = Array.isArray(payload)
    ? payload.map((row) => ({ id: Number(row.id), key: row.key, value: String(row.value ?? '') }))
    : payload && typeof payload === 'object'
      ? Object.entries(payload).map(([key, value]) => ({ key, value: String(value ?? '') }))
      : [];

  const saved = await saveSettingUpdates(updates);
  return ok(res, { updated: saved.length, keys: saved }, 'Settings saved');
});

export const updateSettingHandler = asyncHandler(async (req: Request, res: Response) => {
  const setting = await updateExistingSetting(Number(req.params.id), req.body);
  return ok(res, setting, 'Setting updated');
});

export const deleteSettingHandler = asyncHandler(async (req: Request, res: Response) => {
  await removeSetting(Number(req.params.id));
  return noContent(res);
});

export const exportSettingsHandler = asyncHandler(async (req: Request, res: Response) => {
  const format = req.query.format === 'json' ? 'json' : 'csv';
  const file = await exportSettings(parseListQuery(req), format);
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  return res.send(file.body);
});
