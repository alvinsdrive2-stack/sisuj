import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { ActionButton } from "@/components/ui/ActionButton"

interface K3Response {
  message: string
  data: {
    file: string
  }
}

export default function K3AsesmenPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'

  const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin
  const { showSuccess, showWarning } = useToast()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agreedChecklist, setAgreedChecklist] = useState(false)

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchPdfUrl = async () => {
      try {
        const token = localStorage.getItem("access_token")

        // If no idIzin, we'll use the base endpoint
        const response = await fetch(`https://backend.devgatensi.site/api/praasesmen/file-k3`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result: K3Response = await response.json()
          if (result.message === "Success" && result.data?.file) {
            setPdfUrl(result.data.file)
          }
        } else {
          console.warn(`K3 API returned ${response.status}`)
        }
      } catch (error) {
        console.error("Error fetching K3 PDF:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdfUrl()
  }, [idIzin])

  const handleBack = () => {
    navigate(-1)
  }

  const handleSave = async () => {
    if (!agreedChecklist) {
      showWarning("Silakan centang pernyataan bahwa Anda telah memahami dokumen K3 Asesmen.")
      return
    }

    setIsSaving(true)
    try {
      // TODO: POST data to backend if needed
      await new Promise(resolve => setTimeout(resolve, 500))
      showSuccess('K3 Asesmen berhasil disimpan!')
      setTimeout(() => {
        navigate(`/asesi/praasesmen/${idIzin}/fr-ak-01`)
      }, 500)
    } catch (error) {
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <FullPageLoader text="Memuat dokumen K3 Asesmen..." />
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
            <span>K3 Asesmen</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={8}>
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
        <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '4px', marginBottom: '20px', padding: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={agreedChecklist}
              onChange={(e) => setAgreedChecklist(e.target.checked)}
              style={{ marginTop: '2px', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.5' }}>
              <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah membaca, memahami, dan menyetujui dokumen K3 Asesmen ini dengan sebenar-benarnya.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <ActionButton variant="secondary" onClick={handleBack} disabled={isSaving}>
            Kembali
          </ActionButton>
          <ActionButton variant="primary" disabled={isSaving || !agreedChecklist} onClick={handleSave}>
            {isSaving ? "Menyimpan..." : "Simpan & Lanjut"}
          </ActionButton>
        </div>
      </AsesiLayout>
    </div>
  )
}
