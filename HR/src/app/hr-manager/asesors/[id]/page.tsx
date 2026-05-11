import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Award, ArrowLeft, Download, Pencil } from "lucide-react";
import { getAsesorById } from "@/lib/asesor";
import { notFound } from "next/navigation";
import Link from "next/link";

function getQuarterKey(date: Date): string {
  const month = date.getMonth();
  const quarter = Math.floor(month / 3) + 1;
  return `${date.getFullYear()}-Q${quarter}`;
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-amber-100 text-amber-700', 'bg-orange-100 text-orange-700',
    'bg-emerald-100 text-emerald-700', 'bg-teal-100 text-teal-700',
    'bg-cyan-100 text-cyan-700', 'bg-sky-100 text-sky-700',
    'bg-indigo-100 text-indigo-700', 'bg-violet-100 text-violet-700',
    'bg-rose-100 text-rose-700', 'bg-lime-100 text-lime-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function ScoreBar({ label, score, maxScore = 100 }: { label: string; score: number | null; maxScore?: number }) {
  const pct = score !== null ? (score / maxScore) * 100 : 0;
  const color = score === null ? 'bg-slate-200' : score >= 90 ? 'bg-green-500' : score >= 75 ? 'bg-blue-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-slate-600 w-8">{label}</span>
      <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden relative">
        {score !== null && (
          <div className={`h-full ${color} rounded-lg transition-all duration-500 flex items-center justify-end pr-2`}
            style={{ width: `${Math.max(pct, 10)}%` }}>
            <span className="text-xs font-bold text-white">{score}</span>
          </div>
        )}
        {score === null && (
          <div className="h-full flex items-center justify-center">
            <span className="text-xs text-slate-400">Belum dinilai</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function AsesorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getAsesorById(parseInt(params.id));

  if (!data || !data.asesor) notFound();

  const { asesor, sameMetAsesors, evaluations } = data;

  const now = new Date();
  const currentQuarter = getQuarterKey(now);

  const currentEvaluation = evaluations.find(e => {
    return getQuarterKey(new Date(e.periodStartDate)) === currentQuarter;
  });

  // Group by year-quarter
  const evaluationsByPeriod = evaluations.reduce((acc, ev) => {
    const year = ev.year;
    if (!acc[year]) acc[year] = { Q1: null, Q2: null, Q3: null, Q4: null };
    const quarter = Math.floor(new Date(ev.periodStartDate).getMonth() / 3) + 1;
    acc[year][`Q${quarter}` as 'Q1' | 'Q2' | 'Q3' | 'Q4'] = ev.finalScore;
    return acc;
  }, {} as Record<number, { Q1: number | null; Q2: number | null; Q3: number | null; Q4: number | null }>);

  const years = Object.keys(evaluationsByPeriod).map(Number).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/hr-manager/asesors" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Asesor
      </Link>

      {/* Profile + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${getAvatarColor(asesor.name)}`}>
              {getInitials(asesor.name)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">{asesor.name}</h2>
              <p className="text-sm text-slate-500">Asesor Kompetensi</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Nomor MET</p>
                  <p className="font-semibold text-slate-900 font-mono">{asesor.metNumber || '-'}</p>
                </div>
                {asesor.email && (
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="font-semibold text-slate-900">{asesor.email}</p>
                  </div>
                )}
                {asesor.phone && (
                  <div>
                    <p className="text-slate-500">Telepon</p>
                    <p className="font-semibold text-slate-900">{asesor.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {sameMetAsesors.length > 1 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Sertifikasi Kompetensi Kerja ({sameMetAsesors.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sameMetAsesors.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-50 rounded-lg">
                    {a.subklasifikasiSkk && (
                      <p className="text-xs text-slate-500 mb-1">{a.subklasifikasiSkk}</p>
                    )}
                    <p className="font-mono text-sm font-medium text-slate-900">{a.skkNo || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current Quarter */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Penilaian Terkini</h3>
                <p className="text-xs text-slate-500">{currentQuarter}</p>
              </div>
            </div>
            {!currentEvaluation && (
              <Link
                href={`/hr-manager/asesors/${asesor.id}/evaluate`}
                className="px-6 py-3 bg-primary text-white text-base font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
              >
                + Penilaian
              </Link>
            )}
            {currentEvaluation && (
              <Link
                href={`/hr-manager/asesors/${asesor.id}/evaluate/${currentEvaluation.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Link>
            )}
          </div>

          {currentEvaluation ? (
            <div>
              <div className="text-center mb-4">
                <p className="text-5xl font-bold text-slate-900">{currentEvaluation.finalScore}</p>
                <Badge className={`${
                  currentEvaluation.conclusion === 'A' ? 'bg-green-100 text-green-700' :
                  currentEvaluation.conclusion === 'B' ? 'bg-blue-100 text-blue-700' :
                  currentEvaluation.conclusion === 'C' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {currentEvaluation.conclusion} - {
                    currentEvaluation.conclusion === 'A' ? 'Sangat Baik' :
                    currentEvaluation.conclusion === 'B' ? 'Baik' :
                    currentEvaluation.conclusion === 'C' ? 'Cukup' : 'Kurang'
                  }
                </Badge>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <p>Skema: {currentEvaluation.schema || '-'}</p>
                <p>Periode: {new Date(currentEvaluation.periodStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500">Belum ada penilaian untuk quarter ini</p>
            </div>
          )}
        </div>
      </div>

      {/* Chart per Year */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-6">Perbandingan Penilaian per Tahun</h3>

        {years.length > 0 ? (
          <div className="space-y-8">
            {years.map((year) => {
              const yearData = evaluationsByPeriod[year];
              const hasAny = yearData.Q1 !== null || yearData.Q2 !== null || yearData.Q3 !== null || yearData.Q4 !== null;

              return (
                <div key={year}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-800">{year}</h4>
                    {hasAny && (
                      <span className="text-sm text-slate-500">
                        Rata-rata: {Math.round(((yearData.Q1 || 0) + (yearData.Q2 || 0) + (yearData.Q3 || 0) + (yearData.Q4 || 0)) / [yearData.Q1, yearData.Q2, yearData.Q3, yearData.Q4].filter(v => v !== null).length)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <ScoreBar label="Q1" score={yearData.Q1} />
                    <ScoreBar label="Q2" score={yearData.Q2} />
                    <ScoreBar label="Q3" score={yearData.Q3} />
                    <ScoreBar label="Q4" score={yearData.Q4} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">Belum ada data penilaian</p>
          </div>
        )}
      </div>

      {/* Evaluation History */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Riwayat Penilaian Lengkap</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Periode</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Skema</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Unit/Tempat Uji</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Nilai Akhir</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Kesimpulan</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Dinilai Oleh</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev) => (
                <tr key={ev.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {new Date(ev.periodStartDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-xs text-slate-500">
                          s/d {new Date(ev.periodEndDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">{ev.schema || '-'}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{ev.unit || '-'}</td>
                  <td className="py-3 px-4">
                    <span className="text-lg font-bold text-primary">{ev.finalScore}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`${
                      ev.conclusion === 'A' ? 'bg-green-100 text-green-700' :
                      ev.conclusion === 'B' ? 'bg-blue-100 text-blue-700' :
                      ev.conclusion === 'C' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {ev.conclusion} - {
                        ev.conclusion === 'A' ? 'Sangat Baik' :
                        ev.conclusion === 'B' ? 'Baik' :
                        ev.conclusion === 'C' ? 'Cukup' : 'Kurang'
                      }
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">{ev.evaluator.name}</td>
                  <td className="py-3 px-4 text-center">
                    <a
                      href={`/api/asesors/${asesor.id}/report?evaluationId=${ev.id}`}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </td>
                </tr>
              ))}
              {evaluations.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Belum ada riwayat penilaian
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
