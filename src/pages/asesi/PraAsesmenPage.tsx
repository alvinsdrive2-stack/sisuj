import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { XCircle, X, ZoomIn, ZoomOut, ExternalLink } from "lucide-react"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/components/ui/toast"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"

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
  data: PersonalData
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
  const [isLoading, setIsLoading] = useState(true)
  const { kegiatan } = useKegiatanAsesi()
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; label: string; type: string } | null>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch("https://backend.devgatensi.site/api/praasesmen/kebenaran-data", {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Gagal memuat data")
        }

        const result: ApiResponse = await response.json()
        if (result.success) {
          setData(result.data)
        } else {
          throw new Error("Data tidak ditemukan")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast(error instanceof Error ? error.message : "Gagal memuat data", "error")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleConfirm = async () => {
    if (!kegiatan) {
      toast("Tidak ada kegiatan aktif", "error")
      return
    }

    try {
      const token = localStorage.getItem("access_token")

      // Fetch id_izin dari list-asesi endpoint
      const listAsesiResponse = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (listAsesiResponse.ok) {
        const listResult = await listAsesiResponse.json()
        if (listResult.message === "Success" && listResult.list_asesi && listResult.list_asesi.length > 0) {
          // Ambil id_izin dari asesi pertama (seharusnya asesi yang sedang login)
          const fetchedIdIzin = listResult.list_asesi[0].id_izin
          navigate(`/asesi/praasesmen/${fetchedIdIzin}/apl01`)
          return
        }
      }

      // Fallback: jika tidak ada id_izin, gunakan jadwal_id
      navigate(`/asesi/praasesmen/${kegiatan.jadwal_id}/apl01`)
    } catch (error) {
      console.error("Error fetching id_izin:", error)
      toast("Gagal mengambil data kegiatan", "error")
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#f5f5f5' }}>
        <div className="text-center">
          <SimpleSpinner size="lg" className="mx-auto mb-4" style={{ color: '#666' }} />
          <p style={{ color: '#666' }}>Memuat data...</p>
        </div>
      </div>
    )
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
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate("/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Pra-Asesmen</span>
            <span>/</span>
            <span style={{ fontWeight: 'normal' }}>Konfirmasi</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={1}>
        {/* Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>Konfirmasi Data Diri</h2>
          <p style={{ fontSize: '13px', color: '#666' }}>Mohon periksa kembali data Anda sebelum memulai pra-asesmen</p>
        </div>

        {/* Data Diri Table - 100% mirip HTML contoh */}
        <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #999', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
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
            <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #999', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Skema Sertifikasi</td>
                  <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                  <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>{kegiatan.skema.nama}</td>
                </tr>
                <tr>
                  <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>Tempat Uji Kompetensi</td>
                  <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                  <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>{kegiatan.tuk.nama}</td>
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
                    {new Date(kegiatan.tanggal_uji).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Dokumen Pendukung */}
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '12px' }}>Dokumen Pendukung</h3>
        <table style={{ width: '100%', maxWidth: '900px', background: '#fff', border: '1px solid #999', borderCollapse: 'collapse', fontSize: '13px', color: '#000', marginBottom: '20px' }}>
          <tbody>
            {documentConfig.map((doc) => {
              const docUrl = data[doc.key]
              return (
                <tr key={doc.key}>
                  <td style={{ width: '180px', background: '#fff', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderRight: 'none' }}>{doc.label}</td>
                  <td style={{ width: '10px', textAlign: 'center', border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }}>:</td>
                  <td style={{ border: '1px solid #999', padding: '6px 8px', verticalAlign: 'middle', borderLeft: 'none' }} colSpan={8}>
                    <button
                      onClick={() => openDocument(docUrl, doc.label)}
                      style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: '13px' }}
                    >
                      Lihat Dokumen
                    </button>
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
          <button
            onClick={() => navigate(-1)}
            style={{ padding: '8px 16px', border: '1px solid #999', background: '#fff', color: '#000', fontSize: '13px', cursor: 'pointer' }}
          >
            Kembali
          </button>
          <button
            onClick={handleConfirm}
            style={{ padding: '8px 16px', background: '#0066cc', color: '#fff', fontSize: '13px', cursor: 'pointer', border: 'none' }}
          >
            Data Sudah Benar, Lanjut ke APL 01
          </button>
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
    </div>
  )
}
