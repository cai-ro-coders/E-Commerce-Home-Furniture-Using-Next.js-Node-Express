import { Router } from 'express';
import { validate } from '../utils/asyncHandler';
import { authenticate, optionalAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/rbac';
import {
  bulkUpdateSettingsHandler,
  createSettingHandler,
  deleteSettingHandler,
  exportSettingsHandler,
  getSettingHandler,
  groupedSettingsHandler,
  listSettingsHandler,
  publicSettingsHandler,
  updateSettingHandler,
} from '../controllers/setting.controller';
import { settingListQuerySchema } from '../validators/catalog.validator';
import { idParamSchema, upsertSettingSchema } from '../validators/common.validator';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/ApiResponse';
import { settingsMap } from '../models/setting.model';

const router = Router();

/** Public, and deliberately narrow: the storefront needs these to render. */
router.get('/public', optionalAuth, publicSettingsHandler);
router.get(
  '/public/all',
  optionalAuth,
  asyncHandler(async (_req, res) => {
    const all = await settingsMap();
    const allow = [
      'site_name',
      'site_logo',
      'site_description',
      'currency',
      'tax_rate',
      'shipping_fee',
      'support_email',
      'support_phone',
      'address',
    ];
    return ok(res, Object.fromEntries(allow.map((key) => [key, all[key] ?? ''])));
  })
);

router.use(authenticate, requireAdmin);

router.get('/', validate(settingListQuerySchema, 'query'), listSettingsHandler);
router.get('/grouped', groupedSettingsHandler);
router.get('/export', exportSettingsHandler);
router.get('/:id', validate(idParamSchema, 'params'), getSettingHandler);

router.post('/', validate(upsertSettingSchema), createSettingHandler);
router.put('/bulk', bulkUpdateSettingsHandler);
router.put('/:id', validate(idParamSchema, 'params'), updateSettingHandler);
router.delete('/:id', validate(idParamSchema, 'params'), deleteSettingHandler);

export default router;
