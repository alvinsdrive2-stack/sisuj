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
    console.log('=== STEP 1: ALTER TABLE ===');

    // Alter pendaftaran_bnsp to VARCHAR 100
    await connection.query(`
      ALTER TABLE bank_asesor
      MODIFY COLUMN pendaftaran_bnsp VARCHAR(100)
    `);
    console.log('✅ Column pendaftaran_bnsp changed to VARCHAR(100)');

    // Check current data
    const sample = await connection.query(`
      SELECT id, nama_asesor, pendaftaran_bnsp, nomor_met_asesor
      FROM bank_asesor
      LIMIT 5
    `);
    console.log('\n=== Sample data (before update) ===');
    console.log(sample[0]);

  } finally {
    await connection.end();
  }
}

main().catch(console.error);
