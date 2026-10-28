'use client';

/**
 * Notifications module — the staff inbox.
 *
 * `/notifications/staff/all` ignores `orderBy`/`orderDir` and always returns the
 * newest first, so every column here is deliberately non-sortable: offering a
 * sort affordance that silently does nothing is worse than not offering one.
 *
 * Reading is per-notification (`PATCH /notifications/:id/read`) plus a
 * read-all, and deleting a staff inbox row uses `/notifications/staff/:id`,
 * which is not scoped to the signed-in user.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CheckCheck, Info, Megaphone, ShieldAlert, TriangleAlert } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { StatsStrip, type StatsStripItem } from '@/components/admin/StatsStrip';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/Card';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import { formatDateTime, formatNumber, timeAgo } from '@/lib/format';
import { ACTIONS_COLUMN, attr, text, type CellAction } from '@/lib/tableHtml';
import type { Notification, NotificationFeed } from '@/types';

const TYPE_META = {
  info: { icon: Info, dot: 'bg-sky-500', label: 'Info' },
  success: { icon: Check, dot: 'bg-emerald-500', label: 'Success' },
  warning: { icon: TriangleAlert, dot: 'bg-amber-500', label: 'Warning' },
  error: { icon: ShieldAlert, dot: 'bg-rose-500', label: 'Error' },
} as const;

type NoticeType = keyof typeof TYPE_META;

export default function NotificationsPage() {
  const router = useRouter();
  const [reloadToken, setReloadToken] = useState(0);
  const [unread, setUnread] = useState<number | null>(null);
  const [composing, setComposing] = useState(false);

  const loadUnread = useCallback(async () => {
    try {
      const feed = await api.get<NotificationFeed>('/notifications');
      setUnread(feed.unread_count);
    } catch {
      setUnread(null);
    }
  }, []);

  useEffect(() => {
    void loadUnread();
  }, [loadUnread]);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
    void loadUnread();
  }, [loadUnread]);

  const markRead = useCallback(
    async (row: Notification) => {
      try {
        await api.patch(`/notifications/${row.id}/read`);
        toastSuccess('Marked as read');
        refresh();
      } catch (error) {
        alertError('Could not mark the notification as read', describe(error));
      }
    },
    [refresh]
  );

  const readAll = useCallback(async () => {
    const confirmed = await confirmAction({
      title: 'Mark every notification as read?',
      text: 'Your own unread count goes to zero and the staff inbox stops showing the unread dot.',
      confirmText: 'Mark all read',
    });
    if (!confirmed) return;
    try {
      await api.patch('/notifications/read-all');
      toastSuccess('All notifications marked as read');
      refresh();
    } catch (error) {
      alertError('Could not mark everything as read', describe(error));
    }
  }, [refresh]);

  const remove = useCallback(
    async (row: Notification) => {
      const confirmed = await confirmAction({
        title: 'Delete this notification?',
        text: 'It is removed from the staff inbox for everyone.',
        confirmText: 'Delete notification',
        danger: true,
      });
      if (!confirmed) return;
      try {
        await api.delete(`/notifications/staff/${row.id}`);
        toastSuccess('Notification deleted');
        refresh();
      } catch (error) {
        alertError('Could not delete the notification', describe(error));
      }
    },
    [refresh]
  );

  const columns: DataTableColumn<Notification>[] = useMemo(
    () => [
      {
        data: 'title',
        title: 'Notification',
        sortable: false,
        render: (row) => {
          const meta = TYPE_META[row.type] ?? TYPE_META.info;
          const link = row.link;
          const body = `<p class="truncate text-sm font-medium text-sand-900 dark:text-sand-100">${text(row.title)}</p>` +
            `<p class="line-clamp-2 text-xs text-muted">${text(row.message)}</p>`;
          return (
            '<div class="flex items-start gap-2.5">' +
            `<span class="mt-1.5 size-2 shrink-0 rounded-full ${meta.dot}" aria-hidden></span>` +
            (link
              ? `<a href="${attr(link)}" class="min-w-0 flex-1 hover:underline">${body}</a>`
              : `<div class="min-w-0 flex-1">${body}</div>`) +
            '</div>'
          );
        },
        exportValue: (row) => `${row.title} — ${row.message}`,
      },
      {
        data: 'type',
        title: 'Type',
        sortable: false,
        render: (row) => {
          const meta = TYPE_META[row.type] ?? TYPE_META.info;
          return (
            '<span class="inline-flex items-center gap-1.5 text-xs font-medium">' +
            `<span class="size-1.5 rounded-full ${meta.dot}" aria-hidden></span>${text(meta.label)}</span>`
          );
        },
        exportValue: (row) => row.type,
      },
      {
        data: 'recipient',
        title: 'Sent to',
        sortable: false,
        render: (row) =>
          row.recipient
            ? `<span class="text-xs">${text(row.recipient)}</span>`
            : '<span class="text-xs text-muted">All staff</span>',
        exportValue: (row) => row.recipient ?? 'All staff',
      },
      {
        data: 'read_at',
        title: 'State',
        sortable: false,
        render: (row) =>
          row.read_at
            ? `<span class="text-xs text-muted">Read ${text(timeAgo(row.read_at))}</span>`
            : '<span class="rounded-md bg-clay-100 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-clay-700 dark:bg-clay-500/15 dark:text-clay-300">Unread</span>',
        exportValue: (row) => (row.read_at ? 'read' : 'unread'),
      },
      {
        data: 'created_at',
        title: 'Sent',
        sortable: false,
        render: (row) =>
          `<span class="text-xs text-muted" title="${attr(row.created_at)}">${text(formatDateTime(row.created_at))}</span>`,
        exportValue: (row) => row.created_at,
      },
      {
        data: ACTIONS_COLUMN,
        title: '',
        skipExport: true,
        className: 'text-right',
      },
    ],
    []
  );

  const strip: StatsStripItem[] =
    unread === null
      ? []
      : [
          { label: 'Unread for you', value: formatNumber(unread), tone: unread > 0 ? 'brand' : 'default' },
          { label: 'Inbox scope', value: 'Admin + staff' },
        ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Order, stock and account events addressed to the dashboard, plus anything staff send to each other."
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<CheckCheck className="size-4" />}
              onClick={() => void readAll()}
            >
              Mark all read
            </Button>
            <Button leftIcon={<Megaphone className="size-4" />} onClick={() => setComposing(true)}>
              Send to staff
            </Button>
          </>
        }
      />

      <StatsStrip
        items={strip.length ? strip : [{ label: '—', value: '' }, { label: '—', value: '' }]}
        loading={unread === null}
      />

      <DataTable<Notification>
        id="notifications"
        endpoint="/notifications/staff/all"
        columns={columns}
        reloadToken={reloadToken}
        exportName="notifications"
        exportTitle="Staff notification inbox"
        searchPlaceholder="Search title or message…"
        emptyMessage="The inbox is empty."
        actions={(row): CellAction[] => [
          ...(row.read_at
            ? []
            : [{ key: 'read', label: 'Mark as read', tone: 'success' as const }]),
          ...(row.link
            ? [{ key: 'open', label: 'Open link', tone: 'neutral' as const }]
            : []),
          { key: 'delete', label: 'Delete notification', tone: 'danger' as const },
        ]}
        onAction={(key, row) => {
          if (key === 'read') void markRead(row);
          else if (key === 'open' && row.link) router.push(row.link);
          else if (key === 'delete') void remove(row);
        }}
      />

      {composing ? (
        <BroadcastModal
          onClose={() => setComposing(false)}
          onSent={() => {
            setComposing(false);
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function BroadcastModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [form, setForm] = useState({ title: '', message: '', type: 'info' as NoticeType });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const invalid = !form.title.trim() || !form.message.trim();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (invalid) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/notifications/broadcast', {
        title: form.title.trim(),
        message: form.message.trim(),
        type: form.type,
      });
      await toastSuccess('Sent to staff');
      onSent();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send the notification');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      locked={saving}
      title="Send a notification"
      description="Goes to every admin and staff account. Customers are not included."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="broadcast-form" loading={saving} disabled={invalid}>
            Send
          </Button>
        </>
      }
    >
      <form id="broadcast-form" onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Title" required>
          <Input
            value={form.title}
            onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))}
            maxLength={160}
            required
            placeholder="Backups run tonight"
          />
        </Field>

        <Field label="Message" required>
          <Textarea
            rows={4}
            value={form.message}
            onChange={(event) => setForm((f) => ({ ...f, message: event.target.value }))}
            maxLength={1000}
            required
            placeholder="Database backup finishes at 02:00. No action needed."
          />
        </Field>

        <Field label="Kind" hint="Sets the colour of the dot in the inbox.">
          <Select
            value={form.type}
            onChange={(event) => setForm((f) => ({ ...f, type: event.target.value as NoticeType }))}
          >
            {Object.entries(TYPE_META).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </Field>

        {error ? (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
