import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, FileText, Calendar, User, Clock } from "lucide-react"
import { DocumentCard, EmptyState } from "@/components/direktur"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { useKegiatanKomtek } from "@/hooks/useKegiatan"

export default function SudahDitandatangani() {
  const navigate = useNavigate()
  const { kegiatans: signedDocs, isLoading } = useKegiatanKomtek(true) // true = sudah ditandatangani

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
        <h2 className="text-2xl font-bold text-slate-800">Sudah Ditandatangani</h2>
        <p className="text-slate-600">Daftar dokumen yang telah ditandatangani</p>
      </div>

      {/* Signed Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Dokumen Sudah Ditandatangani
            {isLoading && <SimpleSpinner size="sm" className="ml-2 text-emerald-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoading && signedDocs.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Belum ada dokumen ditandatangani"
              description="Dokumen yang sudah ditandatangani akan muncul di sini"
              iconClassName="text-slate-400"
            />
          ) : (
            <div className="space-y-4">
              {signedDocs.map((doc) => (
                <DocumentCard
                  key={doc.jadwal_id}
                  nomorKegiatan={doc.nama_kegiatan}
                  skemaSertifikasi={doc.skema.nama}
                  jenisAsesmen={doc.jenis_kelas === 'luring' ? 'Luring' : 'Daring'}
                  documentInfo={[
                    { icon: User, label: "Asesor", value: `${doc.asesor?.nama?.toUpperCase() || ''}${doc.asesor2 ? ` & ${doc.asesor2.nama?.toUpperCase() || ''}` : ''}` || '-' },
                    { icon: FileText, label: "TUK", value: doc.tuk?.nama?.toUpperCase() || '' },
                    { icon: Calendar, label: "Tanggal", value: formatDate(doc.tanggal_uji) },
                    { icon: Clock, label: "Waktu", value: formatTime(doc.tanggal_uji) }
                  ]}
                  badges={[<Badge key="status" className="bg-emerald-100 text-emerald-700">Ditandatangani</Badge>]}
                  onClick={() => navigate(`/komtek/sudah-ditandatangani/${doc.jadwal_id}`)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
