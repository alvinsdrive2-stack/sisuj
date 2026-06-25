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

interface SoalKAN {
  id: number
  no: string
  jenis: string
  soal: string
  soal1: string
  soal2: string
  is_komentar: string | null
  jawaban?: string
  pencapaian?: number
}

interface ApiResponse {
  message: string
  data: {
    barcodes?: any
    dokumen: { id: number; nama_dokumen: string }
    soal: SoalKAN[]
  }
}

export default function Ia04bKANPage() {
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
  const currentStep = getStepNumberFromHref(asesmenSteps, '/asesi/asesmen/ia04b')

  const { showAwalModal, submitAbsenAwal, handleAwalModalClose } = useAbsenCheck({
    phase: 'asesmen', role: 'auto', checkOnMount: true, idIzin: id, asesorList
  })

  const [data, setData] = useState<ApiResponse["data"] | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [jawaban, setJawaban] = useState<Record<number, string>>({})
  const [skor, setSkor] = useState<Record<number, number>>({})
  const [barcodes, setBarcodes] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!id) return
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE_URL}/asesmen/${id}/ia04b`, {
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      })
      if (res.ok) {
        const result: ApiResponse = await res.json()
        setData(result.data)
        if (result.data.barcodes) setBarcodes(result.data.barcodes)
        const jwb: Record<number, string> = {}
        const sk: Record<number, number> = {}
        result.data.soal.forEach(s => {
          if (s.jawaban) jwb[s.id] = s.jawaban
          if (s.pencapaian !== undefined) sk[s.id] = s.pencapaian
        })
        setJawaban(jwb)
        setSkor(sk)
      }
    } catch (e) { console.error("Error fetching IA04B KAN:", e)
    } finally { setIsLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const totalSkor = useMemo(() => Object.values(skor).reduce((a, b) => a + b, 0), [skor])
  const nextStepLabel = asesmenSteps[asesmenSteps.findIndex(s => s.href.includes('ia04b')) + 1]?.label

  const signing = useSigningState({
    pageKey: 'ia04b', isAsesor, tahap,
    barcodes: barcodes as unknown as BarcodeState | null,
    setBarcodes: setBarcodes as unknown as React.Dispatch<React.SetStateAction<BarcodeState | null>>,
    asesorList, userId: user?.id, userName: user?.name, isSaving, idIzin: id, jadwalId,
    nextPageName: nextStepLabel, onRefresh: fetchData,
  })

  const handleSave = async () => {
    if (!data || !id) { showWarning("Data belum dimuat."); return }
    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      // Save jawaban
      const answersPayload = data.soal.map(s => ({ soal_id: s.id, jawaban: jawaban[s.id] || s.jawaban || "" }))
      const res1 = await fetch(`${API_BASE_URL}/asesmen/${id}/ia04b`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dokumen_id: data.dokumen.id, answers: answersPayload }),
      })
      if (!res1.ok) { showError("Gagal menyimpan jawaban."); setIsSaving(false); return }

      // Save skor (asesor only)
      if (isAsesor && Object.keys(skor).length > 0) {
        const evalPayload = data.soal.map(s => ({ soal_id: s.id, pencapaian: skor[s.id] ?? null }))
        await fetch(`${API_BASE_URL}/asesmen/${id}/nilai-ia04b`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dokumen_id: data.dokumen.id, evaluations: evalPayload }),
        })
      }

      await signing.generateQR()
      signing.publishUpdate()
      showSuccess("IA.04.B berhasil disimpan!")

      const next = asesmenSteps[asesmenSteps.findIndex(s => s.href.includes('ia04b')) + 1]
      const path = next ? next.href.replace("/asesi/asesmen/", `/asesi/asesmen/${id}/`) : `/asesi/asesmen/${id}/selesai`
      setTimeout(() => navigate(path), 500)
    } catch (e) { showError("Gagal menyimpan data.") } finally { setIsSaving(false) }
  }

  if (isLoading) return <FullPageLoader text="Memuat IA.04.B..." />

  return (
    <ModularAsesiLayout currentStep={currentStep} steps={asesmenSteps} id={id} metode={metode}>
      <AsesmenBreadcrumb currentPage="IA.04.B" />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Title */}
        <div className="bg-primary text-white p-6 rounded-t-lg">
          <h1 className="text-xl font-bold">FR.IA.04.B {data?.dokumen?.nama_dokumen || "LEMBAR PERIKSA KEGIATAN TERSTRUKTUR"}</h1>
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
            <li>Lakukan penilaian pencapaian hasil proyek singkat atau kegiatan terstruktur lainnya melalui presentasi.</li>
            <li>Penilaian dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau per kelompok pekerjaan.</li>
            <li>Pertanyaan disampaikan oleh asesor pada saat asesi melakukan presentasi kegiatan terstruktur.</li>
            <li>Asesor menilai jawaban dengan skor 0, 1, 2, atau 3:
              <br/>0 = Jawaban tidak sesuai/keliru
              <br/>1 = Jawaban sebagian benar, tidak lengkap
              <br/>2 = Jawaban benar, belum sepenuhnya lengkap
              <br/>3 = Jawaban lengkap, tepat, runtut
            </li>
            <li>Seluruh hasil penilaian dijumlahkan dan dicatat pada Rekapitulasi Skor.</li>
            <li>Durasi presentasi 15 menit dan tanya jawab 15 menit.</li>
          </ul>
        </div>

        {/* Soal Table */}
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary text-white text-center">
                <th className="p-3 w-[40px]">No</th>
                <th className="p-3">Lingkup Penyajian Proyek / Kegiatan Terstruktur</th>
                <th className="p-3">Daftar Pertanyaan</th>
                <th className="p-3">Kesesuaian dengan Standar Kompetensi Kerja</th>
                <th className="p-3" colSpan={4}>Pencapaian</th>
              </tr>
              <tr className="bg-primary/80 text-white text-center text-xs">
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th className="p-1 w-[40px]">0</th>
                <th className="p-1 w-[40px]">1</th>
                <th className="p-1 w-[40px]">2</th>
                <th className="p-1 w-[40px]">3</th>
              </tr>
            </thead>
            <tbody>
              {data?.soal.map((soal, idx) => (
                <tr key={soal.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 text-center align-top font-medium">{soal.no || idx + 1}</td>
                  <td className="p-3 align-top">{soal.soal}</td>
                  <td className="p-3 align-top">
                    <p className="mb-2">{soal.soal1}</p>
                    {isAsesi && (
                      <textarea
                        className="w-full border rounded p-2 text-xs min-h-[60px] focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Jawaban asesi..."
                        value={jawaban[soal.id] || ""}
                        onChange={e => setJawaban(prev => ({ ...prev, [soal.id]: e.target.value }))}
                      />
                    )}
                    {isAsesor && soal.jawaban && (
                      <div className="mt-2 p-2 bg-slate-50 border rounded text-xs text-slate-600">
                        <span className="font-medium">Jawaban asesi:</span> {soal.jawaban}
                      </div>
                    )}
                  </td>
                  <td className="p-3 align-top">{soal.soal2}</td>
                  {[0, 1, 2, 3].map(n => (
                    <td key={n} className="p-3 text-center align-middle">
                      {isAsesor ? (
                        <button
                          type="button"
                          onClick={() => setSkor(prev => ({ ...prev, [soal.id]: n }))}
                          className={`w-8 h-8 rounded border-2 text-xs font-bold transition-colors ${
                            skor[soal.id] === n
                              ? "bg-primary text-white border-primary"
                              : "bg-white text-slate-400 border-slate-300 hover:border-primary"
                          }`}
                        >
                          ✓
                        </button>
                      ) : (
                        <span className={`inline-block w-6 h-6 rounded border text-xs leading-6 ${
                          skor[soal.id] === n ? "bg-primary text-white border-primary" : "border-slate-300"
                        }`}>
                          {skor[soal.id] === n ? "✓" : ""}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rekapitulasi */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-primary text-white p-3 text-center font-bold">
            Rekapitulasi Skor Penilaian Pertanyaan IA04B
            <div className="text-xs font-normal mt-1">Penilaian = Jumlah skor seluruh butir soal</div>
          </div>
          <div className="grid grid-cols-2 divide-x">
            <div className="p-4 text-center font-semibold bg-slate-50">Total Skor Penilaian</div>
            <div className="p-4 text-center font-bold text-lg">{totalSkor}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 py-4">
          <ActionButton variant="primary" disabled={signing.buttonDisabled || isSaving} onClick={handleSave}>
            {isSaving ? "Menyimpan..." : "Simpan & Lanjutkan"}
          </ActionButton>
        </div>
      </div>

      <WebcamModal isOpen={showAwalModal} onClose={handleAwalModalClose} onSubmit={submitAbsenAwal}
        title="Absen Masuk Asesmen" description="Silakan ambil foto wajah Anda untuk absen masuk" canClose={false} />
    </ModularAsesiLayout>
  )
}
