import { pool } from './src/config/database';
import { env } from './src/config/env';

async function testDatabase() {
  console.log('=== Database Deep Check ===\n');

  // Check for both cases
  const [dbs] = await pool.query(
    "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME LIKE '%nextjs%'"
  );
  console.log('Databases matching "nextjs":');
  for (const db of dbs as any[]) {
    console.log(`  "${db.SCHEMA_NAME}"`);
  }

  // Check tables in the exact-case database
  console.log(`\n--- Tables in "ecommerce_nextjsDB" ---`);
  const [tablesExact] = await pool.query(
    'SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
    ['ecommerce_nextjsDB']
  );
  const exactTables = tablesExact as any[];
  console.log(`Found ${exactTables.length} tables`);
  for (const t of tablesExact) {
    console.log(`  ${t.TABLE_NAME} (${t.TABLE_ROWS} rows)`);
  }

  // Check tables in the lowercase database
  console.log(`\n--- Tables in "ecommerce_nextjsdb" ---`);
  const [tablesLower] = await pool.query(
    'SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME',
    ['ecommerce_nextjsdb']
  );
  const lowerTables = tablesLower as any[];
  console.log(`Found ${lowerTables.length} tables`);
  for (const t of lowerTables) {
    console.log(`  ${t.TABLE_NAME} (${t.TABLE_ROWS} rows)`);
  }

  // What does the pool actually connect to?
  console.log('\n--- Pool connection check ---');
  const [currentDb] = await pool.query('SELECT DATABASE() as db');
  console.log('Pool connected to:', (currentDb as any[])[0].db);

  await pool.end();
}

testDatabase().catch(console.error);
