import { NextRequest, NextResponse } from 'next/server';
import { createAsesorEvaluation } from '@/lib/asesor';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { asesorId, year, period, periodStartDate, periodEndDate, schema, unit, scores, developmentNote } = body;

    if (!asesorId || !year || !period || !scores || scores.length !== 13) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // TODO: Get evaluatedBy from auth session, hardcoded for now
    const evaluatedBy = 1;

    const evaluation = await createAsesorEvaluation({
      asesorId,
      year,
      period,
      periodStartDate: new Date(periodStartDate),
      periodEndDate: new Date(periodEndDate),
      schema,
      unit,
      scores,
      evaluatedBy,
      developmentNote,
    });

    return NextResponse.json(evaluation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
