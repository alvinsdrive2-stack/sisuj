import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Award, ArrowLeft, Download, Pencil } from "lucide-react";
import { getAdminTUKById } from "@/lib/admin-tuk";
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

export default async function AdminTUKDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await getAdminTUKById(parseInt(params.id));
  if (!data || !data.adminTUK) notFound();

  const { adminTUK, evaluations } = data;
  const now = new Date();
  const currentQuarter = getQuarterKey(now);

  const currentEvaluation = evaluations.find(e => getQuarterKey(new Date(e.periodStartDate)) === currentQuarter);

  const evaluationsByPeriod: any = {};
  for (const ev of evaluations) {
    const year = ev.year;
    if (!evaluationsByPeriod[year]) evaluationsByPeriod[year] = { Q1: null, Q2: null, Q3: null, Q4: null };
    const quarter = Math.floor(new Date(ev.periodStartDate).getMonth() / 3) + 1;
    evaluationsByPeriod[year]['Q' + quarter] = ev.finalScore;
  }

  const years = Object.keys(evaluationsByPeriod).map(Number).sort((a, b) => b - a);

  return (
    <div className="space-y-6">
      <Link href="/hr-manager/asesors" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Admin TUK
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${getAvatarColor(adminTUK.name)}`}>
              {getInitials(adminTUK.name)}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">{adminTUK.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={adminTUK.tukType === 1 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}>
                  {adminTUK.tukType === 1 ? "Mandiri" : "Sewaktu"}
                </Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">No. Registrasi</p>
                  <p className="font-semibold text-slate-900 font-mono">{adminTUK.registrationNo || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Provinsi</p>
                  <p className="font-semibold text-slate-900">{adminTUK.province || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Wilayah</p>
                  <p className="font-semibold text-slate-900">{adminTUK.adminRegion || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Admin TUK</p>
                  <p className="font-semibold text-slate-900">{adminTUK.adminName || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {adminTUK.address && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-start gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{adminTUK.address}</p>
              </div>
            </div>
          )}
        </div>

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
              <Link href={`/hr-manager/admin-tuk/${adminTUK.id}/evaluate`}
                className="px-6 py-3 bg-primary text-white text-base font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg">
                + Penilaian
              </Link>
            )}
            {currentEvaluation && (
              <Link href={`/hr-manager/admin-tuk/${adminTUK.id}/evaluate/${currentEvaluation.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Riwayat Penilaian Lengkap</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm text-slate-700">Periode</th>
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
                      href={`/api/admin-tuk/${adminTUK.id}/report?evaluationId=${ev.id}`}
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
                <tr><td colSpan={5} className="py-8 text-center text-slate-500">Belum ada riwayat penilaian</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
