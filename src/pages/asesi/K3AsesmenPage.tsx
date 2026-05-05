import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { ActionButton } from "@/components/ui/ActionButton"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { useAbsenCheck } from "@/hooks/useAbsenCheck"
import { useRealtimeSync } from "@/hooks/useRealtimeSync"
import { WebcamModal } from "@/components/ui/WebcamModal"
import { API_BASE_URL } from "@/config/api"

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
  const { asesorList } = useDataDokumenPraAsesmen(idIzin)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [barcodes, setBarcodes] = useState<{
    asesi?: { url: string; tanggal: string; nama: string }
    asesor1?: { url: string; tanggal: string; nama: string } | null
    asesor2?: { url: string; tanggal: string; nama: string } | null
  } | null>(null)

  // Absen check - auto-detect role (asesi/asesor1/asesor2)
  const { showAwalModal, submitAbsenAwal, handleAwalModalClose } = useAbsenCheck({
    phase: 'praasesmen',
    role: 'auto',
    checkOnMount: true, // Enable for both asesi and asesor
    idIzin: idIzin,
    asesorList: asesorList
  })

  const fetchK3Data = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch(`${API_BASE_URL}/praasesmen/file-k3`, {
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
        if ((result as any).data?.barcodes) {
          setBarcodes((result as any).data.barcodes)
        }
      } else {
        console.warn(`K3 API returned ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching K3 PDF:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    fetchK3Data()
  }, [idIzin, fetchK3Data])

  // SSE: auto-refresh when another user saves
  const { publishUpdate } = useRealtimeSync({
    channelName: `praasesmen:${idIzin}`,
    onUpdate: fetchK3Data
  })

  const asesiHasSigned = !!barcodes?.asesi?.url
  const asesor1Signed = !!barcodes?.asesor1?.url
  const asesor2Signed = !!barcodes?.asesor2?.url
  const allSigned = asesiHasSigned && (asesorList.length === 0 || (
    asesor1Signed && (asesorList.length < 2 || asesor2Signed)
  ))

  useEffect(() => {
    if (allSigned) setAgreedChecklist(true)
  }, [allSigned])

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
      publishUpdate()
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

      <AsesiLayout currentStep={8} idIzin={idIzin}>
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
        {!allSigned && (
        <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '4px', marginBottom: '20px', padding: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: allSigned ? 'not-allowed' : 'pointer' }}>
            <input
              type="checkbox"
              checked={agreedChecklist}
              onChange={(e) => setAgreedChecklist(e.target.checked)}
              disabled={allSigned}
              style={{ marginTop: '2px', width: '16px', height: '16px', cursor: allSigned ? 'not-allowed' : 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.5' }}>
              <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah membaca, memahami, dan menyetujui dokumen K3 Asesmen ini dengan sebenar-benarnya.
            </span>
          </label>
        </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <ActionButton variant="secondary" onClick={handleBack} disabled={isSaving}>
            Kembali
          </ActionButton>
          <ActionButton variant="primary" disabled={isSaving || (!allSigned && !agreedChecklist)} onClick={handleSave}>
            {isSaving ? "Menyimpan..." : allSigned ? "Lanjut ke FR AK 01" : "Simpan & Lanjut"}
          </ActionButton>
        </div>
      </AsesiLayout>

      {/* Absen Awal Modal */}
      <WebcamModal
        isOpen={showAwalModal}
        onClose={handleAwalModalClose}
        onSubmit={submitAbsenAwal}
        title="Absen Masuk Pra-Asesmen"
        description="Silakan ambil foto wajah Anda untuk absen masuk"
        canClose={false}
      />
    </div>
  )
}
