import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getAllAdminTUK(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const offset = (page - 1) * limit;
  const sortCol = params?.sortBy || 'name';
  const sortDir = params?.sortOrder || 'asc';

  const where: any = {
    OR: [{ adminName: { not: null } }, { ketuaTuk: { not: null } }],
  };
  if (params?.search) {
    where.AND = [
      { OR: [{ adminName: { not: null } }, { ketuaTuk: { not: null } }] },
      {
        OR: [
          { name: { contains: params.search } },
          { registrationNo: { contains: params.search } },
          { province: { contains: params.search } },
          { adminRegion: { contains: params.search } },
        ],
      },
    ];
    delete where.OR;
  }

  const [data, total] = await Promise.all([
    prisma.adminTUK.findMany({
      where,
      orderBy: { [sortCol]: sortDir },
      skip: offset,
      take: limit,
    }),
    prisma.adminTUK.count({ where }),
  ]);

  return {
    adminTUKs: data.map(a => ({
      id: a.id,
      name: a.name,
      registrationNo: a.registrationNo,
      tukType: a.tukType,
      address: a.address,
      province: a.province,
      adminRegion: a.adminRegion,
      adminName: a.adminName,
      ketuaTuk: a.ketuaTuk,
      status: a.status,
    })),
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getAdminTUKById(id: number) {
  const adminTUK = await prisma.adminTUK.findUnique({ where: { id } });
  if (!adminTUK) return null;

  const evaluations = await prisma.adminTUKEvaluation.findMany({
    where: { adminTukId: id },
    include: { evaluator: { select: { name: true, email: true } } },
    orderBy: [{ year: 'desc' }, { periodStartDate: 'desc' }],
  });

  return { adminTUK, evaluations };
}

export async function createAdminTUKEvaluation(data: {
  adminTukId: number;
  year: number;
  period: string;
  periodStartDate: Date;
  periodEndDate: Date;
  schema?: string;
  unit?: string;
  scores: number[];
  evaluatedBy: number;
  developmentNote?: string;
}) {
  const { scores, ...rest } = data;
  const weightMap = [10, 10, 15, 8, 4, 4, 8, 8, 8, 8, 6, 5, 6];
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

  return prisma.adminTUKEvaluation.create({
    data: { ...rest, ...scoreData, totalScore: totalNilaiBobot, finalScore, conclusion, totalWeight: 100 },
  });
}

export async function updateAdminTUKEvaluation(
  id: number,
  data: { scores?: number[]; developmentNote?: string; status?: string; evaluationDate?: Date }
) {
  const updateData: any = {};

  if (data.scores) {
    const weightMap = [10, 10, 15, 8, 4, 4, 8, 8, 8, 8, 6, 5, 6];
    const totalWeight = weightMap.reduce((a, b) => a + b, 0);
    let totalNilaiBobot = 0;

    data.scores.forEach((score, i) => {
      updateData[`score${i + 1}`] = score;
      totalNilaiBobot += (score * weightMap[i]) / 10;
    });

    updateData.totalScore = totalNilaiBobot;
    updateData.finalScore = Math.round(totalNilaiBobot / totalWeight * 100);
    if (updateData.finalScore >= 90) updateData.conclusion = 'A';
    else if (updateData.finalScore >= 75) updateData.conclusion = 'B';
    else if (updateData.finalScore >= 60) updateData.conclusion = 'C';
    else updateData.conclusion = 'D';
  }

  if (data.developmentNote !== undefined) updateData.developmentNote = data.developmentNote;
  if (data.status) updateData.status = data.status;
  if (data.evaluationDate) updateData.evaluationDate = data.evaluationDate;

  return prisma.adminTUKEvaluation.update({ where: { id }, data: updateData });
}
