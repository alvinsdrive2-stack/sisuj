import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const asesors = await prisma.asesor.findMany({
    select: {
      registrationNo: true,
      skkNo: true,
      metNumber: true,
      name: true,
    },
    take: 30,
  });

  console.log('Sample database data:');
  console.log('registrationNo | skkNo | metNumber | name');
  console.log('-'.repeat(100));
  asesors.forEach((a) => {
    console.log(`${a.registrationNo || '-'} | ${a.skkNo || '-'} | ${a.metNumber || '-'} | ${a.name}`);
  });

  // Count non-null values
  const all = await prisma.asesor.findMany({
    select: {
      registrationNo: true,
      skkNo: true,
      metNumber: true,
    },
  });

  const withReg = all.filter(a => a.registrationNo).length;
  const withSkk = all.filter(a => a.skkNo).length;
  const withMet = all.filter(a => a.metNumber).length;

  console.log('\nDatabase field population:');
  console.log(`  Total: ${all.length}`);
  console.log(`  With registrationNo: ${withReg}`);
  console.log(`  With skkNo: ${withSkk}`);
  console.log(`  With metNumber: ${withMet}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
