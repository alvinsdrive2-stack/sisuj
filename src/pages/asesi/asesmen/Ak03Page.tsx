import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { getAsesmenSteps } from "@/lib/asesmen-steps"

interface FeedbackItem {
  id: number
  pertanyaan: string
  ya: boolean
  tidak: boolean
  catatan: string
}

export default function Ak03Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { id } = useParams<{ id?: string }>()
  const { role: asesorRole } = useAsesorRole(id)

  // Get dynamic steps
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'
  const asesmenSteps = getAsesmenSteps(isAsesor, asesorRole, 0)

  // Form state
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([
    {
      id: 1,
      pertanyaan: 'Saya mendapatkan penjelasan yang cukup memadai mengenai proses asesmen/uji kompetensi',
      ya: false,
      tidak: false,
      catatan: ''
    },
    {
      id: 2,
      pertanyaan: 'Saya diberikan kesempatan untuk mempelajari standar kompetensi yang akan diuji dan menilai diri sendiri terhadap pencapaiannya',
      ya: false,
      tidak: false,
      catatan: ''
    },
    {
      id: 3,
      pertanyaan: 'Asesor memberikan kesempatan untuk mendiskusikan/menegosiasikan metoda, instrumen dan sumber asesmen serta jadwal asesmen',
      ya: false,
      tidak: false,
      catatan: ''
    },
    {
      id: 4,
      pertanyaan: 'Asesor berusaha menggali seluruh bukti pendukung yang sesuai dengan latar belakang pelatihan dan pengalaman yang saya miliki',
      ya: false,
      tidak: false,
      catatan: ''
    },
    {
      id: 5,
      pertanyaan: 'Saya sepenuhnya diberikan kesempatan untuk mendemonstrasikan kompetensi yang saya miliki selama asesmen',
      ya: false,
      tidak: false,
      catatan: ''
    }
  ])
  const [catatanUmum, setCatatanUmum] = useState('')
  const [agreedChecklist, setAgreedChecklist] = useState(false)

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
                  <input
                    type="checkbox"
                    checked={item.ya}
                    onChange={() => handleFeedbackChange(item.id, 'ya')}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ textAlign: 'center', border: '1px solid #000', padding: '6px', fontSize: '18px' }}>
                  <input
                    type="checkbox"
                    checked={item.tidak}
                    onChange={() => handleFeedbackChange(item.id, 'tidak')}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
                <td style={{ border: '1px solid #000', padding: '6px' }}>
                  <textarea
                    value={item.catatan}
                    onChange={(e) => handleCatatanChange(item.id, e.target.value)}
                    style={{ width: '100%', height: '80px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none' }}
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
                  style={{ width: '100%', height: '80px', border: '1px solid #ccc', padding: '6px', fontSize: '13px', resize: 'none' }}
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
              <input
                type="checkbox"
                checked={agreedChecklist}
                onChange={(e) => setAgreedChecklist(e.target.checked)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
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
              onClick={() => {
                if (!agreedChecklist) return
                // Navigate to selesai
                navigate(`/asesi/asesmen/${id}/selesai`)
              }}
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
