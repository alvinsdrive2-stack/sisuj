import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();
const excelPath = 'C:\\Users\\Alvia\\Downloads\\Bank Data Asesor LSP GKK (1).xlsx';

async function main() {
  // Read Excel
  const workbook = XLSX.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(worksheet) as any[];

  // Get existing asesors
  const existingAsesors = await prisma.asesor.findMany({
    select: {
      id: true,
      name: true,
      metNumber: true,
      skkNo: true,
    },
  });

  // Group by metNumber (asesors with same MET are duplicates)
  const metGroups = new Map<string, number[]>();
  for (const a of existingAsesors) {
    const key = a.metNumber || `__no_met__${a.id}`;
    if (!metGroups.has(key)) {
      metGroups.set(key, []);
    }
    metGroups.get(key)!.push(a.id);
  }

  // Name to IDs mapping
  const nameToIds = new Map<string, number[]>();
  for (const a of existingAsesors) {
    const nameLower = a.name.toLowerCase();
    if (!nameToIds.has(nameLower)) {
      nameToIds.set(nameLower, []);
    }
    nameToIds.get(nameLower)!.push(a.id);
  }

  console.log('=== STEP 1: UPDATE EXISTING ASESORS ===\n');

  // Track updated asesors
  const updatedAsesorIds = new Set<number>();
  const updateLog: any[] = [];

  for (const row of excelData) {
    const nama = row['__EMPTY'];
    const noRegistrasiAskom = row['__EMPTY_6'];

    if (!nama || !noRegistrasiAskom) continue;

    const ids = nameToIds.get(nama.toLowerCase());
    if (!ids) continue; // Skip - will handle in step 2

    // Update all asesors with this name
    for (const id of ids) {
      if (updatedAsesorIds.has(id)) continue;

      await prisma.asesor.update({
        where: { id },
        data: { registrationNo: noRegistrasiAskom },
      });

      updatedAsesorIds.add(id);
      updateLog.push({ id, name: nama, noRegistrasiAskom });
    }
  }

  console.log(`Updated: ${updateLog.length} asesors`);
  console.log('Sample updates:');
  updateLog.slice(0, 5).forEach((log) => {
    console.log(`  - ID ${log.id}: ${log.name} -> ${log.noRegistrasiAskom}`);
  });

  console.log('\n=== STEP 2: IMPORT NEW ASESORS ===\n');

  const newAsesors: any[] = [];
  const importLog: any[] = [];

  for (const row of excelData) {
    const nama = row['__EMPTY'];
    const provinsi = row['__EMPTY_2'];
    const noRegistrasiAskom = row['__EMPTY_6'];
    const bnsp = row['bnsp'];
    const lpjk = row['lpjk'];

    if (!nama) continue;

    // Check if already exists
    const ids = nameToIds.get(nama.toLowerCase());
    if (ids && ids.length > 0) continue; // Already in DB

    newAsesors.push({
      name: nama,
      registrationNo: noRegistrasiAskom || null,
      // No metNumber, skkNo for new asesors from this Excel
    });

    importLog.push({
      nama,
      noRegistrasiAskom: noRegistrasiAskom || '-',
      provinsi: provinsi || '-',
      bnsp: bnsp || '-',
      lpjk: lpjk || '-',
    });
  }

  // Batch create new asesors
  if (newAsesors.length > 0) {
    await prisma.asesor.createMany({
      data: newAsesors,
      skipDuplicates: true,
    });
  }

  console.log(`Imported: ${newAsesors.length} new asesors`);
  console.log('Sample imports:');
  importLog.slice(0, 10).forEach((log) => {
    console.log(`  - ${log.nama} | ${log.noRegistrasiAskom} | ${log.provinsi}`);
  });

  console.log('\n=== SUMMARY ===');
  console.log(`✅ Updated: ${updateLog.length} asesors with No Registrasi Askom`);
  console.log(`✅ Imported: ${newAsesors.length} new asesors`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
