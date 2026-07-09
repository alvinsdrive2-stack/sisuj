import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, Clock, Calendar, MapPin, Play, UserCheck, FileText, ChevronDown, Camera } from "lucide-react"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"
import { useListAsesi } from "@/hooks/useKegiatan"
import { useBatchAbsenData } from "@/hooks/useAbsenData"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { useEffect, useState, useRef } from "react"
import { kegiatanService, KegiatanAsesor } from "@/lib/kegiatan-service"
import { toast } from "@/components/ui/toast"
import { useDaftarHadirModal } from "@/contexts/DaftarHadirModalContext"
import { useRealtimeSync } from "@/hooks/useRealtimeSync"
import { formatShortDateWIB, formatTimeWIB } from "@/lib/date-utils"

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}

function useCountdown(targetDate: string): CountdownTime {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  })

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isPast: false
      })
      return
    }

    const target = new Date(targetDate).getTime()

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = target - now

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        isPast: false
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  return timeLeft
}

export default function ListAsesiAdminTUK() {
  const { jadwalId } = useParams<{ jadwalId: string }>()
  const navigate = useNavigate()
  const { asesiList, isLoading: asesiLoading, error, refetch } = useListAsesi(jadwalId || "")
  const asesiIds = asesiList.map(a => a.id_izin)
  const { absenData } = useBatchAbsenData(asesiIds, asesiIds.length > 0)
  const allAbsenAkhirDone = asesiIds.length > 0 && asesiIds.every(id => {
    const absen = absenData[id]
    return absen?.url_absen_asesi_pra_akhir
  })
  const [kegiatan, setKegiatan] = useState<KegiatanAsesor | null>(null)
  const [kegiatanRefreshKey, setKegiatanRefreshKey] = useState(0)

  // Realtime sync: refetch when asesi completes absen akhir pra
  const { publishUpdate: publishJadwalUpdate } = useRealtimeSync({
    channelName: `jadwal:${jadwalId}`,
    onUpdate: () => {
      refetch()
      setKegiatanRefreshKey(k => k + 1)
    },
  })
  const [_kegiatanLoading, setKegiatanLoading] = useState(true)
  const [startingPraAsesmen, setStartingPraAsesmen] = useState(false)
  const [startingAsesmen, setStartingAsesmen] = useState(false)
  const [showDaftarHadirMenu, setShowDaftarHadirMenu] = useState(false)
  const daftarHadirMenuRef = useRef<HTMLDivElement>(null)
  const { openDetailModal, openKegiatanModal } = useDaftarHadirModal()

  // Group asesi by skema
  const skemaMap = new Map<string, string>()
  if (kegiatan?.asesi) {
    for (const a of kegiatan.asesi) {
      skemaMap.set(a.id_izin, a.skema?.nama || '')
    }
  }
  const groupedAsesi = asesiList.reduce((groups, asesi) => {
    const skema = skemaMap.get(asesi.id_izin) || 'Lainnya'
    const existing = groups.find(g => g.skema === skema)
    if (existing) {
      existing.asesi.push(asesi)
    } else {
      groups.push({ skema, asesi: [asesi] })
    }
    return groups
  }, [] as { skema: string; asesi: typeof asesiList }[])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (daftarHadirMenuRef.current && !daftarHadirMenuRef.current.contains(event.target as Node)) {
        setShowDaftarHadirMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch kegiatan detail
  useEffect(() => {
    if (!jadwalId) return
    const fetchKegiatan = async () => {
      try {
        const response = await kegiatanService.getKegiatanDetail(jadwalId)
        setKegiatan(response.data)
      } catch (err) {
        console.error('Error fetching kegiatan detail:', err)
      } finally {
        setKegiatanLoading(false)
      }
    }
    fetchKegiatan()
  }, [jadwalId, kegiatanRefreshKey])

  const countdown = useCountdown(kegiatan?.tanggal_uji || "")

  const handleStartPraAsesmen = async () => {
    if (!kegiatan) return
    setStartingPraAsesmen(true)

    try {
      await kegiatanService.startPraAsesmen(kegiatan.jadwal_id)
      toast("Pra-asesmen berhasil dimulai!", "success")
      setKegiatan(prev => prev ? { ...prev, tahap: 1, is_started_praasesmen: "1" } : prev)
      setKegiatanRefreshKey(k => k + 1)
      publishJadwalUpdate({ type: 'tahap-update', action: 'start-praasesmen', jadwalId: kegiatan.jadwal_id })
      refetch()
      setStartingPraAsesmen(false)
    } catch (error) {
      console.error('Error starting pra-asesmen:', error)
      toast(error instanceof Error ? error.message : "Gagal memulai pra-asesmen", "error")
      setStartingPraAsesmen(false)
    }
  }

  const handleStartAsesmen = async () => {
    if (!kegiatan) return
    setStartingAsesmen(true)

    try {
      await kegiatanService.startAssessment(kegiatan.jadwal_id)
      toast("Asesmen berhasil dimulai!", "success")
      setKegiatan(prev => prev ? { ...prev, tahap: 2, is_started: "1" } : prev)
      setKegiatanRefreshKey(k => k + 1)
      publishJadwalUpdate({ type: 'tahap-update', action: 'start-asesmen', jadwalId: kegiatan.jadwal_id })
      refetch()
      setStartingAsesmen(false)
    } catch (error) {
      console.error('Error starting asesmen:', error)
      toast(error instanceof Error ? error.message : "Gagal memulai asesmen", "error")
      setStartingAsesmen(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="hover:bg-primary/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Daftar Asesi</h2>
          <p className="text-slate-600 dark:text-slate-400">Kelola asesi pada jadwal ini</p>
        </div>
      </div>

      {/* Kegiatan Detail */}
      {kegiatan && (
        <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
          <div className="flex gap-6">
            {/* Left: Kegiatan Info (70%) */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{kegiatan.nama_kegiatan}</h3>
                {kegiatan.is_started_praasesmen === "0" && (
                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300">
                    Belum Mulai
                  </Badge>
                )}
                {kegiatan.tahap === 1 && (
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                    Pra-Asesmen
                  </Badge>
                )}
                {kegiatan.tahap === 2 && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Asesmen
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {kegiatan.tuk?.nama?.toUpperCase() || ''} • {kegiatan.asesor?.nama?.toUpperCase() || ''}{kegiatan.asesor2 ? ` & ${kegiatan.asesor2.nama?.toUpperCase() || ''}` : ''}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatShortDateWIB(kegiatan.tanggal_uji)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {formatTimeWIB(kegiatan.tanggal_uji)}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {kegiatan.tuk?.alamat || ''}
                </div>
              </div>
            </div>

            {/* Right: Countdown (30%) */}

            <div className="w-[18%] flex flex-col items-center justify-center gap-3">

              {kegiatan && countdown && !countdown.isPast && kegiatan?.is_started === "0" && (
                
                <div className="relative">
                  <div className="relative p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/10 shadow-lg shadow-primary/5">
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-pulse" />

                    <div className="relative text-center">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Clock className="w-3 h-3 text-primary animate-pulse" />
                        <span className="text-[10px] font-medium text-primary/80 uppercase tracking-wider">Countdown</span>
                      </div>

                      <div className="flex items-baseline justify-center gap-1">
                        {countdown.days > 0 && (
                          <>
                            <span className="text-3xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                              {countdown.days}
                            </span>
                            <span className="text-sm font-bold text-primary/60">d</span>
                            <span className="text-2xl font-bold text-primary/40">:</span>
                          </>
                        )}
                        <span className="text-3xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent tabular-nums">
                          {String(countdown.hours).padStart(2, '0')}
                        </span>
                        <span className="text-lg font-bold text-primary/40 animate-pulse">:</span>
                        <span className="text-3xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent tabular-nums">
                          {String(countdown.minutes).padStart(2, '0')}
                        </span>
                        <span className="text-lg font-bold text-primary/40 animate-pulse">:</span>
                        <span className="text-3xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent tabular-nums">
                          {String(countdown.seconds).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="mt-2 h-1 bg-primary/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000 ease-linear"
                          style={{ width: `${((60 - countdown.seconds) / 60) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {kegiatan && countdown && countdown.isPast && kegiatan?.tahap === 2 && (
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Sedang Berjalan</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400">Asesmen dimulai</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}      
              {/* Start Button - based on is_started and is_started_praasesmen */}
              {kegiatan?.tahap === 0 && (
                <Button
                  onClick={handleStartPraAsesmen}
                  disabled={startingPraAsesmen}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {startingPraAsesmen ? (
                    <>
                      <SimpleSpinner size="sm" className="text-white mr-2" />
                      Memulai...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Mulai Pra-Asesmen
                    </>
                  )}
                </Button>
              )}
              {kegiatan?.tahap === 1 && (
                <div className="space-y-1">
                  <Button
                    onClick={handleStartAsesmen}
                    disabled={startingAsesmen || !allAbsenAkhirDone}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {startingAsesmen ? (
                      <>
                        <SimpleSpinner size="sm" className="text-white mr-2" />
                        Memulai...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Mulai Asesmen
                      </>
                    )}
                  </Button>
                  {!allAbsenAkhirDone && (
                    <p className="text-[11px] text-amber-600 text-center leading-tight">
                      Semua asesi harus absen akhir pra-asesmen terlebih dahulu
                    </p>
                  )}
                </div>
              )}

              
            </div>
          </div>
        </div>
      )}
      {/* Split Layout: Asesi List & Daftar Hadir */}
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
              <ErrorState
                title="Gagal memuat daftar asesi"
                message={error}
                onRetry={() => window.location.reload()}
              />
            )}

            {!asesiLoading && !error && asesiList.length === 0 && (
              <EmptyState
                icon={Users}
                title="Tidak ada asesi"
                message="Tidak ada asesi untuk jadwal ini"
              />
            )}

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {groupedAsesi.map((group) => (
                <div key={group.skema}>
                  <h5 className="text-sm font-bold text-primary mb-2 px-1 uppercase tracking-wider">
                    {group.skema}
                  </h5>
                  <div className="space-y-2">
                    {group.asesi.map((asesi, idx) => {
                      const absen = absenData[asesi.id_izin]
                      const asesiSudah = !!absen?.url_absen_asesi_pra_akhir
                      const asesor1Sudah = !!absen?.url_absen_asesor1_pra_akhir
                      const semuaSudah = asesiSudah && asesor1Sudah
                      return (
                      <div
                        key={asesi.id_izin}
                        onClick={() => openDetailModal('asesi', asesi.id_izin, asesi.nama, jadwalId || "")}
                        className={`p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                          semuaSudah
                            ? 'border-emerald-300 bg-emerald-50/50 hover:border-emerald-400'
                            : 'border-slate-200 dark:border-slate-700 hover:border-primary'
                        } bg-white dark:bg-slate-800`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{asesi.nama}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">ID: {asesi.id_izin}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${asesiSudah ? 'bg-emerald-500' : 'bg-slate-300'}`} title={`Asesi: ${asesiSudah ? 'sudah absen akhir' : 'belum absen akhir'}`} />
                            <span className={`w-2.5 h-2.5 rounded-full ${asesor1Sudah ? 'bg-emerald-500' : 'bg-slate-300'}`} title={`Asesor 1: ${asesor1Sudah ? 'sudah absen akhir' : 'belum absen akhir'}`} />
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daftar Hadir - 1 column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Daftar Hadir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Daftar Hadir Button with Dropdown */}
            <div className="relative" ref={daftarHadirMenuRef}>
              <Button
                variant="outline"
                className="w-full h-16 border-primary/20 hover:bg-primary/5 hover:border-primary flex items-center justify-between px-4"
                onClick={() => setShowDaftarHadirMenu(!showDaftarHadirMenu)}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <span className="text-sm font-semibold block">Daftar Hadir</span>
                    <span className="text-xs text-muted-foreground">Asesi & Asesor</span>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-primary transition-transform ${showDaftarHadirMenu ? 'rotate-180' : ''}`} />
              </Button>

              {/* Dropdown Menu */}
              {showDaftarHadirMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  <button
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/5 transition-colors text-left"
                    onClick={() => {
                      openKegiatanModal('daftar_hadir_asesi', jadwalId || "")
                      setShowDaftarHadirMenu(false)
                    }}
                  >
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <span className="text-sm font-medium block">Daftar Hadir Asesi</span>
                      <span className="text-xs text-muted-foreground">QR Code & absensi asesi</span>
                    </div>
                  </button>
                  <div className="border-t border-slate-100" />
                  <button
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/5 transition-colors text-left"
                    onClick={() => {
                      openKegiatanModal('daftar_hadir_asesor', jadwalId || "")
                      setShowDaftarHadirMenu(false)
                    }}
                  >
                    <UserCheck className="w-5 h-5 text-primary" />
                    <div>
                      <span className="text-sm font-medium block">Daftar Hadir Asesor</span>
                      <span className="text-xs text-muted-foreground">QR Code & absensi asesor</span>
                    </div>
                  </button>
                  <div className="border-t border-slate-100" />
                  <button
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors text-left"
                    onClick={() => {
                      openKegiatanModal('foto_bersama', jadwalId || "")
                      setShowDaftarHadirMenu(false)
                    }}
                  >
                    <Camera className="w-5 h-5 text-emerald-600" />
                    <div>
                      <span className="text-sm font-medium block">Foto Bersama</span>
                      <span className="text-xs text-muted-foreground">Upload foto kegiatan</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
