import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

// Load env
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^"|"$/g, '').replace(/%27/g, "'").replace(/%40/g, '@').replace(/%25/g, '%').replace(/%21/g, '!');
  }
});

async function main() {
  const connection = await mysql.createConnection({
    host: env.BALAI_HOST,
    user: env.BALAI_USER,
    password: env.BALAI_PASS,
    database: env.BALAI_DB,
  });

  try {
    // Check bank_asesor structure
    const columns = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'bank_asesor'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('=== bank_asesor columns ===');
    console.log(columns[0]);

    // Sample data
    const sample = await connection.query(`
      SELECT * FROM bank_asesor LIMIT 5
    `);

    console.log('\n=== Sample data ===');
    console.log(sample[0]);
  } finally {
    await connection.end();
  }
}

main().catch(console.error);
