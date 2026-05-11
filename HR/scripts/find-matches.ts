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
      registrationNo: true,
      skkNo: true,
      metNumber: true,
      name: true,
    },
  });

  // Sample Excel numbers
  console.log('Sample Excel numbers:');
  const sampleExcel = excelData.slice(0, 10).map(r => ({
    nomor: r['__EMPTY_6'],
    nama: r['__EMPTY'],
  }));
  console.log(sampleExcel);

  // Try to find matches
  console.log('\n=== Trying to find Excel numbers in database fields ===\n');

  const excelNumbers = excelData
    .map(r => String(r['__EMPTY_6'] || ''))
    .filter(n => n);

  // Extract number parts from Excel
  // Format: "74312 2424 4 0192574 2024"
  // Try matching parts
  const findMatches = () => {
    const matches: any[] = [];

    for (const excelNum of excelNumbers.slice(0, 20)) {
      const parts = excelNum.split(/\s+/);
      console.log(`\nChecking: ${excelNum}`);
      console.log(`  Parts: ${parts.join(', ')}`);

      // Try to find this in database
      for (const asesor of asesors) {
        const skkNo = asesor.skkNo || '';
        const metNo = asesor.metNumber || '';

        // Check if any part appears in database
        for (const part of parts) {
          if (part.length < 4) continue; // Skip short parts

          if (skkNo.includes(part) || metNo.includes(part)) {
            console.log(`  ✅ Found "${part}" in ${asesor.name}`);
            console.log(`     skkNo: ${skkNo}`);
            console.log(`     metNumber: ${metNo}`);
            matches.push({ excelNum, part, asesor: asesor.name, skkNo, metNo });
            break;
          }
        }
      }
    }

    return matches;
  };

  findMatches();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
