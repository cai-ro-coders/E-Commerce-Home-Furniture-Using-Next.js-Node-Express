import path from 'path';
import fs from 'fs';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { createFile, deleteFile, fileStats, findFileById, listFiles, updateFileCategory } from '../models/file.model';
import { removeUploadedFile } from '../middleware/upload';
import { query } from '../config/database';
import type { RowDataPacket } from 'mysql2';
import type { FileCategory, ListQuery } from '../types';

export async function getFiles(list: ListQuery) {
  return listFiles(list);
}

export async function getFile(id: number) {
  const file = await findFileById(id);
  if (!file) throw ApiError.notFound('File not found');
  return file;
}

export async function getFileStats() {
  return fileStats();
}

export async function storeUpload(
  file: Express.Multer.File,
  category: FileCategory,
  userId: number | null
) {
  const publicPath = `/uploads/${path.basename(file.destination)}/${file.filename}`;
  const id = await createFile({
    name: path.parse(file.filename).name,
    original_name: file.originalname,
    path: publicPath,
    mime_type: file.mimetype,
    size: file.size,
    category,
    uploaded_by: userId,
  });
  return findFileById(id);
}

export async function storeUploads(
  files: Express.Multer.File[],
  category: FileCategory,
  userId: number | null
) {
  const records = [];
  for (const file of files) {
    records.push(await storeUpload(file, category, userId));
  }
  return records;
}

export async function changeCategory(id: number, category: FileCategory) {
  const file = await findFileById(id);
  if (!file) throw ApiError.notFound('File not found');
  await updateFileCategory(id, category);
  return findFileById(id);
}

export async function removeStoredFile(id: number) {
  const file = await findFileById(id);
  if (!file) throw ApiError.notFound('File not found');

  const result = await deleteFile(id);
  if (result) removeUploadedFile(result.path);
  return true;
}

/**
 * Create a database dump on disk. Uses mysqldump when it is on PATH; otherwise
 * returns a clear error rather than pretending the backup succeeded.
 */
export async function createBackup() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `backup-${stamp}.sql`;
  const target = path.join(env.backendRoot, 'backups', filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });

  const { spawn } = await import('child_process');

  const args = [
    `-h${env.db.host}`,
    `-P${env.db.port}`,
    `-u${env.db.user}`,
    `-p${env.db.password}`,
    '--single-transaction',
    '--routines',
    '--triggers',
    env.db.database,
  ];

  await new Promise<void>((resolve, reject) => {
    const out = fs.openSync(target, 'w');
    const child = spawn('mysqldump', args, { stdio: ['ignore', out, 'pipe'] });
    let stderr = '';
    child.stderr?.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      fs.closeSync(out);
      reject(
        new ApiError(
          500,
          'mysqldump is not available on this machine. Install MySQL client tools to enable backups.',
          'BACKUP_UNAVAILABLE',
          error.message
        )
      );
    });
    child.on('close', (code) => {
      fs.closeSync(out);
      // mysqldump warns on stderr about the password argument; only fail on a
      // non-zero exit code.
      if (code === 0) resolve();
      else reject(new ApiError(500, `Backup failed: ${stderr.slice(0, 300)}`, 'BACKUP_FAILED'));
    });
  });

  const size = fs.statSync(target).size;
  return {
    filename,
    size,
    size_human: formatBytes(size),
    created_at: new Date().toISOString(),
    path: target,
  };
}

export function listBackups() {
  const dir = path.join(env.backendRoot, 'backups');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .map((name) => {
      const stat = fs.statSync(path.join(dir, name));
      return { filename: name, size: stat.size, size_human: formatBytes(stat.size), created_at: stat.mtime.toISOString() };
    })
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
