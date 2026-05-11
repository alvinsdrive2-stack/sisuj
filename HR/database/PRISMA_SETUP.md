# Prisma Setup untuk HR LSP Gatensi

## Database Connection

```
Host: 103.150.87.31
Database: lspgatensi_hr
User: lspgatensi_HRv
Password: HR@111333!#!v
```

## Setup Instructions

### 1. Generate Prisma Client

```bash
npm run db:generate
# atau
npx prisma generate
```

### 2. Push Schema ke Database

```bash
npm run db:push
# atau
npx prisma db push
```

### 3. Seed Data (Opsional)

```bash
npm run db:seed
# atau
npx prisma db seed
```

### 4. Buka Prisma Studio (GUI)

```bash
npm run db:studio
# atau
npx prisma studio
```

## Commands Tersedia

| Command | Deskripsi |
|---------|-----------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema ke database (tanpa migration) |
| `npm run db:migrate` | Create migration & apply |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Buka Prisma Studio GUI |

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| HR Manager | hr@lspgatensi.com | admin123 |
| HR Staff | staff@lspgatensi.com | staff123 |
| Recruiter | recruiter@lspgatensi.com | recruit123 |
| Employee | ahmad@lspgatensi.com | emp123 |

## Tables

- `users` → Karyawan
- `attendance` → Absensi
- `leave_requests` → Cuti
- `jobs` → Lowongan
- `candidates` → Pelamar
- `interviews` → Interview
- `training` → Training
- `training_enrollments` → Peserta training
- `performance_reviews` → Review performa
- `payroll` → Gaji
- `notifications` → Notifikasi
- `documents` → Dokumen
