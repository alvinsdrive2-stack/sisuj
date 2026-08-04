import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PenTool, FileText, Calendar, User, Clock, CheckCircle2, Search, Crown } from "lucide-react"
import { DocumentCard, EmptyState } from "@/components/direktur"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { Pagination } from "@/components/ui/Pagination"
import { useKegiatanKomtek } from "@/hooks/useKegiatan"
import { useBaKomtekProgress } from "@/hooks/useBaKomtekProgress"
import { getUniqueSkemaNames } from "@/lib/kegiatan-service"
import { jenisKelasLabel } from "@/lib/utils"
import { KetuaKomtekIcon } from "@/components/komtek/KetuaKomtekIcon"

export default function TandatanganKomtek() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { kegiatans: pendingDocs, isLoading: isLoadingPending, pagination } = useKegiatanKomtek(false, page, search)
  const { isLoading: isLoadingSigned } = useKegiatanKomtek(true)
  const { baProgress, isLoading: isLoadingProgress } = useBaKomtekProgress(pendingDocs, pendingDocs.length > 0)
  const [ketuaOnly, setKetuaOnly] = useState(false)
  const filteredDocs = ketuaOnly ? pendingDocs.filter(doc => baProgress[doc.jadwal_id]?.my_position === 1) : pendingDocs

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const isLoading = isLoadingPending || isLoadingSigned || isLoadingProgress

  const getStatusBadge = (jadwalId: string) => {
    const progress = baProgress[jadwalId]
    if (!progress) {
      return <Badge key="status" className="bg-slate-100 text-slate-700">Menunggu</Badge>
    }
    if (progress.my_ttd_signed) {
      return <Badge key="status" className="bg-emerald-100 text-emerald-700">Telah Selesai Ditandatangani</Badge>
    }
    return <Badge key="status" className="bg-amber-100 text-amber-700">Menunggu Tandatangan</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Tandatangan Dokumen</h2>
        <p className="text-slate-600">Daftar dokumen yang belum ditandatangani</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kegiatan..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <Button
          variant={ketuaOnly ? "default" : "outline"}
          onClick={() => setKetuaOnly(v => !v)}
          className="whitespace-nowrap"
        >
          <Crown className="w-4 h-4" />
          {ketuaOnly ? "Semua Kegiatan" : "Ketua Saya"}
        </Button>
      </div>

      {/* Documents to View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary" />
            Dokumen Perlu Tandatangan
            {isLoading && <SimpleSpinner size="sm" className="ml-2 text-primary" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoading && filteredDocs.length === 0 ? (
            <EmptyState
              icon={ketuaOnly ? Crown : CheckCircle2}
              title={ketuaOnly ? "Tidak ada kegiatan ketua" : "Semua dokumen telah ditandatangani"}
              description={ketuaOnly ? "Tidak ada kegiatan yang ketua komteknya Anda" : "Tidak ada dokumen yang menunggu tandatangan"}
              iconClassName={ketuaOnly ? "text-amber-500" : "text-emerald-500"}
            />
          ) : (
            <div className="space-y-4">
              {filteredDocs.map((doc) => {
                const progress = baProgress[doc.jadwal_id]
                const isKetua = progress?.my_position === 1
                return (
                  <DocumentCard
                    key={doc.jadwal_id}
                    nomorKegiatan={doc.nama_kegiatan}
                    skemaSertifikasi={getUniqueSkemaNames(doc)}
                    jenisAsesmen={jenisKelasLabel(doc.jenis_kelas)}
                    documentInfo={[
                      { icon: User, label: "Asesor", value: `${doc.asesor?.nama?.toUpperCase() || ''}${doc.asesor2 ? ` & ${doc.asesor2.nama?.toUpperCase() || ''}` : ''}` || '-' },
                      { icon: FileText, label: "TUK", value: doc.tuk?.nama?.toUpperCase() || '' },
                      { icon: Calendar, label: "Tanggal", value: formatDate(doc.tanggal_uji) },
                      { icon: Clock, label: "Waktu", value: formatTime(doc.tanggal_uji) }
                    ]}
                    badges={[getStatusBadge(doc.jadwal_id)]}
                    cornerElement={isKetua ? <KetuaKomtekIcon signed={!!progress?.my_ttd_signed} /> : undefined}
                    onClick={() => navigate(`/komtek/belum-ditandatangani/${doc.jadwal_id}`)}
                  />
                )
              })}
            </div>
          )}

          <Pagination
            page={page}
            lastPage={pagination.lastPage}
            total={pagination.total}
            perPage={pagination.perPage}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
