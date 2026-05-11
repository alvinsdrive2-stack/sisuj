import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, location } = body; // action: 'check-in' | 'check-out'

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId dan action diperlukan' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (action === 'check-in') {
      // Check if already checked in
      const existing = await prisma.attendance.findFirst({
        where: { userId, date: today },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Sudah check-in hari ini' },
          { status: 400 }
        );
      }

      // Create attendance record
      const attendance = await prisma.attendance.create({
        data: {
          userId,
          date: today,
          checkInTime: new Date(),
          checkInLocation: location || 'Office',
          status: 'present',
        },
      });

      return NextResponse.json({
        message: 'Check-in berhasil',
        attendance,
      });
    }

    if (action === 'check-out') {
      // Find today's attendance
      const attendance = await prisma.attendance.findFirst({
        where: { userId, date: today },
      });

      if (!attendance) {
        return NextResponse.json(
          { error: 'Belum check-in hari ini' },
          { status: 400 }
        );
      }

      if (attendance.checkOutTime) {
        return NextResponse.json(
          { error: 'Sudah check-out hari ini' },
          { status: 400 }
        );
      }

      // Update check-out time
      const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOutTime: new Date(),
          checkOutLocation: location || 'Office',
        },
      });

      return NextResponse.json({
        message: 'Check-out berhasil',
        attendance: updated,
      });
    }

    return NextResponse.json(
      { error: 'Action tidak valid' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    if (!userId || !date) {
      return NextResponse.json(
        { error: 'userId dan date diperlukan' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');
    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: parseInt(userId),
        date: new Date(date),
      },
    });

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
