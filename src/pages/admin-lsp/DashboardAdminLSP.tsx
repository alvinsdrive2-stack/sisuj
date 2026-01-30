import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Activity, TrendingUp, Calendar } from "lucide-react"

export default function DashboardAdminLSP() {
  // Mock data - replace with actual API calls
  const stats = [
    {
      title: "Total Asesi",
      value: "1,234",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Sertifikasi Aktif",
      value: "56",
      change: "+5%",
      icon: FileText,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Asesmen Hari Ini",
      value: "23",
      change: "0%",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Tingkat Kelulusan",
      value: "87%",
      change: "+3%",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ]

  const recentActivities = [
    { id: 1, text: "Asesi John Doe menyelesaikan asesmen", time: "5 menit lalu", type: "success" },
    { id: 2, text: "Sertifikasi baru dibuat", time: "15 menit lalu", type: "info" },
    { id: 3, text: "Asesor Jane Smith memperbarui hasil", time: "1 jam lalu", type: "info" },
    { id: 4, text: "3 asesi terdaftar untuk sertifikasi", time: "2 jam lalu", type: "success" }
  ]

  const upcomingSchedule = [
    { id: 1, title: "Asesmen Teknisi Jaringan", date: "20 Jan 2025", time: "08:00", location: "TUK 1", status: "scheduled" },
    { id: 2, title: "Asesmen Administrator", date: "21 Jan 2025", time: "09:00", location: "TUK 2", status: "scheduled" },
    { id: 3, title: "Asesmen Digital Marketing", date: "22 Jan 2025", time: "08:00", location: "TUK 3", status: "scheduled" }
  ]

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Admin LSP</h2>
        <p className="text-slate-600">Overview aktivitas sertifikasi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.change} dari bulan lalu
                    </p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-800">{activity.text}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Jadwal Mendatang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSchedule.map((schedule) => (
                <div key={schedule.id} className="p-3 border border-slate-200 rounded-lg hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-800">{schedule.title}</h4>
                    <Badge variant="outline" className="text-xs">Scheduled</Badge>
                  </div>
                  <p className="text-xs text-slate-600">{schedule.date} • {schedule.time}</p>
                  <p className="text-xs text-slate-500">{schedule.location}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section (Placeholder for actual chart) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Statistik Sertifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
            <p className="text-slate-500">Chart akan ditampilkan di sini</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
