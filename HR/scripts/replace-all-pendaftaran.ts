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

    // Reset ALL pendaftaran_bnsp to NULL first
    const [resetResult] = await connection.query(`
      UPDATE bank_asesor
      SET pendaftaran_bnsp = NULL
    `);
    console.log(`\n✅ Reset ${resetResult.affectedRows} rows to NULL`);

    // Build name to No Registrasi map from Excel
    const nameToNoRegistrasi = new Map<string, string>();
    for (const row of excelData) {
      const nama = row['__EMPTY'];
      const noRegistrasiAskom = row['__EMPTY_6'];

      if (!nama || !noRegistrasiAskom) continue;

      const nameLower = nama.toLowerCase();
      // Use the last occurrence (most recent)
      nameToNoRegistrasi.set(nameLower, noRegistrasiAskom);
    }

    console.log(`\nExcel unique names with No Registrasi: ${nameToNoRegistrasi.size}`);

    // Update all rows
    let updatedCount = 0;
    const updates: any[] = [];

    // Get all asesors from BALAI
    const [asesors] = await connection.query(`
      SELECT id, nama_asesor
      FROM bank_asesor
    `);

    for (const a of asesors as any[]) {
      const noRegistrasi = nameToNoRegistrasi.get(a.nama_asesor.toLowerCase());
      if (noRegistrasi) {
        await connection.query(`
          UPDATE bank_asesor
          SET pendaftaran_bnsp = ?
          WHERE id = ?
        `, [noRegistrasi, a.id]);

        updatedCount++;
        if (updates.length < 10) {
          updates.push({ id: a.id, nama: a.nama_asesor, noRegistrasi });
        }
      }
    }

    console.log(`\n✅ Updated: ${updatedCount} rows with No Registrasi Askom`);
    console.log('\nSample updates:');
    updates.forEach(u => {
      console.log(`  ID ${u.id}: ${u.nama} -> ${u.noRegistrasi}`);
    });

    // Check remaining NULL
    const [nullCount] = await connection.query(`
      SELECT COUNT(*) as total
      FROM bank_asesor
      WHERE pendaftaran_bnsp IS NULL OR pendaftaran_bnsp = ''
    `);
    console.log(`\nRows without No Registrasi: ${(nullCount as any)[0].total}`);

  } finally {
    await connection.end();
  }
}

main().catch(console.error);
