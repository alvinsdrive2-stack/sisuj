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

function normalizeName(name: string): string {
  return name.toLowerCase()
    .replace(/[.,]/g, '') // remove dots and commas
    .replace(/\s+/g, ' ') // normalize spaces
    .trim();
}

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

    // Build normalized name map from Excel
    const excelNameMap = new Map<string, string>();
    for (const row of excelData) {
      const nama = row['__EMPTY'];
      const noRegistrasi = row['__EMPTY_6'];
      if (!nama || !noRegistrasi) continue;
      excelNameMap.set(normalizeName(nama), noRegistrasi);
    }

    console.log(`Excel unique names (normalized): ${excelNameMap.size}`);

    // Get all asesors from BALAI
    const [asesors] = await connection.query(`
      SELECT id, nama_asesor
      FROM bank_asesor
    `);

    console.log(`BALAI asesors: ${(asesors as any[]).length}`);

    // Update with normalized matching
    let updatedCount = 0;
    const updates: any[] = [];

    for (const a of asesors as any[]) {
      const normalized = normalizeName(a.nama_asesor);
      const noRegistrasi = excelNameMap.get(normalized);

      if (noRegistrasi) {
        await connection.query(`
          UPDATE bank_asesor
          SET pendaftaran_bnsp = ?
          WHERE id = ?
        `, [noRegistrasi, a.id]);

        updatedCount++;
        if (updates.length < 15) {
          updates.push({ id: a.id, nama: a.nama_asesor, noRegistrasi });
        }
      }
    }

    console.log(`\n✅ Updated: ${updatedCount} rows with normalized name matching`);
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

    // Show some remaining NULL
    const [remainingNull] = await connection.query(`
      SELECT DISTINCT nama_asesor
      FROM bank_asesor
      WHERE pendaftaran_bnsp IS NULL OR pendaftaran_bnsp = ''
      LIMIT 20
    `);
    console.log('\nSample remaining NULL (not found in Excel):');
    (remainingNull as any[]).forEach(r => {
      console.log(`  - ${r.nama_asesor}`);
    });

  } finally {
    await connection.end();
  }
}

main().catch(console.error);
