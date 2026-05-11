import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';

async function main() {
  // Read Excel file
  console.log('Reading Excel file...');
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  console.log(`Total rows in Excel: ${data.length}`);

  // Get existing asesors from database
  const existingAsesors = await prisma.asesor.findMany({
    select: {
      registrationNo: true,
      skkNo: true,
      metNumber: true,
      name: true,
    },
  });

  // Normalize existing data for comparison (handle null/undefined/whitespace)
  const normalize = (v: string | null | undefined) => {
    if (!v) return '';
    return v.replace(/\s+/g, ' ').trim();
  };

  const existingRegistrationNos = new Set(
    existingAsesors
      .map((a) => normalize(a.registrationNo))
      .filter((v) => v !== '')
  );

  const existingSkkNos = new Set(
    existingAsesors
      .map((a) => normalize(a.skkNo))
      .filter((v) => v !== '')
  );

  const existingMetNumbers = new Set(
    existingAsesors
      .map((a) => normalize(a.metNumber))
      .filter((v) => v !== '')
  );

  console.log(`Database stats: ${existingAsesors.length} asesors`);
  console.log(`  - registrationNo: ${existingRegistrationNos.size} unique`);
  console.log(`  - skkNo: ${existingSkkNos.size} unique`);
  console.log(`  - metNumber: ${existingMetNumbers.size} unique`);

  // Find missing data
  const missing: any[] = [];
  const excelNumbers = new Set<string>();

  for (const row of data as any[]) {
    const nama = row['__EMPTY'] || '-';
    const provinsi = row['__EMPTY_2'] || '-';
    const nomor = row['__EMPTY_6'];

    if (!nomor) continue;

    const normalizedNomor = normalize(String(nomor));
    excelNumbers.add(normalizedNomor);

    // Check if this number exists in database (in any field)
    const found = existingRegistrationNos.has(normalizedNomor) ||
                  existingSkkNos.has(normalizedNomor) ||
                  existingMetNumbers.has(normalizedNomor);

    if (!found) {
      missing.push({
        nomorSKK: nomor,
        nama,
        provinsi,
        bnsp: row['bnsp'] || '-',
        lpjk: row['lpjk'] || '-',
      });
    }
  }

  // Output results
  console.log('\n=== SUMMARY ===');
  console.log(`Excel unique numbers: ${excelNumbers.size}`);
  console.log(`Missing from database: ${missing.length}`);

  if (missing.length > 0) {
    console.log('\n=== MISSING DATA ===');
    console.log(`Total: ${missing.length}`);
    console.log('No. | Nomor SKK | Nama | Provinsi | BNSP | LPJK');
    console.log('-'.repeat(100));
    missing.forEach((item, i) => {
      console.log(`${i + 1} | ${item.nomorSKK} | ${item.nama} | ${item.provinsi} | ${item.bnsp} | ${item.lpjk}`);
    });
  }

  // Save to JSON
  const output = {
    excelTotal: data.length,
    excelUniqueNumbers: excelNumbers.size,
    databaseStats: {
      total: existingAsesors.length,
      registrationNos: existingRegistrationNos.size,
      skkNos: existingSkkNos.size,
      metNumbers: existingMetNumbers.size,
    },
    missing,
  };

  fs.writeFileSync(
    path.join(__dirname, 'asesor-comparison-result.json'),
    JSON.stringify(output, null, 2)
  );
  console.log('\nResult saved to asesor-comparison-result.json');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
