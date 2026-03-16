import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Calendar, Clock, MapPin, FileText, ExternalLink, AlertCircle } from "lucide-react"
import { useListAsesi } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { kegiatanService, KegiatanAsesor } from "@/lib/kegiatan-service"
import { useDokumenModal } from "@/contexts/DokumenModalContext"
import { DokumenViewerModal } from "@/components/direktur"

interface KomtekFiles {
  ba_komtek?: string
  spt_komtek?: string
  sk_komtek?: string
  pleno_komtek?: string
}

export default function DaftarAsesiSudahPage() {
  const { jadwalId } = useParams<{ jadwalId: string }>()
  const navigate = useNavigate()
  const { asesiList, isLoading: asesiLoading, error } = useListAsesi(jadwalId || "")
  const [kegiatan, setKegiatan] = useState<KegiatanAsesor | null>(null)
  const [_kegiatanLoading, setKegiatanLoading] = useState(true)
  const [komtekFiles, setKomtekFiles] = useState<KomtekFiles>({})
  const [komtekFilesLoading, setKomtekFilesLoading] = useState(false)
  const [selectedDokumen, setSelectedDokumen] = useState<{ url: string; title: string } | null>(null)

  // Modal context
  const { openModal: openDokumenModal } = useDokumenModal()

  // Fetch komtek files
  useEffect(() => {
    const fetchKomtekFiles = async () => {
      if (!jadwalId) return

      setKomtekFilesLoading(true)
      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/komtek/files/${jadwalId}`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setKomtekFiles(data)
        }
      } catch (err) {
        console.error('Error fetching komtek files:', err)
      } finally {
        setKomtekFilesLoading(false)
      }
    }
    fetchKomtekFiles()
  }, [jadwalId])

  // Fetch kegiatan detail (dari yang belum dan sudah ditandatangani)
  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        // Fetch dari yang belum ditandatangani
        const responseFalse = await kegiatanService.getKegiatanKomtek(false)
        let found = responseFalse.data.data.find((k: KegiatanAsesor) => k.jadwal_id === jadwalId)

        // Kalau ga ketemu, cari dari yang sudah ditandatangani
        if (!found) {
          const responseTrue = await kegiatanService.getKegiatanKomtek(true)
          found = responseTrue.data.data.find((k: KegiatanAsesor) => k.jadwal_id === jadwalId)
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
  }, [jadwalId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const openFile = (url: string, title: string) => {
    setSelectedDokumen({ url, title })
  }

  return (
    <>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/komtek/sudah-ditandatangani")}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Daftar Asesi</h2>
          <p className="text-slate-600 dark:text-slate-400">Pilih asesi untuk melihat detail dokumen</p>
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

      {/* Info Card - Panduan Komtek */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-slate-700">Panduan Komtek</span>
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
              <FileText className="w-3 h-3 text-emerald-500" />
            </div>
            <div>
              <span className="font-medium text-slate-700">Dokumen Komtek</span>
              <p className="text-slate-500">Klik untuk buka dokumen tersedia</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-3 h-3 text-slate-400" />
            </div>
            <div>
              <span className="font-medium text-slate-700">Dokumen belum tersedia</span>
              <p className="text-slate-500">Button akan disabled jika belum ada</p>
            </div>
          </div>
        </div>
      </div>

      {/* Split Layout: Asesi List & Dokumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asesi List - 2 columns */}
        <Card className="lg:col-span-2">
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

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {asesiList.map((asesi, index) => (
                <div
                  key={asesi.id_izin}
                  onClick={() => openDokumenModal(asesi.id_izin, asesi.nama)}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer bg-white dark:bg-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">{asesi.nama}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">ID: {asesi.id_izin}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Dokumen - 1 column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Dokumen Komtek
              {komtekFilesLoading && <SimpleSpinner size="sm" className="ml-2 text-primary" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* BA Komtek */}
            <Button
              variant="outline"
              className="w-full h-16 border-primary/20 hover:bg-primary/5 hover:border-primary flex items-center justify-between px-4"
              disabled={!komtekFiles.ba_komtek}
              onClick={() => komtekFiles.ba_komtek && openFile(komtekFiles.ba_komtek, 'BA Komtek')}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <span className="text-sm font-semibold block">BA Komtek</span>
                  <span className="text-xs text-muted-foreground">
                    {komtekFiles.ba_komtek ? 'Klik untuk buka' : 'Belum tersedia'}
                  </span>
                </div>
              </div>
              {komtekFiles.ba_komtek && <ExternalLink className="w-5 h-5 text-primary" />}
            </Button>

            {/* SK Komtek */}
            <Button
              variant="outline"
              className="w-full h-16 border-primary/20 hover:bg-primary/5 hover:border-primary flex items-center justify-between px-4"
              disabled={!komtekFiles.sk_komtek}
              onClick={() => komtekFiles.sk_komtek && openFile(komtekFiles.sk_komtek, 'SK Komtek')}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <span className="text-sm font-semibold block">SK Komtek</span>
                  <span className="text-xs text-muted-foreground">
                    {komtekFiles.sk_komtek ? 'Klik untuk buka' : 'Belum tersedia'}
                  </span>
                </div>
              </div>
              {komtekFiles.sk_komtek && <ExternalLink className="w-5 h-5 text-primary" />}
            </Button>

            {/* SPT Komtek */}
            <Button
              variant="outline"
              className="w-full h-16 border-primary/20 hover:bg-primary/5 hover:border-primary flex items-center justify-between px-4"
              disabled={!komtekFiles.spt_komtek}
              onClick={() => komtekFiles.spt_komtek && openFile(komtekFiles.spt_komtek, 'SPT Komtek')}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <span className="text-sm font-semibold block">SPT Komtek</span>
                  <span className="text-xs text-muted-foreground">
                    {komtekFiles.spt_komtek ? 'Klik untuk buka' : 'Belum tersedia'}
                  </span>
                </div>
              </div>
              {komtekFiles.spt_komtek && <ExternalLink className="w-5 h-5 text-primary" />}
            </Button>

            {/* Pleno Komtek */}
            <Button
              variant="outline"
              className="w-full h-16 border-primary/20 hover:bg-primary/5 hover:border-primary flex items-center justify-between px-4"
              disabled={!komtekFiles.pleno_komtek}
              onClick={() => komtekFiles.pleno_komtek && openFile(komtekFiles.pleno_komtek, 'Pleno Komtek')}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <span className="text-sm font-semibold block">Pleno Komtek</span>
                  <span className="text-xs text-muted-foreground">
                    {komtekFiles.pleno_komtek ? 'Klik untuk buka' : 'Belum tersedia'}
                  </span>
                </div>
              </div>
              {komtekFiles.pleno_komtek && <ExternalLink className="w-5 h-5 text-primary" />}
            </Button>
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
  </>
  )
}
