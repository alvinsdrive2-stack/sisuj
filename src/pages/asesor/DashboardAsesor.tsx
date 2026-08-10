import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, ChevronRight, ClipboardList, FileCheck, Award, Video } from "lucide-react"
import { useKegiatanAsesorList, useVideoStatusByJadwal } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { useNavigate } from "react-router-dom"
import { useMemo } from "react"
import { jenisKelasLabel } from "@/lib/utils"
import { formatShortDateWIB, formatTimeWIB } from "@/lib/date-utils"

const TAHAP_CARDS = [
  { tahap: 0, title: "Persiapan Asesmen", icon: ClipboardList, color: "bg-slate-100 text-slate-700", hoverColor: "hover:bg-slate-200", path: "/asesi/persiapan" },
  { tahap: 1, title: "Praasesmen", icon: FileCheck, color: "bg-purple-100 text-purple-700", hoverColor: "hover:bg-purple-200", path: "/asesi/praasesmen" },
  { tahap: 2, title: "Asesmen", icon: Award, color: "bg-emerald-100 text-emerald-700", hoverColor: "hover:bg-emerald-200", path: "/asesi/asesmen" },
] as const

export default function DashboardAsesor() {
  const navigate = useNavigate()
  const { kegiatans, isLoading } = useKegiatanAsesorList(true)
  const videoJadwalIds = kegiatans.filter(k => k.jenis_kelas === '2').map(k => String(k.jadwal_id))
  const { statusMap: videoStatusMap } = useVideoStatusByJadwal(videoJadwalIds)

  const counts = useMemo(() => ({
    0: kegiatans.filter(k => Number(k.tahap) === 0).length,
    1: kegiatans.filter(k => Number(k.tahap) === 1).length,
    2: kegiatans.filter(k => Number(k.tahap) === 2).length,
  }), [kegiatans])

  const recentKegiatan = useMemo(() => kegiatans.slice(0, 10), [kegiatans])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Asesor</h2>
        <p className="text-slate-600">Ringkasan kegiatan asesmen Anda</p>
      </div>

      {isLoading && <div className="flex justify-center py-8"><SimpleSpinner /></div>}

      {!isLoading && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TAHAP_CARDS.map(({ tahap, title, icon: Icon, color, hoverColor, path }) => (
              <div
                key={tahap}
                className={`p-6 rounded-lg border border-slate-200 cursor-pointer transition-colors ${hoverColor}`}
                onClick={() => navigate(path)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{title}</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{counts[tahap as 0|1|2]}</p>
                  </div>
                  <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Kegiatan */}
          {recentKegiatan.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Kegiatan Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentKegiatan.map((kegiatan) => (
                    <div
                      key={kegiatan.jadwal_id}
                      className="p-4 border border-slate-200 rounded-lg hover:shadow-md bg-white cursor-pointer"
                      onClick={() => navigate(`/asesor/asesi/${kegiatan.jadwal_id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-800">{kegiatan.nama_kegiatan}</h4>
                          <p className="text-sm text-slate-600 mt-1">{kegiatan.tuk?.nama}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {Number(kegiatan.tahap) === 0 && (
                            <Badge className="bg-slate-100 text-slate-700">Persiapan</Badge>
                          )}
                          {Number(kegiatan.tahap) === 1 && (
                            <Badge className="bg-purple-100 text-purple-700">Praasesmen</Badge>
                          )}
                          {Number(kegiatan.tahap) === 2 && (
                            <Badge className="bg-emerald-100 text-emerald-700">Asesmen</Badge>
                          )}
                          <ChevronRight />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{formatShortDateWIB(kegiatan.tanggal_uji || '')}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{formatTimeWIB(kegiatan.tanggal_uji || '')}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" />{jenisKelasLabel(kegiatan.jenis_kelas)}</span>
                        {kegiatan.jenis_kelas === '2' && videoStatusMap[String(kegiatan.jadwal_id)] === false && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full whitespace-nowrap">
                            <Video className="w-3.5 h-3.5" />
                            Belum Upload Video
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
