import { NextRequest, NextResponse } from 'next/server';
import { updateAsesorEvaluation } from '@/lib/asesor';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { scores, developmentNote } = await request.json();

    if (!scores || scores.length !== 13) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const evaluation = await updateAsesorEvaluation(Number(params.id), {
      scores,
      developmentNote,
    });

    return NextResponse.json(evaluation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
