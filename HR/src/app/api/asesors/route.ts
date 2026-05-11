import { NextResponse } from 'next/server';
import { getAllAsesors, syncAsesorFromBalai } from '@/lib/asesor';

export async function GET(request: Request) {
  try {
    const asesors = await getAllAsesors();
    return NextResponse.json(asesors);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const synced = await syncAsesorFromBalai();
    return NextResponse.redirect(new URL('/hr-manager/asesors', request.url));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
