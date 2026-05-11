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
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
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
    // Read DATA ASESOR sheet
    const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';
    const wb = XLSX.readFile(excelPath);
    const ws = wb.Sheets['DATA ASESOR'];

    // Get raw data
    const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

    console.log(`DATA ASESOR rows: ${rawData.length}`);

    // Build name map: Column C (2) = Nama Asesor, Column AF (31) = No Registrasi Askom
    const excelNameMap = new Map<string, string>();
    for (let i = 2; i < rawData.length; i++) {
      const row = rawData[i];
      const namaAsesor = row[2]; // Column C (index 2)
      const noRegistrasi = row[31]; // Column AF (index 31) - No Registrasi Askom
      if (!namaAsesor || !noRegistrasi) continue;
      excelNameMap.set(normalizeName(namaAsesor), noRegistrasi);
    }

    console.log(`Excel unique names (from Column C): ${excelNameMap.size}`);

    // Get all asesors from BALAI
    const [asesors] = await connection.query(`
      SELECT id, nama_asesor
      FROM bank_asesor
    `);

    console.log(`BALAI asesors: ${(asesors as any[]).length}`);

    // Reset
    await connection.query(`UPDATE bank_asesor SET pendaftaran_bnsp = NULL`);

    // Update
    let updatedCount = 0;
    const notFound: string[] = [];

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
      } else {
        if (notFound.length < 20) {
          notFound.push(a.nama_asesor);
        }
      }
    }

    console.log(`\n✅ Updated: ${updatedCount} rows`);
    console.log(`❌ Not found: ${notFound.length}`);
    notFound.forEach(n => console.log(`  - ${n}`));

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
