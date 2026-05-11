import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const weightMap = [10, 10, 15, 8, 4, 4, 8, 8, 8, 8, 6, 5, 6];

function distributeScores(targetFinal: number): number[] {
  const totalWeight = weightMap.reduce((a, b) => a + b, 0);
  if (targetFinal >= 100) return weightMap.map(() => 10);
  if (targetFinal <= 0) return weightMap.map(() => 1);

  const seed = targetFinal * 13 + 7;
  const rawScores = weightMap.map((_, i) => {
    const hash = Math.sin(seed * (i + 1) * 0.618) * 10000;
    return 5.5 + (hash - Math.floor(hash)) * 5;
  });

  const rawFinal = rawScores.reduce((sum, s, i) => sum + s * weightMap[i], 0) / totalWeight * 10;
  const targetScale = targetFinal / rawFinal;

  let scores = rawScores.map(s => Math.min(Math.max(Math.round(s * targetScale), 1), 10));

  let currentFinal = Math.round(scores.reduce((sum, s, i) => sum + s * weightMap[i], 0) / totalWeight * 10);
  if (currentFinal < targetFinal) {
    const indices = scores.map((s, i) => ({ s, i })).sort((a, b) => a.s - b.s).map(x => x.i);
    for (const idx of indices) {
      if (currentFinal >= targetFinal) break;
      if (scores[idx] >= 10) continue;
      const gain = Math.round((10 - scores[idx]) * weightMap[idx] / totalWeight * 10);
      scores[idx] = 10;
      currentFinal += gain;
    }
  }

  return scores;
}

export async function POST(request: NextRequest) {
  try {
    const { min = 60, max = 90 } = await request.json();

    if (min >= max || min < 0 || max > 100) {
      return NextResponse.json({ error: 'Range tidak valid (min < max, 0-100)' }, { status: 400 });
    }

    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    const year = now.getFullYear();
    const quarterStart = new Date(year, (quarter - 1) * 3, 1);
    const quarterEnd = new Date(year, quarter * 3, 0);

    // Get all asesors
    const allAsesors = await prisma.asesor.findMany({
      select: { id: true, metNumber: true },
    });

    // Group by MET to find unique asesors
    const seen = new Set<string>();
    const uniqueAsesors: { id: number; metNumber: string | null }[] = [];
    for (const a of allAsesors) {
      const key = a.metNumber || `__no_met__${a.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueAsesors.push(a);
    }

    // Find which ones already have evaluation this quarter
    let filled = 0;
    for (const asesor of uniqueAsesors) {
      // Check all asesors with same MET
      const sameMet = await prisma.asesor.findMany({
        where: asesor.metNumber ? { metNumber: asesor.metNumber } : { id: asesor.id },
        select: { id: true },
      });
      const metIds = sameMet.map(a => a.id);

      const existing = await prisma.asesorEvaluation.findFirst({
        where: {
          asesorId: { in: metIds },
          periodStartDate: { gte: quarterStart, lte: quarterEnd },
        },
      });

      if (existing) continue;

      // Generate random target between min and max
      const target = Math.floor(Math.random() * (max - min + 1)) + min;
      const scores = distributeScores(target);

      const totalWeight = weightMap.reduce((a, b) => a + b, 0);
      let totalNilaiBobot = 0;
      const scoreData: any = {};
      scores.forEach((score, i) => {
        scoreData[`score${i + 1}`] = score;
        totalNilaiBobot += (score * weightMap[i]) / 10;
      });

      const finalScore = Math.round(totalNilaiBobot / totalWeight * 100);
      let conclusion: 'A' | 'B' | 'C' | 'D';
      if (finalScore >= 90) conclusion = 'A';
      else if (finalScore >= 75) conclusion = 'B';
      else if (finalScore >= 60) conclusion = 'C';
      else conclusion = 'D';

      await prisma.asesorEvaluation.create({
        data: {
          asesorId: asesor.id,
          year,
          period: `Q${quarter}`,
          periodStartDate: quarterStart,
          periodEndDate: quarterEnd,
          ...scoreData,
          totalScore: totalNilaiBobot,
          finalScore,
          conclusion,
          totalWeight: 100,
          evaluatedBy: 1,
        },
      });

      filled++;
    }

    return NextResponse.json({ filled });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
