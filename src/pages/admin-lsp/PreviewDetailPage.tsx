import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "@/config/api"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import PreviewFlowLayout, { PREVIEW_STEPS } from "@/components/preview/PreviewFlowLayout"
import {
  Apl01Preview, Apl02Preview,
  Mapa01Preview, Mapa02Preview,
  Ia01Preview, Ia02Preview, Ia04aPreview, Ia04bPreview, Ia05Preview, Ia08Preview,
  Ak02Preview, Ak03Preview,
} from "@/components/preview/PreviewRenderer"

const DOC_API: Record<string, { prefix: string }> = {
  apl01: { prefix: 'praasesmen' },
  apl02: { prefix: 'praasesmen' },
  mapa01: { prefix: 'praasesmen' },
  mapa02: { prefix: 'praasesmen' },
  ia01: { prefix: 'asesmen' },
  ia02: { prefix: 'asesmen' },
  ia03: { prefix: 'asesmen' },
  ia04a: { prefix: 'asesmen' },
  ia04b: { prefix: 'asesmen' },
  ia05: { prefix: 'asesmen' },
  ia08: { prefix: 'asesmen' },
  ia09: { prefix: 'asesmen' },
  ak02: { prefix: 'asesmen' },
  ak03: { prefix: 'asesmen' },
}

export default function PreviewDetailPage() {
  const { idJabatan, docType } = useParams<{ idJabatan: string; docType: string }>()
  const navigate = useNavigate()

  const isAdminLsp = window.location.pathname.startsWith('/admin-lsp')
  const basePath = isAdminLsp ? '/admin-lsp' : '/superadmin'
  const currentStep = PREVIEW_STEPS.findIndex(s => s.type === docType)

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jabatanName, setJabatanName] = useState('')

  const fetchData = useCallback(async () => {
    if (!idJabatan || !docType) return
    setLoading(true)
    setError(null)

    const apiConfig = DOC_API[docType]
    if (!apiConfig) {
      setError(`Tipe dokumen tidak dikenal: ${docType}`)
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem("access_token")
      const url = `${API_BASE_URL}/${apiConfig.prefix}/by-jabatan/${idJabatan}/${docType}`
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        setError(res.status === 404 ? "Data tidak ditemukan untuk jabatan ini" : `Gagal memuat data (${res.status})`)
        setLoading(false)
        return
      }

      const json = await res.json()
      if (json.message === "Success" && json.data) {
        setData(json.data)
        const name = json.data?.data_sertifikasi?.nama_jabatan
          || json.data?.nama_jabatan_kerja
          || json.data?.jabatan_kerja
          || ''
        if (name) setJabatanName(name)
      } else {
        setError(json.message || "Gagal memuat data")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat data")
    } finally {
      setLoading(false)
    }
  }, [idJabatan, docType])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handlePrev = () => {
    if (currentStep > 0) {
      navigate(`${basePath}/preview/${idJabatan}/${PREVIEW_STEPS[currentStep - 1].type}`)
    }
  }

  const handleNext = () => {
    if (currentStep < PREVIEW_STEPS.length - 1) {
      navigate(`${basePath}/preview/${idJabatan}/${PREVIEW_STEPS[currentStep + 1].type}`)
    }
  }

  const handleBackToIndex = () => {
    navigate(`${basePath}/preview`)
  }

  const renderContent = () => {
    if (loading) return <FullPageLoader text="Memuat data..." />
    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '16px', color: '#666' }}>{error}</p>
        </div>
      )
    }
    if (!data) return null

    switch (docType) {
      case 'apl01': return <Apl01Preview data={data} />
      case 'apl02': return <Apl02Preview data={data} />
      case 'mapa01': return <Mapa01Preview data={data} />
      case 'mapa02': return <Mapa02Preview data={data} />
      case 'ia01':
      case 'ia03': return <Ia01Preview data={data} docType={docType} />
      case 'ia02': return <Ia02Preview data={data} />
      case 'ia04a': return <Ia04aPreview data={data} />
      case 'ia04b': return <Ia04bPreview data={data} />
      case 'ia05': return <Ia05Preview data={data} />
      case 'ia08':
      case 'ia09': return <Ia08Preview data={data} docType={docType} />
      case 'ak02': return <Ak02Preview data={data} />
      case 'ak03': return <Ak03Preview data={data} />
      default:
        return <p>Tipe dokumen tidak dikenal: {docType}</p>
    }
  }

  if (currentStep === -1) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif', padding: '40px' }}>
        <button onClick={handleBackToIndex} style={{ background: 'none', border: '1px solid #999', padding: '6px 16px', fontSize: '13px', cursor: 'pointer', marginBottom: '20px' }}>
          &larr; Kembali
        </button>
        <p>Tipe dokumen tidak dikenal: {docType}</p>
      </div>
    )
  }

  return (
    <PreviewFlowLayout
      currentStep={currentStep}
      totalSteps={PREVIEW_STEPS.length}
      currentDocType={docType || ''}
      jabatanKerja={jabatanName}
      onPrev={currentStep > 0 ? handlePrev : null}
      onNext={currentStep < PREVIEW_STEPS.length - 1 ? handleNext : null}
      onBackToIndex={handleBackToIndex}
    >
      {renderContent()}
    </PreviewFlowLayout>
  )
}
