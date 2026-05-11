import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^"|"$/g, '').replace(/%27/g, "'").replace(/%40/g, '@').replace(/%25/g, '%').replace(/%21/g, '!');
  }
});

(async () => {
  const conn = await mysql.createConnection({
    host: env.BALAI_HOST,
    user: env.BALAI_USER,
    password: env.BALAI_PASS,
    database: env.BALAI_DB,
  });

  const [rows] = await conn.query(`
    SELECT nama_asesor, pendaftaran_bnsp
    FROM bank_asesor
    WHERE pendaftaran_bnsp IS NOT NULL AND pendaftaran_bnsp != ''
    LIMIT 10
  `);

  console.log('Sample hasil sync:');
  (rows as any[]).forEach(r => console.log(`  ${r.nama_asesor}: ${r.pendaftaran_bnsp}`));

  const [nullCount] = await conn.query(`
    SELECT COUNT(*) as total
    FROM bank_asesor
    WHERE pendaftaran_bnsp IS NULL OR pendaftaran_bnsp = ''
  `);
  console.log(`\nSisa NULL: ${(nullCount as any)[0].total}`);

  await conn.end();
})();
