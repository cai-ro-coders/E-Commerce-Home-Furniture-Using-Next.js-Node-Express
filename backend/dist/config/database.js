"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.queryOne = queryOne;
exports.execute = execute;
exports.transaction = transaction;
exports.assertDatabaseConnection = assertDatabaseConnection;
exports.closePool = closePool;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
/**
 * Single shared connection pool.
 *
 * Every query in this codebase goes through `query` / `execute` (mysql2's
 * prepared-statement helpers) rather than raw `query()`. That is what protects
 * us from SQL injection: user input is always sent as a bound parameter, never
 * concatenated into the SQL string.
 */
exports.pool = promise_1.default.createPool({
    host: env_1.env.db.host,
    port: env_1.env.db.port,
    user: env_1.env.db.user,
    password: env_1.env.db.password,
    database: env_1.env.db.database,
    waitForConnections: true,
    connectionLimit: env_1.env.db.connectionLimit,
    queueLimit: 0,
    charset: 'utf8mb4_unicode_ci',
    dateStrings: true, // return DATETIME as 'YYYY-MM-DD HH:mm:ss' — no TZ surprises
    namedPlaceholders: false,
    multipleStatements: false, // hard block against stacked-query injection
    timezone: 'local',
});
function normaliseParams(params) {
    return params.map((value) => (value === undefined ? null : value));
}
/** Run a SELECT and get typed rows back. */
async function query(sql, params = []) {
    const [rows] = await exports.pool.execute(sql, normaliseParams(params));
    return rows;
}
/** Run a SELECT expected to match at most one row. */
async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return rows.length > 0 ? rows[0] : null;
}
/** Run an INSERT/UPDATE/DELETE and get the result header back. */
async function execute(sql, params = []) {
    const [result] = await exports.pool.execute(sql, normaliseParams(params));
    return result;
}
/**
 * Run `work` inside a transaction, committing on success and rolling back on
 * any thrown error. Use for multi-table writes (e.g. creating an order).
 */
async function transaction(work) {
    const connection = await exports.pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await work(connection);
        await connection.commit();
        return result;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
/** Verify the database is reachable. Used by /api/health and on boot. */
async function assertDatabaseConnection() {
    const connection = await exports.pool.getConnection();
    try {
        await connection.ping();
    }
    finally {
        connection.release();
    }
}
async function closePool() {
    await exports.pool.end();
}
//# sourceMappingURL=database.js.map