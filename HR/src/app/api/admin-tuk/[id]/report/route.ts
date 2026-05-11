import { NextRequest, NextResponse } from "next/server";
import { getAdminTUKById } from "@/lib/admin-tuk";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

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

function getQuarterKey(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}-Q${quarter}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const evaluationId = searchParams.get("evaluationId");

  const data = await getAdminTUKById(parseInt(params.id));
  if (!data || !data.adminTUK) {
    return NextResponse.json({ error: "Admin TUK tidak ditemukan" }, { status: 404 });
  }

  const { adminTUK, evaluations } = data;

  let ev;
  if (evaluationId) {
    ev = evaluations.find((e) => e.id === parseInt(evaluationId));
  } else {
    const currentQuarter = getQuarterKey(new Date());
    ev = evaluations.find((e) => getQuarterKey(new Date(e.periodStartDate)) === currentQuarter);
  }

  if (!ev) {
    return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
  }

  const quarterKey = getQuarterKey(new Date(ev.periodStartDate));

  const scores = Array.from({ length: 13 }, (_, i) => (ev as any)[`score${i + 1}`] || 0);
  const nilaiBobot = scores.map((s, i) => ((s * WEIGHTS[i]) / 10).toFixed(1));
  const totalNilaiBobot = nilaiBobot.reduce((a, b) => a + parseFloat(b), 0).toFixed(1);

  const conclusionLabel: Record<string, string> = {
    A: "A - Kinerja sangat memuaskan",
    B: "B - Kinerja memuaskan",
    C: "C - Kinerja cukup",
    D: "D - Kinerja kurang",
  };

  const periodLabel = `${new Date(ev.periodStartDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} s/d ${new Date(ev.periodEndDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`;

  const scoreRows = ASPEK.map(
    (aspek, i) => `
    <tr>
      <td style="text-align:center;">${i + 1}</td>
      <td>${aspek[0]}</td>
      <td>${aspek[1]}</td>
      <td style="text-align:center;">${WEIGHTS[i]}</td>
      <td style="text-align:center;">${scores[i]}</td>
      <td style="text-align:center;">${nilaiBobot[i]}</td>
    </tr>`
  ).join("");

  const templatePath = path.join(process.cwd(), "public", "template.jpg");
  const templateB64 = fs.readFileSync(templatePath).toString("base64");
  const templateDataUri = `data:image/jpeg;base64,${templateB64}`;

  const ttdDirekturPath = path.join(process.cwd(), "public", "ttddirektur.png");
  const ttdDirekturB64 = fs.readFileSync(ttdDirekturPath).toString("base64");
  const ttdDirekturUri = `data:image/png;base64,${ttdDirekturB64}`;

  const ttdHrPath = path.join(process.cwd(), "public", "ttdhr.png");
  const ttdHrB64 = fs.readFileSync(ttdHrPath).toString("base64");
  const ttdHrUri = `data:image/png;base64,${ttdHrB64}`;

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>Penilaian Kinerja Admin TUK - ${adminTUK.name}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @page { size: letter; margin: 0; }
  html, body { width: 8.5in; height: 11in; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; }
  .bg {
    position: fixed; top: 0; left: 0;
    width: 8.5in; height: 11in;
    background-image: url('${templateDataUri}');
    background-size: 8.5in 11in;
    background-repeat: no-repeat; z-index: -1;
  }
  .content { padding: 80px 60px 80px; }
  h3 { text-align: center; margin: 3px 0; font-size: 13px; }
  h4 { text-align: center; margin: 8px 0 4px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 6px; }
  th, td { border: 1px solid #000; padding: 4px 6px; vertical-align: top; }
  th { background-color: rgba(217,237,247,0.85); font-size: 10px; }
  td { font-size: 10px; }
  .no-border td { border: none; }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: bold; }
</style>
</head>
<body>
<div class="bg"></div>
<div class="content">
  <h3>PENILAIAN KINERJA ADMIN TUK</h3>
  <h3>LEMBAGA SERTIFIKASI PROFESI</h3>
  <h3>GATENSI KARYA KONSTRUKSI</h3>
  <br/><br/><br/>
  <table>
    <tr>
      <td width="25%" style="background-color: #315098;color: white; font-weight: bold">Nama Admin TUK</td>
      <td width="25%">${adminTUK.name}</td>
      <td width="15%" style="background-color: #315098;color: white; font-weight: bold">Tahun</td>
      <td width="35%">${ev.year}</td>
    </tr>
    <tr>
      <td style="background-color: #315098;color: white; font-weight: bold">No. Registrasi</td>
      <td>${adminTUK.registrationNo || "-"}</td>
      <td style="background-color: #315098;color: white; font-weight: bold">Jenis TUK</td>
      <td>${adminTUK.tukType === 1 ? "Mandiri" : "Sewaktu"}</td>
    </tr>
    <tr>
      <td style="background-color: #315098;color: white; font-weight: bold">Provinsi</td>
      <td>${adminTUK.province || "-"}</td>
      <td style="background-color: #315098;color: white; font-weight: bold">Periode Penilaian</td>
      <td>${periodLabel}</td>
    </tr>
    <tr>
      <td style="background-color: #315098;color: white; font-weight: bold">Wilayah</td>
      <td>${adminTUK.adminRegion || "-"}</td>
      <td style="background-color: #315098;color: white; font-weight: bold">Admin TUK</td>
      <td>${adminTUK.adminName || "-"}</td>
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
    <div style="position: fixed; top: 11in; left: 0; width: 8.5in; height: 11in; background: white; z-index: 1;"></div>
    <div style="position: relative; z-index: 2;">
      <p style="text-align: left; margin-bottom: 5px;">CATATAN PENGEMBANGAN (jika ada)</p>
      <p style="border: 0.2px solid #000; padding: 6px; min-height: 60px;">${ev.developmentNote || "Tidak ada catatan pengembangan."}</p>
      <br><br/><br/><br/>
      <p style="text-align:right; padding-right: 10%;">Jakarta, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
      <table class="no-border">
        <tr>
          <td width="50%" style="padding-left: 5%;">Disetujui oleh</td>
          <td width="50%" style="padding-left: 5%;">Dinilai oleh</td>
        </tr>
        <tr>
          <td style="padding-left: 1%; vertical-align: bottom;"><img src="${ttdDirekturUri}" style="max-height: 80px; max-width: 140px;" /></td>
          <td style="vertical-align: bottom; text-align: left;padding-left: 3%;"><img src="${ttdHrUri}" style="max-height: 80px; max-width: 140px;" /></td>
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

  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "letter", printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
    const filename = `penilaian-admin-tuk-${adminTUK.name.replace(/\s+/g, "-").toLowerCase()}-${quarterKey}.pdf`;
    return new NextResponse(pdf, {
      headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"` },
    });
  } finally {
    await browser.close();
  }
}
