import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Award,
  Timer,
  ChevronRight,
  FileCheck
} from "lucide-react"
import DashboardNavbar from "@/components/DashboardNavbar"
import bgImage from "@/assets/bg.webp"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import { toast } from "@/components/ui/toast"

export default function DashboardAsesiPage() {
  const { user } = useAuth()
  const { kegiatan, isLoading, error } = useKegiatanAsesi()
  const navigate = useNavigate()
  const [showPage, setShowPage] = useState(false)
  const [idIzin, setIdIzin] = useState<string | null>(null)

  // Fetch id_izin from list-asesi
  useEffect(() => {
    const fetchIdIzin = async () => {
      if (!kegiatan?.jadwal_id || !user?.name) return

      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          const matchedAsesi = result.list_asesi?.find((a: any) => a.nama === user.name)
          if (matchedAsesi?.id_izin) {
            console.log("Found matching asesi:", matchedAsesi)
            setIdIzin(matchedAsesi.id_izin)
          }
        }
      } catch (error) {
        console.error("Error fetching id_izin:", error)
      }
    }

    fetchIdIzin()
  }, [kegiatan?.jadwal_id, user?.name])

  // Debug logging
  console.log("=== ASESI DASHBOARD DEBUG ===")
  console.log("User data:", user)
  console.log("kegiatan:", kegiatan)
  console.log("kegiatan?.jadwal_id:", kegiatan?.jadwal_id)
  console.log("id_izin from list-asesi:", idIzin)
  console.log("isLoading:", isLoading)
  console.log("error:", error)
  console.log("==============================")

  // Page entrance animation
  useEffect(() => {
    setShowPage(true)
  }, [])

  // Debug logging
  console.log("=== ASESI DASHBOARD DEBUG ===")
  console.log("User data:", user)
  console.log("==============================")

  const [, _setCurrentTime] = useState(new Date()) // Clock state reserved for future use
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLate: false
  })

  useEffect(() => {
    // Skip if no kegiatan or exam already started
    if (!kegiatan?.tanggal_uji || kegiatan?.is_started === "1") {
      return
    }

    const updateCountdown = () => {
      const now = new Date()
      const examDate = new Date(kegiatan.tanggal_uji)
      const diff = examDate.getTime() - now.getTime()

      if (diff <= 0) {
        // Calculate how late (in minutes past the exam time)
        const lateDiff = Math.abs(diff)
        const lateMinutes = Math.floor(lateDiff / (1000 * 60))
        const lateSeconds = Math.floor((lateDiff % (1000 * 60)) / 1000)

        setCountdown({
          days: 0,
          hours: 0,
          minutes: lateMinutes,
          seconds: lateSeconds,
          isLate: true
        })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds, isLate: false })
    }

    // Initial call
    updateCountdown()

    // Calculate time until exam to determine interval
    const now = new Date()
    const examDate = new Date(kegiatan.tanggal_uji)
    const diffMs = examDate.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    // If more than 1 hour away, check every minute instead of every second
    const interval = diffHours > 1 ? 60000 : 1000

    const timer = setInterval(updateCountdown, interval)
    return () => clearInterval(timer)
  }, [kegiatan?.tanggal_uji, kegiatan?.is_started])

  const examData = useMemo(() => {
    if (!kegiatan) {
      return {
        scheme: "Tidak ada sertifikasi aktif",
        schemeCode: "-",
        unit: {
          title: "-",
          code: "-"
        },
        schedule: {
          date: "-",
          time: "-",
          venue: "-",
          address: "-"
        },
        assessors: [],
        status: "none"
      }
    }

    const tanggalUji = new Date(kegiatan.tanggal_uji)

    // Handle multiple assessors - check if asesor is array or has multiple fields
    const assessors = []

    // Add first asesor if exists
    if (kegiatan.asesor?.nama) {
      assessors.push({
        name: kegiatan.asesor.nama,
        nip: kegiatan.asesor.noreg || "-",
        license: kegiatan.asesor.noreg || "-"
      })
    }

    // Add second asesor if exists (asesor2)
    if (kegiatan.asesor2?.nama) {
      assessors.push({
        name: kegiatan.asesor2.nama,
        nip: kegiatan.asesor2.noreg || "-",
        license: kegiatan.asesor2.noreg || "-"
      })
    }

    return {
      scheme: kegiatan.skema.nama,
      schemeCode: `SK-${kegiatan.skema_id}`,
      unit: {
        title: "Unit Kompetensi",
        code: kegiatan.skema_id
      },
      schedule: {
        date: tanggalUji.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        time: `${tanggalUji.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
        venue: kegiatan.tuk.nama,
        address: kegiatan.tuk.alamat
      },
      assessors,
      status: kegiatan.is_started === "1" ? "in-progress" : "scheduled"
    }
  }, [kegiatan])

  const isExamTime = (countdown: { days: number; hours: number; minutes: number; seconds: number; isLate: boolean }) => {
    // Show "Masuk ke Ujian" if:
    // 1. Late (waktu ujian sudah lewat) - tapi max 60 menit
    // 2. Kurang dari 15 menit sebelum ujian
    if (countdown.isLate) {
      // Only show button for 60 minutes after exam time
      const lateSeconds = countdown.minutes * 60 + countdown.seconds
      return lateSeconds <= 3600 // 60 minutes = 3600 seconds
    }
    const totalSeconds = countdown.days * 86400 + countdown.hours * 3600 + countdown.minutes * 60 + countdown.seconds
    return totalSeconds < 900 // 15 minutes = 900 seconds
  }


  // Memoize button text to prevent flickering - use stable state
  const [buttonText, setButtonText] = useState("Lihat Persiapan")
  const [isButtonLocked, setIsButtonLocked] = useState(false)

  useEffect(() => {
    // Skip if already locked or exam already started
    if (isButtonLocked || kegiatan?.is_started === "1") {
      return
    }

    const currentTimeToEnter = isExamTime(countdown)
    if (currentTimeToEnter) {
      setIsButtonLocked(true)
      if (kegiatan?.is_started_praasesmen === "1") {
        setButtonText("Masuk Pra-Asesmen")
      } else if (kegiatan?.is_started === "1") {
        setButtonText("Masuk Asesmen")
      } else {
        setButtonText("Masuk ke Ujian")
      }
    }
  }, [countdown, isButtonLocked, kegiatan?.is_started, kegiatan?.tahap])

  return (
    <>
      {/* Fixed Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Main Content */}
      <div className={`min-h-screen relative transition-opacity duration-300 ${showPage ? 'page-enter opacity-100' : 'opacity-0'}`}>

      {/* Header */}
      <DashboardNavbar userName={user?.name} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 shadow-lg animate-slide-down">
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Selamat Datang, {user?.name || "Asesi"}!
            </h2>
            <p className="text-muted-foreground">
              Persiapkan diri Anda untuk mengikuti Uji Kompetensi
            </p>
          </CardContent>
        </Card>

        {/* Countdown Banner - Big Container */}
        <Card className="animate-scale-in overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-8 relative">
            <div className="absolute inset-0 animate-shimmer"></div>
            <div className="relative">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <Timer className="w-8 h-8 animate-pulse" />
                    <h3 className="text-2xl font-bold">
                      {countdown.isLate ? "Telat" : "Ujian Akan Dimulai Dalam"}
                    </h3>
                  </div>
                  <p className="text-white/80">
                    {countdown.isLate ? (
                      <>
                        Anda terlambat {countdown.minutes} menit {countdown.seconds} detik.
                        <br />
                        <span className="text-white font-semibold">Segera masuk ujian!</span>
                      </>
                    ) : (
                      "Pastikan semua persiapan sudah lengkap"
                    )}
                  </p>
                </div>

                <div className="flex gap-4">
                  {[
                    { label: "Hari", value: countdown.days },
                    { label: "Jam", value: countdown.hours },
                    { label: "Menit", value: countdown.minutes },
                    { label: "Detik", value: countdown.seconds }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[80px] text-center animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <p className="text-4xl font-bold">{String(item.value).padStart(2, '0')}</p>
                      <p className="text-sm text-white/80">{item.label}</p>
                    </div>
                  ))}
                </div>
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
                  onClick={() => {
                    console.log("Navigating with id_izin:", idIzin)
                    if (!idIzin) {
                      toast("ID Izin tidak ditemukan", "error")
                      return
                    }
                    if (kegiatan?.tahap === "1") {
                      navigate(`/asesi/praasesmen`)
                    }
                    if (kegiatan?.tahap === "2") {
                      navigate(`/asesi/asesmen/${idIzin}/ia04a`)
                    }
                  }}
                >
                  {buttonText}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exam Details */}
            <Card className="shadow-lg animate-slide-up">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <BookOpen className="w-6 h-6 text-primary" />
                  Detail Uji Kompetensi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Scheme Info */}
                  <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
                    <p className="text-sm text-muted-foreground mb-1">Skema Sertifikasi</p>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{examData.scheme}</h3>
                    <Badge variant="outline" className="text-xs">{examData.schemeCode}</Badge>
                  </div>

                  <Separator />

                  {/* Unit Info */}
                  <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
                    <p className="text-sm text-muted-foreground mb-1">Unit Kompetensi</p>
                    <h4 className="font-semibold text-slate-800 mb-1">{examData.unit.title}</h4>
                    <p className="text-sm text-muted-foreground">Kode: {examData.unit.code}</p>
                  </div>

                  <Separator />

                  {/* Schedule Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tanggal</p>
                        <p className="font-semibold text-slate-800">{examData.schedule.date}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Waktu</p>
                        <p className="font-semibold text-slate-800">{examData.schedule.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl md:col-span-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Lokasi</p>
                        <p className="font-semibold text-slate-800">{examData.schedule.venue}</p>
                        <p className="text-sm text-muted-foreground">{examData.schedule.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            
            {/* Assessor Info */}
            <Card className="shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>

              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <FileCheck className="w-6 h-6 text-primary" />
                  Informasi Asesor
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                
                {examData.assessors.length > 0 ? (
                  <div className="space-y-4">
                    {examData.assessors.map((assessor, index) => {
                      const initials = assessor.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .substring(0, 2)

                      return (
                        <div key={index} className="flex items-center gap-4 mb-10">
                          <div className="relative">
                            <Avatar className="w-16 h-16">
                              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <Badge variant="default" className="absolute -top-1 -left-1 text-xs px-3 py-1">
                              {index + 1}
                            </Badge>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-slate-800">{assessor.name}</h4>
                            <Badge variant="info" className="mt-2">
                              <Award className="w-3 h-3 mr-1" />
                              No. Lisensi: {assessor.license}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada informasi asesor</p>
                )}

              </CardContent>
            </Card>
            <br />
            {/* Help Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-primary" />
                </div>
                <h5 className="font-semibold text-slate-800 mb-2">Butuh Bantuan?</h5>
                <p className="text-sm text-muted-foreground mb-4">Hubungi admin jika ada pertanyaan</p>
                <Button variant="outline" size="sm" className="w-full">
                  Hubungi Admin
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        </CardContent>
        </Card>
      </main>
    </div>
    </>
  )
}
