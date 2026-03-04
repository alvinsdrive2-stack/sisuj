import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { createPortal } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Calendar, Clock, MapPin, FileText, AlertCircle } from "lucide-react"
import { useListAsesi } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { kegiatanService, KegiatanAsesor } from "@/lib/kegiatan-service"
import { useToast } from "@/contexts/ToastContext"
import { useDokumenModal } from "@/contexts/DokumenModalContext"
import { DokumenViewerModal } from "@/components/direktur"

interface DokumenDirekturResponse {
  message: string
  data: {
    sk_pelaksanaan_uji: string | null
    spt_asesor: string | null
    spt_komtek: string | null
    sk_komtek: string | null
    ba_komtek: string | null
  }
}

interface DokumenDirekturItem {
  key: string
  label: string
  url: string | null
}

const DOKUMEN_DIREKTUR_CONFIG: Array<{ key: keyof DokumenDirekturResponse['data']; label: string }> = [
  { key: 'sk_pelaksanaan_uji', label: 'SK Pelaksanaan Uji' },
  { key: 'spt_asesor', label: 'SPT Asesor' },
  { key: 'spt_komtek', label: 'SPT Komtek' },
  { key: 'sk_komtek', label: 'SK Komtek' },
  { key: 'ba_komtek', label: 'BA Komtek' },
]

export default function DetailDokumenDirekturPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showError } = useToast()
  const { asesiList, isLoading: asesiLoading, error } = useListAsesi(id || "")
  const [kegiatan, setKegiatan] = useState<KegiatanAsesor | null>(null)
  const [dokumenDirektur, setDokumenDirektur] = useState<DokumenDirekturResponse['data'] | null>(null)
  const [selectedDokumen, setSelectedDokumen] = useState<{ url: string; title: string } | null>(null)
  const [showTtdConfirmation, setShowTtdConfirmation] = useState(false)

  // Modal context
  const { openModal: openDokumenModal } = useDokumenModal()

  // Fetch kegiatan detail
  useEffect(() => {
    const fetchKegiatan = async () => {
      if (!id) return

      try {
        const responseFalse = await kegiatanService.getKegiatanDirektur(false)
        let found = responseFalse.data.data.find((k: KegiatanAsesor) => k.jadwal_id === id)

        if (!found) {
          const responseTrue = await kegiatanService.getKegiatanDirektur(true)
          found = responseTrue.data.data.find((k: KegiatanAsesor) => k.jadwal_id === id)
        }

        if (found) {
          setKegiatan(found)
        }
      } catch (err) {
        console.error('Error fetching kegiatan:', err)
      }
    }
    fetchKegiatan()
  }, [id])

  // Fetch dokumen direktur
  useEffect(() => {
    const fetchDokumenDirektur = async () => {
      if (!id) return

      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/direktur/files/${id}`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result: DokumenDirekturResponse = await response.json()
          setDokumenDirektur(result.data)
        } else {
          showError('Gagal memuat dokumen direktur')
        }
      } catch (error) {
        console.error("Error fetching dokumen direktur:", error)
        showError('Terjadi kesalahan saat memuat dokumen')
      }
    }

    fetchDokumenDirektur()
  }, [id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const handleOpenDokumenModal = (asesi: { id_izin: string; nama: string }) => {
    openDokumenModal(asesi.id_izin, asesi.nama, true)
  }

  const direkturDocuments: DokumenDirekturItem[] = DOKUMEN_DIREKTUR_CONFIG.map(config => ({
    key: config.key,
    label: config.label,
    url: dokumenDirektur?.[config.key] || null
  }))

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/direktur/tandatangan")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Daftar Asesi</h2>
            <p className="text-slate-600 dark:text-slate-400">Pilih asesi untuk melihat dokumen</p>
          </div>
        </div>

        {/* Kegiatan Detail */}
        {kegiatan && (
          <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
            <div className="flex gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{kegiatan.skema.nama}</h3>
                  {kegiatan.is_started === "0" && (
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300">
                      Belum Mulai
                    </Badge>
                  )}
                  {kegiatan.is_started === "1" && (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">
                      Sedang Berjalan
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  {kegiatan.tuk.nama.toUpperCase()}
                </p> 
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Asesor | {kegiatan.asesor.nama.toUpperCase()}{kegiatan.asesor2 ? ` & ${kegiatan.asesor2.nama.toUpperCase()}` : ''}</p>

                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    {formatDate(kegiatan.tanggal_uji)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    {formatTime(kegiatan.tanggal_uji)}
                  </div>
                  <br />
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {kegiatan.tuk.alamat}
                  </div>
                </div>
              </div>

              <div className="w-[18%] flex flex-col items-center justify-center gap-4">
                <div className="p-20 py-2 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/10 shadow-lg shadow-primary/5">
                  <div className="text-center">
                    <Users className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-black text-primary">
                      {asesiList.length}
                    </div>
                    <div className="text-xs font-medium text-primary/70 uppercase tracking-wider">
                      Asesi
                    </div>
                  </div>
                </div>

                {/* Tanda Tangan Button - Single button for all direktur docs */}
                <button
                  onClick={() => setShowTtdConfirmation(true)}
                  className="w-full px-4 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>TANDA TANGAN</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Side by Side: Daftar Asesi (70%) + Dokumen Direktur (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left: Daftar Asesi - 70% */}
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Daftar Asesi
                {asesiLoading && <SimpleSpinner size="sm" className="ml-2 text-primary" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="text-center py-8 text-red-500">
                  Gagal memuat daftar asesi: {error}
                </div>
              )}

              {!asesiLoading && !error && asesiList.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  Tidak ada asesi untuk jadwal ini
                </div>
              )}

              <div className="space-y-3">
                {asesiList.map((asesi, index) => (
                  <div
                    key={asesi.id_izin}
                    onClick={() => handleOpenDokumenModal({ id_izin: asesi.id_izin, nama: asesi.nama })}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer bg-white dark:bg-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-100">{asesi.nama}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">ID: {asesi.id_izin}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Kompeten Badge */}
                        <Badge variant="outline" className="border-slate-300 dark:border-slate-600">
                          {asesi.kompeten}
                        </Badge>

                        {/* Status Indicator */}
                        {asesi.is_started && (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium">Aktif</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right: Dokumen Direktur - 30% */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Dokumen Direktur
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {direkturDocuments.map((doc) => {
                  const hasDocument = !!doc.url
                  return (
                    <div
                      key={doc.key}
                      className={`p-3 border rounded-lg transition-all ${
                        hasDocument
                          ? 'border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-md bg-white dark:bg-slate-800 cursor-pointer'
                          : 'border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
                      }`}
                      onClick={() => {
                        if (hasDocument && doc.url) {
                          setSelectedDokumen({ url: doc.url, title: doc.label })
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          hasDocument ? 'bg-primary/10' : 'bg-slate-200 dark:bg-slate-700'
                        }`}>
                          <FileText className={`w-5 h-5 ${hasDocument ? 'text-primary' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{doc.label}</h4>
                          {!hasDocument ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada</p>
                          ) : (
                            <span className="text-xs text-primary">Lihat</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dokumen Viewer Modal */}
      <DokumenViewerModal
        isOpen={selectedDokumen !== null}
        onClose={() => setSelectedDokumen(null)}
        url={selectedDokumen?.url || null}
        title={selectedDokumen?.title || ''}
      />

      {/* TTD Confirmation Modal - Portal */}
      {showTtdConfirmation && createPortal(
        <div
          onClick={() => setShowTtdConfirmation(false)}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4"
          style={{
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            style={{
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(20px) scale(0.95);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}</style>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Konfirmasi Tanda Tangan</h3>
                <p className="text-sm text-slate-600">Pastikan Anda telah membaca semua dokumen</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-700 mb-3">Dengan menandatangani, Anda menyatakan bahwa:</p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Semua dokumen telah dibaca dan dipahami</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Data yang tertera sudah benar dan lengkap</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5">•</span>
                  <span>Bertanggung jawab atas keputusan yang dibuat</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTtdConfirmation(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowTtdConfirmation(false)
                  // Open the first available direktur document for signing
                  const firstAvailableDoc = direkturDocuments.find(doc => doc.url !== null)
                  if (firstAvailableDoc) {
                    setSelectedDokumen({ url: firstAvailableDoc.url!, title: firstAvailableDoc.label })
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-900 transition-colors font-medium"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
