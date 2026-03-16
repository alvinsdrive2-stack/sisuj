import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { createPortal } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Calendar, Clock, MapPin, FileText, AlertCircle, ExternalLink, Check } from "lucide-react"
import { useListAsesi } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { kegiatanService, KegiatanAsesor } from "@/lib/kegiatan-service"
import { useToast } from "@/contexts/ToastContext"
import { useDokumenModal } from "@/contexts/DokumenModalContext"
import { DokumenViewerModal } from "@/components/direktur"

interface DokumenDirekturResponse {
  message: string
  data: {
    sk_pelaksanaan_uji: {
      link: string
      is_approved: boolean
    } | null
    spt_asesor: string | null
    spt_komtek: string | null
    sk_komtek: string | null
    ba_komtek: string | null
    is_approved: boolean
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
  const { showError, showSuccess } = useToast()
  const { asesiList, isLoading: asesiLoading, error } = useListAsesi(id || "")
  const [kegiatan, setKegiatan] = useState<KegiatanAsesor | null>(null)
  const [dokumenDirektur, setDokumenDirektur] = useState<DokumenDirekturResponse['data'] | null>(null)
  const [selectedDokumen, setSelectedDokumen] = useState<{ url: string; title: string } | null>(null)
  const [showTtdConfirmation, setShowTtdConfirmation] = useState(false)
  const [isGeneratingSk, setIsGeneratingSk] = useState(false)
  const [isApproved, setIsApproved] = useState<boolean | null>(null)

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
          setIsApproved(result.data.is_approved ?? null)
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

  const direkturDocuments: DokumenDirekturItem[] = DOKUMEN_DIREKTUR_CONFIG.map(config => {
    // Special handling for sk_pelaksanaan_uji which is now an object
    if (config.key === 'sk_pelaksanaan_uji') {
      const obj = dokumenDirektur?.[config.key] as { link?: string; is_approved?: boolean } | null
      return {
        key: config.key,
        label: config.label,
        url: obj?.link || null
      }
    }
    return {
      key: config.key,
      label: config.label,
      url: dokumenDirektur?.[config.key] as string | null || null
    }
  })

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
                {isApproved !== true && (
                  <button
                    onClick={() => setShowTtdConfirmation(true)}
                    className="w-full px-4 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>TANDA TANGAN</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info Card - Panduan Direktur */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-slate-700">Panduan Direktur</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Users className="w-3 h-3 text-primary" />
              </div>
              <div>
                <span className="font-medium text-slate-700">Klik baris asesi</span>
                <p className="text-slate-500">Untuk melihat detail dokumen asesi</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-emerald-500" />
              </div>
              <div>
                <span className="font-medium text-slate-700">Badge Kompeten</span>
                <p className="text-slate-500">Status kelulusan asesi</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-3 h-3 text-blue-500" />
              </div>
              <div>
                <span className="font-medium text-slate-700">Dokumen Direktur</span>
                <p className="text-slate-500">Klik untuk melihat dokumen</p>
              </div>
            </div>
          </div>
        </div>

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
            <CardContent className="space-y-3">
              {direkturDocuments.map((doc) => {
                const hasDocument = !!doc.url
                return (
                  <Button
                    key={doc.key}
                    variant="outline"
                    className="w-full h-16 border-primary/20 hover:bg-primary/5 hover:border-primary flex items-center justify-between px-4"
                    disabled={!hasDocument}
                    onClick={() => hasDocument && setSelectedDokumen({ url: doc.url!, title: doc.label })}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={`w-5 h-5 ${hasDocument ? 'text-primary' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <span className="text-sm font-semibold block">{doc.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {hasDocument ? 'Klik untuk buka' : 'Belum tersedia'}
                        </span>
                      </div>
                    </div>
                    {hasDocument && <ExternalLink className="w-5 h-5 text-primary" />}
                  </Button>
                )
              })}
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
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-blue-900" />
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
                onClick={async () => {
                  if (!id) return

                  setIsGeneratingSk(true)
                  try {
                    const token = localStorage.getItem("access_token")
                    const response = await fetch(`https://backend.devgatensi.site/api/dokumen/sk/${id}`, {
                      method: 'POST',
                      headers: {
                        "Accept": "application/json",
                        "Authorization": `Bearer ${token}`,
                      },
                    })

                    if (response.ok) {
                      const result = await response.json()
                      // Update dokumenDirektur with new URLs from response
                      if (result.data) {
                        setDokumenDirektur(prev => ({
                          sk_pelaksanaan_uji: result.data.sk_pelaksanaan_uji ? {
                            link: result.data.sk_pelaksanaan_uji.url,
                            is_approved: true
                          } : (prev?.sk_pelaksanaan_uji ?? null),
                          spt_asesor: prev?.spt_asesor ?? null,
                          spt_komtek: prev?.spt_komtek ?? null,
                          sk_komtek: result.data.sk_komtek?.url ?? prev?.sk_komtek ?? null,
                          ba_komtek: prev?.ba_komtek ?? null,
                          is_approved: true,
                        }))
                        setIsApproved(true)
                      }
                      setShowTtdConfirmation(false)
                      showSuccess('SK dokumen berhasil dibuat!')

                      // Open the first available direktur document for signing
                      const firstAvailableDoc = direkturDocuments.find(doc => doc.url !== null)
                      if (firstAvailableDoc) {
                        setSelectedDokumen({ url: firstAvailableDoc.url!, title: firstAvailableDoc.label })
                      }
                    } else {
                      showError('Gagal membuat SK dokumen')
                    }
                  } catch (error) {
                    console.error('Error generating SK:', error)
                    showError('Terjadi kesalahan saat membuat SK')
                  } finally {
                    setIsGeneratingSk(false)
                  }
                }}
                disabled={isGeneratingSk}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGeneratingSk ? (
                  <>
                    <SimpleSpinner size="sm" />
                    Memproses...
                  </>
                ) : (
                  'Ya, Lanjutkan'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
