import { NextRequest, NextResponse } from "next/server";
import { createAdminTUKEvaluation } from "@/lib/admin-tuk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminTukId, year, period, periodStartDate, periodEndDate, schema, unit, scores, developmentNote } = body;

    if (!adminTukId || !year || !period || !scores || scores.length !== 13) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const evaluatedBy = 1;
    const evaluation = await createAdminTUKEvaluation({
      adminTukId,
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
