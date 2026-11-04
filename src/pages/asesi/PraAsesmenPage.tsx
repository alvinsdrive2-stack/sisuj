import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AsesmenBreadcrumb from "@/components/AsesmenBreadcrumb"
import { XCircle, X, ZoomIn, ZoomOut, ExternalLink, AlertTriangle, CheckCircle2, FileText } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { extractErrorMessage, extractApiError } from "@/lib/error-utils"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { RoleId } from "@/lib/rbac-config"
import { ActionButton } from "@/components/ui/ActionButton"
import { useAbsenCheck } from "@/hooks/useAbsenCheck"
import { useRealtimeSync } from "@/hooks/useRealtimeSync"
import { WebcamModal } from "@/components/ui/WebcamModal"
import { API_BASE_URL } from "@/config/api"
import { matchAsesiIdIzin } from "@/lib/match-asesi"
import { formatTimeWIB } from "@/lib/date-utils"

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

interface ApiResponse {
  success: boolean
  message?: string
  data: PersonalData
}

// Status TTD Surat Perjanjian Bebas Konflik Kepentingan (backend: perjanjianAsesorStatus)
interface PerjanjianAsesorStatus {
  jumlah_asesor: number
  nama_asesor1: string
  nama_asesor2: string | null
  id_user_asesor1: number | null
  id_user_asesor2: number | null
  ttd_asesor1: boolean
  ttd_asesor2: boolean | null
  all_signed: boolean
  url_pdf: string
}

const documentConfig = [
  { key: "npwp" as const, label: "NPWP" },
  { key: "ktp" as const, label: "Kartu Tanda Penduduk" },
  { key: "pas_foto" as const, label: "Pas Foto 3x4" },
  { key: "referensi_kerja" as const, label: "Surat Referensi Kerja" },
  { key: "ijazah" as const, label: "Ijazah Terakhir" },
]

// Format tanggal: 21-Juli-2000
function formatDateIndo(dateString: string): string {
  const date = new Date(dateString)
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export default function PraAsesmenPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState<PersonalData | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const { kegiatan } = useKegiatanAsesi()
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; label: string; type: string } | null>(null)
  const [zoom, setZoom] = useState(1)
  const isAsesor = user?.role?.id === RoleId.ASESOR
  const [perjanjianAsesor, setPerjanjianAsesor] = useState<PerjanjianAsesorStatus | null>(null)
  const [showPerjanjianModal, setShowPerjanjianModal] = useState(false)
  const [isSigningPerjanjian, setIsSigningPerjanjian] = useState(false)

  // Get asesor data for absen check
  const { asesorList, tahap } = useDataDokumenPraAsesmen(idIzinFromUrl)

  // DEBUG: Log when PraAsesmenPage mounts
  console.log('[PraAsesmenPage] Component mounted', { userRole: user?.role?.name, idIzinFromUrl, isAsesor })

  // Absen check - auto-detect role (asesi/asesor1/asesor2)
  const { showAwalModal, submitAbsenAwal, handleAwalModalClose } = useAbsenCheck({
    phase: 'praasesmen',
    role: 'auto',
    checkOnMount: true, // Enable for both asesi and asesor
    idIzin: idIzinFromUrl,
    asesorList: asesorList
  })

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  const fetchPraAsesmenData = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("" + API_BASE_URL + "/praasesmen/kebenaran-data/" + idIzinFromUrl, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const apiMsg = await extractApiError(response, "Gagal memuat data")
        throw new Error(apiMsg)
      }

      const result: ApiResponse = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.message || "Data tidak ditemukan")
      }
    } catch (error) {
      toast(extractErrorMessage(error, "Gagal memuat data"), "error")
    }
  }, [])

  useEffect(() => { fetchPraAsesmenData() }, [fetchPraAsesmenData])

  // Status TTD Surat Perjanjian Bebas Konflik Kepentingan asesor.
  // Gagal fetch bukan alasan nge-block alur absen — diamkan aja.
  useEffect(() => {
    if (!idIzinFromUrl) return
    let cancelled = false
    const fetchPerjanjianAsesor = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const res = await fetch(`${API_BASE_URL}/praasesmen/${idIzinFromUrl}/perjanjian-asesor`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (!res.ok) return
        const result = await res.json()
        if (!cancelled && result?.data) {
          setPerjanjianAsesor(result.data)
          if (!result.data.all_signed) setShowPerjanjianModal(true)
        }
      } catch {
        // ignore — status opsional
      }
    }
    fetchPerjanjianAsesor()
    return () => { cancelled = true }
  }, [idIzinFromUrl])

  const { publishUpdate: _publishUpdate } = useRealtimeSync({
    channelName: `praasesmen.${idIzinFromUrl}`,
    onUpdate: fetchPraAsesmenData
  })

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      // If idIzin already in URL (from UUID redirect), use it directly
      if (idIzinFromUrl) {
        navigate(`/praasesmen/${idIzinFromUrl}/surat-perjanjian`)
        return
      }

      if (!kegiatan) {
        toast("Tidak ada kegiatan aktif", "error")
        return
      }

      const token = localStorage.getItem("access_token")

      // Fetch id_izin dari list-asesi endpoint
      const listAsesiResponse = await fetch(`${API_BASE_URL}/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (listAsesiResponse.ok) {
        const listResult = await listAsesiResponse.json()
        if (listResult.message === "Success" && listResult.list_asesi && listResult.list_asesi.length > 0) {
          const matchedIdIzin = matchAsesiIdIzin(listResult.list_asesi, user)
          if (matchedIdIzin) {
            navigate(`/praasesmen/${matchedIdIzin}/surat-perjanjian`)
            return
          }
        }
      }

      // Fallback: jika tidak ada id_izin, gunakan jadwal_id
      navigate(`/asesi/praasesmen/${kegiatan.jadwal_id}/apl01`)
    } catch (error) {
      toast(extractErrorMessage(error, "Gagal mengambil data kegiatan"), "error")
    } finally {
      setIsConfirming(false)
    }
  }

  const openDocument = (url: string, label: string) => {
    const ext = url.split('.').pop()?.toLowerCase()
    const type = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '') ? 'image' : 'pdf'
    setSelectedDoc({ url, label, type })
  }

  const closeDocPreview = () => {
    setSelectedDoc(null)
    setZoom(1)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  // Slot TTD viewer ini: 1/2 kalau dia asesor jadwal ini yang belum TTD, selain itu null.
  const myPerjanjianSlot = (() => {
    if (!perjanjianAsesor || user?.role?.id !== RoleId.ASESOR) return null
    if (perjanjianAsesor.id_user_asesor1 === user.id && !perjanjianAsesor.ttd_asesor1) return 1 as const
    if (perjanjianAsesor.id_user_asesor2 && perjanjianAsesor.id_user_asesor2 === user.id && !perjanjianAsesor.ttd_asesor2) return 2 as const
    return null
  })()

  const refreshPerjanjianAsesor = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE_URL}/praasesmen/${idIzinFromUrl}/perjanjian-asesor`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      if (!res.ok) return
      const result = await res.json()
      if (result?.data) {
        setPerjanjianAsesor(result.data)
        if (result.data.all_signed) setShowPerjanjianModal(false)
      }
    } catch {
      // ignore
    }
  }

  const handleTtdPerjanjian = async () => {
    if (!idIzinFromUrl) return
    setIsSigningPerjanjian(true)
    try {
      const token = localStorage.getItem("access_token")
      const res = await fetch(`${API_BASE_URL}/praasesmen/${idIzinFromUrl}/perjanjian-asesor/ttd`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const apiMsg = await extractApiError(res, "Gagal menandatangani surat")
        throw new Error(apiMsg)
      }
      toast("Surat perjanjian bebas konflik kepentingan berhasil ditandatangani", "success")
      await refreshPerjanjianAsesor()
    } catch (error) {
      toast(extractErrorMessage(error, "Gagal menandatangani surat"), "error")
    } finally {
      setIsSigningPerjanjian(false)
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f5f5f5' }}>
        <div className="p-8 text-center max-w-md w-full" style={{ background: '#fff', border: '1px solid #999' }}>
          <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#999' }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#000' }}>Data Tidak Ditemukan</h3>
          <p className="text-sm mb-6" style={{ color: '#666' }}>Silakan coba kembali atau hubungi admin</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full px-4 py-2 text-sm"
            style={{ border: '1px solid #999', background: '#fff', color: '#000' }}
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      
      <AsesmenBreadcrumb currentPage="Pra Asesmen" />

      

      {/* Step Indicator */}
      

      <AsesiLayout currentStep={1} idIzin={idIzinFromUrl} tahap={tahap} showVerifikasiTukAjj={false}>
{/* Info Card - Panduan Asesi */}
      <div style={{ width: '100%', margin: '0 auto', padding: '0 16px 16px' }}>
        <div className='shadow-md' style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d2137" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ minWidth: '16px' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Panduan {tahap === 1 ? 'Pra-Asesmen' : 'Persiapan Asesmen'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', background: '#f0f4f8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <span style={{ fontWeight: '500', color: '#333' }}>Periksa data diri</span>
                <p style={{ color: '#666', margin: '2px 0 0' }}>Pastikan semua data sudah benar</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', background: '#f0f4f8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <span style={{ fontWeight: '500', color: '#333' }}>Cek dokumen pendukung</span>
                <p style={{ color: '#666', margin: '2px 0 0' }}>Klik "Lihat Dokumen" untuk preview</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
              <div style={{ width: '20px', height: '20px', background: '#f0f4f8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
              <div>
                <span style={{ fontWeight: '500', color: '#333' }}>Lanjut ke dokumen berikutnya</span>
                <p style={{ color: '#666', margin: '2px 0 0' }}>Klik tombol biru untuk lanjut</p>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>Konfirmasi Data Diri</h2>
          <p style={{ fontSize: '13px', color: '#666' }}>Mohon periksa kembali data Anda sebelum memulai {tahap === 1 ? 'pra-asesmen' : 'persiapan asesmen'}</p>
        </div>

        {/* Data Diri Table - 100% mirip HTML contoh */}
        <table style={{ width: '100%', maxWidth: '100%', background: '#fff', border: '1px solid #999', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
          <tbody>
            <tr>
              <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Nama</td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
              <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>{data.nama}</td>
            </tr>
            <tr>
              <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>No. NIK</td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
              <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>{data.nik}</td>
            </tr>
            <tr>
              <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Tempat/tgl. Lahir</td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
              <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>
                {data.tempat_lahir.toUpperCase()}, {formatDateIndo(data.tanggal_lahir)}
              </td>
            </tr>
            <tr>
              <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Jenis kelamin</td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
              <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>{data.jenis_kelamin}</td>
            </tr>
            <tr>
              <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Alamat rumah</td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
              <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>{data.alamat}</td>
            </tr>
            <tr>
              <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>No. Telp/E-mail</td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
              <td style={{ width: '90px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Rumah</td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
              <td style={{ width: '180px', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>-</td>
              <td style={{ width: '90px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Kantor</td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
              <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>-</td>
            </tr>
            <tr>
              <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}></td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}></td>
              <td style={{ width: '90px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>HP</td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
              <td style={{ width: '180px', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>{data.telepon}</td>
              <td style={{ width: '90px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Email</td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
              <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>{data.email}</td>
            </tr>
            <tr>
              <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Kualifikasi/Pendidikan</td>
              <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
              <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>{data.pendidikan}</td>
            </tr>
          </tbody>
        </table>

        {/* Jadwal Pra-Asesmen */}
        {kegiatan && (
          <>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '12px' }}>Jadwal Pra-Asesmen</h3>
            <table style={{ width: '100%', maxWidth: '100%', background: '#fff', border: '1px solid #999', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Skema Sertifikasi</td>
                  <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                  <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>{kegiatan.skema?.nama || '-'}</td>
                </tr>
                <tr>
                  <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Tempat Uji Kompetensi</td>
                  <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                  <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>{kegiatan.tuk?.nama || '-'}</td>
                </tr>
                <tr>
                  <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Tanggal</td>
                  <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                  <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>{formatDateIndo(kegiatan.tanggal_uji)}</td>
                </tr>
                <tr>
                  <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Waktu</td>
                  <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                  <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>
                    {formatTimeWIB(kegiatan.tanggal_uji)}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Dokumen Pendukung */}
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '12px' }}>Dokumen Pendukung</h3>
        <table style={{ width: '100%', maxWidth: '100%', background: '#fff', border: '1px solid #999', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
          <tbody>
            {documentConfig.map((doc) => {
              const docUrl = data[doc.key]
              return (
                <tr key={doc.key}>
                  <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>{doc.label}</td>
                  <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                  <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>
                    {docUrl ? (
                      <button
                        onClick={() => openDocument(docUrl, doc.label)}
                        style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: '13px' }}
                      >
                        Lihat Dokumen
                      </button>
                    ) : (
                      <span style={{ color: '#999', fontSize: '13px' }}>Tidak ada</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Notice */}
        <div style={{ background: '#fff9e6', border: '1px solid #e6b800', marginBottom: '20px', padding: '12px' }}>
          <p style={{ fontSize: '13px', color: '#000', margin: 0 }}>
            <strong>Penting:</strong> Data yang Anda masukkan bersifat resmi dan dapat dipertanggungjawabkan secara hukum.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {isAsesor && (
            <ActionButton variant="secondary" onClick={() => navigate(-1)} disabled={isConfirming}>
              Kembali
            </ActionButton>
          )}
          <ActionButton variant="primary" onClick={handleConfirm} disabled={isConfirming}>
            {isConfirming ? 'Memproses...' : 'Data Sudah Benar, Lanjut ke APL 01'}
          </ActionButton>
        </div>
      </AsesiLayout>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.5)' }}
          onClick={closeDocPreview}
        >
          <div
            style={{ background: '#fff', borderRadius: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '900px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #999', background: '#f0f0f0' }}>
              <h3 style={{ fontWeight: 'bold', color: '#000', margin: 0 }}>{selectedDoc.label}</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedDoc.type === "pdf" && (
                  <>
                    <button
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                      style={{ padding: '4px', border: '1px solid #999', background: '#fff', cursor: zoom <= 0.5 ? 'not-allowed' : 'pointer', opacity: zoom <= 0.5 ? 0.5 : 1 }}
                    >
                      <ZoomOut style={{ width: '16px', height: '16px' }} />
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#000', minWidth: '48px', textAlign: 'center' }}>
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                      style={{ padding: '4px', border: '1px solid #999', background: '#fff', cursor: zoom >= 3 ? 'not-allowed' : 'pointer', opacity: zoom >= 3 ? 0.5 : 1 }}
                    >
                      <ZoomIn style={{ width: '16px', height: '16px' }} />
                    </button>
                  </>
                )}
                <button
                  onClick={() => window.open(selectedDoc.url, "_blank")}
                  style={{ padding: '4px', border: '1px solid #999', background: '#fff', cursor: 'pointer' }}
                >
                  <ExternalLink style={{ width: '16px', height: '16px' }} />
                </button>
                <button
                  onClick={closeDocPreview}
                  style={{ padding: '4px', border: '1px solid #999', background: '#fff', cursor: 'pointer' }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflow: 'auto', background: '#f5f5f5' }}>
              {selectedDoc.type === "image" ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '16px' }}>
                  <img
                    src={selectedDoc.url}
                    alt={selectedDoc.label}
                    style={{ maxWidth: '100%', objectFit: 'contain', transform: `scale(${zoom})`, transformOrigin: 'center' }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '16px' }}>
                  <iframe
                    src={`${selectedDoc.url}#view=fitH`}
                    title={selectedDoc.label}
                    style={{ border: 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', width: '100%', height: '80vh', transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Absen Awal Modal */}
      <WebcamModal
        isOpen={showAwalModal}
        onClose={handleAwalModalClose}
        onSubmit={submitAbsenAwal}
        title="Absen Masuk Pra-Asesmen"
        description="Silakan ambil foto wajah Anda untuk absen masuk"
        canClose={false}
      />

      {/* Floating Modal: Surat Perjanjian Bebas Konflik Kepentingan asesor.
          zIndex 10000 → DI ATAS modal foto absen masuk (WebcamModal zIndex 9999). */}
      {showPerjanjianModal && perjanjianAsesor && !perjanjianAsesor.all_signed && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.6)' }}
        >
          <div
            style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', maxWidth: '440px', width: '100%', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #e0e0e0', background: '#fffbeb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle style={{ width: '20px', height: '20px', color: '#d97706', flexShrink: 0 }} />
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', margin: 0 }}>Surat Perjanjian Bebas Konflik Kepentingan</h3>
              </div>
              <button
                onClick={() => setShowPerjanjianModal(false)}
                style={{ padding: '4px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', borderRadius: '4px' }}
                aria-label="Tutup"
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '13px', color: '#333', margin: '0 0 12px' }}>
                Asesor belum menandatangani Surat Perjanjian Bebas Konflik Kepentingan asesmen Anda:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#000' }}>{perjanjianAsesor.nama_asesor1} <span style={{ color: '#666' }}>(Asesor 1)</span></span>
                  {perjanjianAsesor.ttd_asesor1 ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#059669', fontWeight: 600 }}><CheckCircle2 style={{ width: '14px', height: '14px' }} /> TTD</span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#d97706', fontWeight: 600 }}><AlertTriangle style={{ width: '14px', height: '14px' }} /> Belum TTD</span>
                  )}
                </div>
                {perjanjianAsesor.nama_asesor2 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#000' }}>{perjanjianAsesor.nama_asesor2} <span style={{ color: '#666' }}>(Asesor 2)</span></span>
                    {perjanjianAsesor.ttd_asesor2 ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#059669', fontWeight: 600 }}><CheckCircle2 style={{ width: '14px', height: '14px' }} /> TTD</span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#d97706', fontWeight: 600 }}><AlertTriangle style={{ width: '14px', height: '14px' }} /> Belum TTD</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', padding: '12px 16px', borderTop: '1px solid #e0e0e0' }}>
              <button
                onClick={() => window.open(perjanjianAsesor.url_pdf, "_blank")}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px', border: '1px solid #999', background: '#fff', color: '#000', cursor: 'pointer', borderRadius: '4px' }}
              >
                <FileText style={{ width: '14px', height: '14px' }} /> Lihat Surat
              </button>
              {myPerjanjianSlot && (
                <button
                  onClick={handleTtdPerjanjian}
                  disabled={isSigningPerjanjian}
                  style={{ padding: '8px 14px', fontSize: '13px', border: 'none', background: isSigningPerjanjian ? '#93c5fd' : '#0066cc', color: '#fff', cursor: isSigningPerjanjian ? 'not-allowed' : 'pointer', borderRadius: '4px', fontWeight: 600 }}
                >
                  {isSigningPerjanjian ? 'Memproses...' : 'Tandatangani Sekarang'}
                </button>
              )}
              {!myPerjanjianSlot && (
                <button
                  onClick={() => setShowPerjanjianModal(false)}
                  style={{ padding: '8px 14px', fontSize: '13px', border: 'none', background: '#0066cc', color: '#fff', cursor: 'pointer', borderRadius: '4px', fontWeight: 600 }}
                >
                  Mengerti
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
