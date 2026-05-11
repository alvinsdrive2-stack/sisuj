# HR Database Setup

## Connection Info

```
Host: 103.150.87.31
Database: lspgatensi_hr
Read User: lspgatensi_HRv / HR@111333!#!v
Super User: lspgatensi_UserHR / HR@111333!#!
```

## Setup Instructions

### 1. Create Database (if not exists)

```sql
CREATE DATABASE IF NOT EXISTS lspgatensi_hr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Run Schema

```bash
mysql -h 103.150.87.31 -u lspgatensi_UserHR -p lspgatensi_hr < schema.sql
# Password: HR@111333!#!
```

### 3. Run Seed Data (Optional)

```bash
mysql -h 103.150.87.31 -u lspgatensi_UserHR -p lspgatensi_hr < seed.sql
# Password: HR@111333!#!
```

## Tables

| Table | Description |
|-------|-------------|
| `users` | Employees & users |
| `attendance` | Daily attendance records |
| `leave_requests` | Leave/cuti requests |
| `jobs` | Job postings |
| `candidates` | Job applicants |
| `interviews` | Interview schedules |
| `training` | Training programs |
| `training_enrollments` | Training participants |
| `performance_reviews` | Performance evaluations |
| `payroll` | Salary records |
| `notifications` | User notifications |
| `documents` | Employee documents |

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| HR Manager | hr@lspgatensi.com | admin123 |
| HR Staff | staff@lspgatensi.com | staff123 |
| Recruiter | recruiter@lspgatensi.com | recruit123 |
| Employee | ahmad@lspgatensi.com | emp123 |
| Employee | sarah@lspgatensi.com | emp123 |
