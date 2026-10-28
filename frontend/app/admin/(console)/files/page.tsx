'use client';

/**
 * File Manager.
 *
 * A grid over `GET /files` plus two things the grid cannot do: drag-free
 * multi-file upload and re-filing a row into another category. Backups are
 * listed separately in a side panel because they are not `files` rows — they
 * are .sql dumps on disk, read straight from `backend/backups`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DatabaseBackup, FileSpreadsheet, FolderInput, HardDrive, Upload } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/admin/DataTable';
import { StatsStrip, type StatsStripItem } from '@/components/admin/StatsStrip';
import { ToolbarSelect } from '@/components/admin/ToolbarSelect';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader, PageHeader } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Field, Select } from '@/components/ui/Field';
import { api, imageUrl } from '@/lib/api';
import { alertError, confirmAction, toastSuccess } from '@/lib/alerts';
import { formatBytes, formatDateTime, formatNumber, num, timeAgo } from '@/lib/format';
import { ACTIONS_COLUMN, attr, orDash, text, type CellAction } from '@/lib/tableHtml';
import type { BackupFile, FileCategory, FileStats, StoredFile } from '@/types';

const CATEGORIES: Array<{ value: FileCategory; label: string }> = [
  { value: 'image', label: 'Images' },
  { value: 'document', label: 'Documents' },
  { value: 'invoice', label: 'Invoices' },
  { value: 'contract', label: 'Contracts' },
  { value: 'customer', label: 'Customer files' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((entry) => [entry.value, entry.label])
);

/**
 * Thumbnail for a row.
 *
 * Images render as themselves; everything else gets a tinted tile carrying the
 * file's extension, which is more scannable at 36px than a generic page glyph
 * and needs no icon-per-MIME table.
 */
function thumbnail(file: StoredFile): string {
  if (file.mime_type.startsWith('image/')) {
    return `<img src="${attr(imageUrl(file.path))}" alt="" loading="lazy" class="size-9 shrink-0 rounded-lg border border-[var(--border-subtle)] object-cover" />`;
  }
  const ext = (file.original_name.split('.').pop() ?? 'file').slice(0, 4).toUpperCase();
  const tone =
    file.category === 'invoice'
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
      : file.category === 'contract'
        ? 'bg-violet-500/15 text-violet-700 dark:text-violet-300'
        : file.category === 'customer'
          ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
          : 'bg-[var(--surface-sunken)] text-sand-600 dark:text-sand-300';
  return (
    '<span class="flex size-9 shrink-0 items-center justify-center rounded-lg text-[0.6rem] font-bold tracking-wide ' +
    `${tone}">${text(ext)}</span>`
  );
}

export default function FilesPage() {
  const [category, setCategory] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [refiling, setRefiling] = useState<StoredFile | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const loadSide = useCallback(async () => {
    try {
      const [fileStats, backupList] = await Promise.all([
        api.get<FileStats>('/files/stats'),
        api.get<BackupFile[]>('/files/backups'),
      ]);
      setStats(fileStats);
      setBackups(backupList);
    } catch {
      setStats(null);
    }
  }, []);

  useEffect(() => {
    void loadSide();
  }, [loadSide]);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
    void loadSide();
  }, [loadSide]);

  const upload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setUploading(true);
      try {
        const form = new FormData();
        for (const file of Array.from(files)) form.append('files', file);
        const created = await api.upload<StoredFile[]>('/files/upload', form);
        const count = Array.isArray(created) ? created.length : 1;
        toastSuccess(`${count} file${count === 1 ? '' : 's'} uploaded`);
        refresh();
      } catch (error) {
        alertError('Could not upload', describe(error));
      } finally {
        setUploading(false);
        if (fileInput.current) fileInput.current.value = '';
      }
    },
    [refresh]
  );

  const backup = useCallback(async () => {
    setBackingUp(true);
    try {
      await api.post('/files/backups');
      toastSuccess('Database backup created');
      void loadSide();
    } catch (error) {
      alertError('Could not create the backup', describe(error));
    } finally {
      setBackingUp(false);
    }
  }, [loadSide]);

  const remove = useCallback(
    async (row: StoredFile) => {
      const confirmed = await confirmAction({
        title: `Delete ${row.original_name}?`,
        text: 'The file is removed from disk. Anything that referenced it will show a broken path.',
        confirmText: 'Delete file',
        danger: true,
      });
      if (!confirmed) return;
      try {
        await api.delete(`/files/${row.id}`);
        toastSuccess(`${row.original_name} was deleted`);
        refresh();
      } catch (error) {
        alertError('Could not delete the file', describe(error));
      }
    },
    [refresh]
  );

  const columns: DataTableColumn<StoredFile>[] = useMemo(
    () => [
      {
        data: 'original_name',
        title: 'File',
        sortable: true,
        render: (row) =>
          '<div class="flex items-center gap-2.5">' +
          thumbnail(row) +
          '<div class="flex min-w-0 flex-col">' +
          `<span class="truncate font-medium text-sand-900 dark:text-sand-100" title="${attr(row.original_name)}">${text(row.original_name)}</span>` +
          `<span class="truncate text-xs text-muted">${text(row.mime_type)}</span>` +
          '</div></div>',
        exportValue: (row) => row.original_name,
      },
      {
        data: 'category',
        title: 'Filed under',
        sortable: true,
        render: (row) =>
          `<span class="rounded-md bg-[var(--surface-sunken)] px-2 py-0.5 text-xs font-medium">${text(CATEGORY_LABEL[row.category] ?? row.category)}</span>`,
        exportValue: (row) => row.category,
      },
      {
        data: 'size',
        title: 'Size',
        sortable: true,
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row) => `<span class="tabular-nums text-xs">${text(formatBytes(row.size))}</span>`,
        exportValue: (row) => num(row.size),
      },
      {
        data: 'uploader_name',
        title: 'Uploaded by',
        sortable: false,
        render: (row) =>
          row.uploaded_by
            ? `<a href="/admin/users/${row.uploaded_by}" class="text-xs hover:text-clay-700 dark:hover:text-clay-400">${text(row.uploader_name ?? 'Unknown')}</a>`
            : orDash('—'),
        exportValue: (row) => row.uploader_name ?? '',
      },
      {
        data: 'created_at',
        title: 'Uploaded',
        sortable: true,
        render: (row) =>
          `<span class="text-xs text-muted" title="${attr(row.created_at)}">${text(timeAgo(row.created_at))}</span>`,
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

  const strip: StatsStripItem[] = stats
    ? [
        { label: 'Files', value: formatNumber(stats.total_files) },
        { label: 'On disk', value: formatBytes(num(stats.total_size)) },
        { label: 'Images', value: formatNumber(stats.images), tone: 'brand' },
        { label: 'Documents', value: formatNumber(stats.documents) },
        { label: 'Invoices', value: formatNumber(stats.invoices) },
        { label: 'Contracts', value: formatNumber(stats.contracts) },
        { label: 'Customer files', value: formatNumber(stats.customer_files) },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="File Manager"
        description="Uploads, invoices and contracts. Re-file anything that landed in the wrong folder."
        actions={
          <>
            <input
              ref={fileInput}
              type="file"
              multiple
              className="sr-only"
              onChange={(event) => void upload(event.target.files)}
            />
            <Button
              leftIcon={<Upload className="size-4" />}
              loading={uploading}
              onClick={() => fileInput.current?.click()}
            >
              Upload files
            </Button>
          </>
        }
      />

      <StatsStrip
        items={strip.length ? strip : Array.from({ length: 7 }, () => ({ label: '—', value: '' }))}
        loading={!stats}
      />

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-4">
        <div className="2xl:col-span-3">
          <DataTable<StoredFile>
            id="files"
            endpoint="/files"
            columns={columns}
            filters={{ category: category || undefined }}
            reloadToken={reloadToken}
            exportName="files"
            exportTitle="File inventory"
            searchPlaceholder="Search file name or type…"
            emptyMessage="Nothing uploaded yet."
            actions={(): CellAction[] => [
              { key: 'open', label: 'Open in a new tab', tone: 'neutral' },
              { key: 'refile', label: 'Move to another folder', tone: 'brand' },
              { key: 'delete', label: 'Delete file', tone: 'danger' },
            ]}
            onAction={(key, row) => {
              if (key === 'open') window.open(imageUrl(row.path), '_blank', 'noopener,noreferrer');
              else if (key === 'refile') setRefiling(row);
              else if (key === 'delete') void remove(row);
            }}
            toolbar={
              <ToolbarSelect
                id="filter-file-category"
                label="All folders"
                value={category}
                onChange={setCategory}
                options={CATEGORIES.map((entry) => ({ value: entry.value, label: entry.label }))}
              />
            }
          />
        </div>

        <Card className="2xl:sticky 2xl:top-4 2xl:self-start">
          <CardHeader
            title="Database backups"
            description="SQL dumps written to the backend's backups folder."
            action={<DatabaseBackup className="size-4 text-sand-400" aria-hidden />}
          />
          <CardBody className="flex flex-col gap-3">
            <Button
              variant="outline"
              leftIcon={<HardDrive className="size-4" />}
              loading={backingUp}
              onClick={() => void backup()}
            >
              Create a backup now
            </Button>

            {backups.length === 0 ? (
              <p className="rounded-lg bg-[var(--surface-sunken)] px-3 py-6 text-center text-xs text-muted">
                No backups yet.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border-subtle)]">
                {backups.map((backup) => (
                  <li key={backup.filename} className="flex items-center gap-2.5 py-2.5">
                    <FileSpreadsheet className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-xs" title={backup.filename}>
                        {backup.filename}
                      </p>
                      <p className="text-[0.7rem] text-muted">
                        {backup.size_human} · {timeAgo(backup.created_at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {refiling ? (
        <RefileModal
          file={refiling}
          onClose={() => setRefiling(null)}
          onSaved={() => {
            setRefiling(null);
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function RefileModal({
  file,
  onClose,
  onSaved,
}: {
  file: StoredFile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [target, setTarget] = useState<FileCategory>(file.category);
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (target === file.category) return;
    setSaving(true);
    try {
      await api.patch(`/files/${file.id}`, { category: target });
      await toastSuccess(`${file.original_name} moved to ${CATEGORY_LABEL[target]}`);
      onSaved();
    } catch (error) {
      alertError('Could not move the file', describe(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      locked={saving}
      title="Move to another folder"
      description="Only the file's label changes — nothing is copied or re-uploaded."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="refile-form"
            loading={saving}
            leftIcon={<FolderInput className="size-4" />}
            disabled={target === file.category}
          >
            Move file
          </Button>
        </>
      }
    >
      <form id="refile-form" onSubmit={submit} className="flex flex-col gap-4">
        <p className="truncate rounded-lg bg-[var(--surface-sunken)] px-3 py-2 text-xs">
          {file.original_name}
        </p>

        <Field label="Folder" required>
          <Select
            value={target}
            onChange={(event) => setTarget(event.target.value as FileCategory)}
          >
            {CATEGORIES.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </Select>
        </Field>

        <p className="text-xs text-muted">
          Currently in {CATEGORY_LABEL[file.category] ?? file.category} ·{' '}
          {formatBytes(file.size)} · uploaded {formatDateTime(file.created_at)}
        </p>
      </form>
    </Modal>
  );
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
