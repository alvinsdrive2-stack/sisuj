import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Calendar, Users, CheckCircle2, Clock, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useKegiatanAdminTUK } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"

export default function DashboardAdminTUK() {
  const navigate = useNavigate()
  const { kegiatans, isLoading, error } = useKegiatanAdminTUK()

  const adminTukStats = [
    {
      title: "Kegiatan Terjadwal",
      value: isLoading ? "..." : kegiatans.length.toString(),
      change: "mendatang",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Total Asesi",
      value: "78",
      change: "terdaftar",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Perlu Verifikasi",
      value: "12",
      change: "pending",
      icon: Shield,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Tersertifikasi",
      value: "156",
      change: "bulan ini",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ]

  const getStatusBadge = (isStarted: string, isStartedPraAsesmen: string) => {
    // is_started = "0" → Belum Mulai
    if (isStarted === "0") {
      return (
        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300">
          Belum Mulai
        </Badge>
      )
    }

    // is_started_praasesmen = "1" → Pra-Asesmen
    if (isStartedPraAsesmen === "1") {
      return (
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
          Pra-Asesmen
        </Badge>
      )
    }

    // is_started = "1" → Asesmen
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">
        Asesmen
      </Badge>
    )
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatDateString = (dateTime: string) => {
    const date = new Date(dateTime)
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }
    return date.toLocaleDateString('id-ID', options)
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Admin TUK</h2>
        <p className="text-slate-600">Kelola verifikasi asesi dan kegiatan asesmen</p>
      </div>

      {/* Admin TUK Stats */}
      
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Jadwal Mendatang
            {isLoading && <SimpleSpinner size="sm" className="ml-2 text-primary" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-slate-200 rounded-lg animate-pulse">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="h-5 bg-slate-200 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-64 mb-1"></div>
                      <div className="h-3 bg-slate-200 rounded w-96"></div>
                    </div>
                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                    </div>
                    <div className="h-9 bg-slate-200 rounded w-28"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Gagal memuat jadwal: {error}
            </div>
          ) : kegiatans.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Tidak ada jadwal mendatang
            </div>
          ) : (
            <div className="space-y-3">
              {kegiatans.map((kegiatan) => (
                <div
                  key={kegiatan.jadwal_id}
                  onClick={() => navigate(`/admin-tuk/list-asesi/${kegiatan.jadwal_id}`)}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary cursor-pointer transition-all hover:shadow-md bg-white dark:bg-slate-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100">{kegiatan.skema.nama}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {kegiatan.asesor.nama} • {kegiatan.tuk.nama}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{kegiatan.tuk.alamat}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(kegiatan.is_started, kegiatan.is_started_praasesmen || "0")}
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(kegiatan.tanggal_uji)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateString(kegiatan.tanggal_uji)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {kegiatan.jenis_kelas === 'luring' ? 'Luring' : 'Daring'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Schedule */}
      
    </div>
  )
}
