import fs from 'fs';
import path from 'path';
import multer, { type FileFilterCallback } from 'multer';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { slugify } from '../utils/sanitize';

// Create the upload tree up front so the first request never races the fs.
const SUBDIRECTORIES = ['products', 'categories', 'brands', 'users', 'files', 'reviews'] as const;
export type UploadFolder = (typeof SUBDIRECTORIES)[number];

for (const folder of SUBDIRECTORIES) {
  fs.mkdirSync(path.join(env.uploads.dir, folder), { recursive: true });
}

const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]);

/**
 * Storage filename: timestamp + random hex + sanitised original name.
 * Randomising the stem prevents path traversal and filename collisions while
 * still keeping the file recognisable to a human browsing the uploads folder.
 */
function buildFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 10);
  const stem = slugify(path.basename(originalName, path.extname(originalName))).slice(0, 40) || 'file';
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${stem}${ext}`;
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const raw = (req.params.folder ?? req.body?.folder ?? 'files') as string;
    const folder: UploadFolder = (SUBDIRECTORIES as readonly string[]).includes(raw)
      ? (raw as UploadFolder)
      : 'files';
    cb(null, path.join(env.uploads.dir, folder));
  },
  filename: (_req, file, cb) => {
    cb(null, buildFilename(file.originalname));
  },
});

function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  if (IMAGE_MIME_TYPES.has(file.mimetype) || DOCUMENT_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(
    new ApiError(
      400,
      `Unsupported file type: ${file.mimetype}. Allowed: images, PDF, Office documents, TXT, CSV.`,
      'UNSUPPORTED_FILE_TYPE'
    )
  );
}

type Request = import('express').Request;

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.uploads.maxSizeBytes,
    files: 10,
  },
});

export const uploadSingleImage = upload.single('image');
export const uploadMultipleImages = upload.array('images', 10);
export const uploadAny = upload.any();

/** Delete a previously uploaded file, ignoring anything that escapes the upload root. */
export function removeUploadedFile(storedPath: string | null | undefined): void {
  if (!storedPath) return;
  // Stored paths are public URLs (`/uploads/files/x.jpg`). Strip the `/uploads`
  // mount so they resolve under the uploads directory; a plain relative path
  // (`files/x.jpg`) is accepted as-is.
  const relative = storedPath.replace(/^[\\/]*uploads[\\/]/, '');
  const normalised = path.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, '');
  const absolute = path.isAbsolute(normalised) ? normalised : path.join(env.uploads.dir, normalised);
  // Never touch anything outside the uploads directory. Compare against the
  // directory with a trailing separator so a sibling like `/uploads-evil`
  // cannot masquerade as the root.
  const root = env.uploads.dir.endsWith(path.sep) ? env.uploads.dir : `${env.uploads.dir}${path.sep}`;
  if (!absolute.startsWith(root)) return;
  fs.promises.unlink(absolute).catch(() => {
    /* already gone — not an error worth surfacing */
  });
}

/** Public URL path stored in the database for an uploaded file. */
export function toPublicPath(folder: string, filename: string): string {
  return `/uploads/${folder}/${filename}`;
}

export { SUBDIRECTORIES };
