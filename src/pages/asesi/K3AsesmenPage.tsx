import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import MukLayout from "@/components/MukLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { ActionButton } from "@/components/ui/ActionButton"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { useAbsenCheck } from "@/hooks/useAbsenCheck"
import { useRealtimeSync } from "@/hooks/useRealtimeSync"
import { WebcamModal } from "@/components/ui/WebcamModal"
import { API_BASE_URL } from "@/config/api"
import { useSigningState, BarcodeState } from "@/hooks/useSigningState"

interface K3Response {
  message: string
  data: {
    file: string
    barcodes?: BarcodeState
  }
}

export default function K3AsesmenPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'

  const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin
  const { showWarning, showSuccess } = useToast()
  const { asesorList, tahap, jadwalId } = useDataDokumenPraAsesmen(idIzin)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPerjanjianModal, setShowPerjanjianModal] = useState(false)
  const [perjanjianAgreed, setPerjanjianAgreed] = useState(false)
  const [barcodes, setBarcodes] = useState<BarcodeState | null>(null)

  const fetchK3Data = useCallback(async () => {
    if (!idIzin) return
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_BASE_URL}/praasesmen/${idIzin}/file-k3`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result: K3Response = await response.json()
        if (result.message === "Success" && result.data) {
          if (result.data.file) setPdfUrl(result.data.file)
          if (result.data.barcodes) setBarcodes(result.data.barcodes as BarcodeState)
        }
      } else {
        console.warn(`K3 API returned ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching K3:", error)
    } finally {
      setIsLoading(false)
    }
  }, [idIzin])

  const signing = useSigningState({
    pageKey: 'k3',
    isAsesor: isAsesor,
    tahap: tahap ?? 1,
    barcodes: barcodes as any,
    setBarcodes: setBarcodes as any,
    asesorList: asesorList,
    userId: user?.id,
    userName: user?.name,
    idIzin: idIzin,
    jadwalId: jadwalId,
    onRefresh: fetchK3Data,
  })

  // Absen check - auto-detect role (asesi/asesor1/asesor2)
  const { showAwalModal, submitAbsenAwal, handleAwalModalClose } = useAbsenCheck({
    phase: 'praasesmen',
    role: 'auto',
    checkOnMount: true, // Enable for both asesi and asesor
    idIzin: idIzin,
    asesorList: asesorList,
    tahap: tahap
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchK3Data()
  }, [idIzin, fetchK3Data])

  // SSE: auto-refresh when another user saves
  useRealtimeSync({
    channelName: `praasesmen:${idIzin}`,
    onUpdate: fetchK3Data
  })

  const handleBack = () => {
    navigate(-1)
  }

  const handleLanjut = async () => {
    if (!signing.agreedChecklist && !signing.allSigned) {
      showWarning("Silakan centang pernyataan bahwa Anda telah memahami dokumen K3 Asesmen.")
      return
    }
    // Jika belum semua ttd, generate QR (asesi tanda tangan duluan)
    if (!signing.allSigned && !signing.asesiHasSigned) {
      const ok = await signing.generateQR()
      if (!ok) return
      showSuccess("QR Code berhasil dibuat. Menunggu tanda tangan Asesor.")
      signing.publishUpdate()
      return // Tunggu asesor tanda tangan
    }
    // Semua sudah ttd → lanjut ke perjanjian
    setShowPerjanjianModal(true)
  }

  if (isLoading) {
    return <FullPageLoader text="Memuat dokumen K3 Asesmen..." />
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      
      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #000', background: '#fff' }}>
        <div style={{ padding: '12px 16px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate("/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Pra-Asesmen</span>
            <span>/</span>
            <span>K3 Asesmen</span>
          </div>
        </div>
      </div>

      <MukLayout currentStep={5} idIzin={idIzin}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px', textTransform: 'uppercase' }}>K3 ASESMEN</h2>
          <p style={{ fontSize: '13px', color: '#666' }}>Baca dan pahami dokumen K3 Asesmen di bawah ini</p>
        </div>

        {/* PDF Viewer */}
        {pdfUrl ? (
          <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' }}>
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=fitH`}
              style={{
                width: '100%',
                height: '800px',
                border: 'none'
              }}
              title="K3 Asesmen PDF"
            />
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '4px', padding: '40px', textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>Dokumen K3 Asesmen tidak tersedia</p>
          </div>
        )}

        {/* Agreement Checklist */}
        {!signing.allSigned && (
        <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '4px', marginBottom: '20px', padding: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: signing.allSigned ? 'not-allowed' : 'pointer' }}>
            <input
              type="checkbox"
              checked={signing.agreedChecklist}
              onChange={(e) => signing.setAgreedChecklist(e.target.checked)}
              disabled={signing.allSigned}
              style={{ marginTop: '2px', width: '16px', height: '16px', cursor: signing.allSigned ? 'not-allowed' : 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.5' }}>
              <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah membaca, memahami, dan menyetujui dokumen K3 Asesmen ini dengan sebenar-benarnya.
            </span>
          </label>
        </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {isAsesor && (
            <ActionButton variant="secondary" onClick={handleBack}>
              Kembali
            </ActionButton>
          )}
          <ActionButton variant="primary" disabled={signing.buttonDisabled} onClick={handleLanjut}>
            {signing.buttonText}
          </ActionButton>
        </div>
      </MukLayout>

      {/* Absen Awal Modal */}
      <WebcamModal
        isOpen={showAwalModal}
        onClose={handleAwalModalClose}
        onSubmit={submitAbsenAwal}
        title="Absen Masuk Pra-Asesmen"
        description="Silakan ambil foto wajah Anda untuk absen masuk"
        canClose={false}
      />

      {/* Perjanjian Asesmen Confirm Modal */}
      {showPerjanjianModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'modalSlideIn 0.3s ease-out',
            }}
          >
            <style>{`
              @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f0f9ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                Perjanjian Asesmen
              </h3>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
                Anda akan masuk ke tahap Perjanjian Asesmen. Pastikan Anda telah membaca dan memahami dokumen perjanjian dengan cermat dan teliti.
              </p>
            </div>

            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              marginBottom: '24px',
              padding: '12px',
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={perjanjianAgreed}
                  onChange={(e) => setPerjanjianAgreed(e.target.checked)}
                  style={{ marginTop: '2px', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>
                  Saya telah membaca perjanjian asesmen dengan cermat dan teliti
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowPerjanjianModal(false)
                  setPerjanjianAgreed(false)
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#f3f4f6',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f3f4f6' }}
              >
                Kembali
              </button>
              <button
                onClick={() => navigate(`/asesi/perjanjian/${idIzin}/fr-ak-01`)}
                disabled={!perjanjianAgreed}
                style={{
                  flex: 2,
                  padding: '10px',
                  background: perjanjianAgreed ? '#3b82f6' : '#cbd5e1',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: perjanjianAgreed ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { if (perjanjianAgreed) e.currentTarget.style.background = '#2563eb' }}
                onMouseLeave={(e) => { if (perjanjianAgreed) e.currentTarget.style.background = '#3b82f6' }}
              >
                Lanjut ke Perjanjian Asesmen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
