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

interface DokumenAsesiResponse {
  message: string
  list_asesi: Array<{
    id_izin: string
    nama: string
    is_started: string
    started_at: string | null
    kompeten: string
  }>
  [key: string]: any
}

export default function DetailDokumenDirekturPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showError } = useToast()
  const { asesiList, isLoading: asesiLoading, error, refetch } = useListAsesi(id || "")
  const [kegiatan, setKegiatan] = useState<KegiatanAsesor | null>(null)
  const [kegiatanLoading, setKegiatanLoading] = useState(true)
  const [dokumenDirektur, setDokumenDirektur] = useState<DokumenDirekturResponse['data'] | null>(null)
  const [dokumenAsesi, setDokumenAsesi] = useState<DokumenAsesiResponse | null>(null)
  const [selectedAsesi, setSelectedAsesi] = useState<typeof asesiList[0] | null>(null)
  const [loadingDokumenAsesi, setLoadingDokumenAsesi] = useState(false)

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

  // Fetch dokumen asesi when selected
  useEffect(() => {
    const fetchDokumenAsesi = async () => {
      if (!selectedAsesi) {
        setDokumenAsesi(null)
        return
      }

      setLoadingDokumenAsesi(true)
      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/dokumen/asesi/${id}`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result: DokumenAsesiResponse = await response.json()
          setDokumenAsesi(result)
        } else {
          showError('Gagal memuat dokumen asesi')
        }
      } catch (error) {
        console.error("Error fetching dokumen asesi:", error)
        showError('Terjadi kesalahan saat memuat dokumen')
      } finally {
        setLoadingDokumenAsesi(false)
      }
    }

    fetchDokumenAsesi()
  }, [selectedAsesi, id])

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

  // Build asesi documents list (similar to komtek DetailDokumenAsesiPage)
  const docKeyMap: Record<string, string> = {
    'apl01': 'apl01',
    'apl02': 'apl02',
    'mapa01': 'mapa01',
    'mapa02': 'mapa02',
    'ak07': 'ak07',
    'ak04': 'ak04',
    'ak01': 'ak01',
    'ia04a': 'ia04a',
    'ak02': 'ak02',
    'ia04b': 'ia04b',
    'ak03': 'ak03',
    'ia05': 'ia05',
    'ak05': 'ak05',
    'ak06': 'ak06',
    'tugas': 'tugas'
  }

  const asesiDocuments = selectedAsesi && dokumenAsesi ? docKeyMap[selectedAsesi.kompeten] ? [{
    key: selectedAsesi.kompeten,
    label: selectedAsesi.nama,
    url: (dokumenAsesi as any)[docKeyMap[selectedAsesi.kompeten]] || null
  }] : [] : []

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
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dokumen Direktur & Asesi</h2>
            <p className="text-slate-600 dark:text-slate-400">Kelola dokumen untuk kegiatan ini</p>
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

        {/* Dokumen Direktur Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Dokumen Direktur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                        hasDocument ? 'bg-primary/10' : 'bg-slate-200 dark:bg-slate-700'
                      }`}>
                        <FileText className={`w-6 h-6 ${hasDocument ? 'text-primary' : 'text-slate-400'}`} />
                      </div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-1">{doc.label}</h4>
                      {!hasDocument ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada</p>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-primary">
                          <span>Buka</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Asesi Section */}
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

          {/* Right: Dokumen Asesi */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Dokumen Asesi
                {selectedAsesi && (
                  <span className="text-sm font-normal text-slate-600 dark:text-slate-400">
                    - {selectedAsesi.nama}
                  </span>
                )}
                {loadingDokumenAsesi && <SimpleSpinner size="sm" className="ml-2 text-primary" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedAsesi ? (
                <div className="text-center py-16 text-slate-500 dark:text-slate-400">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Pilih asesi untuk melihat dokumen</p>
                </div>
              ) : (
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                  {asesiDocuments.length > 0 && asesiDocuments[0].url ? (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
                        {asesiDocuments[0].label}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Dokumen {selectedAsesi.kompeten.toUpperCase()}
                      </p>
                      <Button
                        onClick={() => window.open(asesiDocuments[0].url!, '_blank')}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Buka Dokumen
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Dokumen belum tersedia</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
