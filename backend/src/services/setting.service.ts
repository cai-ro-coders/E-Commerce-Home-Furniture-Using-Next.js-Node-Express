import { ApiError } from '../utils/ApiError';
import { toCsv } from '../utils/csv';
import { transaction } from '../config/database';
import {
  createSetting,
  deleteSetting,
  findSettingById,
  keyExists,
  listGroups,
  listSettings,
  settingsByGroup,
  settingsMap,
  updateSetting,
  type SettingRecord,
} from '../models/setting.model';
import type { ListQuery } from '../types';

export async function getSettings(list: ListQuery) {
  return listSettings(list);
}

export async function getGroupedSettings() {
  const [grouped, groups] = await Promise.all([settingsByGroup(), listGroups()]);
  return { grouped, groups };
}

export async function getPublicSettings() {
  const map = await settingsMap();
  // Only expose settings that are safe for anonymous visitors.
  const safe = [
    'site_name',
    'site_logo',
    'support_email',
    'support_phone',
    'currency',
    'tax_rate',
    'shipping_fee',
    'address',
    'social_facebook',
    'social_instagram',
    'social_twitter',
  ];
  return Object.fromEntries(safe.map((key) => [key, map[key] ?? '']));
}

export async function getSetting(id: number) {
  const setting = await findSettingById(id);
  if (!setting) throw ApiError.notFound('Setting not found');
  return setting;
}

export async function createNewSetting(data: { key: string; group: string; value: string }) {
  const key = data.key.toLowerCase();
  if (await keyExists(key)) throw ApiError.conflict('A setting with that key already exists');
  const id = await createSetting({ key, group: data.group || 'general', value: data.value });
  return findSettingById(id);
}

export async function updateExistingSetting(
  id: number,
  data: { key?: string; group?: string; value?: string }
) {
  const existing = await findSettingById(id);
  if (!existing) throw ApiError.notFound('Setting not found');

  const patch: Partial<Pick<SettingRecord, 'key' | 'group' | 'value'>> = {};
  if (data.key !== undefined) {
    const key = data.key.toLowerCase();
    if (key !== existing.key && (await keyExists(key, id))) {
      throw ApiError.conflict('A setting with that key already exists');
    }
    patch.key = key;
  }
  if (data.group !== undefined) patch.group = data.group;
  if (data.value !== undefined) patch.value = data.value;

  await updateSetting(id, patch);
  return findSettingById(id);
}

export async function removeSetting(id: number) {
  const existing = await findSettingById(id);
  if (!existing) throw ApiError.notFound('Setting not found');
  await deleteSetting(id);
  return true;
}

/**
 * Save a batch of setting values, addressed either by `id` (the Settings CRUD
 * table) or by `key` (the grouped Settings forms).
 *
 * Every write is validated first so a bad key midway through cannot leave the
 * form half-saved. Unknown `id`s and unknown `key`s are reported instead of
 * being silently dropped.
 */
export async function saveSettingUpdates(
  updates: Array<{ id?: number; key?: string; value: string }>
): Promise<string[]> {
  if (updates.length === 0) throw ApiError.badRequest('No settings were supplied');

  const all = await settingsMap();
  const byKey = new Map(Object.entries(all));

  // Resolve everything to a key up front.
  const resolved: Array<{ key: string; value: string }> = [];
  for (const update of updates) {
    let key = update.key ? update.key.toLowerCase() : undefined;
    if (!key && update.id) {
      const record = await findSettingById(Number(update.id));
      if (!record) throw ApiError.notFound(`Setting ${update.id} not found`);
      key = record.key;
    }
    if (!key) throw ApiError.badRequest('Each setting update needs an id or a key');
    if (!byKey.has(key)) throw ApiError.notFound(`Unknown setting "${key}"`);
    resolved.push({ key, value: update.value });
  }

  // Apply in one transaction so a failure rolls the whole form back.
  await transaction(async (connection) => {
    for (const { key, value } of resolved) {
      await connection.execute('UPDATE settings SET value = ? WHERE `key` = ?', [value, key]);
    }
  });

  return resolved.map((entry) => entry.key);
}

export async function exportSettings(list: ListQuery, format: 'csv' | 'json') {
  const result = await listSettings({ ...list, page: 1, pageSize: 10000 });

  if (format === 'json') {
    return {
      body: JSON.stringify(result.data, null, 2),
      mimeType: 'application/json',
      filename: `settings-export-${Date.now()}.json`,
    };
  }

  const csv = toCsv(result.data, [
    { key: 'id', header: 'ID' },
    { key: 'key', header: 'Key' },
    { key: 'group', header: 'Group' },
    { key: 'value', header: 'Value' },
    { key: 'updated_at', header: 'Updated At' },
  ]);
  return { body: csv, mimeType: 'text/csv; charset=utf-8', filename: `settings-export-${Date.now()}.csv` };
}
