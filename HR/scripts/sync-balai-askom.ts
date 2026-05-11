import mysql from 'mysql2/promise';
import * as XLSX from 'xlsx';
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
    // Read Excel
    const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet) as any[];

    console.log(`Excel rows: ${excelData.length}`);

    // Get all asesors from BALAI
    const [asesors] = await connection.query(`
      SELECT id, nama_asesor, nomor_met_asesor, pendaftaran_bnsp
      FROM bank_asesor
    `);

    // Build name to IDs map
    const nameToIds = new Map<string, number[]>();
    for (const a of asesors as any[]) {
      const nameLower = a.nama_asesor.toLowerCase();
      if (!nameToIds.has(nameLower)) {
        nameToIds.set(nameLower, []);
      }
      nameToIds.get(nameLower)!.push(a.id);
    }

    // Track updates
    let updatedCount = 0;
    const updates: any[] = [];

    // Process Excel data
    for (const row of excelData) {
      const nama = row['__EMPTY'];
      const noRegistrasiAskom = row['__EMPTY_6'];

      if (!nama || !noRegistrasiAskom) continue;

      const ids = nameToIds.get(nama.toLowerCase());
      if (!ids) continue;

      // Update all matching asesors
      for (const id of ids) {
        await connection.query(`
          UPDATE bank_asesor
          SET pendaftaran_bnsp = ?
          WHERE id = ?
        `, [noRegistrasiAskom, id]);

        updatedCount++;
        if (updates.length < 10) {
          updates.push({ id, nama, noRegistrasiAskom });
        }
      }
    }

    console.log(`\n✅ Updated: ${updatedCount} rows`);
    console.log('\nSample updates:');
    updates.forEach(u => {
      console.log(`  ID ${u.id}: ${u.nama} -> ${u.noRegistrasiAskom}`);
    });

    // Verify
    const [sample] = await connection.query(`
      SELECT id, nama_asesor, pendaftaran_bnsp
      FROM bank_asesor
      WHERE pendaftaran_bnsp NOT IN ('Ada', '-', '')
      LIMIT 10
    `);
    console.log('\n=== Verification ===');
    console.log(sample);

  } finally {
    await connection.end();
  }
}

main().catch(console.error);
