"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
/**
 * Create the database if it does not exist, then run every `*.sql` file in
 * `database/migrations` in filename order.
 *
 * The admin connection is opened without a database selected so the CREATE
 * DATABASE statement itself can run. Statements are split on `;` at the end of
 * a line so the seed/migration files can hold comments and stored routines.
 */
function splitStatements(sql) {
    return sql
        .split(/;\s*$/m)
        .map((statement) => statement
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n')
        .trim())
        .filter((statement) => statement.length > 0);
}
async function main() {
    const migrationsDir = path_1.default.join(env_1.env.backendRoot, '..', 'database', 'migrations');
    if (!fs_1.default.existsSync(migrationsDir)) {
        throw new Error(`Migrations directory not found: ${migrationsDir}`);
    }
    const files = fs_1.default
        .readdirSync(migrationsDir)
        .filter((name) => name.endsWith('.sql'))
        .sort();
    if (files.length === 0) {
        logger_1.logger.warn('No migration files found');
        return;
    }
    // Connect without a database so CREATE DATABASE works on a fresh MySQL.
    const bootstrap = await promise_1.default.createConnection({
        host: env_1.env.db.host,
        port: env_1.env.db.port,
        user: env_1.env.db.user,
        password: env_1.env.db.password,
        multipleStatements: false,
    });
    await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${env_1.env.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    logger_1.logger.info(`Database \`${env_1.env.db.database}\` is ready`);
    await bootstrap.end();
    const connection = await promise_1.default.createConnection({
        host: env_1.env.db.host,
        port: env_1.env.db.port,
        user: env_1.env.db.user,
        password: env_1.env.db.password,
        database: env_1.env.db.database,
        multipleStatements: false,
    });
    try {
        for (const file of files) {
            const sql = fs_1.default.readFileSync(path_1.default.join(migrationsDir, file), 'utf8');
            const statements = splitStatements(sql);
            logger_1.logger.info(`Applying ${file} (${statements.length} statements)`);
            for (const statement of statements) {
                try {
                    await connection.query(statement);
                }
                catch (error) {
                    logger_1.logger.error(`Failed statement in ${file}:\n${statement.slice(0, 400)}`);
                    throw error;
                }
            }
            logger_1.logger.info(`Applied ${file}`);
        }
        logger_1.logger.info('Migration complete');
    }
    finally {
        await connection.end();
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
    logger_1.logger.error('Migration failed', error);
    process.exit(1);
});
//# sourceMappingURL=migrate.js.map