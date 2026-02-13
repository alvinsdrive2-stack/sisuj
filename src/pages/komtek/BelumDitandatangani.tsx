import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, FileText, Calendar, User, Clock, Eye, X, Users, MapPin, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocumentCard, EmptyState } from "@/components/direktur"
import { useKegiatanKomtek } from "@/hooks/useKegiatan"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import { KegiatanAsesor, AsesiItem } from "@/lib/kegiatan-service"
import { useEffect } from "react"

interface DokumenResponse {
  message: string
  list_asesi: AsesiItem[]
}

interface DokumenItem {
  key: string
  label: string
  url: string | null
  kompeten: string
  is_started: boolean
}

export default function BelumDitandatangani() {
  const { kegiatans, isLoading, error } = useKegiatanKomtek(false)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedKegiatan, setSelectedKegiatan] = useState<KegiatanAsesor | null>(null)
  const [selectedAsesi, setSelectedAsesi] = useState<AsesiItem | null>(null)
  const [asesiList, setAsesiList] = useState<AsesiItem[]>([])
  const [asesiLoading, setAsesiLoading] = useState(false)
  const [dokumenResponse, setDokumenResponse] = useState<DokumenResponse | null>(null)
  const [dokumenLoading, setDokumenLoading] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  // Fetch asesi list when modal opens
  useEffect(() => {
    const fetchAsesi = async () => {
      if (!modalOpen || !selectedKegiatan) return

      setAsesiLoading(true)
      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/kegiatan/${selectedKegiatan.jadwal_id}/list-asesi`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const result = await response.json()
          setAsesiList(result.list_asesi)
        }
      } catch (err) {
        console.error('Error fetching asesi:', err)
      } finally {
        setAsesiLoading(false)
      }
    }
    fetchAsesi()
  }, [modalOpen, selectedKegiatan])

  // Fetch dokumen when asesi is selected
  useEffect(() => {
    const fetchDokumen = async () => {
      if (!selectedAsesi) return

      setDokumenLoading(true)
      try {
        const token = localStorage.getItem("access_token")
        const response = await fetch(`https://backend.devgatensi.site/api/dokumen/asesi/${selectedAsesi.id_izin}`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const result: DokumenResponse = await response.json()
          setDokumenResponse(result)
        }
      } catch (err) {
        console.error('Error fetching dokumen:', err)
      } finally {
        setDokumenLoading(false)
      }
    }
    fetchDokumen()
  }, [selectedAsesi])

  // Build document list
  const documentList: DokumenItem[] = dokumenResponse?.list_asesi?.map(doc => ({
    key: `${doc.id_izin}-${doc.kompeten}`,
    label: doc.kompeten.toUpperCase(),
    url: null, // Will be populated from API
    kompeten: doc.kompeten,
    is_started: doc.is_started
  })) || []

  const openModal = (kegiatan: KegiatanAsesor) => {
    setSelectedKegiatan(kegiatan)
    setSelectedAsesi(null)
    setDokumenResponse(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedKegiatan(null)
    setSelectedAsesi(null)
    setDokumenResponse(null)
  }

  return (
    <>
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
                    <Button
                      key="detail"
                      variant="outline"
                      size="sm"
                      onClick={() => openModal(doc)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Lihat Detail
                    </Button>
                  ]}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: '#f5f5f5',
              borderRadius: '16px',
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              animation: 'modalSlideIn 0.3s ease-out',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`
              @keyframes modalSlideIn {
                from { opacity: 0; transform: translateY(-20px) scale(0.95); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
            `}</style>

            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {!selectedAsesi ? (
                  <>
                    <Users className="w-5 h-5 text-primary" />
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                      Daftar Asesi
                    </h3>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedAsesi(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#6b7280',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>Kembali ke Daftar</span>
                    </button>
                    <div style={{ width: '1px', height: '24px', background: '#e5e7eb' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                      {selectedAsesi.nama}
                    </h3>
                  </>
                )}
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '8px',
                  color: '#6b7280',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              padding: '24px',
              overflowY: 'auto',
              flex: 1,
            }}>
              {!selectedAsesi ? (
                // Asesi List View
                <>
                  {/* Kegiatan Info */}
                  {selectedKegiatan && (
                    <div style={{
                      marginBottom: '24px',
                      padding: '16px',
                      background: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
                          {selectedKegiatan.skema.nama}
                        </h4>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar className="w-4 h-4 text-primary" />
                          {formatDate(selectedKegiatan.tanggal_uji)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock className="w-4 h-4 text-primary" />
                          {formatTime(selectedKegiatan.tanggal_uji)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin className="w-4 h-4 text-primary" />
                          {selectedKegiatan.tuk.alamat}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Asesi Grid */}
                  {asesiLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                      <SimpleSpinner size="sm" />
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                      {asesiList.map((asesi, index) => (
                        <div
                          key={asesi.id_izin}
                          onClick={() => setSelectedAsesi(asesi)}
                          style={{
                            padding: '16px',
                            background: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#10b981'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: '#ecfdf5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                                {index + 1}
                              </span>
                            </div>
                            <div style={{ flex: 1 }}>
                              <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
                                {asesi.nama}
                              </h4>
                              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', margin: 0 }}>
                                {asesi.kompeten}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Dokumen Detail View
                <>
                  {dokumenLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                      <SimpleSpinner size="sm" />
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
                      {/* Dokumen List */}
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                          Daftar Dokumen
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {documentList.map((doc) => (
                            <div
                              key={doc.key}
                              style={{
                                padding: '12px',
                                background: '#fff',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                fontSize: '13px',
                                color: '#374151',
                              }}
                            >
                              <span style={{ fontWeight: '500' }}>{doc.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preview Area */}
                      <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        padding: '20px',
                        minHeight: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#9ca3af',
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: '#d1d5db' }} />
                          <p style={{ fontSize: '14px', fontWeight: '500' }}>
                            Preview dokumen akan ditampilkan di sini
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
