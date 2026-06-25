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
import { ActionButton } from "@/components/ui/ActionButton"
import { WebcamModal } from "@/components/ui/WebcamModal"
import { API_BASE_URL } from "@/config/api"

interface SoalEsai {
  id: number
  no: string
  unit_kode: string
  kuk_kode: string
  soal: string
  jawaban_asesi?: string
  skor?: number
}

interface Ia06Response {
  message: string
  data: {
    soal: SoalEsai[]
    dokumen: { id: number }
    barcodes?: any
    umpan_balik?: string
  }
}

export default function Ia06Page() {
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
  const currentStep = getStepNumberFromHref(asesmenSteps, '/asesi/asesmen/ia06')

  const { showAwalModal, submitAbsenAwal, handleAwalModalClose } = useAbsenCheck({
    phase: 'asesmen',
    role: 'auto',
    checkOnMount: true,
    idIzin: id,
    asesorList
  })

  const [soalList, setSoalList] = useState<SoalEsai[]>([])
  const [dokumenId, setDokumenId] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [jawaban, setJawaban] = useState<Record<number, string>>({})
  const [skor, setSkor] = useState<Record<number, number>>({})
  const [umpanBalik, setUmpanBalik] = useState("")
  const [barcodes, setBarcodes] = useState<BarcodeState | null>(null)

  const fetchIa06Data = useCallback(async () => {
    if (!id) return
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ia06`, {
        headers: { "Authorization": `Bearer ${token}` },
      })
      if (response.ok) {
        const result: Ia06Response = await response.json()
        setSoalList(result.data.soal || [])
        setDokumenId(result.data.dokumen?.id || 0)
        if (result.data.barcodes) setBarcodes(result.data.barcodes as any)
        const savedJawaban: Record<number, string> = {}
        const savedSkor: Record<number, number> = {}
        result.data.soal.forEach((s: SoalEsai) => {
          if (s.jawaban_asesi) savedJawaban[s.id] = s.jawaban_asesi
          if (s.skor !== undefined) savedSkor[s.id] = s.skor
        })
        setJawaban(savedJawaban)
        setSkor(savedSkor)
        if (result.data.umpan_balik) setUmpanBalik(result.data.umpan_balik)
      }
    } catch (error) {
      console.error("Error fetching IA.06 data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => { fetchIa06Data() }, [fetchIa06Data])

  const totalSkor = useMemo(() => Object.values(skor).reduce((a, b) => a + b, 0), [skor])
  const nextStepLabel = asesmenSteps[asesmenSteps.findIndex(s => s.href.includes('ia06')) + 1]?.label

  const signing = useSigningState({
    pageKey: 'ia06',
    isAsesor,
    tahap,
    barcodes: barcodes as unknown as BarcodeState | null,
    setBarcodes: setBarcodes as unknown as React.Dispatch<React.SetStateAction<BarcodeState | null>>,
    asesorList,
    userId: user?.id,
    userName: user?.name,
    isSaving,
    idIzin: id,
    jadwalId,
    nextPageName: nextStepLabel,
    onRefresh: fetchIa06Data,
  })

  const handleSave = async () => {
    if (!id || !dokumenId) {
      showWarning("Data belum dimuat.")
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      const jawabanPayload = soalList
        .filter(s => jawaban[s.id])
        .map(s => ({
          soal_id: s.id,
          jawaban: jawaban[s.id],
          skor: skor[s.id] ?? null,
        }))

      const payload = {
        id_izin: id,
        dokumen_id: dokumenId,
        jawaban: jawabanPayload,
        umpan_balik: umpanBalik || undefined,
      }

      const response = await fetch(`${API_BASE_URL}/asesmen/${id}/ia06`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        showSuccess("IA.06 berhasil disimpan!")
        signing.publishUpdate()

        const currentIdx = asesmenSteps.findIndex(s => s.href.includes("ia06"))
        const nextStep = asesmenSteps[currentIdx + 1]
        if (nextStep) {
          const nextPath = nextStep.href.replace("/asesi/asesmen/", `/asesi/asesmen/${id}/`)
          setTimeout(() => navigate(nextPath), 500)
        } else {
          setTimeout(() => navigate(`/asesi/asesmen/${id}/selesai`), 500)
        }
      } else {
        const result = await response.json()
        showError(`Gagal menyimpan: ${result.message || "Terjadi kesalahan"}`)
      }
    } catch (error) {
      console.error("Error saving IA.06:", error)
      showError("Gagal menyimpan data.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <FullPageLoader text="Memuat IA.06..." />

  return (
    <ModularAsesiLayout currentStep={currentStep} steps={asesmenSteps} id={id} metode={metode}>
      <AsesmenBreadcrumb currentPage="IA.06" />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-primary text-white p-6 rounded-t-lg">
          <h1 className="text-xl font-bold">FR.IA.06C. LEMBAR JAWABAN PERTANYAAN TERTULIS ESAI</h1>
          <p className="text-white/80 text-sm mt-1">Lembar Jawaban Pertanyaan Tertulis Esai</p>
        </div>

        {/* Identitas */}
        <div className="bg-white border rounded-lg p-6 text-sm space-y-2">
          <div className="flex"><span className="font-semibold text-slate-700 w-[200px] shrink-0">Skema Sertifikasi (KKNI/Okupasi/Klaster)</span><span className="w-5">:</span><span className="font-semibold">{jabatanKerja || '-'}</span></div>
          <div className="flex"><span className="w-[200px] shrink-0"></span><span className="w-5">:</span><span className="text-slate-600">{nomorSkema || '-'}</span></div>
          <div className="flex"><span className="w-[200px] shrink-0">TUK</span><span className="w-5">:</span><span>{tuk || '-'}</span></div>
          {asesorList.map((_: any, i: number) => (
            <div key={i} className="flex"><span className="w-[200px] shrink-0">Nama Asesor {i + 1}</span><span className="w-5">:</span><span className="font-semibold">{asesorList[i]?.nama || '-'}</span></div>
          ))}
          <div className="flex"><span className="w-[200px] shrink-0">Nama Asesi</span><span className="w-5">:</span><span className="font-semibold">{namaAsesi || user?.name || '-'}</span></div>
          <div className="flex"><span className="w-[200px] shrink-0">Tanggal</span><span className="w-5">:</span><span>{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
        </div>

        {/* Panduan */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <h3 className="font-bold text-blue-800 mb-2">PANDUAN BAGI ASESOR</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>Lakukan penilaian jawaban esai setiap butir soal.</li>
            <li>Penilaian dilakukan dengan memberikan skor 0, 1, 2, atau 3 sesuai tingkat kesesuaian dan kelengkapan jawaban.</li>
            <li>0 = Jawaban tidak sesuai, keliru atau tidak menjawab.</li>
            <li>1 = Jawaban sebagian benar, namun tidak lengkap/kurang tepat.</li>
            <li>2 = Jawaban benar dan sesuai, namun belum sepenuhnya lengkap.</li>
            <li>3 = Jawaban lengkap, tepat, runtut dan sesuai konteks.</li>
            <li>Seluruh hasil penilaian dijumlahkan dan dicatat pada kolom Rekapitulasi Skor Penilaian.</li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
          <h3 className="font-bold text-green-800 mb-2">PANDUAN BAGI ASESI</h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li>Pertanyaan esai merupakan jenis bukti tambahan untuk mendukung bukti-bukti yang sudah ada.</li>
            <li>Baca dengan teliti dan cermat pertanyaan esai pada lembar soal.</li>
            <li>Tuliskan jawaban Anda pada Lembar Jawaban Pertanyaan Tertulis Esai.</li>
          </ul>
        </div>

        {/* Daftar Soal & Jawaban */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="p-3 text-left w-[100px]">KUK</th>
                <th className="p-3 text-left" colSpan={2}>SOAL ESAI</th>
              </tr>
            </thead>
            <tbody>
              {soalList.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-slate-500">Belum ada soal esai.</td></tr>
              )}
              {soalList.map((soal, idx) => (
                <tr key={soal.id} className="border-t">
                  <td className="p-3 align-top text-xs font-semibold text-slate-600 bg-slate-50">
                    {soal.unit_kode && <div>{soal.unit_kode}</div>}
                    {soal.kuk_kode && <div>{soal.kuk_kode}</div>}
                  </td>
                  <td className="p-3 align-top w-[40px] text-slate-400">{idx + 1}.</td>
                  <td className="p-3 align-top">
                    <p className="text-slate-800 mb-3">{soal.soal}</p>

                    {/* Jawaban (asesi) */}
                    {isAsesi && (
                      <textarea
                        className="w-full border rounded-lg p-3 min-h-[100px] text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Tulis jawaban Anda di sini..."
                        value={jawaban[soal.id] || ""}
                        onChange={e => setJawaban(prev => ({ ...prev, [soal.id]: e.target.value }))}
                      />
                    )}

                    {/* Skor (asesor) */}
                    {isAsesor && (
                      <div className="flex items-center gap-4 pt-2 border-t mt-2">
                        <span className="text-sm font-medium text-slate-600">Skor:</span>
                        {[0, 1, 2, 3].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setSkor(prev => ({ ...prev, [soal.id]: n }))}
                            className={`w-9 h-9 rounded-full text-xs font-bold border-2 transition-colors ${
                              skor[soal.id] === n
                                ? "bg-primary text-white border-primary"
                                : "bg-white text-slate-500 border-slate-300 hover:border-primary"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rekapitulasi Skor */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-primary text-white p-3 text-center font-bold">
            Rekapitulasi Skor Penilaian Pertanyaan IA06
            <div className="text-xs font-normal mt-1">Penilaian = Jumlah skor seluruh butir soal</div>
          </div>
          <div className="grid grid-cols-2">
            <div className="p-4 text-center font-semibold border-r border-b bg-slate-50">Total Skor Penilaian</div>
            <div className="p-4 text-center font-bold text-lg">{totalSkor}</div>
          </div>
        </div>

        {/* Umpan Balik */}
        {isAsesor && (
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Umpan Balik untuk Asesi</label>
            <p className="text-xs text-slate-500 mb-3">Aspek pengetahuan seluruh unit kompetensi yang diujikan (tercapai / belum tercapai)</p>
            <textarea
              className="w-full border rounded-lg p-3 min-h-[80px] text-sm"
              value={umpanBalik}
              onChange={e => setUmpanBalik(e.target.value)}
              placeholder="Tulis umpan balik..."
            />
          </div>
        )}

        {/* Tanda Tangan Preview */}
        {signing.allSigned && (
          <div className="bg-white border rounded-lg p-4 text-sm">
            <h3 className="font-bold text-slate-700 mb-3">Tanda Tangan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Asesi:</p>
                <p>{namaAsesi || user?.name || '-'}</p>
              </div>
              {asesorList.map((a: any, i: number) => (
                <div key={i}>
                  <p className="font-semibold">Asesor {i + 1}:</p>
                  <p>{a.nama || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 py-4">
          <ActionButton variant="primary" disabled={signing.buttonDisabled || isSaving} onClick={handleSave}>
            {isSaving ? "Menyimpan..." : "Simpan & Lanjutkan"}
          </ActionButton>
        </div>
      </div>

      {/* Absen Awal Modal */}
      <WebcamModal
        isOpen={showAwalModal}
        onClose={handleAwalModalClose}
        onSubmit={submitAbsenAwal}
        title="Absen Masuk Asesmen"
        description="Silakan ambil foto wajah Anda untuk absen masuk"
        canClose={false}
      />
    </ModularAsesiLayout>
  )
}
