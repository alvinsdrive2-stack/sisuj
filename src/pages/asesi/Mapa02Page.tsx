import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import { useDataDokumen } from "@/hooks/useDataDokumen"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"

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
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'

  const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin
  const { jabatanKerja, nomorSkema } = useDataDokumen(idIzin)
  const { showSuccess, showWarning } = useToast()
  const [mapaData, setMapaData] = useState<Mapa02Data | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [selectedPotensi, setSelectedPotensi] = useState<Record<number, number>>({})

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token")

        // Use idIzin from URL params
        let actualIdIzin = idIzin

        if (!actualIdIzin && !isAsesor && kegiatan?.jadwal_id) {
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
            // Initialize selected potensi with default values
            // isdefault indicates which column (1-5) is pre-selected for each reference
            const initialSelected: Record<number, number> = {}
            result.data.referensi_form.forEach(refForm => {
              if (refForm.kategori === "MAPA02_1") {
                refForm.referensis.forEach(ref => {
                  if (ref.isdefault === 1) {
                    initialSelected[ref.id] = 1 // Default to column 1
                  }
                })
              }
            })
            setSelectedPotensi(initialSelected)
          }
        } else {
          console.warn(`MAPA02 API returned ${mapa02Response.status}`)
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }

    if (isAsesor && idIzin) {
      fetchData()
    } else if (kegiatan) {
      fetchData()
    }
  }, [idIzin, kegiatan, isAsesor])

  const handleBack = () => {
    navigate(-1)
  }

  const handleCheckboxChange = (_kategori: string, refId: number, _kelompokIndex: number, potensi: number) => {
    setSelectedPotensi(prev => {
      // If clicking the same potensi that's already selected, uncheck it
      if (prev[refId] === potensi) {
        const { [refId]: _, ...rest } = prev
        return rest
      }
      // Otherwise, set the new potensi for this refId
      return { ...prev, [refId]: potensi }
    })
  }

  const isChecked = (_kategori: string, refId: number, _kelompokIndex: number, potensi: number) => {
    return selectedPotensi[refId] === potensi
  }

  const handleSave = async () => {
    if (!agreedChecklist) {
      showWarning("Silakan centang pernyataan bahwa Anda telah memahami dokumen ini.")
      return
    }

    setIsSaving(true)
    try {
      // TODO: POST data to backend

      // Get actual idIzin
      let actualIdIzin = idIzin
      if (!actualIdIzin && !isAsesor && kegiatan?.jadwal_id) {
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

      showSuccess('MAPA 02 berhasil disimpan!')
      setTimeout(() => {
        navigate(`/asesi/praasesmen/${actualIdIzin}/fr-ak-07`)
      }, 500)
    } catch (error) {
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <FullPageLoader text="Memuat data MAPA 02..." />
  }

  const referensiMAPA02 = mapaData?.referensi_form.find(r => r.kategori === "MAPA02_1")
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
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
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
                    (̶𝙺̶𝙺̶𝙽̶𝙸̶/Okupasi/̶𝙺̶𝚕̶𝚊̶𝚜̶𝚝̶𝚎̶𝚛̶)̶
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>Judul</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>{jabatanKerja.toUpperCase() || ''}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>Nomor</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>{nomorSkema.toUpperCase() || mapaData?.kelompok_kerja.kode || ''}</td>
                </tr>
              </tbody>
            </table>
          )}

          

          {/* Kelompok Pekerjaan Tables with Instrumen Asesmen */}
          {mapaData?.kelompok_kerja.kelompok_kerja.map((kelompok, kelompokIndex) => (
            <div key={kelompok.id}>
              {/* Kelompok Pekerjaan Table */}
              <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '0', fontSize: '13px', background: '#fff' }}>
                <tbody>
                  <tr>
                    <th rowSpan={kelompok.units.length + 1} style={{ border: '1px solid #000', padding: '6px 8px', width: '25%', verticalAlign: 'top', textAlign: 'left' }}>
                      {kelompok.nama}
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
              <br />

              {/* Instrumen Asesmen Table */}
              {referensiMAPA02 && (
                <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '16px', fontSize: '12px', background: '#fff' }}>
                  <tbody>
                    <tr>
                      <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px', width: '5%', background: '#c00000', color: '#fff' }}>No.</th>
                      <th rowSpan={2} style={{ border: '1px solid #000', padding: '6px 8px',background: '#c00000', color: '#fff' }}>Instrumen Asesmen</th>
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
                          <td
                            key={potensi}
                            onClick={() => handleCheckboxChange("MAPA02_1", ref.id, kelompokIndex, potensi)}
                            style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                          >
                            <CustomCheckbox
                              checked={isChecked("MAPA02_1", ref.id, kelompokIndex, potensi)}
                              onChange={() => {}}
                              style={{ pointerEvents: 'none' }}
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

          
          {/* Keterangan Table */}
          {keteranganReferensi && (
            <div style={{ background: '#ffffff', border: '1px solid #6f6f6f', marginBottom: '16px', padding: '12px', fontSize: '14px' }}>
              <div dangerouslySetInnerHTML={{ __html: keteranganReferensi.referensis[0]?.nama || '' }} />
            </div>
          )}
          {/* Agreement Checklist */}
          <div style={{ background: '#fff', border: '1px solid #000', borderRadius: '4px', marginBottom: '20px', padding: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <CustomCheckbox
                checked={agreedChecklist}
                onChange={() => setAgreedChecklist(!agreedChecklist)}
                style={{ marginTop: '2px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.5' }}>
                <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah memahami dan memahami dokumen MAPA 02 (Matriks Pengembangan dan Penilaian Asesmen) ini dengan sebenar-benarnya.
              </span>
            </label>
          </div>
          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <ActionButton variant="secondary" onClick={handleBack} disabled={isSaving}>
              Kembali
            </ActionButton>
            <ActionButton variant="primary" disabled={isSaving || !agreedChecklist} onClick={handleSave}>
              {isSaving ? "Menyimpan..." : "Simpan & Lanjut"}
            </ActionButton>
          </div>
        </div>
      </AsesiLayout>
    </div>
  )
}
