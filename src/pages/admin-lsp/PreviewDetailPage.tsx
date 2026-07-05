import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "@/config/api"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import {
  Apl01Preview, Apl02Preview,
  Mapa01Preview, Mapa02Preview,
  Ia01Preview, Ia02Preview, Ia04aPreview, Ia04bPreview, Ia05Preview, Ia08Preview,
  Ak02Preview, Ak03Preview,
} from "@/components/preview/PreviewRenderer"

// Map docType → API path prefix + suffix
const DOC_API: Record<string, { prefix: string }> = {
  // PraAsesmen
  apl01: { prefix: 'praasesmen' },
  apl02: { prefix: 'praasesmen' },
  mapa01: { prefix: 'praasesmen' },
  mapa02: { prefix: 'praasesmen' },
  // Asesmen
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
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAdminLsp = window.location.pathname.startsWith('/admin-lsp')
  const basePath = isAdminLsp ? '/admin-lsp' : '/superadmin'

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
        if (res.status === 404) {
          setError("Data tidak ditemukan untuk jabatan ini")
        } else {
          setError(`Gagal memuat data (${res.status})`)
        }
        setLoading(false)
        return
      }

      const json = await res.json()
      if (json.message === "Success" && json.data) {
        setData(json.data)
      } else {
        setError(json.message || "Gagal memuat data")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memuat data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [idJabatan, docType])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleBack = () => {
    navigate(`${basePath}/preview`)
  }

  if (loading) return <FullPageLoader text="Memuat data..." />

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif', padding: '40px' }}>
        <button
          onClick={handleBack}
          style={{ background: 'none', border: '1px solid #999', padding: '6px 16px', fontSize: '13px', cursor: 'pointer', marginBottom: '20px' }}
        >
          &larr; Kembali
        </button>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '16px', color: '#666' }}>{error}</p>
        </div>
      </div>
    )
  }

  // Route to correct renderer based on docType
  switch (docType) {
    case 'apl01':
      return <Apl01Preview data={data} onBack={handleBack} />
    case 'apl02':
      return <Apl02Preview data={data} onBack={handleBack} />
    case 'mapa01':
      return <Mapa01Preview data={data} onBack={handleBack} />
    case 'mapa02':
      return <Mapa02Preview data={data} onBack={handleBack} />
    case 'ia01':
    case 'ia03':
      return <Ia01Preview data={data} onBack={handleBack} docType={docType} />
    case 'ia02':
      return <Ia02Preview data={data} onBack={handleBack} />
    case 'ia04a':
      return <Ia04aPreview data={data} onBack={handleBack} />
    case 'ia04b':
      return <Ia04bPreview data={data} onBack={handleBack} />
    case 'ia05':
      return <Ia05Preview data={data} onBack={handleBack} />
    case 'ia08':
    case 'ia09':
      return <Ia08Preview data={data} onBack={handleBack} docType={docType} />
    case 'ak02':
      return <Ak02Preview data={data} onBack={handleBack} />
    case 'ak03':
      return <Ak03Preview data={data} onBack={handleBack} />
    default:
      return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
          <button onClick={handleBack} style={{ background: 'none', border: '1px solid #999', padding: '6px 16px', fontSize: '13px', cursor: 'pointer', marginBottom: '20px' }}>
            &larr; Kembali
          </button>
          <p>Tipe dokumen tidak dikenal: {docType}</p>
        </div>
      )
  }
}
