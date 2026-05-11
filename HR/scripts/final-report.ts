import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

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
      id: true,
      name: true,
      skkNo: true,
      metNumber: true,
    },
  });

  const dbNames = new Map<string, { id: number; skk: string; met: string }>();
  for (const a of asesors) {
    dbNames.set(a.name.toLowerCase(), { id: a.id, skk: a.skkNo || '', met: a.metNumber || '' });
  }

  const foundInDb: any[] = [];
  const notFoundInDb: any[] = [];
  const uniqueExcelNumbers = new Set<string>();

  for (const row of excelData) {
    const nama = row['__EMPTY'];
    const provinsi = row['__EMPTY_2'] || '-';
    const nomor = row['__EMPTY_6'];
    const bnsp = row['bnsp'] || '-';
    const lpjk = row['lpjk'] || '-';

    if (!nama) continue;
    if (nomor) uniqueExcelNumbers.add(nomor);

    const dbData = dbNames.get(nama.toLowerCase());

    if (dbData) {
      foundInDb.push({
        nama,
        noRegistrasiAskom: nomor || '-',
        databaseId: dbData.id,
        databaseSkk: dbData.skk || '-',
        databaseMet: dbData.met || '-',
      });
    } else {
      notFoundInDb.push({
        nama,
        noRegistrasiAskom: nomor || '-',
        provinsi,
        bnsp,
        lpjk,
      });
    }
  }

  // Generate report
  const report = {
    summary: {
      totalExcelRows: excelData.length,
      uniqueExcelNumbers: uniqueExcelNumbers.size,
      foundInDatabase: foundInDb.length,
      notFoundInDatabase: notFoundInDb.length,
    },
    asesorsMissingInDb: notFoundInDb,
    asesorsFoundButMissingAskomNumber: foundInDb.filter(a => a.noRegistrasiAskom !== '-'),
  };

  console.log('========================================');
  console.log('       LAPORAN KOMPARASI ASESOR        ');
  console.log('========================================\n');

  console.log('SUMMARY:');
  console.log(`  Total baris Excel: ${report.summary.totalExcelRows}`);
  console.log(`  Unique No Registrasi Askom: ${report.summary.uniqueExcelNumbers}`);
  console.log(`  Asesor ADA di database: ${report.summary.foundInDatabase}`);
  console.log(`  Asesor TIDAK ADA di database: ${report.summary.notFoundInDatabase}`);

  console.log('\n========================================');
  console.log('1. ASESOR YANG BELUM ADA DI DATABASE');
  console.log('========================================');
  console.log(`Total: ${notFoundInDb.length}\n`);

  if (notFoundInDb.length > 0) {
    console.log('No | Nama | No Registrasi Askom | Provinsi | BNSP | LPJK');
    console.log('-'.repeat(120));
    notFoundInDb.forEach((a, i) => {
      console.log(`${i + 1} | ${a.nama} | ${a.noRegistrasiAskom} | ${a.provinsi} | ${a.bnsp} | ${a.lpjk}`);
    });
  }

  const withAskomNumber = foundInDb.filter(a => a.noRegistrasiAskom !== '-');
  console.log('\n========================================');
  console.log('2. NO REGISTRASI ASKOM YANG BELUM DISIMPAN');
  console.log('   (Asesor ada di DB, tapi No Registrasi Askom tidak)');
  console.log('========================================');
  console.log(`Total: ${withAskomNumber.length}\n`);

  if (withAskomNumber.length > 0) {
    console.log('No | Nama | No Registrasi Askom (belum disimpan) | DB SKK No | DB MET No');
    console.log('-'.repeat(140));
    withAskomNumber.slice(0, 50).forEach((a, i) => {
      console.log(`${i + 1} | ${a.nama} | ${a.noRegistrasiAskom} | ${a.databaseSkk} | ${a.databaseMet}`);
    });

    if (withAskomNumber.length > 50) {
      console.log(`... dan ${withAskomNumber.length - 50} lainnya. Lihat file JSON untuk lengkapnya.`);
    }
  }

  // Save to JSON
  fs.writeFileSync(
    path.join(__dirname, 'asesor-comparison-report.json'),
    JSON.stringify(report, null, 2)
  );
  console.log('\nLaporan lengkap disimpan ke: asesor-comparison-report.json');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
