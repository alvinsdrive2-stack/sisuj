import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import mysql from 'mysql2/promise';

const prisma = new PrismaClient();

const ASPEK = [
  ["Penyelesaian waktu laporan", "Ketepatan penyerahan laporan asesmen dan kelengkapan hasil setelah kegiatan"],
  ["Kemudahan berkomunikasi", "Respons, kejelasan informasi, dan kemudahan koordinasi dengan LSP, asesi, dan pihak TUK"],
  ["Kualitas keputusan asesmen", "Keputusan kompeten/belum kompeten didukung bukti dan minim banding atau revisi"],
  ["Penjelasan proses asesmen", "Asesi mendapatkan penjelasan memadai mengenai proses asesmen"],
  ["Kesempatan mempelajari standar kompetensi", "Asesi diberi kesempatan mempelajari standar dan menilai diri sendiri"],
  ["Diskusi metode, instrumen, dan jadwal", "Asesor membuka ruang diskusi/negosiasi metode, instrumen, sumber asesmen, dan jadwal"],
  ["Penggalian bukti yang relevan", "Asesor menggali seluruh bukti pendukung sesuai latar belakang pelatihan dan pengalaman asesi"],
  ["Kesempatan demonstrasi kompetensi", "Asesi diberi kesempatan penuh mendemonstrasikan kompetensi yang dimiliki"],
  ["Penjelasan keputusan asesmen", "Asesi mendapatkan penjelasan memadai atas hasil/keputusan asesmen"],
  ["Umpan balik dan tindak lanjut", "Asesor memberikan umpan balik yang mendukung setelah asesmen serta tindak lanjut"],
  ["Penelaahan dan penandatanganan dokumen asesmen", "Asesor bersama asesi mempelajari seluruh dokumen asesmen serta menandatanganinya"],
  ["Jaminan kerahasiaan dokumen dan hasil", "Asesi mendapat penjelasan mengenai kerahasiaan hasil dan penanganan dokumen"],
  ["Keterampilan komunikasi efektif saat asesmen", "Asesor menggunakan komunikasi efektif selama asesmen"],
];

const WEIGHTS = [10, 10, 15, 8, 4, 4, 8, 8, 8, 8, 6, 5, 6];

const conclusionLabel: Record<string, string> = {
  A: "A - Kinerja sangat memuaskan",
  B: "B - Kinerja memuaskan",
  C: "C - Kinerja cukup",
  D: "D - Kinerja kurang",
};

function buildHtml(asesor: any, ev: any, skemaSertifikasi: string, noRegistrasiAskom: string) {
  const scores = Array.from({ length: 13 }, (_, i) => (ev as any)[`score${i + 1}`] || 0);
  const nilaiBobot = scores.map((s, i) => ((s * WEIGHTS[i]) / 10).toFixed(1));
  const totalNilaiBobot = nilaiBobot.reduce((a, b) => a + parseFloat(b), 0).toFixed(1);

  const periodLabel = `${new Date(ev.periodStartDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} s/d ${new Date(ev.periodEndDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;

  const scoreRows = ASPEK.map((aspek, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td>${aspek[0]}</td>
      <td>${aspek[1]}</td>
      <td style="text-align:center;">${WEIGHTS[i]}</td>
      <td style="text-align:center;">${scores[i]}</td>
      <td style="text-align:center;">${nilaiBobot[i]}</td>
    </tr>`).join("");

  const templateB64 = fs.readFileSync(path.join(process.cwd(), "public", "template.jpg")).toString("base64");
  const ttdDirekturB64 = fs.readFileSync(path.join(process.cwd(), "public", "ttddirektur.png")).toString("base64");
  const ttdHrB64 = fs.readFileSync(path.join(process.cwd(), "public", "ttdhr.png")).toString("base64");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Penilaian Kinerja Asesor - ${asesor.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: letter; margin: 0; }
  html, body { width: 8.5in; height: 11in; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; }
  .bg { position: fixed; top: 0; left: 0; width: 8.5in; height: 11in; background-image: url('data:image/jpeg;base64,${templateB64}'); background-size: 8.5in 11in; background-repeat: no-repeat; z-index: -1; }
  .content { padding: 80px 60px 80px; }
  h3 { text-align: center; margin: 3px 0; font-size: 13px; }
  h4 { text-align: center; margin: 8px 0 4px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: top; }
  th { background-color: rgba(217,237,247,0.85); font-size: 10px; }
  td { font-size: 10px; }
  .no-border td { border: none; }
  .center { text-align: center; }
  .bold { font-weight: bold; }
</style>
</head>
<body>
<div class="bg"></div>
<div class="content">
<h3>PENILAIAN KINERJA ASESOR KOMPETENSI</h3>
<h3>LEMBAGA SERTIFIKASI PROFESI</h3>
<h3>GATENSI KARYA KONSTRUKSI</h3>
<br/><br/><br/>
<table>
  <tr>
    <td width="25%" style="background-color: #315098;color: white; font-weight: bold">Nama Asesor</td>
    <td width="25%">${asesor.name}</td>
    <td width="15%" style="background-color: #315098;color: white; font-weight: bold">Tahun</td>
    <td width="35%">${ev.year}</td>
  </tr>
  <tr>
    <td style="background-color: #315098;color: white; font-weight: bold">No. Registrasi Asesor/BNSP</td>
    <td>${noRegistrasiAskom}</td>
    <td style="background-color: #315098;color: white; font-weight: bold">Nomor MET</td>
    <td>${asesor.metNumber || "-"}</td>
  </tr>
  <tr>
    <td style="background-color: #315098;color: white; font-weight: bold">Skema Sertifikasi</td>
    <td>${skemaSertifikasi}</td>
    <td style="background-color: #315098;color: white; font-weight: bold">Periode Penilaian</td>
    <td>${periodLabel}</td>
  </tr>
</table>
<br/><br/><br/>
<h4 style="text-align: left; margin-bottom: 10px;">TABEL PENILAIAN KESELURUHAN</h4>
<table>
  <tr class="center bold">
    <th width="5%" style="background-color: #315098;color: white; font-weight: bold; padding: 8px;">No</th>
    <th width="22%" style="background-color: #315098;color: white; font-weight: bold; padding: 8px;">Aspek Penilaian</th>
    <th width="38%" style="background-color: #315098;color: white; font-weight: bold; padding: 8px;">Indikator Terukur</th>
    <th width="8%" style="background-color: #315098;color: white; font-weight: bold; padding: 8px;">Bobot</th>
    <th width="8%" style="background-color: #315098;color: white; font-weight: bold; padding: 8px;">Skor</th>
    <th width="12%" style="background-color: #315098;color: white; font-weight: bold; padding: 8px;">Nilai Bobot</th>
  </tr>
  ${scoreRows}
</table>
<br/><br/>
<h4 style="text-align: left;">Rekap Hasil</h4>
<br/>
<table style="width:40%; margin: 0;">
  <tr><td width="70%" style="background-color: #315098; font-weight: bold;color: white;">Total Bobot</td><td class="center">${WEIGHTS.reduce((a, b) => a + b, 0)}</td></tr>
  <tr><td style="background-color: #315098; font-weight: bold;color: white;">Total Nilai Bobot</td><td class="center">${totalNilaiBobot}</td></tr>
  <tr><td style="background-color: #315098; font-weight: bold;color: white;">Nilai Akhir (skala 100)</td><td class="center">${ev.finalScore}</td></tr>
  <tr><td style="background-color: #315098; font-weight: bold;color: white;">Kesimpulan</td><td class="center">${conclusionLabel[ev.conclusion || "D"]}</td></tr>
</table>
<br/><br/>
<div style="page-break-before: always; padding-top: 80px;">
<div style="position: relative; z-index: 2;">
<p style="text-align: left; margin-bottom: 5px;">CATATAN PENGEMBANGAN (jika ada)</p>
<p style="border: 0.2px solid #000; padding: 6px; min-height: 60px;">${ev.developmentNote || "Tidak ada catatan pengembangan."}</p>
<br><br><br><br>
<p style="text-align:right; padding-right: 10%;">Jakarta, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
<table class="no-border">
  <tr>
    <td width="50%" style="padding-left: 5%;">Disetujui oleh</td>
    <td width="50%" style="padding-left: 5%;">Dinilai oleh</td>
  </tr>
  <tr>
    <td style="padding-left: 1%; vertical-align: bottom;"><img src="data:image/png;base64,${ttdDirekturB64}" style="max-height: 80px; max-width: 140px;" /></td>
    <td style="vertical-align: bottom; text-align: left;padding-left: 3%;"><img src="data:image/png;base64,${ttdHrB64}" style="max-height: 80px; max-width: 140px;" /></td>
  </tr>
  <tr>
    <td style="padding-top:0px; padding-left: 5%; font-weight: bold;transform: translateY(-200%);">Radinal Efendy, S.T.</td>
    <td style="padding-top:0px; text-align: left; font-weight: bold; padding-left: 5%; transform: translateY(-200%);">Remeinis Sri Hardiyanti Zagoto</td>
  </tr>
  <tr>
    <td style="padding-left: 5%; padding-top: 0px; transform: translateY(-220%);">Direktur</td>
    <td style="text-align: left; padding-top: 0px; padding-left: 5%;transform: translateY(-220%);">Manager HR & Legal</td>
  </tr>
</table>
</div>
</div>
</div>
</body>
</html>`;
}

// Helper function to get pendaftaran_bnsp from BALAI
async function getNoRegistrasiAskom(metNumber: string): Promise<string> {
  if (!metNumber) return '-';

  try {
    const balaiConnection = await mysql.createConnection({
      host: process.env.BALAI_HOST,
      user: process.env.BALAI_USER,
      password: process.env.BALAI_PASS,
      database: process.env.BALAI_DB,
    });

    try {
      const [rows] = await balaiConnection.query(`
        SELECT pendaftaran_bnsp
        FROM bank_asesor
        WHERE nomor_met_asesor = ? AND is_primary = 1
        LIMIT 1
      `, [metNumber]);

      const result = rows as any[];
      if (result.length > 0 && result[0].pendaftaran_bnsp && result[0].pendaftaran_bnsp !== 'Ada' && result[0].pendaftaran_bnsp.trim() !== '') {
        return result[0].pendaftaran_bnsp;
      }
      return '-';
    } finally {
      await balaiConnection.end();
    }
  } catch (err) {
    console.error('Failed to fetch from BALAI:', err);
    return fallback;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { asesorIds, quarter } = await request.json();

    if (!Array.isArray(asesorIds) || !quarter) {
      return NextResponse.json({ error: "Missing asesorIds or quarter" }, { status: 400 });
    }

    const [yearStr, qStr] = quarter.split("-Q");
    const qNum = parseInt(qStr);
    const quarterStart = new Date(parseInt(yearStr), (qNum - 1) * 3, 1);
    const quarterEnd = new Date(parseInt(yearStr), qNum * 3, 0);

    // Fetch all selected asesors
    const selectedAsesors = await prisma.asesor.findMany({
      where: { id: { in: asesorIds } },
    });

    // For each, find the evaluation in the requested quarter (via MET group)
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      // Collect streams for archiver
      const chunks: Buffer[] = [];
      const archive = archiver("zip", { zlib: { level: 5 } });

      archive.on("data", (c: Buffer) => chunks.push(c));

      for (const asesor of selectedAsesors) {
        // Find all asesors in same MET group
        const metGroup = asesor.metNumber
          ? await prisma.asesor.findMany({ where: { metNumber: asesor.metNumber } })
          : [asesor];

        const metIds = metGroup.map(a => a.id);

        // Get all subklasifikasi from metGroup
        const allSubklasifikasi = metGroup
          .map(a => a.subklasifikasiSkk)
          .filter((v): v is string => v !== null && v !== undefined);
        const uniqueSubklasifikasi = [...new Set(allSubklasifikasi)];
        const skemaSertifikasi = uniqueSubklasifikasi.join(', ');

        // Get no registrasi from BALAI
        const noRegistrasiAskom = await getNoRegistrasiAskom(asesor.metNumber || '');

        const evaluation = await prisma.asesorEvaluation.findFirst({
          where: {
            asesorId: { in: metIds },
            periodStartDate: { gte: quarterStart },
            periodEndDate: { lte: quarterEnd },
          },
        });

        if (!evaluation) continue;

        const html = buildHtml(asesor, evaluation, skemaSertifikasi, noRegistrasiAskom);
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdf = await page.pdf({
          format: "letter",
          printBackground: true,
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        });
        await page.close();

        const filename = `penilaian-${asesor.name.replace(/\s+/g, "-").toLowerCase()}-${quarter}.pdf`;
        archive.append(pdf, { name: filename });
      }

      await archive.finalize();
      const zipBuffer = Buffer.concat(chunks);

      return new NextResponse(zipBuffer, {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="penilaian-asesors-${quarter}.zip"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
