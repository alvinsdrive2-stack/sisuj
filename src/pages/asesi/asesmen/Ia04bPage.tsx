import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { useKegiatanAsesor } from "@/hooks/useKegiatan"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { ActionButton } from "@/components/ui/ActionButton"

interface Soal {
  id: number
  no: string
  jenis: string
  soal: string
  soal1: string
  soal2: string
  is_komentar: string | null
  jawaban?: string
  pencapaian?: boolean
}

interface Rekomendasi {
  id: number
  no: string
  jenis: string
  soal: string
  is_komentar: string | null
  rekomendasi?: boolean
}

type BarcodeData = {
  url: string
  tanggal: string
  nama: string
}

interface Ia04bResponse {
  message: string
  data: {
    barcodes?: {
      asesi?: BarcodeData
      asesor1?: BarcodeData | null
      asesor2?: BarcodeData | null
    }
    dokumen: {
      id: number
      nama_dokumen: string
    }
    soal: Soal[]
    rekomendasi: Rekomendasi
  }
}

interface ApiResponse {
  message: string
  data: Ia04bResponse["data"]
}

export default function Ia04bPage() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { jabatanKerja, nomorSkema, namaAsesor: _namaAsesor, tuk, asesorList, namaAsesi } = useDataDokumenAsesmen(id)
  const { role: asesorRole, isAsesor1 } = useAsesorRole(id)
  const { showSuccess, showError, showWarning } = useToast()
  const { kegiatan: kegiatanAsesor } = useKegiatanAsesor()

  const [ia04bData, setIa04bData] = useState<Ia04bResponse["data"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [answers, setAnswers] = useState<Record<number, 'ya' | 'tidak'>>({})
  const [rekomendasi, setRekomendasi] = useState<'kompeten' | 'belum_kompeten' | null>(null)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [initializedFromApi, setInitializedFromApi] = useState(false)
  const [jawabanAnswers, setJawabanAnswers] = useState<Record<number, string>>({})
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [barcodes, setBarcodes] = useState<{
    asesi?: BarcodeData
    asesor?: Record<string, BarcodeData>
  } | null>(null)

  // Get dynamic steps based on asesor role
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'
  const canEdit = isAsesor1 // Only asesor1 can edit IA04B
  const asesmenSteps = getAsesmenSteps(isAsesor, asesorRole, asesorList.length)

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return
      if (!id) {
        console.error("No id_izin found in user data")
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ia04b`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result: ApiResponse = await response.json()
          console.log('GET IA04B Response:', result)
          if (result.message === "Success") {
            setIa04bData(result.data)

            console.log('Barcodes from API:', result.data.barcodes)

            // Set barcodes - directly use asesor1/asesor2 from API without complex mapping
            if (result.data.barcodes) {
              const apiBarcodes = result.data.barcodes as {
                asesi?: BarcodeData
                asesor1?: BarcodeData | null
                asesor2?: BarcodeData | null
              }

              console.log('Barcodes from API:', apiBarcodes)

              // Direct mapping - keep original asesor1/asesor2 structure
              setBarcodes({
                asesi: apiBarcodes.asesi,
                asesor: {
                  ...(apiBarcodes.asesor1 ? { asesor1: apiBarcodes.asesor1 } : {}),
                  ...(apiBarcodes.asesor2 ? { asesor2: apiBarcodes.asesor2 } : {}),
                }
              })
            }

            // Fallback: load asesor barcodes from localStorage if API returns null
            if (!result.data.barcodes || !result.data.barcodes.asesor1 || !result.data.barcodes.asesor2) {
              const localAsesorBarcodes = localStorage.getItem(`ia04b_asesor_barcodes_${id}`)
              if (localAsesorBarcodes) {
                try {
                  const parsed = JSON.parse(localAsesorBarcodes)
                  setBarcodes(prev => ({
                    asesi: prev?.asesi,
                    asesor: { ...prev?.asesor, ...parsed }
                  }))
                } catch (e) {
                  console.error('Error parsing local barcodes:', e)
                }
              }
            }

            // Initialize checkbox states from API response
            const newAnswers: Record<number, 'ya' | 'tidak'> = {}
            const newJawabanAnswers: Record<number, string> = {}
            result.data.soal.forEach((soal) => {
              if (soal.pencapaian === true) {
                newAnswers[soal.id] = 'ya'
              } else {
                newAnswers[soal.id] = 'tidak'
              }
              // Initialize jawaban if exists
              if (soal.jawaban) {
                newJawabanAnswers[soal.id] = soal.jawaban
              }
            })
            setAnswers(newAnswers)
            setJawabanAnswers(newJawabanAnswers)

            // Initialize rekomendasi from API response
            if (result.data.rekomendasi.rekomendasi === true) {
              setRekomendasi('kompeten')
            } else {
              setRekomendasi('belum_kompeten')
            }

            setInitializedFromApi(true)
          }
        } else {
          console.warn(`IA04B API returned ${response.status}`)
        }
      } catch (error) {
        console.error("Error fetching IA04B:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, authLoading])

  const handleAnswerChange = (soalId: number, value: 'ya' | 'tidak') => {
    setAnswers(prev => ({
      ...prev,
      [soalId]: value
    }))
  }

  const handleJawabanChange = (soalId: number, value: string) => {
    setJawabanAnswers(prev => ({
      ...prev,
      [soalId]: value
    }))
  }

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }

  const saveNilaiIA04B = async () => {
    if (!ia04bData) return

    try {
      const token = localStorage.getItem('access_token')

      // Build evaluations array from answers state
      const evaluations = ia04bData.soal.map(soal => ({
        soal_id: soal.id,
        pencapaian: answers[soal.id] === 'ya' // 'ya' = true, 'tidak' = false
      }))

      // Build rekomendasi
      const rekomendasiPayload = {
        soal_id: ia04bData.rekomendasi.id,
        value: rekomendasi === 'kompeten' // 'kompeten' = true, 'belum_kompeten' = false
      }

      const payload = {
        dokumen_id: ia04bData.dokumen.id,
        evaluations,
        rekomendasi: rekomendasiPayload
      }

      const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/nilai-ia04b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      return response.ok
    } catch (error) {
      console.error('Error saving nilai IA04B:', error)
      return false
    }
  }

  const handleSave = async () => {
    if (!agreedChecklist) {
      showWarning('Silakan centang pernyataan terlebih dahulu.')
      return
    }

    if (!ia04bData) {
      showWarning('Data belum dimuat.')
      return
    }

    if (!id) {
      showWarning('ID tidak ditemukan.')
      return
    }

    setIsSaving(true)

    try {
      const token = localStorage.getItem('access_token')

      // 1. Save jawaban answers
      const answersPayload = ia04bData.soal.map(soal => ({
        soal_id: soal.id,
        jawaban: jawabanAnswers[soal.id] || soal.jawaban || ''
      }))

      const payload = {
        dokumen_id: ia04bData.dokumen.id,
        answers: answersPayload
      }

      const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ia04b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const result = await response.json()
        showError(`Gagal menyimpan jawaban: ${result.message || 'Terjadi kesalahan'}`)
        setIsSaving(false)
        return
      }

      // 2. Save nilai evaluations (only if asesor)
      if (isAsesor) {
        const nilaiSuccess = await saveNilaiIA04B()
        if (!nilaiSuccess) {
          showError('Gagal menyimpan nilai evaluasi. Silakan coba lagi.')
          setIsSaving(false)
          return
        }
      }

      // 3. Navigate to next step
      showSuccess('IA 04.B berhasil disimpan!')

      // 4. Generate QR for asesor only if not exists
      if (isAsesor) {
        const jadwalId = kegiatanAsesor?.jadwal_id
        const currentAsesorId = String(user?.id)
        const existingAsesorQR = barcodes?.asesor?.[currentAsesorId]?.url

        // Cek apakah QR asesor sudah ada, jika ada langsung navigate ke next step
        if (existingAsesorQR) {
          const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ia04b'))
          const nextStep = asesmenSteps[currentStepIndex + 1]

          if (nextStep?.href.includes('ia05')) {
            setTimeout(() => navigate(`/asesi/asesmen/${id}/ia05`), 1500)
          } else {
            setTimeout(() => navigate(`/asesi/asesmen/${id}/ak03`), 1500)
          }
          return
        }

        // Generate QR hanya jika belum ada
        if (jadwalId) {
          try {
            const qrResponse = await fetch(`https://backend.devgatensi.site/api/qr/${id}/ia04b`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                id_jadwal: jadwalId
              })
            })

            console.log('QR Response:', qrResponse.status)

            if (qrResponse.ok) {
              const qrResult = await qrResponse.json()
              console.log('QR Result:', qrResult)

              if (qrResult.message === "Success" && qrResult.data?.url_image) {
                const newBarcode = { url: qrResult.data.url_image, tanggal: new Date().toISOString(), nama: user?.name }

                setBarcodes(prev => ({
                  asesi: prev?.asesi,
                  asesor: {
                    ...prev?.asesor,
                    [currentAsesorId]: newBarcode
                  }
                }))

                // Save to localStorage as fallback since backend might not persist it
                const currentLocal = localStorage.getItem(`ia04b_asesor_barcodes_${id}`)
                const localBarcodes = currentLocal ? JSON.parse(currentLocal) : {}
                localBarcodes[currentAsesorId] = newBarcode
                localStorage.setItem(`ia04b_asesor_barcodes_${id}`, JSON.stringify(localBarcodes))
              } else {
                console.warn('QR generation unexpected response:', qrResult)
              }
            } else {
              const errorResult = await qrResponse.json()
              console.error('QR generation failed:', qrResponse.status, errorResult)
              showError('Gagal generate QR')
            }
          } catch (qrError) {
            console.error('Error generating QR:', qrError)
          }
        }
      }

      // For asesi, show confirmation dialog before proceeding to ujian
      if (!isAsesor) {
        setTimeout(() => setShowConfirmDialog(true), 500)
        return
      }

      const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ia04b'))
      const nextStep = asesmenSteps[currentStepIndex + 1]

      if (nextStep?.href.includes('ia05')) {
        // Asesor goes to IA.05 - wait longer for QR to save
        setTimeout(() => navigate(`/asesi/asesmen/${id}/ia05`), 1500)
      } else {
        setTimeout(() => navigate(`/asesi/asesmen/${id}/ak03`), 1500)
      }
    } catch (error) {
      showError('Gagal menyimpan data. Silakan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-resize textareas when data is loaded
  useEffect(() => {
    if (initializedFromApi) {
      const textareas = document.querySelectorAll('textarea[data-auto-resize]')
      textareas.forEach((textarea) => {
        const ta = textarea as HTMLTextAreaElement
        ta.style.height = 'auto'
        ta.style.height = `${ta.scrollHeight}px`
      })
    }
  }, [initializedFromApi, jawabanAnswers])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <DashboardNavbar userName={user?.name} />
        <FullPageLoader text="Memuat data IA.04.B..." />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate(isAsesor ? "/asesor/dashboard" : "/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Asesmen</span>
            <span>/</span>
            <span>IA.04.B</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={asesmenSteps.find(s => s.href.includes('ia04b'))?.number || 2} steps={asesmenSteps} id={id}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
            FR.IA.04.B  {ia04bData?.dokumen.nama_dokumen || 'LEMBAR PERIKSA KEGIATAN TERSTRUKTUR'}
          </h1>
        </div>

        {/* Info Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px', fontSize: '13px', background: '#ffffff', border: '1px solid #000' }}>
          <tbody>
            <tr style={{ background: '#ffffff' }}>
              <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Skema Sertifikasi (̶𝙺̶𝙺̶𝙽̶𝙸̶/Okupasi/̶𝙺̶𝚕̶𝚊̶𝚜̶𝚝̶𝚎̶𝚛̶)̶</td>
              <td style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>Judul</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{jabatanKerja?.toLocaleUpperCase() || ''}</td>
            </tr>
            <tr style={{ background: '#ffffff' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nomor</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{nomorSkema?.toUpperCase() || ''}</td>
            </tr>
            <tr style={{ background: '#ffffff' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>TUK</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{tuk?.toLocaleUpperCase() || ''}</td>
            </tr>
            <tr style={{ background: '#ffffff' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                {asesorList.map((asesor, _idx) => (
                  <span key={asesor.id}>
                    {_idx > 0 && ', '}
                    {asesor.nama?.toUpperCase() || ''}
                  </span>
                ))}
              </td>
            </tr>
            <tr style={{ background: '#ffffff' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Nama Asesi</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{namaAsesi?.toUpperCase() || user?.name?.toLocaleUpperCase() || ''}</td>
            </tr>
            <tr style={{ background: '#ffffff' }}>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{new Date().toLocaleDateString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '12px', marginTop: '5px' }}>*Coret yang tidak perlu</div>

        {/* Panduan Bagi Asesor */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '14px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold' }}>
              <td>PANDUAN BAGI ASESOR</td>
            </tr>
            <tr>
              <td style={{ background: '#ffffffe', border: '1px solid #000', padding: '6px' }}>
                <ul style={{ margin: '4px 0 4px 18px', paddingLeft: '18px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '4px' }}>Lakukan penilaian pencapaian hasil proyek singkat atau kegiatan terstruktur lainnya melalui presentasi.</li>
                  <li style={{ marginBottom: '4px' }}>Penilaian dapat dilakukan untuk keseluruhan unit kompetensi atau per kelompok pekerjaan.</li>
                  <li style={{ marginBottom: '4px' }}>Pertanyaan disampaikan oleh asesor saat asesi melakukan presentasi.</li>
                  <li style={{ marginBottom: '4px' }}>Pertanyaan untuk pemenuhan pencapaian 5 dimensi kompetensi.</li>
                  <li style={{ marginBottom: '4px' }}>Isilah kolom lingkup penyajian proyek sesuai sektor/sub-sektor/profesi.</li>
                  <li style={{ marginBottom: '0' }}>Berikan keputusan pencapaian berdasarkan kesimpulan jawaban asesi.</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Main Assessment Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            {/* Header Row 1 */}
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <td rowSpan={2} style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>No</td>
              <td rowSpan={2} style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Lingkup Penyajian proyek atau kegiatan terstruktur lainnya</td>
              <td rowSpan={2} style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Daftar Pertanyaan</td>
              <td rowSpan={2} style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Kesesuaian dengan standar kompetensi kerja</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Pencapaian</td>
            </tr>
            {/* Header Row 2 */}
            <tr style={{ background: '#c40000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <td style={{ width: '7%', border: '1px solid #000', padding: '6px' }}>Ya</td>
              <td style={{ width: '7%', border: '1px solid #000', padding: '6px' }}>Tdk</td>
            </tr>

            {/* Data Rows */}
            {ia04bData?.soal.map((item) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>{item.no}</td>
                <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>{item.soal}</td>
                <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                  <div>{item.soal1.replace(/\r\n/g, ' ')}</div>
                  <p style={{ margin: '8px 0 4px 0', fontSize: '12px', fontWeight: 'bold' }}>Jawaban asesi:</p>
                  <textarea
                    data-auto-resize
                    value={jawabanAnswers[item.id] || ''}
                    onChange={(e) => {
                      handleJawabanChange(item.id, e.target.value)
                      autoResizeTextarea(e)
                    }}
                    disabled={!canEdit}
                    placeholder="Jawaban..."
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      cursor: !canEdit ? 'not-allowed' : 'text',
                      backgroundColor: !canEdit ? '#f5f5f5' : '#fff',
                      resize: 'none',
                      overflow: 'hidden',
                      minHeight: '60px',
                      height: 'auto'
                    }}
                  />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>{item.soal2.replace(/\r\n/g, ' ')}</td>
                <td
                  onClick={() => canEdit && handleAnswerChange(item.id, 'ya')}
                  style={{
                    textAlign: 'center',
                    border: '1px solid #000',
                    padding: '6px',
                    cursor: !canEdit ? 'not-allowed' : 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <CustomCheckbox
                    checked={answers[item.id] === 'ya'}
                    onChange={() => {}}
                    disabled={!canEdit}
                    style={{ pointerEvents: 'none' }}
                  />
                </td>
                <td
                  onClick={() => canEdit && handleAnswerChange(item.id, 'tidak')}
                  style={{
                    textAlign: 'center',
                    border: '1px solid #000',
                    padding: '6px',
                    cursor: !canEdit ? 'not-allowed' : 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <CustomCheckbox
                    checked={answers[item.id] === 'tidak'}
                    onChange={() => {}}
                    disabled={!canEdit}
                    style={{ pointerEvents: 'none' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Rekomendasi Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ width: '30%', fontWeight: 'bold', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                {ia04bData?.rekomendasi.soal || 'Rekomendasi Asesor:'}
              </td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>
                Asesi telah memenuhi/belum memenuhi pencapaian seluruh kriteria unjuk kerja, direkomendasikan:<br /><br />
                <div
                  onClick={() => canEdit && setRekomendasi(rekomendasi === 'kompeten' ? null : 'kompeten')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: !canEdit ? 'not-allowed' : 'pointer', userSelect: 'none' }}
                >
                  <CustomCheckbox
                    checked={rekomendasi === 'kompeten'}
                    onChange={() => {}}
                    disabled={!canEdit}
                    style={{ pointerEvents: 'none' }}
                  />
                  Kompeten
                </div>
                <div
                  onClick={() => canEdit && setRekomendasi(rekomendasi === 'belum_kompeten' ? null : 'belum_kompeten')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: !canEdit ? 'not-allowed' : 'pointer', userSelect: 'none' }}
                >
                  <CustomCheckbox
                    checked={rekomendasi === 'belum_kompeten'}
                    onChange={() => {}}
                    disabled={!canEdit}
                    style={{ pointerEvents: 'none' }}
                  />
                  Belum Kompeten
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Asesi Signature Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr style={{ fontWeight: 'bold' }}>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>Asesi :</td>
            </tr>
            <tr>
              <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Nama</td>
              <td style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{namaAsesi?.toUpperCase() || user?.name?.toLocaleUpperCase() || ''}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan/ Tanggal</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
              <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                {barcodes?.asesi?.url ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img
                      src={barcodes.asesi.url}
                      alt="Tanda Tangan Asesi"
                      style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                    />
                    {barcodes.asesi.tanggal && (
                      <div style={{ fontSize: '11px', color: '#333' }}>
                        {new Date(barcodes.asesi.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Asesor Signature Table */}
        {barcodes?.asesor?.asesor1 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
            <tbody>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>Asesor 1 :</td>
              </tr>
              <tr>
                <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Nama</td>
                <td style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  {barcodes.asesor.asesor1.nama?.toUpperCase() || ''}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan/ Tanggal</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img
                      src={barcodes.asesor.asesor1.url}
                      alt="Tanda Tangan Asesor 1"
                      style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                    />
                    {barcodes.asesor.asesor1.tanggal && (
                      <div style={{ fontSize: '11px', color: '#333' }}>
                        {new Date(barcodes.asesor.asesor1.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
        {barcodes?.asesor?.asesor2 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '14px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
            <tbody>
              <tr style={{ fontWeight: 'bold' }}>
                <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>Asesor 2 :</td>
              </tr>
              <tr>
                <td style={{ width: '30%', border: '1px solid #000', padding: '6px' }}>Nama</td>
                <td style={{ width: '5%', border: '1px solid #000', padding: '6px' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  {barcodes.asesor.asesor2.nama?.toUpperCase() || ''}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px' }}>Tanda tangan/ Tanggal</td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>:</td>
                <td style={{ height: '60px', border: '1px solid #000', padding: '6px', verticalAlign: 'middle', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <img
                      src={barcodes.asesor.asesor2.url}
                      alt="Tanda Tangan Asesor 2"
                      style={{ height: '50px', width: '50px', objectFit: 'contain' }}
                    />
                    {barcodes.asesor.asesor2.tanggal && (
                      <div style={{ fontSize: '11px', color: '#333' }}>
                        {new Date(barcodes.asesor.asesor2.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Actions */}
        <div style={{ marginTop: '20px' }}>
          {/* Pernyataan Checkbox */}
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }} onClick={() => setAgreedChecklist(!agreedChecklist)}>
              <CustomCheckbox
                checked={agreedChecklist}
                onChange={() => {}}
                style={{ pointerEvents: 'none', marginTop: '2px' }}
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan dengan sebenar-benarnya bahwa saya telah memberikan jawaban yang jujur dan dapat dipertanggungjawabkan sesuai dengan pengetahuan dan pengalaman yang saya miliki.
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <ActionButton variant="secondary" onClick={() => navigate(`/asesi/asesmen/${id}/upload-tugas`)}>
              Kembali
            </ActionButton>
            <ActionButton variant="primary" disabled={isSaving || !agreedChecklist} onClick={handleSave}>
              {isSaving ? 'Menyimpan...' : 'Selesai'}
            </ActionButton>
          </div>
        </div>
      </ModularAsesiLayout>

      {/* Confirmation Dialog for Asesi before Ujian */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Masuk ke Ujian"
        message="Apakah Anda sudah siap untuk mengerjakan ujian? Pastikan Anda memiliki waktu yang cukup dan koneksi internet yang stabil."
        confirmText="Ya, Siap"
        cancelText="Belum"
        onConfirm={() => {
          setShowConfirmDialog(false)
          setTimeout(() => navigate(`/asesi/asesmen/${id}/uji`), 100)
        }}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </div>
  )
}
