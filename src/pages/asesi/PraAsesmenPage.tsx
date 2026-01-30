import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, XCircle, FileText, User, Calendar, MapPin, Phone, Mail, GraduationCap, AlertCircle, Shield, FileCheck, ExternalLink, X, Download, Clock, ZoomIn, ZoomOut, Info } from "lucide-react"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/components/ui/toast"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import DashboardNavbar from "@/components/DashboardNavbar"
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

export default function PraAsesmenPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState<PersonalData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const { kegiatan } = useKegiatanAsesi()
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; label: string; type: string } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

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
    setIsConfirming(true)
  }

  const openDocument = (url: string, label: string) => {
    const ext = url.split('.').pop()?.toLowerCase()
    const type = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '') ? 'image' : 'pdf'
    setSelectedDoc({ url, label, type })
  }

  const closeDocPreview = () => {
    setSelectedDoc(null)
    setZoom(1)
    setIsFullscreen(false)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <SimpleSpinner size="lg" className="text-indigo-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Memuat data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border border-slate-200 dark:border-slate-800">
          <CardContent className="p-8 text-center">
            <XCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Data Tidak Ditemukan</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Silakan coba kembali atau hubungi admin</p>
            <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initial = data.nama.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="px-4 py-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span className="hover:underline cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => navigate("/asesi/dashboard")}>Dashboard</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-700 dark:text-slate-300">Pra-Asesmen</span>
            <span className="text-slate-400">/</span>
            <span className="text-indigo-700 dark:text-indigo-300 font-medium">Konfirmasi</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Title Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Konfirmasi Data Diri</h2>
          <p className="text-slate-600 dark:text-slate-400">Mohon periksa kembali data Anda sebelum memulai pra-asesmen</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-indigo-100 dark:border-indigo-900">
                <span className="text-xl font-semibold text-indigo-700 dark:text-indigo-300">{initial}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">{data.nama}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{data.nik}</p>
                {kegiatan && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 rounded-full text-sm text-indigo-700 dark:text-indigo-300">
                    <span>{kegiatan.skema.nama}</span>
                    <span className="text-indigo-400">•</span>
                    <span>{kegiatan.tuk.nama}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info Section */}
        <Card className="mb-6 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/20">
            <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Informasi Pribadi</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow icon={Calendar} label="Tempat, Tanggal Lahir" value={`${data.tempat_lahir}, ${new Date(data.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`} />
              <InfoRow icon={Shield} label="Jenis Kelamin" value={data.jenis_kelamin} />
              <InfoRow icon={GraduationCap} label="Pendidikan" value={data.pendidikan} />
              <InfoRow icon={Phone} label="Telepon" value={data.telepon} />
              <InfoRow icon={Mail} label="Email" value={data.email} />
              <div className="md:col-span-2">
                <InfoRow icon={MapPin} label="Alamat" value={data.alamat} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Section */}
        <Card className="mb-6 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/20">
            <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Dokumen Pendukung</h3>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentConfig.map((doc) => {
                const docUrl = data[doc.key]
                return (
                  <div key={doc.key} className="group">
                    <div
                      onClick={() => openDocument(docUrl, doc.label)}
                      className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{doc.label}</span>
                        </div>
                        <Download className="w-4 h-4 text-indigo-400" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-1">Instruksi Pemeriksaan Dokumen</p>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300">
                    Anda dapat menekan tombol dokumen di atas untuk melihat dan memeriksa kelengkapan serta keabsahan dokumen. Setelah Anda yakin bahwa seluruh data yang tersaji telah sesuai dan benar, silakan lanjutkan dengan menekan tombol konfirmasi di bawah.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Info (if available) */}
        {kegiatan && (
          <Card className="mb-6 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/20">
              <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Jadwal Pra-Asesmen</h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow icon={FileText} label="Skema Sertifikasi" value={kegiatan.skema.nama} />
                <InfoRow icon={MapPin} label="Tempat Uji Kompetensi" value={kegiatan.tuk.nama} />
                <InfoRow icon={Calendar} label="Tanggal" value={new Date(kegiatan.tanggal_uji).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
                <InfoRow icon={Clock} label="Waktu" value={new Date(kegiatan.tanggal_uji).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notice */}
        <Card className="mb-6 border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-900">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  Penting: Data yang Anda masukkan bersifat resmi dan dapat dipertanggungjawabkan secara hukum.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-950"
          >
            {isConfirming ? (
              <>
                <SimpleSpinner size="sm" className="text-white mr-2" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Data Sudah Benar, Lanjut
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in ${isFullscreen ? 'p-0' : ''}`}
          onClick={closeDocPreview}
        >
          <div
            className={`bg-white dark:bg-slate-900 ${isFullscreen ? 'w-full h-full rounded-none' : 'rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh]'} flex flex-col animate-scale-in`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{selectedDoc.label}</h3>
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                {selectedDoc.type === "pdf" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleZoomOut}
                      disabled={zoom <= 0.5}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[3rem] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleZoomIn}
                      disabled={zoom >= 3}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(selectedDoc.url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={closeDocPreview}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950">
              {selectedDoc.type === "image" ? (
                <div className="flex items-center justify-center min-h-full p-4">
                  <img
                    src={selectedDoc.url}
                    alt={selectedDoc.label}
                    className="max-w-full object-contain"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center min-h-full p-4">
                  <iframe
                    src={`${selectedDoc.url}#view=fitH`}
                    title={selectedDoc.label}
                    className="border-0 shadow-lg"
                    style={{
                      width: '100%',
                      height: isFullscreen ? '100%' : '80vh',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top center'
                    }}
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

function InfoRow({
  icon: Icon,
  label,
  value
}: {
  icon: any
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm text-slate-900 dark:text-slate-200">{value}</p>
      </div>
    </div>
  )
}
