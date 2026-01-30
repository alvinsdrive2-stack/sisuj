import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, FileCheck, Calendar, Clock, Upload, AlertCircle, CheckCircle2, Play } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"

export default function DashboardAsesi() {
  const navigate = useNavigate()
  const { kegiatan, isLoading, error } = useKegiatanAsesi()

  console.log('=== Dashboard Asesi ===')
  console.log('isLoading:', isLoading)
  console.log('error:', error)
  console.log('kegiatan:', kegiatan)

  const asesiStats = [
    {
      title: "Profil Lengkap",
      value: "85%",
      icon: User,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      action: () => navigate("/asesi/profile")
    },
    {
      title: "Sertifikasi Aktif",
      value: isLoading ? "..." : (kegiatan ? "1" : "0"),
      icon: FileCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      action: () => navigate("/asesi/assessment")
    },
    {
      title: "Jadwal Asesmen",
      value: kegiatan
        ? new Date(kegiatan.tanggal_uji).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : "-",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      action: () => navigate("/asesi/assessment")
    },
    {
      title: "Dokumen",
      value: "5/8",
      icon: Upload,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      action: () => navigate("/asesi/documents")
    }
  ]

  const currentAssessment = kegiatan ? {
    scheme: kegiatan.skema.nama,
    code: `SK-${kegiatan.skema.id}`,
    unit: "Unit Kompetensi",
    unitCode: kegiatan.skema_id,
    status: kegiatan.is_started === "1" ? "in-progress" : "scheduled",
    schedule: {
      date: new Date(kegiatan.tanggal_uji).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      time: `${new Date(kegiatan.tanggal_uji).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
      venue: `${kegiatan.tuk.nama} - ${kegiatan.tuk.alamat}`
    }
  } : null

  const checklistStatus = [
    { name: "APL 01 - Permohonan Sertifikasi", status: "completed", description: "Formulir permohonan sertifikasi" },
    { name: "APL 02 - Rekaman Asesor", status: "pending", description: "Rekaman awal oleh asesor" },
    { name: "Dokumen Pendukung", status: "in-progress", description: "5 of 8 dokumen diupload" },
    { name: "Pra Asesmen", status: "pending", description: "Belum dimulai" },
    { name: "Asesmen Kompetensi", status: "pending", description: "Belum dimulai" }
  ]

  const upcomingTasks = [
    { id: 1, task: "Lengkapi dokumen pendukung", due: "19 Jan 2025", priority: "high" },
    { id: 2, task: "Persiapkan diri untuk pra asesmen", due: "19 Jan 2025", priority: "medium" },
    { id: 3, task: "Datang 30 menit sebelum asesmen", due: "20 Jan 2025", priority: "high" }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3 mr-1" />Selesai</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
      case "pending":
        return <Badge variant="outline" className="text-slate-600">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700"
      case "medium":
        return "bg-amber-100 text-amber-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Asesi</h2>
        <p className="text-slate-600">Kelola profil dan sertifikasi Anda</p>
      </div>

      {/* Asesi Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {asesiStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={stat.action}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-sm text-slate-600">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Current Assessment */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-primary" />
            Sertifikasi Aktif
            {isLoading && <SimpleSpinner size="sm" className="ml-2 text-primary" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-red-500">
              Gagal memuat data: {error}
            </div>
          )}
          {!isLoading && !error && !currentAssessment && (
            <div className="text-center py-8 text-slate-500">
              Tidak ada sertifikasi aktif
            </div>
          )}
          {currentAssessment && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{currentAssessment.scheme}</h3>
                <p className="text-sm text-slate-600">{currentAssessment.code}</p>
                <p className="text-sm text-slate-700 mt-2 font-medium">{currentAssessment.unit}</p>
                <p className="text-xs text-slate-500">{currentAssessment.unitCode}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-slate-800">Jadwal Asesmen</span>
                </div>
                <p className="text-slate-700">{currentAssessment.schedule.date}</p>
                <p className="text-slate-600 text-sm">{currentAssessment.schedule.time}</p>
                <p className="text-slate-600 text-sm">{currentAssessment.schedule.venue}</p>
              </div>

              <button
                onClick={() => navigate("/asesi/assessment")}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Play className="w-5 h-5" />
                Lihat Detail Sertifikasi
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checklist Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Status Pendaftaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistStatus.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.status === "completed" ? "bg-emerald-500" :
                    item.status === "in-progress" ? "bg-blue-500" :
                    "bg-slate-200"
                  }`}>
                    {item.status === "completed" && <CheckCircle2 className="w-4 h-4 text-white" />}
                    {item.status === "in-progress" && <Clock className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Tugas Mendatang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="p-4 border border-slate-200 rounded-lg hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-slate-800 text-sm">{task.task}</p>
                    <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due: {task.due}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/asesi/profile")}
              className="p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <User className="w-6 h-6 text-primary mb-2" />
              <p className="font-semibold text-slate-800">Lengkapi Profil</p>
              <p className="text-sm text-slate-600">Update data diri Anda</p>
            </button>
            <button
              onClick={() => navigate("/asesi/documents")}
              className="p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <Upload className="w-6 h-6 text-primary mb-2" />
              <p className="font-semibold text-slate-800">Upload Dokumen</p>
              <p className="text-sm text-slate-600">Lengkapi dokumen persyaratan</p>
            </button>
            <button
              onClick={() => navigate("/asesi/assessment")}
              className="p-4 border border-slate-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              <FileCheck className="w-6 h-6 text-primary mb-2" />
              <p className="font-semibold text-slate-800">Cek Status Sertifikasi</p>
              <p className="text-sm text-slate-600">Lihat progress sertifikasi</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
