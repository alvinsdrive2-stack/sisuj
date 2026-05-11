import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check registration_no column type
  const result = await prisma.$queryRaw`
    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'asesors' AND COLUMN_NAME = 'registration_no'
  `;

  console.log('registration_no column info:');
  console.log(result);

  // Check sample data
  const sample = await prisma.$queryRaw`
    SELECT id, name, registration_no, met_number
    FROM asesors
    LIMIT 5
  `;

  console.log('\nSample data:');
  console.log(sample);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
