import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { useDataDokumenAsesmen } from "@/hooks/useDataDokumenAsesmen"
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"

interface AspekAPI {
  aspek_id: string
  nama: string
  validitas: boolean | null
  reliabel: boolean | null
  fleksibel: boolean | null
  adil: boolean | null
}

interface DimensiKompetensiAPI {
  id: number
  nama: string
}

interface Ak06Response {
  message: string
  data: {
    aspek: AspekAPI[]
    feedback: {
      rekomendasi1: string
      rekomendasi2: string
      catatan_asesor1: string
      catatan_asesor2: string
    }
    dimensi_kompetensi: DimensiKompetensiAPI[]
  }
}

interface AspekItem {
  id: string
  nama: string
  validitas: boolean
  reliabel: boolean
  fleksibel: boolean
  adil: boolean
}

export default function Ak06Page() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { role: asesorRole, isAsesor1, isAsesor2 } = useAsesorRole(id)
  const { jabatanKerja, nomorSkema, tuk, asesorList, idAsesor2 } = useDataDokumenAsesmen(id)
  const { showSuccess, showError, showWarning } = useToast()

  // Get dynamic steps
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'
  const asesmenSteps = getAsesmenSteps(isAsesor, asesorRole, asesorList.length)

  // Logic: If asesor_2 exists, only asesor_2 can fill. Otherwise, asesor_1 fills.
  const hasAsesor2 = idAsesor2 !== null && idAsesor2 !== undefined
  const isFormDisabled = isAsesor && (
    hasAsesor2 ? !isAsesor2 : !isAsesor1
  )

  // Form state
  const [aspekItems, setAspekItems] = useState<AspekItem[]>([])
  const [rekomendasiPrinsip, setRekomendasiPrinsip] = useState('')
  const [rekomendasiDimensi, setRekomendasiDimensi] = useState('')
  const [komentarAsesor, setKomentarAsesor] = useState<Record<number, string>>({})
  const [feedbackData, setFeedbackData] = useState<{
    rekomendasi1: string
    rekomendasi2: string
    catatan_asesor1: string
    catatan_asesor2: string
  } | null>(null)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) {
        return
      }

      if (!id) {
        console.error("No id_izin found")
        setIsLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ak06`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result: Ak06Response = await response.json()
          if (result.message === "Success" && result.data) {
            // Transform aspek data
            const aspek: AspekItem[] = result.data.aspek.map((item) => ({
              id: item.aspek_id,
              nama: item.nama,
              validitas: item.validitas || false,
              reliabel: item.reliabel || false,
              fleksibel: item.fleksibel || false,
              adil: item.adil || false,
            }))
            setAspekItems(aspek)

            // Set feedback data
            setFeedbackData(result.data.feedback || null)
            setRekomendasiPrinsip(result.data.feedback?.rekomendasi1 || '')
            setRekomendasiDimensi(result.data.feedback?.rekomendasi2 || '')
          }
        } else {
          console.warn(`AK06 API returned ${response.status}`)
        }
      } catch (err) {
        console.error("Error fetching AK06:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, authLoading, asesorList])

  // Map komentar asesor when feedback data and asesorList are available
  useEffect(() => {
    if (feedbackData && asesorList.length > 0) {
      const komentarMap: Record<number, string> = {}
      if (feedbackData.catatan_asesor1 && asesorList[0]) {
        komentarMap[asesorList[0].id] = feedbackData.catatan_asesor1
      }
      if (feedbackData.catatan_asesor2 && asesorList[1]) {
        komentarMap[asesorList[1].id] = feedbackData.catatan_asesor2
      }
      setKomentarAsesor(komentarMap)
    }
  }, [feedbackData, asesorList])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <DashboardNavbar userName={user?.name} />
        <FullPageLoader text="Memuat data AK.06..." />
      </div>
    )
  }

  const handleAspekChange = (id: string, field: keyof Pick<AspekItem, 'validitas' | 'reliabel' | 'fleksibel' | 'adil'>) => {
    if (isFormDisabled) return
    setAspekItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: !item[field] }
      }
      return item
    }))
  }

  const handleSave = async () => {
    if (!agreedChecklist) {
      showWarning('Silakan centang pernyataan terlebih dahulu')
      return
    }

    if (!id) {
      showWarning('ID tidak ditemukan')
      return
    }

    try {
      const token = localStorage.getItem("access_token")

      // Prepare answers array for aspek
      const answers = aspekItems.map((item) => ({
        aspek_id: parseInt(item.id),
        validitas: item.validitas || null,
        reliabel: item.reliabel || null,
        fleksibel: item.fleksibel || null,
        adil: item.adil || null,
      }))

      const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ak06`, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          rekomendasi1: rekomendasiPrinsip,
          rekomendasi2: rekomendasiDimensi,
          catatan_asesor1: komentarAsesor[asesorList[0]?.id] || '',
          catatan_asesor2: komentarAsesor[asesorList[1]?.id] || '',
        }),
      })

      if (response.ok) {
        showSuccess('AK 06 berhasil disimpan!')
        setTimeout(() => {
          navigate(`/asesi/asesmen/${id}/selesai`)
        }, 500)
      } else {
        console.error('Failed to save AK06:', response.status)
        showError('Gagal menyimpan data. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Error saving AK06:', err)
      showError('Terjadi kesalahan. Silakan coba lagi.')
    }
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
            <span>AK.06</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={asesmenSteps.find(s => s.href.includes('ak06'))?.number || 7} steps={asesmenSteps} id={id}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', margin: '0' }}>
            FR.AK.06. MENINJAU PROSES ASESMEN
          </h2>
        </div>

        {/* IDENTITAS Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td rowSpan={2} style={{ width: '30%', background: '#fff', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>Skema Sertifikasi<br />(KKNI/Okupasi/Klaster)</td>
              <td style={{ width: '12%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Judul</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{jabatanKerja || '-'}</td>
            </tr>
            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Nomor</td>
              <td style={{ border: '1px solid #000', padding: '6px' }}>{nomorSkema || '-'}</td>
            </tr>
            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>TUK</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{tuk || '-'}</td>
            </tr>
            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Nama Asesor</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>
                {asesorList.map((asesor, idx) => (
                  <span key={asesor.id}>
                    {idx > 0 && ', '}
                    {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
                  </span>
                ))}
              </td>
            </tr>
            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Tanggal</td>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>{new Date().toLocaleDateString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        {/* PENJELASAN Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <th style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', textAlign: 'left', border: '1px solid #000', padding: '6px' }}>Penjelasan:</th>
            </tr>
            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
                1. Peninjauan dapat dilakukan oleh lead asesor atau asesor yang melaksanakan asesmen.<br />
                2. Peninjauan dapat dilakukan secara terpadu dalam skema sertifikasi dan / atau peserta kelompok yang homogen.<br />
                3. Isilah pemenuhan dimensi kompetensi dengan menulis kode rekaman formulir yang membuktikan terpenuhinya dimensi kompetensi.
              </td>
            </tr>
          </tbody>
        </table>

        {/* KONSEP ASESMEN Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <th rowSpan={2} style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Aspek yang ditinjau</th>
              <th colSpan={4} style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Kesesuaian dengan prinsip asesmen</th>
            </tr>
            <tr>
              <th style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Validitas</th>
              <th style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Reliabel</th>
              <th style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Fleksibel</th>
              <th style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Adil</th>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>Prosedur asesmen:<br />• Rencana asesmen</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.validitas || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.id || '', 'validitas')} disabled={isFormDisabled} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.reliabel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.id || '', 'reliabel')} disabled={isFormDisabled} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.fleksibel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.id || '', 'fleksibel')} disabled={isFormDisabled} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.adil || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Rencana asesmen'))?.id || '', 'adil')} disabled={isFormDisabled} />
              </td>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>• Persiapan asesmen</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.validitas || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.id || '', 'validitas')} disabled={isFormDisabled} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.reliabel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.id || '', 'reliabel')} disabled={isFormDisabled} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.fleksibel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.id || '', 'fleksibel')} disabled={isFormDisabled} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.adil || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Persiapan asesmen'))?.id || '', 'adil')} disabled={isFormDisabled} />
              </td>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>• Implementasi asesmen</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.validitas || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.id || '', 'validitas')} disabled={isFormDisabled} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.reliabel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.id || '', 'reliabel')} disabled={isFormDisabled} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.fleksibel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.id || '', 'fleksibel')} disabled={isFormDisabled} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.adil || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Implementasi asesmen'))?.id || '', 'adil')} disabled={isFormDisabled} />
              </td>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>• Keputusan asesmen</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.validitas || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.id || '', 'validitas')} disabled={isFormDisabled} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.reliabel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.id || '', 'reliabel')} disabled={isFormDisabled} />
              </td>
              <td style={{ background: '#000', border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.adil || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Keputusan asesmen'))?.id || '', 'adil')} disabled={isFormDisabled} />
              </td>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>• Umpan balik asesmen</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.validitas || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.id || '', 'validitas')} disabled={isFormDisabled} />
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.reliabel || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.id || '', 'reliabel')} disabled={isFormDisabled} />
              </td>
              <td style={{ background: '#000', border: '1px solid #000', padding: '6px' }}></td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>
                <CustomCheckbox checked={aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.adil || false} onChange={() => handleAspekChange(aspekItems.find(a => a.nama.includes('Umpan balik asesmen'))?.id || '', 'adil')} disabled={isFormDisabled} />
              </td>
            </tr>

            <tr>
              <td colSpan={5} style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
                Rekomendasi untuk peningkatan<br />
                <textarea
                  value={rekomendasiPrinsip}
                  onChange={(e) => setRekomendasiPrinsip(e.target.value)}
                  disabled={isFormDisabled}
                  style={{
                    width: '100%',
                    height: '120px',
                    border: '1px solid #ccc',
                    padding: '6px',
                    fontSize: '13px',
                    resize: 'none',
                    cursor: isFormDisabled ? 'not-allowed' : 'text'
                  }}
                  placeholder="Tuliskan rekomendasi..."
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* DIMENSI KOMPETENSI Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <th rowSpan={2} style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Aspek yang ditinjau</th>
              <th colSpan={5} style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Pemenuhan dimensi kompetensi</th>
            </tr>
            <tr>
              <th style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Task Skills</th>
              <th style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Task Management Skills</th>
              <th style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Contingency Management Skills</th>
              <th style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Job Role/Environment Skills</th>
              <th style={{ background: '#cc0000', color: '#fff', fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', border: '1px solid #000', padding: '6px' }}>Transfer Skills</th>
            </tr>

            <tr>
              <td style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
                <b>Konsistensi keputusan asesmen</b><br />
                Bukti dari berbagai asesmen diperiksa untuk konsistensi dimensi kompetensi
              </td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>L/DIT<br/> T/DPT</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>L/DIT<br/> T/DPT</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>L/DIT<br/> T/DPT</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>L/DIT<br/> T/DPT</td>
              <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px' }}>L/DIT<br/> T/DPT</td>
            </tr>

            <tr>
              <td colSpan={6} style={{ background: '#fff', border: '1px solid #000', padding: '6px' }}>
                Rekomendasi untuk peningkatan:<br />
                <textarea
                  value={rekomendasiDimensi}
                  onChange={(e) => setRekomendasiDimensi(e.target.value)}
                  disabled={isFormDisabled}
                  style={{
                    width: '100%',
                    height: '120px',
                    padding: '6px',
                    border: '1px solid #ccc',
                    fontSize: '13px',
                    resize: 'none',
                    cursor: isFormDisabled ? 'not-allowed' : 'text'
                  }}
                  placeholder="Tuliskan rekomendasi..."
                />
              </td>
            </tr>
          </tbody>
        </table>

        {/* TANDA TANGAN Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px', background: '#fff', border: '1px solid #000' }}>
          <tbody>
            <tr>
              <td style={{ width: '33%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Nama Lead Asesor/Asesor</td>
              <td style={{ width: '33%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Tanggal Tanda Tangan</td>
              <td style={{ width: '34%', background: '#fff', border: '1px solid #000', padding: '6px' }}>Komentar</td>
            </tr>
            {asesorList.map((asesor, index) => {
              // Check if this is the logged-in asesor's comment
              const isOwnComment = (
                (isAsesor1 && index === 0) ||  // asesor_1 can edit asesor_1's comment
                (isAsesor2 && index === 1)      // asesor_2 can edit asesor_2's comment
              )
              const isCommentDisabled = isAsesor && !isOwnComment

              return (
                <tr key={asesor.id}>
                  <td style={{ height: '100px', border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}>
                    {asesor.nama?.toUpperCase() || ''}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px', verticalAlign: 'top' }}></td>
                  <td style={{ border: '1px solid #000', padding: '6px' }}>
                    <textarea
                      value={komentarAsesor[asesor.id] || ''}
                      onChange={(e) => setKomentarAsesor(prev => ({ ...prev, [asesor.id]: e.target.value }))}
                      disabled={isCommentDisabled}
                      style={{
                        width: '100%',
                        height: '80px',
                        border: '1px solid #ccc',
                        padding: '6px',
                        fontSize: '13px',
                        resize: 'none',
                        cursor: isCommentDisabled ? 'not-allowed' : 'text'
                      }}
                      placeholder="Tuliskan komentar..."
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Actions */}
        <div style={{ marginTop: '20px' }}>
          {/* Pernyataan Checkbox */}
          <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <CustomCheckbox
                checked={agreedChecklist}
                onChange={() => setAgreedChecklist(!agreedChecklist)}
                style={{ marginTop: '2px' }}
                disabled={isFormDisabled}
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan dengan sebenar-benarnya bahwa peninjauan proses asesmen ini telah saya lakukan dengan objektif dan dapat dipertanggungjawabkan.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <ActionButton
              variant="secondary"
              onClick={() => {
                const currentStepIndex = asesmenSteps.findIndex(s => s.href.includes('ak06'))
                const prevStep = asesmenSteps[currentStepIndex - 1]
                if (prevStep) {
                  const prevPath = prevStep.href.replace('/asesi/asesmen/', `/asesi/asesmen/${id}/`)
                  navigate(prevPath)
                }
              }}
            >
              Kembali
            </ActionButton>
            <ActionButton variant="primary" disabled={!agreedChecklist} onClick={handleSave}>
              Selesai
            </ActionButton>
          </div>
        </div>
      </ModularAsesiLayout>
    </div>
  )
}
