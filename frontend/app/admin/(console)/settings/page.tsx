'use client';

/**
 * Settings module.
 *
 * `GET /settings/grouped` returns every setting bucketed by its `group` column,
 * and `PUT /settings/bulk` takes a key→value map and applies it in one
 * transaction. So this screen is one tab per group, each an independent form
 * that saves only its own keys — a half-filled payment tab cannot clobber the
 * store's address.
 *
 * Field types are inferred from the current value rather than hard-coded per
 * key: a setting that holds `true`/`false` becomes a switch, one that holds a
 * number becomes a numeric input, and anything long becomes a textarea. Adding
 * a setting to the seed needs no frontend change.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/Card';
import { Field, Input, Switch, Textarea } from '@/components/ui/Field';
import { Tabs } from '@/components/ui/Tabs';
import { api } from '@/lib/api';
import { alertError, alertSuccess } from '@/lib/alerts';
import type { GroupedSettings, Setting } from '@/types';

/** Human label for a group id, falling back to the id itself. */
const GROUP_LABELS: Record<string, string> = {
  general: 'Store & commerce',
  payment: 'Payment gateways',
  email: 'Email (SMTP)',
  sms: 'SMS',
  localization: 'Localisation',
  appearance: 'Appearance',
  backup: 'Backups',
};

/** Keys whose value is a number in the seed but must stay free text. */
const TEXT_NUMBER_KEYS = new Set(['bank_account_number', 'support_phone', 'smtp_port']);

type Draft = Record<string, string>;

export default function SettingsPage() {
  const [data, setData] = useState<GroupedSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('');
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api.get<GroupedSettings>('/settings/grouped'));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(() => data?.groups ?? [], [data]);

  useEffect(() => {
    if (!active && groups.length > 0) setActive(groups[0].group);
  }, [active, groups]);

  const draft = useMemo(() => (active ? (drafts[active] ?? {}) : {}), [active, drafts]);
  const original = useMemo(
    () => (active ? (data?.grouped[active] ?? []) : []),
    [active, data]
  );

  const dirty = useMemo(
    () =>
      original.some(
        (setting) => (draft[setting.key] ?? setting.value ?? '') !== (setting.value ?? '')
      ),
    [draft, original]
  );

  const setDraft = (key: string, value: string) => {
    if (!active) return;
    setDrafts((current) => ({
      ...current,
      [active]: { ...(current[active] ?? {}), [key]: value },
    }));
  };

  const save = async () => {
    if (!active) return;
    const updates: Draft = {};
    for (const setting of original) {
      const value = draft[setting.key] ?? setting.value ?? '';
      if (value !== (setting.value ?? '')) updates[setting.key] = value;
    }
    if (Object.keys(updates).length === 0) return;

    setSaving(active);
    try {
      await api.put('/settings/bulk', updates);
      await alertSuccess('Settings saved', `${Object.keys(updates).length} setting${Object.keys(updates).length === 1 ? '' : 's'} updated.`);
      // Drop the draft so the "unsaved changes" hint clears, then reload to
      // pick up anything the server normalised.
      setDrafts((current) => {
        const { [active]: _cleared, ...rest } = current;
        return rest;
      });
      await load();
    } catch (cause) {
      alertError('Could not save the settings', describe(cause));
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Settings" description="Store identity, commerce rules, gateways and backups." />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="surface-card h-24 animate-pulse" />
          ))}
        </div>
        <div className="surface-card h-96 animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardBody>
          <p className="py-16 text-center text-sm text-muted">{error ?? 'Settings unavailable.'}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Store identity, commerce rules, gateways and backups. Each tab saves on its own."
        actions={
          <Button
            leftIcon={<Save className="size-4" />}
            loading={saving === active}
            disabled={!dirty || !active}
            onClick={() => void save()}
          >
            {dirty ? 'Save changes' : 'Saved'}
          </Button>
        }
      />

      <Tabs
        tabs={groups.map((group) => ({
          id: group.group,
          label: GROUP_LABELS[group.group] ?? group.group,
        }))}
        active={active}
        onChange={setActive}
      />

      {active ? (
        <Card>
          <CardHeader
            title={GROUP_LABELS[active] ?? active}
            description={groupHint(active)}
            action={
              dirty ? (
                <span className="rounded-md bg-amber-100 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                  Unsaved
                </span>
              ) : undefined
            }
          />
          <CardBody>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              {original.map((setting) => (
                <SettingField
                  key={setting.id}
                  setting={setting}
                  value={draft[setting.key] ?? setting.value ?? ''}
                  onChange={(value) => setDraft(setting.key, value)}
                />
              ))}
            </div>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

/** One setting, rendered as the control its value calls for. */
function SettingField({
  setting,
  value,
  onChange,
}: {
  setting: Setting;
  value: string;
  onChange: (value: string) => void;
}) {
  const isBoolean = value === 'true' || value === 'false';
  const isNumber =
    !TEXT_NUMBER_KEYS.has(setting.key) &&
    value.trim() !== '' &&
    Number.isFinite(Number(value)) &&
    !/[a-zA-Z]/.test(value);
  const isLong = value.length > 80 || /description|details|address|hours/i.test(setting.key);
  const isSecret = /password|secret|api_key|token/i.test(setting.key);

  const key = setting.key;
  const label = labelFor(key);
  const hint = hintFor(key);

  if (isBoolean) {
    return (
      <Switch
        checked={value === 'true'}
        onChange={(checked) => onChange(checked ? 'true' : 'false')}
        label={label}
        description={setting.key}
      />
    );
  }

  if (isLong) {
    return (
      <Field label={label} hint={hint} className="lg:col-span-2">
        <Textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
      </Field>
    );
  }

  if (isNumber) {
    return (
      <Field label={label} hint={hint}>
        <Input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </Field>
    );
  }

  if (isSecret) {
    return (
      <Field label={label} hint={hint ?? 'Stored encrypted at rest.'}>
        <Input
          type="password"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
          placeholder={value ? '••••••••' : 'Not set'}
        />
      </Field>
    );
  }

  if (key === 'last_backup_at') {
    return (
      <Field label={label} hint="Written by the backup job; not editable.">
        <Input value={value || 'Never run'} disabled />
      </Field>
    );
  }

  return (
    <Field label={label} hint={hint}>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </Field>
  );
}

/** `free_shipping_threshold` → "Free shipping threshold". */
function labelFor(key: string): string {
  return key
    .split('_')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

function hintFor(key: string): string | undefined {
  if (key === 'tax_rate') return 'A whole percentage, applied to the subtotal.';
  if (key === 'shipping_fee') return 'Flat fee added below the free-shipping threshold.';
  if (key === 'free_shipping_threshold') return 'Orders at or above this ship free.';
  if (key === 'payment_methods_enabled') return 'Comma-separated: cod, bank_transfer, stripe, paypal.';
  if (key === 'theme_mode_default') return 'system, light or dark.';
  if (key === 'backup_frequency') return 'daily, weekly or monthly.';
  if (key === 'last_backup_at') return 'Written by the backup job; not editable.';
  return undefined;
}

function groupHint(group: string): string {
  switch (group) {
    case 'general':
      return 'What the storefront is called, what it charges and how it formats money.';
    case 'payment':
      return 'Gateway credentials and which checkout options are offered.';
    case 'email':
      return 'Outbound mail for order confirmations, status updates and password resets.';
    case 'sms':
      return 'Optional text-message notifications for orders.';
    case 'localization':
      return 'Language, timezone and how dates and numbers are written.';
    case 'appearance':
      return 'Theme defaults. The accent colour is the brand tone used across the storefront.';
    case 'backup':
      return 'How often a SQL dump is written and how long it is kept.';
    default:
      return '';
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
