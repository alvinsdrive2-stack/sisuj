import { useState, useEffect, useCallback, useMemo } from "react"
import AsesmenBreadcrumb from "@/components/AsesmenBreadcrumb"
import { useNavigate, useParams } from "react-router-dom"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { RoleId } from "@/lib/rbac-config"
import { useToast } from "@/contexts/ToastContext"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { useAbsenCheck } from "@/hooks/useAbsenCheck"
import { useSigningState, BarcodeState } from "@/hooks/useSigningState"
import { getAsesmenSteps, getStepNumberFromHref } from "@/lib/asesmen-steps"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { CustomRadio } from "@/components/ui/Radio"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"
import { WebcamModal } from "@/components/ui/WebcamModal"
import { kegiatanService } from "@/lib/kegiatan-service"
import { API_BASE_URL } from "@/config/api"

interface Unit { id: number; kode: string }
interface Kuk { id: number; kode: string }
interface Soal {
  id: number; no: string; id_unitkompetensi: string; id_kuk: string | null
  jenis: string; soal: string
  jawab_a: string; jawab_b: string; jawab_c: string; jawab_d: string
  kunci_jawaban: string
  jawaban_asesi: string | null
  unit: Unit; kuk: Kuk | null
}

interface Ia05Response {
  message: string
  data: { dokumen: { id: number }; soal: Soal[]; barcodes?: any; umpan_balik?: string }
}

export default function Ia05KANPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { role: asesorRole } = useAsesorRole(id)
  const { jenjang, metode, asesorList, jadwalId, jabatanKerja, nomorSkema, tuk, namaAsesi } = useDataDokumenAsesmen(id)
  const { showSuccess, showError, showWarning } = useToast()
  const { tahap } = useDataDokumenPraAsesmen(id)

  const isAsesor = user?.role?.id === RoleId.ASESOR
  const isAsesi = user?.role?.id === RoleId.ASESI
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap])
  const currentStep = getStepNumberFromHref(asesmenSteps, '/asesi/asesmen/ia05')

  const { showAwalModal, submitAbsenAwal, handleAwalModalClose } = useAbsenCheck({
    phase: 'asesmen', role: 'auto', checkOnMount: true, idIzin: id, asesorList
  })

  const [data, setData] = useState<Ia05Response["data"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({})
  const [umpanBalik, setUmpanBalik] = useState("")
  const [barcodes, setBarcodes] = useState<any>(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE_URL}/asesmen/${id}/ia05`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const result: Ia05Response = await res.json()
        setData(result.data)
        if (result.data.barcodes) setBarcodes(result.data.barcodes)
        const a: Record<number, 'A'|'B'|'C'|'D'> = {}
        result.data.soal.forEach(s => { if (s.jawaban_asesi) a[s.id] = s.jawaban_asesi as 'A'|'B'|'C'|'D' })
        setAnswers(a)
        if (result.data.umpan_balik) setUmpanBalik(result.data.umpan_balik)
      }
    } catch (e) { console.error("Error fetching IA.05 KAN:", e)
    } finally { setIsLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const jumlahSoal = data?.soal.length || 0
  const jumlahBenar = useMemo(() =>
    data?.soal.filter(s => s.jawaban_asesi === s.kunci_jawaban).length || 0,
    [data, answers])
  const jumlahSalah = jumlahSoal - jumlahBenar

  const nextStepLabel = asesmenSteps[asesmenSteps.findIndex(s => s.href.includes('ia05')) + 1]?.label

  const signing = useSigningState({
    pageKey: 'ia05', isAsesor, tahap,
    barcodes: barcodes as unknown as BarcodeState | null,
    setBarcodes: setBarcodes as unknown as React.Dispatch<React.SetStateAction<BarcodeState | null>>,
    asesorList, userId: user?.id, userName: user?.name, isSaving, idIzin: id, jadwalId,
    nextPageName: nextStepLabel, onRefresh: fetchData,
  })

  const handleAnswerChange = (soalId: number, answer: 'A' | 'B' | 'C' | 'D') =>
    setAnswers(prev => ({ ...prev, [soalId]: answer }))

  const handleSubmit = async () => {
    if (!data || !id) { showWarning("Data belum dimuat."); return }
    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      const answersPayload = data.soal.filter(s => answers[s.id]).map(s => ({ soal_id: s.id, jawaban: answers[s.id] }))
      const payload = { id_izin: id, dokumen_id: data.dokumen.id, answers: answersPayload, umpan_balik: umpanBalik || undefined }

      const res = await fetch(`${API_BASE_URL}/asesmen/${id}/ia05`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        showSuccess("IA.05 berhasil disimpan!")
        signing.publishUpdate()
        if (jadwalId) { await kegiatanService.generateQRIa05(id, jadwalId) }

        const next = asesmenSteps[asesmenSteps.findIndex(s => s.href.includes('ia05')) + 1]
        const path = next ? next.href.replace("/asesi/asesmen/", `/asesi/asesmen/${id}/`) : `/asesi/asesmen/${id}/selesai`
        setTimeout(() => navigate(path), 500)
      } else {
        const err = await res.json()
        showError(`Gagal menyimpan: ${err.message || "Terjadi kesalahan"}`)
      }
    } catch (e) { showError("Gagal menyimpan data.") } finally { setIsSaving(false) }
  }

  if (isLoading) return <FullPageLoader text="Memuat IA.05..." />

  return (
    <ModularAsesiLayout currentStep={currentStep} steps={asesmenSteps} id={id} metode={metode}>
      <AsesmenBreadcrumb currentPage="IA.05" />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Title */}
        <div className="bg-primary text-white p-6 rounded-t-lg">
          <h1 className="text-xl font-bold">FR.IA.05. PERTANYAAN TERTULIS PILIHAN GANDA</h1>
        </div>

        {/* Identitas */}
        <div className="bg-white border rounded-lg p-6 text-sm space-y-2">
          <div className="flex"><span className="font-semibold text-slate-700 w-[200px] shrink-0">Skema Sertifikasi (KKNI/Okupasi/Klaster)</span><span className="w-5">:</span><span className="font-semibold">{jabatanKerja || "-"}</span></div>
          <div className="flex"><span className="w-[200px] shrink-0"></span><span className="w-5">:</span><span className="text-slate-600">{nomorSkema || "-"}</span></div>
          <div className="flex"><span className="w-[200px] shrink-0">TUK</span><span className="w-5">:</span><span>{tuk || "-"}</span></div>
          {asesorList.map((_: any, i: number) => (
            <div key={i} className="flex"><span className="w-[200px] shrink-0">Nama Asesor {i + 1}</span><span className="w-5">:</span><span className="font-semibold">{asesorList[i]?.nama || "-"}</span></div>
          ))}
          <div className="flex"><span className="w-[200px] shrink-0">Nama Asesi</span><span className="w-5">:</span><span className="font-semibold">{namaAsesi || user?.name || "-"}</span></div>
          <div className="flex"><span className="w-[200px] shrink-0">Tanggal</span><span className="w-5">:</span><span>{new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" })}</span></div>
        </div>

        {/* Panduan Asesor */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <h3 className="font-bold text-blue-800 mb-2">PANDUAN BAGI ASESOR</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>Pertanyaan pilihan ganda merupakan bukti tambahan.</li>
            <li>Asesor menilai jawaban dengan centang pada kolom Benar atau Salah.</li>
            <li>0 = Jawaban Salah, 1 = Jawaban Benar.</li>
          </ul>
        </div>

        {/* Panduan Asesi */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
          <h3 className="font-bold text-green-800 mb-2">PANDUAN BAGI ASESI</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>Baca dengan teliti dan cermat pertanyaan Pilihan Ganda.</li>
            <li>Pilih jawaban (A / B / C / D) yang paling tepat.</li>
          </ul>
        </div>

        {/* Soal */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-3 w-[100px] text-center">KUK</th>
                <th className="p-3 text-center" colSpan={2}>SOAL, Pilih Jawaban (A / B / C / D)</th>
              </tr>
            </thead>
            <tbody>
              {data?.soal.map((soal) => (
                <tr key={soal.id} className="border-t">
                  <td className="p-3 align-top text-xs font-semibold text-slate-600 bg-slate-50 text-center">
                    {soal.unit.kode}<br/>{soal.kuk?.kode || ""}
                  </td>
                  <td className="p-3 align-top w-[40px] text-slate-400">{soal.no}.</td>
                  <td className="p-3 align-top">
                    <p className="mb-2">{soal.soal}</p>
                    {(['A','B','C','D'] as const).map(l => {
                      const label = soal[`jawab_${l.toLowerCase()}` as keyof Soal] as string
                      return (
                        <div key={l} className="flex items-center gap-2 py-1 cursor-pointer" onClick={() => isAsesi && handleAnswerChange(soal.id, l)}>
                          <CustomRadio name={`soal-${soal.id}`} value={l} checked={answers[soal.id] === l} onChange={() => {}} disabled={!isAsesi} />
                          <span className="text-sm">{l.toLowerCase()}. {label}</span>
                        </div>
                      )
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Lembar Jawaban + Rekapitulasi */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-white text-center">
                <th className="p-2" colSpan={2}>Lembar Jawaban</th>
                <th className="p-2" colSpan={2}>Rekomendasi</th>
              </tr>
              <tr className="bg-primary/80 text-white text-center">
                <th className="p-2 w-[40px]">No</th>
                <th className="p-2">Jawaban</th>
                <th className="p-2 w-[60px]">Benar</th>
                <th className="p-2 w-[60px]">Salah</th>
              </tr>
            </thead>
            <tbody>
              {data?.soal.map((soal) => {
                const isCorrect = soal.jawaban_asesi === soal.kunci_jawaban
                const hasAnswer = !!soal.jawaban_asesi
                return (
                  <tr key={soal.id} className="border-t text-center">
                    <td className="p-2">{soal.no}</td>
                    <td className="p-2 text-left">
                      {soal.jawaban_asesi
                        ? <span className="font-medium">{soal.jawaban_asesi} - {String(soal[`jawab_${soal.jawaban_asesi.toLowerCase()}` as keyof Soal] || "")}</span>
                        : <span className="text-slate-400 italic">Belum dijawab</span>}
                    </td>
                    <td className="p-2"><CustomCheckbox checked={hasAnswer && isCorrect} onChange={() => {}} disabled /></td>
                    <td className="p-2"><CustomCheckbox checked={hasAnswer && !isCorrect} onChange={() => {}} disabled /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Rekapitulasi */}
          <div className="border-t">
            <div className="bg-primary text-white p-2 text-center font-bold text-sm">Rekapitulasi Penilaian Pertanyaan Pilihan Ganda</div>
            <div className="grid grid-cols-2 divide-x text-center">
              <div><div className="p-2 font-semibold text-green-700 bg-green-50">Benar</div><div className="p-2 text-xl font-bold">{jumlahBenar}</div></div>
              <div><div className="p-2 font-semibold text-red-700 bg-red-50">Salah</div><div className="p-2 text-xl font-bold">{jumlahSalah}</div></div>
            </div>
          </div>
        </div>

        {/* Umpan Balik */}
        {isAsesor && (
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Umpan Balik untuk Asesi</label>
            <textarea className="w-full border rounded-lg p-3 min-h-[80px] text-sm" value={umpanBalik}
              onChange={e => setUmpanBalik(e.target.value)} placeholder="Tulis umpan balik..." />
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 py-4">
          <ActionButton variant="primary" disabled={signing.buttonDisabled || isSaving} onClick={handleSubmit}>
            {isSaving ? "Menyimpan..." : "Simpan & Lanjutkan"}
          </ActionButton>
        </div>
      </div>

      <WebcamModal isOpen={showAwalModal} onClose={handleAwalModalClose} onSubmit={submitAbsenAwal}
        title="Absen Masuk Asesmen" description="Silakan ambil foto wajah Anda untuk absen masuk" canClose={false} />
    </ModularAsesiLayout>
  )
}
