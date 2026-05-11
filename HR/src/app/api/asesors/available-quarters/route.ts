import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { asesorIds } = await request.json();

    if (!Array.isArray(asesorIds) || asesorIds.length === 0) {
      return NextResponse.json({ error: "Invalid asesorIds" }, { status: 400 });
    }

    const selectedAsesors = await prisma.asesor.findMany({
      where: { id: { in: asesorIds } },
      select: { id: true, metNumber: true },
    });

    // Build MET group map: for each selected asesor, find all IDs in same MET group
    const metGroups: Map<number, number[]> = new Map();
    for (const a of selectedAsesors) {
      if (a.metNumber) {
        const sameMet = await prisma.asesor.findMany({
          where: { metNumber: a.metNumber },
          select: { id: true },
        });
        metGroups.set(a.id, sameMet.map(s => s.id));
      } else {
        metGroups.set(a.id, [a.id]);
      }
    }

    const allIds = Array.from(new Set(Array.from(metGroups.values()).flat()));

    // Get all evaluations
    const evaluations = await prisma.asesorEvaluation.findMany({
      where: { asesorId: { in: allIds } },
      select: { asesorId: true, periodStartDate: true },
    });

    // Map: asesorId -> Set<quarterKey>
    const asesorQuarters = new Map<number, Set<string>>();
    for (const ev of evaluations) {
      const d = new Date(ev.periodStartDate);
      const q = Math.floor(d.getMonth() / 3) + 1;
      const key = `${d.getFullYear()}-Q${q}`;
      if (!asesorQuarters.has(ev.asesorId)) asesorQuarters.set(ev.asesorId, new Set());
      asesorQuarters.get(ev.asesorId)!.add(key);
    }

    // Collect all unique quarters
    const allQuartersSet = new Set<string>();
    for (const qs of asesorQuarters.values()) qs.forEach(q => allQuartersSet.add(q));

    const quarterNames = ["", "Januari - Maret", "April - Juni", "Juli - September", "Oktober - Desember"];

    // For each quarter: active only if every selected asesor's MET group has at least one eval
    const quarters = Array.from(allQuartersSet).sort().reverse().map(key => {
      const [yearStr, qStr] = key.split("-Q");
      const label = `${quarterNames[parseInt(qStr)]} ${yearStr}`;

      const active = selectedAsesors.every(a => {
        const groupIds = metGroups.get(a.id) || [a.id];
        return groupIds.some(gid => {
          const qs = asesorQuarters.get(gid);
          return qs && qs.has(key);
        });
      });

      return { key, label, active };
    });

    return NextResponse.json({ quarters });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
