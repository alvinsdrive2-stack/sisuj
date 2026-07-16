import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, FileText, Calendar, User, Clock, Search } from "lucide-react"
import { DocumentCard, EmptyState, DokumenStatusItem } from "@/components/direktur"
import { useKegiatanDirektur, useDirekturDokumenStatus, DirekturDokumenStatus } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { Pagination } from "@/components/ui/Pagination"
import { getUniqueSkemaNames } from "@/lib/kegiatan-service"
import { jenisKelasLabel } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

// Convert backend dokumen status -> badge items
function buildDokumenStatus(ds: DirekturDokumenStatus | undefined): DokumenStatusItem[] {
  if (!ds) return []
  const items: DokumenStatusItem[] = []
  const approval = ds.approval_status

  const pushDoc = (key: string, label: string, url: string | null, approved: boolean) => {
    if (!url) {
      items.push({ key, label, state: 'not-generated' })
    } else {
      items.push({ key, label, state: approved ? 'approved' : 'pending' })
    }
  }

  pushDoc('sk_pelaksanaan_uji', 'SK Pel. Uji', ds.sk_pelaksanaan_uji, approval.sk_pelaksanaan_uji)
  pushDoc('spt_asesor', 'SPT Asesor', ds.spt_asesor, approval.spt_asesor)
  pushDoc('spt_komtek', 'SPT Komtek', ds.spt_komtek, approval.spt_komtek)

  // BA Komtek signed by 3 komtek, not direktur. Show progress.
  const ba = approval.ba_komtek
  const baAllApproved = ba && ba.komtek1 && ba.komtek2 && ba.komtek3
  if (!ds.ba_komtek) {
    items.push({ key: 'ba_komtek', label: 'BA Komtek', state: 'not-generated' })
  } else {
    items.push({ key: 'ba_komtek', label: 'BA Komtek', state: baAllApproved ? 'approved' : 'pending' })
  }

  return items
}

export default function BelumDitandatangani() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const { kegiatans, isLoading, error, pagination } = useKegiatanDirektur(false, page, search)

  const jadwalIds = useMemo(() => kegiatans.map(k => k.jadwal_id), [kegiatans])
  const { statusMap } = useDirekturDokumenStatus(jadwalIds)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Belum Ditandatangani</h2>
        <p className="text-slate-600">Daftar dokumen yang belum ditandatangani</p>
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

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="font-medium">Legenda:</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Belum TTD</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Sudah TTD</span>
        <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" />Belum tersedia</span>
      </div>

      {/* Unsigned Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Dokumen Belum Ditandatangani
            {isLoading && <SimpleSpinner size="sm" className="ml-2 text-amber-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-red-500">
              Gagal memuat data: {error}
            </div>
          )}
          {!isLoading && !error && kegiatans.length === 0 && (
            <EmptyState
              icon={FileText}
              title="Tidak ada dokumen yang menunggu"
              description="Semua dokumen telah ditandatangani"
            />
          )}
          <div className="space-y-4">
            {kegiatans.map((doc) => (
              <DocumentCard
                key={doc.jadwal_id}
                nomorKegiatan={doc.nama_kegiatan}
                skemaSertifikasi={getUniqueSkemaNames(doc)}
                jenisAsesmen={jenisKelasLabel(doc.jenis_kelas)}
                documentInfo={[
                  { icon: User, label: "Asesor", value: `${doc.asesor?.nama?.toUpperCase() || ''}${doc.asesor2 ? ` & ${doc.asesor2.nama?.toUpperCase() || ''}` : ''}` || '-' },
                  { icon: FileText, label: "TUK", value: doc.tuk?.nama?.toUpperCase() || '-' },
                  { icon: Calendar, label: "Tanggal", value: formatDate(doc.tanggal_uji) },
                  { icon: Clock, label: "Waktu", value: formatTime(doc.tanggal_uji) }
                ]}
                badges={[
                  <Badge key="status" variant="outline" className="border-amber-200 text-amber-700">Menunggu</Badge>
                ]}
                dokumenStatus={buildDokumenStatus(statusMap[doc.jadwal_id])}
                cardClassName="bg-amber-50/40"
                onClick={() => navigate(`/direktur/belum-ditandatangani/${doc.jadwal_id}`)}
              />
            ))}
          </div>

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
