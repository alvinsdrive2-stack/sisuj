import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"

export default function FrAk01Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatanId } = useParams()

  const handleBack = () => {
    navigate(-1)
  }

  const handleSave = () => {
    // TODO: Implement save logic with kegiatanId
    void kegiatanId // Prevent unused variable warning
    navigate("/asesi/dashboard")
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
            <span>FR.AK.01</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={9}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px', textTransform: 'uppercase' }}>FR.AK.01 - FORMULIR AK 01</h2>
          <p style={{ fontSize: '13px', color: '#666' }}>Isi atau lengkapi data formulir AK 01 di bawah ini</p>
        </div>

        {/* Content */}
        <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '8px', padding: '40px', textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>Formulir AK 01 sedang dalam pengembangan</p>
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
            Selesai
          </button>
        </div>
      </AsesiLayout>
    </div>
  )
}
