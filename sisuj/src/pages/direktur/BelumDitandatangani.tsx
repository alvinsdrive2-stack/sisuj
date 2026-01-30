import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, FileText, Calendar, User, Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocumentCard, EmptyState } from "@/components/direktur"
import { useKegiatanDirektur } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"

export default function BelumDitandatangani() {
  const { kegiatans, isLoading, error } = useKegiatanDirektur(false) // false = belum ditandatangani

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
                skemaSertifikasi={doc.skema.nama}
                jenisAsesmen={doc.jenis_kelas === 'luring' ? 'Luring' : 'Daring'}
                documentInfo={[
                  { icon: User, label: "Asesor", value: doc.asesor.nama },
                  { icon: FileText, label: "TUK", value: doc.tuk.nama },
                  { icon: Calendar, label: "Tanggal", value: formatDate(doc.tanggal_uji) },
                  { icon: Clock, label: "Waktu", value: formatTime(doc.tanggal_uji) }
                ]}
                badges={[
                  <Badge key="status" variant="outline" className="border-amber-200 text-amber-700">Menunggu</Badge>
                ]}
                cardClassName="border-l-4 border-l-amber-400"
                actions={[
                  <Button key="detail" variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Lihat Detail
                  </Button>,
                  <Button key="sign" size="sm" className="bg-primary hover:bg-primary/90">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Tandatangani Sekarang
                  </Button>
                ]}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
