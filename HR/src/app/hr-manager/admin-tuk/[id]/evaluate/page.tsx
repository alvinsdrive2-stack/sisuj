import { Suspense } from "react";
import { getAdminTUKById } from "@/lib/admin-tuk";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EvaluateForm from "./EvaluateForm";

export default async function EvaluatePage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getAdminTUKById(parseInt(params.id));
  if (!data || !data.adminTUK) notFound();

  const { adminTUK } = data;

  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();
  const periodStartDate = new Date(year, (quarter - 1) * 3, 1);
  const periodEndDate = new Date(year, quarter * 3, 0);

  const currentQuarter = (() => {
    const q = Math.floor(now.getMonth() / 3) + 1;
    return `${now.getFullYear()}-Q${q}`;
  })();

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

  return (
    <div className="space-y-6">
      <Link href={`/hr-manager/admin-tuk/${adminTUK.id}`} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Detail Admin TUK
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Penilaian Kinerja Admin TUK</h1>
        <p className="text-slate-600">{adminTUK.name} — {currentQuarter}</p>
      </div>

      <Suspense fallback={<div className="text-slate-500">Memuat form...</div>}>
        <EvaluateForm
          adminTukId={adminTUK.id}
          adminTukName={adminTUK.name}
          year={year}
          quarter={quarter}
          periodStartDate={periodStartDate.toISOString()}
          periodEndDate={periodEndDate.toISOString()}
          aspects={aspects}
        />
      </Suspense>
    </div>
  );
}
