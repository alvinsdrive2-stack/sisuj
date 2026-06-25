import { useState, useEffect, useCallback, useMemo } from "react"
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
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { ActionButton } from "@/components/ui/ActionButton"
import { WebcamModal } from "@/components/ui/WebcamModal"
import { API_BASE_URL } from "@/config/api"

interface SoalKAN {
  id: number; no: string; jenis: string; soal: string; soal1: string; soal2: string
  is_komentar: string | null; jawaban?: string; pencapaian?: number
}

interface ApiResponse {
  message: string; data: {
    barcodes?: any; dokumen: { id: number; nama_dokumen: string }; soal: SoalKAN[]
  }
}

const checkboxStyle = { width: '14px', height: '14px', border: '1.5px solid #000', display: 'inline-block', textAlign: 'center' as const, lineHeight: '12px', fontSize: '12px', cursor: 'pointer' as const }

export default function Ia04bKANPage() {
  const navigate = useNavigate(); const { user } = useAuth(); const { id } = useParams<{ id?: string }>()
  const { role: asesorRole } = useAsesorRole(id)
  const { jenjang, metode, asesorList, jadwalId, jabatanKerja, nomorSkema, tuk, namaAsesi } = useDataDokumenAsesmen(id)
  const { showSuccess, showError, showWarning } = useToast(); const { tahap } = useDataDokumenPraAsesmen(id)
  const isAsesor = user?.role?.id === RoleId.ASESOR; const isAsesi = user?.role?.id === RoleId.ASESI
  const asesmenSteps = useMemo(() => getAsesmenSteps(jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap), [jenjang, isAsesor, asesorRole, asesorList.length, metode, tahap])

  const { showAwalModal, submitAbsenAwal, handleAwalModalClose } = useAbsenCheck({ phase: 'asesmen', role: 'auto', checkOnMount: true, idIzin: id, asesorList })

  const [data, setData] = useState<ApiResponse["data"] | null>(null)
  const [isSaving, setIsSaving] = useState(false); const [jawaban, setJawaban] = useState<Record<number, string>>({})
  const [skor, setSkor] = useState<Record<number, number>>({}); const [barcodes, setBarcodes] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!id) return
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE_URL}/asesmen/${id}/ia04b`, {
        headers: { "Accept": "application/json", Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const result: ApiResponse = await res.json(); setData(result.data)
        if (result.data.barcodes) setBarcodes(result.data.barcodes)
        const jwb: Record<number, string> = {}; const sk: Record<number, number> = {}
        result.data.soal.forEach(s => { if (s.jawaban) jwb[s.id] = s.jawaban; if (s.pencapaian !== undefined) sk[s.id] = s.pencapaian })
        setJawaban(jwb); setSkor(sk)
      }
    } catch (e) { console.error("Error", e) } finally { setIsLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])
  const totalSkor = useMemo(() => Object.values(skor).reduce((a, b) => a + b, 0), [skor])
  const nextStepLabel = asesmenSteps[asesmenSteps.findIndex(s => s.href.includes('ia04b')) + 1]?.label

  const signing = useSigningState({
    pageKey: 'ia04b', isAsesor, tahap, barcodes: barcodes as unknown as BarcodeState | null,
    setBarcodes: setBarcodes as unknown as React.Dispatch<React.SetStateAction<BarcodeState | null>>,
    asesorList, userId: user?.id, userName: user?.name, isSaving, idIzin: id, jadwalId,
    nextPageName: nextStepLabel, onRefresh: fetchData,
  })

  const handleSave = async () => {
    if (!data || !id) { showWarning("Data belum dimuat."); return }
    setIsSaving(true)
    try {
      const token = localStorage.getItem("access_token")
      const res1 = await fetch(`${API_BASE_URL}/asesmen/${id}/ia04b`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dokumen_id: data.dokumen.id, answers: data.soal.map(s => ({ soal_id: s.id, jawaban: jawaban[s.id] || s.jawaban || "" })) }),
      })
      if (!res1.ok) { showError("Gagal menyimpan jawaban."); setIsSaving(false); return }
      if (isAsesor) {
        await fetch(`${API_BASE_URL}/asesmen/${id}/nilai-ia04b`, {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dokumen_id: data.dokumen.id, evaluations: data.soal.map(s => ({ soal_id: s.id, pencapaian: skor[s.id] ?? null })) }),
        })
      }
      await signing.generateQR(); signing.publishUpdate(); showSuccess("IA.04.B berhasil disimpan!")
      const next = asesmenSteps[asesmenSteps.findIndex(s => s.href.includes('ia04b')) + 1]
      setTimeout(() => navigate(next ? next.href.replace("/asesi/asesmen/", `/asesi/asesmen/${id}/`) : `/asesi/asesmen/${id}/selesai`), 500)
    } catch (e) { showError("Gagal menyimpan data.") } finally { setIsSaving(false) }
  }

  if (isLoading) return <FullPageLoader text="Memuat IA.04.B..." />

  return (
    <ModularAsesiLayout currentStep={asesmenSteps.find(s => s.href.includes('ia04b'))?.number || 1} steps={asesmenSteps} id={id} metode={metode}>
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: '"Open Sans",Calibri,Candara,Segoe,Segoe UI,Optima,Arial,sans-serif', fontSize: '13px' }}>
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
          {/* Title */}
          <table width="100%" cellPadding="5" style={{ border: '0', borderCollapse: 'collapse' }}>
            <tr>
              <td style={{ border: '0', fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px', color: '#4F81BD' }}>
                FR.IA.04.B {data?.dokumen?.nama_dokumen || 'LEMBAR PERIKSA KEGIATAN TERSTRUKTUR'}
              </td>
            </tr>
          </table>
          <br />

          {/* Identitas */}
          <table width="100%" cellPadding="5" style={{ borderCollapse: 'collapse', border: '2px solid #000', background: '#fff' }}>
            <tr><td rowSpan={2} style={{ width: '30%', verticalAlign: 'top', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi (KKNI/Okupasi/Klaster)</td>
              <td style={{ width: '12%', border: '1px solid #000', padding: '6px' }}>Judul</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{jabatanKerja?.toUpperCase() || '-'}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{nomorSkema?.toUpperCase() || '-'}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{tuk?.toUpperCase() || '-'}</td></tr>
            {asesorList.map((a: any, i: number) => (
              <tr key={i}><td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor {i + 1}</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{a.nama?.toUpperCase() || '-'}</td></tr>
            ))}
            <tr><td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{(namaAsesi || user?.name || '-').toUpperCase()}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
          </table>
          <p style={{ fontSize: '12px' }}>*Coret yang tidak perlu</p>

          {/* Panduan Asesor */}
          <table width="100%" cellPadding="5" style={{ borderCollapse: 'collapse', border: '1px solid #000', background: '#fff' }}>
            <tr><td style={{ fontWeight: 'bold', background: '#c40000', color: '#fff', border: '1px solid #000' }}>PANDUAN BAGI ASESOR</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '8px', fontSize: '12px' }}>
              <ul style={{ margin: '4px 0 4px 18px', paddingLeft: '18px', listStyleType: 'disc' }}>
                <li style={{ marginBottom: '4px' }}>Lakukan penilaian pencapaian hasil proyek singkat atau kegiatan terstruktur lainnya melalui presentasi.</li>
                <li style={{ marginBottom: '4px' }}>Penilaian dapat dilakukan untuk keseluruhan unit kompetensi dalam skema sertifikasi atau dapat pula dilakukan untuk masing-masing kelompok pekerjaan.</li>
                <li style={{ marginBottom: '4px' }}>Pertanyaan disampaikan oleh asesor pada saat asesi melakukan presentasi kegiatan terstruktur.</li>
                <li style={{ marginBottom: '4px' }}>Asesor menilai jawaban peserta uji berdasarkan jawaban yang diberikan. Penilaian dilakukan dengan memberikan tanda centang (✓) pada salah satu kolom skor penilaian 0, 1, 2, atau 3 sesuai dengan tingkat kesesuaian dan kelengkapan jawaban peserta, dengan ketentuan sebagai berikut:
                  <br/>0 = Jawaban tidak sesuai, keliru, atau tidak menjawab
                  <br/>1 = Jawaban sebagian benar, namun tidak lengkap/kurang tepat.
                  <br/>2 = Jawaban benar dan sesuai, namun belum sepenuhnya lengkap.
                  <br/>3 = Jawaban lengkap, tepat, runtut dan sesuai konteks
                </li>
                <li style={{ marginBottom: '4px' }}>Dibutuhkan jastifikasi profesional asesor untuk memutuskan hal ini.</li>
                <li style={{ marginBottom: '4px' }}>Seluruh hasil penilaian dijumlahkan dan dicatat pada kolom Rekapitulasi Skor Penilaian Pertanyaan Lisan.</li>
                <li style={{ marginBottom: '0' }}>Durasi presentasi yaitu 15 menit dan tanya jawab 15 menit.</li>
              </ul>
            </td></tr>
          </table>
          <br />

          {/* Soal Table */}
          <table width="100%" cellPadding="5" style={{ borderCollapse: 'collapse', border: '1px solid #000', background: '#fff' }}>
            <tr style={{ fontWeight: 'bold', textAlign: 'center', background: '#c40000', color: '#fff' }}>
              <td rowSpan={2} style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No</td>
              <td colSpan={3} style={{ width: '14%', border: '1px solid #000', padding: '6px' }}>Aspek Penilaian</td>
              <td colSpan={4} style={{ width: '14%', border: '1px solid #000', padding: '6px' }}>Pencapaian</td>
            </tr>
            <tr style={{ fontWeight: 'bold', textAlign: 'center', background: '#c40000', color: '#fff' }}>
              <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Lingkup Penyajian Proyek atau Kegiatan Terstruktur Lainnya</td>
              <td style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Daftar Pertanyaan</td>
              <td style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Kesesuaian dengan standar kompetensi kerja</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>0</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>1</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>2</td>
              <td style={{ width: '3%', border: '1px solid #000', padding: '6px' }}>3</td>
            </tr>
            {data?.soal.map((soal, idx) => (
              <tr key={soal.id}>
                <td style={{ textAlign: 'center', verticalAlign: 'top', border: '1px solid #000', padding: '6px' }}>{soal.no || idx + 1}</td>
                <td style={{ verticalAlign: 'top', border: '1px solid #000', padding: '6px' }}>{soal.soal}</td>
                <td style={{ verticalAlign: 'top', border: '1px solid #000', padding: '6px' }}>
                  <div>{soal.soal1}</div>
                  {isAsesi ? (
                    <>
                      <p style={{ margin: '8px 0 4px 0', fontSize: '12px', fontWeight: 'bold' }}>Jawaban asesi:</p>
                      <textarea value={jawaban[soal.id] || ""} onChange={e => setJawaban(prev => ({ ...prev, [soal.id]: e.target.value }))}
                        style={{ width: '100%', minHeight: '50px', border: '1px solid #ccc', padding: '6px', fontSize: '12px', background: '#f9f9f9' }} />
                    </>
                  ) : soal.jawaban ? (
                    <div style={{ margin: '8px 0 4px 0', fontSize: '12px', fontWeight: 'bold' }}>Jawaban asesi:
                      <div style={{ minHeight: '30px', border: '1px solid #ccc', padding: '6px', fontSize: '12px', background: '#f9f9f9', fontWeight: 'normal' }}>{soal.jawaban}</div>
                    </div>
                  ) : null}
                </td>
                <td style={{ verticalAlign: 'top', border: '1px solid #000', padding: '6px' }}>{soal.soal2}</td>
                {[0, 1, 2, 3].map(n => (
                  <td key={n} style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #000', padding: '6px' }}>
                    {isAsesor ? (
                      <span style={{ ...checkboxStyle, background: skor[soal.id] === n ? '#000' : '#fff', color: skor[soal.id] === n ? '#fff' : '#000' }}
                        onClick={() => setSkor(prev => {
                          if (prev[soal.id] === n) { const { [soal.id]: _, ...rest } = prev; return rest }
                          return { ...prev, [soal.id]: n }
                        })}>
                        {skor[soal.id] === n ? '✓' : ''}
                      </span>
                    ) : (
                      <span style={{ ...checkboxStyle, background: skor[soal.id] === n ? '#000' : '#fff', color: skor[soal.id] === n ? '#fff' : '#000' }}>
                        {skor[soal.id] === n ? '✓' : ''}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </table>
          <br />

          {/* Penyusun dan Validator */}
          <h2 style={{ fontSize: '14px', fontWeight: 'bold' }}>PENYUSUN DAN VALIDATOR</h2>
          <table width="100%" cellPadding="5" style={{ borderCollapse: 'collapse', border: '1px solid #000', background: '#fff' }}>
            <tr style={{ background: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <td style={{ width: '15%', border: '1px solid #000', padding: '6px' }}>Status</td>
              <td style={{ width: '8%', border: '1px solid #000', padding: '6px' }}>No</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama</td>
              <td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>Nomor MET</td>
              <td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>Tanda Tangan Dan Tanggal</td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Penyusun</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>1</td><td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td><td style={{ height: '50px', border: '1px solid #000', padding: '6px' }}></td>
            </tr>
            <tr><td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>2</td><td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td><td style={{ height: '50px', border: '1px solid #000', padding: '6px' }}></td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}>
              <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Validator</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>1</td><td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td><td style={{ height: '50px', border: '1px solid #000', padding: '6px' }}></td>
            </tr>
            <tr><td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>2</td><td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td><td style={{ height: '50px', border: '1px solid #000', padding: '6px' }}></td>
            </tr>
          </table>
          <br />

          {/* Rekapitulasi */}
          <table width="100%" cellPadding="5" style={{ borderCollapse: 'collapse', border: '1px solid #000', background: '#fff' }}>
            <tr style={{ fontWeight: 'bold', textAlign: 'center', background: '#c40000', color: '#fff' }}>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Rekapitulasi Skor Penilaian Pertanyaan IA04B <span style={{ fontWeight: 'normal' }}><br/>(Penilaian = Jumlah skor seluruh butir soal)</span></td>
            </tr>
            <tr style={{ textAlign: 'center' }}>
              <td style={{ fontWeight: 'bold', border: '1px solid #000', padding: '6px' }}>Total Skor Penilaian</td>
              <td style={{ fontWeight: 'bold', height: '50px', border: '1px solid #000', padding: '6px', fontSize: '18px' }}>{totalSkor}</td>
            </tr>
          </table>
          <br />

          {/* TTD Asesi */}
          <table width="100%" cellPadding="5" style={{ borderCollapse: 'collapse', border: '1px solid #000', background: '#fff' }}>
            <tr><td style={{ fontWeight: 'bold', border: '1px solid #000', padding: '6px' }}>Umpan balik untuk asesi:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Aspek pengetahuan seluruh unit kompetensi yang diujikan (tercapai / belum tercapai)* <br/><br/>Tuliskan unit/elemen/KUK jika belum tercapai: …</td>
            </tr>
            <tr style={{ fontWeight: 'bold' }}><td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>Asesi :</td></tr>
            <tr><td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>Nama</td>
              <td style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{(namaAsesi || user?.name || '-').toUpperCase()}</td></tr>
            <tr><td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan/ Tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ height: '70px', verticalAlign: 'middle', textAlign: 'center', border: '1px solid #000', padding: '6px' }}></td>
            </tr>
          </table>
          <br />

          {/* TTD Asesor */}
          {asesorList.map((a: any, i: number) => (
            <table key={i} width="100%" cellPadding="5" style={{ borderCollapse: 'collapse', border: '1px solid #000', borderTop: 'none', background: '#fff' }}>
              <tr style={{ fontWeight: 'bold' }}><td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>Asesor {asesorList.length > 1 ? i + 1 : ''} :</td></tr>
              <tr><td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}>Nama</td>
                <td style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{a.nama?.toUpperCase() || ''}</td></tr>
              <tr><td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan/ Tanggal</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                <td style={{ height: '70px', verticalAlign: 'middle', textAlign: 'center', border: '1px solid #000', padding: '6px' }}></td>
              </tr>
            </table>
          ))}
          <br />

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <ActionButton variant="primary" disabled={signing.buttonDisabled || isSaving} onClick={handleSave}>
              {isSaving ? "Menyimpan..." : "Simpan & Lanjutkan"}
            </ActionButton>
          </div>
        </div>
      </div>
      <WebcamModal isOpen={showAwalModal} onClose={handleAwalModalClose} onSubmit={submitAbsenAwal}
        title="Absen Masuk Asesmen" description="Silakan ambil foto wajah Anda untuk absen masuk" canClose={false} />
    </ModularAsesiLayout>
  )
}
