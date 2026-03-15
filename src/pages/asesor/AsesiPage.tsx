import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, Calendar, MapPin, UserCheck} from "lucide-react"
import { useKegiatanAsesor, useListAsesi, useAbsenData, AbsenData } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"

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

export default function AsesiPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan, isLoading: kegiatanLoading, error: kegiatanError } = useKegiatanAsesor()
  const jadwalId = kegiatan?.jadwal_id
  const { asesiList, isLoading: asesiLoading, error: asesiError } = useListAsesi(jadwalId || "")
  const countdown = useCountdown(kegiatan?.tanggal_uji || "")

  // Get asesi IDs for absen data fetch
  const asesiIds = asesiList.map(a => a.id_izin)
  const { absenData } = useAbsenData(asesiIds, asesiIds.length > 0)

  // State for asesor IDs and jenjang from data-dokumen
  const [asesorIds, setAsesorIds] = useState<{ id_asesor_1: number | null; id_asesor_2: number | null; jenjang: string }>({
    id_asesor_1: null,
    id_asesor_2: null,
    jenjang: '0'
  })

  // Fetch asesor IDs and jenjang from data-dokumen endpoint
  useEffect(() => {
    const fetchAsesorData = async () => {
      if (asesiList.length === 0) return

      const firstAsesiId = asesiList[0].id_izin
      const token = localStorage.getItem("access_token")

      try {
        const response = await fetch(`https://backend.devgatensi.site/api/asesmen/${firstAsesiId}/data-dokumen`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          if (result.message === "Success" && result.data) {
            setAsesorIds({
              id_asesor_1: result.data.id_asesor_1,
              id_asesor_2: result.data.id_asesor_2,
              jenjang: result.data.jenjang || '0'
            })
          }
        }
      } catch (err) {
        console.error('Error fetching asesor data:', err)
      }
    }

    fetchAsesorData()
  }, [asesiList])

  // Determine if user is asesor1 or asesor2
  const isAsesor1 = asesorIds.id_asesor_1 === Number(user?.id)
  const isAsesor2 = asesorIds.id_asesor_2 === Number(user?.id)
  const asesorRole = isAsesor1 ? 1 : isAsesor2 ? 2 : null

  // Helper function to get asesi absen status color
  const getAsesiAbsenStatus = (absen: AbsenData | undefined, phase: 'asesmen' | 'praasesmen') => {
    if (!absen) return 'yellow'

    if (phase === 'asesmen') {
      const akhir = absen.url_absen_asesi_akhir
      // If akhir has value -> green, otherwise yellow
      return akhir ? 'green' : 'yellow'
    } else {
      const akhir = absen.url_absen_asesi_pra_akhir
      return akhir ? 'green' : 'yellow'
    }
  }

  // Helper function to get asesor review status
  const getAsesorReviewStatus = (absen: AbsenData | undefined, phase: 'asesmen' | 'praasesmen', asesorNum: 1 | 2) => {
    if (!absen || !asesorNum) return 'Butuh ditinjau'

    if (phase === 'asesmen') {
      const awal = asesorNum === 1 ? absen.url_absen_asesor1_awal : absen.url_absen_asesor2_awal
      const akhir = asesorNum === 1 ? absen.url_absen_asesor1_akhir : absen.url_absen_asesor2_akhir
      if (akhir) return 'Sudah ditinjau'
      if (awal) return 'Butuh ditinjau'
      return 'Butuh ditinjau'
    } else {
      const awal = asesorNum === 1 ? absen.url_absen_asesor1_pra_awal : absen.url_absen_asesor2_pra_awal
      const akhir = asesorNum === 1 ? absen.url_absen_asesor1_pra_akhir : absen.url_absen_asesor2_pra_akhir

      if (akhir) return 'Sudah ditinjau'
      if (awal) return 'Butuh ditinjau'
      return 'Butuh ditinjau'
    }
  }

  // Helper function to get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Sudah ditinjau':
        return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
      case 'Sedang ditinjau':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200'
    }
  }

  const handleViewAsesi = (idIzin: string) => {
    // Check jenjang for low jenjang flow
    const jenjangId = parseInt(asesorIds.jenjang || "0")

    // Navigate based on current phase
    if (kegiatan?.tahap === 2) {
      if (jenjangId < 4) {
        navigate(`/asesi/asesmen/${idIzin}/ia01`)
      } else {
        navigate(`/asesi/asesmen/${idIzin}/ia04a`)
      }
    } else if (kegiatan?.tahap === 1) {
      navigate(`/asesi/praasesmen/${idIzin}/apl01`)
    } else {
      navigate(`/asesi/praasesmen/${idIzin}/apl01`)
    }
  }

  if (kegiatanLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <SimpleSpinner size="lg" className="mx-auto mb-4 text-primary" />
          <p className="text-slate-600">Memuat data kegiatan...</p>
        </div>
      </div>
    )
  }

  if (kegiatanError && !kegiatan) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Gagal memuat kegiatan: {kegiatanError}</p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    )
  }

  if (!kegiatan) {
    return (
      <div className="text-center py-12">
        <UserCheck className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Tidak Ada Kegiatan</h3>
        <p className="text-slate-600">Anda belum memiliki jadwal asesmen yang ditugaskan</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Daftar Asesi</h2>
        <p className="text-slate-600">Asesi yang ditugaskan pada jadwal asesmen ini</p>
      </div>

      {/* Kegiatan Detail */}
      <div className="p-6 border border-slate-200 rounded-xl bg-white">
        <div className="flex gap-6">
          {/* Left: Kegiatan Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-slate-800">{kegiatan.skema.nama}</h3>
              {kegiatan.tahap === 0 && (
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                  Belum Mulai
                </Badge>
              )}
              {kegiatan.tahap === 1 && (
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                  Pra-Asesmen
                </Badge>
              )}
              {kegiatan.tahap === 2 && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                  Asesmen
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-3">{kegiatan.tuk.nama}</p>

            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(kegiatan.tanggal_uji).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {new Date(kegiatan.tanggal_uji).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                {kegiatan.tuk.alamat}
              </div>
            </div>
          </div>

          {/* Right: Countdown */}
          <div className="w-[18%] flex items-center justify-center">
            {!countdown.isPast ? (
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
            ) : (
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-emerald-700">Sedang Berjalan</div>
                      <div className="text-xs text-emerald-600">Asesmen dimulai</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asesi List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Daftar Asesi
            {asesiLoading && <SimpleSpinner size="sm" className="ml-2 text-primary" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {asesiError && (
            <div className="text-center py-8 text-red-500">
              Gagal memuat daftar asesi: {asesiError}
            </div>
          )}

          {!asesiLoading && !asesiError && asesiList.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Tidak ada asesi untuk jadwal ini
            </div>
          )}



          <div className="space-y-3">
            {asesiList.map((asesi, index) => {
              const absen = absenData[asesi.id_izin]

              const asesiStatus = kegiatan?.tahap === 2
                ? getAsesiAbsenStatus(absen, 'asesmen')
                : getAsesiAbsenStatus(absen, 'praasesmen')

              const reviewStatus = asesorRole
                ? (kegiatan?.tahap === 2
                    ? getAsesorReviewStatus(absen, 'asesmen', asesorRole as 1 | 2)
                    : getAsesorReviewStatus(absen, 'praasesmen', asesorRole as 1 | 2))
                : 'Butuh ditinjau'

              // Only allow click if asesi has green indicator (absen selesai)
              const canClick = asesiStatus === 'green'

              return (
                <div
                  key={asesi.id_izin}
                  onClick={() => canClick && handleViewAsesi(asesi.id_izin)}
                  className={`p-4 border border-slate-200 rounded-lg bg-white transition-all ${
                    canClick
                      ? 'hover:shadow-md hover:border-primary/30 cursor-pointer'
                      : 'cursor-not-allowed opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{asesi.nama}</h4>
                        <p className="text-xs text-slate-500">ID: {asesi.id_izin}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Review Status Badge */}
                      <Badge className={getStatusBadgeStyle(reviewStatus)}>
                        {reviewStatus}
                      </Badge>

                      {/* Asesi Absen Status Indicator */}
                      <div
                        className={`relative w-4 h-4 rounded-full ${
                          asesiStatus === 'green'
                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                            : 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
                        }`}
                        title={asesiStatus === 'green' ? 'Absen selesai' : 'Absen belum selesai'}
                      >
                        {asesiStatus === 'green' && (
                          <div className="absolute inset-0 rounded-full bg-emerald-400 blur-md opacity-50 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
