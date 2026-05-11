import { NextRequest, NextResponse } from 'next/server';
import { getAllAsesors } from '@/lib/asesor';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = (searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';
    const evalFilter = (searchParams.get('evalFilter') as 'all' | 'evaluated' | 'not_evaluated') || 'all';

    const result = await getAllAsesors({ page, limit, search, sortBy, sortOrder, evalFilter });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
