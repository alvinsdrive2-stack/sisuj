import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import ModularAsesiLayout from "@/components/ModularAsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { PRAASESMEN_STEPS } from "@/lib/asesmen-steps"
import { ActionButton } from "@/components/ui/ActionButton"

export default function Ak01SuccessPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [countdown, setCountdown] = useState(3)

  // Step 10 (Selesai) for AK01 Success
  const currentStep = 10

  const handleBackToDashboard = () => {
    if (user?.role?.name?.toLowerCase() === "asesor") {
      navigate("/asesor/asesi")
    } else {
      navigate("/asesi/dashboard")
    }
  }

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    // Auto redirect after 3 seconds
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setTimeout(() => handleBackToDashboard(), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #000', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate("/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Pra-Asesmen</span>
            <span>/</span>
            <span>FR.AK.01</span>
            <span>/</span>
            <span>Selesai</span>
          </div>
        </div>
      </div>

      <ModularAsesiLayout currentStep={currentStep} steps={PRAASESMEN_STEPS}>
        <div>
        {/* Success Card */}
        <div style={{ width: '100%', background: '#fff', border: '1px solid #000', padding: '40px', textAlign: 'center' }}>
          <style>{`
            @keyframes stroke { 100% { stroke-dashoffset: 0; } }
            @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
            @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 30px #7ac142; } }
            .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10; stroke: #7ac142; fill: none; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
            .checkmark { width: 56px; height: 56px; border-radius: 50%; display: block; stroke-width: 2; stroke: #fff; stroke-miterlimit: 10; margin: 0 auto 20px; box-shadow: inset 0px 0px 0px #7ac142; animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both; }
            .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; stroke: #fff; stroke-width: 3; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
          `}</style>

          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark__check" fill="none" stroke="#fff" strokeWidth="3" d="m14.1 27.2 7.1 7.2 16.7-16.8"/>
          </svg>

          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#000', marginBottom: '10px', textTransform: 'uppercase' }}>
            Pra-Asesmen Selesai
          </h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
            Terima kasih! Seluruh formulir Pra-Asesmen telah Anda lengkapi.<br />
            Data Anda akan direview oleh asesor sebelum pelaksanaan asesmen.
          </p>
          <p style={{ fontSize: '12px', color: '#999', marginBottom: '30px' }}>
            Mengalihkan ke Dashboard dalam <span style={{ fontWeight: 'bold', color: '#0066cc' }}>{countdown}</span> detik...
          </p>

          <ActionButton
            variant="primary"
            onClick={handleBackToDashboard}
            style={{ padding: '12px 32px', textTransform: 'uppercase', fontWeight: 'bold' }}
          >
            Kembali ke Dashboard Sekarang
          </ActionButton>
        </div>
        </div>
      </ModularAsesiLayout>
    </div>
  )
}
