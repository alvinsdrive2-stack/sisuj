import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"

interface Referensi {
  id: number
  nama: string | null
}

interface Kategori {
  id: number | null
  kategori: string | null
  nama: string | null
  urut: number | null
  id_kelompok: number | null
  referensis: Referensi[]
}

interface Kelompok {
  id: number
  nama: string
  urut: number
  kategoris: Kategori[]
}

interface Ak07DataItem {
  kelompok: Kelompok
}

interface ApiResponse {
  message: string
  data: Ak07DataItem[]
}

type AdjustmentType = 'ya' | 'tidak' | null
type SelectedReferences = Record<string, Set<number>>

export default function FrAk07Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan } = useKegiatanAsesi()
  const { idIzin } = useParams<{ idIzin: string }>()
  const [ak07Data, setAk07Data] = useState<Ak07DataItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [adjustmentSelection, setAdjustmentSelection] = useState<Record<string, AdjustmentType>>({})
  const [selectedReferences, setSelectedReferences] = useState<SelectedReferences>({})

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")

        // Use idIzin from URL params
        let actualIdIzin = idIzin

        if (!actualIdIzin && kegiatan?.jadwal_id) {
          // Fetch id_izin from list-asesi endpoint if not in URL
          const listAsesiResponse = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          })

          if (listAsesiResponse.ok) {
            const listResult = await listAsesiResponse.json()
            if (listResult.message === "Success" && listResult.list_asesi && listResult.list_asesi.length > 0) {
              actualIdIzin = listResult.list_asesi[0].id_izin
            }
          }
        }

        if (!actualIdIzin) {
          console.error("No id_izin found")
          setIsLoading(false)
          return
        }

        // Fetch AK 07 data
        const ak07Response = await fetch(`https://backend.devgatensi.site/api/praasesmen/${actualIdIzin}/ak07`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (ak07Response.ok) {
          const result: ApiResponse = await ak07Response.json()
          if (result.message === "Success") {
            setAk07Data(result.data)
          }
        } else {
          console.warn(`AK07 API returned ${ak07Response.status}`)
        }
      } catch (error) {
        console.error("Error fetching AK 07:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [idIzin, kegiatan])

  const handleBack = () => {
    navigate(-1)
  }

  const handleAdjustmentChange = (kategoriId: number | null, kelompokId: number, value: AdjustmentType) => {
    const key = `${kategoriId}_${kelompokId}`
    setAdjustmentSelection(prev => {
      const current = prev[key]
      if (current === value) {
        // Uncheck if clicking the same value
        const { [key]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: value }
    })
  }

  const handleReferenceChange = (kategoriId: number | null, kelompokId: number, refId: number) => {
    const key = `${kategoriId}_${kelompokId}`
    setSelectedReferences(prev => {
      const newSet = new Set(prev[key] || new Set())

      if (newSet.has(refId)) {
        newSet.delete(refId)
      } else {
        newSet.add(refId)
      }

      if (newSet.size === 0) {
        const { [key]: _, ...rest } = prev
        return rest
      }

      return { ...prev, [key]: newSet }
    })
  }

  const isReferenceChecked = (kategoriId: number | null, kelompokId: number, refId: number) => {
    const key = `${kategoriId}_${kelompokId}`
    return selectedReferences[key]?.has(refId) || false
  }

  const handleSave = async () => {
    if (!agreedChecklist) {
      alert("Silakan centang pernyataan bahwa Anda telah memahami dokumen ini.")
      return
    }

    setIsSaving(true)
    try {
      // TODO: POST data to backend
      console.log("Submitting AK07 data:", {
        adjustmentSelection,
        selectedReferences,
      })

      // Get actual idIzin
      let actualIdIzin = idIzin
      if (!actualIdIzin && kegiatan?.jadwal_id) {
        const token = localStorage.getItem("access_token")
        const listAsesiResponse = await fetch(`https://backend.devgatensi.site/api/kegiatan/${kegiatan.jadwal_id}/list-asesi`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })
        if (listAsesiResponse.ok) {
          const listResult = await listAsesiResponse.json()
          if (listResult.message === "Success" && listResult.list_asesi && listResult.list_asesi.length > 0) {
            actualIdIzin = listResult.list_asesi[0].id_izin
          }
        }
      }

      navigate(`/asesi/praasesmen/${actualIdIzin}/fr-ak-04`)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <DashboardNavbar userName={user?.name} />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <div style={{ color: '#666' }}>
              <SimpleSpinner size="lg" className="mx-auto mb-4" />
            </div>
            <p style={{ color: '#666' }}>Memuat data AK 07...</p>
          </div>
        </div>
      </div>
    )
  }

  // Group data by kelompok
  const potensiAsesiData = ak07Data?.find(d => d.kelompok.urut === 1)
  const modifikasiData = ak07Data?.find(d => d.kelompok.urut === 2)
  const rencanaAsesmenData = ak07Data?.find(d => d.kelompok.urut === 3)
  const hasilPenyesuaianData = ak07Data?.find(d => d.kelompok.urut === 4)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Header */}
      <DashboardNavbar userName={user?.name} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #000', background: '#fff' }}>
        <div style={{ padding: '12px 16px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#666' }}>
            <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate("/asesi/dashboard")}>Dashboard</span>
            <span>/</span>
            <span>Pra-Asesmen</span>
            <span>/</span>
            <span>FR.AK.07</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={6}>
        <div style={{ padding: '20px' }}>
          {/* Title */}
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px', textTransform: 'uppercase' }}>
              FR.AK.07 - FORMULIR PENYESUAIAN ASESMEN
            </h1>
            <p style={{ fontSize: '12px', color: '#666' }}>Isi atau lengkapi data formulir AK 07 di bawah ini</p>
          </div>

          {/* Identitas Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '13px', background: '#fff' }}>
            <tbody>
              <tr>
                <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '35%', fontWeight: 'bold', verticalAlign: 'top' }}>
                  Skema Sertifikasi<br />
                  <span style={{ fontSize: '11px', fontWeight: 'normal' }}>(KKNI/Okupasi/Klaster)</span>
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '15%', fontWeight: 'bold' }}>Judul</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '5%', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>Teknisi Jembatan Rangka Baja</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nomor</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>SKEMA-26/LSP-GKK/2022</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>TUK</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>Sewaktu/Tempat Kerja/Mandiri*</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nama Asesor</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nama Asesi</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{user?.name || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Tanggal</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{new Date().toLocaleDateString('id-ID')}</td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: '11px', marginBottom: '12px', color: '#666' }}>*Coret yang tidak perlu</p>

          {/* Panduan */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '12px', background: '#fff' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold', background: '#f0f0f0' }}>PANDUAN BAGI ASESOR</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', lineHeight: '1.6' }}>
                  • Formulir ini digunakan pada saat pelaksanaan pra asesmen<br />
                  • Formulir ini terdiri dari dua bagian yaitu A dan B<br />
                  • Coretlah pada tanda * yang tidak sesuai<br />
                  • Berilah tanda √ Ya atau Tidak pada tanda ** sesuai pilihan<br />
                  • Berilah tanda √ pada kotak ☐ pada kolom potensi asesi<br />
                  • Formulir ini juga digunakan untuk bagian B<br />
                  • Berilah tanda √ Ya atau Tidak pada tanda *** sesuai pilihan
                </td>
              </tr>
            </tbody>
          </table>

          {/* Potensi Asesi */}
          {potensiAsesiData && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '12px', background: '#fff' }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', width: '20%', fontWeight: 'bold', verticalAlign: 'top' }}>
                    Potensi Asesi
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                    {potensiAsesiData.kelompok.kategoris[0]?.referensis.map((ref) => (
                      <label key={ref.id} style={{ display: 'block', marginBottom: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isReferenceChecked(potensiAsesiData.kelompok.kategoris[0]?.id || null, potensiAsesiData.kelompok.id, ref.id)}
                          onChange={() => handleReferenceChange(potensiAsesiData.kelompok.kategoris[0]?.id || null, potensiAsesiData.kelompok.id, ref.id)}
                          style={{ marginRight: '8px', cursor: 'pointer' }}
                        />
                        {ref.nama}
                      </label>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Bagian A - Mengidentifikasi Persyaratan Modifikasi */}
          {modifikasiData && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '12px', background: '#fff' }}>
              <tbody>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '5%', background: '#c00000', color: '#fff' }}>No</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '35%', background: '#c00000', color: '#fff' }}>Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi</th>
                  <th colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff', textAlign: 'center' }}>Diperlukan penyesuaian**</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff' }}>Keterangan</th>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#f0f0f0' }}></th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#f0f0f0' }}></th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#f0f0f0', textAlign: 'center' }}>Ya</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#f0f0f0', textAlign: 'center' }}>Tidak</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#f0f0f0' }}></th>
                </tr>

                {modifikasiData.kelompok.kategoris.map((kategori, kategoriIndex) => {
                  if (!kategori.nama) return null
                  const key = `${kategori.id}_${modifikasiData.kelompok.id}`
                  const selectedAdjustment = adjustmentSelection[key]

                  return (
                    <tr key={kategori.id || kategoriIndex}>
                      <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>{kategori.urut || kategoriIndex + 1}</td>
                      <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{kategori.nama}</td>
                      <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedAdjustment === 'ya'}
                          onChange={() => handleAdjustmentChange(kategori.id, modifikasiData.kelompok.id, 'ya')}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedAdjustment === 'tidak'}
                          onChange={() => handleAdjustmentChange(kategori.id, modifikasiData.kelompok.id, 'tidak')}
                          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                        {kategori.referensis.filter(r => r.nama).map((ref) => (
                          <label key={ref.id} style={{ display: 'block', marginBottom: '4px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isReferenceChecked(kategori.id, modifikasiData.kelompok.id, ref.id)}
                              onChange={() => handleReferenceChange(kategori.id, modifikasiData.kelompok.id, ref.id)}
                              style={{ marginRight: '8px', cursor: 'pointer' }}
                            />
                            {ref.nama}
                          </label>
                        ))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {/* Rekaman Rencana Asesmen */}
          {rencanaAsesmenData && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '12px', background: '#fff' }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>
                    <div style={{ marginBottom: '8px' }}>Rekaman Rencana Asesmen:</div>
                    {rencanaAsesmenData.kelompok.kategoris[0]?.referensis.map((ref) => (
                      <label key={ref.id} style={{ display: 'block', marginBottom: '8px', cursor: 'pointer', marginLeft: '20px' }}>
                        <input
                          type="checkbox"
                          checked={isReferenceChecked(rencanaAsesmenData.kelompok.kategoris[0]?.id || null, rencanaAsesmenData.kelompok.id, ref.id)}
                          onChange={() => handleReferenceChange(rencanaAsesmenData.kelompok.kategoris[0]?.id || null, rencanaAsesmenData.kelompok.id, ref.id)}
                          style={{ marginRight: '8px', cursor: 'pointer' }}
                        />
                        {ref.nama}
                      </label>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Hasil Penyesuaian */}
          {hasilPenyesuaianData && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '12px', background: '#fff' }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>
                    <div style={{ marginBottom: '12px' }}>A. Hasil Penyesuaian yang wajar dan beralasan disepakati menggunakan:</div>
                    {hasilPenyesuaianData.kelompok.kategoris[0]?.referensis.filter(r => r.nama).map((ref) => (
                      <div key={ref.id} style={{ marginBottom: '12px', marginLeft: '20px' }}>
                        <label style={{ cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isReferenceChecked(hasilPenyesuaianData.kelompok.kategoris[0]?.id || null, hasilPenyesuaianData.kelompok.id, ref.id)}
                            onChange={() => handleReferenceChange(hasilPenyesuaianData.kelompok.kategoris[0]?.id || null, hasilPenyesuaianData.kelompok.id, ref.id)}
                            style={{ marginRight: '8px', cursor: 'pointer' }}
                          />
                          {ref.nama}
                        </label>
                        <div style={{ marginLeft: '28px', marginTop: '4px', minHeight: '40px', border: '1px solid #ccc', padding: '4px' }}></div>
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Tanda Tangan */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '12px', background: '#fff' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', width: '50%', height: '80px' }}>
                  <div>Nama Asesor :</div>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px', width: '50%' }}>
                  <div>Tanggal dan Tanda Tangan Asesor :</div>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', height: '80px' }}>
                  <div>Nama Asesi :</div>
                  <div>{user?.name || ''}</div>
                </td>
                <td style={{ border: '1px solid #000', padding: '8px' }}>
                  <div>Tanggal dan Tanda Tangan Asesi :</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Agreement Checklist */}
          <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '4px', marginBottom: '20px', padding: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreedChecklist}
                onChange={(e) => setAgreedChecklist(e.target.checked)}
                style={{ marginTop: '2px', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.5' }}>
                <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah memahami dan memahami dokumen AK 07 (Penyesuaian Asesmen) ini dengan sebenar-benarnya.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleBack}
              disabled={isSaving}
              style={{ padding: '8px 16px', border: '1px solid #000', background: '#fff', color: '#000', fontSize: '13px', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.5 : 1 }}
            >
              Kembali
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !agreedChecklist}
              style={{ padding: '8px 16px', background: agreedChecklist ? '#0066cc' : '#999', color: '#fff', fontSize: '13px', cursor: isSaving || !agreedChecklist ? 'not-allowed' : 'pointer', border: 'none', opacity: isSaving || !agreedChecklist ? 0.5 : 1 }}
            >
              {isSaving ? "Menyimpan..." : "Simpan & Lanjut"}
            </button>
          </div>
        </div>
      </AsesiLayout>
    </div>
  )
}
