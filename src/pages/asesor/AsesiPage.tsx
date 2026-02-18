import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, Calendar, MapPin, UserCheck, Eye } from "lucide-react"
import { useKegiatanAsesor } from "@/hooks/useKegiatan"
import { useListAsesi } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { useEffect, useState } from "react"

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
  const { kegiatan, isLoading: kegiatanLoading, error: kegiatanError } = useKegiatanAsesor()
  const jadwalId = kegiatan?.jadwal_id
  const { asesiList, isLoading: asesiLoading, error: asesiError } = useListAsesi(jadwalId || "")
  const countdown = useCountdown(kegiatan?.tanggal_uji || "")

  // Determine current phase
  const isPraAsesmen = kegiatan?.tahap === "1"
  const isAsesmen = kegiatan?.tahap === "2"

  const handleViewAsesi = (idIzin: string) => {

    // Navigate based on current phase - prioritize asesmen over praasesmen
    if (isAsesmen) {
      // Navigate to asesmen
      const url = `/asesi/asesmen/${idIzin}/ia04a`
      console.log('[AsesiPage] Navigating to:', url)
      navigate(url)
    } else if (isPraAsesmen) {
      // Navigate to praasesmen
      const url = `/asesi/praasesmen/${idIzin}/apl01`
      console.log('[AsesiPage] Navigating to:', url)
      navigate(url)
    } else {
      // Default to praasesmen
      const url = `/asesi/praasesmen/${idIzin}/apl01`
      console.log('[AsesiPage] Navigating to:', url)
      navigate(url)
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
              {kegiatan.is_started === "0" && (
                <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                  Belum Mulai
                </Badge>
              )}
              {kegiatan.is_started_praasesmen === "1" && kegiatan.tahap === "1" && (
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                  Pra-Asesmen
                </Badge>
              )}
              {kegiatan.is_started === "1" && kegiatan.tahap === "2" && (
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
            {asesiList.map((asesi, index) => (
              <div
                key={asesi.id_izin}
                className="p-4 border border-slate-200 rounded-lg bg-white hover:shadow-md transition-shadow"
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
                    {/* View Button */}
                    <Button
                      size="sm"
                      onClick={() => handleViewAsesi(asesi.id_izin)}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {isPraAsesmen && !isAsesmen && "Lihat PraAsesmen"}
                      {isAsesmen && "Lihat Asesmen"}
                      {!isPraAsesmen && !isAsesmen && "Lihat Data"}
                    </Button>
                    {/* Status Indicators */}
                    {asesi.is_started && (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        Sedang Mengerjakan
                      </Badge>
                    )}

                    {asesi.kompeten === "K" && (
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-emerald-400 blur-md opacity-50 animate-pulse" />
                        <div className="relative w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                      </div>
                    )}

                    {asesi.kompeten === "BK" && (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                        Belum Kompeten
                      </Badge>
                    )}

                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
