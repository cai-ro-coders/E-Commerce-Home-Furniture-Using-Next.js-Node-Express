import mysql, { Pool, PoolConnection, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { env } from './env';

/**
 * Single shared connection pool.
 *
 * Every query in this codebase goes through `query` / `execute` (mysql2's
 * prepared-statement helpers) rather than raw `query()`. That is what protects
 * us from SQL injection: user input is always sent as a bound parameter, never
 * concatenated into the SQL string.
 */
export const pool: Pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  charset: 'utf8mb4_unicode_ci',
  dateStrings: true, // return DATETIME as 'YYYY-MM-DD HH:mm:ss' — no TZ surprises
  namedPlaceholders: false,
  multipleStatements: false, // hard block against stacked-query injection
  timezone: 'local',
});

/**
 * Values bound to a prepared statement.
 *
 * `undefined` is accepted because model layer records are `Partial<T>` and
 * naturally carry undefined optional fields. mysql2 rejects undefined outright,
 * so every param array is passed through `normaliseParams` first, which
 * converts undefined to a real SQL NULL.
 */
export type SqlParam = string | number | boolean | Date | Buffer | null | undefined;

function normaliseParams(params: SqlParam[]): Exclude<SqlParam, undefined>[] {
  return params.map((value) => (value === undefined ? null : value));
}

/** Run a SELECT and get typed rows back. */
export async function query<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: SqlParam[] = []
): Promise<T[]> {
  const [rows] = await pool.execute<T[]>(sql, normaliseParams(params));
  return rows;
}

/** Run a SELECT expected to match at most one row. */
export async function queryOne<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: SqlParam[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/** Run an INSERT/UPDATE/DELETE and get the result header back. */
export async function execute(
  sql: string,
  params: SqlParam[] = []
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, normaliseParams(params));
  return result;
}

/**
 * Run `work` inside a transaction, committing on success and rolling back on
 * any thrown error. Use for multi-table writes (e.g. creating an order).
 */
export async function transaction<T>(
  work: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/** Verify the database is reachable. Used by /api/health and on boot. */
export async function assertDatabaseConnection(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}
