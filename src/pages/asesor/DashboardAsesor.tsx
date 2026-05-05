import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, CheckCircle2, ChevronRight, ChevronLeft, Play } from "lucide-react"
import { useKegiatanAsesorList } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { kegiatanService } from "@/lib/kegiatan-service"

export default function DashboardAsesor() {
  const navigate = useNavigate()
  const { kegiatans, isLoading, error } = useKegiatanAsesorList()
  const [startingKegiatanId, setStartingKegiatanId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Pagination logic
  const totalPages = Math.ceil(kegiatans.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedKegiatans = kegiatans.slice(startIndex, endIndex)

  const handleStartPraAsesmen = async (jadwalId: string) => {
    setStartingKegiatanId(jadwalId)
    try {
      await kegiatanService.startPraAsesmen(jadwalId)
      window.location.reload()
    } catch (err) {
      console.error('Failed to start pra-asesmen:', err)
      alert('Gagal memulai pra-asesmen')
    } finally {
      setStartingKegiatanId(null)
    }
  }

  const handleStartAsesmen = async (jadwalId: string) => {
    setStartingKegiatanId(jadwalId)
    try {
      await kegiatanService.startAssessment(jadwalId)
      window.location.reload()
    } catch (err) {
      console.error('Failed to start asesmen:', err)
      alert('Gagal memulai asesmen')
    } finally {
      setStartingKegiatanId(null)
    }
  }

  const _asesorStats = [
    {
      title: "Jadwal Mendatang",
      value: isLoading ? "..." : kegiatans.length.toString(),
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Asesi Ditugaskan",
      value: "24",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Penilaian Selesai",
      value: "18",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Pending Penilaian",
      value: "6",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ]
  // Prevent unused variable warnings - data reserved for future UI
  void _asesorStats.length

  const _pendingAssessments = [
    {
      id: 1,
      asesiName: "John Doe",
      scheme: "Teknisi Jaringan Komputer",
      unit: "K3.02.020.01 - Instalasi LAN",
      progress: 65,
      lastUpdate: "2 jam yang lalu",
      nextStep: "FRAK Form"
    },
    {
      id: 2,
      asesiName: "Jane Smith",
      scheme: "Administrasi Perkantoran",
      unit: "K3.02.010.01 - Mengelola Administrasi",
      progress: 40,
      lastUpdate: "5 jam yang lalu",
      nextStep: "MAPA Form"
    },
    {
      id: 3,
      asesiName: "Bob Johnson",
      scheme: "Digital Marketing",
      unit: "K3.02.030.01 - Perencanaan Digital Marketing",
      progress: 20,
      lastUpdate: "1 hari yang lalu",
      nextStep: "APL02 Form"
    }
  ]
  // Prevent unused variable warning - data reserved for future UI
  void _pendingAssessments.length

  const _recentCompleted = [
    { id: 1, asesi: "Ahmad Fauzi", scheme: "Teknisi Jaringan", score: "Kompeten", date: "18 Jan 2025" },
    { id: 2, asesi: "Dewi Lestari", scheme: "Administrasi", score: "Kompeten", date: "17 Jan 2025" },
    { id: 3, asesi: "Budi Santoso", scheme: "Digital Marketing", score: "Belum Kompeten", date: "16 Jan 2025" }
  ]
  // Prevent unused variable warning - data reserved for future UI
  void _recentCompleted.length

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Asesor</h2>
        <p className="text-slate-600">Kelola jadwal dan penilaian asesmen</p>
      </div>


      <div className="mt-6">
        {/* Upcoming Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Jadwal Mendatang
              {isLoading && <SimpleSpinner size="sm" className="ml-2 text-primary" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-center py-8 text-red-500">
                Gagal memuat jadwal: {error}
              </div>
            )}
            {!isLoading && !error && kegiatans.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                Tidak ada jadwal mendatang
              </div>
            )}
            {kegiatans.length > 0 && (
              <>
              <div className="space-y-3">
                {paginatedKegiatans.map((kegiatan) => (
                  <div
                    key={kegiatan.jadwal_id}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md bg-white dark:bg-slate-800 cursor-pointer"
                          onClick={() => navigate(`/asesor/asesi/${kegiatan.jadwal_id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">{kegiatan.skema?.nama}</h4>
                        <p className="text-sm text-slate-600 mt-1">{kegiatan.tuk?.nama}</p>
                        <p className="text-xs text-slate-500">{kegiatan.tuk?.alamat}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {kegiatan.is_started_praasesmen === '0' && kegiatan.tahap === 0 && (
                          <>
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300">
                              Belum Mulai
                            </Badge>
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartPraAsesmen(kegiatan.jadwal_id)
                              }}
                              disabled={startingKegiatanId === kegiatan.jadwal_id}
                            >
                              {startingKegiatanId === kegiatan.jadwal_id ? (
                                <SimpleSpinner size="sm" className="text-white" />
                              ) : (
                                <>
                                  <Play className="w-3 h-3 mr-1" />
                                  Mulai Pra-Asesmen
                                </>
                              )}
                            </Button>
                          </>
                        )}
                        {kegiatan.is_started_praasesmen === "1" && kegiatan.tahap === 1 && (
                          <>
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
                              Pra-Asesmen
                            </Badge>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartAsesmen(kegiatan.jadwal_id)
                              }}
                              disabled={startingKegiatanId === kegiatan.jadwal_id}
                            >
                              {startingKegiatanId === kegiatan.jadwal_id ? (
                                <SimpleSpinner size="sm" className="text-white" />
                              ) : (
                                <>
                                  <Play className="w-3 h-3 mr-1" />
                                  Mulai Asesmen
                                </>
                              )}
                            </Button>
                          </>
                        )}
                        {kegiatan.is_started === "1" && kegiatan.tahap === 2 && (
                          <>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">
                              Asesmen
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/asesor/asesi/${kegiatan.jadwal_id}`)}
                            >
                              Lihat Detail
                            </Button>
                          </>
                        )}
                        <ChevronRight
                          
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(kegiatan.tanggal_uji || '').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(kegiatan.tanggal_uji || '').toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {kegiatan.jenis_kelas === 'luring' ? 'Luring' : 'Daring'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Menampilkan {startIndex + 1}-{Math.min(endIndex, kegiatans.length)} dari {kegiatans.length} kegiatan
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-slate-600">
                      Halaman {currentPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
            )}
          </CardContent>
        </Card>
        
      </div>

     
    </div>
  )
}
