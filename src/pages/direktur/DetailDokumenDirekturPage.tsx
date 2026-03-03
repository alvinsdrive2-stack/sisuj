import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilePdf, faFileImage, faFile, faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons"
import DashboardNavbar from "@/components/DashboardNavbar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"

interface Asesor {
  jadwal_id: string
  id_izin: string
  nama: string
  is_started: string
  started_at: string | null
  kompeten: string
}

interface DokumenResponse {
  message: string
  list_asesi: Asesor[]
}

interface DokumenDirekturResponse {
  message: string
  data: {
    sk_pelaksanaan_uji: string | null
    spt_asesor: string | null
    spt_komtek: string | null
    sk_komtek: string | null
    ba_komtek: string | null
  }
}

interface DokumenItem {
  key: string
  label: string
  url: string | null
}

interface AsesiWithKey extends Asesor {
  key: string
}

const getFileIcon = (url: string) => {
  if (!url) return faFile
  const extension = url.split('.').pop()?.toLowerCase() || ''
  switch (extension) {
    case 'pdf':
      return faFilePdf
    case 'jpg':
    case 'jpeg':
    case 'png':
      return faFileImage
    default:
      return faFile
  }
}

const DOKUMEN_DIREKTUR_CONFIG: Array<{ key: keyof DokumenDirekturResponse['data']; label: string }> = [
  { key: 'sk_pelaksanaan_uji', label: 'SK Pelaksanaan Uji' },
  { key: 'spt_asesor', label: 'SPT Asesor' },
  { key: 'spt_komtek', label: 'SPT Komtek' },
  { key: 'sk_komtek', label: 'SK Komtek' },
  { key: 'ba_komtek', label: 'BA Komtek' },
]

export default function DetailDokumenDirekturPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showError } = useToast()

  const [dokumenResponse, setDokumenResponse] = useState<DokumenResponse | null>(null)
  const [dokumenDirektur, setDokumenDirektur] = useState<DokumenDirekturResponse['data'] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAsesi, setSelectedAsesi] = useState<Asesor | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        const token = localStorage.getItem("access_token")

        const [asesiResponse, direkturResponse] = await Promise.all([
          fetch(`https://backend.devgatensi.site/api/dokumen/asesi/${id}`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }),
          fetch(`https://backend.devgatensi.site/api/direktur/files/${id}`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          }),
        ])

        if (asesiResponse.ok) {
          const asesiResult: DokumenResponse = await asesiResponse.json()
          setDokumenResponse(asesiResult)
        } else {
          showError('Gagal memuat data asesi')
        }

        if (direkturResponse.ok) {
          const direkturResult: DokumenDirekturResponse = await direkturResponse.json()
          setDokumenDirektur(direkturResult.data)
        } else {
          showError('Gagal memuat dokumen direktur')
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        showError('Terjadi kesalahan saat memuat data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const documentList: AsesiWithKey[] = (dokumenResponse?.list_asesi || []).map(asesi => ({
    ...asesi,
    key: asesi.id_izin
  }))

  const direkturDocuments: DokumenItem[] = DOKUMEN_DIREKTUR_CONFIG.map(config => ({
    key: config.key,
    label: config.label,
    url: dokumenDirektur?.[config.key] || null
  }))

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <DashboardNavbar userName={user?.name} />

      <div style={{ borderBottom: '1px solid #999', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666', alignItems: 'center' }}>
            <span
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => navigate("/direktur/tandatangan")}
            >
              Dokumen
            </span>
            <span>/</span>
            <span>Detail Dokumen Direktur</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate("/direktur/tandatangan")}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
          >
            <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: '14px' }} />
            Kembali
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <FontAwesomeIcon icon={faSpinner} style={{ fontSize: '32px', color: '#10b981', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
            <div>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                  Daftar Asesi
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {documentList.map((asesi) => (
                    <button
                      key={asesi.key}
                      onClick={() => setSelectedAsesi(asesi)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: '12px',
                        background: selectedAsesi?.key === asesi.key ? '#ecfdf5' : '#fff',
                        border: selectedAsesi?.key === asesi.key ? '2px solid #10b981' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '14px',
                        color: '#374151'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedAsesi?.key !== asesi.key) {
                          e.currentTarget.style.background = '#f9fafb'
                          e.currentTarget.style.borderColor = '#d1d5db'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedAsesi?.key !== asesi.key) {
                          e.currentTarget.style.background = '#fff'
                          e.currentTarget.style.borderColor = '#e5e7eb'
                        }
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '2px solid #fff',
                        boxShadow: '0 0 2px #10b981',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: '#fff'
                        }} />
                      </div>

                      <FontAwesomeIcon
                        icon={faFile}
                        style={{
                          fontSize: '18px',
                          color: '#10b981',
                          flexShrink: 0
                        }}
                      />

                      <span style={{ flex: 1, textAlign: 'left', fontWeight: '500' }}>
                        {asesi.nama}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', height: '100%' }}>
                {selectedAsesi ? (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
                      Dokumen Direktur - {selectedAsesi.nama}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                      {direkturDocuments.map((doc) => {
                        const hasDocument = !!doc.url
                        return (
                          <div
                            key={doc.key}
                            style={{
                              background: hasDocument ? '#fff' : '#f9fafb',
                              border: hasDocument ? '1px solid #e5e7eb' : '1px dashed #d1d5db',
                              borderRadius: '8px',
                              padding: '16px',
                              cursor: hasDocument ? 'pointer' : 'default',
                              transition: 'all 0.2s',
                              opacity: hasDocument ? 1 : 0.6
                            }}
                            onMouseEnter={(e) => {
                              if (hasDocument) {
                                e.currentTarget.style.background = '#f9fafb'
                                e.currentTarget.style.borderColor = '#10b981'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (hasDocument) {
                                e.currentTarget.style.background = '#fff'
                                e.currentTarget.style.borderColor = '#e5e7eb'
                              }
                            }}
                            onClick={() => {
                              if (hasDocument && doc.url) {
                                window.open(doc.url, '_blank')
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <FontAwesomeIcon
                                icon={getFileIcon(doc.url || '')}
                                style={{
                                  fontSize: '24px',
                                  color: hasDocument ? '#10b981' : '#9ca3af'
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                                  {doc.label}
                                </div>
                                {!hasDocument && (
                                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                    Belum ada
                                  </div>
                                )}
                              </div>
                            </div>
                            {hasDocument && (
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                Klik untuk membuka
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    minHeight: '75vh'
                  }}>
                    <FontAwesomeIcon icon={faFile} style={{ fontSize: '64px', marginBottom: '16px' }} />
                    <p style={{ fontSize: '16px', fontWeight: '500' }}>
                      Pilih asesi untuk melihat dokumen direktur
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
