import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EvaluateForm from "../EvaluateForm";

const aspects = [
  { no: 1, name: "Penyelesaian waktu laporan", indicator: "Ketepatan penyerahan laporan asesmen dan kelengkapan hasil setelah kegiatan", weight: 10 },
  { no: 2, name: "Kemudahan berkomunikasi", indicator: "Respons, kejelasan informasi, dan kemudahan koordinasi dengan LSP, asesi, dan pihak TUK", weight: 10 },
  { no: 3, name: "Kualitas keputusan asesmen", indicator: "Keputusan kompeten/belum kompeten didukung bukti dan minim banding atau revisi", weight: 15 },
  { no: 4, name: "Penjelasan proses asesmen", indicator: "Asesi mendapatkan penjelasan memadai mengenai proses asesmen", weight: 8 },
  { no: 5, name: "Kesempatan mempelajari standar kompetensi", indicator: "Asesi diberi kesempatan mempelajari standar dan menilai diri sendiri", weight: 4 },
  { no: 6, name: "Diskusi metode, instrumen, dan jadwal", indicator: "Asesor membuka ruang diskusi/negosiasi metode, instrumen, sumber asesmen, dan jadwal", weight: 4 },
  { no: 7, name: "Penggalian bukti yang relevan", indicator: "Asesor menggali seluruh bukti pendukung sesuai latar belakang pelatihan dan pengalaman asesi", weight: 8 },
  { no: 8, name: "Kesempatan demonstrasi kompetensi", indicator: "Asesi diberi kesempatan penuh mendemonstrasikan kompetensi yang dimiliki", weight: 8 },
  { no: 9, name: "Penjelasan keputusan asesmen", indicator: "Asesi mendapatkan penjelasan memadai atas hasil/keputusan asesmen", weight: 8 },
  { no: 10, name: "Umpan balik dan tindak lanjut", indicator: "Asesor memberikan umpan balik yang mendukung setelah asesmen serta tindak lanjut", weight: 8 },
  { no: 11, name: "Penelaahan dan penandatanganan dokumen asesmen", indicator: "Asesor bersama asesi mempelajari seluruh dokumen asesmen serta menandatanganinya", weight: 6 },
  { no: 12, name: "Jaminan kerahasiaan dokumen dan hasil", indicator: "Asesi mendapat penjelasan mengenai kerahasiaan hasil dan penanganan dokumen", weight: 5 },
  { no: 13, name: "Keterampilan komunikasi efektif saat asesmen", indicator: "Asesor menggunakan komunikasi efektif selama asesmen", weight: 6 },
];

export default async function EditEvaluatePage({
  params,
}: {
  params: { id: string; evaluationId: string };
}) {
  const evaluation = await prisma.asesorEvaluation.findUnique({
    where: { id: Number(params.evaluationId) },
    include: { asesor: true },
  });

  if (!evaluation || !evaluation.asesor) notFound();

  const { asesor } = evaluation;

  const sameMetAsesors = await prisma.asesor.findMany({
    where: { metNumber: asesor.metNumber },
  });

  const subklasifikasiList = [...new Set(
    sameMetAsesors.map(a => a.subklasifikasiSkk).filter(Boolean) as string[]
  )];

  const weightMap = aspects.map(a => a.weight);
  const scores = weightMap.map((_, i) => (evaluation as any)[`score${i + 1}`] ?? 0);

  const quarter = Math.floor(new Date(evaluation.periodStartDate).getMonth() / 3) + 1;
  const year = evaluation.year;

  return (
    <div className="space-y-6">
      <Link href={`/hr-manager/asesors/${asesor.id}`} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Detail Asesor
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Penilaian Kinerja Asesor</h1>
        <p className="text-slate-600">{asesor.name} — {year}-Q{quarter}</p>
      </div>

      <Suspense fallback={<div>Memuat form...</div>}>
        <EvaluateForm
          asesorId={asesor.id}
          asesorName={asesor.name}
          year={year}
          quarter={quarter}
          periodStartDate={evaluation.periodStartDate.toISOString()}
          periodEndDate={evaluation.periodEndDate.toISOString()}
          aspects={aspects}
          subklasifikasiList={subklasifikasiList}
          evaluationId={evaluation.id}
          initialScores={scores}
          initialDevelopmentNote={evaluation.developmentNote || ""}
        />
      </Suspense>
    </div>
  );
}
