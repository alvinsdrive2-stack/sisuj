import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FullPageLoader } from "@/components/ui/loading-spinner"
import DashboardNavbar from "@/components/DashboardNavbar"
import AsesiLayout from "@/components/AsesiLayout"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/contexts/ToastContext"
import { useKegiatanAsesi } from "@/hooks/useKegiatan"
import { useDataDokumenPraAsesmen } from "@/hooks/useDataDokumenPraAsesmen"
import { useAsesorRole } from "@/hooks/useAsesorRole"
import { CustomCheckbox } from "@/components/ui/Checkbox"
import { ActionButton } from "@/components/ui/ActionButton"

interface Referensi {
  id: number
  nama: string | null
  jawaban?: boolean | string | null
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

type SelectedReferences = Record<string, Set<number> | null>

export default function FrAk07Page() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { kegiatan } = useKegiatanAsesi()
  const { idIzin: idIzinFromUrl } = useParams<{ idIzin: string }>()
  const isAsesor = user?.role?.name?.toLowerCase() === 'asesor'
  const { isAsesor1 } = useAsesorRole(idIzinFromUrl)

  const idIzin = isAsesor ? idIzinFromUrl : user?.id_izin
  const { jabatanKerja, nomorSkema, tuk, namaAsesor, asesorList, namaAsesi } = useDataDokumenPraAsesmen(idIzin)
  const { showSuccess, showError, showWarning } = useToast()

  // Other sections: asesi and asesor_1 can edit, asesor_2 cannot
  const isFormDisabled = isAsesor && !isAsesor1
  const [ak07Data, setAk07Data] = useState<Ak07DataItem[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [agreedChecklist, setAgreedChecklist] = useState(false)
  const [selectedReferences, setSelectedReferences] = useState<SelectedReferences>({})
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({})

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

            // Debug: log data to see jawaban values
            console.log('[AK07] Loaded data:', result.data)

            // Set textAnswers from API (for string jawaban)
            const newTextAnswers: Record<number, string> = {}
            result.data.forEach(item => {
              item.kelompok.kategoris.forEach(kategori => {
                kategori.referensis.forEach(ref => {
                  console.log('[AK07] Ref:', ref.id, 'jawaban:', ref.jawaban)
                  if (typeof ref.jawaban === 'string' && ref.jawaban) {
                    newTextAnswers[ref.id] = ref.jawaban
                  }
                })
              })
            })
            setTextAnswers(newTextAnswers)

            // Set selectedReferences from API (for boolean jawaban: true)
            const newSelectedReferences: SelectedReferences = {}
            result.data.forEach(item => {
              item.kelompok.kategoris.forEach(kategori => {
                if (kategori.id) {
                  const key = `${kategori.id}_${item.kelompok.id}`
                  const refIds = kategori.referensis
                    .filter(ref => ref.jawaban === true)
                    .map(ref => ref.id)
                  if (refIds.length > 0) {
                    newSelectedReferences[key] = new Set(refIds)
                  }
                }
              })
            })
            setSelectedReferences(newSelectedReferences)
            console.log('[AK07] Initialized selectedReferences:', newSelectedReferences)
          }
        } else {
          console.warn(`AK07 API returned ${ak07Response.status}`)
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

  const handleReferenceChange = (kategoriId: number | null, kelompokId: number, refId: number) => {
    const key = `${kategoriId}_${kelompokId}`
    setSelectedReferences(prev => {
      const currentSet = prev[key] || new Set()
      const newSet = new Set(currentSet)

      if (newSet.has(refId)) {
        newSet.delete(refId)
      } else {
        newSet.add(refId)
      }

      // Simpan null jika set kosong (user sudah interact tapi tidak ada yang dipilih)
      return { ...prev, [key]: newSet.size === 0 ? null : newSet }
    })
  }

  const isReferenceChecked = (kategoriId: number | null, kelompokId: number, refId: number) => {
    // Cek dari selectedReferences dulu (user input)
    const key = `${kategoriId}_${kelompokId}`
    // Jika key ada di selectedReferences (user sudah interact), pakai nilai itu
    if (key in selectedReferences) {
      return selectedReferences[key]?.has(refId) || false
    }

    // Kalau nggak ada di user selection, cek dari API data
    const ref = ak07Data
      ?.find(d => d.kelompok.id === kelompokId)
      ?.kelompok.kategoris
      .find(k => k.id === kategoriId)
      ?.referensis.find(r => r.id === refId)

    // Return true/false based on API data
    return ref?.jawaban === true
  }

  const handleSave = async () => {
    if (!agreedChecklist) {
      showWarning("Silakan centang pernyataan bahwa Anda telah memahami dokumen ini.")
      return
    }

    // Jika form disabled (asesor_2), langsung navigate tanpa save
    if (isFormDisabled) {
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
      return
    }

    // Asesi dan asesor_1 - save data dulu
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

    if (!actualIdIzin) {
      showWarning("ID Izin tidak ditemukan")
      return
    }

    setIsSaving(true)
    try {
      // Build answers array
      const answers: Array<{ referensi_id: number; kelompok_id: number; value: boolean | string }> = []

      if (!ak07Data) {
        throw new Error("Data AK07 tidak tersedia")
      }

      // Kelompok 4 (Potensi Asesi) - boolean per item
      const potensiAsesiData = ak07Data.find(d => d.kelompok.urut === 1)
      if (potensiAsesiData) {
        potensiAsesiData.kelompok.kategoris.forEach(kategori => {
          kategori.referensis.forEach(ref => {
            const isChecked = isReferenceChecked(kategori.id, potensiAsesiData.kelompok.id, ref.id)
            answers.push({
              referensi_id: ref.id,
              kelompok_id: potensiAsesiData.kelompok.id,
              value: isChecked
            })
          })
        })
      }

      // Kelompok 5 (Modifikasi) - boolean per item
      const modifikasiData = ak07Data.find(d => d.kelompok.urut === 2)
      if (modifikasiData) {
        modifikasiData.kelompok.kategoris.forEach(kategori => {
          kategori.referensis.forEach(ref => {
            const isChecked = isReferenceChecked(kategori.id, modifikasiData.kelompok.id, ref.id)
            answers.push({
              referensi_id: ref.id,
              kelompok_id: modifikasiData.kelompok.id,
              value: isChecked
            })
          })
        })
      }

      // Kelompok 6 (Rekaman Rencana Asesmen) - string/text
      const rencanaAsesmenData = ak07Data.find(d => d.kelompok.urut === 3)
      if (rencanaAsesmenData) {
        rencanaAsesmenData.kelompok.kategoris[0]?.referensis.forEach(ref => {
          const textValue = textAnswers[ref.id] || (typeof ref.jawaban === 'string' ? ref.jawaban : '')
          answers.push({
            referensi_id: ref.id,
            kelompok_id: rencanaAsesmenData.kelompok.id,
            value: textValue
          })
        })
      }

      // Kelompok 7 (Hasil Penyesuaian) - string/text
      const hasilPenyesuaianData = ak07Data.find(d => d.kelompok.urut === 4)
      if (hasilPenyesuaianData) {
        hasilPenyesuaianData.kelompok.kategoris[0]?.referensis.forEach(ref => {
          if (!ref.nama) return // Skip null nama
          const textValue = textAnswers[ref.id] || (typeof ref.jawaban === 'string' ? ref.jawaban : '')
          answers.push({
            referensi_id: ref.id,
            kelompok_id: hasilPenyesuaianData.kelompok.id,
            value: textValue
          })
        })
      }

      // POST to backend
      const token = localStorage.getItem("access_token")
      const response = await fetch(`https://backend.devgatensi.site/api/praasesmen/${actualIdIzin}/ak07`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Gagal menyimpan data AK07" }))
        throw new Error(error.message || "Gagal menyimpan data AK07")
      }

      showSuccess('FR AK 07 berhasil disimpan!')
      setTimeout(() => {
        navigate(`/asesi/praasesmen/${actualIdIzin}/fr-ak-04`)
      }, 500)
    } catch (error) {
      showError(error instanceof Error ? error.message : "Gagal menyimpan data AK07")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <FullPageLoader text="Memuat data AK 07..." />
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
          <div style={{ marginBottom: '16px', textAlign: 'left' }}>
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
                  <span style={{ fontSize: '11px', fontWeight: 'normal' }}>(̶𝙺̶𝙺̶𝙽̶𝙸̶/Okupasi/̶𝙺̶𝚕̶𝚊̶𝚜̶𝚝̶𝚎̶𝚛̶)̶</span>
                </td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '15%', fontWeight: 'bold' }}>Judul</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', width: '5%', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{jabatanKerja?.toUpperCase() || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nomor</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px' }}>{nomorSkema?.toUpperCase() || ''}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>TUK</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{tuk?.toUpperCase() || 'Sewaktu/Tempat Kerja/Mandiri*'}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nama Asesor</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>
                  {asesorList.map((asesor, idx) => (
                    <span key={asesor.id}>
                      {idx > 0 && ', '}
                      {asesor.nama?.toUpperCase() || ''}{asesor.noreg && ` (${asesor.noreg})`}
                    </span>
                  ))}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '6px 8px', fontWeight: 'bold' }}>Nama Asesi</td>
                <td style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', fontWeight: 'bold' }}>:</td>
                <td colSpan={2} style={{ border: '1px solid #000', padding: '6px 8px' }}>{namaAsesi || user?.name || ''}</td>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '14px', background: '#fff' }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px', width: '20%', fontWeight: 'bold', verticalAlign: 'top' }}>
                    Potensi Asesi
                  </td>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                    {potensiAsesiData.kelompok.kategoris[0]?.referensis.map((ref) => {
                      const isChecked = isReferenceChecked(potensiAsesiData.kelompok.kategoris[0]?.id || null, potensiAsesiData.kelompok.id, ref.id)

                      return (
                        <div key={ref.id} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div style={{ marginRight: '10px' }}>
                            <CustomCheckbox
                              checked={isChecked}
                              disabled={true}
                              onChange={() => {}}
                            />
                          </div>
                          <span style={{ flex: 1, fontSize: '14px' }}>{ref.nama}</span>
                        </div>
                      )
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Bagian A - Mengidentifikasi Persyaratan Modifikasi */}
          {modifikasiData && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '14px', background: '#fff' }}>
              <tbody>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '5%', background: '#c00000', color: '#fff', fontSize: '14px' }}>No</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '35%', background: '#c00000', color: '#fff', fontSize: '14px' }}>Mengidentifikasi Persyaratan Modifikasi dan Kontekstualisasi</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '60px', background: '#c00000', color: '#fff', textAlign: 'center', fontSize: '14px' }}>Ya</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', width: '60px', background: '#c00000', color: '#fff', textAlign: 'center', fontSize: '14px' }}>Tidak</th>
                  <th style={{ border: '1px solid #000', padding: '6px 8px', background: '#c00000', color: '#fff', fontSize: '14px' }}>Keterangan</th>
                </tr>

                {modifikasiData.kelompok.kategoris.map((kategori, kategoriIndex) => {
                  if (!kategori.nama) return null

                  const filteredReferensis = kategori.referensis.filter(r => r.nama)

                  return filteredReferensis.map((ref, refIdx) => {
                    const isChecked = isReferenceChecked(kategori.id, modifikasiData.kelompok.id, ref.id)
                    const isFirstRow = refIdx === 0

                    return (
                      <tr key={`${kategori.id || kategoriIndex}-${ref.id}`}>
                        {isFirstRow && (
                          <>
                            <td rowSpan={filteredReferensis.length} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: 'center', verticalAlign: 'top' }}>
                              {kategori.urut || kategoriIndex + 1}
                            </td>
                            <td rowSpan={filteredReferensis.length} style={{ border: '1px solid #000', padding: '6px 8px', verticalAlign: 'top' }}>
                              {kategori.nama}
                            </td>
                          </>
                        )}
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', borderBottom: refIdx < filteredReferensis.length - 1 ? '1px solid #ccc' : 'none' }}>
                          <CustomCheckbox
                            checked={isChecked}
                            onChange={() => !isFormDisabled && !isSaving && handleReferenceChange(kategori.id, modifikasiData.kelompok.id, ref.id)}
                            disabled={isFormDisabled || isSaving}
                          />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', borderBottom: refIdx < filteredReferensis.length - 1 ? '1px solid #ccc' : 'none' }}>
                          <CustomCheckbox
                            checked={!isReferenceChecked(kategori.id, modifikasiData.kelompok.id, ref.id)}
                            onChange={() => !isFormDisabled && !isSaving && handleReferenceChange(kategori.id, modifikasiData.kelompok.id, ref.id)}
                            disabled={isFormDisabled || isSaving}
                          />
                        </td>
                        <td style={{ border: '1px solid #000', padding: '8px', borderBottom: refIdx < filteredReferensis.length - 1 ? '1px solid #ccc' : 'none', fontSize: '14px' }}>
                          {ref.nama}
                        </td>
                      </tr>
                    )
                  })
                })}
              </tbody>
            </table>
          )}

          {/* Rekaman Rencana Asesmen */}
          {rencanaAsesmenData && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '14px', background: '#fff' }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '6px 8px' }}>
                    <div style={{ marginBottom: '8px', fontSize: '14px' }}>Rekaman Rencana Asesmen:</div>
                    {rencanaAsesmenData.kelompok.kategoris[0]?.referensis.map((ref) => (
                      <div key={ref.id} style={{ marginBottom: '8px', marginLeft: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                          {ref.nama}
                        </label>
                        <textarea
                          value={textAnswers[ref.id] || (typeof ref.jawaban === 'string' ? ref.jawaban : '')}
                          onChange={(e) => setTextAnswers(prev => ({ ...prev, [ref.id]: e.target.value }))}
                          disabled={isFormDisabled || isSaving}
                          rows={2}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #000', fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif', resize: 'vertical', cursor: (isFormDisabled || isSaving) ? 'not-allowed' : 'text', background: (isFormDisabled || isSaving) ? '#f5f5f5' : '#fff' }}
                          placeholder="Isi jawaban di sini..."
                        />
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Hasil Penyesuaian */}
          {hasilPenyesuaianData && (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '14px', background: '#fff' }}>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>
                    <div style={{ marginBottom: '12px', fontSize: '14px' }}>A. Hasil Penyesuaian yang wajar dan beralasan disepakati menggunakan:</div>
                    {hasilPenyesuaianData.kelompok.kategoris[0]?.referensis.filter(r => r.nama).map((ref) => (
                      <div key={ref.id} style={{ marginBottom: '12px', marginLeft: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '14px' }}>
                          {ref.nama}
                        </label>
                        <textarea
                          value={textAnswers[ref.id] || (typeof ref.jawaban === 'string' ? ref.jawaban : '')}
                          onChange={(e) => setTextAnswers(prev => ({ ...prev, [ref.id]: e.target.value }))}
                          disabled={isFormDisabled || isSaving}
                          rows={2}
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #000', fontSize: '14px', fontFamily: 'Arial, Helvetica, sans-serif', resize: 'vertical', cursor: (isFormDisabled || isSaving) ? 'not-allowed' : 'text', background: (isFormDisabled || isSaving) ? '#f5f5f5' : '#fff' }}
                          placeholder="Isi jawaban di sini..."
                        />
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
              {asesorList.length > 0 ? (
                asesorList.map((asesor) => (
                  <tr key={asesor.id}>
                    <td style={{ border: '1px solid #000', padding: '8px', width: '50%', height: '80px' }}>
                      <div>Nama Asesor : {asesor.nama?.toUpperCase() || ''}</div>
                      {asesor.noreg && <div>No. Reg : {asesor.noreg}</div>}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '8px', width: '50%' }}>
                      <div>Tanggal dan Tanda Tangan Asesor :</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={{ border: '1px solid #000', padding: '8px', width: '50%', height: '80px' }}>
                    <div>Nama Asesor : {namaAsesor?.toUpperCase() || ''}</div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '8px', width: '50%' }}>
                    <div>Tanggal dan Tanda Tangan Asesor :</div>
                  </td>
                </tr>
              )}
              <tr>
                <td style={{ border: '1px solid #000', padding: '8px', height: '80px' }}>
                  <div>Nama Asesi :</div>
                  <div>{namaAsesi?.toUpperCase() || user?.name?.toUpperCase() || ''}</div>
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
              <CustomCheckbox
                checked={agreedChecklist}
                onChange={() => setAgreedChecklist(!agreedChecklist)}
                style={{ marginTop: '2px', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#000', lineHeight: '1.5' }}>
                <strong style={{ textTransform: 'uppercase' }}>Pernyataan:</strong> Saya menyatakan bahwa saya telah memahami dan memahami dokumen AK 07 (Penyesuaian Asesmen) ini dengan sebenar-benarnya.
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
