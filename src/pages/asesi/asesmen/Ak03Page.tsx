import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { getAsesmenSteps } from "@/lib/asesmen-steps"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { CustomCheckbox } from "@/components/ui/Checkbox"

interface SoalAPI {
  id: number
  no: string
  jenis: string
  soal: string
  is_kompeten: boolean
  catatan: string
}

interface FeedbackItem {
  id: number
  pertanyaan: string
  ya: boolean
  tidak: boolean
  catatan: string
}

interface Ak03Response {
  message: string
  data: {
    soal: SoalAPI[]
    catatan: string
  }
}

export default function Ak03Page() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { role: asesorRole, isAsesor1 } = useAsesorRole(id)
  const { showSuccess, showError, showWarning } = useToast()

  // Get dynamic steps
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'
  const asesmenSteps = getAsesmenSteps(isAsesor, asesorRole, 0)

  // Disable form if asesor but not asesor_1 (only asesor_1 can fill)
  const isFormDisabled = isAsesor && !isAsesor1

  // Form state
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [catatanUmum, setCatatanUmum] = useState('')
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch soal data
  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to load
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
        const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ak03`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result: Ak03Response = await response.json()
          if (result.message === "Success" && result.data?.soal) {
            // Transform API data to FeedbackItem format
            const items: FeedbackItem[] = result.data.soal.map((soal) => ({
              id: soal.id,
              pertanyaan: soal.soal,
              ya: soal.is_kompeten || false,
              tidak: !soal.is_kompeten,
              catatan: soal.catatan || '',
            }))
            setFeedbackItems(items)
            // Set catatan umum from API
            setCatatanUmum(result.data.catatan || '')
          }
        } else {
          console.warn(`AK03 API returned ${response.status}`)
        }
      } catch (err) {
        console.error("Error fetching AK03:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, authLoading])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
        <DashboardNavbar userName={user?.name} />
        <FullPageLoader text="Memuat data AK.03..." />
      </div>
    )
  }

  const handleFeedbackChange = (id: number, field: 'ya' | 'tidak') => {
    setFeedbackItems(prev => prev.map(item => {
      if (item.id === id) {
        if (field === 'ya') {
          return { ...item, ya: !item.ya, tidak: false }
        } else {
          return { ...item, ya: false, tidak: !item.tidak }
        }
      }
      return item
    }))
  }

  const handleCatatanChange = (id: number, value: string) => {
    setFeedbackItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, catatan: value }
      }
      return item
    }))
  }

  // Determine back button based on asesor role
  const getBackPath = () => {
    if (asesorRole === 'asesor_1') {
      return `/asesi/asesmen/${id}/ak02`
    } else {
      return `/asesi/asesmen/${id}/ia05`
    }
  }

  // Handle save - POST to API
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

      // Prepare answers array
      const answers = feedbackItems.map((item) => ({
        soal_id: item.id,
        is_kompeten: item.ya,
        catatan: item.catatan,
      }))

      const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${id}/ak03`, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          catatan: catatanUmum
        }),
      })

      if (response.ok) {
        showSuccess('AK 03 berhasil disimpan!')
        setTimeout(() => {
          // Navigate to AK06 (asesor_1 only, asesor_2 skips AK03)
          navigate(`/asesi/asesmen/${id}/ak06`)
        }, 500)
      } else {
        console.error('Failed to save AK03:', response.status)
        showError('Gagal menyimpan data. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Error saving AK03:', err)
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
            <span>AK.03</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={asesmenSteps.find(s => s.href.includes('ak03'))?.number || 6} steps={asesmenSteps} id={id}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
            FR.AK.03  UMPAN BALIK ASESI
          </h1>
        </div>

        <p style={{ fontSize: '13px', marginBottom: '15px' }}>
          Umpan balik dari Asesi (diisi oleh Asesi setelah pengambilan keputusan) :
        </p>

        {/* UM PAN BALIK Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px', background: '#fff', border: '2px solid #000' }}>
          <tbody>
            <tr style={{ background: '#d10000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <th rowSpan={2} style={{ width: '55%', border: '1px solid #000', padding: '6px' }}>KOMPONEN</th>
              <th colSpan={2} style={{ border: '1px solid #000', padding: '6px' }}>Hasil</th>
              <th rowSpan={2} style={{ width: '25%', border: '1px solid #000', padding: '6px' }}>Catatan/Komentar Asesi</th>
            </tr>
            <tr style={{ background: '#d10000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
              <th style={{ width: '50px', border: '1px solid #000', padding: '6px' }}>Ya</th>
              <th style={{ width: '50px', border: '1px solid #000', padding: '6px' }}>Tidak</th>
            </tr>

            {feedbackItems.map((item) => (
              <tr key={item.id}>
                <td style={{ border: '1px solid #000', padding: '6px' }}>{item.pertanyaan}</td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '18px' }}>
                  <CustomCheckbox
                    checked={item.ya}
                    onChange={() => handleFeedbackChange(item.id, 'ya')}
                    disabled={isFormDisabled}
                    style={{ cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '18px' }}>
                  <CustomCheckbox
                    checked={item.tidak}
                    onChange={() => handleFeedbackChange(item.id, 'tidak')}
                    disabled={isFormDisabled}
                    style={{ cursor: isFormDisabled ? 'not-allowed' : 'pointer' }}
                  />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  <textarea
                    value={item.catatan}
                    onChange={(e) => handleCatatanChange(item.id, e.target.value)}
                    disabled={isFormDisabled}
                    style={{ width: '100%', height: '80px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none', cursor: isFormDisabled ? 'not-allowed' : 'text' }}
                    placeholder="Tuliskan catatan..."
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ width: '20%', border: '1px solid #000', padding: '6px' }}><b>Catatan :</b></td>
              <td colSpan={3} style={{ border: '1px solid #000', padding: '6px' }}>
                <textarea
                  value={catatanUmum}
                  onChange={(e) => setCatatanUmum(e.target.value)}
                  disabled={isFormDisabled}
                  style={{ width: '100%', height: '80px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none', cursor: isFormDisabled ? 'not-allowed' : 'text' }}
                  placeholder="Tuliskan catatan umum..."
                />
              </td>
            </tr>
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
              />
              <span style={{ fontSize: '13px', color: '#333' }}>
                Saya menyatakan dengan sebenar-benarnya bahwa umpan balik yang saya berikan adalah jujur dan sesuai dengan pengalaman saya selama proses asesmen.
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => navigate(getBackPath())}
              style={{
                padding: '8px 16px',
                border: '1px solid #999',
                background: '#fff',
                color: '#000',
                fontSize: '13px',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              Kembali
            </button>
            <button
              onClick={handleSave}
              disabled={!agreedChecklist}
              style={{
                padding: '8px 16px',
                background: agreedChecklist ? '#0066cc' : '#999',
                color: '#fff',
                fontSize: '13px',
                cursor: agreedChecklist ? 'pointer' : 'not-allowed',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Selesai
            </button>
          </div>
        </div>
      </ModularAsesiLayout>
    </div>
  )
}
