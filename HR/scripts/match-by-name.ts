import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();
const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';

async function main() {
  // Read Excel
  const workbook = XLSX.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(worksheet) as any[];

  // Get database data
  const asesors = await prisma.asesor.findMany({
    select: {
      name: true,
      skkNo: true,
      metNumber: true,
    },
  });

  const dbNames = new Map<string, { skk: string; met: string }>();
  for (const a of asesors) {
    dbNames.set(a.name.toLowerCase(), { skk: a.skkNo || '', met: a.metNumber || '' });
  }

  console.log('=== MATCH BY NAME ===\n');

  const exactMatches: any[] = [];
  const notFound: any[] = [];

  for (const row of excelData) {
    const nama = row['__EMPTY'];
    const nomor = row['__EMPTY_6'];

    if (!nama) continue;

    const dbData = dbNames.get(nama.toLowerCase());

    if (dbData) {
      exactMatches.push({
        nama,
        excelNomor: nomor,
        dbSkk: dbData.skk,
        dbMet: dbData.met,
      });
    } else {
      notFound.push({
        nama,
        excelNomor: nomor,
      });
    }
  }

  console.log(`Total Excel rows: ${excelData.length}`);
  console.log(`Exact name matches: ${exactMatches.length}`);
  console.log(`Not found in DB: ${notFound.length}`);

  console.log('\n=== SAMPLE MATCHES ===');
  exactMatches.slice(0, 10).forEach((m, i) => {
    console.log(`${i + 1}. ${m.nama}`);
    console.log(`   Excel: ${m.excelNomor}`);
    console.log(`   DB SKK: ${m.dbSkk}`);
    console.log(`   DB MET: ${m.dbMet}`);
  });

  console.log('\n=== SAMPLE NOT FOUND ===');
  notFound.slice(0, 10).forEach((m, i) => {
    console.log(`${i + 1}. ${m.nama} | ${m.excelNomor}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
