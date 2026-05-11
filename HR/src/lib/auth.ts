import { prisma } from './prisma';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  position?: string | null;
  department?: string | null;
  avatar?: string | null;
  employeeId?: string | null;
  location?: string | null;
  status?: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      position: true,
      department: true,
      avatar: true,
      employeeId: true,
      location: true,
      status: true,
    },
  });

  return user;
}

export async function getUserById(id: number): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      position: true,
      department: true,
      avatar: true,
      employeeId: true,
      location: true,
      status: true,
    },
  });

  return user;
}

export async function verifyPassword(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null;
  }

  // For now, simple password check - in production use bcrypt
  if (user.password === password) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  return null;
}

export async function getAllEmployees() {
  return await prisma.user.findMany({
    where: {
      role: { not: 'superadmin' },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      position: true,
      department: true,
      avatar: true,
      employeeId: true,
      location: true,
      status: true,
    },
    orderBy: { name: 'asc' },
  });
}

export async function createEmployee(data: {
  name: string;
  email: string;
  password: string;
  role: string;
  position?: string;
  department?: string;
  location?: string;
  phone?: string;
}) {
  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role as any,
      position: data.position,
      department: data.department,
      location: data.location,
      phone: data.phone,
    },
  });
}

export async function updateEmployee(id: number, data: Partial<User>) {
  return await prisma.user.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.position !== undefined && { position: data.position }),
      ...(data.department !== undefined && { department: data.department }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.avatar !== undefined && { avatar: data.avatar }),
      ...(data.status && { status: data.status as any }),
    },
  });
}

export async function deleteEmployee(id: number) {
  return await prisma.user.delete({
    where: { id },
  });
}

// Attendance functions
export async function getAttendanceByDate(date: Date) {
  return await prisma.attendance.findMany({
    where: { date },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          position: true,
          department: true,
          avatar: true,
          employeeId: true,
        },
      },
    },
    orderBy: { checkInTime: 'asc' },
  });
}

export async function getAttendanceByUser(userId: number, startDate?: Date, endDate?: Date) {
  const where: any = { userId };

  if (startDate && endDate) {
    where.date = { gte: startDate, lte: endDate };
  }

  return await prisma.attendance.findMany({
    where,
    orderBy: { date: 'desc' },
  });
}

export async function createAttendance(data: {
  userId: number;
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  checkInLocation?: string;
  status: string;
}) {
  return await prisma.attendance.create({
    data: {
      userId: data.userId,
      date: data.date,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      checkInLocation: data.checkInLocation,
      status: data.status as any,
    },
  });
}

// Payroll functions
export async function getPayrollByPeriod(period: string) {
  return await prisma.payroll.findMany({
    where: { period },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          position: true,
          department: true,
          avatar: true,
          employeeId: true,
        },
      },
    },
  });
}

// Training functions
export async function getAllTraining() {
  return await prisma.training.findMany({
    include: {
      enrollments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { startDate: 'desc' },
  });
}

// Performance functions
export async function getPerformanceByPeriod(period: string) {
  return await prisma.performanceReview.findMany({
    where: { period },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          position: true,
          department: true,
          avatar: true,
          employeeId: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

// Job functions
export async function getAllJobs() {
  return await prisma.job.findMany({
    include: {
      candidates: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Notifications
export async function getNotifications(userId: number) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markNotificationRead(id: number) {
  return await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
}
