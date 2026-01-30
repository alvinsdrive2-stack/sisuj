import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calendar, User, CheckCircle2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocumentCard, EmptyState } from "@/components/direktur"
import { useKegiatanKomtek } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"

export default function SudahDitandatangani() {
  const { kegiatans, isLoading, error } = useKegiatanKomtek(true) // true = sudah ditandatangani

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
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
          {error && (
            <div className="text-center py-8 text-red-500">
              Gagal memuat data: {error}
            </div>
          )}
          {!isLoading && !error && kegiatans.length === 0 && (
            <EmptyState
              icon={FileText}
              title="Belum ada dokumen ditandatangani"
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
                  { icon: Calendar, label: "Tanggal Uji", value: formatDate(doc.tanggal_uji) }
                ]}
                badges={[<Badge key="status" className="bg-emerald-100 text-emerald-700">Ditandatangani</Badge>]}
                cardClassName="bg-gradient-to-r from-emerald-50/50 to-transparent"
                actions={[
                  <Button key="detail" variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Lihat Detail
                  </Button>,
                  <Button key="download" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Download className="w-4 h-4 mr-2" />
                    Unduh
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
