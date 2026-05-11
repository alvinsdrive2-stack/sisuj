import { NextRequest, NextResponse } from 'next/server';
import { getAllEmployees, createEmployee } from '@/lib/auth';

export async function GET() {
  try {
    const employees = await getAllEmployees();
    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, position, department, location, phone } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, dan role diperlukan' },
        { status: 400 }
      );
    }

    const employee = await createEmployee({ name, email, password, role, position, department, location, phone });

    return NextResponse.json({
      message: 'Employee created successfully',
      employee,
    }, { status: 201 });
  } catch (error) {
    console.error('Create employee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
