import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Create the database if it does not exist, then run every `*.sql` file in
 * `database/migrations` in filename order.
 *
 * The admin connection is opened without a database selected so the CREATE
 * DATABASE statement itself can run. Statements are split on `;` at the end of
 * a line so the seed/migration files can hold comments and stored routines.
 */
function splitStatements(sql: string): string[] {
  return sql
    .split(/;\s*$/m)
    .map((statement) =>
      statement
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim()
    )
    .filter((statement) => statement.length > 0);
}

async function main(): Promise<void> {
  const migrationsDir = path.join(env.backendRoot, '..', 'database', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    logger.warn('No migration files found');
    return;
  }

  // Connect without a database so CREATE DATABASE works on a fresh MySQL.
  const bootstrap = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: false,
  });

  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${env.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  logger.info(`Database \`${env.db.database}\` is ready`);
  await bootstrap.end();

  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    multipleStatements: false,
  });

  try {
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const statements = splitStatements(sql);
      logger.info(`Applying ${file} (${statements.length} statements)`);

      for (const statement of statements) {
        try {
          await connection.query(statement);
        } catch (error) {
          logger.error(`Failed statement in ${file}:\n${statement.slice(0, 400)}`);
          throw error;
        }
      }
      logger.info(`Applied ${file}`);
    }
    logger.info('Migration complete');
  } finally {
    await connection.end();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error('Migration failed', error);
    process.exit(1);
  });
