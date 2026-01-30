import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Users, Calendar, Clock, AlertCircle } from "lucide-react"

export default function DashboardManajer() {
  const monitoringStats = [
    {
      title: "Asesmen Aktif",
      value: "12",
      subtitle: "sedang berlangsung",
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Asesi Menunggu",
      value: "45",
      subtitle: "perlu verifikasi",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Jadwal Hari Ini",
      value: "8",
      subtitle: "asesmen terjadwal",
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Total Asesor",
      value: "23",
      subtitle: "asesor aktif",
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ]

  const activeAssessments = [
    {
      id: 1,
      scheme: "Teknisi Jaringan Komputer",
      asesor: "Bpk. Ahmad Rizki",
      tuk: "TUK 1 - Gedung A",
      startTime: "08:00",
      progress: 65,
      status: "in-progress"
    },
    {
      id: 2,
      scheme: "Administrasi Perkantoran",
      asesor: "Ibu Sarah Wijaya",
      tuk: "TUK 2 - Gedung B",
      startTime: "09:00",
      progress: 40,
      status: "in-progress"
    },
    {
      id: 3,
      scheme: "Digital Marketing",
      asesor: "Bpk. Budi Santoso",
      tuk: "TUK 3 - Gedung C",
      startTime: "10:00",
      progress: 15,
      status: "in-progress"
    }
  ]

  const pendingVerifications = [
    { id: 1, name: "John Doe", scheme: "Teknisi Jaringan", documents: "5/8", time: "2 jam" },
    { id: 2, name: "Jane Smith", scheme: "Administrasi", documents: "6/8", time: "3 jam" },
    { id: 3, name: "Bob Johnson", scheme: "Digital Marketing", documents: "4/8", time: "5 jam" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "bg-blue-100 text-blue-700"
      case "completed":
        return "bg-emerald-100 text-emerald-700"
      case "pending":
        return "bg-amber-100 text-amber-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Manajer Sertifikasi</h2>
        <p className="text-slate-600">Monitoring aktivitas sertifikasi</p>
      </div>

      {/* Monitoring Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {monitoringStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-sm text-slate-600">{stat.title}</p>
                    <p className="text-xs text-slate-500">{stat.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Active Assessments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Asesmen Sedang Berlangsung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeAssessments.map((assessment) => (
              <div key={assessment.id} className="p-4 border border-slate-200 rounded-lg hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800">{assessment.scheme}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Asesor: {assessment.asesor} • {assessment.tuk}
                    </p>
                  </div>
                  <Badge className={getStatusColor(assessment.status)}>In Progress</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-600">Progress</span>
                      <span className="text-xs font-medium text-slate-800">{assessment.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all"
                        style={{ width: `${assessment.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">Mulai {assessment.startTime}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Verifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Verifikasi Pending
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingVerifications.map((verification) => (
              <div key={verification.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{verification.name}</p>
                    <p className="text-sm text-slate-600">{verification.scheme}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-700">{verification.documents} dokumen</p>
                  <p className="text-xs text-slate-500">{verification.time} yang lalu</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
