import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"

export default function Mapa02Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatanId } = useParams()

  const handleBack = () => {
    navigate(-1)
  }

  const handleSave = () => {
    // TODO: Implement save logic
    navigate(`/asesi/praasesmen/${kegiatanId}/fr-ak-07`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #000', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate("/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Pra-Asesmen</span>
            <span>/</span>
            <span>FR MAPA 02</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={5}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px', textTransform: 'uppercase' }}>FR. MAPA.02 - FORMULIR MAPA 02</h2>
          <p style={{ fontSize: '13px', color: '#666' }}>Isi atau lengkapi data formulir MAPA 02 di bawah ini</p>
        </div>

        {/* Content */}
        <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '8px', padding: '40px', textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>Formulir MAPA 02 sedang dalam pengembangan</p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleBack}
            style={{ padding: '8px 16px', border: '1px solid #000', background: '#fff', color: '#000', fontSize: '13px', cursor: 'pointer' }}
          >
            Kembali
          </button>
          <button
            onClick={handleSave}
            style={{ padding: '8px 16px', background: '#0066cc', color: '#fff', fontSize: '13px', cursor: 'pointer', border: 'none' }}
          >
            Simpan & Lanjut
          </button>
        </div>
      </AsesiLayout>
    </div>
  )
}
