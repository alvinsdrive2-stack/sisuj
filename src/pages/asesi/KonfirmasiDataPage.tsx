import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import { API_BASE_URL } from "@/config/api"
import UuidStepIndicator from "@/components/UuidStepIndicator"

const authHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token")
  const h: Record<string, string> = { "Accept": "application/json" }
  if (token) h["Authorization"] = `Bearer ${token}`
  return h
}

interface PersonalData {
  nama: string
  nik: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: string
  alamat: string
  telepon: string
  email: string
  pendidikan: string
  npwp: string
  ktp: string
  pas_foto: string
  referensi_kerja: string
  ijazah: string
}

export default function KonfirmasiDataPage() {
  const { idIzin } = useParams<{ idIzin: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<PersonalData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!idIzin) { setError("ID tidak valid"); setIsLoading(false); return }
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/praasesmen/${idIzin}/kebenaran-data`, { headers: authHeaders() })
        if (!res.ok) throw new Error("Gagal memuat data")
        const json = await res.json()
        if (json.success && json.data) {
          setData(json.data)
        } else {
          throw new Error("Data tidak ditemukan")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [idIzin])

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      const res = await fetch(`${API_BASE_URL}/praasesmen/${idIzin}/konfirmasi`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true }),
      })
      if (!res.ok) throw new Error("Gagal konfirmasi")
      navigate(`/praasesmen/${idIzin}/apl01`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal konfirmasi data")
      setIsConfirming(false)
    }
  }

  if (isLoading) return <FullPageLoader text="Memuat data..." />

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span>Pra-Asesmen</span>
            <span>/</span>
            <span style={{ fontWeight: 'normal' }}>Konfirmasi Data Diri</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <UuidStepIndicator currentStep={1} />

        {error && (
          <div style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '40px', textAlign: 'center', marginTop: '20px' }}>
            <h2 style={{ fontSize: '16px', color: '#c00', marginBottom: '12px' }}>Gagal Memuat Data</h2>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '8px 24px', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {data && (
          <>
            <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e0e0e0', padding: '16px', marginBottom: '16px', marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d2137" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '16px' }}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Panduan Pra-Asesmen</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#f0f4f8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span style={{ fontWeight: '500', color: '#333' }}>Periksa data diri</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#f0f4f8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </div>
                  <span style={{ fontWeight: '500', color: '#333' }}>Cek dokumen pendukung</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', background: '#f0f4f8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </div>
                  <span style={{ fontWeight: '500', color: '#333' }}>Lanjut ke APL 01</span>
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>Konfirmasi Data Diri</h2>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>Mohon periksa kembali data Anda sebelum memulai pra-asesmen</p>

            <table style={{ width: '100%', background: '#fff', border: '1px solid #999', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
              <tbody>
                <tr><td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Nama</td>
                    <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                    <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle' }} colSpan={8}>{data.nama}</td></tr>
                <tr><td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>No. NIK</td>
                    <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                    <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle' }} colSpan={8}>{data.nik}</td></tr>
                <tr><td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Tempat, Tgl Lahir</td>
                    <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                    <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle' }} colSpan={8}>{data.tempat_lahir}, {data.tanggal_lahir}</td></tr>
                <tr><td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Jenis Kelamin</td>
                    <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                    <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle' }} colSpan={8}>{data.jenis_kelamin}</td></tr>
                <tr><td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Alamat</td>
                    <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                    <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle' }} colSpan={8}>{data.alamat}</td></tr>
                <tr><td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Telepon</td>
                    <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                    <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle' }} colSpan={8}>{data.telepon}</td></tr>
                <tr><td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Email</td>
                    <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                    <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle' }} colSpan={8}>{data.email}</td></tr>
                <tr><td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Pendidikan</td>
                    <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                    <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle' }} colSpan={8}>{data.pendidikan}</td></tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '40px' }}>
              <button
                onClick={handleConfirm}
                disabled={isConfirming}
                style={{
                  padding: '10px 32px', background: isConfirming ? '#99badd' : '#0066cc', color: '#fff',
                  border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600',
                  cursor: isConfirming ? 'not-allowed' : 'pointer',
                }}
              >
                {isConfirming ? 'Memproses...' : 'Konfirmasi & Lanjutkan'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
