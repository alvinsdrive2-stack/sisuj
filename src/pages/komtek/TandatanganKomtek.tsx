import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PenTool, FileText, Calendar, User, Clock, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { StatCard, DocumentCard, EmptyState } from "@/components/direktur"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { useKegiatanKomtek } from "@/hooks/useKegiatan"

export default function TandatanganKomtek() {
  const { kegiatans: pendingDocs, isLoading: isLoadingPending } = useKegiatanKomtek(false) // belum ditandatangani
  const { kegiatans: signedDocs, isLoading: isLoadingSigned } = useKegiatanKomtek(true) // sudah ditandatangani
  const [signingId, setSigningId] = useState<string | null>(null)

  const handleSign = async (jadwalId: string) => {
    setSigningId(jadwalId)
    // TODO: Implement actual API call for signing
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSigningId(null)
    // Refresh data after signing
    window.location.reload()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const isLoading = isLoadingPending || isLoadingSigned
  const totalDocs = pendingDocs.length + signedDocs.length

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Tandatangan Dokumen</h2>
        <p className="text-slate-600">Tandatangani dokumen kegiatan sertifikasi</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          value={isLoading ? "..." : pendingDocs.length}
          label="Menunggu Tandatangan"
          icon={Clock}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          value={isLoading ? "..." : signedDocs.length}
          label="Sudah Ditandatangani"
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <StatCard
          value={isLoading ? "..." : totalDocs}
          label="Total Dokumen"
          icon={FileText}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
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
                    { icon: User, label: "Asesor", value: doc.asesor.nama },
                    { icon: FileText, label: "TUK", value: doc.tuk.nama },
                    { icon: Calendar, label: "Tanggal", value: formatDate(doc.tanggal_uji) },
                    { icon: Clock, label: "Waktu", value: formatTime(doc.tanggal_uji) }
                  ]}
                  badges={[<Badge key="status" className="bg-amber-100 text-amber-700">Menunggu</Badge>]}
                  actions={[
                    <Button key="detail" variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </Button>,
                    <Button
                      key="sign"
                      size="sm"
                      onClick={() => handleSign(doc.jadwal_id)}
                      disabled={signingId === doc.jadwal_id}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {signingId === doc.jadwal_id ? (
                        <div className="flex items-center gap-2">
                          <SimpleSpinner size="sm" className="text-white" />
                          <span>Memproses...</span>
                        </div>
                      ) : (
                        <>
                          <PenTool className="w-4 h-4 mr-2" />
                          Tandatangani
                        </>
                      )}
                    </Button>
                  ]}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
