"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBDIRECTORIES = exports.uploadAny = exports.uploadMultipleImages = exports.uploadSingleImage = exports.upload = void 0;
exports.removeUploadedFile = removeUploadedFile;
exports.toPublicPath = toPublicPath;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
const sanitize_1 = require("../utils/sanitize");
// Create the upload tree up front so the first request never races the fs.
const SUBDIRECTORIES = ['products', 'categories', 'brands', 'users', 'files', 'reviews'];
exports.SUBDIRECTORIES = SUBDIRECTORIES;
for (const folder of SUBDIRECTORIES) {
    fs_1.default.mkdirSync(path_1.default.join(env_1.env.uploads.dir, folder), { recursive: true });
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
function buildFilename(originalName) {
    const ext = path_1.default.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 10);
    const stem = (0, sanitize_1.slugify)(path_1.default.basename(originalName, path_1.default.extname(originalName))).slice(0, 40) || 'file';
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${stem}${ext}`;
}
const storage = multer_1.default.diskStorage({
    destination: (req, _file, cb) => {
        const raw = (req.params.folder ?? req.body?.folder ?? 'files');
        const folder = SUBDIRECTORIES.includes(raw)
            ? raw
            : 'files';
        cb(null, path_1.default.join(env_1.env.uploads.dir, folder));
    },
    filename: (_req, file, cb) => {
        cb(null, buildFilename(file.originalname));
    },
});
function fileFilter(_req, file, cb) {
    if (IMAGE_MIME_TYPES.has(file.mimetype) || DOCUMENT_MIME_TYPES.has(file.mimetype)) {
        cb(null, true);
        return;
    }
    cb(new ApiError_1.ApiError(400, `Unsupported file type: ${file.mimetype}. Allowed: images, PDF, Office documents, TXT, CSV.`, 'UNSUPPORTED_FILE_TYPE'));
}
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: env_1.env.uploads.maxSizeBytes,
        files: 10,
    },
});
exports.uploadSingleImage = exports.upload.single('image');
exports.uploadMultipleImages = exports.upload.array('images', 10);
exports.uploadAny = exports.upload.any();
/** Delete a previously uploaded file, ignoring anything that escapes the upload root. */
function removeUploadedFile(storedPath) {
    if (!storedPath)
        return;
    // Stored paths are public URLs (`/uploads/files/x.jpg`). Strip the `/uploads`
    // mount so they resolve under the uploads directory; a plain relative path
    // (`files/x.jpg`) is accepted as-is.
    const relative = storedPath.replace(/^[\\/]*uploads[\\/]/, '');
    const normalised = path_1.default.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, '');
    const absolute = path_1.default.isAbsolute(normalised) ? normalised : path_1.default.join(env_1.env.uploads.dir, normalised);
    // Never touch anything outside the uploads directory. Compare against the
    // directory with a trailing separator so a sibling like `/uploads-evil`
    // cannot masquerade as the root.
    const root = env_1.env.uploads.dir.endsWith(path_1.default.sep) ? env_1.env.uploads.dir : `${env_1.env.uploads.dir}${path_1.default.sep}`;
    if (!absolute.startsWith(root))
        return;
    fs_1.default.promises.unlink(absolute).catch(() => {
        /* already gone — not an error worth surfacing */
    });
}
/** Public URL path stored in the database for an uploaded file. */
function toPublicPath(folder, filename) {
    return `/uploads/${folder}/${filename}`;
}
//# sourceMappingURL=upload.js.map