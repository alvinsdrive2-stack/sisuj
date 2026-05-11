import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, ChevronRight, Play, Search } from "lucide-react"
import { useKegiatanAsesorList } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { Pagination } from "@/components/ui/Pagination"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { kegiatanService } from "@/lib/kegiatan-service"

export default function DashboardAsesor() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { kegiatans, isLoading, error, pagination } = useKegiatanAsesorList(true, page, search)
  const [startingKegiatanId, setStartingKegiatanId] = useState<string | null>(null)

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

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Asesor</h2>
        <p className="text-slate-600">Kelola jadwal dan penilaian asesmen</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari kegiatan..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
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
                {kegiatans.map((kegiatan) => (
                  <div
                    key={kegiatan.jadwal_id}
                    className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:shadow-md bg-white dark:bg-slate-800 cursor-pointer"
                          onClick={() => navigate(`/asesor/asesi/${kegiatan.jadwal_id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">{kegiatan.nama_kegiatan}</h4>
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
                        <ChevronRight />
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

              <Pagination
                page={page}
                lastPage={pagination.lastPage}
                total={pagination.total}
                perPage={pagination.perPage}
                onPageChange={setPage}
              />
            </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
