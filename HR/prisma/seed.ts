import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin
  const admin = await prisma.user.upsert({
    where: { email: 'hr@lspgatensi.com' },
    update: {},
    create: {
      name: 'Admin HR',
      email: 'hr@lspgatensi.com',
      password: 'admin123',
      role: 'HRManager',
      position: 'HR Manager',
      department: 'Human Resources',
      location: 'Jakarta',
      status: 'active',
    },
  });
  console.log('✅ Created admin:', admin.email);

  // Create other users
  const users = [
    { name: 'HR Staff', email: 'staff@lspgatensi.com', password: 'staff123', role: 'HRStaff' as const, position: 'HR Staff', department: 'Human Resources', location: 'Jakarta' },
    { name: 'Recruiter', email: 'recruiter@lspgatensi.com', password: 'recruit123', role: 'Recruiter' as const, position: 'Recruiter', department: 'Human Resources', location: 'Jakarta' },
    { name: 'Ahmad Rizky', email: 'ahmad@lspgatensi.com', password: 'emp123', role: 'Employee' as const, position: 'Software Engineer', department: 'IT', location: 'Jakarta', employeeId: 'EMP-2023-015' },
    { name: 'Sarah Putri', email: 'sarah@lspgatensi.com', password: 'emp123', role: 'Employee' as const, position: 'HR Specialist', department: 'Human Resources', location: 'Jakarta', employeeId: 'EMP-2023-016' },
    { name: 'Budi Santoso', email: 'budi@lspgatensi.com', password: 'emp123', role: 'Employee' as const, position: 'Marketing Manager', department: 'Marketing', location: 'Surabaya', employeeId: 'EMP-2022-045' },
    { name: 'Dewi Lestari', email: 'dewi@lspgatensi.com', password: 'emp123', role: 'Employee' as const, position: 'Finance Staff', department: 'Finance', location: 'Bandung', status: 'on_leave' as const },
    { name: 'Eko Prasetyo', email: 'eko@lspgatensi.com', password: 'emp123', role: 'Employee' as const, position: 'Operations Lead', department: 'Operations', location: 'Jakarta', employeeId: 'EMP-2022-040' },
  ];

  for (const userData of users) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log('✅ Created user:', userData.email);
  }

  // Create jobs
  const jobs = [
    { title: 'Software Engineer', department: 'IT', location: 'Jakarta' as const, employmentType: 'Full_time' as const, salaryMin: 8000000, salaryMax: 15000000, description: 'Develop web apps', status: 'active' as const, postedBy: admin.id },
    { title: 'Marketing Specialist', department: 'Marketing', location: 'Remote' as const, employmentType: 'Full_time' as const, salaryMin: 6000000, salaryMax: 10000000, description: 'Marketing campaigns', status: 'active' as const, postedBy: admin.id },
    { title: 'HR Staff', department: 'Human Resources', location: 'Jakarta' as const, employmentType: 'Full_time' as const, salaryMin: 5000000, salaryMax: 8000000, description: 'HR operations', status: 'active' as const, postedBy: admin.id },
  ];

  for (const jobData of jobs) {
    await prisma.job.upsert({
      where: { id: -1 }, // dummy where for upsert
      create: jobData,
      update: {},
    });
  }

  // Create training
  const training = await prisma.training.upsert({
    where: { id: -1 },
    create: {
      title: 'Leadership Excellence Program',
      description: 'Enhance leadership skills',
      instructor: 'Dr. Bambang Sutrisno',
      category: 'Leadership',
      startDate: new Date('2026-05-02'),
      endDate: new Date('2026-05-03'),
      duration: '2 hari',
      location: 'Training Center Jakarta',
      type: 'offline',
      capacity: 20,
      status: 'upcoming',
      createdBy: admin.id,
    },
    update: {},
  });

  console.log('🎉 Seeding complete!');

  // Seed dummy Admin TUK data
  const adminTUKs = [
    { name: 'Ir. Hendra Wijaya, M.T.', email: 'hendra.tuk@lspgatensi.com', phone: '081234567890', tukName: 'TUK Gatensi Jakarta', status: 'active' },
    { name: 'Dra. Ratna Sari, M.M.', email: 'ratna.tuk@lspgatensi.com', phone: '081234567891', tukName: 'TUK Gatensi Jakarta', status: 'active' },
    { name: 'Ahmad Fauzi, S.T.', email: 'fauzi.tuk@lspgatensi.com', phone: '081345678901', tukName: 'TUK Konstruksi Surabaya', status: 'active' },
    { name: 'Sri Wahyuni, S.E.', email: 'wahyuni.tuk@lspgatensi.com', phone: '081345678902', tukName: 'TUK Konstruksi Surabaya', status: 'active' },
    { name: 'Bambang Kusumo, S.T.', email: 'kusumo.tuk@lspgatensi.com', phone: '082156789012', tukName: 'TUK Sertifikasi Bandung', status: 'active' },
    { name: 'Maya Indah, S.IP.', email: 'maya.tuk@lspgatensi.com', phone: '082156789013', tukName: 'TUK Sertifikasi Bandung', status: 'inactive' },
    { name: 'Rudi Hermawan, S.T.', email: 'rudi.tuk@lspgatensi.com', phone: '082267890123', tukName: 'TUK Gatensi Medan', status: 'active' },
    { name: 'Fitri Handayani, M.M.', email: 'fitri.tuk@lspgatensi.com', phone: '082267890124', tukName: 'TUK Gatensi Medan', status: 'active' },
  ];

  for (const tuk of adminTUKs) {
    await prisma.adminTUK.upsert({
      where: { email: tuk.email },
      update: {},
      create: tuk,
    });
    console.log('✅ Created admin TUK:', tuk.name);
  }

  console.log('🎉 Admin TUK seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
