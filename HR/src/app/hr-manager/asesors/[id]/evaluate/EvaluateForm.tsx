"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/contexts/ToastContext";
import { Search, ChevronDown } from "lucide-react";

interface Aspect {
  no: number;
  name: string;
  indicator: string;
  weight: number;
}

interface EvaluateFormProps {
  asesorId: number;
  asesorName: string;
  year: number;
  quarter: number;
  periodStartDate: string;
  periodEndDate: string;
  aspects: Aspect[];
  subklasifikasiList: string[];
  evaluationId?: number;
  initialScores?: number[];
  initialDevelopmentNote?: string;
}

const DEFAULT_SCORES = [8, 7, 9, 7, 6, 6, 8, 7, 8, 7, 7, 8, 7];

// Deterministic "random" distribution: cross-subsidize scores around a target
function distributeScores(targetFinal: number, weights: number[]): number[] {
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  if (targetFinal >= 100) return weights.map(() => 10);
  if (targetFinal <= 0) return weights.map(() => 1);

  const seed = targetFinal * 13 + 7;

  const rawScores = weights.map((_, i) => {
    const hash = Math.sin(seed * (i + 1) * 0.618) * 10000;
    return 5.5 + (hash - Math.floor(hash)) * 5;
  });

  const rawFinal = rawScores.reduce((sum, s, i) => sum + s * weights[i], 0) / totalWeight * 10;
  const targetScale = targetFinal / rawFinal;

  let scores = rawScores.map(s => Math.min(Math.max(Math.round(s * targetScale), 1), 10));

  // Bump lowest scores to 10 if clamping caused deficit
  let currentFinal = Math.round(scores.reduce((sum, s, i) => sum + s * weights[i], 0) / totalWeight * 10);
  if (currentFinal < targetFinal) {
    const indices = scores.map((s, i) => ({ s, i })).sort((a, b) => a.s - b.s).map(x => x.i);
    for (const idx of indices) {
      if (currentFinal >= targetFinal) break;
      if (scores[idx] >= 10) continue;
      const gain = Math.round((10 - scores[idx]) * weights[idx] / totalWeight * 10);
      scores[idx] = 10;
      currentFinal += gain;
    }
  }

  return scores;
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-amber-600";
  return "text-red-500";
}

export default function EvaluateForm({
  asesorId,
  asesorName,
  year,
  quarter,
  periodStartDate,
  periodEndDate,
  aspects,
  subklasifikasiList,
  evaluationId,
  initialScores,
  initialDevelopmentNote,
}: EvaluateFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [scores, setScores] = useState<number[]>(initialScores || []);
  const [schema, setSchema] = useState(subklasifikasiList.join(", "));
  const [unit, setUnit] = useState("");
  const [developmentNote, setDevelopmentNote] = useState(initialDevelopmentNote || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tukList, setTukList] = useState<string[]>([]);
  const [showTuk, setShowTuk] = useState(false);
  const [tukIndex, setTukIndex] = useState(-1);
  const [sliderTarget, setSliderTarget] = useState<number | null>(null);
  const tukRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const filteredTuk = unit.length > 0
    ? tukList.filter((t) => t.toLowerCase().includes(unit.toLowerCase()))
    : tukList;

  useEffect(() => {
    fetch("/api/tuk")
      .then((res) => res.json())
      .then((data) => setTukList(data.map((d: any) => d.Nama)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tukRef.current && !tukRef.current.contains(e.target as Node)) {
        setShowTuk(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const weightMap = aspects.map(a => a.weight);
  const totalWeight = weightMap.reduce((a, b) => a + b, 0);

  // Initialize scores on mount (create mode only)
  if (!initialized.current && weightMap.length > 0 && !initialScores) {
    initialized.current = true;
    const initTarget = Math.round(DEFAULT_SCORES.reduce((sum, s, i) => sum + s * weightMap[i], 0) / totalWeight * 10);
    setScores(distributeScores(initTarget, weightMap));
    setSliderTarget(initTarget);
  }
  if (!initialized.current && initialScores && weightMap.length > 0) {
    initialized.current = true;
    const computedTarget = Math.round(initialScores.reduce((sum, s, i) => sum + s * weightMap[i], 0) / totalWeight * 10);
    setSliderTarget(computedTarget);
  }

  const nilaiBobot = scores.length > 0 ? scores.map((s, i) => (s * weightMap[i]) / 10) : [];
  const totalNilaiBobot = nilaiBobot.length > 0 ? nilaiBobot.reduce((a, b) => a + b, 0) : 0;
  const computedFinal = scores.length > 0 ? Math.round(totalNilaiBobot) : 0;

  const effectiveTarget = sliderTarget ?? 75;

  let conclusion: string;
  let conclusionColor: string;
  if (computedFinal >= 90) { conclusion = "A - Kinerja sangat memuaskan"; conclusionColor = "text-green-600"; }
  else if (computedFinal >= 75) { conclusion = "B - Kinerja memuaskan"; conclusionColor = "text-blue-600"; }
  else if (computedFinal >= 60) { conclusion = "C - Kinerja cukup"; conclusionColor = "text-amber-600"; }
  else { conclusion = "D - Perlu peningkatan"; conclusionColor = "text-red-500"; }

  const handleFinalScoreChange = (target: number) => {
    setSliderTarget(target);
    const newScores = distributeScores(target, weightMap);
    setScores(newScores);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = evaluationId
        ? `/api/asesors/evaluations/${evaluationId}`
        : "/api/asesors/evaluate";
      const method = evaluationId ? "PATCH" : "POST";

      const body = evaluationId
        ? { scores, developmentNote: developmentNote || null }
        : {
            asesorId,
            year,
            period: `Q${quarter}`,
            periodStartDate,
            periodEndDate,
            schema: schema || null,
            unit: unit || null,
            scores,
            developmentNote: developmentNote || null,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menyimpan penilaian");
      }

      showSuccess(evaluationId ? "Penilaian berhasil diperbarui!" : "Penilaian berhasil disimpan!");
      router.push(`/hr-manager/asesors/${asesorId}`);
    } catch (err: any) {
      showError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Nama Asesor</p>
            <p className="font-semibold text-slate-900">{asesorName}</p>
          </div>
          <div>
            <p className="text-slate-500">Tahun</p>
            <p className="font-semibold text-slate-900">{year}</p>
          </div>
          <div>
            <p className="text-slate-500">Periode</p>
            <p className="font-semibold text-slate-900">Q{quarter}</p>
          </div>
          <div>
            <p className="text-slate-500">Skema Sertifikasi</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{subklasifikasiList.join(", ") || "-"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-slate-500">Unit/Tempat Uji</p>
            <div className="relative mt-1" ref={tukRef}>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => { setUnit(e.target.value); setShowTuk(true); setTukIndex(-1); }}
                  onFocus={() => setShowTuk(true)}
                  onKeyDown={(e) => {
                    if (!showTuk || filteredTuk.length === 0) return;
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setTukIndex((i) => Math.min(i + 1, filteredTuk.length - 1));
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setTukIndex((i) => Math.max(i - 1, 0));
                    } else if (e.key === "Enter" && tukIndex >= 0) {
                      e.preventDefault();
                      setUnit(filteredTuk[tukIndex]);
                      setShowTuk(false);
                      setTukIndex(-1);
                    } else if (e.key === "Tab") {
                      const pick = tukIndex >= 0 ? filteredTuk[tukIndex] : filteredTuk[0];
                      if (pick) setUnit(pick);
                      setShowTuk(false);
                      setTukIndex(-1);
                    } else if (e.key === "Escape") {
                      setShowTuk(false);
                      setTukIndex(-1);
                    }
                  }}
                  placeholder="Ketik atau pilih TUK..."
                  className="w-full pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                <button type="button" onClick={() => setShowTuk(!showTuk)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <ChevronDown className={`w-4 h-4 transition-transform ${showTuk ? "rotate-180" : ""}`} />
                </button>
              </div>
              {showTuk && filteredTuk.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                  {filteredTuk.map((tuk, idx) => (
                    <button
                      key={tuk}
                      type="button"
                      onClick={() => { setUnit(tuk); setShowTuk(false); setTukIndex(-1); }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        idx === tukIndex
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {tuk}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-center py-3 px-3 font-semibold text-sm text-slate-700 w-10">No</th>
                <th className="text-left py-3 px-3 font-semibold text-sm text-slate-700">Aspek Penilaian</th>
                <th className="text-left py-3 px-3 font-semibold text-sm text-slate-700">Indikator Terukur</th>
                <th className="text-center py-3 px-3 font-semibold text-sm text-slate-700 w-16">Bobot</th>
                <th className="text-center py-3 px-3 font-semibold text-sm text-slate-700 w-16">Skor</th>
                <th className="text-center py-3 px-3 font-semibold text-sm text-slate-700 w-24">Nilai Bobot</th>
              </tr>
            </thead>
            <tbody>
              {scores.length > 0 && aspects.map((aspect, i) => (
                <tr key={aspect.no} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="text-center py-3 px-3 text-sm text-slate-700">{aspect.no}</td>
                  <td className="py-3 px-3 text-sm font-medium text-slate-900">{aspect.name}</td>
                  <td className="py-3 px-3 text-xs text-slate-600">{aspect.indicator}</td>
                  <td className="text-center py-3 px-3 text-sm font-semibold text-slate-700">{aspect.weight}</td>
                  <td className="py-3 px-3 text-center">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={scores[i]}
                      onChange={(e) => {
                        const val = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 10);
                        const newScores = [...scores];
                        newScores[i] = val;
                        setScores(newScores);
                      }}
                      className={`w-14 text-center text-lg font-bold tabular-nums border border-slate-200 rounded-lg py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 ${getScoreColor(scores[i])}`}
                    />
                  </td>
                  <td className="text-center py-3 px-3 text-sm font-semibold text-primary">
                    {nilaiBobot[i].toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Rekap Hasil</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Total Bobot</p>
            <p className="text-2xl font-bold text-slate-900">{totalWeight}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">Total Nilai Bobot</p>
            <p className="text-2xl font-bold text-slate-900">{totalNilaiBobot.toFixed(1)}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 mb-2">Nilai Akhir</p>
            <div className="flex flex-col items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={effectiveTarget}
                onChange={(e) => handleFinalScoreChange(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer accent-primary"
              />
              <span className={`text-3xl font-bold tabular-nums ${conclusionColor}`}>
                {computedFinal}
              </span>
            </div>
          </div>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-primary">Kesimpulan</p>
            <p className={`text-lg font-bold ${conclusionColor}`}>{conclusion}</p>
          </div>
        </div>
      </div>

      {/* Catatan */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-3">Catatan Pengembangan</h3>
        <textarea
          value={developmentNote}
          onChange={(e) => setDevelopmentNote(e.target.value)}
          placeholder="Tuliskan catatan pengembangan jika ada..."
          rows={4}
          className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Menyimpan...
            </div>
          ) : (
            "Simpan Penilaian"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
