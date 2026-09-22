import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Calendar, Users, CheckCircle2, Clock, ChevronRight, Play, History, Search } from "lucide-react"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"
import { Pagination } from "@/components/ui/Pagination"
import { useNavigate } from "react-router-dom"
import { useKegiatanAdminTUK, useListAsesi, useKegiatanHistoryAdminTUK } from "@/hooks/useKegiatan"
import { useBatchAbsenData } from "@/hooks/useAbsenData"
import { formatDateWIB, formatTimeWIB } from "@/lib/date-utils"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import React, { memo, useEffect, useState } from "react"
import { jenisKelasLabel } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { kegiatanService } from "@/lib/kegiatan-service"
import { toast } from "@/components/ui/toast"
import { useRealtimeSync } from "@/hooks/useRealtimeSync"

export default function DashboardAdminTUK() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'jadwal' | 'riwayat'>('jadwal')
  const [currentPage, setCurrentPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search biar nggak nembak API tiap ketikan
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
    setHistoryPage(1)
  }

  const {
    kegiatans,
    isLoading,
    error,
    pagination,
    refetch: refetchKegiatan,
  } = useKegiatanAdminTUK(currentPage, debouncedSearch)
  const {
    kegiatans: historyKegiatans,
    isLoading: historyLoading,
    error: historyError,
    pagination: historyPagination,
  } = useKegiatanHistoryAdminTUK(historyPage, debouncedSearch)

  const _adminTukStats = [
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
  // Prevent unused variable warning - stats reserved for future UI
  void _adminTukStats.length

  const getStatusBadge = (_isStarted: string, tahap: number) => {
    // is_started = "0" → Belum Mulai
    if (tahap === 0) {
      return (
        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300">
          Belum Mulai
        </Badge>
      )
    }
    // tahap = "1" → Tahap 1 - Pra-Asesmen
    if (tahap === 1) {
      return (
        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300">
          Pra-Asesmen
        </Badge>
      )
    }

    // tahap = "2" → Tahap 2 - Asesmen
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300">
        Asesmen
      </Badge>
    )
  }

  const formatDateTime = (dateTime: string) => formatTimeWIB(dateTime)

  const formatDateString = (dateTime: string) => formatDateWIB(dateTime)

  const KegiatanCard = memo(function KegiatanCard({ kegiatan, isHistory }: { kegiatan: typeof kegiatans[0]; isHistory?: boolean }) {
    const [refreshKey, setRefreshKey] = useState(0)
    const isTahap1 = kegiatan.tahap === 1
    const { asesiList, refetch } = useListAsesi(isTahap1 ? kegiatan.jadwal_id : '')
    const asesiIds = asesiList.map(a => a.id_izin)
    const { absenData } = useBatchAbsenData(asesiIds, isTahap1 && asesiIds.length > 0, refreshKey)
    const allAbsenDone = isTahap1 && asesiIds.length > 0 && asesiIds.every(id => {
      const absen = absenData[id]
      return absen?.url_absen_asesi_pra_akhir
    })
    const [starting, setStarting] = useState(false)

    // Realtime: refetch when asesi completes absen akhir pra
    const { publishUpdate: publishJadwalUpdate } = useRealtimeSync({
      channelName: `jadwal.${kegiatan.jadwal_id}`,
      onUpdate: () => {
        refetch()
        setRefreshKey(k => k + 1)
        refetchKegiatan()
      },
    })

    const handleStartAsesmen = async (e: React.MouseEvent) => {
      e.stopPropagation()
      setStarting(true)
      try {
        await kegiatanService.startAssessment(kegiatan.jadwal_id)
        toast("Asesmen berhasil dimulai!", "success")
        publishJadwalUpdate({ type: 'tahap-update', action: 'start-asesmen', jadwalId: kegiatan.jadwal_id })
        refetchKegiatan()
        refetch()
        setRefreshKey(k => k + 1)
      } catch (err) {
        toast(err instanceof Error ? err.message : "Gagal memulai asesmen", "error")
        setStarting(false)
      }
    }

    return (
      <div
        onClick={() => navigate(`/admin-tuk/list-asesi/${kegiatan.jadwal_id}`)}
        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary cursor-pointer transition-all hover:shadow-md bg-white dark:bg-slate-800"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100">{kegiatan.nama_kegiatan}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {kegiatan.asesor?.nama?.toUpperCase() || ''}{kegiatan.asesor2 ? ` & ${kegiatan.asesor2.nama?.toUpperCase() || ''}` : ''} • {kegiatan.tuk?.nama?.toUpperCase() || ''}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{kegiatan.tuk?.alamat || ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(kegiatan.is_started, kegiatan.tahap)}
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </div>
        <div className="flex items-center justify-between">
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
              {jenisKelasLabel(kegiatan.jenis_kelas)}
            </span>
          </div>
          {!isHistory && isTahap1 && (
            <div className="flex flex-col items-end gap-1">
              <Button
                size="sm"
                onClick={handleStartAsesmen}
                disabled={starting || !allAbsenDone}
                className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
              >
                {starting ? (
                  <SimpleSpinner size="sm" className="text-white mr-1" />
                ) : (
                  <Play className="w-3.5 h-3.5 mr-1" />
                )}
                Mulai Asesmen
              </Button>
              {!allAbsenDone && (
                <span className="text-[10px] text-amber-600 text-right leading-tight max-w-[200px]">
                  Semua asesi harus absen akhir pra-asesmen dulu
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  })

  return (
    <div className="space-y-6">
      {/* Page Title + Tab Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Admin TUK</h2>
          <p className="text-slate-600">Kelola verifikasi asesi dan kegiatan asesmen</p>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'jadwal'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Jadwal Mendatang
          </button>
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'riwayat'
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari kegiatan..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {/* Jadwal Mendatang Tab */}
      {activeTab === 'jadwal' && (
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
              <ErrorState title="Gagal memuat jadwal" message={error} onRetry={() => window.location.reload()} />
            ) : kegiatans.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title={debouncedSearch ? "Tidak ada hasil" : "Tidak ada jadwal mendatang"}
                message={debouncedSearch
                  ? `Tidak ada kegiatan yang cocok dengan "${debouncedSearch}"`
                  : "Belum ada kegiatan yang dijadwalkan"}
              />
            ) : (
              <>
                <div className="space-y-3">
                  {kegiatans.map((kegiatan) => (
                    <KegiatanCard key={kegiatan.jadwal_id} kegiatan={kegiatan} />
                  ))}
                </div>

                <Pagination
                  page={pagination.currentPage}
                  lastPage={pagination.lastPage}
                  total={pagination.total}
                  perPage={pagination.perPage}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Riwayat Tab */}
      {activeTab === 'riwayat' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Riwayat Kegiatan
              {historyLoading && <SimpleSpinner size="sm" className="ml-2 text-primary" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
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
                    </div>
                  </div>
                ))}
              </div>
            ) : historyError ? (
              <ErrorState title="Gagal memuat riwayat" message={historyError} onRetry={() => window.location.reload()} />
            ) : historyKegiatans.length === 0 ? (
              <EmptyState
                icon={History}
                title={debouncedSearch ? "Tidak ada hasil" : "Belum ada riwayat kegiatan"}
                message={debouncedSearch
                  ? `Tidak ada kegiatan yang cocok dengan "${debouncedSearch}"`
                  : "Riwayat kegiatan akan muncul setelah asesmen selesai"}
              />
            ) : (
              <>
                <div className="space-y-3">
                  {historyKegiatans.map((kegiatan) => (
                    <KegiatanCard key={kegiatan.jadwal_id} kegiatan={kegiatan} isHistory />
                  ))}
                </div>

                <Pagination
                  page={historyPagination.currentPage}
                  lastPage={historyPagination.lastPage}
                  total={historyPagination.total}
                  perPage={historyPagination.perPage}
                  onPageChange={setHistoryPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
