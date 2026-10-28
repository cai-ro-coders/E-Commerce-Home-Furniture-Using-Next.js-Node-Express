"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFiles = getFiles;
exports.getFile = getFile;
exports.getFileStats = getFileStats;
exports.storeUpload = storeUpload;
exports.storeUploads = storeUploads;
exports.changeCategory = changeCategory;
exports.removeStoredFile = removeStoredFile;
exports.createBackup = createBackup;
exports.listBackups = listBackups;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
const file_model_1 = require("../models/file.model");
const upload_1 = require("../middleware/upload");
async function getFiles(list) {
    return (0, file_model_1.listFiles)(list);
}
async function getFile(id) {
    const file = await (0, file_model_1.findFileById)(id);
    if (!file)
        throw ApiError_1.ApiError.notFound('File not found');
    return file;
}
async function getFileStats() {
    return (0, file_model_1.fileStats)();
}
async function storeUpload(file, category, userId) {
    const publicPath = `/uploads/${path_1.default.basename(file.destination)}/${file.filename}`;
    const id = await (0, file_model_1.createFile)({
        name: path_1.default.parse(file.filename).name,
        original_name: file.originalname,
        path: publicPath,
        mime_type: file.mimetype,
        size: file.size,
        category,
        uploaded_by: userId,
    });
    return (0, file_model_1.findFileById)(id);
}
async function storeUploads(files, category, userId) {
    const records = [];
    for (const file of files) {
        records.push(await storeUpload(file, category, userId));
    }
    return records;
}
async function changeCategory(id, category) {
    const file = await (0, file_model_1.findFileById)(id);
    if (!file)
        throw ApiError_1.ApiError.notFound('File not found');
    await (0, file_model_1.updateFileCategory)(id, category);
    return (0, file_model_1.findFileById)(id);
}
async function removeStoredFile(id) {
    const file = await (0, file_model_1.findFileById)(id);
    if (!file)
        throw ApiError_1.ApiError.notFound('File not found');
    const result = await (0, file_model_1.deleteFile)(id);
    if (result)
        (0, upload_1.removeUploadedFile)(result.path);
    return true;
}
/**
 * Create a database dump on disk. Uses mysqldump when it is on PATH; otherwise
 * returns a clear error rather than pretending the backup succeeded.
 */
async function createBackup() {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `backup-${stamp}.sql`;
    const target = path_1.default.join(env_1.env.backendRoot, 'backups', filename);
    fs_1.default.mkdirSync(path_1.default.dirname(target), { recursive: true });
    const { spawn } = await Promise.resolve().then(() => __importStar(require('child_process')));
    const args = [
        `-h${env_1.env.db.host}`,
        `-P${env_1.env.db.port}`,
        `-u${env_1.env.db.user}`,
        `-p${env_1.env.db.password}`,
        '--single-transaction',
        '--routines',
        '--triggers',
        env_1.env.db.database,
    ];
    await new Promise((resolve, reject) => {
        const out = fs_1.default.openSync(target, 'w');
        const child = spawn('mysqldump', args, { stdio: ['ignore', out, 'pipe'] });
        let stderr = '';
        child.stderr?.on('data', (chunk) => {
            stderr += chunk.toString();
        });
        child.on('error', (error) => {
            fs_1.default.closeSync(out);
            reject(new ApiError_1.ApiError(500, 'mysqldump is not available on this machine. Install MySQL client tools to enable backups.', 'BACKUP_UNAVAILABLE', error.message));
        });
        child.on('close', (code) => {
            fs_1.default.closeSync(out);
            // mysqldump warns on stderr about the password argument; only fail on a
            // non-zero exit code.
            if (code === 0)
                resolve();
            else
                reject(new ApiError_1.ApiError(500, `Backup failed: ${stderr.slice(0, 300)}`, 'BACKUP_FAILED'));
        });
    });
    const size = fs_1.default.statSync(target).size;
    return {
        filename,
        size,
        size_human: formatBytes(size),
        created_at: new Date().toISOString(),
        path: target,
    };
}
function listBackups() {
    const dir = path_1.default.join(env_1.env.backendRoot, 'backups');
    if (!fs_1.default.existsSync(dir))
        return [];
    return fs_1.default
        .readdirSync(dir)
        .filter((name) => name.endsWith('.sql'))
        .map((name) => {
        const stat = fs_1.default.statSync(path_1.default.join(dir, name));
        return { filename: name, size: stat.size, size_human: formatBytes(stat.size), created_at: stat.mtime.toISOString() };
    })
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
}
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}
//# sourceMappingURL=file.service.js.map