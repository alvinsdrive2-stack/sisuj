import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Calendar, Clock, MapPin, FileText, ExternalLink } from "lucide-react"
import { useListAsesi } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { kegiatanService, KegiatanAsesor } from "@/lib/kegiatan-service"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"

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
  const { user } = useAuth()
  const { showError } = useToast()
  const { asesiList, isLoading: asesiLoading, error } = useListAsesi(id || "")
  const [kegiatan, setKegiatan] = useState<KegiatanAsesor | null>(null)
  const [kegiatanLoading, setKegiatanLoading] = useState(true)
  const [dokumenDirektur, setDokumenDirektur] = useState<DokumenDirekturResponse['data'] | null>(null)
  const [selectedAsesi, setSelectedAsesi] = useState<typeof asesiList[0] | null>(null)

  // Fetch kegiatan detail
  useEffect(() => {
    const fetchKegiatan = async () => {
      if (!id) return

      try {
        // Fetch dari yang belum ditandatangani
        const responseFalse = await kegiatanService.getKegiatanDirektur(false)
        let found = responseFalse.data.data.find((k: KegiatanAsesor) => k.jadwal_id === id)

        // Kalau ga ketemu, cari dari yang sudah ditandatangani
        if (!found) {
          const responseTrue = await kegiatanService.getKegiatanDirektur(true)
          found = responseTrue.data.data.find((k: KegiatanAsesor) => k.jadwal_id === id)
        }

        if (found) {
          setKegiatan(found)
        }
      } catch (err) {
        console.error('Error fetching kegiatan:', err)
      } finally {
        setKegiatanLoading(false)
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
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dokumen Direktur</h2>
            <p className="text-slate-600 dark:text-slate-400">Pilih asesi untuk melihat dokumen direktur</p>
          </div>
        </div>

        {/* Kegiatan Detail */}
        {kegiatan && (
          <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
            <div className="flex gap-6">
              {/* Left: Kegiatan Info */}
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
                  {kegiatan.tuk.nama} • {kegiatan.asesor.nama}
                </p>

                <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    {formatDate(kegiatan.tanggal_uji)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    {formatTime(kegiatan.tanggal_uji)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    {kegiatan.tuk.alamat}
                  </div>
                </div>
              </div>

              {/* Right: Status indicator */}
              <div className="w-[18%] flex flex-col items-center justify-center">
                <div className="p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/10 shadow-lg shadow-primary/5">
                  <div className="text-center">
                    <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-black text-primary">
                      {asesiList.length}
                    </div>
                    <div className="text-xs font-medium text-primary/70 uppercase tracking-wider">
                      Asesi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Asesi List */}
          <Card className="lg:col-span-1">
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

              <div className="space-y-2">
                {asesiList.map((asesi, index) => (
                  <div
                    key={asesi.id_izin}
                    onClick={() => setSelectedAsesi(asesi)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedAsesi?.id_izin === asesi.id_izin
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-md bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{asesi.nama}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{asesi.kompeten}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right: Dokumen Direktur */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Dokumen Direktur
                {selectedAsesi && (
                  <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                    - {selectedAsesi.nama}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedAsesi ? (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Pilih asesi untuk melihat dokumen direktur</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {direkturDocuments.map((doc) => {
                    const hasDocument = !!doc.url
                    return (
                      <div
                        key={doc.key}
                        className={`p-4 border rounded-lg transition-all ${
                          hasDocument
                            ? 'border-slate-200 dark:border-slate-700 hover:border-primary hover:shadow-md bg-white dark:bg-slate-800 cursor-pointer'
                            : 'border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
                        }`}
                        onClick={() => {
                          if (hasDocument && doc.url) {
                            window.open(doc.url, '_blank')
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              hasDocument ? 'bg-primary/10' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>
                              <FileText className={`w-5 h-5 ${hasDocument ? 'text-primary' : 'text-slate-400'}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{doc.label}</h4>
                              {!hasDocument && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada</p>
                              )}
                            </div>
                          </div>
                          {hasDocument && (
                            <ExternalLink className="w-4 h-4 text-primary" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
