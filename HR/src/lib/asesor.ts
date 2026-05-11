import { PrismaClient } from "@prisma/client";
import mysql from 'mysql2/promise';

const prisma = new PrismaClient();

interface BalaiAsesorRow {
  id: number;
  nama_asesor: string;
  nomor_met_asesor?: string;
  pendaftaran_bnsp?: string;
  nomor_skk?: string;
  subklasifikasi_skk?: string;
  email?: string;
  no_hp?: string;
  alamat_ktp?: string;
}

// Sync asesor from BALAI database to HR database
export async function syncAsesorFromBalai() {
  const connection = await mysql.createConnection({
    host: process.env.BALAI_HOST,
    user: process.env.BALAI_USER,
    password: process.env.BALAI_PASS,
    database: process.env.BALAI_DB,
  });

  try {
    const [rows] = await connection.query(
      'SELECT id, nama_asesor, nomor_met_asesor, pendaftaran_bnsp, nomor_skk, subklasifikasi_skk, email, no_hp, alamat_ktp FROM bank_asesor'
    );

    const asesors = rows as BalaiAsesorRow[];
    if (asesors.length === 0) return 0;

    const esc = (v: any) => v === null || v === undefined ? 'NULL' : String(v).replace(/'/g, "\\'");

    const insertRows = asesors.map(r =>
      `(${r.id}, '${esc(r.nama_asesor)}', '${esc(r.nomor_met_asesor)}', '${esc(r.pendaftaran_bnsp)}', '${esc(r.nomor_skk)}', '${esc(r.subklasifikasi_skk)}', '${esc(r.email)}', '${esc(r.no_hp)}', '${esc(r.alamat_ktp)}', NOW(), NOW())`
    ).join(', ');

    await prisma.$executeRawUnsafe(`
      INSERT INTO asesors (balai_asesor_id, name, met_number, registration_no, skk_no, subklasifikasi_skk, email, phone, address, created_at, updated_at)
      VALUES ${insertRows}
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        met_number = VALUES(met_number),
        registration_no = VALUES(registration_no),
        skk_no = VALUES(skk_no),
        subklasifikasi_skk = VALUES(subklasifikasi_skk),
        email = VALUES(email),
        phone = VALUES(phone),
        address = VALUES(address),
        updated_at = NOW()
    `);

    return asesors.length;
  } finally {
    await connection.end();
  }
}

// Get all asesors grouped by MET with pagination
export async function getAllAsesors(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  evalFilter?: 'all' | 'evaluated' | 'not_evaluated';
}) {
  const page = params?.page || 1;
  const limit = params?.limit || 10;
  const offset = (page - 1) * limit;
  const sortCol = params?.sortBy || 'name';
  const sortDir = params?.sortOrder || 'asc';
  const evalFilter = params?.evalFilter || 'all';

  // Current quarter date range
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const quarterStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
  const quarterEnd = new Date(now.getFullYear(), quarter * 3, 0);

  // Build search condition for raw SQL
  let searchCond = '';
  const searchValues: any[] = [];
  if (params?.search) {
    const s = `%${params.search}%`;
    searchCond = `WHERE (name LIKE ? OR met_number LIKE ? OR registration_no LIKE ? OR skk_no LIKE ? OR email LIKE ?)`;
    searchValues.push(s, s, s, s, s);
  }

  // Build WHERE clause for eval filter
  const evalWhere = evalFilter === 'evaluated'
    ? `WHERE (SELECT COUNT(*) FROM asesor_evaluations ae WHERE ae.asesor_id IN (SELECT a2.id FROM asesors a2 WHERE (a.met_number IS NOT NULL AND a2.met_number = a.met_number) OR (a.met_number IS NULL AND a2.id = a.id)) AND ae.period_start_date >= ? AND ae.period_start_date <= ?) > 0`
    : evalFilter === 'not_evaluated'
    ? `WHERE (SELECT COUNT(*) FROM asesor_evaluations ae WHERE ae.asesor_id IN (SELECT a2.id FROM asesors a2 WHERE (a.met_number IS NOT NULL AND a2.met_number = a.met_number) OR (a.met_number IS NULL AND a2.id = a.id)) AND ae.period_start_date >= ? AND ae.period_start_date <= ?) = 0`
    : '';
  const evalParams = evalFilter !== 'all' ? [quarterStart, quarterEnd] as any[] : [];

  // Get total unique METs count (with eval filter)
  const [countResult] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as total FROM (
      SELECT grp.min_id
       FROM (
         SELECT MIN(id) as min_id
         FROM asesors
         ${searchCond}
         GROUP BY COALESCE(met_number, CONCAT('__no_met__', id))
       ) grp
       INNER JOIN asesors a ON a.id = grp.min_id
       ${evalWhere}
    ) sub`,
    ...searchValues,
    ...evalParams
  );
  const total = Number((countResult as any).total);
  const pages = Math.ceil(total / limit);

  // Get one representative asesor per MET with pagination
  const groupedAsesors = await prisma.$queryRawUnsafe(
    `SELECT a.*,
            (SELECT COUNT(*) FROM asesors a2
             WHERE (a.met_number IS NOT NULL AND a2.met_number = a.met_number)
                OR (a.met_number IS NULL AND a2.id = a.id)
            ) as skk_count,
            (SELECT GROUP_CONCAT(a2.skk_no SEPARATOR '|||') FROM asesors a2
             WHERE a2.met_number = a.met_number
               AND a.met_number IS NOT NULL
               AND a2.skk_no IS NOT NULL
            ) as skk_list,
            (SELECT COUNT(*) FROM asesor_evaluations ae
             WHERE ae.asesor_id IN (
               SELECT a3.id FROM asesors a3
               WHERE (a.met_number IS NOT NULL AND a3.met_number = a.met_number)
                  OR (a.met_number IS NULL AND a3.id = a.id)
             )
             AND ae.period_start_date >= ?
             AND ae.period_start_date <= ?
            ) as eval_this_quarter
     FROM asesors a
     INNER JOIN (
       SELECT grp.min_id
       FROM (
         SELECT MIN(id) as min_id
         FROM asesors
         ${searchCond}
         GROUP BY COALESCE(met_number, CONCAT('__no_met__', id))
       ) grp
       INNER JOIN asesors a ON a.id = grp.min_id
       ${evalWhere}
       ORDER BY ${sortCol === 'name' ? 'a.name' : sortCol === 'metNumber' ? 'a.met_number' : sortCol === 'registrationNo' ? 'a.registration_no' : sortCol === 'skkNo' ? 'a.skk_no' : 'a.name'} ${sortDir === 'desc' ? 'DESC' : 'ASC'}
       LIMIT ? OFFSET ?
     ) grp ON a.id = grp.min_id
     ORDER BY ${sortCol === 'name' ? 'a.name' : sortCol === 'metNumber' ? 'a.met_number' : sortCol === 'registrationNo' ? 'a.registration_no' : sortCol === 'skkNo' ? 'a.skk_no' : 'a.name'} ${sortDir === 'desc' ? 'DESC' : 'ASC'}`,
    quarterStart, quarterEnd,
    ...searchValues,
    ...evalParams,
    limit, offset
  ) as any[];

  // Process results
  const result = groupedAsesors.map((row: any) => ({
    id: row.id,
    name: row.name,
    metNumber: row.met_number,
    registrationNo: row.registration_no,
    skkNo: row.skk_no,
    email: row.email,
    phone: row.phone,
    status: row.status,
    skkCount: Number(row.skk_count) || 1,
    skkList: row.skk_list ? row.skk_list.split('|||') : [row.skk_no].filter(Boolean),
    evalThisQuarter: Number(row.eval_this_quarter) > 0,
  }));

  // Get evaluated count (all, not just current page)
  const [evalCount] = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as c FROM (
      SELECT MIN(id) as min_id
      FROM asesors
      ${searchCond}
      GROUP BY COALESCE(met_number, CONCAT('__no_met__', id))
    ) grp
    INNER JOIN asesors a ON a.id = grp.min_id
    WHERE (SELECT COUNT(*) FROM asesor_evaluations ae
           WHERE ae.asesor_id IN (SELECT a2.id FROM asesors a2 WHERE (a.met_number IS NOT NULL AND a2.met_number = a.met_number) OR (a.met_number IS NULL AND a2.id = a.id))
           AND ae.period_start_date >= ? AND ae.period_start_date <= ?
    ) > 0`,
    quarterStart, quarterEnd,
    ...searchValues
  );
  const evaluatedCount = Number((evalCount as any).c);
  const notEvaluatedCount = total - evaluatedCount;

  return {
    asesors: result,
    total,
    pages,
    currentPage: page,
    evaluatedCount,
    notEvaluatedCount,
  };
}

// Get asesor by ID with evaluations
export async function getAsesorById(id: number) {
  const asesor = await prisma.asesor.findUnique({
    where: { id },
  });

  if (!asesor) return null;

  // Get all asesors with same MET number
  const sameMetAsesors = await prisma.asesor.findMany({
    where: {
      metNumber: asesor.metNumber,
    },
  });

  // Get all evaluations for these asesors
  const asesorIds = sameMetAsesors.map(a => a.id);
  const evaluations = await prisma.asesorEvaluation.findMany({
    where: {
      asesorId: { in: asesorIds },
    },
    include: {
      evaluator: { select: { name: true, email: true } },
    },
    orderBy: [{ year: 'desc' }, { periodStartDate: 'desc' }],
  });

  return {
    asesor,
    sameMetAsesors,
    evaluations,
  };
}

// Create asesor evaluation
export async function createAsesorEvaluation(data: {
  asesorId: number;
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

  return prisma.asesorEvaluation.create({
    data: {
      ...rest,
      ...scoreData,
      totalScore: totalNilaiBobot,
      finalScore,
      conclusion,
      totalWeight: 100,
    },
  });
}

// Get asesor evaluations
export async function getAsesorEvaluations(filters?: {
  asesorId?: number;
  year?: number;
  period?: string;
}) {
  return prisma.asesorEvaluation.findMany({
    where: filters,
    include: {
      asesor: true,
      evaluator: { select: { name: true, email: true } },
    },
    orderBy: { year: 'desc' },
  });
}

// Update asesor evaluation
export async function updateAsesorEvaluation(
  id: number,
  data: {
    scores?: number[];
    developmentNote?: string;
    status?: string;
    evaluationDate?: Date;
  }
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

  if (data.developmentNote !== undefined) {
    updateData.developmentNote = data.developmentNote;
  }

  if (data.status) {
    updateData.status = data.status;
  }

  if (data.evaluationDate) {
    updateData.evaluationDate = data.evaluationDate;
  }

  return prisma.asesorEvaluation.update({
    where: { id },
    data: updateData,
  });
}
