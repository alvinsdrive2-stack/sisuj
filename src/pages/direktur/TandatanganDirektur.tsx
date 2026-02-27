import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PenTool, FileText, Calendar, User, Clock, CheckCircle2 } from "lucide-react"
import { DocumentCard, EmptyState } from "@/components/direktur"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { useKegiatanDirektur } from "@/hooks/useKegiatan"

export default function TandatanganDirektur() {
  const navigate = useNavigate()
  const { kegiatans: pendingDocs, isLoading: isLoadingPending } = useKegiatanDirektur(false) // belum ditandatangani
  const { isLoading: isLoadingSigned } = useKegiatanDirektur(true) // sudah ditandatangani

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const isLoading = isLoadingPending || isLoadingSigned

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Tandatangan Dokumen</h2>
        <p className="text-slate-600">Tandatangani dokumen kegiatan sertifikasi</p>
      </div>

      {/* Documents to Sign */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary" />
            Dokumen Perlu Tandatangan
            {isLoadingPending && <SimpleSpinner size="sm" className="ml-2 text-primary" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoading && pendingDocs.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Semua dokumen telah ditandatangani"
              description="Tidak ada dokumen yang menunggu tandatangan"
              iconClassName="text-emerald-500"
            />
          ) : (
            <div className="space-y-4">
              {pendingDocs.map((doc) => (
                <DocumentCard
                  key={doc.jadwal_id}
                  nomorKegiatan={doc.nama_kegiatan}
                  skemaSertifikasi={doc.skema.nama}
                  jenisAsesmen={doc.jenis_kelas === 'luring' ? 'Luring' : 'Daring'}
                  documentInfo={[
                    { icon: User, label: "Asesor", value: doc.asesor?.nama || "-" },
                    { icon: FileText, label: "TUK", value: doc.tuk?.nama || "-" },
                    { icon: Calendar, label: "Tanggal", value: formatDate(doc.tanggal_uji) },
                    { icon: Clock, label: "Waktu", value: formatTime(doc.tanggal_uji) }
                  ]}
                  badges={[<Badge key="status" className="bg-amber-100 text-amber-700">Menunggu</Badge>]}
                  cardClassName="cursor-pointer"
                  onClick={() => navigate(`/direktur/belum-ditandatangani/${doc.jadwal_id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
