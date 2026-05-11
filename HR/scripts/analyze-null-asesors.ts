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
    // Get NULL asesors from BALAI
    const [nullAsesors] = await connection.query(`
      SELECT id, nama_asesor, nomor_met_asesor
      FROM bank_asesor
      WHERE pendaftaran_bnsp IS NULL OR pendaftaran_bnsp = ''
      LIMIT 30
    `);

    console.log('=== NULL ASESORS FROM BALAI ===');
    console.log(`Showing ${(nullAsesors as any[]).length} of 120:\n`);
    (nullAsesors as any[]).forEach(a => {
      console.log(`- ${a.nama_asesor} (MET: ${a.nomor_met_asesor})`);
    });

    // Read Excel
    const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const excelData = XLSX.utils.sheet_to_json(worksheet) as any[];

    // Build normalized name map from Excel
    const excelNameMap = new Map<string, string>();
    for (const row of excelData) {
      const nama = row['__EMPTY'];
      const noRegistrasi = row['__EMPTY_6'];
      if (!nama || !noRegistrasi) continue;
      excelNameMap.set(normalizeName(nama), noRegistrasi);
    }

    console.log(`\n=== EXCEL UNIQUE NAMES (normalized): ${excelNameMap.size} ===`);

    // Try to match with normalized names
    console.log('\n=== TRYING TO MATCH WITH NORMALIZED NAMES ===');
    let matchCount = 0;
    for (const a of nullAsesors as any[]) {
      const normalized = normalizeName(a.nama_asesor);
      const match = excelNameMap.get(normalized);
      if (match) {
        console.log(`✓ ${a.nama_asesor} -> ${match}`);
        matchCount++;
      } else {
        console.log(`✗ ${a.nama_asesor} -> NOT FOUND`);
      }
    }

    console.log(`\nMatches found with normalized names: ${matchCount}`);

  } finally {
    await connection.end();
  }
}

main().catch(console.error);
