import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { API_BASE_URL } from "@/config/api"

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token")
  const h: Record<string, string> = { "Accept": "application/json" }
  if (token) h["Authorization"] = `Bearer ${token}`
  return h
}

export default function PraAsesmenByUuidPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!uuid) { setError("UUID tidak valid"); return }
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/persiapan-asesmen/${uuid}`, { headers: authHeaders() })
        if (!res.ok) throw new Error("Gagal memuat data")
        const result = await res.json()
        if (!result.success || !result.data?.id_izin) throw new Error("Data tidak ditemukan")
        const { id_izin, jadwal_id, access_token } = result.data
        if (access_token) localStorage.setItem("access_token", access_token)
        sessionStorage.setItem("praasesmen_uuid_data", JSON.stringify({ id_izin, jadwal_id }))
        sessionStorage.setItem("isUuidFlow", "true")
        navigate(`/praasesmen/${id_izin}/konfirmasi`, { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      }
    })()
  }, [uuid, navigate])

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ background: '#fff', border: '1px solid #999', borderRadius: '8px', padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '16px', color: '#c00', marginBottom: '12px' }}>Gagal Memuat Data</h2>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>{error}</p>
        </div>
      </div>
    )
  }

  return <FullPageLoader text="Mengarahkan ke formulir..." />
}
