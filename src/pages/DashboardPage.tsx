import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  Timer,
  ChevronRight,
  Play,
  FileCheck
} from "lucide-react"
import DashboardNavbar from "@/components/DashboardNavbar"
import logo from "@/assets/logo.png"
import bgImage from "@/assets/bg.webp"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()
  const [showPage, setShowPage] = useState(false)

  // Page entrance animation
  useEffect(() => {
    setShowPage(true)
  }, [])

  // Debug logging
  console.log("=== DASHBOARD DEBUG ===")
  console.log("User data:", user)
  console.log("User name:", user?.name)
  console.log("User email:", user?.email)
  console.log("======================")

  const [, setCurrentTime] = useState(new Date())
  const [countdown, setCountdown] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev
        if (seconds > 0) {
          seconds--
        } else {
          seconds = 59
          if (minutes > 0) {
            minutes--
          } else {
            minutes = 59
            if (hours > 0) {
              hours--
            } else {
              hours = 23
              if (days > 0) days--
            }
          }
        }
        return { days, hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const examData = useMemo(() => ({
    scheme: "Skema Sertifikasi Teknisi Jaringan Komputer",
    schemeCode: "SJ.KTP.003.01.2024",
    unit: {
      title: "Unit Kompetensi: Instalasi Jaringan Local Area Network (LAN)",
      code: "K3.02.020.01"
    },
    schedule: {
      date: "Senin, 20 Januari 2025",
      time: "08:00 - 16:00 WIB",
      venue: "TUK LSP Gatensi - Gedung A Lt. 3",
      address: "Jl. Teknologi No. 123, Jakarta Selatan"
    },
    assessor: {
      name: "Bpk. Dr. Ir. Ahmad Rizki, M.Kom",
      nip: "19800515 200501 1 003",
      license: "ASM.2023.001234"
    },
    participant: {
      name: user?.name || "Peserta",
      email: user?.email || "",
      phone: user?.phone || "",
      noreg: user?.noreg || ""
    },
    status: "scheduled",
    documents: [
      { name: "Aplikasi Uji Kompetensi", status: "completed" },
      { name: "FR.APL.01 - Permohonan Sertifikasi", status: "completed" },
      { name: "FR.APL.02 - Rekaman Asesor", status: "pending" }
    ]
  }), [user])

  const requirements = [
    { id: 1, text: "Membawa KTP/Identitas Asli", completed: true },
    { id: 2, text: "Membawa Alat Tulis", completed: true },
    { id: 3, text: "Berpakaian Formal (Kemeja)", completed: true },
    { id: 4, text: "Datang 30 Menit Sebelum Ujian", completed: true },
  ]

  return (
    <div className={`min-h-screen relative transition-opacity duration-300 ${showPage ? 'page-enter opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>

      {/* Header */}
      <DashboardNavbar userName={examData.participant.name} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 shadow-lg animate-slide-down">
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Selamat Datang, {examData.participant.name}!
            </h2>
            <p className="text-muted-foreground">
              Persiapkan diri Anda untuk mengikuti Uji Kompetensi
            </p>
          </CardContent>
        </Card>

        {/* Countdown Banner - Big Container */}
        <Card className="shadow-2xl animate-scale-in overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/90 text-white p-8 relative">
            <div className="absolute inset-0 animate-shimmer"></div>
            <div className="relative">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="text-center lg:text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <Timer className="w-8 h-8 animate-pulse" />
                    <h3 className="text-2xl font-bold">Ujian Akan Dimulai Dalam</h3>
                  </div>
                  <p className="text-white/80">Pastikan semua persiapan sudah lengkap</p>
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
                >
                  Lihat Persiapan
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

            {/* Assessor Info */}
            <Card className="shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Users className="w-6 h-6 text-primary" />
                  Informasi Asesor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      AR
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-slate-800">{examData.assessor.name}</h4>
                    <p className="text-sm text-muted-foreground">NIP: {examData.assessor.nip}</p>
                    <Badge variant="info" className="mt-2">
                      <Award className="w-3 h-3 mr-1" />
                      No. Lisensi: {examData.assessor.license}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Profil Asesor
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exam Flow */}
           
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle className="text-slate-800">Aksi Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="default">
                  <Play className="w-4 h-4 mr-2" />
                  Mulai Ujian
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Lihat Soal Ujian
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Dokumen Pendukung
                </Button>
              </CardContent>
            </Card>

            {/* Requirements Checklist */}
            <Card className="shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle className="text-slate-800">Persyaratan</CardTitle>
                <CardDescription>Ceklist persiapan ujian</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {requirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${req.completed ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      {req.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`text-sm ${req.completed ? 'text-slate-700' : 'text-slate-500'}`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

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

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-primary/10 mt-12 animate-slide-up">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                <img src={logo} alt="LSP Gatensi Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">LSP Gatensi</p>
                <p className="text-xs text-muted-foreground">Lembaga Sertifikasi Profesi</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 LSP Gatensi. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
