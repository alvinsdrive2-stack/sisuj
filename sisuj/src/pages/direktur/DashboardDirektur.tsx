import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Award, Users, Target, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function DashboardDirektur() {
  const executiveStats = [
    {
      title: "Total Sertifikasi",
      value: "2,456",
      change: "+18%",
      trend: "up",
      icon: Award,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Tingkat Kelulusan",
      value: "89.5%",
      change: "+4.2%",
      trend: "up",
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Asesi Aktif",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Pendapatan",
      value: "Rp 2.4M",
      change: "-3%",
      trend: "down",
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ]

  const performanceMetrics = [
    { category: "Q1 2024", certifications: 456, passRate: 85, revenue: "Rp 450M" },
    { category: "Q2 2024", certifications: 589, passRate: 88, revenue: "Rp 580M" },
    { category: "Q3 2024", certifications: 678, passRate: 90, revenue: "Rp 670M" },
    { category: "Q4 2024", certifications: 733, passRate: 89.5, revenue: "Rp 720M" }
  ]

  const topSchemes = [
    { name: "Teknisi Jaringan Komputer", certifications: 234, passRate: 92 },
    { name: "Administrasi Perkantoran", certifications: 189, passRate: 88 },
    { name: "Digital Marketing", certifications: 156, passRate: 85 },
    { name: "Teknisi AC", certifications: 143, passRate: 90 }
  ]

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Direktur</h2>
        <p className="text-slate-600">Ringkasan eksekutif performa LSP</p>
      </div>

      {/* Executive Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {executiveStats.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                    <TrendIcon className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <p className="text-sm text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performa Kuartalan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-800">{metric.category}</h4>
                    <span className="text-sm text-emerald-600 font-medium">{metric.passRate}% lulus</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Sertifikasi</p>
                      <p className="font-semibold text-slate-800">{metric.certifications}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Pendapatan</p>
                      <p className="font-semibold text-slate-800">{metric.revenue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Schemes */}
        <Card>
          <CardHeader>
            <CardTitle>Skema Terpopuler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSchemes.map((scheme, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{scheme.name}</p>
                      <p className="text-xs text-slate-500">{scheme.certifications} sertifikasi</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">{scheme.passRate}%</p>
                    <p className="text-xs text-slate-500">kelulusan</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insight Strategis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Pertumbuhan Positif</h4>
              <p className="text-sm text-blue-700">Jumlah sertifikasi meningkat 18% dibandingkan tahun lalu</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg">
              <h4 className="font-semibold text-emerald-900 mb-2">Tingkat Kelulusan Tinggi</h4>
              <p className="text-sm text-emerald-700">89.5% asesi lulus sertifikasi, di atas target 85%</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">Area Peningkatan</h4>
              <p className="text-sm text-amber-700">Perlu optimasi skema dengan tingkat kelulusan rendah</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
