import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/EmptyState"
import { ErrorState } from "@/components/ui/ErrorState"
import { Calendar, Users, Clock, ChevronRight, Search, History, Video } from "lucide-react"
import { useKegiatanAsesorRiwayat, useVideoStatusByJadwal } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { Pagination } from "@/components/ui/Pagination"
import { jenisKelasLabel } from "@/lib/utils"
import { formatShortDateWIB, formatTimeWIB } from "@/lib/date-utils"

const TAHAP_BADGE: Record<number, { label: string; className: string }> = {
  0: { label: "Persiapan", className: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
  1: { label: "Pra-Asesmen", className: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
  2: { label: "Asesmen", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
}

export default function RiwayatAsesorPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { kegiatans, isLoading, error, pagination } = useKegiatanAsesorRiwayat(search, page)
  const videoJadwalIds = kegiatans.filter(k => k.jenis_kelas === '2').map(k => String(k.jadwal_id))
  const { statusMap: videoStatusMap } = useVideoStatusByJadwal(videoJadwalIds)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Riwayat Asesmen</h2>
        <p className="text-slate-600">Semua kegiatan yang pernah atau sedang Anda kerjakan</p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Daftar Riwayat
            {isLoading && <SimpleSpinner size="sm" className="ml-2 text-primary" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <ErrorState
              title="Gagal memuat riwayat"
              message={error}
              onRetry={() => window.location.reload()}
            />
          )}
          {!isLoading && !error && kegiatans.length === 0 && (
            <EmptyState
              icon={History}
              title="Belum ada riwayat"
              message="Belum ada kegiatan untuk ditampilkan"
            />
          )}
          {kegiatans.length > 0 && (
            <>
              <div className="space-y-3">
                {kegiatans.map((kegiatan) => {
                  const tahapBadge = TAHAP_BADGE[kegiatan.tahap] || TAHAP_BADGE[2]

                  return (
                    <div
                      key={kegiatan.jadwal_id}
                      className="p-4 border border-slate-200 rounded-lg hover:shadow-md bg-white cursor-pointer"
                      onClick={() => navigate(`/asesor/asesi/${kegiatan.jadwal_id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{kegiatan.nama_kegiatan}</h4>
                          <p className="text-sm text-slate-600 mt-1">{kegiatan.tuk?.nama}</p>
                          <p className="text-xs text-slate-500">{kegiatan.tuk?.alamat}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={tahapBadge.className}>
                            {tahapBadge.label}
                          </Badge>
                          <ChevronRight />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatShortDateWIB(kegiatan.tanggal_uji || '')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTimeWIB(kegiatan.tanggal_uji || '')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {jenisKelasLabel(kegiatan.jenis_kelas)}
                        </span>
                        {kegiatan.jenis_kelas === '2' && videoStatusMap[String(kegiatan.jadwal_id)] === false && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full whitespace-nowrap">
                            <Video className="w-3.5 h-3.5" />
                            Belum Upload Video
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4">
                <Pagination
                  page={page}
                  lastPage={pagination.lastPage}
                  total={pagination.total}
                  perPage={pagination.perPage}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
