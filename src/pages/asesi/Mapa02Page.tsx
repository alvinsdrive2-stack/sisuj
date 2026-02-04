import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { SimpleSpinner } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"

interface Unit {
  id_unit: number
  nama_unit: string
  kode_unit: string
}

interface KelompokKerja {
  id: number
  nama: string
  urut: string
  units: Unit[]
}

interface Referensi {
  id: number
  nama: string
  isdefault: number | null
}

interface ReferensiForm {
  kategori: string
  referensis: Referensi[]
}

interface Mapa02Data {
  kelompok_kerja: {
    id: number
    kode: string
    nama_dokumen: string
    kelompok_kerja: KelompokKerja[]
  }
  referensi_form: ReferensiForm[]
}

interface ApiResponse {
  message: string
  data: Mapa02Data
}

export default function Mapa02Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan } = useKegiatanAsesi()
  const { idIzin } = useParams<{ idIzin: string }>()
  const [mapaData, setMapaData] = useState<Mapa02Data | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [selectedInstrument, setSelectedInstrument] = useState<Record<string, Set<number>>>({})

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

        // Fetch MAPA 02 data
        const mapa02Response = await fetch(`https://backend.devgatensi.site/api/praasesmen/${actualIdIzin}/mapa02`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        })

        if (mapa02Response.ok) {
          const result: ApiResponse = await mapa02Response.json()
          if (result.message === "Success") {
            setMapaData(result.data)
            // Initialize selected instrument with default values
            const initialSelected: Record<string, Set<number>> = {}
            result.data.referensi_form.forEach(refForm => {
              if (refForm.kategori === "MAPA02_1") {
                refForm.referensis.forEach(ref => {
                  if (ref.isdefault === 1) {
                    if (!initialSelected[refForm.kategori]) {
                      initialSelected[refForm.kategori] = new Set()
                    }
                    initialSelected[refForm.kategori].add(ref.id)
                  }
                })
              }
            })
            setSelectedInstrument(initialSelected)
          }
        } else {
          console.warn(`MAPA02 API returned ${mapa02Response.status}`)
        }
      } catch (error) {
        console.error("Error fetching MAPA 02:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [idIzin, kegiatan])

  const handleBack = () => {
    navigate(-1)
  }

  const handleCheckboxChange = (kategori: string, refId: number, kelompokIndex: number) => {
    setSelectedInstrument(prev => {
      const key = `${kategori}_${kelompokIndex + 1}`
      const newSet = new Set(prev[key] || prev[kategori] || new Set())

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

  const isChecked = (kategori: string, refId: number, kelompokIndex: number) => {
    const key = `${kategori}_${kelompokIndex + 1}`
    return selectedInstrument[key]?.has(refId) || selectedInstrument[kategori]?.has(refId) || false
  }

  const handleSave = async () => {
    if (!agreedChecklist) {
      alert("Silakan centang pernyataan bahwa Anda telah memahami dokumen ini.")
      return
    }

    setIsSaving(true)
    try {
      // TODO: POST data to backend
      console.log("Submitting MAPA02 data:", {
        selectedInstrument,
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

      navigate(`/asesi/praasesmen/${actualIdIzin}/fr-ak-07`)
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
            <p style={{ color: '#666' }}>Memuat data MAPA 02...</p>
          </div>
        </div>
      </div>
    )
  }

  const referensiMAPA02 = mapaData?.referensi_form.find(r => r.kategori === "MAPA02_1" || r.kategori === "MAPA02-1")
  const keteranganReferensi = mapaData?.referensi_form.find(r => r.kategori === "MAPA02-1")

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
            <span>FR MAPA 02</span>
          </div>
        </div>
      </div>

      <AsesiLayout currentStep={5}>
        <div style={{ padding: '20px' }}>
          {/* Title */}
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000', marginBottom: '4px', textTransform: 'uppercase' }}>
              {mapaData?.kelompok_kerja.nama_dokumen || 'FR. MAPA.02 - FORMULIR MAPA 02'}
            </h1>
          </div>

          {/* Header Table - Skema Sertifikasi */}
          {mapaData && (
            <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '16px', fontSize: '13px', background: '#fff' }}>
              <tbody>
                <tr>
                  <td rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '35%', fontWeight: 'bold' }}>
                    Skema Sertifikasi<br />
                    (KKNI/Okupasi/Klaster)
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>Judul</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>TEKNISI JEMBATAN RANGKA BAJA</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>Nomor</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>{mapaData.kelompok_kerja.kode || 'SKEMA-26/LSP-GKK/2022'}</td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Keterangan Table */}
          {keteranganReferensi && (
            <div style={{ background: '#fff9e6', border: '1px solid #e6b800', marginBottom: '16px', padding: '12px', fontSize: '11px' }}>
              <div dangerouslySetInnerHTML={{ __html: keteranganReferensi.referensis[0]?.nama || '' }} />
            </div>
          )}

          {/* Kelompok Pekerjaan Tables with Instrumen Asesmen */}
          {mapaData?.kelompok_kerja.kelompok_kerja.map((kelompok, kelompokIndex) => (
            <div key={kelompok.id}>
              {/* Kelompok Pekerjaan Table */}
              <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '0', fontSize: '13px', background: '#fff' }}>
                <tbody>
                  <tr>
                    <th rowSpan={kelompok.units.length + 1} style={{ border: '1px solid #000', padding: '6px 8px', width: '20%', verticalAlign: 'top', background: '#f0f0f0' }}>
                      Kelompok<br />Pekerjaan {kelompok.urut}
                    </th>
                    <th style={{ border: '1px solid #000', padding: '6px 8px', width: '5%' }}>No.</th>
                    <th style={{ border: '1px solid #000', padding: '6px 8px', width: '20%' }}>Kode Unit</th>
                    <th style={{ border: '1px solid #000', padding: '6px 8px' }}>Judul Unit</th>
                  </tr>
                  {kelompok.units.map((unit, unitIndex) => (
                    <tr key={unit.id_unit}>
                      <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                        {unitIndex + 1}.
                      </td>
                      <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                        {unit.kode_unit}
                      </td>
                      <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                        {unit.nama_unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Instrumen Asesmen Table */}
              {referensiMAPA02 && (
                <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '16px', fontSize: '12px', background: '#fff' }}>
                  <tbody>
                    <tr>
                      <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '5%' }}>No.</th>
                      <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>Instrumen Asesmen</th>
                      <th colSpan={5} style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                        Potensi Asesi **
                      </th>
                    </tr>
                    <tr>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff', fontWeight: 'bold', textAlign: 'center', width: '8%' }}>1</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff', fontWeight: 'bold', textAlign: 'center', width: '8%' }}>2</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff', fontWeight: 'bold', textAlign: 'center', width: '8%' }}>3</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff', fontWeight: 'bold', textAlign: 'center', width: '8%' }}>4</th>
                      <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff', fontWeight: 'bold', textAlign: 'center', width: '8%' }}>5</th>
                    </tr>
                    {referensiMAPA02.referensis.map((ref, refIndex) => (
                      <tr key={ref.id}>
                        <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                          {refIndex + 1}.
                        </td>
                        <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                          {ref.nama}
                        </td>
                        {[1, 2, 3, 4, 5].map((potensi) => (
                          <td key={potensi} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isChecked("MAPA02_1", ref.id, kelompokIndex)}
                              onChange={() => handleCheckboxChange("MAPA02_1", ref.id, kelompokIndex)}
                              style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}

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
                <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah memahami dan memahami dokumen MAPA 02 (Matriks Pengembangan dan Penilaian Asesmen) ini dengan sebenar-benarnya.
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
